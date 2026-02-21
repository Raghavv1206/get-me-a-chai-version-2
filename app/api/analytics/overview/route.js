import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDb from '@/db/connectDb';
import Campaign from '@/models/Campaign';
import Payment from '@/models/Payment';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDb();

        // Get all campaigns owned by this user
        const campaigns = await Campaign.find({ creator: session.user.id })
            .select('stats currentAmount goalAmount')
            .lean();

        if (!campaigns || campaigns.length === 0) {
            const emptyPeriod = {
                views: 0, viewsChange: 0,
                clicks: 0, clicksChange: 0,
                conversionRate: 0, conversionChange: 0,
                bounceRate: 0, bounceChange: 0,
            };
            return NextResponse.json({
                success: true,
                data: { '7': emptyPeriod, '30': emptyPeriod, '90': emptyPeriod, 'all': emptyPeriod }
            });
        }

        // Aggregate total views and supporters across all campaigns
        const totalViews = campaigns.reduce((sum, c) => sum + (c.stats?.views || 0), 0);
        const totalSupporters = campaigns.reduce((sum, c) => sum + (c.stats?.supporters || 0), 0);

        // Count actual payments for conversion rate
        const campaignIds = campaigns.map(c => c._id);
        const totalPayments = await Payment.countDocuments({
            campaign: { $in: campaignIds },
            status: 'completed',
        });

        const conversionRate = totalViews > 0 ? ((totalPayments / totalViews) * 100) : 0;

        // Build period data — for "all" we use real totals;
        // for time periods we estimate proportionally (real time-based tracking
        // would require timestamped view events — currently views are just a counter)
        const buildPeriodData = (fraction) => ({
            views: Math.round(totalViews * fraction),
            viewsChange: 0,
            clicks: Math.round(totalSupporters * fraction),
            clicksChange: 0,
            conversionRate: parseFloat(conversionRate.toFixed(1)),
            conversionChange: 0,
            bounceRate: 0,
            bounceChange: 0,
        });

        const data = {
            '7': buildPeriodData(7 / 90),
            '30': buildPeriodData(30 / 90),
            '90': buildPeriodData(1),
            'all': {
                views: totalViews,
                viewsChange: 0,
                clicks: totalSupporters,
                clicksChange: 0,
                conversionRate: parseFloat(conversionRate.toFixed(1)),
                conversionChange: 0,
                bounceRate: 0,
                bounceChange: 0,
            },
        };

        return NextResponse.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error fetching analytics overview:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch analytics', error: error.message },
            { status: 500 }
        );
    }
}
