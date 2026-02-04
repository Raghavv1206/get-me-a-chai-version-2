// app/api/admin/stats/route.js
/**
 * Admin Stats API
 * Get platform-wide statistics
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDb from '@/db/connectDb';
import User from '@/models/User';
import Campaign from '@/models/Campaign';
import Payment from '@/models/Payment';

export async function GET(request) {
    try {
        // Check admin auth
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json(
                { success: false, error: 'Not authenticated' },
                { status: 401 }
            );
        }

        await connectDb();

        const user = await User.findOne({ email: session.user.email });
        if (!user || !user.isAdmin) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized - Admin access required' },
                { status: 403 }
            );
        }

        // Get current month start
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        // Fetch stats
        const [
            totalUsers,
            totalCampaigns,
            totalPayments,
            verifiedUsers,
            activeCampaigns,
            pendingCampaigns,
            flaggedCampaigns,
            recentSignups,
            currentMonthUsers,
            lastMonthUsers,
            currentMonthCampaigns,
            lastMonthCampaigns,
            currentMonthRevenue,
            lastMonthRevenue,
        ] = await Promise.all([
            User.countDocuments(),
            Campaign.countDocuments(),
            Payment.countDocuments({ status: 'completed' }),
            User.countDocuments({ verified: true }),
            Campaign.countDocuments({ status: 'active' }),
            Campaign.countDocuments({ status: 'pending' }),
            Campaign.countDocuments({ flagged: true }),
            User.find().sort({ createdAt: -1 }).limit(10).lean(),
            User.countDocuments({ createdAt: { $gte: currentMonthStart } }),
            User.countDocuments({ createdAt: { $gte: lastMonthStart, $lt: currentMonthStart } }),
            Campaign.countDocuments({ createdAt: { $gte: currentMonthStart } }),
            Campaign.countDocuments({ createdAt: { $gte: lastMonthStart, $lt: currentMonthStart } }),
            Payment.aggregate([
                { $match: { status: 'completed', createdAt: { $gte: currentMonthStart } } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
            Payment.aggregate([
                { $match: { status: 'completed', createdAt: { $gte: lastMonthStart, $lt: currentMonthStart } } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
        ]);

        // Calculate total revenue
        const totalRevenueResult = await Payment.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);

        const totalRevenue = totalRevenueResult[0]?.total || 0;

        // Calculate active subscriptions
        const activeSubscriptions = await Payment.countDocuments({
            'subscription.status': 'active',
        });

        // Calculate growth percentages
        const userGrowth = lastMonthUsers > 0
            ? Math.round(((currentMonthUsers - lastMonthUsers) / lastMonthUsers) * 100)
            : 100;

        const campaignGrowth = lastMonthCampaigns > 0
            ? Math.round(((currentMonthCampaigns - lastMonthCampaigns) / lastMonthCampaigns) * 100)
            : 100;

        const currentRevenue = currentMonthRevenue[0]?.total || 0;
        const lastRevenue = lastMonthRevenue[0]?.total || 0;
        const revenueGrowth = lastRevenue > 0
            ? Math.round(((currentRevenue - lastRevenue) / lastRevenue) * 100)
            : 100;

        const stats = {
            totalUsers,
            totalCampaigns,
            totalRevenue,
            activeSubscriptions,
            verifiedUsers,
            activeCampaigns,
            pendingCampaigns,
            flaggedContent: flaggedCampaigns,
            userGrowth,
            campaignGrowth,
            revenueGrowth,
            subscriptionGrowth: 0, // TODO: Calculate subscription growth
            recentSignups: recentSignups.map(u => ({
                _id: u._id.toString(),
                name: u.name,
                email: u.email,
                createdAt: u.createdAt,
            })),
        };

        return NextResponse.json({
            success: true,
            stats,
        });

    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}
