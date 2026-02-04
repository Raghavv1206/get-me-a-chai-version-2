// app/api/admin/moderation/stats/route.js
/**
 * Admin Moderation Stats API
 * Get AI moderation statistics
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDb from '@/db/connectDb';
import User from '@/models/User';
import Campaign from '@/models/Campaign';

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

        // Fetch moderation stats
        const [
            totalScanned,
            autoApproved,
            pendingReview,
            autoRejected,
            recentFlags,
        ] = await Promise.all([
            Campaign.countDocuments({ moderationScore: { $exists: true } }),
            Campaign.countDocuments({ moderationScore: { $lt: 50 }, status: 'active' }),
            Campaign.countDocuments({ moderationScore: { $gte: 50, $lt: 90 }, flagged: true }),
            Campaign.countDocuments({ moderationScore: { $gte: 90 }, status: 'rejected' }),
            Campaign.find({ flagged: true })
                .sort({ createdAt: -1 })
                .limit(10)
                .select('title description moderationScore moderationReasons flags createdAt')
                .lean(),
        ]);

        // Get category counts
        const categories = {
            inappropriate: await Campaign.countDocuments({ 'moderationScores.inappropriate': { $gte: 50 } }),
            spam: await Campaign.countDocuments({ 'moderationScores.spam': { $gte: 50 } }),
            scam: await Campaign.countDocuments({ 'moderationScores.scam': { $gte: 50 } }),
            prohibited: await Campaign.countDocuments({ 'moderationScores.prohibited': { $gte: 50 } }),
        };

        const stats = {
            totalScanned,
            autoApproved,
            pendingReview,
            autoRejected,
            categories,
            accuracyRate: 95, // TODO: Calculate from feedback
            falsePositiveRate: 5, // TODO: Calculate from feedback
            avgResponseTime: 150, // TODO: Calculate from logs
            recentFlags: recentFlags.map(f => ({
                _id: f._id.toString(),
                title: f.title,
                type: 'campaign',
                riskScore: f.moderationScore || 0,
                reasons: f.moderationReasons || [],
                flags: f.flags || [],
                createdAt: f.createdAt,
            })),
        };

        return NextResponse.json({
            success: true,
            stats,
        });

    } catch (error) {
        console.error('Moderation stats error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}
