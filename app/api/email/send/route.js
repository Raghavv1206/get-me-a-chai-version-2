// app/api/email/send/route.js
/**
 * Production-Ready Email Sending API Route
 * 
 * Features:
 * - Authentication & authorization
 * - Input validation
 * - Rate limiting
 * - Structured logging
 * - Error boundaries
 * - Request tracking
 * 
 * @module app/api/email/send
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import {
    sendWelcomeEmail,
    sendPaymentConfirmation,
    sendCreatorNotification,
    sendMilestoneEmail,
    sendUpdateNotifications,
    sendWeeklySummary
} from '@/actions/emailActions';

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
            service: 'email-api'
        }));
    },

    warn: (message, meta = {}) => {
        console.warn(JSON.stringify({
            level: 'warn',
            timestamp: new Date().toISOString(),
            message,
            ...meta,
            service: 'email-api'
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
            service: 'email-api'
        }));
    },
};

// ============================================================================
// RATE LIMITING
// ============================================================================

class APIRateLimiter {
    constructor(maxRequests = 30, windowMs = 60000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.requests = new Map();
    }

    check(identifier) {
        const now = Date.now();
        const userRequests = this.requests.get(identifier) || [];

        const validRequests = userRequests.filter(
            timestamp => now - timestamp < this.windowMs
        );

        if (validRequests.length >= this.maxRequests) {
            const oldestRequest = Math.min(...validRequests);
            const resetAt = new Date(oldestRequest + this.windowMs);

            return {
                allowed: false,
                remaining: 0,
                resetAt,
                retryAfter: Math.ceil((resetAt - now) / 1000),
            };
        }

        validRequests.push(now);
        this.requests.set(identifier, validRequests);

        // Cleanup periodically
        if (Math.random() < 0.01) {
            this.cleanup();
        }

        return {
            allowed: true,
            remaining: this.maxRequests - validRequests.length,
            resetAt: new Date(now + this.windowMs),
        };
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

// Rate limiter: 30 requests per minute per user
const rateLimiter = new APIRateLimiter(30, 60000);

// ============================================================================
// VALIDATION
// ============================================================================

const VALID_EMAIL_TYPES = [
    'welcome',
    'payment_confirmation',
    'creator_notification',
    'milestone',
    'update_notification',
    'weekly_summary',
];

/**
 * Validate request body
 */
function validateRequest(body) {
    const errors = [];

    if (!body) {
        errors.push('Request body is required');
        return { valid: false, errors };
    }

    if (!body.type || typeof body.type !== 'string') {
        errors.push('Email type is required and must be a string');
    } else if (!VALID_EMAIL_TYPES.includes(body.type)) {
        errors.push(`Invalid email type. Must be one of: ${VALID_EMAIL_TYPES.join(', ')}`);
    }

    if (!body.data || typeof body.data !== 'object') {
        errors.push('Email data is required and must be an object');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

// ============================================================================
// REQUEST HANDLER
// ============================================================================

export async function POST(request) {
    const startTime = Date.now();
    const requestId = `email-api-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
        logger.info('Email API request received', { requestId });

        // ========================================================================
        // AUTHENTICATION
        // ========================================================================

        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            logger.warn('Unauthorized email API request', { requestId });

            return NextResponse.json(
                {
                    success: false,
                    error: 'Unauthorized. Please log in to send emails.',
                },
                { status: 401 }
            );
        }

        const userEmail = session.user.email;
        logger.info('User authenticated', { requestId, userEmail });

        // ========================================================================
        // RATE LIMITING
        // ========================================================================

        const rateLimit = rateLimiter.check(userEmail);

        if (!rateLimit.allowed) {
            logger.warn('Rate limit exceeded', {
                requestId,
                userEmail,
                retryAfter: rateLimit.retryAfter,
            });

            return NextResponse.json(
                {
                    success: false,
                    error: 'Rate limit exceeded. Please try again later.',
                    retryAfter: rateLimit.retryAfter,
                    resetAt: rateLimit.resetAt,
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': rateLimit.retryAfter.toString(),
                        'X-RateLimit-Limit': rateLimiter.maxRequests.toString(),
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': rateLimit.resetAt.toISOString(),
                    },
                }
            );
        }

        // ========================================================================
        // REQUEST PARSING & VALIDATION
        // ========================================================================

        let body;
        try {
            body = await request.json();
        } catch (parseError) {
            logger.error('Failed to parse request body', parseError, { requestId });

            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid JSON in request body',
                },
                { status: 400 }
            );
        }

        const validation = validateRequest(body);

        if (!validation.valid) {
            logger.warn('Request validation failed', {
                requestId,
                errors: validation.errors,
            });

            return NextResponse.json(
                {
                    success: false,
                    error: 'Validation failed',
                    validationErrors: validation.errors,
                },
                { status: 400 }
            );
        }

        const { type, data } = body;

        logger.info('Processing email request', {
            requestId,
            type,
            userEmail,
        });

        // ========================================================================
        // EMAIL SENDING
        // ========================================================================

        let result;

        try {
            switch (type) {
                case 'welcome':
                    result = await sendWelcomeEmail(data);
                    break;

                case 'payment_confirmation':
                    result = await sendPaymentConfirmation(data);
                    break;

                case 'creator_notification':
                    result = await sendCreatorNotification(data);
                    break;

                case 'milestone':
                    result = await sendMilestoneEmail(data);
                    break;

                case 'update_notification':
                    if (!data.supporters || !data.updateData) {
                        return NextResponse.json(
                            {
                                success: false,
                                error: 'Update notification requires supporters and updateData',
                            },
                            { status: 400 }
                        );
                    }
                    result = await sendUpdateNotifications(data.supporters, data.updateData);
                    break;

                case 'weekly_summary':
                    result = await sendWeeklySummary(data);
                    break;

                default:
                    // This should never happen due to validation
                    return NextResponse.json(
                        {
                            success: false,
                            error: `Unknown email type: ${type}`,
                        },
                        { status: 400 }
                    );
            }
        } catch (sendError) {
            logger.error('Email sending failed', sendError, {
                requestId,
                type,
                userEmail,
            });

            return NextResponse.json(
                {
                    success: false,
                    error: 'Failed to send email. Please try again later.',
                    _debug: process.env.NODE_ENV === 'development' ? sendError.message : undefined,
                },
                { status: 500 }
            );
        }

        // ========================================================================
        // RESPONSE
        // ========================================================================

        const duration = Date.now() - startTime;

        if (result.success) {
            logger.info('Email sent successfully', {
                requestId,
                type,
                userEmail,
                duration: `${duration}ms`,
            });

            return NextResponse.json(
                {
                    success: true,
                    message: 'Email sent successfully',
                    ...result,
                },
                {
                    headers: {
                        'X-Request-ID': requestId,
                        'X-RateLimit-Limit': rateLimiter.maxRequests.toString(),
                        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
                        'X-RateLimit-Reset': rateLimit.resetAt.toISOString(),
                    },
                }
            );
        } else {
            logger.warn('Email sending completed with errors', {
                requestId,
                type,
                userEmail,
                error: result.error,
                duration: `${duration}ms`,
            });

            return NextResponse.json(
                {
                    success: false,
                    error: result.error || 'Failed to send email',
                    ...result,
                },
                {
                    status: result.retryAfter ? 429 : 500,
                    headers: {
                        'X-Request-ID': requestId,
                        ...(result.retryAfter && {
                            'Retry-After': result.retryAfter.toString(),
                        }),
                    },
                }
            );
        }

    } catch (error) {
        const duration = Date.now() - startTime;

        logger.error('Email API unexpected error', error, {
            requestId,
            duration: `${duration}ms`,
        });

        return NextResponse.json(
            {
                success: false,
                error: 'An unexpected error occurred. Please try again later.',
                _debug: process.env.NODE_ENV === 'development' ? error.message : undefined,
            },
            {
                status: 500,
                headers: {
                    'X-Request-ID': requestId,
                },
            }
        );
    }
}

// ============================================================================
// METHOD NOT ALLOWED
// ============================================================================

export async function GET() {
    return NextResponse.json(
        {
            success: false,
            error: 'Method not allowed. Use POST to send emails.',
        },
        { status: 405 }
    );
}

export async function PUT() {
    return NextResponse.json(
        {
            success: false,
            error: 'Method not allowed. Use POST to send emails.',
        },
        { status: 405 }
    );
}

export async function DELETE() {
    return NextResponse.json(
        {
            success: false,
            error: 'Method not allowed. Use POST to send emails.',
        },
        { status: 405 }
    );
}
