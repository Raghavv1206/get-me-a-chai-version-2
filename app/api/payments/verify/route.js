import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDb from '@/db/connectDb';
import Payment from '@/models/Payment';
import Campaign from '@/models/Campaign';
import User from '@/models/User';
import Notification from '@/models/Notification';

export async function POST(request) {
    try {
        const body = await request.json();
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            paymentData
        } = body;

        // Verify signature
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (generatedSignature !== razorpay_signature) {
            return NextResponse.json(
                { success: false, message: 'Invalid payment signature' },
                { status: 400 }
            );
        }

        await connectDb();

        // Update payment record
        const payment = await Payment.findByIdAndUpdate(
            paymentData.paymentId,
            {
                paymentId: razorpay_payment_id,
                status: 'success',
                done: true,
                updatedAt: Date.now()
            },
            { new: true }
        );

        if (!payment) {
            return NextResponse.json(
                { success: false, message: 'Payment record not found' },
                { status: 404 }
            );
        }

        // Update campaign amount and supporters count
        const campaign = await Campaign.findByIdAndUpdate(
            paymentData.campaignId,
            {
                $inc: {
                    currentAmount: payment.amount,
                    'stats.supporters': 1
                }
            },
            { new: true }
        );

        // Update creator stats
        const creator = await User.findOne({ username: paymentData.creatorUsername });
        if (creator) {
            await User.findByIdAndUpdate(creator._id, {
                $inc: {
                    'stats.totalRaised': payment.amount,
                    'stats.totalSupporters': 1
                }
            });

            // Create notification for creator
            await Notification.create({
                user: creator._id,
                type: 'new_support',
                title: 'New Support Received!',
                message: `${payment.anonymous ? 'Someone' : payment.name} supported your campaign "${campaign.title}" with ₹${payment.amount}`,
                link: `/${creator.username}`,
                data: {
                    campaignId: campaign._id,
                    paymentId: payment._id,
                    amount: payment.amount
                }
            });
        }

        // Update reward tier claimed count if applicable
        if (payment.rewardTier) {
            await Campaign.findOneAndUpdate(
                {
                    _id: campaign._id,
                    'rewards._id': payment.rewardTier
                },
                {
                    $inc: { 'rewards.$.claimedCount': 1 }
                }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Payment verified successfully',
            payment: {
                _id: payment._id,
                amount: payment.amount,
                campaign: campaign.title
            }
        });
    } catch (error) {
        console.error('Error verifying payment:', error);
        return NextResponse.json(
            { success: false, message: 'Payment verification failed', error: error.message },
            { status: 500 }
        );
    }
}
