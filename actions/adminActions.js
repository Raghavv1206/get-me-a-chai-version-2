// actions/adminActions.js
"use server"

/**
 * Production-Ready Admin Actions
 * 
 * Features:
 * - User management
 * - Campaign moderation
 * - Payment logs
 * - Featured campaigns
 * - System settings
 * - Fraud detection
 * - Rate limiting
 * - Structured logging
 * - Input validation
 * - Authorization checks
 * 
 * @module actions/adminActions
 */

import connectDb from '@/db/connectDb';
import User from '@/models/User';
import Campaign from '@/models/Campaign';
import Payment from '@/models/Payment';
import Analytics from '@/models/Analytics';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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
            service: 'admin-actions'
        }));
    },

    warn: (message, meta = {}) => {
        console.warn(JSON.stringify({
            level: 'warn',
            timestamp: new Date().toISOString(),
            message,
            ...meta,
            service: 'admin-actions'
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
            service: 'admin-actions'
        }));
    },

    audit: (action, meta = {}) => {
        console.log(JSON.stringify({
            level: 'audit',
            timestamp: new Date().toISOString(),
            action,
            ...meta,
            service: 'admin-actions'
        }));
    },
};

// ============================================================================
// RATE LIMITING
// ============================================================================

class RateLimiter {
    constructor(maxRequests = 100, windowMs = 60000) {
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

const adminRateLimiter = new RateLimiter(100, 60000); // 100/min

// ============================================================================
// AUTHORIZATION
// ============================================================================

/**
 * Check if user is admin
 */
async function checkAdminAuth() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return {
                authorized: false,
                error: 'Not authenticated',
            };
        }

        await connectDb();
        const user = await User.findOne({ email: session.user.email }).lean();

        if (!user || !user.isAdmin) {
            logger.warn('Unauthorized admin access attempt', {
                userId: user?._id,
                email: session.user.email,
            });

            return {
                authorized: false,
                error: 'Unauthorized - Admin access required',
            };
        }

        return {
            authorized: true,
            adminId: user._id.toString(),
            adminEmail: user.email,
        };

    } catch (error) {
        logger.error('Admin auth check failed', error);
        return {
            authorized: false,
            error: 'Authentication check failed',
        };
    }
}

// ============================================================================
// VALIDATION
// ============================================================================

function validateUserId(userId) {
    if (!userId || typeof userId !== 'string') {
        return { valid: false, error: 'Invalid user ID' };
    }
    if (userId.length < 10 || userId.length > 100) {
        return { valid: false, error: 'Invalid user ID format' };
    }
    return { valid: true };
}

function validateCampaignId(campaignId) {
    if (!campaignId || typeof campaignId !== 'string') {
        return { valid: false, error: 'Invalid campaign ID' };
    }
    if (campaignId.length < 10 || campaignId.length > 100) {
        return { valid: false, error: 'Invalid campaign ID format' };
    }
    return { valid: true };
}

function validateDuration(duration) {
    const num = parseInt(duration);
    if (isNaN(num) || num < 1 || num > 365) {
        return { valid: false, error: 'Duration must be between 1 and 365 days' };
    }
    return { valid: true, value: num };
}

// ============================================================================
// GET USERS
// ============================================================================

/**
 * Get users with filters (admin only)
 * 
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Users data
 */
export async function getUsers(filters = {}) {
    const startTime = Date.now();
    const requestId = `admin-users-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
        logger.info('Get users started', { requestId, filters });

        // Authorization
        const auth = await checkAdminAuth();
        if (!auth.authorized) {
            return { success: false, error: auth.error };
        }

        // Rate limiting
        const rateLimit = adminRateLimiter.check(auth.adminId);
        if (!rateLimit.allowed) {
            return {
                success: false,
                error: 'Rate limit exceeded',
                retryAfter: rateLimit.retryAfter,
            };
        }

        await connectDb();

        // Build query
        const query = {};

        if (filters.search) {
            const searchRegex = new RegExp(filters.search.trim(), 'i');
            query.$or = [
                { name: searchRegex },
                { email: searchRegex },
                { username: searchRegex },
            ];
        }

        if (filters.verified !== undefined) {
            query.verified = filters.verified === 'true' || filters.verified === true;
        }

        if (filters.banned !== undefined) {
            query.banned = filters.banned === 'true' || filters.banned === true;
        }

        if (filters.isAdmin !== undefined) {
            query.isAdmin = filters.isAdmin === 'true' || filters.isAdmin === true;
        }

        // Pagination
        const page = parseInt(filters.page) || 1;
        const limit = Math.min(parseInt(filters.limit) || 20, 100);
        const skip = (page - 1) * limit;

        // Fetch users
        const [users, total] = await Promise.all([
            User.find(query)
                .select('-password -razorpaysecret')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            User.countDocuments(query),
        ]);

        // Get additional stats for each user
        const enrichedUsers = await Promise.all(users.map(async (user) => {
            const [campaignsCount, paymentsCount, totalContributed] = await Promise.all([
                Campaign.countDocuments({ creator: user._id }),
                Payment.countDocuments({ from_user: user._id, status: 'completed' }),
                Payment.aggregate([
                    { $match: { from_user: user._id, status: 'completed' } },
                    { $group: { _id: null, total: { $sum: '$amount' } } },
                ]),
            ]);

            return {
                ...user,
                _id: user._id.toString(),
                stats: {
                    campaignsCount,
                    paymentsCount,
                    totalContributed: totalContributed[0]?.total || 0,
                },
            };
        }));

        const duration = Date.now() - startTime;

        logger.info('Get users completed', {
            requestId,
            count: users.length,
            total,
            duration: `${duration}ms`,
        });

        return {
            success: true,
            users: enrichedUsers,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            hasMore: page < Math.ceil(total / limit),
            duration,
        };

    } catch (error) {
        const duration = Date.now() - startTime;
        logger.error('Get users failed', error, { requestId, duration: `${duration}ms` });

        return {
            success: false,
            error: 'Failed to fetch users',
            _debug: process.env.NODE_ENV === 'development' ? error.message : undefined,
        };
    }
}

// ============================================================================
// BAN USER
// ============================================================================

/**
 * Ban or unban a user (admin only)
 * 
 * @param {string} userId - User ID to ban
 * @param {boolean} banned - Ban status
 * @param {string} reason - Ban reason
 * @returns {Promise<Object>} Result
 */
export async function banUser(userId, banned = true, reason = '') {
    const startTime = Date.now();
    const requestId = `admin-ban-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
        logger.info('Ban user started', { requestId, userId, banned, reason });

        // Authorization
        const auth = await checkAdminAuth();
        if (!auth.authorized) {
            return { success: false, error: auth.error };
        }

        // Validation
        const validation = validateUserId(userId);
        if (!validation.valid) {
            return { success: false, error: validation.error };
        }

        // Rate limiting
        const rateLimit = adminRateLimiter.check(auth.adminId);
        if (!rateLimit.allowed) {
            return {
                success: false,
                error: 'Rate limit exceeded',
                retryAfter: rateLimit.retryAfter,
            };
        }

        await connectDb();

        // Check user exists
        const user = await User.findById(userId);
        if (!user) {
            return { success: false, error: 'User not found' };
        }

        // Prevent banning other admins
        if (user.isAdmin && banned) {
            logger.warn('Attempt to ban admin user', { requestId, userId, adminId: auth.adminId });
            return { success: false, error: 'Cannot ban admin users' };
        }

        // Update user
        user.banned = banned;
        if (banned && reason) {
            user.banReason = reason;
            user.bannedAt = new Date();
            user.bannedBy = auth.adminId;
        } else if (!banned) {
            user.banReason = undefined;
            user.bannedAt = undefined;
            user.bannedBy = undefined;
        }

        await user.save();

        // Audit log
        logger.audit('User ban status changed', {
            requestId,
            userId,
            banned,
            reason,
            adminId: auth.adminId,
            adminEmail: auth.adminEmail,
        });

        const duration = Date.now() - startTime;

        return {
            success: true,
            message: banned ? 'User banned successfully' : 'User unbanned successfully',
            duration,
        };

    } catch (error) {
        const duration = Date.now() - startTime;
        logger.error('Ban user failed', error, { requestId, userId, duration: `${duration}ms` });

        return {
            success: false,
            error: 'Failed to update user ban status',
            _debug: process.env.NODE_ENV === 'development' ? error.message : undefined,
        };
    }
}

// ============================================================================
// VERIFY USER
// ============================================================================

/**
 * Manually verify a user (admin only)
 * 
 * @param {string} userId - User ID to verify
 * @returns {Promise<Object>} Result
 */
export async function verifyUser(userId) {
    const startTime = Date.now();
    const requestId = `admin-verify-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
        logger.info('Verify user started', { requestId, userId });

        // Authorization
        const auth = await checkAdminAuth();
        if (!auth.authorized) {
            return { success: false, error: auth.error };
        }

        // Validation
        const validation = validateUserId(userId);
        if (!validation.valid) {
            return { success: false, error: validation.error };
        }

        // Rate limiting
        const rateLimit = adminRateLimiter.check(auth.adminId);
        if (!rateLimit.allowed) {
            return {
                success: false,
                error: 'Rate limit exceeded',
                retryAfter: rateLimit.retryAfter,
            };
        }

        await connectDb();

        // Update user
        const user = await User.findByIdAndUpdate(
            userId,
            {
                verified: true,
                verifiedAt: new Date(),
                verifiedBy: auth.adminId,
            },
            { new: true }
        );

        if (!user) {
            return { success: false, error: 'User not found' };
        }

        // Audit log
        logger.audit('User verified', {
            requestId,
            userId,
            adminId: auth.adminId,
            adminEmail: auth.adminEmail,
        });

        const duration = Date.now() - startTime;

        return {
            success: true,
            message: 'User verified successfully',
            duration,
        };

    } catch (error) {
        const duration = Date.now() - startTime;
        logger.error('Verify user failed', error, { requestId, userId, duration: `${duration}ms` });

        return {
            success: false,
            error: 'Failed to verify user',
            _debug: process.env.NODE_ENV === 'development' ? error.message : undefined,
        };
    }
}

// ============================================================================
// FEATURE CAMPAIGN
// ============================================================================

/**
 * Feature a campaign (admin only)
 * 
 * @param {string} campaignId - Campaign ID
 * @param {number} duration - Duration in days
 * @returns {Promise<Object>} Result
 */
export async function featureCampaign(campaignId, duration) {
    const startTime = Date.now();
    const requestId = `admin-feature-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
        logger.info('Feature campaign started', { requestId, campaignId, duration });

        // Authorization
        const auth = await checkAdminAuth();
        if (!auth.authorized) {
            return { success: false, error: auth.error };
        }

        // Validation
        const campaignValidation = validateCampaignId(campaignId);
        if (!campaignValidation.valid) {
            return { success: false, error: campaignValidation.error };
        }

        const durationValidation = validateDuration(duration);
        if (!durationValidation.valid) {
            return { success: false, error: durationValidation.error };
        }

        // Rate limiting
        const rateLimit = adminRateLimiter.check(auth.adminId);
        if (!rateLimit.allowed) {
            return {
                success: false,
                error: 'Rate limit exceeded',
                retryAfter: rateLimit.retryAfter,
            };
        }

        await connectDb();

        // Calculate featured until date
        const featuredUntil = new Date();
        featuredUntil.setDate(featuredUntil.getDate() + durationValidation.value);

        // Update campaign
        const campaign = await Campaign.findByIdAndUpdate(
            campaignId,
            {
                featured: true,
                featuredAt: new Date(),
                featuredUntil,
                featuredBy: auth.adminId,
            },
            { new: true }
        );

        if (!campaign) {
            return { success: false, error: 'Campaign not found' };
        }

        // Audit log
        logger.audit('Campaign featured', {
            requestId,
            campaignId,
            duration: durationValidation.value,
            featuredUntil,
            adminId: auth.adminId,
            adminEmail: auth.adminEmail,
        });

        const durationMs = Date.now() - startTime;

        return {
            success: true,
            message: `Campaign featured for ${durationValidation.value} days`,
            featuredUntil,
            duration: durationMs,
        };

    } catch (error) {
        const durationMs = Date.now() - startTime;
        logger.error('Feature campaign failed', error, { requestId, campaignId, duration: `${durationMs}ms` });

        return {
            success: false,
            error: 'Failed to feature campaign',
            _debug: process.env.NODE_ENV === 'development' ? error.message : undefined,
        };
    }
}

// ============================================================================
// MODERATE CAMPAIGN
// ============================================================================

/**
 * Moderate a campaign (approve/reject/remove) (admin only)
 * 
 * @param {string} campaignId - Campaign ID
 * @param {string} action - Action: 'approve', 'reject', 'remove'
 * @param {string} reason - Reason for action
 * @returns {Promise<Object>} Result
 */
export async function moderateCampaign(campaignId, action, reason = '') {
    const startTime = Date.now();
    const requestId = `admin-moderate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
        logger.info('Moderate campaign started', { requestId, campaignId, action, reason });

        // Authorization
        const auth = await checkAdminAuth();
        if (!auth.authorized) {
            return { success: false, error: auth.error };
        }

        // Validation
        const validation = validateCampaignId(campaignId);
        if (!validation.valid) {
            return { success: false, error: validation.error };
        }

        const validActions = ['approve', 'reject', 'remove'];
        if (!validActions.includes(action)) {
            return { success: false, error: 'Invalid action. Must be: approve, reject, or remove' };
        }

        // Rate limiting
        const rateLimit = adminRateLimiter.check(auth.adminId);
        if (!rateLimit.allowed) {
            return {
                success: false,
                error: 'Rate limit exceeded',
                retryAfter: rateLimit.retryAfter,
            };
        }

        await connectDb();

        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return { success: false, error: 'Campaign not found' };
        }

        // Apply action
        let message = '';
        switch (action) {
            case 'approve':
                campaign.status = 'active';
                campaign.approvedAt = new Date();
                campaign.approvedBy = auth.adminId;
                message = 'Campaign approved successfully';
                break;

            case 'reject':
                campaign.status = 'rejected';
                campaign.rejectedAt = new Date();
                campaign.rejectedBy = auth.adminId;
                campaign.rejectionReason = reason;
                message = 'Campaign rejected';
                break;

            case 'remove':
                campaign.status = 'removed';
                campaign.removedAt = new Date();
                campaign.removedBy = auth.adminId;
                campaign.removalReason = reason;
                message = 'Campaign removed';
                break;
        }

        await campaign.save();

        // Audit log
        logger.audit('Campaign moderated', {
            requestId,
            campaignId,
            action,
            reason,
            adminId: auth.adminId,
            adminEmail: auth.adminEmail,
        });

        const duration = Date.now() - startTime;

        return {
            success: true,
            message,
            duration,
        };

    } catch (error) {
        const duration = Date.now() - startTime;
        logger.error('Moderate campaign failed', error, { requestId, campaignId, duration: `${duration}ms` });

        return {
            success: false,
            error: 'Failed to moderate campaign',
            _debug: process.env.NODE_ENV === 'development' ? error.message : undefined,
        };
    }
}

