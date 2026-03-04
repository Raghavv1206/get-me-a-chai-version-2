// app/api/notifications/mark-all-read/route.js
/**
 * POST /api/notifications/mark-all-read
 * Marks all notifications as read for the current user
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDb from '@/db/connectDb';
import Notification from '@/models/Notification';
import User from '@/models/User';

export async function POST() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDb();
        const user = await User.findOne({ email: session.user.email }).select('_id').lean();
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const result = await Notification.updateMany(
            { user: user._id, read: false },
            { $set: { read: true, readAt: new Date() } }
        );

        return NextResponse.json({ success: true, count: result.modifiedCount });
    } catch (error) {
        console.error('Mark-all-read error:', error);
        return NextResponse.json({ error: 'Failed to mark all as read' }, { status: 500 });
    }
}
