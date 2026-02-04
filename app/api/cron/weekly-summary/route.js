// app/api/cron/weekly-summary/route.js
/**
 * Weekly Summary Cron Job
 * Runs every Monday at 9 AM to send weekly summaries to all creators
 * 
 * Vercel Cron Configuration (add to vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/weekly-summary",
 *     "schedule": "0 9 * * 1"
 *   }]
 * }
 */

import { NextResponse } from 'next/server';
import connectDb from '@/db/connectDb';
import User from '@/models/User';
import Campaign from '@/models/Campaign';
import Payment from '@/models/Payment';
import Analytics from '@/models/Analytics';
import { sendBulkWeeklySummaries } from '@/actions/emailActions';
import { generateDeepSeek } from '@/lib/ai/openrouter';

export async function GET(request) {
    try {
        // Verify cron secret (security)
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDb();

        // Get all creators (users with campaigns)
        const creators = await User.find({}).lean();

        const summaries = [];
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        for (const creator of creators) {
            // Get creator's campaigns
            const campaigns = await Campaign.find({ creator: creator._id }).lean();

            if (campaigns.length === 0) continue; // Skip if no campaigns

            // Calculate weekly earnings
            const weeklyPayments = await Payment.find({
                to_user: creator._id,
                createdAt: { $gte: oneWeekAgo }
            }).lean();

            const weeklyEarnings = weeklyPayments.reduce((sum, p) => sum + p.amount, 0);
            const newSupporters = weeklyPayments.length;

            // Get analytics
            const weeklyAnalytics = await Analytics.find({
                campaign: { $in: campaigns.map(c => c._id) },
                timestamp: { $gte: oneWeekAgo }
            }).lean();

            const totalViews = weeklyAnalytics.filter(a => a.eventType === 'visit').length;
            const totalConversions = weeklyAnalytics.filter(a => a.eventType === 'conversion').length;
            const conversionRate = totalViews > 0 ? (totalConversions / totalViews) * 100 : 0;

            // Get top campaigns
            const topCampaigns = campaigns
                .sort((a, b) => (b.raised || 0) - (a.raised || 0))
                .slice(0, 3)
                .map(c => ({
                    title: c.title,
                    raised: c.raised || 0,
                    supporters: c.supportersCount || 0
                }));

            // Get recent payments
            const recentPayments = weeklyPayments
                .slice(0, 5)
                .map(p => ({
                    name: p.name,
                    amount: p.amount,
                    campaign: campaigns.find(c => c._id.toString() === p.campaign?.toString())?.title || 'Unknown',
                    date: p.createdAt
                }));

            // Generate AI tips
            let tips = [];
            try {
                const tipsPrompt = `Generate 3 actionable tips for a crowdfunding creator based on their weekly performance:
- Weekly earnings: ₹${weeklyEarnings}
- New supporters: ${newSupporters}
- Total views: ${totalViews}
- Conversion rate: ${conversionRate.toFixed(1)}%

Provide specific, actionable advice in a JSON array format: ["tip1", "tip2", "tip3"]`;

                const tipsResponse = await generateDeepSeek(tipsPrompt, {
                    temperature: 0.7,
                    maxTokens: 300
                });

                tips = JSON.parse(tipsResponse);
            } catch (error) {
                console.error('Failed to generate tips:', error);
                tips = [
                    'Post regular updates to keep supporters engaged',
                    'Share your campaign on social media daily',
                    'Respond to comments and messages promptly'
                ];
            }

            summaries.push({
                email: creator.email,
                name: creator.name,
                weeklyEarnings,
                newSupporters,
                totalViews,
                conversionRate,
                topCampaigns,
                recentPayments,
                tips,
                userId: creator._id.toString()
            });
        }

        // Send bulk weekly summaries
        const result = await sendBulkWeeklySummaries(summaries);

        return NextResponse.json({
            success: true,
            message: 'Weekly summaries sent',
            totalCreators: summaries.length,
            results: result.results
        });

    } catch (error) {
        console.error('Weekly summary cron error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to send weekly summaries' },
            { status: 500 }
        );
    }
}
