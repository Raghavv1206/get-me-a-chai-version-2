// app/api/notifications/mark-read/route.js
/**
 * POST /api/notifications/mark-read
 * Body: { id: "notificationId" }
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDb from '@/db/connectDb';
import Notification from '@/models/Notification';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function POST(req) {
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

        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }
        const notificationId = body?.id || body?.notificationId;

        if (!notificationId) {
            return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
        }

        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
            return NextResponse.json({ error: 'Invalid notification ID' }, { status: 400 });
        }

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, user: user._id },
            { $set: { read: true, readAt: new Date() } },
            { new: true }
        );

        if (!notification) {
            return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Mark-read error:', error);
        return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
    }
}
