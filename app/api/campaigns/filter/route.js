// app/api/campaigns/filter/route.js
/**
 * Production-Ready Campaign Filter API
 * 
 * Features:
 * - Advanced filtering
 * - Multiple filter options
 * - Rate limiting
 * - Structured logging
 * - Input validation
 * 
 * @module app/api/campaigns/filter
 */

import { NextResponse } from 'next/server';
import { filterCampaigns } from '@/actions/searchActions';

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
            service: 'filter-api'
        }));
    },

    warn: (message, meta = {}) => {
        console.warn(JSON.stringify({
            level: 'warn',
            timestamp: new Date().toISOString(),
            message,
            ...meta,
            service: 'filter-api'
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
            service: 'filter-api'
        }));
    },
};

// ============================================================================
// GET HANDLER - Filter Campaigns
// ============================================================================

export async function GET(request) {
    const startTime = Date.now();
    const requestId = `filter-api-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
        logger.info('Filter API request received', { requestId });

        // ========================================================================
        // EXTRACT PARAMETERS
        // ========================================================================

        const { searchParams } = new URL(request.url);

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
            if (isNaN(filters.minGoal) || filters.minGoal < 0) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Invalid minGoal value',
                    },
                    { status: 400 }
                );
            }
        }

        if (maxGoal) {
            filters.maxGoal = parseFloat(maxGoal);
            if (isNaN(filters.maxGoal) || filters.maxGoal < 0) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Invalid maxGoal value',
                    },
                    { status: 400 }
                );
            }
        }

        if (status) {
            const validStatuses = ['active', 'completed', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return NextResponse.json(
                    {
                        success: false,
                        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
                    },
                    { status: 400 }
                );
            }
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
        // EXECUTE FILTER
        // ========================================================================

        logger.info('Executing filter', {
            requestId,
            filters,
            sort,
            page,
            limit,
        });

        const result = await filterCampaigns({
            filters,
            sort,
            page: parseInt(page),
            limit: parseInt(limit),
            userId,
        });

        // ========================================================================
        // RESPONSE
        // ========================================================================

        const duration = Date.now() - startTime;

        if (result.success) {
            logger.info('Filter completed successfully', {
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
            logger.warn('Filter completed with errors', {
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

        logger.error('Filter API unexpected error', error, {
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
// POST HANDLER - Advanced Filter with Body
// ============================================================================

export async function POST(request) {
    const startTime = Date.now();
    const requestId = `filter-api-post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
        logger.info('Filter API POST request received', { requestId });

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
        // EXECUTE FILTER
        // ========================================================================

        const result = await filterCampaigns({
            filters: body.filters || {},
            sort: body.sort || 'trending',
            page: body.page || 1,
            limit: body.limit || 12,
            userId: body.userId,
        });

        // ========================================================================
        // RESPONSE
        // ========================================================================

        const duration = Date.now() - startTime;

        if (result.success) {
            logger.info('Filter POST completed successfully', {
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

        logger.error('Filter POST API unexpected error', error, {
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
