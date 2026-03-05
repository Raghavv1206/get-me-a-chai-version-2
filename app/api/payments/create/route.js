// app/api/payments/create/route.js
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import connectDb from '@/db/connectDb';
import Payment from '@/models/Payment';
import Campaign from '@/models/Campaign';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createLogger } from '@/lib/logger';

const logger = createLogger('PaymentsCreateAPI');

export async function POST(request) {
    const startTime = Date.now();

    try {
        logger.request('POST', '/api/payments/create');

        // Authenticate the requesting user (supporter)
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { success: false, message: 'You must be logged in to make a payment' },
                { status: 401 }
            );
        }

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
            hideAmount,
        } = body;

        // --- Input validation ---
        if (!amount || typeof amount !== 'number' || amount < 10) {
            return NextResponse.json(
                { success: false, message: 'Minimum amount is ₹10' },
                { status: 400 }
            );
        }

        if (!creatorUsername || typeof creatorUsername !== 'string') {
            return NextResponse.json(
                { success: false, message: 'Creator username is required' },
                { status: 400 }
            );
        }

        if (!campaignId) {
            return NextResponse.json(
                { success: false, message: 'Campaign ID is required' },
                { status: 400 }
            );
        }

        await connectDb();

        // --- Look up the creator and their Razorpay credentials ---
        const creator = await User.findOne({ username: creatorUsername.trim() })
            .select('razorpayid razorpaysecret username')
            .lean();

        if (!creator) {
            logger.warn('Creator not found', { creatorUsername });
            return NextResponse.json(
                { success: false, message: 'Creator not found' },
                { status: 404 }
            );
        }

        // Use ONLY the creator's own per-user credentials stored in DB.
        // We never fall back to global env vars — creators must configure
        // their own Razorpay account via the Settings page.
        const razorpayId = creator.razorpayid?.trim();
        const razorpaySecret = creator.razorpaysecret?.trim();

        if (!razorpayId || !razorpaySecret) {
            logger.warn('Creator has not configured Razorpay credentials', { creatorUsername });
            return NextResponse.json(
                {
                    success: false,
                    message:
                        'This creator has not set up their payment gateway yet. ' +
                        'Please ask them to add their Razorpay Key ID and Secret in their Settings.',
                },
                { status: 422 }
            );
        }

        // --- Verify campaign exists ---
        const campaign = await Campaign.findById(campaignId).select('_id title status').lean();
        if (!campaign) {
            return NextResponse.json(
                { success: false, message: 'Campaign not found' },
                { status: 404 }
            );
        }

        if (campaign.status === 'completed' || campaign.status === 'cancelled') {
            return NextResponse.json(
                { success: false, message: 'This campaign is no longer accepting contributions' },
                { status: 422 }
            );
        }

        // --- Create Razorpay order using the creator's own credentials ---
        const razorpay = new Razorpay({
            key_id: razorpayId,
            key_secret: razorpaySecret,
        });

        const orderOptions = {
            amount: Math.round(amount * 100), // Convert ₹ to paise; ensure integer
            currency: 'INR',
            receipt: `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
            notes: {
                campaign: campaignId,
                creator: creatorUsername,
                paymentType: paymentType || 'one-time',
            },
        };

        const order = await razorpay.orders.create(orderOptions);

        logger.info('Razorpay order created', {
            orderId: order.id,
            amount: orderOptions.amount,
            creatorUsername,
            campaignId,
        });

        // --- Persist a pending payment record ---
        const payment = await Payment.create({
            name: name || 'Anonymous',
            email: email || session.user?.email || '',
            userId: session.user?.id || null,
            to_user: creatorUsername,
            campaign: campaignId,
            oid: order.id,
            amount, // Store in ₹ (not paise)
            currency: 'INR',
            message: message || '',
            rewardTier: rewardTier || null,
            type: paymentType || 'one-time',
            anonymous: anonymous || false,
            hideAmount: hideAmount || false,
            status: 'pending',
            done: false,
        });

        const duration = Date.now() - startTime;
        logger.response('POST', '/api/payments/create', 200, duration);

        return NextResponse.json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
            },
            paymentData: {
                paymentId: payment._id,
                campaignId,
                creatorUsername,
            },
        });
    } catch (error) {
        const duration = Date.now() - startTime;

        logger.error('Error creating payment order', {
            error: { name: error.name, message: error.message },
            duration: `${duration}ms`,
        });

        // Surface Razorpay credential errors clearly in development
        const isDev = process.env.NODE_ENV === 'development';
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to create payment order',
                error: isDev ? error.message : 'Internal server error',
            },
            { status: 500 }
        );
    }
}
