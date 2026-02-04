// lib/email/nodemailer.js
/**
 * Production-Ready Email Service using Nodemailer
 * 
 * Features:
 * - Connection pooling for performance
 * - Retry logic with exponential backoff
 * - Comprehensive error handling
 * - Input validation
 * - Rate limiting support
 * - Timeout handling
 * - Detailed logging
 * 
 * Supports: Gmail, SendGrid, Mailgun, AWS SES, and other SMTP providers
 * 
 * @module lib/email/nodemailer
 */

import nodemailer from 'nodemailer';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const EMAIL_CONFIG = {
    MAX_RETRIES: 3,
    RETRY_DELAY_MS: 1000, // Initial delay, will use exponential backoff
    TIMEOUT_MS: 30000, // 30 seconds
    POOL_SIZE: 5, // Connection pool size
    MAX_CONNECTIONS: 5,
    RATE_LIMIT_DELAY_MS: 100, // Delay between bulk emails
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Cache transporter instance for reuse
let cachedTransporter = null;

// ============================================================================
// TRANSPORTER CREATION & MANAGEMENT
// ============================================================================

/**
 * Create and configure email transporter with connection pooling
 * Uses singleton pattern to reuse transporter instance
 * 
 * @returns {Object|null} Nodemailer transporter instance or null if config invalid
 * @throws {Error} If transporter creation fails critically
 */
function createTransporter() {
    // Return cached transporter if available
    if (cachedTransporter) {
        return cachedTransporter;
    }

    // Validate required environment variables
    const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        console.warn(
            `[Email Service] Configuration incomplete. Missing: ${missingVars.join(', ')}. ` +
            'Emails will not be sent.'
        );
        return null;
    }

    try {
        // Parse and validate port
        const port = parseInt(process.env.SMTP_PORT, 10);
        if (isNaN(port) || port < 1 || port > 65535) {
            throw new Error(`Invalid SMTP_PORT: ${process.env.SMTP_PORT}. Must be 1-65535.`);
        }

        // Determine if connection should be secure
        const isSecure = port === 465;

        // Create transporter configuration
        const transportConfig = {
            host: process.env.SMTP_HOST.trim(),
            port,
            secure: isSecure,
            auth: {
                user: process.env.SMTP_USER.trim(),
                pass: process.env.SMTP_PASS,
            },
            // Connection pooling for better performance
            pool: true,
            maxConnections: EMAIL_CONFIG.MAX_CONNECTIONS,
            maxMessages: 100, // Max messages per connection
            // Timeout settings
            connectionTimeout: EMAIL_CONFIG.TIMEOUT_MS,
            greetingTimeout: EMAIL_CONFIG.TIMEOUT_MS,
            socketTimeout: EMAIL_CONFIG.TIMEOUT_MS,
            // Additional options for Gmail
            ...(process.env.SMTP_HOST.includes('gmail') && {
                service: 'gmail',
            }),
            // Logging (disable in production for performance)
            logger: process.env.NODE_ENV === 'development',
            debug: process.env.NODE_ENV === 'development',
        };

        cachedTransporter = nodemailer.createTransport(transportConfig);

        console.log(
            `[Email Service] Transporter created successfully for ${process.env.SMTP_HOST}:${port}`
        );

        return cachedTransporter;

    } catch (error) {
        console.error('[Email Service] Failed to create transporter:', {
            error: error.message,
            stack: error.stack,
        });
        return null;
    }
}

// ============================================================================
// VALIDATION & SANITIZATION
// ============================================================================

/**
 * Validate email address format
 * 
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email format
 */
function isValidEmail(email) {
    if (!email || typeof email !== 'string') {
        return false;
    }
    return EMAIL_REGEX.test(email.trim());
}

/**
 * Sanitize email content to prevent injection attacks
 * 
 * @param {string} content - Content to sanitize
 * @returns {string} Sanitized content
 */
function sanitizeContent(content) {
    if (!content || typeof content !== 'string') {
        return '';
    }

    // Remove potentially dangerous characters/patterns
    return content
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
        .trim();
}

/**
 * Validate email options object
 * 
 * @param {Object} options - Email options to validate
 * @returns {Object} Validation result {valid: boolean, errors: string[]}
 */
function validateEmailOptions(options) {
    const errors = [];

    // Check required fields
    if (!options) {
        errors.push('Email options object is required');
        return { valid: false, errors };
    }

    if (!options.to) {
        errors.push('Recipient email (to) is required');
    } else if (!isValidEmail(options.to)) {
        errors.push(`Invalid recipient email format: ${options.to}`);
    }

    if (!options.subject || typeof options.subject !== 'string') {
        errors.push('Subject is required and must be a string');
    } else if (options.subject.trim().length === 0) {
        errors.push('Subject cannot be empty');
    } else if (options.subject.length > 998) {
        errors.push('Subject exceeds maximum length of 998 characters');
    }

    if (!options.html || typeof options.html !== 'string') {
        errors.push('HTML content is required and must be a string');
    } else if (options.html.trim().length === 0) {
        errors.push('HTML content cannot be empty');
    }

    // Validate attachments if provided
    if (options.attachments && !Array.isArray(options.attachments)) {
        errors.push('Attachments must be an array');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

// ============================================================================
// EMAIL SENDING WITH RETRY LOGIC
// ============================================================================

/**
 * Send an email with retry logic and comprehensive error handling
 * 
 * Features:
 * - Input validation
 * - Content sanitization
 * - Retry with exponential backoff
 * - Detailed error logging
 * - Fallback to plain text
 * 
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address (required)
 * @param {string} options.subject - Email subject (required)
 * @param {string} options.html - HTML content (required)
 * @param {string} [options.text] - Plain text content (optional, auto-generated if not provided)
 * @param {Array} [options.attachments] - Email attachments (optional)
 * @param {number} [retryCount=0] - Current retry attempt (internal use)
 * @returns {Promise<Object>} Send result {success: boolean, messageId?: string, error?: string}
 */
export async function sendEmail(options, retryCount = 0) {
    const startTime = Date.now();

    try {
        // Validate input
        const validation = validateEmailOptions(options);
        if (!validation.valid) {
            console.error('[Email Service] Validation failed:', validation.errors);
            return {
                success: false,
                error: `Validation failed: ${validation.errors.join(', ')}`,
                validationErrors: validation.errors,
            };
        }

        // Get transporter
        const transporter = createTransporter();

        if (!transporter) {
            console.error('[Email Service] Transporter not configured');
            return {
                success: false,
                error: 'Email service not configured. Please check SMTP settings.',
            };
        }

        // Sanitize inputs
        const sanitizedTo = sanitizeContent(options.to);
        const sanitizedSubject = sanitizeContent(options.subject);
        const sanitizedHtml = options.html; // HTML is already sanitized in templates

        // Prepare mail options
        const mailOptions = {
            from: `"${process.env.SMTP_FROM_NAME || 'Get Me A Chai'}" <${process.env.SMTP_USER}>`,
            to: sanitizedTo,
            subject: sanitizedSubject,
            html: sanitizedHtml,
            text: options.text || stripHtml(sanitizedHtml),
            attachments: options.attachments || [],
            headers: {
                'X-Platform': 'Get Me A Chai',
                'X-Environment': process.env.NODE_ENV || 'development',
                'X-Mailer': 'Nodemailer',
            },
            // Priority (optional)
            priority: options.priority || 'normal',
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);

        const duration = Date.now() - startTime;

        console.log('[Email Service] Email sent successfully:', {
            to: sanitizedTo,
            subject: sanitizedSubject.substring(0, 50),
            messageId: info.messageId,
            duration: `${duration}ms`,
            retryCount,
        });

        return {
            success: true,
            messageId: info.messageId,
            response: info.response,
            duration,
        };

    } catch (error) {
        const duration = Date.now() - startTime;

        console.error('[Email Service] Send failed:', {
            to: options?.to,
            subject: options?.subject?.substring(0, 50),
            error: error.message,
            code: error.code,
            retryCount,
            duration: `${duration}ms`,
        });

        // Retry logic with exponential backoff
        if (retryCount < EMAIL_CONFIG.MAX_RETRIES) {
            const delay = EMAIL_CONFIG.RETRY_DELAY_MS * Math.pow(2, retryCount);

            console.log(
                `[Email Service] Retrying in ${delay}ms (attempt ${retryCount + 1}/${EMAIL_CONFIG.MAX_RETRIES})`
            );

            await new Promise(resolve => setTimeout(resolve, delay));
            return sendEmail(options, retryCount + 1);
        }

        // All retries exhausted
        return {
            success: false,
            error: error.message || 'Failed to send email after retries',
            code: error.code,
            retryCount,
            duration,
        };
    }
}

// ============================================================================
// BULK EMAIL SENDING
// ============================================================================

/**
 * Send bulk emails with rate limiting and batch processing
 * 
 * Features:
 * - Input validation
 * - Batch processing for large volumes
 * - Rate limiting to prevent SMTP throttling
 * - Progress tracking
 * - Detailed error reporting
 * - Graceful degradation on failures
 * 
 * @param {Array} recipients - Array of recipient objects [{email, data}]
 * @param {Function} templateFn - Template function that takes data and returns {subject, html, text}
 * @param {number} [delayMs=100] - Delay between emails in milliseconds
 * @param {number} [batchSize=50] - Number of emails to send per batch
 * @returns {Promise<Object>} Results summary {success, results: {total, sent, failed, errors}}
 */
export async function sendBulkEmail(recipients, templateFn, delayMs = 100, batchSize = 50) {
    const startTime = Date.now();

    try {
        // Validate inputs
        if (!Array.isArray(recipients)) {
            return {
                success: false,
                error: 'Recipients must be an array',
            };
        }

        if (recipients.length === 0) {
            return {
                success: false,
                error: 'No recipients provided',
            };
        }

        if (typeof templateFn !== 'function') {
            return {
                success: false,
                error: 'Template function is required',
            };
        }

        // Validate delay and batch size
        const validatedDelay = Math.max(0, Math.min(delayMs, 5000)); // Max 5s delay
        const validatedBatchSize = Math.max(1, Math.min(batchSize, 100)); // Max 100 per batch

        console.log('[Email Service] Starting bulk email send:', {
            totalRecipients: recipients.length,
            delayMs: validatedDelay,
            batchSize: validatedBatchSize,
        });

        const results = {
            total: recipients.length,
            sent: 0,
            failed: 0,
            errors: [],
            duration: 0,
        };

        // Process in batches
        for (let i = 0; i < recipients.length; i += validatedBatchSize) {
            const batch = recipients.slice(i, i + validatedBatchSize);
            const batchNumber = Math.floor(i / validatedBatchSize) + 1;
            const totalBatches = Math.ceil(recipients.length / validatedBatchSize);

            console.log(
                `[Email Service] Processing batch ${batchNumber}/${totalBatches} (${batch.length} emails)`
            );

            // Process each email in the batch
            for (const recipient of batch) {
                try {
                    // Validate recipient object
                    if (!recipient || typeof recipient !== 'object') {
                        results.failed++;
                        results.errors.push({
                            email: 'unknown',
                            error: 'Invalid recipient object',
                        });
                        continue;
                    }

                    if (!recipient.email || !isValidEmail(recipient.email)) {
                        results.failed++;
                        results.errors.push({
                            email: recipient.email || 'unknown',
                            error: 'Invalid email address',
                        });
                        continue;
                    }

                    // Generate email content from template
                    let emailContent;
                    try {
                        emailContent = templateFn(recipient.data || {});
                    } catch (templateError) {
                        results.failed++;
                        results.errors.push({
                            email: recipient.email,
                            error: `Template generation failed: ${templateError.message}`,
                        });
                        continue;
                    }

                    // Validate template output
                    if (!emailContent || typeof emailContent !== 'object') {
                        results.failed++;
                        results.errors.push({
                            email: recipient.email,
                            error: 'Template function must return an object',
                        });
                        continue;
                    }

                    if (!emailContent.subject || !emailContent.html) {
                        results.failed++;
                        results.errors.push({
                            email: recipient.email,
                            error: 'Template must return subject and html',
                        });
                        continue;
                    }

                    // Send email
                    const result = await sendEmail({
                        to: recipient.email,
                        subject: emailContent.subject,
                        html: emailContent.html,
                        text: emailContent.text,
                    });

                    if (result.success) {
                        results.sent++;
                    } else {
                        results.failed++;
                        results.errors.push({
                            email: recipient.email,
                            error: result.error || 'Unknown error',
                        });
                    }

                    // Rate limiting delay (except for last email)
                    if (validatedDelay > 0 && (i + batch.indexOf(recipient)) < recipients.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, validatedDelay));
                    }

                } catch (error) {
                    results.failed++;
                    results.errors.push({
                        email: recipient?.email || 'unknown',
                        error: error.message || 'Unexpected error',
                    });
                }
            }

            // Small delay between batches
            if (i + validatedBatchSize < recipients.length) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        results.duration = Date.now() - startTime;

        console.log('[Email Service] Bulk email send completed:', {
            total: results.total,
            sent: results.sent,
            failed: results.failed,
            duration: `${results.duration}ms`,
            successRate: `${((results.sent / results.total) * 100).toFixed(1)}%`,
        });

        return {
            success: true,
            results,
        };

    } catch (error) {
        const duration = Date.now() - startTime;

        console.error('[Email Service] Bulk email send failed:', {
            error: error.message,
            duration: `${duration}ms`,
        });

        return {
            success: false,
            error: error.message || 'Bulk email send failed',
            duration,
        };
    }
}

// ============================================================================
// CONFIGURATION VERIFICATION
// ============================================================================

/**
 * Verify email configuration and test connection
 * 
 * @returns {Promise<Object>} Verification result {valid: boolean, error?: string}
 */
export async function verifyEmailConfig() {
    try {
        const transporter = createTransporter();

        if (!transporter) {
            return {
                valid: false,
                error: 'Email transporter not configured. Check environment variables.',
            };
        }

        // Test connection
        await transporter.verify();

        console.log('[Email Service] Configuration verified successfully');

        return {
            valid: true,
            message: 'Email configuration is valid and connection successful',
        };

    } catch (error) {
        console.error('[Email Service] Configuration verification failed:', {
            error: error.message,
            code: error.code,
        });

        return {
            valid: false,
            error: error.message || 'Email configuration verification failed',
            code: error.code,
        };
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Strip HTML tags from string and convert to plain text
 * Handles common HTML entities and whitespace
 * 
 * @param {string} html - HTML string to convert
 * @returns {string} Plain text version
 */
function stripHtml(html) {
    if (!html || typeof html !== 'string') {
        return '';
    }

    return html
        .replace(/<style[^>]*>.*?<\/style>/gi, '') // Remove style tags and content
        .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags and content
        .replace(/<[^>]+>/g, '') // Remove all HTML tags
        .replace(/&nbsp;/gi, ' ') // Replace &nbsp;
        .replace(/&amp;/gi, '&') // Replace &amp;
        .replace(/&lt;/gi, '<') // Replace &lt;
        .replace(/&gt;/gi, '>') // Replace &gt;
        .replace(/&quot;/gi, '"') // Replace &quot;
        .replace(/&#39;/gi, "'") // Replace &#39;
        .replace(/&apos;/gi, "'") // Replace &apos;
        .replace(/\s+/g, ' ') // Collapse multiple whitespace
        .trim();
}

/**
 * Generate unsubscribe link for email footer
 * 
 * @param {string} userId - User ID
 * @param {string} [type='all'] - Notification type to unsubscribe from
 * @returns {string} Unsubscribe URL
 */
export function getUnsubscribeLink(userId, type = 'all') {
    if (!userId) {
        console.warn('[Email Service] getUnsubscribeLink called without userId');
        return '';
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

    // Sanitize inputs for URL
    const sanitizedUserId = encodeURIComponent(userId);
    const sanitizedType = encodeURIComponent(type);

    return `${baseUrl}/unsubscribe?user=${sanitizedUserId}&type=${sanitizedType}`;
}

/**
 * Generate tracking pixel URL for email open tracking
 * 
 * @param {string} emailId - Unique email identifier
 * @returns {string} Tracking pixel URL
 */
export function getTrackingPixel(emailId) {
    if (!emailId) {
        console.warn('[Email Service] getTrackingPixel called without emailId');
        return '';
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const sanitizedEmailId = encodeURIComponent(emailId);

    return `${baseUrl}/api/email/track?id=${sanitizedEmailId}`;
}

export default {
    sendEmail,
    sendBulkEmail,
    verifyEmailConfig,
    getUnsubscribeLink,
    getTrackingPixel,
};
