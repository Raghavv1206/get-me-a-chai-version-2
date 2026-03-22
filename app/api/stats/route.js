// app/api/stats/route.js
import { NextResponse } from 'next/server';
import connectDb from '@/db/connectDb';
import Campaign from '@/models/Campaign';
import Payment from '@/models/Payment';

// Cache stats response for 5 minutes at the CDN/edge level
export const revalidate = 300;

export async function GET() {
    try {
        await connectDb();

        // Run all DB queries in parallel to minimise latency
        const [totalRaisedResult, activeCampaigns, creatorsFunded, totalCampaigns, successfulCampaigns] =
            await Promise.all([
                Payment.aggregate([
                    { $match: { done: true, status: 'success' } },
                    { $group: { _id: null, total: { $sum: '$amount' } } }
                ]),
                Campaign.countDocuments({
                    status: 'active',
                    endDate: { $gte: new Date() }
                }),
                Payment.distinct('to_user', { done: true, status: 'success' }),
                Campaign.countDocuments(),
                Campaign.countDocuments({
                    $expr: { $gte: ['$currentAmount', '$goalAmount'] }
                }),
            ]);

        const totalRaised = totalRaisedResult[0]?.total ?? 0;
        const totalRaisedInLakhs = (totalRaised / 100000).toFixed(1);
        const successRate = totalCampaigns > 0
            ? Math.round((successfulCampaigns / totalCampaigns) * 100)
            : 0;

        const data = {
            totalRaised: parseFloat(totalRaisedInLakhs),
            activeCampaigns,
            creatorsFunded: creatorsFunded.length,
            successRate,
        };

        return NextResponse.json(data, {
            headers: {
                // Cache at CDN for 5 min, stale-while-revalidate for 10 min
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            },
        });
    } catch (error) {
        console.error('Stats API error:', error);
        return NextResponse.json(
            { totalRaised: 0, activeCampaigns: 0, creatorsFunded: 0, successRate: 0 },
            { status: 500 }
        );
    }
}
