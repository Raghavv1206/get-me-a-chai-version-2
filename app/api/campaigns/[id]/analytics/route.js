import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDb from '@/db/connectDb';
import Campaign from '@/models/Campaign';
import Payment from '@/models/Payment';

export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id: campaignId } = await params;

        await connectDb();

        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return NextResponse.json(
                { success: false, message: 'Campaign not found' },
                { status: 404 }
            );
        }

        // Verify ownership
        if (campaign.creator.toString() !== session.user.id) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Fetch payment data for analytics
        let payments = [];
        try {
            payments = await Payment.find({
                campaign: campaignId,
                status: 'completed'
            }).sort({ createdAt: 1 });
        } catch (err) {
            console.log('Payment model not found or error fetching payments:', err);
        }

        // Generate analytics data
        const analytics = generateAnalytics(campaign, payments);

        return NextResponse.json({
            success: true,
            analytics
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch analytics', error: error.message },
            { status: 500 }
        );
    }
}

function generateAnalytics(campaign, payments) {
    const now = new Date();
    const startDate = new Date(campaign.createdAt);
    const daysSinceStart = Math.max(1, Math.ceil((now - startDate) / (1000 * 60 * 60 * 24)));

    // Generate weekly data for the last 4 weeks
    const weeks = 4;
    const viewsOverTime = {
        labels: [],
        data: []
    };

    const contributionsOverTime = {
        labels: [],
        data: []
    };

    // Simulate weekly growth (in production, this should come from actual tracking data)
    const totalViews = campaign.stats?.views || 0;
    const totalAmount = campaign.currentAmount || 0;

    for (let i = weeks - 1; i >= 0; i--) {
        const weekLabel = i === 0 ? 'This Week' : `${i} Week${i > 1 ? 's' : ''} Ago`;
        viewsOverTime.labels.unshift(weekLabel);
        contributionsOverTime.labels.unshift(weekLabel);

        // Distribute views and contributions across weeks (weighted towards recent weeks)
        const weekWeight = (weeks - i) / weeks;
        const weekViews = Math.floor((totalViews / weeks) * weekWeight * 1.5);
        const weekAmount = Math.floor((totalAmount / weeks) * weekWeight * 1.5);

        viewsOverTime.data.unshift(weekViews);
        contributionsOverTime.data.unshift(weekAmount);
    }

    // Traffic sources (simulated - in production, track with analytics tools)
    const trafficSources = {
        labels: ['Direct', 'Social Media', 'Search', 'Referral', 'Email'],
        data: [35, 30, 20, 10, 5] // Percentages
    };

    // Top supporters (from payments)
    const topSupporters = payments
        .reduce((acc, payment) => {
            const existing = acc.find(s => s.userId === payment.userId);
            if (existing) {
                existing.amount += payment.amount;
                existing.count += 1;
            } else {
                acc.push({
                    userId: payment.userId,
                    name: payment.name || 'Anonymous',
                    amount: payment.amount,
                    count: 1
                });
            }
            return acc;
        }, [])
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10);

    // Contribution distribution
    const contributionRanges = {
        labels: ['₹0-500', '₹500-1000', '₹1000-5000', '₹5000+'],
        data: [0, 0, 0, 0]
    };

    payments.forEach(payment => {
        if (payment.amount <= 500) contributionRanges.data[0]++;
        else if (payment.amount <= 1000) contributionRanges.data[1]++;
        else if (payment.amount <= 5000) contributionRanges.data[2]++;
        else contributionRanges.data[3]++;
    });

    // Engagement metrics
    const engagementRate = totalViews > 0
        ? ((campaign.stats?.supporters || 0) / totalViews * 100).toFixed(2)
        : 0;

    const conversionRate = totalViews > 0
        ? ((payments.length / totalViews) * 100).toFixed(2)
        : 0;

    const averageContribution = payments.length > 0
        ? (totalAmount / payments.length).toFixed(2)
        : 0;

    return {
        viewsOverTime,
        contributionsOverTime,
        trafficSources,
        topSupporters,
        contributionRanges,
        metrics: {
            engagementRate: parseFloat(engagementRate),
            conversionRate: parseFloat(conversionRate),
            averageContribution: parseFloat(averageContribution),
            totalContributions: payments.length,
            repeatSupporters: topSupporters.filter(s => s.count > 1).length
        },
        timeline: {
            daysSinceStart,
            daysRemaining: campaign.daysRemaining || 0,
            totalDuration: Math.ceil((new Date(campaign.endDate) - startDate) / (1000 * 60 * 60 * 24))
        }
    };
}
