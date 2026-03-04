// app/api/notifications/list/route.js
/**
 * GET /api/notifications/list?limit=5
 * Returns recent notifications for the dropdown bell
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDb from '@/db/connectDb';
import Notification from '@/models/Notification';
import User from '@/models/User';

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, notifications: [] });
        }

        await connectDb();
        const user = await User.findOne({ email: session.user.email }).select('_id').lean();
        if (!user) {
            return NextResponse.json({ success: false, notifications: [] });
        }

        const { searchParams } = new URL(req.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '5', 10), 20);

        const notifications = await Notification.find({ user: user._id })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        const serialized = notifications.map(n => ({
            _id: n._id.toString(),
            type: n.type,
            title: n.title,
            message: n.message,
            link: n.link || null,
            read: n.read,
            createdAt: n.createdAt?.toISOString?.() || n.createdAt,
        }));

        return NextResponse.json({ success: true, notifications: serialized });
    } catch (error) {
        console.error('Notification list error:', error);
        return NextResponse.json({ success: false, notifications: [] });
    }
}
