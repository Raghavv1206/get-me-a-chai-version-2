import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import connectDb from '@/db/connectDb';
import Subscription from '@/models/Subscription';
import Campaign from '@/models/Campaign';
import User from '@/models/User';

export async function POST(request) {
    try {
        const body = await request.json();
        const {
            amount,
            frequency = 'monthly',
            campaign: campaignId,
            creatorUsername,
            subscriberId
        } = body;

        // Validate amount
        if (!amount || amount < 10) {
            return NextResponse.json(
                { success: false, message: 'Minimum subscription amount is ₹10' },
                { status: 400 }
            );
        }

        if (!creatorUsername) {
            return NextResponse.json(
                { success: false, message: 'Creator username is required' },
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

        // Get creator with their Razorpay credentials from DB
        const creator = await User.findOne({ username: creatorUsername })
            .select('razorpayid razorpaysecret username _id');
        if (!creator) {
            return NextResponse.json(
                { success: false, message: 'Creator not found' },
                { status: 404 }
            );
        }

        // Use per-creator credentials (never global env vars)
        const razorpayId = creator.razorpayid?.trim();
        const razorpaySecret = creator.razorpaysecret?.trim();

        if (!razorpayId || !razorpaySecret) {
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

        // Instantiate Razorpay with creator's own credentials (inside handler, never at module level)
        const razorpay = new Razorpay({
            key_id: razorpayId,
            key_secret: razorpaySecret,
        });

        // Calculate period based on frequency
        let period = 'monthly';
        let interval = 1;

        switch (frequency) {
            case 'quarterly':
                period = 'monthly';
                interval = 3;
                break;
            case 'yearly':
                period = 'yearly';
                interval = 1;
                break;
            default:
                period = 'monthly';
                interval = 1;
        }

        // Create Razorpay subscription plan
        const plan = await razorpay.plans.create({
            period,
            interval,
            item: {
                name: `Support for ${campaign.title}`,
                amount: amount * 100, // Amount in paise
                currency: 'INR',
                description: `Monthly support for ${campaign.title}`
            },
            notes: {
                campaign: campaignId,
                creator: creator._id.toString(),
                frequency
            }
        });

        // Create Razorpay subscription
        const subscription = await razorpay.subscriptions.create({
            plan_id: plan.id,
            customer_notify: 1,
            quantity: 1,
            total_count: 120, // 10 years max
            notes: {
                campaign: campaignId,
                creator: creator._id.toString(),
                subscriber: subscriberId
            }
        });

        // Calculate next billing date
        const nextBillingDate = new Date();
        if (frequency === 'monthly') {
            nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
        } else if (frequency === 'quarterly') {
            nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
        } else if (frequency === 'yearly') {
            nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
        }

        // Create subscription record in database
        const subscriptionRecord = await Subscription.create({
            subscriber: subscriberId,
            creator: creator._id,
            campaign: campaignId,
            razorpaySubscriptionId: subscription.id,
            amount,
            frequency,
            status: 'active',
            nextBillingDate,
            startDate: new Date()
        });

        return NextResponse.json({
            success: true,
            subscription: {
                id: subscription.id,
                subscriptionId: subscriptionRecord._id,
                amount,
                frequency,
                nextBillingDate
            }
        });
    } catch (error) {
        console.error('Error creating subscription:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create subscription', error: error.message },
            { status: 500 }
        );
    }
}
