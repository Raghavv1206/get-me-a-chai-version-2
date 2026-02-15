// actions/searchActions.js
"use server"

/**
 * Production-Ready Search & Discovery Actions
 * 
 * Features:
 * - AI-powered natural language search
 * - Advanced filtering
 * - Search analytics tracking
 * - Structured logging
 * - Input validation
 * - Rate limiting
 * - Error boundaries
 * 
 * @module actions/searchActions
 */

import connectDb from '@/db/connectDb';
import Campaign from '@/models/Campaign';
import User from '@/models/User';
import Analytics from '@/models/Analytics';
import { generateDeepSeek } from '@/lib/ai/openrouter';

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
            service: 'search-actions'
        }));
    },

    warn: (message, meta = {}) => {
        console.warn(JSON.stringify({
            level: 'warn',
            timestamp: new Date().toISOString(),
            message,
            ...meta,
            service: 'search-actions'
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
            service: 'search-actions'
        }));
    },
};

// ============================================================================
// RATE LIMITING
// ============================================================================

class RateLimiter {
    constructor(maxRequests = 30, windowMs = 60000) {
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

const searchRateLimiter = new RateLimiter(30, 60000); // 30/min
const filterRateLimiter = new RateLimiter(60, 60000); // 60/min
const trackRateLimiter = new RateLimiter(100, 60000); // 100/min

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Sanitize search query
 */
function sanitizeQuery(query) {
    if (!query || typeof query !== 'string') return '';

    return query
        .trim()
        .substring(0, 200) // Max 200 chars
        .replace(/[<>]/g, ''); // Remove potential XSS
}

/**
 * Validate filter object
 */
function validateFilters(filters) {
    const errors = [];

    if (!filters || typeof filters !== 'object') {
        return { valid: true, filters: {}, errors: [] };
    }

    const validFilters = {};

    // Category validation
    if (filters.category) {
        if (Array.isArray(filters.category)) {
            validFilters.category = filters.category
                .filter(c => typeof c === 'string')
                .map(c => c.trim())
                .slice(0, 10); // Max 10 categories
        }
    }

    // Location validation
    if (filters.location && typeof filters.location === 'string') {
        validFilters.location = filters.location.trim().substring(0, 100);
    }

    // Goal range validation
    if (filters.minGoal !== undefined) {
        const min = Number(filters.minGoal);
        if (!isNaN(min) && min >= 0) {
            validFilters.minGoal = min;
        }
    }

    if (filters.maxGoal !== undefined) {
        const max = Number(filters.maxGoal);
        if (!isNaN(max) && max >= 0) {
            validFilters.maxGoal = max;
        }
    }

    // Status validation
    const validStatuses = ['active', 'completed', 'cancelled'];
    if (filters.status && validStatuses.includes(filters.status)) {
        validFilters.status = filters.status;
    }

    // Boolean filters
    if (filters.aiGenerated !== undefined) {
        validFilters.aiGenerated = Boolean(filters.aiGenerated);
    }

    if (filters.featured !== undefined) {
        validFilters.featured = Boolean(filters.featured);
    }

    if (filters.verified !== undefined) {
        validFilters.verified = Boolean(filters.verified);
    }

    if (filters.hasVideo !== undefined) {
        validFilters.hasVideo = Boolean(filters.hasVideo);
    }

    if (filters.endingSoon !== undefined) {
        validFilters.endingSoon = Boolean(filters.endingSoon);
    }

    return {
        valid: true,
        filters: validFilters,
        errors,
    };
}

/**
 * Validate sort option
 */
function validateSort(sort) {
    const validSorts = [
        'trending',
        'recent',
        'ending-soon',
        'most-funded',
        'least-funded',
        'alphabetical',
    ];

    if (!sort || !validSorts.includes(sort)) {
        return 'trending'; // Default
    }

    return sort;
}

/**
 * Validate pagination
 */
function validatePagination(page, limit) {
    const validPage = Math.max(1, parseInt(page) || 1);
    const validLimit = Math.min(50, Math.max(1, parseInt(limit) || 12));

    return { page: validPage, limit: validLimit };
}

// ============================================================================
// AI SEARCH HELPER
// ============================================================================

/**
 * Use AI to understand search intent and extract filters
 */
async function analyzeSearchIntent(query) {
    try {
        const prompt = `Analyze this crowdfunding search query and extract structured information:
Query: "${query}"

Extract:
1. Main search keywords (for title/description matching)
2. Category if mentioned (Technology, Art, Music, Film, Games, Food, Fashion, Education, Health, Environment, Community, Other)
3. Location if mentioned
4. Goal amount range if mentioned
5. Any special filters (AI-generated, featured, verified, has video, ending soon)

Respond in JSON format:
{
  "keywords": "extracted keywords",
  "category": "category or null",
  "location": "location or null",
  "minGoal": number or null,
  "maxGoal": number or null,
  "filters": {
    "aiGenerated": boolean,
    "featured": boolean,
    "verified": boolean,
    "hasVideo": boolean,
    "endingSoon": boolean
  }
}`;

        const response = await generateDeepSeek(prompt, {
            temperature: 0.3,
            maxTokens: 300,
        });

        const parsed = JSON.parse(response);

        return {
            keywords: parsed.keywords || query,
            category: parsed.category,
            location: parsed.location,
            minGoal: parsed.minGoal,
            maxGoal: parsed.maxGoal,
            filters: parsed.filters || {},
        };

    } catch (error) {
        logger.error('AI search intent analysis failed', error);

        // Fallback: use query as-is
        return {
            keywords: query,
            category: null,
            location: null,
            minGoal: null,
            maxGoal: null,
            filters: {},
        };
    }
}

// ============================================================================
// SEARCH IMPLEMENTATION
// ============================================================================

/**
 * AI-powered campaign search
 * 
 * @param {Object} params - Search parameters
 * @param {string} params.query - Search query
 * @param {Object} params.filters - Additional filters
 * @param {string} params.sort - Sort option
 * @param {number} params.page - Page number
 * @param {number} params.limit - Results per page
 * @param {string} params.userId - User ID for rate limiting
 * @returns {Promise<Object>} Search results
 */
export async function searchCampaigns(params) {
    const startTime = Date.now();
    const requestId = `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
        logger.info('Search campaigns started', { requestId, query: params.query });

        // ========================================================================
        // VALIDATION
        // ========================================================================

        const query = sanitizeQuery(params.query);

        if (!query) {
            return {
                success: false,
                error: 'Search query is required',
            };
        }

        // Rate limiting
        const rateLimitKey = params.userId || 'anonymous';
        const rateLimit = searchRateLimiter.check(rateLimitKey);

        if (!rateLimit.allowed) {
            logger.warn('Search rate limit exceeded', { requestId, userId: rateLimitKey });
            return {
                success: false,
                error: 'Rate limit exceeded. Please try again later.',
                retryAfter: rateLimit.retryAfter,
            };
        }

        // Validate filters
        const { filters: validFilters } = validateFilters(params.filters || {});

        // Validate sort
        const sort = validateSort(params.sort);

        // Validate pagination
        const { page, limit } = validatePagination(params.page, params.limit);

        // ========================================================================
        // AI SEARCH INTENT ANALYSIS
        // ========================================================================

        let searchIntent;

        try {
            searchIntent = await analyzeSearchIntent(query);
            logger.info('Search intent analyzed', { requestId, intent: searchIntent });
        } catch (aiError) {
            logger.error('AI analysis failed, using fallback', aiError, { requestId });
            searchIntent = {
                keywords: query,
                category: null,
                location: null,
                minGoal: null,
                maxGoal: null,
                filters: {},
            };
        }

        // ========================================================================
        // BUILD DATABASE QUERY
        // ========================================================================

        await connectDb();

        const dbQuery = {
            $and: [
                // Text search
                {
                    $or: [
                        { title: { $regex: searchIntent.keywords, $options: 'i' } },
                        { description: { $regex: searchIntent.keywords, $options: 'i' } },
                        { tags: { $in: [new RegExp(searchIntent.keywords, 'i')] } },
                    ],
                },
            ],
        };

        // Apply AI-extracted filters
        if (searchIntent.category) {
            dbQuery.$and.push({ category: searchIntent.category });
        }

        if (searchIntent.location) {
            dbQuery.$and.push({ location: { $regex: searchIntent.location, $options: 'i' } });
        }

        if (searchIntent.minGoal !== null) {
            dbQuery.$and.push({ goalAmount: { $gte: searchIntent.minGoal } });
        }

        if (searchIntent.maxGoal !== null) {
            dbQuery.$and.push({ goalAmount: { $lte: searchIntent.maxGoal } });
        }

        // Apply manual filters
        if (validFilters.category && validFilters.category.length > 0) {
            // Use case-insensitive regex for category matching
            dbQuery.$and.push({
                category: {
                    $in: validFilters.category.map(cat => new RegExp(`^${cat}$`, 'i'))
                }
            });
        }

        if (validFilters.location) {
            dbQuery.$and.push({ location: { $regex: validFilters.location, $options: 'i' } });
        }

        if (validFilters.minGoal !== undefined) {
            dbQuery.$and.push({ goalAmount: { $gte: validFilters.minGoal } });
        }

        if (validFilters.maxGoal !== undefined) {
            dbQuery.$and.push({ goalAmount: { $lte: validFilters.maxGoal } });
        }

        if (validFilters.status) {
            dbQuery.$and.push({ status: validFilters.status });
        }

        if (validFilters.aiGenerated) {
            dbQuery.$and.push({ aiGenerated: true });
        }

        if (validFilters.featured) {
            dbQuery.$and.push({ featured: true });
        }

        if (validFilters.hasVideo) {
            dbQuery.$and.push({ videoUrl: { $exists: true, $ne: null } });
        }

        if (validFilters.endingSoon) {
            const sevenDaysFromNow = new Date();
            sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
            dbQuery.$and.push({
                endDate: { $lte: sevenDaysFromNow, $gte: new Date() },
            });
        }

        // Verified creators filter
        if (validFilters.verified) {
            const verifiedUsers = await User.find({ verified: true }).select('_id');
            const verifiedUserIds = verifiedUsers.map(u => u._id);
            dbQuery.$and.push({ creator: { $in: verifiedUserIds } });
        }

        // ========================================================================
        // SORT OPTIONS
        // ========================================================================

        let sortQuery = {};

        switch (sort) {
            case 'recent':
                sortQuery = { createdAt: -1 };
                break;
            case 'ending-soon':
                sortQuery = { endDate: 1 };
                break;
            case 'most-funded':
                sortQuery = { currentAmount: -1 };
                break;
            case 'least-funded':
                sortQuery = { currentAmount: 1 };
                break;
            case 'alphabetical':
                sortQuery = { title: 1 };
                break;
            case 'trending':
            default:
                // Trending = combination of recent activity + funding
                sortQuery = { 'stats.views': -1, currentAmount: -1, createdAt: -1 };
                break;
        }

        // ========================================================================
        // EXECUTE QUERY
        // ========================================================================

        const skip = (page - 1) * limit;

        const [campaigns, total] = await Promise.all([
            Campaign.find(dbQuery)
                .sort(sortQuery)
                .skip(skip)
                .limit(limit)
                .populate('creator', 'name email profileImage verified')
                .lean(),
            Campaign.countDocuments(dbQuery),
        ]);

        const totalPages = Math.ceil(total / limit);
        const hasMore = page < totalPages;

        // ========================================================================
        // GENERATE SUGGESTIONS
        // ========================================================================

        const suggestions = await generateSearchSuggestions(query, campaigns);

        // ========================================================================
        // RESPONSE
        // ========================================================================

        const duration = Date.now() - startTime;

        logger.info('Search completed successfully', {
            requestId,
            query,
            resultsCount: campaigns.length,
            total,
            duration: `${duration}ms`,
        });

        // Map campaigns to include proper field names for frontend
        const mappedCampaigns = campaigns.map(campaign => ({
            ...campaign,
            creatorName: campaign.creator?.name || 'Anonymous',
            raisedAmount: campaign.currentAmount || 0,
            supportersCount: campaign.stats?.supporters || 0,
        }));

        return {
            success: true,
            campaigns: mappedCampaigns,
            total,
            page,
            totalPages,
            hasMore,
            suggestions,
            searchIntent,
            duration,
        };

    } catch (error) {
        const duration = Date.now() - startTime;

        logger.error('Search failed', error, {
            requestId,
            query: params.query,
            duration: `${duration}ms`,
        });

        return {
            success: false,
            error: 'Search failed. Please try again.',
            _debug: process.env.NODE_ENV === 'development' ? error.message : undefined,
        };
    }
}

// ============================================================================
// FILTER IMPLEMENTATION
// ============================================================================

/**
 * Filter campaigns with advanced options
 * 
 * @param {Object} params - Filter parameters
 * @returns {Promise<Object>} Filtered results
 */
export async function filterCampaigns(params) {
    const startTime = Date.now();
    const requestId = `filter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
        logger.info('Filter campaigns started', { requestId });

        // Rate limiting
        const rateLimitKey = params.userId || 'anonymous';
        const rateLimit = filterRateLimiter.check(rateLimitKey);

        if (!rateLimit.allowed) {
            return {
                success: false,
                error: 'Rate limit exceeded',
                retryAfter: rateLimit.retryAfter,
            };
        }

        // Validate inputs
        const { filters: validFilters } = validateFilters(params.filters || {});
        const sort = validateSort(params.sort);
        const { page, limit } = validatePagination(params.page, params.limit);

        // Build query (similar to search but without text search)
        await connectDb();

        const dbQuery = {};

        // Apply all filters (same logic as search)
        if (validFilters.category && validFilters.category.length > 0) {
            // Use case-insensitive regex for category matching
            dbQuery.category = {
                $in: validFilters.category.map(cat => new RegExp(`^${cat}$`, 'i'))
            };
        }

        if (validFilters.location) {
            dbQuery.location = { $regex: validFilters.location, $options: 'i' };
        }

        if (validFilters.minGoal !== undefined || validFilters.maxGoal !== undefined) {
            dbQuery.goalAmount = {};
            if (validFilters.minGoal !== undefined) {
                dbQuery.goalAmount.$gte = validFilters.minGoal;
            }
            if (validFilters.maxGoal !== undefined) {
                dbQuery.goalAmount.$lte = validFilters.maxGoal;
            }
        }

        if (validFilters.status) {
            dbQuery.status = validFilters.status;
        }

        if (validFilters.aiGenerated) {
            dbQuery.aiGenerated = true;
        }

        if (validFilters.featured) {
            dbQuery.featured = true;
        }

        if (validFilters.hasVideo) {
            dbQuery.videoUrl = { $exists: true, $ne: null };
        }

        if (validFilters.endingSoon) {
            const sevenDaysFromNow = new Date();
            sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
            dbQuery.endDate = { $lte: sevenDaysFromNow, $gte: new Date() };
        }

        if (validFilters.verified) {
            const verifiedUsers = await User.find({ verified: true }).select('_id');
            dbQuery.creator = { $in: verifiedUsers.map(u => u._id) };
        }

        // Sort
        let sortQuery = {};
        switch (sort) {
            case 'recent':
                sortQuery = { createdAt: -1 };
                break;
            case 'ending-soon':
                sortQuery = { endDate: 1 };
                break;
            case 'most-funded':
                sortQuery = { currentAmount: -1 };
                break;
            case 'least-funded':
                sortQuery = { currentAmount: 1 };
                break;
            case 'alphabetical':
                sortQuery = { title: 1 };
                break;
            default:
                sortQuery = { 'stats.views': -1, currentAmount: -1 };
        }

        // Execute
        const skip = (page - 1) * limit;

        const [campaigns, total] = await Promise.all([
            Campaign.find(dbQuery)
                .sort(sortQuery)
                .skip(skip)
                .limit(limit)
                .populate('creator', 'name email profileImage verified')
                .lean(),
            Campaign.countDocuments(dbQuery),
        ]);

        const duration = Date.now() - startTime;

        logger.info('Filter completed', {
            requestId,
            resultsCount: campaigns.length,
            duration: `${duration}ms`,
        });

        // Map campaigns to include proper field names for frontend
        const mappedCampaigns = campaigns.map(campaign => ({
            ...campaign,
            creatorName: campaign.creator?.name || 'Anonymous',
            raisedAmount: campaign.currentAmount || 0,
            supportersCount: campaign.stats?.supporters || 0,
        }));

        return {
            success: true,
            campaigns: mappedCampaigns,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            hasMore: page < Math.ceil(total / limit),
            duration,
        };

    } catch (error) {
        logger.error('Filter failed', error, { requestId });

        return {
            success: false,
            error: 'Filter failed. Please try again.',
        };
    }
}

// ============================================================================
// SEARCH TRACKING
// ============================================================================

/**
 * Track search query for analytics
 * 
 * @param {string} userId - User ID
 * @param {string} query - Search query
 * @returns {Promise<Object>} Tracking result
 */
export async function trackSearch(userId, query) {
    try {
        // Rate limiting
        const rateLimit = trackRateLimiter.check(userId || 'anonymous');
        if (!rateLimit.allowed) {
            return { success: false, error: 'Rate limit exceeded' };
        }

        const sanitizedQuery = sanitizeQuery(query);
        if (!sanitizedQuery) {
            return { success: false, error: 'Invalid query' };
        }

        await connectDb();

        await Analytics.create({
            eventType: 'search',
            userId: userId || null,
            metadata: {
                query: sanitizedQuery,
                timestamp: new Date(),
            },
        });

        return { success: true };

    } catch (error) {
        logger.error('Track search failed', error);
        return { success: false, error: 'Tracking failed' };
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate search suggestions based on query and results
 */
async function generateSearchSuggestions(query, campaigns) {
    try {
        // Extract unique categories from results
        const categories = [...new Set(campaigns.map(c => c.category))];

        // Extract unique locations
        const locations = [...new Set(campaigns.map(c => c.location).filter(Boolean))];

        // Generate suggestions
        const suggestions = [];

        // Add category suggestions
        categories.slice(0, 3).forEach(cat => {
            suggestions.push(`${query} in ${cat}`);
        });

        // Add location suggestions
        locations.slice(0, 2).forEach(loc => {
            suggestions.push(`${query} in ${loc}`);
        });

        return suggestions.slice(0, 5);

    } catch (error) {
        logger.error('Generate suggestions failed', error);
        return [];
    }
}
