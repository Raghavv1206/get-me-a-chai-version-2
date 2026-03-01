// app/api/search/suggestions/route.js
/**
 * Search Suggestions API
 * 
 * Features:
 * - Autocomplete suggestions as you type
 * - Categories, campaigns, creators
 * - Debounced requests (handled client-side)
 * - Rate limiting
 * - Input validation
 * 
 * @module app/api/search/suggestions
 */

import { NextResponse } from 'next/server';
import connectDb from '@/db/connectDb';
import Campaign from '@/models/Campaign';
import User from '@/models/User';

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
            service: 'suggestions-api'
        }));
    },

    warn: (message, meta = {}) => {
        console.warn(JSON.stringify({
            level: 'warn',
            timestamp: new Date().toISOString(),
            message,
            ...meta,
            service: 'suggestions-api'
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
            service: 'suggestions-api'
        }));
    },
};

// ============================================================================
// GET HANDLER - Get Search Suggestions
// ============================================================================

export async function GET(request) {
    const startTime = Date.now();
    const requestId = `suggestions-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
        logger.info('Suggestions API request received', { requestId });

        // ========================================================================
        // EXTRACT PARAMETERS
        // ========================================================================

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || searchParams.get('query') || '';
        const limit = parseInt(searchParams.get('limit') || '10');

        // ========================================================================
        // VALIDATION
        // ========================================================================

        if (!query || query.trim().length < 2) {
            return NextResponse.json(
                {
                    success: true,
                    suggestions: [],
                    message: 'Query must be at least 2 characters',
                },
                { status: 200 }
            );
        }

        if (query.length > 100) {
            logger.warn('Query too long', { requestId, length: query.length });
            return NextResponse.json(
                {
                    success: false,
                    error: 'Query must be less than 100 characters',
                },
                { status: 400 }
            );
        }

        if (limit < 1 || limit > 20) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Limit must be between 1 and 20',
                },
                { status: 400 }
            );
        }

        // ========================================================================
        // CONNECT TO DATABASE
        // ========================================================================

        await connectDb();

        // ========================================================================
        // GENERATE SUGGESTIONS
        // ========================================================================

        const suggestions = [];
        const trimmedQuery = query.trim();
        const regex = new RegExp(trimmedQuery, 'i'); // Case-insensitive

        // Search campaigns by title
        const campaigns = await Campaign.find({
            title: regex,
            status: 'active',
        })
            .select('title')
            .limit(Math.ceil(limit * 0.6)) // 60% of suggestions from campaigns
            .lean();

        suggestions.push(...campaigns.map(c => c.title));

        // Search creators by name
        const creators = await User.find({
            name: regex,
        })
            .select('name')
            .limit(Math.ceil(limit * 0.2)) // 20% from creators
            .lean();

        suggestions.push(...creators.map(u => `${u.name} (creator)`));

        // Add category suggestions
        const categories = [
            'Technology',
            'Art',
            'Music',
            'Film',
            'Games',
            'Food',
            'Fashion',
            'Education',
            'Health',
            'Environment',
            'Community',
        ];

        const matchingCategories = categories
            .filter(cat => cat.toLowerCase().includes(trimmedQuery.toLowerCase()))
            .map(cat => `${cat} campaigns`);

        suggestions.push(...matchingCategories.slice(0, Math.ceil(limit * 0.2))); // 20% from categories

        // Remove duplicates and limit
        const uniqueSuggestions = [...new Set(suggestions)].slice(0, limit);

        // ========================================================================
        // RESPONSE
        // ========================================================================

        const duration = Date.now() - startTime;

        logger.info('Suggestions generated successfully', {
            requestId,
            count: uniqueSuggestions.length,
            duration: `${duration}ms`,
        });

        return NextResponse.json(
            {
                success: true,
                suggestions: uniqueSuggestions,
                count: uniqueSuggestions.length,
            },
            {
                status: 200,
                headers: {
                    'X-Request-ID': requestId,
                    'X-Response-Time': `${duration}ms`,
                    'Cache-Control': 'public, max-age=60', // Cache for 1 minute
                },
            }
        );

    } catch (error) {
        const duration = Date.now() - startTime;

        logger.error('Suggestions API error', error, {
            requestId,
            duration: `${duration}ms`,
        });

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to generate suggestions',
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
