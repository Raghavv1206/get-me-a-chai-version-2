import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDb from '@/db/connectDb';
import Payment from '@/models/Payment';
import Subscription from '@/models/Subscription';
import Campaign from '@/models/Campaign';
import User from '@/models/User';
import { notifyPaymentReceived, notifyMilestoneReached, notifyNewSubscription, notifySubscriptionCancelled, notifySubscriptionCharged, notifyPaymentConfirmation, notifyCampaignGoalReached, getSupporterIdsForCampaign } from '@/lib/notifications';
import { createLogger } from '@/lib/logger';

const logger = createLogger('RazorpayWebhook');

/**
 * Sends payment notification + checks milestones for a completed payment.
 * Uses atomic `notifiedAt` flag to prevent duplicate notifications
 * when both form-data verification and webhook fire for the same payment.
 *
 * @param {Object} paymentRecord - The Payment document (must have _id, amount, to_user, campaign, name, anonymous)
 * @param {string} source - 'form-data' or 'webhook' (for logging)
 * @returns {Promise<void>}
 */
async function sendPaymentNotification(paymentRecord, source = 'unknown') {
    try {
        // Atomically set notifiedAt only if it hasn't been set yet (prevents duplicates)
        const updated = await Payment.findOneAndUpdate(
            { _id: paymentRecord._id, notifiedAt: null },
            { $set: { notifiedAt: new Date() } },
            { new: true }
        );

        if (!updated) {
            // Another path already sent the notification
            logger.info('Notification already sent for this payment, skipping', {
                paymentId: paymentRecord._id?.toString(),
                source,
            });
            return;
        }

        // Find creator
        const creator = await User.findOne({ username: paymentRecord.to_user });
        if (!creator) {
            logger.warn('Creator not found for notification', {
                to_user: paymentRecord.to_user,
                paymentId: paymentRecord._id?.toString(),
                source,
            });
            return;
        }

        // Get campaign title
        let campaignTitle = 'your campaign';
        let campaign = null;
        if (paymentRecord.campaign) {
            campaign = await Campaign.findById(paymentRecord.campaign).lean();
            if (campaign?.title) {
                campaignTitle = campaign.title;
            }
        }

        // Send payment notification to CREATOR
        await notifyPaymentReceived({
            creatorId: creator._id,
            supporterName: paymentRecord.name,
            campaignTitle,
            campaignId: paymentRecord.campaign,
            paymentId: paymentRecord._id,
            amount: paymentRecord.amount,
            anonymous: paymentRecord.anonymous || false,
            campaignSlug: campaign?.username ? `${campaign.username}/${campaign.slug}` : (campaign?.slug || null),
            message: paymentRecord.message || '',
        });

        logger.info('Payment notification sent successfully', {
            creatorId: creator._id?.toString(),
            paymentId: paymentRecord._id?.toString(),
            amount: paymentRecord.amount,
            source,
        });

        // Send payment confirmation to SUPPORTER
        if (paymentRecord.userId) {
            await notifyPaymentConfirmation({
                supporterId: paymentRecord.userId,
                campaignTitle,
                campaignSlug: campaign?.username ? `${campaign.username}/${campaign.slug}` : (campaign?.slug || null),
                campaignId: paymentRecord.campaign,
                paymentId: paymentRecord._id,
                amount: paymentRecord.amount,
            });
        }

        // Check for milestone notifications (only if campaign exists with a goal)
        if (campaign && campaign.goalAmount > 0) {
            await checkAndNotifyMilestones(creator, campaign, paymentRecord.amount);

            // Check if campaign just reached its funding goal — notify all supporters
            const refreshedCampaign = await Campaign.findById(campaign._id).lean();
            if (refreshedCampaign) {
                const prevAmount = refreshedCampaign.currentAmount - paymentRecord.amount;
                const wasUnderGoal = prevAmount < refreshedCampaign.goalAmount;
                const nowAtGoal = refreshedCampaign.currentAmount >= refreshedCampaign.goalAmount;

                if (wasUnderGoal && nowAtGoal) {
                    const supporterIds = await getSupporterIdsForCampaign(campaign._id, creator._id?.toString());
                    if (supporterIds.length > 0) {
                        await notifyCampaignGoalReached({
                            supporterIds,
                            campaignTitle,
                            campaignSlug: campaign.username ? `${campaign.username}/${campaign.slug}` : null,
                            campaignId: campaign._id,
                            goalAmount: campaign.goalAmount,
                        });
                    }
                }
            }
        }
    } catch (error) {
        // Notification failures should never break the payment flow
        logger.error('Failed to send payment notification (non-fatal)', {
            error: error.message,
            paymentId: paymentRecord._id?.toString(),
            source,
        });
    }
}

/**
 * Checks and sends milestone notifications after a payment.
 * Handles both custom milestones and percentage-based milestones (25%, 50%, 75%, 100%).
 */
async function checkAndNotifyMilestones(creator, campaign, paymentAmount) {
    try {
        // Refetch campaign to get the latest currentAmount (after $inc)
        const updatedCampaign = await Campaign.findById(campaign._id).lean();
        if (!updatedCampaign || !updatedCampaign.goalAmount || updatedCampaign.goalAmount <= 0) return;

        const prevAmount = updatedCampaign.currentAmount - paymentAmount;
        const prevPercentage = Math.floor((prevAmount / updatedCampaign.goalAmount) * 100);
        const newPercentage = Math.floor((updatedCampaign.currentAmount / updatedCampaign.goalAmount) * 100);

        // Check custom milestones
        if (updatedCampaign.milestones && updatedCampaign.milestones.length > 0) {
            for (const milestone of updatedCampaign.milestones) {
                if (!milestone.completed && updatedCampaign.currentAmount >= milestone.amount) {
                    await notifyMilestoneReached({
                        creatorId: creator._id,
                        campaignTitle: updatedCampaign.title,
                        campaignId: updatedCampaign._id,
                        milestoneTitle: milestone.title,
                        percentage: Math.floor((milestone.amount / updatedCampaign.goalAmount) * 100),
                        currentAmount: updatedCampaign.currentAmount,
                    });

                    // Mark milestone as completed
                    await Campaign.updateOne(
                        { _id: campaign._id, 'milestones._id': milestone._id },
                        { $set: { 'milestones.$.completed': true, 'milestones.$.completedAt': new Date() } }
                    );

                    logger.info('Custom milestone reached', {
                        campaignId: campaign._id?.toString(),
                        milestoneTitle: milestone.title,
                    });
                }
            }
        }

        // Check percentage milestones (25%, 50%, 75%, 100%)
        const milestoneThresholds = [25, 50, 75, 100];
        for (const threshold of milestoneThresholds) {
            if (prevPercentage < threshold && newPercentage >= threshold) {
                await notifyMilestoneReached({
                    creatorId: creator._id,
                    campaignTitle: updatedCampaign.title,
                    campaignId: updatedCampaign._id,
                    milestoneTitle: `${threshold}% funded`,
                    percentage: threshold,
                    currentAmount: updatedCampaign.currentAmount,
                });

                logger.info('Percentage milestone reached', {
                    campaignId: campaign._id?.toString(),
                    threshold,
                    newPercentage,
                });
            }
        }
    } catch (error) {
        logger.error('Milestone check failed (non-fatal)', {
            error: error.message,
            campaignId: campaign._id?.toString(),
        });
    }
}

export async function POST(request) {
    const startTime = Date.now();

    try {
        logger.request('POST', '/api/razorpay');

        const body = await request.text();

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

            logger.info('Processing payment verification (form-data)', {
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

            // Fetch payment record first so we can look up the creator's secret.
            // This must come BEFORE signature verification.
            await connectDb();

            const paymentRecord = await Payment.findOne({ oid: razorpay_order_id });

            if (!paymentRecord) {
                logger.warn('Payment record not found', { order_id: razorpay_order_id });
                return NextResponse.json(
                    { success: false, message: 'Payment record not found' },
                    { status: 404 }
                );
            }

            // Verify payment signature using the CREATOR's own Razorpay key secret.
            // We look it up from the payment record's to_user field.
            // Supporters do NOT need Razorpay credentials — only the creator's keys matter here.
            const paymentCreator = await User.findOne({ username: paymentRecord.to_user })
                .select('razorpaysecret')
                .lean();
            const keySecret = paymentCreator?.razorpaysecret?.trim();

            if (keySecret) {
                const expectedSignature = crypto
                    .createHmac('sha256', keySecret)
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
            } else {
                logger.warn('Creator has no Razorpay secret; skipping signature verification', {
                    to_user: paymentRecord.to_user,
                    order_id: razorpay_order_id,
                });
            }

            if (paymentRecord.done) {
                // Already processed (e.g., by webhook) — still try to send notification
                // in case the webhook processed payment but didn't notify
                logger.info('Payment already marked done, ensuring notification was sent', {
                    order_id: razorpay_order_id,
                    payment_id: razorpay_payment_id,
                });
                await sendPaymentNotification(paymentRecord, 'form-data-retry');
            } else {
                // Mark payment as done
                paymentRecord.paymentId = razorpay_payment_id;
                paymentRecord.status = 'success';
                paymentRecord.done = true;
                await paymentRecord.save();

                logger.info('Payment record updated', {
                    order_id: razorpay_order_id,
                    payment_id: razorpay_payment_id,
                    amount: paymentRecord.amount,
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

                // Send notification + milestone checks
                await sendPaymentNotification(paymentRecord, 'form-data');
            }

            logger.info('Payment verification processed successfully', {
                order_id: razorpay_order_id,
                payment_id: razorpay_payment_id,
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

// ============================================================
//  Webhook event handler functions
// ============================================================

async function handlePaymentCaptured(payment) {
    const paymentRecord = await Payment.findOne({ oid: payment.order_id });

    if (!paymentRecord) {
        logger.warn('Payment record not found in webhook', { order_id: payment.order_id });
        return;
    }

    if (!paymentRecord.done) {
        // First time processing — update payment, stats, and notify
        paymentRecord.paymentId = payment.id;
        paymentRecord.status = 'success';
        paymentRecord.done = true;
        await paymentRecord.save();

        // Update campaign stats
        if (paymentRecord.campaign) {
            await Campaign.findByIdAndUpdate(paymentRecord.campaign, {
                $inc: {
                    currentAmount: paymentRecord.amount,
                    'stats.supporters': 1
                }
            }, { new: true });
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
    }

    // Always attempt to send notification (sendPaymentNotification is idempotent via notifiedAt)
    await sendPaymentNotification(paymentRecord, 'webhook');
}

async function handlePaymentFailed(payment) {
    const paymentRecord = await Payment.findOne({ oid: payment.order_id });

    if (paymentRecord && !paymentRecord.done) {
        paymentRecord.status = 'failed';
        paymentRecord.done = false;
        await paymentRecord.save();

        logger.info('Payment marked as failed', {
            order_id: payment.order_id,
            payment_id: payment.id,
        });
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

        // Notify creator (with subscriber name lookup)
        let subscriberName = 'Someone';
        if (subscriptionRecord.subscriber) {
            const subscriber = await User.findById(subscriptionRecord.subscriber).select('name').lean();
            if (subscriber?.name) subscriberName = subscriber.name;
        }
        await notifyNewSubscription({
            creatorId: subscriptionRecord.creator,
            subscriberId: subscriptionRecord.subscriber,
            subscriberName,
            amount: subscriptionRecord.amount,
            frequency: subscriptionRecord.frequency,
            campaignId: subscriptionRecord.campaign,
        });
    }
}

async function handleSubscriptionCharged(payment) {
    const subscription = await Subscription.findOne({
        razorpaySubscriptionId: payment.subscription_id
    });

    if (subscription) {
        // Create payment record for this subscription charge
        const creatorUser = await User.findById(subscription.creator);
        if (!creatorUser) {
            logger.error('Creator not found for subscription charge', {
                creatorId: subscription.creator?.toString(),
            });
            return;
        }

        await Payment.create({
            name: 'Subscription Payment',
            to_user: creatorUser.username,
            userId: subscription.subscriber || null,
            campaign: subscription.campaign,
            oid: payment.id,
            paymentId: payment.id,
            amount: subscription.amount,
            type: 'subscription',
            subscriptionId: subscription._id,
            status: 'success',
            done: true,
            notifiedAt: new Date(), // Mark as notified immediately since we're about to notify
        });

        // Update campaign amount
        if (subscription.campaign) {
            await Campaign.findByIdAndUpdate(subscription.campaign, {
                $inc: { currentAmount: subscription.amount }
            });
        }

        // Update creator stats
        await User.findByIdAndUpdate(subscription.creator, {
            $inc: { 'stats.totalRaised': subscription.amount }
        });

        // Notify creator about subscription charge
        await notifySubscriptionCharged({
            creatorId: subscription.creator,
            amount: subscription.amount,
            frequency: subscription.frequency,
            campaignId: subscription.campaign,
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
        await notifySubscriptionCancelled({
            creatorId: subscriptionRecord.creator,
            amount: subscriptionRecord.amount,
            frequency: subscriptionRecord.frequency,
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