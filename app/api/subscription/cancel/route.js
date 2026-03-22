import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Razorpay from 'razorpay';
import connectDb from '@/db/connectDb';
import Subscription from '@/models/Subscription';
import User from '@/models/User';

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

        // Fetch creator's Razorpay credentials from DB (per-creator, never global env vars)
        const creator = await User.findById(subscription.creator)
            .select('razorpayid razorpaysecret');
        if (!creator) {
            return NextResponse.json(
                { success: false, message: 'Creator not found' },
                { status: 404 }
            );
        }

        const razorpayId = creator.razorpayid?.trim();
        const razorpaySecret = creator.razorpaysecret?.trim();

        if (!razorpayId || !razorpaySecret) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Creator payment gateway not configured. Cannot cancel via Razorpay.',
                },
                { status: 422 }
            );
        }

        // Instantiate Razorpay inside handler with creator's own credentials
        const razorpay = new Razorpay({
            key_id: razorpayId,
            key_secret: razorpaySecret,
        });

        // Cancel subscription in Razorpay
        await razorpay.subscriptions.cancel(subscription.razorpaySubscriptionId);

        // Update subscription status
        subscription.status = 'cancelled';
        subscription.endDate = new Date();
        await subscription.save();

        return NextResponse.json({
            success: true,
            message: 'Subscription cancelled successfully'
        });
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to cancel subscription', error: error.message },
            { status: 500 }
        );
    }
}

