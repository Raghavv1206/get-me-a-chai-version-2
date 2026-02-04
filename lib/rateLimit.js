// lib/rateLimit.js - Rate Limiting Middleware

/**
 * Rate limiting implementation using in-memory store.
 * For production, consider using Redis for distributed rate limiting.
 * 
 * Features:
 * - Sliding window rate limiting
 * - Configurable limits per endpoint
 * - IP-based and user-based limiting
 * - Automatic cleanup of old entries
 * - Rate limit headers in response
 */

import { createLogger } from './logger';

const logger = createLogger('RateLimit');

// In-memory store for rate limiting
// Format: Map<key, Array<timestamp>>
const rateLimitStore = new Map();

// Cleanup interval (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;

/**
 * Cleanup old entries from rate limit store
 */
function cleanupOldEntries() {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, timestamps] of rateLimitStore.entries()) {
        // Remove timestamps older than 1 hour
        const filtered = timestamps.filter(ts => now - ts < 60 * 60 * 1000);

        if (filtered.length === 0) {
            rateLimitStore.delete(key);
            cleanedCount++;
        } else if (filtered.length !== timestamps.length) {
            rateLimitStore.set(key, filtered);
        }
    }

    if (cleanedCount > 0) {
        logger.debug('Cleaned up rate limit store', { cleanedCount });
    }
}

// Start cleanup interval
if (typeof window === 'undefined') {
    setInterval(cleanupOldEntries, CLEANUP_INTERVAL);
}

/**
 * Get client identifier from request
 * @param {Request} req - Next.js request object
 * @returns {string} Client identifier
 */
function getClientIdentifier(req) {
    // Try to get user ID from session/auth
    // This is a placeholder - adjust based on your auth implementation
    const userId = req.headers.get('x-user-id');
    if (userId) {
        return `user:${userId}`;
    }

    // Fallback to IP address
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() :
        req.headers.get('x-real-ip') ||
        'unknown';

    return `ip:${ip}`;
}

/**
 * Rate limit options
 * @typedef {Object} RateLimitOptions
 * @property {number} maxRequests - Maximum requests allowed
 * @property {number} windowMs - Time window in milliseconds
 * @property {string} message - Error message when rate limit exceeded
 * @property {boolean} skipSuccessfulRequests - Don't count successful requests
 * @property {boolean} skipFailedRequests - Don't count failed requests
 */

/**
 * Create rate limiter middleware
 * @param {RateLimitOptions} options - Rate limit configuration
 * @returns {Function} Middleware function
 */
export function createRateLimiter(options = {}) {
    const {
        maxRequests = 100,
        windowMs = 15 * 60 * 1000, // 15 minutes default
        message = 'Too many requests, please try again later',
        skipSuccessfulRequests = false,
        skipFailedRequests = false,
    } = options;

    // Validate options
    if (!Number.isInteger(maxRequests) || maxRequests <= 0) {
        throw new Error('maxRequests must be a positive integer');
    }

    if (!Number.isInteger(windowMs) || windowMs <= 0) {
        throw new Error('windowMs must be a positive integer');
    }

    logger.info('Rate limiter created', { maxRequests, windowMs });

    /**
     * Rate limiter middleware
     * @param {Request} req - Request object
     * @param {Function} handler - Next handler function
     * @returns {Promise<Response>} Response
     */
    return async function rateLimitMiddleware(req, handler) {
        const clientId = getClientIdentifier(req);
        const now = Date.now();
        const key = `${clientId}:${req.url}`;

        // Get or create request timestamps for this client
        let timestamps = rateLimitStore.get(key) || [];

        // Remove timestamps outside the current window
        timestamps = timestamps.filter(ts => now - ts < windowMs);

        // Check if limit exceeded
        if (timestamps.length >= maxRequests) {
            const oldestTimestamp = timestamps[0];
            const resetTime = new Date(oldestTimestamp + windowMs);
            const retryAfter = Math.ceil((oldestTimestamp + windowMs - now) / 1000);

            logger.warn('Rate limit exceeded', {
                clientId,
                url: req.url,
                requests: timestamps.length,
                maxRequests,
                retryAfter,
            });

            return new Response(
                JSON.stringify({
                    error: message,
                    retryAfter,
                    limit: maxRequests,
                    windowMs,
                }),
                {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-RateLimit-Limit': maxRequests.toString(),
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': resetTime.toISOString(),
                        'Retry-After': retryAfter.toString(),
                    },
                }
            );
        }

        // Add current timestamp
        timestamps.push(now);
        rateLimitStore.set(key, timestamps);

        // Execute the handler
        const response = await handler(req);

        // Add rate limit headers to response
        const remaining = Math.max(0, maxRequests - timestamps.length);
        const resetTime = new Date(now + windowMs);

        // Clone response to add headers
        const newResponse = new Response(response.body, response);
        newResponse.headers.set('X-RateLimit-Limit', maxRequests.toString());
        newResponse.headers.set('X-RateLimit-Remaining', remaining.toString());
        newResponse.headers.set('X-RateLimit-Reset', resetTime.toISOString());

        logger.debug('Request processed', {
            clientId,
            url: req.url,
            remaining,
            status: response.status,
        });

        return newResponse;
    };
}

/**
 * Predefined rate limiters for common use cases
 */
export const rateLimiters = {
    // Strict rate limit for authentication endpoints
    auth: createRateLimiter({
        maxRequests: 5,
        windowMs: 15 * 60 * 1000, // 15 minutes
        message: 'Too many authentication attempts, please try again later',
    }),

    // Moderate rate limit for API endpoints
    api: createRateLimiter({
        maxRequests: 100,
        windowMs: 15 * 60 * 1000, // 15 minutes
        message: 'Too many API requests, please try again later',
    }),

    // Lenient rate limit for general requests
    general: createRateLimiter({
        maxRequests: 1000,
        windowMs: 15 * 60 * 1000, // 15 minutes
        message: 'Too many requests, please try again later',
    }),

    // Very strict for sensitive operations
    sensitive: createRateLimiter({
        maxRequests: 3,
        windowMs: 60 * 60 * 1000, // 1 hour
        message: 'Too many attempts, please try again in an hour',
    }),

    // For AI/expensive operations
    ai: createRateLimiter({
        maxRequests: 20,
        windowMs: 60 * 60 * 1000, // 1 hour
        message: 'AI request limit reached, please try again later',
    }),
};

/**
 * Helper to apply rate limiter to Next.js API route
 * @param {Function} rateLimiter - Rate limiter middleware
 * @param {Function} handler - API route handler
 * @returns {Function} Wrapped handler
 */
export function withRateLimit(rateLimiter, handler) {
    return async function (req, context) {
        return rateLimiter(req, async () => handler(req, context));
    };
}

export default createRateLimiter;
