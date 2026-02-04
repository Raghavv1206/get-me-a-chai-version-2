// app/api/stats/route.js
import { NextResponse } from 'next/server';
import connectDb from '@/db/connectDb';
import Campaign from '@/models/Campaign';
import Payment from '@/models/Payment';
import User from '@/models/User';

export async function GET(req) {
    try {
        await connectDb();

        // Get total raised (sum of all successful payments)
        const totalRaisedResult = await Payment.aggregate([
            { $match: { done: true, status: 'success' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalRaised = totalRaisedResult[0]?.total || 0;
        const totalRaisedInLakhs = (totalRaised / 100000).toFixed(1); // Convert paise to lakhs

        // Get active campaigns count
        const activeCampaigns = await Campaign.countDocuments({
            status: 'active',
            endDate: { $gte: new Date() }
        });

        // Get creators funded (unique users who received payments)
        const creatorsFunded = await Payment.distinct('to_user', {
            done: true,
            status: 'success'
        });

        // Calculate success rate
        const totalCampaigns = await Campaign.countDocuments();
        const successfulCampaigns = await Campaign.countDocuments({
            $expr: { $gte: ['$currentAmount', '$goalAmount'] }
        });
        const successRate = totalCampaigns > 0
            ? Math.round((successfulCampaigns / totalCampaigns) * 100)
            : 0;

        return NextResponse.json({
            totalRaised: parseFloat(totalRaisedInLakhs),
            activeCampaigns,
            creatorsFunded: creatorsFunded.length,
            successRate
        });
    } catch (error) {
        console.error('Stats API error:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch stats',
                // Return default values on error
                totalRaised: 0,
                activeCampaigns: 0,
                creatorsFunded: 0,
                successRate: 0
            },
            { status: 500 }
        );
    }
}

// Optional: Cache stats for 5 minutes
export const revalidate = 300;
