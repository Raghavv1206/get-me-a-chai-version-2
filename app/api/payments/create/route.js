import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import connectDb from '@/db/connectDb';
import Payment from '@/models/Payment';
import Campaign from '@/models/Campaign';

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

export async function POST(request) {
    try {
        const body = await request.json();
        const {
            amount,
            campaign: campaignId,
            creatorUsername,
            name,
            email,
            message,
            rewardTier,
            paymentType,
            anonymous,
            hideAmount
        } = body;

        // Validate amount
        if (!amount || amount < 10) {
            return NextResponse.json(
                { success: false, message: 'Minimum amount is ₹10' },
                { status: 400 }
            );
        }

        await connectDb();

        // Verify campaign exists
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return NextResponse.json(
                { success: false, message: 'Campaign not found' },
                { status: 404 }
            );
        }

        // Create Razorpay order
        const options = {
            amount: amount * 100, // Amount in paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            notes: {
                campaign: campaignId,
                creator: creatorUsername,
                paymentType
            }
        };

        const order = await razorpay.orders.create(options);

        // Create payment record in database (pending status)
        const payment = await Payment.create({
            name,
            email,
            to_user: creatorUsername,
            campaign: campaignId,
            oid: order.id,
            amount,
            currency: 'INR',
            message,
            rewardTier,
            type: paymentType,
            anonymous,
            hideAmount,
            status: 'pending',
            done: false
        });

        return NextResponse.json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency
            },
            paymentData: {
                paymentId: payment._id,
                campaignId,
                creatorUsername
            }
        });
    } catch (error) {
        console.error('Error creating payment order:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create payment order', error: error.message },
            { status: 500 }
        );
    }
}
