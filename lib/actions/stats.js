// lib/actions/stats.js
'use server';

import connectDb from '@/db/connectDb';
import Campaign from '@/models/Campaign';
import Payment from '@/models/Payment';

const FALLBACK_STATS = {
    totalRaised: 0,
    activeCampaigns: 0,
    creatorsFunded: 0,
    successRate: 0,
};

/**
 * Get platform statistics — queries DB directly (no self-HTTP fetch).
 * Safe to call from Server Components and during static generation.
 */
export async function getStats() {
    try {
        await connectDb();

        const [totalRaisedResult, activeCampaigns, creatorsFunded, totalCampaigns, successfulCampaigns] =
            await Promise.all([
                Payment.aggregate([
                    { $match: { done: true, status: 'success' } },
                    { $group: { _id: null, total: { $sum: '$amount' } } },
                ]),
                Campaign.countDocuments({
                    status: 'active',
                    endDate: { $gte: new Date() },
                }),
                Payment.distinct('to_user', { done: true, status: 'success' }),
                Campaign.countDocuments(),
                Campaign.countDocuments({
                    $expr: { $gte: ['$currentAmount', '$goalAmount'] },
                }),
            ]);

        const totalRaised = totalRaisedResult[0]?.total ?? 0;
        const successRate = totalCampaigns > 0
            ? Math.round((successfulCampaigns / totalCampaigns) * 100)
            : 0;

        return {
            success: true,
            stats: {
                totalRaised: parseFloat((totalRaised / 100000).toFixed(1)),
                activeCampaigns,
                creatorsFunded: creatorsFunded.length,
                successRate,
            },
        };
    } catch (error) {
        console.error('Get stats error:', error.message);
        return { success: false, error: error.message, stats: FALLBACK_STATS };
    }
}

/**
 * Get trending campaigns — queries DB directly.
 * @param {number} limit - Number of campaigns to return
 */
export async function getTrendingCampaigns(limit = 10) {
    try {
        await connectDb();

        await import('@/lib/campaignExpiry').then(m => m.closeExpiredCampaigns()).catch(() => {});

        const campaigns = await Campaign.find({
            status: 'active',
            endDate: { $gte: new Date() },
        })
            .populate('creator', 'name username profilepic')
            .lean();

        const now = Date.now();
        const trendingCampaigns = campaigns
            .map(campaign => {
                const daysOld = Math.max(1, (now - new Date(campaign.createdAt)) / 86_400_000);
                const trendingScore =
                    ((campaign.stats?.views || 0) / daysOld) * 0.4 +
                    ((campaign.currentAmount || 0) / daysOld) * 0.3 +
                    ((campaign.stats?.supporters || 0) / daysOld) * 0.2 +
                    (campaign.featured ? 10 : 0) * 0.1;
                return { ...campaign, trendingScore };
            })
            .sort((a, b) => b.trendingScore - a.trendingScore)
            .slice(0, limit)
            .map(({ trendingScore, ...c }) => c);

        return { success: true, campaigns: trendingCampaigns };
    } catch (error) {
        console.error('Get trending campaigns error:', error.message);
        return { success: false, error: error.message, campaigns: [] };
    }
}

/**
 * Get campaign counts by category — queries DB directly.
 */
export async function getCategoryCounts() {
    try {
        await connectDb();

        const categoryCounts = await Campaign.aggregate([
            { $match: { status: { $in: ['active', 'successful'] } } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    totalRaised: { $sum: '$currentAmount' },
                    avgGoal: { $avg: '$goalAmount' },
                },
            },
            { $sort: { count: -1 } },
        ]);

        const counts = {};
        categoryCounts.forEach(cat => {
            counts[cat._id] = {
                count: cat.count,
                totalRaised: cat.totalRaised,
                avgGoal: Math.round(cat.avgGoal),
            };
        });

        return {
            success: true,
            counts,
            total: categoryCounts.reduce((sum, cat) => sum + cat.count, 0),
        };
    } catch (error) {
        console.error('Get category counts error:', error.message);
        return { success: false, error: error.message, counts: {} };
    }
}
