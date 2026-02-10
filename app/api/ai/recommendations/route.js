// app/api/ai/recommendations/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDb from '@/db/connectDb';
import Campaign from '@/models/Campaign';
import Payment from '@/models/Payment';
import { createLogger } from '@/lib/logger';
import { withRateLimit, rateLimiters } from '@/lib/rateLimit';
import mongoose from 'mongoose';

const logger = createLogger('RecommendationsAPI');

async function handleRecommendations(req) {
    const startTime = Date.now();

    try {
        logger.request('GET', '/api/ai/recommendations');

        const session = await getServerSession(authOptions);

        if (!session) {
            logger.warn('Unauthorized recommendations request');
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDb();
        const userId = session.user.id;

        // Validate and convert userId to ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            logger.error('Invalid user ID format', { userId });
            return NextResponse.json(
                {
                    error: 'Invalid user ID',
                    message: 'Please sign out and sign back in to refresh your session.'
                },
                { status: 400 }
            );
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);

        logger.info('Fetching recommendations', { userId });

        // Get user's past contributions (optimized - no populate)
        const userPayments = await Payment.find({ from_user: userObjectId })
            .select('to_campaign')
            .limit(20)
            .lean();

        // Get campaign IDs from payments
        const campaignIds = userPayments
            .map(p => p.to_campaign)
            .filter(Boolean);

        // Get categories from those campaigns (batch query)
        const contributedCampaigns = campaignIds.length > 0
            ? await Campaign.find({ _id: { $in: campaignIds } })
                .select('category')
                .lean()
            : [];

        const contributedCategories = [...new Set(
            contributedCampaigns.map(c => c.category).filter(Boolean)
        )];

        logger.debug('User contribution history', {
            userId,
            paymentCount: userPayments.length,
            categories: contributedCategories
        });

        // Get trending campaigns in user's interested categories
        let recommendations = [];

        if (contributedCategories.length > 0) {
            // Personalized recommendations based on past contributions
            recommendations = await Campaign.find({
                status: 'active',
                category: { $in: contributedCategories },
                creator: { $ne: userObjectId }, // Exclude user's own campaigns
            })
                .select('title category shortDescription story goalAmount currentAmount endDate coverImage stats featured creator username')
                .sort({ 'stats.views': -1, createdAt: -1 })
                .limit(10)
                .lean();

            logger.info('Personalized recommendations found', {
                userId,
                count: recommendations.length,
                categories: contributedCategories
            });
        } else {
            // For new users, show trending campaigns
            recommendations = await Campaign.find({
                status: 'active',
                creator: { $ne: userObjectId },
            })
                .select('title category shortDescription story goalAmount currentAmount endDate coverImage stats featured creator username')
                .sort({ 'stats.views': -1, featured: -1 })
                .limit(10)
                .lean();

            logger.info('Trending recommendations found', {
                userId,
                count: recommendations.length,
                reason: 'new_user'
            });
        }

        // Calculate match scores (simple algorithm)
        const recommendationsWithScores = recommendations.map(campaign => {
            let score = 50; // Base score

            // Boost score if category matches user's interests
            if (contributedCategories.includes(campaign.category)) {
                score += 30;
            }

            // Boost for featured campaigns
            if (campaign.featured) {
                score += 10;
            }

            // Boost for campaigns with high engagement
            if (campaign.stats?.views > 100) {
                score += 10;
            }

            return {
                ...campaign,
                matchScore: Math.min(score, 100),
                reason: contributedCategories.includes(campaign.category)
                    ? `Based on your interest in ${campaign.category}`
                    : 'Trending campaign',
            };
        });

        // Sort by match score
        recommendationsWithScores.sort((a, b) => b.matchScore - a.matchScore);

        const finalRecommendations = recommendationsWithScores.slice(0, 6);

        const duration = Date.now() - startTime;
        logger.response('GET', '/api/ai/recommendations', 200, duration);
        logger.metric('recommendations_fetch_time', duration, 'ms');

        return NextResponse.json({
            recommendations: finalRecommendations,
        });
    } catch (error) {
        const duration = Date.now() - startTime;
        logger.error('Recommendations error', {
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            duration
        });

        return NextResponse.json(
            {
                error: 'Failed to get recommendations',
                message: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

// Export with rate limiting
export const GET = withRateLimit(rateLimiters.api, handleRecommendations);
