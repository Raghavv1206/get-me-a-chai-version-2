// app/api/notifications/route.js
/**
 * Notifications API
 * GET  - Fetch notifications (supports ?limit=N and ?type=T query params)
 * POST - Mark read / mark all read / delete
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDb from '@/db/connectDb';
import Notification from '@/models/Notification';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function GET(req) {
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

        const { searchParams } = new URL(req.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
        const type = searchParams.get('type');
        const readFilter = searchParams.get('read'); // 'true' or 'false'

        // Build query
        const query = { user: user._id };
        if (type) query.type = type;
        if (readFilter === 'true') query.read = true;
        else if (readFilter === 'false') query.read = false;

        // Fetch notifications
        const [notifications, unreadCount] = await Promise.all([
            Notification.find(query)
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean(),
            Notification.countDocuments({ user: user._id, read: false }),
        ]);

        // Serialize ObjectIds for the client
        const serialized = notifications.map(n => ({
            _id: n._id.toString(),
            type: n.type,
            title: n.title,
            message: n.message,
            link: n.link || null,
            read: n.read,
            metadata: n.metadata || {},
            createdAt: n.createdAt?.toISOString?.() || n.createdAt,
            readAt: n.readAt?.toISOString?.() || null,
        }));

        return NextResponse.json({
            success: true,
            notifications: serialized,
            unreadCount,
            count: unreadCount, // alias for compatibility
            total: serialized.length,
        });
    } catch (error) {
        console.error('Notifications GET error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch notifications' },
            { status: 500 }
        );
    }
}

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

        const { action, notificationId, id } = body || {};
        const nId = notificationId || id; // Support both field names

        // Validate ObjectId if provided
        if (nId && !mongoose.Types.ObjectId.isValid(nId)) {
            return NextResponse.json({ error: 'Invalid notification ID' }, { status: 400 });
        }

        // Mark single notification as read
        if (action === 'mark-read' && nId) {
            const notification = await Notification.findOneAndUpdate(
                { _id: nId, user: user._id },
                { $set: { read: true, readAt: new Date() } },
                { new: true }
            );

            if (!notification) {
                return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
            }

            return NextResponse.json({ success: true });
        }

        // Mark all as read
        if (action === 'mark-all-read') {
            const result = await Notification.updateMany(
                { user: user._id, read: false },
                { $set: { read: true, readAt: new Date() } }
            );

            return NextResponse.json({ success: true, count: result.modifiedCount });
        }

        // Delete notification
        if (action === 'delete' && nId) {
            const notification = await Notification.findOneAndDelete({
                _id: nId,
                user: user._id,
            });

            if (!notification) {
                return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
            }

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Notifications POST error:', error);
        return NextResponse.json(
            { error: 'Failed to update notification' },
            { status: 500 }
        );
    }
}
