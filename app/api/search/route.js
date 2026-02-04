// app/api/search/route.js
/**
 * Production-Ready AI-Powered Search API
 * 
 * Features:
 * - Natural language search
 * - AI intent analysis
 * - Rate limiting
 * - Structured logging
 * - Input validation
 * - CORS support
 * 
 * @module app/api/search
 */

import { NextResponse } from 'next/server';
import { searchCampaigns, trackSearch } from '@/actions/searchActions';

export const dynamic = 'force-dynamic';

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
            service: 'search-api'
        }));
    },

    warn: (message, meta = {}) => {
        console.warn(JSON.stringify({
            level: 'warn',
            timestamp: new Date().toISOString(),
            message,
            ...meta,
            service: 'search-api'
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
            service: 'search-api'
        }));
    },
};

// ============================================================================
// GET HANDLER - Search Campaigns
// ============================================================================

export async function GET(request) {
    const startTime = Date.now();
    const requestId = `search-api-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
        logger.info('Search API request received', { requestId });

        // ========================================================================
        // EXTRACT PARAMETERS
        // ========================================================================

        const { searchParams } = new URL(request.url);

        const query = searchParams.get('q') || searchParams.get('query') || '';
        const category = searchParams.get('category');
        const location = searchParams.get('location');
        const minGoal = searchParams.get('minGoal');
        const maxGoal = searchParams.get('maxGoal');
        const status = searchParams.get('status');
        const aiGenerated = searchParams.get('aiGenerated') === 'true';
        const featured = searchParams.get('featured') === 'true';
        const verified = searchParams.get('verified') === 'true';
        const hasVideo = searchParams.get('hasVideo') === 'true';
        const endingSoon = searchParams.get('endingSoon') === 'true';
        const sort = searchParams.get('sort') || 'trending';
        const page = searchParams.get('page') || '1';
        const limit = searchParams.get('limit') || '12';
        const userId = searchParams.get('userId');

        // ========================================================================
        // VALIDATION
        // ========================================================================

        if (!query || query.trim().length === 0) {
            logger.warn('Search query missing', { requestId });

            return NextResponse.json(
                {
                    success: false,
                    error: 'Search query is required',
                },
                { status: 400 }
            );
        }

        if (query.length > 200) {
            logger.warn('Search query too long', { requestId, length: query.length });

            return NextResponse.json(
                {
                    success: false,
                    error: 'Search query must be less than 200 characters',
                },
                { status: 400 }
            );
        }

        // ========================================================================
        // BUILD FILTERS
        // ========================================================================

        const filters = {};

        if (category) {
            filters.category = category.split(',').map(c => c.trim());
        }

        if (location) {
            filters.location = location;
        }

        if (minGoal) {
            filters.minGoal = parseFloat(minGoal);
        }

        if (maxGoal) {
            filters.maxGoal = parseFloat(maxGoal);
        }

        if (status) {
            filters.status = status;
        }

        if (aiGenerated) {
            filters.aiGenerated = true;
        }

        if (featured) {
            filters.featured = true;
        }

        if (verified) {
            filters.verified = true;
        }

        if (hasVideo) {
            filters.hasVideo = true;
        }

        if (endingSoon) {
            filters.endingSoon = true;
        }

        // ========================================================================
        // EXECUTE SEARCH
        // ========================================================================

        const searchParams_obj = {
            query,
            filters,
            sort,
            page: parseInt(page),
            limit: parseInt(limit),
            userId,
        };

        logger.info('Executing search', {
            requestId,
            query,
            filters,
            sort,
            page,
            limit,
        });

        const result = await searchCampaigns(searchParams_obj);

        // ========================================================================
        // TRACK SEARCH (ASYNC)
        // ========================================================================

        if (result.success && userId) {
            // Fire and forget
            trackSearch(userId, query).catch(error => {
                logger.error('Search tracking failed', error, { requestId });
            });
        }

        // ========================================================================
        // RESPONSE
        // ========================================================================

        const duration = Date.now() - startTime;

        if (result.success) {
            logger.info('Search completed successfully', {
                requestId,
                resultsCount: result.campaigns?.length || 0,
                total: result.total,
                duration: `${duration}ms`,
            });

            return NextResponse.json(
                {
                    success: true,
                    ...result,
                },
                {
                    status: 200,
                    headers: {
                        'X-Request-ID': requestId,
                        'X-Response-Time': `${duration}ms`,
                    },
                }
            );
        } else {
            logger.warn('Search completed with errors', {
                requestId,
                error: result.error,
                duration: `${duration}ms`,
            });

            return NextResponse.json(
                {
                    success: false,
                    error: result.error,
                    retryAfter: result.retryAfter,
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

        logger.error('Search API unexpected error', error, {
            requestId,
            duration: `${duration}ms`,
        });

        return NextResponse.json(
            {
                success: false,
                error: 'An unexpected error occurred. Please try again.',
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
// POST HANDLER - Advanced Search with Body
// ============================================================================

export async function POST(request) {
    const startTime = Date.now();
    const requestId = `search-api-post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
        logger.info('Search API POST request received', { requestId });

        // ========================================================================
        // PARSE BODY
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

        // ========================================================================
        // VALIDATION
        // ========================================================================

        if (!body.query || typeof body.query !== 'string') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Query is required and must be a string',
                },
                { status: 400 }
            );
        }

        // ========================================================================
        // EXECUTE SEARCH
        // ========================================================================

        const result = await searchCampaigns({
            query: body.query,
            filters: body.filters || {},
            sort: body.sort || 'trending',
            page: body.page || 1,
            limit: body.limit || 12,
            userId: body.userId,
        });

        // Track search
        if (result.success && body.userId) {
            trackSearch(body.userId, body.query).catch(error => {
                logger.error('Search tracking failed', error, { requestId });
            });
        }

        // ========================================================================
        // RESPONSE
        // ========================================================================

        const duration = Date.now() - startTime;

        if (result.success) {
            logger.info('Search POST completed successfully', {
                requestId,
                resultsCount: result.campaigns?.length || 0,
                duration: `${duration}ms`,
            });

            return NextResponse.json(
                {
                    success: true,
                    ...result,
                },
                {
                    headers: {
                        'X-Request-ID': requestId,
                        'X-Response-Time': `${duration}ms`,
                    },
                }
            );
        } else {
            return NextResponse.json(
                {
                    success: false,
                    error: result.error,
                    retryAfter: result.retryAfter,
                },
                {
                    status: result.retryAfter ? 429 : 500,
                    headers: {
                        'X-Request-ID': requestId,
                    },
                }
            );
        }

    } catch (error) {
        const duration = Date.now() - startTime;

        logger.error('Search POST API unexpected error', error, {
            requestId,
            duration: `${duration}ms`,
        });

        return NextResponse.json(
            {
                success: false,
                error: 'An unexpected error occurred',
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
// OPTIONS HANDLER - CORS
// ============================================================================

export async function OPTIONS() {
    return NextResponse.json(
        {},
        {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        }
    );
}
