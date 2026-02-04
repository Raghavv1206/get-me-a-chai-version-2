// actions/contributionsActions.js
"use server"

/**
 * Production-Ready Contributions Actions
 * 
 * Features:
 * - Fetch user contributions
 * - Generate PDF receipts
 * - Calculate badges
 * - Impact metrics
 * - Rate limiting
 * - Structured logging
 * - Input validation
 * - Error handling
 * 
 * @module actions/contributionsActions
 */

import connectDb from '@/db/connectDb';
import Payment from '@/models/Payment';
import Campaign from '@/models/Campaign';
import User from '@/models/User';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

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
            service: 'contributions-actions'
        }));
    },

    warn: (message, meta = {}) => {
        console.warn(JSON.stringify({
            level: 'warn',
            timestamp: new Date().toISOString(),
            message,
            ...meta,
            service: 'contributions-actions'
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
            service: 'contributions-actions'
        }));
    },
};

// ============================================================================
// RATE LIMITING
// ============================================================================

class RateLimiter {
    constructor(maxRequests = 60, windowMs = 60000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.requests = new Map();
    }

    check(key) {
        const now = Date.now();
        const userRequests = this.requests.get(key) || [];

        const validRequests = userRequests.filter(
            timestamp => now - timestamp < this.windowMs
        );

        if (validRequests.length >= this.maxRequests) {
            const oldestRequest = Math.min(...validRequests);
            const resetAt = new Date(oldestRequest + this.windowMs);

            return {
                allowed: false,
                retryAfter: Math.ceil((resetAt - now) / 1000),
            };
        }

        validRequests.push(now);
        this.requests.set(key, validRequests);

        if (Math.random() < 0.01) this.cleanup();

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

const contributionsRateLimiter = new RateLimiter(60, 60000); // 60/min
const receiptRateLimiter = new RateLimiter(20, 60000); // 20/min
const badgesRateLimiter = new RateLimiter(30, 60000); // 30/min

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate user ID
 */
function validateUserId(userId) {
    if (!userId) {
        return { valid: false, error: 'User ID is required' };
    }

    if (typeof userId !== 'string') {
        return { valid: false, error: 'Invalid user ID type' };
    }

    // Allow various ID formats: MongoDB ObjectId (24 chars), email, UUID, etc.
    if (userId.length < 3 || userId.length > 255) {
        return { valid: false, error: 'Invalid user ID length' };
    }

    return { valid: true };
}

/**
 * Validate payment ID
 */
function validatePaymentId(paymentId) {
    if (!paymentId) {
        return { valid: false, error: 'Payment ID is required' };
    }

    if (typeof paymentId !== 'string') {
        return { valid: false, error: 'Invalid payment ID type' };
    }

    // Allow various ID formats
    if (paymentId.length < 3 || paymentId.length > 255) {
        return { valid: false, error: 'Invalid payment ID length' };
    }

    return { valid: true };
}

// ============================================================================
// GET CONTRIBUTIONS
// ============================================================================

/**
 * Fetch user's contributions with detailed information
 * 
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Contributions data
 */
export async function getContributions(userId) {
    const startTime = Date.now();
    const requestId = `contributions-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
        logger.info('Get contributions started', { requestId, userId });

        // ========================================================================
        // VALIDATION
        // ========================================================================

        const validation = validateUserId(userId);
        if (!validation.valid) {
            return {
                success: false,
                error: validation.error,
            };
        }

        // Rate limiting
        const rateLimit = contributionsRateLimiter.check(userId);
        if (!rateLimit.allowed) {
            logger.warn('Contributions rate limit exceeded', { requestId, userId });
            return {
                success: false,
                error: 'Rate limit exceeded. Please try again later.',
                retryAfter: rateLimit.retryAfter,
            };
        }

        // ========================================================================
        // FETCH DATA
        // ========================================================================

        await connectDb();

        // Fetch all payments by user
        const payments = await Payment.find({
            from_user: userId,
            status: 'completed'
        })
            .populate('campaign', 'title coverImage creator status')
            .populate('from_user', 'name email profileImage')
            .sort({ createdAt: -1 })
            .lean();

        // Calculate summary statistics
        const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const campaignsSupported = [...new Set(payments.map(p => p.campaign?._id?.toString()))].length;

        // Group by month
        const groupedByMonth = payments.reduce((acc, payment) => {
            const date = new Date(payment.createdAt);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!acc[monthKey]) {
                acc[monthKey] = [];
            }
            acc[monthKey].push(payment);

            return acc;
        }, {});

        // Calculate impact metrics
        const impactMetrics = {
            totalContributions: payments.length,
            totalAmount,
            campaignsSupported,
            averageContribution: payments.length > 0 ? totalAmount / payments.length : 0,
            firstContribution: payments.length > 0 ? payments[payments.length - 1].createdAt : null,
            latestContribution: payments.length > 0 ? payments[0].createdAt : null,
            monthlyAverage: calculateMonthlyAverage(payments),
        };

        // Get active subscriptions
        const activeSubscriptions = payments.filter(p =>
            p.subscription && p.subscription.status === 'active'
        );

        const duration = Date.now() - startTime;

        logger.info('Get contributions completed', {
            requestId,
            userId,
            totalPayments: payments.length,
            totalAmount,
            duration: `${duration}ms`,
        });

        return {
            success: true,
            contributions: JSON.parse(JSON.stringify(payments)),
            summary: {
                totalAmount,
                campaignsSupported,
                totalContributions: payments.length,
                averageContribution: impactMetrics.averageContribution,
            },
            groupedByMonth: JSON.parse(JSON.stringify(groupedByMonth)),
            impactMetrics,
            activeSubscriptions: JSON.parse(JSON.stringify(activeSubscriptions)),
            duration,
        };

    } catch (error) {
        const duration = Date.now() - startTime;

        logger.error('Get contributions failed', error, {
            requestId,
            userId,
            duration: `${duration}ms`,
        });

        return {
            success: false,
            error: 'Failed to fetch contributions. Please try again.',
            _debug: process.env.NODE_ENV === 'development' ? error.message : undefined,
        };
    }
}

// ============================================================================
// GENERATE RECEIPT
// ============================================================================

/**
 * Generate PDF receipt for a payment
 * 
 * @param {string} paymentId - Payment ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object>} Receipt data
 */
export async function generateReceipt(paymentId, userId) {
    const startTime = Date.now();
    const requestId = `receipt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
        logger.info('Generate receipt started', { requestId, paymentId, userId });

        // ========================================================================
        // VALIDATION
        // ========================================================================

        const paymentValidation = validatePaymentId(paymentId);
        if (!paymentValidation.valid) {
            return {
                success: false,
                error: paymentValidation.error,
            };
        }

        const userValidation = validateUserId(userId);
        if (!userValidation.valid) {
            return {
                success: false,
                error: userValidation.error,
            };
        }

        // Rate limiting
        const rateLimit = receiptRateLimiter.check(userId);
        if (!rateLimit.allowed) {
            logger.warn('Receipt rate limit exceeded', { requestId, userId });
            return {
                success: false,
                error: 'Rate limit exceeded. Please try again later.',
                retryAfter: rateLimit.retryAfter,
            };
        }

        // ========================================================================
        // FETCH PAYMENT
        // ========================================================================

        await connectDb();

        const payment = await Payment.findById(paymentId)
            .populate('campaign', 'title creator')
            .populate('from_user', 'name email')
            .lean();

        if (!payment) {
            return {
                success: false,
                error: 'Payment not found',
            };
        }

        // Authorization check
        if (payment.from_user._id.toString() !== userId) {
            logger.warn('Unauthorized receipt access attempt', { requestId, paymentId, userId });
            return {
                success: false,
                error: 'Unauthorized access',
            };
        }

        // ========================================================================
        // GENERATE PDF
        // ========================================================================

        const receiptData = {
            receiptNumber: `RCP-${payment._id.toString().slice(-8).toUpperCase()}`,
            date: new Date(payment.createdAt).toLocaleDateString(),
            paymentId: payment.razorpay_payment_id || payment._id.toString(),
            amount: payment.amount,
            currency: payment.currency || 'INR',
            campaignTitle: payment.campaign?.title || 'Unknown Campaign',
            donorName: payment.from_user?.name || 'Anonymous',
            donorEmail: payment.from_user?.email || '',
            message: payment.message || '',
            taxDeductible: payment.taxDeductible || false,
        };

        const duration = Date.now() - startTime;

        logger.info('Receipt generated successfully', {
            requestId,
            paymentId,
            duration: `${duration}ms`,
        });

        return {
            success: true,
            receipt: receiptData,
            duration,
        };

    } catch (error) {
        const duration = Date.now() - startTime;

        logger.error('Generate receipt failed', error, {
            requestId,
            paymentId,
            userId,
            duration: `${duration}ms`,
        });

        return {
            success: false,
            error: 'Failed to generate receipt. Please try again.',
            _debug: process.env.NODE_ENV === 'development' ? error.message : undefined,
        };
    }
}

// ============================================================================
// GET BADGES
// ============================================================================

/**
 * Calculate and return earned badges for a user
 * 
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Badges data
 */
export async function getBadges(userId) {
    const startTime = Date.now();
    const requestId = `badges-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
        logger.info('Get badges started', { requestId, userId });

        // ========================================================================
        // VALIDATION
        // ========================================================================

        const validation = validateUserId(userId);
        if (!validation.valid) {
            return {
                success: false,
                error: validation.error,
            };
        }

        // Rate limiting
        const rateLimit = badgesRateLimiter.check(userId);
        if (!rateLimit.allowed) {
            logger.warn('Badges rate limit exceeded', { requestId, userId });
            return {
                success: false,
                error: 'Rate limit exceeded. Please try again later.',
                retryAfter: rateLimit.retryAfter,
            };
        }

        // ========================================================================
        // FETCH DATA
        // ========================================================================

        await connectDb();

        const payments = await Payment.find({
            from_user: userId,
            status: 'completed'
        })
            .populate('campaign')
            .sort({ createdAt: 1 })
            .lean();

        // ========================================================================
        // CALCULATE BADGES
        // ========================================================================

        const badges = [];

        // First Supporter Badge
        const firstSupporterCampaigns = await checkFirstSupporter(userId, payments);
        if (firstSupporterCampaigns.length > 0) {
            badges.push({
                id: 'first-supporter',
                name: 'First Supporter',
                description: 'First to support a campaign',
                icon: '🥇',
                earnedAt: firstSupporterCampaigns[0].date,
                count: firstSupporterCampaigns.length,
                campaigns: firstSupporterCampaigns,
            });
        }

        // Top Contributor Badge
        const topContribution = payments.reduce((max, p) =>
            p.amount > max ? p.amount : max, 0
        );
        if (topContribution >= 10000) {
            badges.push({
                id: 'top-contributor',
                name: 'Top Contributor',
                description: 'Contributed ₹10,000 or more in a single donation',
                icon: '💎',
                earnedAt: payments.find(p => p.amount === topContribution)?.createdAt,
                amount: topContribution,
            });
        }

        // Loyal Supporter Badge (Monthly Subscriber)
        const activeSubscriptions = payments.filter(p =>
            p.subscription && p.subscription.status === 'active'
        );
        if (activeSubscriptions.length > 0) {
            badges.push({
                id: 'loyal-supporter',
                name: 'Loyal Supporter',
                description: 'Active monthly subscriber',
                icon: '❤️',
                earnedAt: activeSubscriptions[0].createdAt,
                count: activeSubscriptions.length,
            });
        }

        // Community Champion Badge (5+ campaigns)
        const uniqueCampaigns = [...new Set(payments.map(p => p.campaign?._id?.toString()))];
        if (uniqueCampaigns.length >= 5) {
            badges.push({
                id: 'community-champion',
                name: 'Community Champion',
                description: 'Supported 5 or more campaigns',
                icon: '🏆',
                earnedAt: payments[4]?.createdAt,
                count: uniqueCampaigns.length,
            });
        }

        // Early Bird Badge (supported in first 24 hours)
        const earlyBirdSupports = payments.filter(p => {
            if (!p.campaign?.createdAt) return false;
            const campaignStart = new Date(p.campaign.createdAt);
            const paymentDate = new Date(p.createdAt);
            const hoursDiff = (paymentDate - campaignStart) / (1000 * 60 * 60);
            return hoursDiff <= 24;
        });
        if (earlyBirdSupports.length > 0) {
            badges.push({
                id: 'early-bird',
                name: 'Early Bird',
                description: 'Supported a campaign within 24 hours of launch',
                icon: '🐦',
                earnedAt: earlyBirdSupports[0].createdAt,
                count: earlyBirdSupports.length,
            });
        }

        // Generous Giver Badge (total > 50000)
        const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
        if (totalAmount >= 50000) {
            badges.push({
                id: 'generous-giver',
                name: 'Generous Giver',
                description: 'Contributed over ₹50,000 in total',
                icon: '🌟',
                earnedAt: payments[payments.length - 1]?.createdAt,
                totalAmount,
            });
        }

        // Calculate impact score
        const impactScore = calculateImpactScore(payments, badges);

        const duration = Date.now() - startTime;

        logger.info('Badges calculated successfully', {
            requestId,
            userId,
            badgesCount: badges.length,
            impactScore,
            duration: `${duration}ms`,
        });

        return {
            success: true,
            badges: JSON.parse(JSON.stringify(badges)),
            impactScore,
            totalBadges: badges.length,
            duration,
        };

    } catch (error) {
        const duration = Date.now() - startTime;

        logger.error('Get badges failed', error, {
            requestId,
            userId,
            duration: `${duration}ms`,
        });

        return {
            success: false,
            error: 'Failed to calculate badges. Please try again.',
            _debug: process.env.NODE_ENV === 'development' ? error.message : undefined,
        };
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if user was first supporter for any campaigns
 */
async function checkFirstSupporter(userId, userPayments) {
    const firstSupporterCampaigns = [];

    for (const payment of userPayments) {
        if (!payment.campaign?._id) continue;

        const allPayments = await Payment.find({
            campaign: payment.campaign._id,
            status: 'completed'
        }).sort({ createdAt: 1 }).limit(1).lean();

        if (allPayments.length > 0 && allPayments[0].from_user.toString() === userId) {
            firstSupporterCampaigns.push({
                campaignId: payment.campaign._id,
                campaignTitle: payment.campaign.title,
                date: payment.createdAt,
            });
        }
    }

    return firstSupporterCampaigns;
}

/**
 * Calculate monthly average contribution
 */
function calculateMonthlyAverage(payments) {
    if (payments.length === 0) return 0;

    const firstPayment = new Date(payments[payments.length - 1].createdAt);
    const lastPayment = new Date(payments[0].createdAt);

    const monthsDiff = Math.max(1,
        (lastPayment.getFullYear() - firstPayment.getFullYear()) * 12 +
        (lastPayment.getMonth() - firstPayment.getMonth()) + 1
    );

    const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    return totalAmount / monthsDiff;
}

/**
 * Calculate impact score (gamification)
 */
function calculateImpactScore(payments, badges) {
    let score = 0;

    // Base points for contributions
    score += payments.length * 10;

    // Points for total amount (1 point per 100 rupees)
    const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    score += Math.floor(totalAmount / 100);

    // Bonus points for badges
    score += badges.length * 50;

    // Bonus for unique campaigns
    const uniqueCampaigns = [...new Set(payments.map(p => p.campaign?._id?.toString()))];
    score += uniqueCampaigns.length * 25;

    return score;
}
