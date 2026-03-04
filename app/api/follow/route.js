import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDb from '@/db/connectDb';
import User from '@/models/User';
import { notifyNewFollower } from '@/lib/notifications';

// This is a simplified follow system
// In production, you'd want a separate Follow/Follower model

export async function POST(request) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { username, action } = body;

        if (!username || !action) {
            return NextResponse.json(
                { success: false, message: 'Username and action are required' },
                { status: 400 }
            );
        }

        await connectDb();

        const targetUser = await User.findOne({ username });
        if (!targetUser) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        // Prevent self-follow
        if (targetUser._id.toString() === session.user.id) {
            return NextResponse.json(
                { success: false, message: 'You cannot follow yourself' },
                { status: 400 }
            );
        }

        // Notify the creator on follow
        if (action === 'follow') {
            const follower = await User.findById(session.user.id).select('name username').lean();
            await notifyNewFollower({
                userId: targetUser._id,
                followerId: session.user.id,
                followerName: follower?.name || session.user?.name || 'Someone',
            });
        }

        return NextResponse.json({
            success: true,
            action,
            message: `Successfully ${action}ed ${username}`
        });
    } catch (error) {
        console.error('Error following user:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to follow user', error: error.message },
            { status: 500 }
        );
    }
}
