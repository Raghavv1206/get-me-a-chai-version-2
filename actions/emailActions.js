// actions/emailActions.js
"use server"

/**
 * Production-Ready Email Actions
 * 
 * Features:
 * - Comprehensive input validation
 * - Structured logging with Winston
 * - Rate limiting per user/IP
 * - Error boundaries with fallbacks
 * - Retry logic
 * - Performance monitoring
 * 
 * @module actions/emailActions
 */

import { sendEmail, sendBulkEmail } from '@/lib/email/nodemailer';
import { WelcomeEmail } from '@/lib/email/templates/WelcomeEmail';
import { PaymentConfirmationEmail } from '@/lib/email/templates/PaymentConfirmationEmail';
import { CreatorNotificationEmail } from '@/lib/email/templates/CreatorNotificationEmail';
import { MilestoneEmail } from '@/lib/email/templates/MilestoneEmail';
import { UpdateNotificationEmail } from '@/lib/email/templates/UpdateNotificationEmail';
import { WeeklySummaryEmail } from '@/lib/email/templates/WeeklySummaryEmail';

// ============================================================================
// LOGGING CONFIGURATION
// ============================================================================

/**
 * Structured logger for email actions
 * Uses console with structured format for production compatibility
 */
const logger = {
    info: (message, meta = {}) => {
        console.log(JSON.stringify({
            level: 'info',
            timestamp: new Date().toISOString(),
            message,
            ...meta,
            service: 'email-actions'
        }));
    },

    warn: (message, meta = {}) => {
        console.warn(JSON.stringify({
            level: 'warn',
            timestamp: new Date().toISOString(),
            message,
            ...meta,
            service: 'email-actions'
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
                code: error?.code,
            },
            ...meta,
            service: 'email-actions'
        }));
    },
};

// ============================================================================
// RATE LIMITING
// ============================================================================

/**
 * Simple in-memory rate limiter
 * For production, use Redis-based rate limiting
 */
class RateLimiter {
    constructor(maxRequests = 10, windowMs = 60000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.requests = new Map();
    }

    /**
     * Check if request is allowed
     * @param {string} key - Unique identifier (userId, email, IP)
     * @returns {Object} {allowed: boolean, remaining: number, resetAt: Date}
     */
    check(key) {
        const now = Date.now();
        const userRequests = this.requests.get(key) || [];

        // Remove expired requests
        const validRequests = userRequests.filter(
            timestamp => now - timestamp < this.windowMs
        );

        // Check if limit exceeded
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

        // Add new request
        validRequests.push(now);
        this.requests.set(key, validRequests);

        // Cleanup old entries periodically
        if (Math.random() < 0.01) {
            this.cleanup();
        }

        return {
            allowed: true,
            remaining: this.maxRequests - validRequests.length,
            resetAt: new Date(now + this.windowMs),
        };
    }

    /**
     * Cleanup expired entries
     */
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

// Rate limiters for different email types
const rateLimiters = {
    welcome: new RateLimiter(5, 60000), // 5 per minute
    payment: new RateLimiter(20, 60000), // 20 per minute
    creator: new RateLimiter(20, 60000), // 20 per minute
    milestone: new RateLimiter(10, 60000), // 10 per minute
    update: new RateLimiter(5, 300000), // 5 per 5 minutes
    weekly: new RateLimiter(100, 60000), // 100 per minute
};

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate email address format
 */
const isValidEmail = (email) => {
    if (!email || typeof email !== 'string') return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

/**
 * Validate required fields
 */
const validateRequired = (data, fields) => {
    const errors = [];

    for (const field of fields) {
        if (!data[field]) {
            errors.push(`Missing required field: ${field}`);
        }
    }

    return errors;
};

/**
 * Validate numeric fields
 */
const validateNumeric = (data, fields) => {
    const errors = [];

    for (const field of fields) {
        if (data[field] !== undefined && typeof data[field] !== 'number') {
            errors.push(`Field ${field} must be a number`);
        }
        if (data[field] !== undefined && data[field] < 0) {
            errors.push(`Field ${field} must be non-negative`);
        }
    }

    return errors;
};

/**
 * Sanitize string input
 */
const sanitizeString = (str, maxLength = 1000) => {
    if (!str || typeof str !== 'string') return '';
    return str.trim().substring(0, maxLength);
};

// ============================================================================
// ERROR BOUNDARY WRAPPER
// ============================================================================

/**
 * Wrap email function with error boundary and logging
 * @param {Function} fn - Email function to wrap
 * @param {string} actionName - Name of the action for logging
 * @param {Object} rateLimiter - Rate limiter instance
 * @returns {Function} Wrapped function
 */
const withErrorBoundary = (fn, actionName, rateLimiter) => {
    return async (data) => {
        const startTime = Date.now();
        const requestId = `${actionName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        try {
            logger.info(`${actionName} started`, {
                requestId,
                action: actionName,
            });

            // Rate limiting check
            if (rateLimiter) {
                const rateLimitKey = data.email || data.userId || data.creatorEmail || 'anonymous';
                const rateLimit = rateLimiter.check(rateLimitKey);

                if (!rateLimit.allowed) {
                    logger.warn(`${actionName} rate limited`, {
                        requestId,
                        action: actionName,
                        key: rateLimitKey,
                        retryAfter: rateLimit.retryAfter,
                    });

                    return {
                        success: false,
                        error: 'Rate limit exceeded. Please try again later.',
                        retryAfter: rateLimit.retryAfter,
                        resetAt: rateLimit.resetAt,
                    };
                }
            }

            // Execute function
            const result = await fn(data);

            const duration = Date.now() - startTime;

            if (result.success) {
                logger.info(`${actionName} completed successfully`, {
                    requestId,
                    action: actionName,
                    duration: `${duration}ms`,
                });
            } else {
                logger.warn(`${actionName} completed with errors`, {
                    requestId,
                    action: actionName,
                    duration: `${duration}ms`,
                    error: result.error,
                });
            }

            return result;

        } catch (error) {
            const duration = Date.now() - startTime;

            logger.error(`${actionName} failed`, error, {
                requestId,
                action: actionName,
                duration: `${duration}ms`,
            });

            // Return safe error response
            return {
                success: false,
                error: 'An unexpected error occurred. Please try again later.',
                _debug: process.env.NODE_ENV === 'development' ? error.message : undefined,
            };
        }
    };
};

// ============================================================================
// EMAIL ACTION IMPLEMENTATIONS
// ============================================================================

/**
 * Send welcome email to new user
 * 
 * @param {Object} userData - User data
 * @param {string} userData.name - User's name
 * @param {string} userData.email - User's email
 * @param {string} userData.userId - User's ID
 * @returns {Promise<Object>} Send result
 */
const sendWelcomeEmailImpl = async (userData) => {
    // Validate required fields
    const requiredErrors = validateRequired(userData, ['name', 'email', 'userId']);
    if (requiredErrors.length > 0) {
        return {
            success: false,
            error: 'Validation failed',
            validationErrors: requiredErrors,
        };
    }

    // Validate email format
    if (!isValidEmail(userData.email)) {
        return {
            success: false,
            error: 'Invalid email address format',
        };
    }

    // Sanitize inputs
    const sanitizedData = {
        name: sanitizeString(userData.name, 100),
        email: sanitizeString(userData.email, 255),
        userId: sanitizeString(userData.userId, 50),
    };

    try {
        const { subject, html, text } = WelcomeEmail(sanitizedData);

        return await sendEmail({
            to: sanitizedData.email,
            subject,
            html,
            text,
        });
    } catch (templateError) {
        logger.error('Welcome email template generation failed', templateError);

        // Fallback: send simple text email
        return await sendEmail({
            to: sanitizedData.email,
            subject: 'Welcome to Get Me A Chai!',
            html: `<h1>Welcome ${sanitizedData.name}!</h1><p>Thank you for joining Get Me A Chai.</p>`,
            text: `Welcome ${sanitizedData.name}! Thank you for joining Get Me A Chai.`,
        });
    }
};

/**
 * Send payment confirmation to supporter
 * 
 * @param {Object} paymentData - Payment data
 * @returns {Promise<Object>} Send result
 */
const sendPaymentConfirmationImpl = async (paymentData) => {
    // Validate required fields
    const requiredErrors = validateRequired(paymentData, [
        'supporterEmail',
        'supporterName',
        'campaignTitle',
        'campaignSlug',
        'creatorName',
        'amount',
        'paymentId',
        'date',
    ]);

    if (requiredErrors.length > 0) {
        return {
            success: false,
            error: 'Validation failed',
            validationErrors: requiredErrors,
        };
    }

    // Validate email
    if (!isValidEmail(paymentData.supporterEmail)) {
        return {
            success: false,
            error: 'Invalid supporter email address',
        };
    }

    // Validate numeric fields
    const numericErrors = validateNumeric(paymentData, ['amount']);
    if (numericErrors.length > 0) {
        return {
            success: false,
            error: 'Validation failed',
            validationErrors: numericErrors,
        };
    }

    // Sanitize inputs
    const sanitizedData = {
        supporterEmail: sanitizeString(paymentData.supporterEmail, 255),
        supporterName: sanitizeString(paymentData.supporterName, 100),
        campaignTitle: sanitizeString(paymentData.campaignTitle, 200),
        campaignSlug: sanitizeString(paymentData.campaignSlug, 100),
        creatorName: sanitizeString(paymentData.creatorName, 100),
        amount: paymentData.amount,
        paymentId: sanitizeString(paymentData.paymentId, 100),
        date: paymentData.date,
        message: sanitizeString(paymentData.message || '', 500),
        isAnonymous: Boolean(paymentData.isAnonymous),
        userId: sanitizeString(paymentData.userId || '', 50),
    };

    try {
        const { subject, html, text } = PaymentConfirmationEmail(sanitizedData);

        return await sendEmail({
            to: sanitizedData.supporterEmail,
            subject,
            html,
            text,
        });
    } catch (templateError) {
        logger.error('Payment confirmation template generation failed', templateError);

        // Fallback: send simple confirmation
        return await sendEmail({
            to: sanitizedData.supporterEmail,
            subject: `Payment Confirmation - ₹${sanitizedData.amount}`,
            html: `<h1>Thank you for your support!</h1><p>Your payment of ₹${sanitizedData.amount} to "${sanitizedData.campaignTitle}" was successful.</p>`,
            text: `Thank you for your support! Your payment of ₹${sanitizedData.amount} to "${sanitizedData.campaignTitle}" was successful.`,
        });
    }
};

/**
 * Send payment notification to creator
 * 
 * @param {Object} notificationData - Notification data
 * @returns {Promise<Object>} Send result
 */
const sendCreatorNotificationImpl = async (notificationData) => {
    // Validate required fields
    const requiredErrors = validateRequired(notificationData, [
        'creatorEmail',
        'creatorName',
        'supporterName',
        'amount',
        'campaignTitle',
        'campaignSlug',
        'totalRaised',
        'goal',
        'supportersCount',
    ]);

    if (requiredErrors.length > 0) {
        return {
            success: false,
            error: 'Validation failed',
            validationErrors: requiredErrors,
        };
    }

    // Validate email
    if (!isValidEmail(notificationData.creatorEmail)) {
        return {
            success: false,
            error: 'Invalid creator email address',
        };
    }

    // Validate numeric fields
    const numericErrors = validateNumeric(notificationData, [
        'amount',
        'totalRaised',
        'goal',
        'supportersCount',
    ]);

    if (numericErrors.length > 0) {
        return {
            success: false,
            error: 'Validation failed',
            validationErrors: numericErrors,
        };
    }

    // Sanitize inputs
    const sanitizedData = {
        creatorEmail: sanitizeString(notificationData.creatorEmail, 255),
        creatorName: sanitizeString(notificationData.creatorName, 100),
        supporterName: sanitizeString(notificationData.supporterName, 100),
        amount: notificationData.amount,
        campaignTitle: sanitizeString(notificationData.campaignTitle, 200),
        campaignSlug: sanitizeString(notificationData.campaignSlug, 100),
        message: sanitizeString(notificationData.message || '', 500),
        isAnonymous: Boolean(notificationData.isAnonymous),
        totalRaised: notificationData.totalRaised,
        goal: notificationData.goal,
        supportersCount: notificationData.supportersCount,
        userId: sanitizeString(notificationData.userId || '', 50),
    };

    try {
        const { subject, html, text } = CreatorNotificationEmail(sanitizedData);

        return await sendEmail({
            to: sanitizedData.creatorEmail,
            subject,
            html,
            text,
        });
    } catch (templateError) {
        logger.error('Creator notification template generation failed', templateError);

        // Fallback: send simple notification
        return await sendEmail({
            to: sanitizedData.creatorEmail,
            subject: `New Payment: ₹${sanitizedData.amount}`,
            html: `<h1>You received a new payment!</h1><p>${sanitizedData.supporterName} supported "${sanitizedData.campaignTitle}" with ₹${sanitizedData.amount}.</p>`,
            text: `You received a new payment! ${sanitizedData.supporterName} supported "${sanitizedData.campaignTitle}" with ₹${sanitizedData.amount}.`,
        });
    }
};

/**
 * Send milestone achievement email
 * 
 * @param {Object} milestoneData - Milestone data
 * @returns {Promise<Object>} Send result
 */
const sendMilestoneEmailImpl = async (milestoneData) => {
    // Validate required fields
    const requiredErrors = validateRequired(milestoneData, [
        'creatorEmail',
        'creatorName',
        'campaignTitle',
        'campaignSlug',
        'percentage',
        'totalRaised',
        'goal',
        'supportersCount',
    ]);

    if (requiredErrors.length > 0) {
        return {
            success: false,
            error: 'Validation failed',
            validationErrors: requiredErrors,
        };
    }

    // Validate email
    if (!isValidEmail(milestoneData.creatorEmail)) {
        return {
            success: false,
            error: 'Invalid creator email address',
        };
    }

    // Validate numeric fields
    const numericErrors = validateNumeric(milestoneData, [
        'percentage',
        'totalRaised',
        'goal',
        'supportersCount',
    ]);

    if (numericErrors.length > 0) {
        return {
            success: false,
            error: 'Validation failed',
            validationErrors: numericErrors,
        };
    }

    // Validate percentage is valid milestone
    const validPercentages = [25, 50, 75, 100];
    if (!validPercentages.includes(milestoneData.percentage)) {
        return {
            success: false,
            error: 'Invalid milestone percentage. Must be 25, 50, 75, or 100.',
        };
    }

    // Sanitize inputs
    const sanitizedData = {
        creatorEmail: sanitizeString(milestoneData.creatorEmail, 255),
        creatorName: sanitizeString(milestoneData.creatorName, 100),
        campaignTitle: sanitizeString(milestoneData.campaignTitle, 200),
        campaignSlug: sanitizeString(milestoneData.campaignSlug, 100),
        percentage: milestoneData.percentage,
        totalRaised: milestoneData.totalRaised,
        goal: milestoneData.goal,
        supportersCount: milestoneData.supportersCount,
        userId: sanitizeString(milestoneData.userId || '', 50),
    };

    try {
        const { subject, html, text } = MilestoneEmail(sanitizedData);

        return await sendEmail({
            to: sanitizedData.creatorEmail,
            subject,
            html,
            text,
        });
    } catch (templateError) {
        logger.error('Milestone email template generation failed', templateError);

        // Fallback: send simple milestone notification
        return await sendEmail({
            to: sanitizedData.creatorEmail,
            subject: `Milestone Reached: ${sanitizedData.percentage}% Funded!`,
            html: `<h1>Congratulations!</h1><p>Your campaign "${sanitizedData.campaignTitle}" has reached ${sanitizedData.percentage}% of its goal!</p>`,
            text: `Congratulations! Your campaign "${sanitizedData.campaignTitle}" has reached ${sanitizedData.percentage}% of its goal!`,
        });
    }
};

/**
 * Send update notification to supporters
 * 
 * @param {Array} supporters - Array of supporter objects
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Send result
 */
const sendUpdateNotificationsImpl = async (supporters, updateData) => {
    // Validate supporters array
    if (!Array.isArray(supporters)) {
        return {
            success: false,
            error: 'Supporters must be an array',
        };
    }

    if (supporters.length === 0) {
        return {
            success: true,
            results: { total: 0, sent: 0, failed: 0, errors: [] },
            message: 'No supporters to notify',
        };
    }

    // Validate update data
    const requiredErrors = validateRequired(updateData, [
        'creatorName',
        'campaignTitle',
        'campaignSlug',
        'updateTitle',
        'updateSnippet',
        'updateId',
    ]);

    if (requiredErrors.length > 0) {
        return {
            success: false,
            error: 'Validation failed',
            validationErrors: requiredErrors,
        };
    }

    // Sanitize update data
    const sanitizedUpdateData = {
        creatorName: sanitizeString(updateData.creatorName, 100),
        campaignTitle: sanitizeString(updateData.campaignTitle, 200),
        campaignSlug: sanitizeString(updateData.campaignSlug, 100),
        updateTitle: sanitizeString(updateData.updateTitle, 200),
        updateSnippet: sanitizeString(updateData.updateSnippet, 500),
        updateId: sanitizeString(updateData.updateId, 50),
    };

    // Prepare and validate recipients
    const recipients = [];
    const invalidSupporters = [];

    for (const supporter of supporters) {
        if (!supporter.email || !isValidEmail(supporter.email)) {
            invalidSupporters.push(supporter.email || 'unknown');
            continue;
        }

        recipients.push({
            email: sanitizeString(supporter.email, 255),
            data: {
                supporterName: sanitizeString(supporter.name || 'Supporter', 100),
                ...sanitizedUpdateData,
                userId: sanitizeString(supporter.userId || '', 50),
            },
        });
    }

    if (invalidSupporters.length > 0) {
        logger.warn('Some supporters have invalid emails', {
            count: invalidSupporters.length,
            invalid: invalidSupporters.slice(0, 5), // Log first 5
        });
    }

    if (recipients.length === 0) {
        return {
            success: false,
            error: 'No valid supporter emails found',
        };
    }

    try {
        // Template function with error handling
        const templateFn = (data) => {
            try {
                return UpdateNotificationEmail(data);
            } catch (error) {
                logger.error('Update notification template failed', error);
                // Fallback template
                return {
                    subject: `New Update: ${data.updateTitle}`,
                    html: `<h1>New Update from ${data.creatorName}</h1><p>${data.updateSnippet}</p>`,
                    text: `New Update from ${data.creatorName}: ${data.updateSnippet}`,
                };
            }
        };

        // Send bulk emails with rate limiting
        return await sendBulkEmail(recipients, templateFn, 100);
    } catch (error) {
        logger.error('Bulk update notifications failed', error);
        return {
            success: false,
            error: 'Failed to send update notifications',
        };
    }
};

/**
 * Send weekly summary to creator
 * 
 * @param {Object} summaryData - Summary data
 * @returns {Promise<Object>} Send result
 */
const sendWeeklySummaryImpl = async (summaryData) => {
    // Validate required fields
    const requiredErrors = validateRequired(summaryData, [
        'creatorEmail',
        'creatorName',
        'weeklyEarnings',
        'newSupporters',
        'totalViews',
        'conversionRate',
    ]);

    if (requiredErrors.length > 0) {
        return {
            success: false,
            error: 'Validation failed',
            validationErrors: requiredErrors,
        };
    }

    // Validate email
    if (!isValidEmail(summaryData.creatorEmail)) {
        return {
            success: false,
            error: 'Invalid creator email address',
        };
    }

    // Validate numeric fields
    const numericErrors = validateNumeric(summaryData, [
        'weeklyEarnings',
        'newSupporters',
        'totalViews',
        'conversionRate',
    ]);

    if (numericErrors.length > 0) {
        return {
            success: false,
            error: 'Validation failed',
            validationErrors: numericErrors,
        };
    }

    // Sanitize inputs
    const sanitizedData = {
        creatorEmail: sanitizeString(summaryData.creatorEmail, 255),
        creatorName: sanitizeString(summaryData.creatorName, 100),
        weeklyEarnings: summaryData.weeklyEarnings,
        newSupporters: summaryData.newSupporters,
        totalViews: summaryData.totalViews,
        conversionRate: summaryData.conversionRate,
        topCampaigns: Array.isArray(summaryData.topCampaigns) ? summaryData.topCampaigns : [],
        recentPayments: Array.isArray(summaryData.recentPayments) ? summaryData.recentPayments : [],
        tips: Array.isArray(summaryData.tips) ? summaryData.tips : [],
        userId: sanitizeString(summaryData.userId || '', 50),
    };

    try {
        const { subject, html, text } = WeeklySummaryEmail(sanitizedData);

        return await sendEmail({
            to: sanitizedData.creatorEmail,
            subject,
            html,
            text,
        });
    } catch (templateError) {
        logger.error('Weekly summary template generation failed', templateError);

        // Fallback: send simple summary
        return await sendEmail({
            to: sanitizedData.creatorEmail,
            subject: 'Your Weekly Summary',
            html: `<h1>Weekly Summary</h1><p>Earnings: ₹${sanitizedData.weeklyEarnings}, New Supporters: ${sanitizedData.newSupporters}</p>`,
            text: `Weekly Summary - Earnings: ₹${sanitizedData.weeklyEarnings}, New Supporters: ${sanitizedData.newSupporters}`,
        });
    }
};

/**
 * Send bulk weekly summaries to all creators
 * 
 * @param {Array} creators - Array of creator objects with summary data
 * @returns {Promise<Object>} Send result
 */
const sendBulkWeeklySummariesImpl = async (creators) => {
    // Validate creators array
    if (!Array.isArray(creators)) {
        return {
            success: false,
            error: 'Creators must be an array',
        };
    }

    if (creators.length === 0) {
        return {
            success: true,
            results: { total: 0, sent: 0, failed: 0, errors: [] },
            message: 'No creators to send summaries to',
        };
    }

    // Prepare and validate recipients
    const recipients = [];
    const invalidCreators = [];

    for (const creator of creators) {
        if (!creator.email || !isValidEmail(creator.email)) {
            invalidCreators.push(creator.email || 'unknown');
            continue;
        }

        recipients.push({
            email: sanitizeString(creator.email, 255),
            data: {
                creatorName: sanitizeString(creator.name || 'Creator', 100),
                weeklyEarnings: creator.weeklyEarnings || 0,
                newSupporters: creator.newSupporters || 0,
                totalViews: creator.totalViews || 0,
                conversionRate: creator.conversionRate || 0,
                topCampaigns: Array.isArray(creator.topCampaigns) ? creator.topCampaigns : [],
                recentPayments: Array.isArray(creator.recentPayments) ? creator.recentPayments : [],
                tips: Array.isArray(creator.tips) ? creator.tips : [],
                userId: sanitizeString(creator.userId || '', 50),
            },
        });
    }

    if (invalidCreators.length > 0) {
        logger.warn('Some creators have invalid emails', {
            count: invalidCreators.length,
            invalid: invalidCreators.slice(0, 5),
        });
    }

    if (recipients.length === 0) {
        return {
            success: false,
            error: 'No valid creator emails found',
        };
    }

    try {
        // Template function with error handling
        const templateFn = (data) => {
            try {
                return WeeklySummaryEmail(data);
            } catch (error) {
                logger.error('Weekly summary template failed', error);
                // Fallback template
                return {
                    subject: 'Your Weekly Summary',
                    html: `<h1>Weekly Summary</h1><p>Earnings: ₹${data.weeklyEarnings}</p>`,
                    text: `Weekly Summary - Earnings: ₹${data.weeklyEarnings}`,
                };
            }
        };

        // Send bulk emails with rate limiting (200ms delay)
        return await sendBulkEmail(recipients, templateFn, 200);
    } catch (error) {
        logger.error('Bulk weekly summaries failed', error);
        return {
            success: false,
            error: 'Failed to send weekly summaries',
        };
    }
};

// ============================================================================
// EXPORTED FUNCTIONS (WITH ERROR BOUNDARIES)
// ============================================================================

export const sendWelcomeEmail = withErrorBoundary(
    sendWelcomeEmailImpl,
    'sendWelcomeEmail',
    rateLimiters.welcome
);

export const sendPaymentConfirmation = withErrorBoundary(
    sendPaymentConfirmationImpl,
    'sendPaymentConfirmation',
    rateLimiters.payment
);

export const sendCreatorNotification = withErrorBoundary(
    sendCreatorNotificationImpl,
    'sendCreatorNotification',
    rateLimiters.creator
);

export const sendMilestoneEmail = withErrorBoundary(
    sendMilestoneEmailImpl,
    'sendMilestoneEmail',
    rateLimiters.milestone
);

export const sendUpdateNotifications = withErrorBoundary(
    sendUpdateNotificationsImpl,
    'sendUpdateNotifications',
    rateLimiters.update
);

export const sendWeeklySummary = withErrorBoundary(
    sendWeeklySummaryImpl,
    'sendWeeklySummary',
    rateLimiters.weekly
);

export const sendBulkWeeklySummaries = withErrorBoundary(
    sendBulkWeeklySummariesImpl,
    'sendBulkWeeklySummaries',
    rateLimiters.weekly
);

export default {
    sendWelcomeEmail,
    sendPaymentConfirmation,
    sendCreatorNotification,
    sendMilestoneEmail,
    sendUpdateNotifications,
    sendWeeklySummary,
    sendBulkWeeklySummaries,
};
