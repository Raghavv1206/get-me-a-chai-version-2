import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDb from '@/db/connectDb';
import Payment from '@/models/Payment';
import Subscription from '@/models/Subscription';
import Campaign from '@/models/Campaign';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { createLogger } from '@/lib/logger';
import config from '@/lib/config';

const logger = createLogger('RazorpayWebhook');

export async function POST(request) {
    const startTime = Date.now();

    try {
        logger.request('POST', '/api/razorpay');

        const body = await request.text();
        const signature = request.headers.get('x-razorpay-signature');

        // Get webhook secret from config
        const webhookSecret = config.payment.razorpay.webhookSecret;

        // Check if webhook secret is configured
        if (!webhookSecret) {
            logger.warn('Razorpay webhook secret not configured', {
                env: process.env.NODE_ENV,
                hasSignature: !!signature
            });

            // In development, allow webhooks without verification
            if (process.env.NODE_ENV === 'development') {
                logger.info('Development mode: Processing webhook without signature verification');
            } else {
                logger.error('Production mode: Webhook secret is required');
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Webhook secret not configured',
                        error: 'RAZORPAY_WEBHOOK_SECRET environment variable is required'
                    },
                    { status: 500 }
                );
            }
        } else {
            // Verify webhook signature
            const expectedSignature = crypto
                .createHmac('sha256', webhookSecret)
                .update(body)
                .digest('hex');

            if (signature !== expectedSignature) {
                logger.error('Invalid webhook signature', {
                    receivedSignature: signature?.substring(0, 10) + '...',
                    expectedSignature: expectedSignature?.substring(0, 10) + '...'
                });
                return NextResponse.json(
                    { success: false, message: 'Invalid signature' },
                    { status: 400 }
                );
            }

            logger.info('Webhook signature verified successfully');
        }

        // Check content type to determine how to parse the body
        const contentType = request.headers.get('content-type') || '';

        logger.info('Processing webhook request', {
            contentType,
            bodyLength: body.length
        });

        // Handle different content types
        if (contentType.includes('application/json')) {
            // Razorpay webhook events (JSON)
            const event = JSON.parse(body);

            logger.info('Processing webhook event', {
                event: event.event,
                eventId: event.payload?.payment?.entity?.id || event.payload?.subscription?.entity?.id
            });

            await connectDb();

            // Handle different webhook events
            switch (event.event) {
                case 'payment.captured':
                    await handlePaymentCaptured(event.payload.payment.entity);
                    break;

                case 'payment.failed':
                    await handlePaymentFailed(event.payload.payment.entity);
                    break;

                case 'subscription.activated':
                    await handleSubscriptionActivated(event.payload.subscription.entity);
                    break;

                case 'subscription.charged':
                    await handleSubscriptionCharged(event.payload.payment.entity);
                    break;

                case 'subscription.cancelled':
                    await handleSubscriptionCancelled(event.payload.subscription.entity);
                    break;

                case 'subscription.paused':
                    await handleSubscriptionPaused(event.payload.subscription.entity);
                    break;

                case 'subscription.resumed':
                    await handleSubscriptionResumed(event.payload.subscription.entity);
                    break;

                case 'subscription.completed':
                    await handleSubscriptionCompleted(event.payload.subscription.entity);
                    break;

                default:
                    logger.warn('Unhandled webhook event', { event: event.event });
            }

            logger.info('Webhook event processed successfully', {
                event: event.event,
                eventId: event.payload?.payment?.entity?.id || event.payload?.subscription?.entity?.id
            });
        } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
            // Payment verification from frontend (form data)
            const formData = new URLSearchParams(body);
            const razorpay_payment_id = formData.get('razorpay_payment_id');
            const razorpay_order_id = formData.get('razorpay_order_id');
            const razorpay_signature = formData.get('razorpay_signature');

            logger.info('Processing payment verification', {
                payment_id: razorpay_payment_id,
                order_id: razorpay_order_id,
                hasSignature: !!razorpay_signature
            });

            if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
                logger.warn('Missing required payment verification fields');
                return NextResponse.json(
                    { success: false, message: 'Missing required fields' },
                    { status: 400 }
                );
            }

            // Verify payment signature
            const webhookSecret = config.payment.razorpay.keySecret;

            if (webhookSecret) {
                const expectedSignature = crypto
                    .createHmac('sha256', webhookSecret)
                    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
                    .digest('hex');

                if (razorpay_signature !== expectedSignature) {
                    logger.error('Invalid payment signature', {
                        order_id: razorpay_order_id,
                        payment_id: razorpay_payment_id
                    });
                    return NextResponse.json(
                        { success: false, message: 'Invalid payment signature' },
                        { status: 400 }
                    );
                }

                logger.info('Payment signature verified successfully');
            }

            // Update payment record
            await connectDb();

            const paymentRecord = await Payment.findOne({ oid: razorpay_order_id });

            if (paymentRecord && !paymentRecord.done) {
                paymentRecord.paymentId = razorpay_payment_id;
                paymentRecord.status = 'success';
                paymentRecord.done = true;
                await paymentRecord.save();

                logger.info('Payment record updated', {
                    order_id: razorpay_order_id,
                    payment_id: razorpay_payment_id
                });

                // Update campaign stats
                if (paymentRecord.campaign) {
                    await Campaign.findByIdAndUpdate(paymentRecord.campaign, {
                        $inc: {
                            currentAmount: paymentRecord.amount,
                            'stats.supporters': 1
                        }
                    });
                }

                // Update creator stats
                const creator = await User.findOne({ username: paymentRecord.to_user });
                if (creator) {
                    await User.findByIdAndUpdate(creator._id, {
                        $inc: {
                            'stats.totalRaised': paymentRecord.amount,
                            'stats.totalSupporters': 1
                        }
                    });
                }
            } else {
                logger.warn('Payment record not found or already processed', {
                    order_id: razorpay_order_id,
                    found: !!paymentRecord,
                    done: paymentRecord?.done
                });
            }

            logger.info('Payment verification processed successfully', {
                order_id: razorpay_order_id,
                payment_id: razorpay_payment_id,
                updated: !!(paymentRecord && !paymentRecord.done)
            });
        } else {
            logger.error('Unsupported content type', { contentType });
            return NextResponse.json(
                { success: false, message: 'Unsupported content type' },
                { status: 400 }
            );
        }

        const duration = Date.now() - startTime;
        logger.response('POST', '/api/razorpay', 200, duration);

        return NextResponse.json({ success: true, received: true });
    } catch (error) {
        const duration = Date.now() - startTime;

        logger.error('Webhook processing failed', {
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            duration: `${duration}ms`
        });

        return NextResponse.json(
            {
                success: false,
                message: 'Webhook processing failed',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            },
            { status: 500 }
        );
    }
}

// Handler functions
async function handlePaymentCaptured(payment) {
    const paymentRecord = await Payment.findOne({ oid: payment.order_id });

    if (paymentRecord && !paymentRecord.done) {
        paymentRecord.paymentId = payment.id;
        paymentRecord.status = 'success';
        paymentRecord.done = true;
        await paymentRecord.save();

        // Update campaign stats
        await Campaign.findByIdAndUpdate(paymentRecord.campaign, {
            $inc: {
                currentAmount: paymentRecord.amount,
                'stats.supporters': 1
            }
        });

        // Update creator stats
        const creator = await User.findOne({ username: paymentRecord.to_user });
        if (creator) {
            await User.findByIdAndUpdate(creator._id, {
                $inc: {
                    'stats.totalRaised': paymentRecord.amount,
                    'stats.totalSupporters': 1
                }
            });
        }
    }
}

async function handlePaymentFailed(payment) {
    const paymentRecord = await Payment.findOne({ oid: payment.order_id });

    if (paymentRecord) {
        paymentRecord.status = 'failed';
        paymentRecord.done = false;
        await paymentRecord.save();
    }
}

async function handleSubscriptionActivated(subscription) {
    const subscriptionRecord = await Subscription.findOne({
        razorpaySubscriptionId: subscription.id
    });

    if (subscriptionRecord) {
        subscriptionRecord.status = 'active';
        subscriptionRecord.startDate = new Date(subscription.start_at * 1000);
        await subscriptionRecord.save();

        // Notify creator
        await Notification.create({
            user: subscriptionRecord.creator,
            type: 'new_subscription',
            title: 'New Subscription!',
            message: `Someone started a ${subscriptionRecord.frequency} subscription of ₹${subscriptionRecord.amount}`,
            link: `/dashboard/subscriptions`
        });
    }
}

async function handleSubscriptionCharged(payment) {
    const subscription = await Subscription.findOne({
        razorpaySubscriptionId: payment.subscription_id
    });

    if (subscription) {
        // Create payment record for this subscription charge
        await Payment.create({
            name: 'Subscription Payment',
            to_user: (await User.findById(subscription.creator)).username,
            campaign: subscription.campaign,
            oid: payment.id,
            paymentId: payment.id,
            amount: subscription.amount,
            type: 'subscription',
            subscriptionId: subscription._id,
            status: 'success',
            done: true
        });

        // Update campaign amount
        await Campaign.findByIdAndUpdate(subscription.campaign, {
            $inc: { currentAmount: subscription.amount }
        });

        // Update creator stats
        await User.findByIdAndUpdate(subscription.creator, {
            $inc: { 'stats.totalRaised': subscription.amount }
        });

        // Update next billing date
        const nextBillingDate = new Date();
        if (subscription.frequency === 'monthly') {
            nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
        } else if (subscription.frequency === 'quarterly') {
            nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
        } else if (subscription.frequency === 'yearly') {
            nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
        }

        subscription.nextBillingDate = nextBillingDate;
        await subscription.save();
    }
}

async function handleSubscriptionCancelled(subscription) {
    const subscriptionRecord = await Subscription.findOne({
        razorpaySubscriptionId: subscription.id
    });

    if (subscriptionRecord) {
        subscriptionRecord.status = 'cancelled';
        subscriptionRecord.endDate = new Date();
        await subscriptionRecord.save();

        // Notify creator
        await Notification.create({
            user: subscriptionRecord.creator,
            type: 'subscription_cancelled',
            title: 'Subscription Cancelled',
            message: `A ${subscriptionRecord.frequency} subscription of ₹${subscriptionRecord.amount} was cancelled`,
            link: `/dashboard/subscriptions`
        });
    }
}

async function handleSubscriptionPaused(subscription) {
    const subscriptionRecord = await Subscription.findOne({
        razorpaySubscriptionId: subscription.id
    });

    if (subscriptionRecord) {
        subscriptionRecord.status = 'paused';
        await subscriptionRecord.save();
    }
}

async function handleSubscriptionResumed(subscription) {
    const subscriptionRecord = await Subscription.findOne({
        razorpaySubscriptionId: subscription.id
    });

    if (subscriptionRecord) {
        subscriptionRecord.status = 'active';
        await subscriptionRecord.save();
    }
}

async function handleSubscriptionCompleted(subscription) {
    const subscriptionRecord = await Subscription.findOne({
        razorpaySubscriptionId: subscription.id
    });

    if (subscriptionRecord) {
        subscriptionRecord.status = 'expired';
        subscriptionRecord.endDate = new Date();
        await subscriptionRecord.save();
    }
}