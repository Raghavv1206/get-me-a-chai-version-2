import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Razorpay from 'razorpay';
import connectDb from '@/db/connectDb';
import Subscription from '@/models/Subscription';

const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

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
        const { subscriptionId } = body;

        await connectDb();

        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) {
            return NextResponse.json(
                { success: false, message: 'Subscription not found' },
                { status: 404 }
            );
        }

        // Verify ownership
        if (subscription.subscriber.toString() !== session.user.id) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Pause subscription in Razorpay
        await razorpay.subscriptions.pause(subscription.razorpaySubscriptionId);

        // Update subscription status
        subscription.status = 'paused';
        await subscription.save();

        return NextResponse.json({
            success: true,
            message: 'Subscription paused successfully'
        });
    } catch (error) {
        console.error('Error pausing subscription:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to pause subscription', error: error.message },
            { status: 500 }
        );
    }
}
