// app/api/campaigns/trending/route.js
import { NextResponse } from 'next/server';
import connectDb from '@/db/connectDb';
import Campaign from '@/models/Campaign';
import { closeExpiredCampaigns } from '@/lib/campaignExpiry';

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        await connectDb();

        // Auto-close any expired campaigns before querying
        await closeExpiredCampaigns();

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '10');

        // Trending algorithm:
        // 1. Active campaigns only
        // 2. Calculate trending score based on:
        //    - Recent views (weight: 40%)
        //    - Funding velocity (weight: 30%)
        //    - Recent supporters (weight: 20%)
        //    - Featured status (weight: 10%)

        const campaigns = await Campaign.find({
            status: 'active',
            endDate: { $gte: new Date() }
        })
            .populate('creator', 'name username profilepic')
            .lean();

        // Calculate trending scores
        const campaignsWithScores = campaigns.map(campaign => {
            const now = new Date();
            const createdAt = new Date(campaign.createdAt);
            const daysOld = Math.max(1, (now - createdAt) / (1000 * 60 * 60 * 24));

            // Views score (normalized by age)
            const viewsScore = (campaign.stats?.views || 0) / daysOld;

            // Funding velocity (amount raised per day)
            const fundingVelocity = (campaign.currentAmount || 0) / daysOld;

            // Supporters score (normalized by age)
            const supportersScore = (campaign.stats?.supporters || 0) / daysOld;

            // Featured bonus
            const featuredBonus = campaign.featured ? 100 : 0;

            // Calculate weighted trending score
            const trendingScore =
                (viewsScore * 0.4) +
                (fundingVelocity * 0.3) +
                (supportersScore * 0.2) +
                (featuredBonus * 0.1);

            return {
                ...campaign,
                trendingScore
            };
        });

        // Sort by trending score and limit results
        const trendingCampaigns = campaignsWithScores
            .sort((a, b) => b.trendingScore - a.trendingScore)
            .slice(0, limit)
            .map(({ trendingScore, ...campaign }) => campaign); // Remove score from response

        return NextResponse.json({
            campaigns: trendingCampaigns,
            count: trendingCampaigns.length
        });
    } catch (error) {
        console.error('Trending campaigns API error:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch trending campaigns',
                campaigns: []
            },
            { status: 500 }
        );
    }
}

// Cache for 10 minutes
export const revalidate = 600;
