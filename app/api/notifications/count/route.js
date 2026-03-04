// app/api/notifications/count/route.js
/**
 * GET /api/notifications/count
 * Returns unread notification count for the current user
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDb from '@/db/connectDb';
import Notification from '@/models/Notification';
import User from '@/models/User';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, count: 0 });
        }

        await connectDb();
        const user = await User.findOne({ email: session.user.email }).select('_id').lean();
        if (!user) {
            return NextResponse.json({ success: false, count: 0 });
        }

        const count = await Notification.countDocuments({
            user: user._id,
            read: false,
        });

        return NextResponse.json({ success: true, count });
    } catch (error) {
        console.error('Notification count error:', error);
        return NextResponse.json({ success: false, count: 0 });
    }
}
