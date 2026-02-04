import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDb from '@/db/connectDb';
import Subscription from '@/models/Subscription';

export async function GET(request) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDb();

        const subscriptions = await Subscription.find({
            subscriber: session.user.id
        })
            .populate('campaign', 'title')
            .populate('creator', 'username name')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            subscriptions
        });
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch subscriptions', error: error.message },
            { status: 500 }
        );
    }
}
