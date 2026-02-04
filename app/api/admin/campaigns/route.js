// app/api/admin/campaigns/route.js
/**
 * Admin Campaigns API
 * Get campaigns for moderation
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

        // Fetch campaigns that need moderation
        const campaigns = await Campaign.find({
            $or: [
                { status: 'pending' },
                { flagged: true },
            ],
        })
            .populate('creator', 'name email')
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        return NextResponse.json({
            success: true,
            campaigns: campaigns.map(c => ({
                ...c,
                _id: c._id.toString(),
                creator: c.creator ? {
                    ...c.creator,
                    _id: c.creator._id.toString(),
                } : null,
            })),
        });

    } catch (error) {
        console.error('Admin campaigns error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch campaigns' },
            { status: 500 }
        );
    }
}
