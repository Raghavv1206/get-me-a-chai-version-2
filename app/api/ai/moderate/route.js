// app/api/ai/moderate/route.js
/**
 * AI Content Moderation API
 * 
 * Endpoint for AI-powered content moderation
 * Uses OpenRouter's DeepSeek model for advanced analysis
 */

import { NextResponse } from 'next/server';
import { moderateContent } from '@/actions/moderationActions';

export async function POST(request) {
    try {
        const body = await request.json();
        const { content, type, metadata } = body;

        // Validation
        if (!content) {
            return NextResponse.json(
                { success: false, error: 'Content is required' },
                { status: 400 }
            );
        }

        // Call moderation action
        const result = await moderateContent(content, type || 'campaign', metadata || {});

        if (!result.success) {
            return NextResponse.json(result, { status: 400 });
        }

        // If rate limited, return 429
        if (result.retryAfter) {
            return NextResponse.json(
                result,
                {
                    status: 429,
                    headers: {
                        'Retry-After': result.retryAfter.toString(),
                    },
                }
            );
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error('AI moderation API error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
                _debug: process.env.NODE_ENV === 'development' ? error.message : undefined,
            },
            { status: 500 }
        );
    }
}

// GET endpoint for testing
export async function GET(request) {
    return NextResponse.json({
        success: true,
        message: 'AI Moderation API is running',
        version: '1.0.0',
        endpoints: {
            POST: '/api/ai/moderate',
        },
        usage: {
            method: 'POST',
            body: {
                content: 'string (required)',
                type: 'string (optional): campaign, comment, update, description',
                metadata: 'object (optional): { userId, campaignId, etc. }',
            },
            response: {
                success: 'boolean',
                riskScore: 'number (0-100)',
                action: 'string: approve, review, reject',
                reasons: 'array of strings',
                scores: 'object: { inappropriate, spam, scam, prohibited }',
            },
        },
    });
}
