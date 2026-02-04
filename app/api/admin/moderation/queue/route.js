// app/api/admin/moderation/queue/route.js
/**
 * Admin Moderation Queue API
 * Get items pending moderation review
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

        // Fetch items needing review
        const items = await Campaign.find({
            $or: [
                { flagged: true },
                { moderationScore: { $gte: 50, $lt: 90 } },
            ],
        })
            .populate('creator', 'name email')
            .sort({ moderationScore: -1, createdAt: -1 })
            .limit(50)
            .lean();

        return NextResponse.json({
            success: true,
            items: items.map(item => ({
                _id: item._id.toString(),
                title: item.title,
                description: item.description,
                type: 'campaign',
                riskScore: item.moderationScore || 0,
                scores: item.moderationScores || {},
                reasons: item.moderationReasons || [],
                flags: item.flags || [],
                flagCount: item.flagCount || 0,
                creator: item.creator ? {
                    _id: item.creator._id.toString(),
                    name: item.creator.name,
                    email: item.creator.email,
                } : null,
                createdAt: item.createdAt,
            })),
        });

    } catch (error) {
        console.error('Moderation queue error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch queue' },
            { status: 500 }
        );
    }
}
