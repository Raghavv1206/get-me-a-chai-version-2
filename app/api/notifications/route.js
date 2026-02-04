// app/api/notifications/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDb from '@/db/connectDb';
import Notification from '@/models/Notification';

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDb();

        // Fetch user's notifications (last 50, sorted by newest)
        const notifications = await Notification.find({
            userId: session.user.id
        })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        // Count unread notifications
        const unreadCount = await Notification.countDocuments({
            userId: session.user.id,
            read: false
        });

        return NextResponse.json({
            notifications,
            unreadCount,
            total: notifications.length
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

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDb();

        const body = await req.json();
        const { action, notificationId } = body;

        if (action === 'mark-read' && notificationId) {
            // Mark single notification as read
            await Notification.findOneAndUpdate(
                {
                    _id: notificationId,
                    userId: session.user.id
                },
                { read: true },
                { new: true }
            );

            return NextResponse.json({ success: true });
        }

        if (action === 'mark-all-read') {
            // Mark all user's notifications as read
            await Notification.updateMany(
                { userId: session.user.id, read: false },
                { read: true }
            );

            return NextResponse.json({ success: true });
        }

        if (action === 'delete' && notificationId) {
            // Delete notification
            await Notification.findOneAndDelete({
                _id: notificationId,
                userId: session.user.id
            });

            return NextResponse.json({ success: true });
        }

        return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Notifications POST error:', error);
        return NextResponse.json(
            { error: 'Failed to update notification' },
            { status: 500 }
        );
    }
}
