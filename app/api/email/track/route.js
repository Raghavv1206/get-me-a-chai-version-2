// app/api/email/track/route.js
/**
 * Production-Ready Email Tracking API Route
 * 
 * Features:
 * - Email open tracking via invisible pixel
 * - Input validation
 * - Error handling
 * - Structured logging
 * - Analytics integration
 * - Rate limiting
 * 
 * @module app/api/email/track
 */

import { NextResponse } from 'next/server';
import connectDb from '@/db/connectDb';
import Analytics from '@/models/Analytics';

// ============================================================================
// LOGGING
// ============================================================================

const logger = {
    info: (message, meta = {}) => {
        console.log(JSON.stringify({
            level: 'info',
            timestamp: new Date().toISOString(),
            message,
            ...meta,
            service: 'email-tracking'
        }));
    },

    warn: (message, meta = {}) => {
        console.warn(JSON.stringify({
            level: 'warn',
            timestamp: new Date().toISOString(),
            message,
            ...meta,
            service: 'email-tracking'
        }));
    },

    error: (message, error, meta = {}) => {
        console.error(JSON.stringify({
            level: 'error',
            timestamp: new Date().toISOString(),
            message,
            error: {
                message: error?.message,
                stack: error?.stack,
            },
            ...meta,
            service: 'email-tracking'
        }));
    },
};

// ============================================================================
// RATE LIMITING
// ============================================================================

class TrackingRateLimiter {
    constructor(maxRequests = 100, windowMs = 60000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.requests = new Map();
    }

    check(identifier) {
        const now = Date.now();
        const requests = this.requests.get(identifier) || [];

        const validRequests = requests.filter(
            timestamp => now - timestamp < this.windowMs
        );

        if (validRequests.length >= this.maxRequests) {
            return { allowed: false };
        }

        validRequests.push(now);
        this.requests.set(identifier, validRequests);

        // Cleanup periodically
        if (Math.random() < 0.01) {
            this.cleanup();
        }

        return { allowed: true };
    }

    cleanup() {
        const now = Date.now();
        for (const [key, timestamps] of this.requests.entries()) {
            const valid = timestamps.filter(t => now - t < this.windowMs);
            if (valid.length === 0) {
                this.requests.delete(key);
            } else {
                this.requests.set(key, valid);
            }
        }
    }
}

// Rate limiter: 100 tracking requests per minute per email ID
const rateLimiter = new TrackingRateLimiter(100, 60000);

// ============================================================================
// TRACKING PIXEL
// ============================================================================

/**
 * 1x1 transparent GIF pixel (base64 encoded)
 * This is the smallest possible GIF image
 */
const TRACKING_PIXEL = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
);

/**
 * Get tracking pixel response with proper headers
 */
function getPixelResponse() {
    return new NextResponse(TRACKING_PIXEL, {
        status: 200,
        headers: {
            'Content-Type': 'image/gif',
            'Content-Length': TRACKING_PIXEL.length.toString(),
            'Cache-Control': 'no-cache, no-store, must-revalidate, private',
            'Pragma': 'no-cache',
            'Expires': '0',
            'X-Robots-Tag': 'noindex, nofollow',
        },
    });
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate email ID format
 */
function isValidEmailId(emailId) {
    if (!emailId || typeof emailId !== 'string') {
        return false;
    }

    // Basic validation: alphanumeric, hyphens, underscores
    // Length between 1 and 100 characters
    return /^[a-zA-Z0-9_-]{1,100}$/.test(emailId);
}

/**
 * Sanitize email ID
 */
function sanitizeEmailId(emailId) {
    if (!emailId || typeof emailId !== 'string') {
        return null;
    }

    // Remove any potentially dangerous characters
    return emailId.trim().substring(0, 100);
}

// ============================================================================
// REQUEST HANDLER
// ============================================================================

export async function GET(request) {
    const startTime = Date.now();
    const requestId = `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
        // ========================================================================
        // EXTRACT EMAIL ID
        // ========================================================================

        const { searchParams } = new URL(request.url);
        const emailId = searchParams.get('id');

        // Always return pixel, even if tracking fails
        // This prevents email clients from detecting tracking

        if (!emailId) {
            logger.warn('Tracking pixel requested without email ID', { requestId });
            return getPixelResponse();
        }

        // ========================================================================
        // VALIDATION
        // ========================================================================

        const sanitizedEmailId = sanitizeEmailId(emailId);

        if (!sanitizedEmailId || !isValidEmailId(sanitizedEmailId)) {
            logger.warn('Invalid email ID format', {
                requestId,
                emailId: emailId.substring(0, 50), // Log truncated version
            });
            return getPixelResponse();
        }

        // ========================================================================
        // RATE LIMITING
        // ========================================================================

        const rateLimit = rateLimiter.check(sanitizedEmailId);

        if (!rateLimit.allowed) {
            logger.warn('Tracking rate limit exceeded', {
                requestId,
                emailId: sanitizedEmailId,
            });
            // Still return pixel to avoid detection
            return getPixelResponse();
        }

        // ========================================================================
        // EXTRACT METADATA
        // ========================================================================

        const headers = request.headers;
        const metadata = {
            emailId: sanitizedEmailId,
            userAgent: headers.get('user-agent')?.substring(0, 500) || 'unknown',
            referer: headers.get('referer')?.substring(0, 500) || null,
            ip: headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                headers.get('x-real-ip') ||
                'unknown',
            timestamp: new Date(),
        };

        logger.info('Email open tracked', {
            requestId,
            emailId: sanitizedEmailId,
            userAgent: metadata.userAgent.substring(0, 100),
        });

        // ========================================================================
        // SAVE TO DATABASE (ASYNC, NON-BLOCKING)
        // ========================================================================

        // Don't await - fire and forget to keep response fast
        saveTracking(metadata, requestId).catch(error => {
            logger.error('Failed to save email tracking', error, {
                requestId,
                emailId: sanitizedEmailId,
            });
        });

        // ========================================================================
        // RETURN PIXEL
        // ========================================================================

        const duration = Date.now() - startTime;

        logger.info('Tracking pixel served', {
            requestId,
            emailId: sanitizedEmailId,
            duration: `${duration}ms`,
        });

        return getPixelResponse();

    } catch (error) {
        const duration = Date.now() - startTime;

        logger.error('Email tracking unexpected error', error, {
            requestId,
            duration: `${duration}ms`,
        });

        // Always return pixel, even on error
        return getPixelResponse();
    }
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

/**
 * Save tracking data to database
 * This runs asynchronously and doesn't block the response
 */
async function saveTracking(metadata, requestId) {
    try {
        await connectDb();

        // Create analytics record
        await Analytics.create({
            eventType: 'email_open',
            metadata: {
                emailId: metadata.emailId,
                userAgent: metadata.userAgent,
                referer: metadata.referer,
                ip: metadata.ip,
            },
            timestamp: metadata.timestamp,
        });

        logger.info('Email tracking saved to database', {
            requestId,
            emailId: metadata.emailId,
        });

    } catch (dbError) {
        logger.error('Database save failed for email tracking', dbError, {
            requestId,
            emailId: metadata.emailId,
        });

        // Don't throw - this is fire-and-forget
    }
}

// ============================================================================
// METHOD NOT ALLOWED
// ============================================================================

export async function POST() {
    return getPixelResponse();
}

export async function PUT() {
    return getPixelResponse();
}

export async function DELETE() {
    return getPixelResponse();
}
