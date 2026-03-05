// app/api/payments/verify/route.js
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDb from '@/db/connectDb';
import Payment from '@/models/Payment';
import Campaign from '@/models/Campaign';
import User from '@/models/User';
import {
    notifyPaymentReceived,
    notifyMilestoneReached,
    notifyPaymentConfirmation,
    notifyCampaignGoalReached,
    getSupporterIdsForCampaign,
} from '@/lib/notifications';
import { createLogger } from '@/lib/logger';

const logger = createLogger('PaymentsVerifyAPI');

export async function POST(request) {
    const startTime = Date.now();

    try {
        logger.request('POST', '/api/payments/verify');

        const body = await request.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentData } = body;

        // --- Input validation ---
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !paymentData) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (!paymentData.creatorUsername) {
            return NextResponse.json(
                { success: false, message: 'Creator username is required for verification' },
                { status: 400 }
            );
        }

        await connectDb();

        // --- Fetch the creator and their Razorpay secret from DB ---
        // We use the creator's OWN key secret (not a global env var) to verify the
        // signature, so we can support multiple creators with distinct Razorpay accounts.
        const creator = await User.findOne({ username: paymentData.creatorUsername.trim() })
            .select('razorpayid razorpaysecret _id username stats')
            .lean();

        if (!creator) {
            logger.warn('Creator not found during payment verification', {
                creatorUsername: paymentData.creatorUsername,
            });
            return NextResponse.json(
                { success: false, message: 'Creator not found' },
                { status: 404 }
            );
        }

        const keySecret = creator.razorpaysecret?.trim();
        if (!keySecret) {
            logger.error('Creator has no Razorpay secret configured', {
                creatorUsername: paymentData.creatorUsername,
            });
            return NextResponse.json(
                {
                    success: false,
                    message:
                        'Payment gateway not configured for this creator. ' +
                        'Please contact the creator.',
                },
                { status: 422 }
            );
        }

        // --- Verify Razorpay signature ---
        const generatedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (generatedSignature !== razorpay_signature) {
            logger.error('Invalid payment signature', {
                order_id: razorpay_order_id,
                payment_id: razorpay_payment_id,
            });
            return NextResponse.json(
                { success: false, message: 'Invalid payment signature' },
                { status: 400 }
            );
        }

        logger.info('Payment signature verified successfully', {
            order_id: razorpay_order_id,
            payment_id: razorpay_payment_id,
        });

        // --- Update the pending payment record ---
        const payment = await Payment.findByIdAndUpdate(
            paymentData.paymentId,
            {
                paymentId: razorpay_payment_id,
                status: 'success',
                done: true,
            },
            { new: true }
        );

        if (!payment) {
            logger.warn('Payment record not found during verification', {
                paymentId: paymentData.paymentId,
            });
            return NextResponse.json(
                { success: false, message: 'Payment record not found' },
                { status: 404 }
            );
        }

        // --- Update campaign stats ---
        let campaign = null;
        if (paymentData.campaignId) {
            campaign = await Campaign.findByIdAndUpdate(
                paymentData.campaignId,
                { $inc: { currentAmount: payment.amount, 'stats.supporters': 1 } },
                { new: true }
            );
        }

        // --- Update creator stats ---
        await User.findByIdAndUpdate(creator._id, {
            $inc: {
                'stats.totalRaised': payment.amount,
                'stats.totalSupporters': 1,
            },
        });

        // --- Notifications (non-fatal) ---
        try {
            // Atomically mark as notified (prevents duplicates if webhook fires too)
            const updatedPayment = await Payment.findOneAndUpdate(
                { _id: payment._id, notifiedAt: null },
                { $set: { notifiedAt: new Date() } },
                { new: true }
            );

            if (updatedPayment) {
                await notifyPaymentReceived({
                    creatorId: creator._id,
                    supporterName: payment.name,
                    campaignTitle: campaign?.title || 'your campaign',
                    campaignId: campaign?._id || paymentData.campaignId,
                    paymentId: payment._id,
                    amount: payment.amount,
                    anonymous: payment.anonymous || false,
                    campaignSlug: campaign?.username
                        ? `${campaign.username}/${campaign.slug}`
                        : (campaign?.slug || null),
                    message: payment.message || '',
                });

                // Milestone checks
                if (campaign && campaign.goalAmount > 0) {
                    const refreshed = await Campaign.findById(campaign._id).lean();
                    if (refreshed) {
                        const prevAmount = refreshed.currentAmount - payment.amount;
                        const prevPct = Math.floor((prevAmount / refreshed.goalAmount) * 100);
                        const newPct = Math.floor((refreshed.currentAmount / refreshed.goalAmount) * 100);

                        // Custom milestones
                        if (refreshed.milestones?.length > 0) {
                            for (const milestone of refreshed.milestones) {
                                if (!milestone.completed && refreshed.currentAmount >= milestone.amount) {
                                    await notifyMilestoneReached({
                                        creatorId: creator._id,
                                        campaignTitle: refreshed.title,
                                        campaignId: refreshed._id,
                                        milestoneTitle: milestone.title,
                                        percentage: Math.floor((milestone.amount / refreshed.goalAmount) * 100),
                                        currentAmount: refreshed.currentAmount,
                                    });
                                    await Campaign.updateOne(
                                        { _id: refreshed._id, 'milestones._id': milestone._id },
                                        { $set: { 'milestones.$.completed': true, 'milestones.$.completedAt': new Date() } }
                                    );
                                }
                            }
                        }

                        // Percentage milestones
                        for (const threshold of [25, 50, 75, 100]) {
                            if (prevPct < threshold && newPct >= threshold) {
                                await notifyMilestoneReached({
                                    creatorId: creator._id,
                                    campaignTitle: refreshed.title,
                                    campaignId: refreshed._id,
                                    milestoneTitle: `${threshold}% funded`,
                                    percentage: threshold,
                                    currentAmount: refreshed.currentAmount,
                                });
                            }
                        }

                        // Goal-reached: notify all supporters
                        const wasUnderGoal = prevAmount < refreshed.goalAmount;
                        const nowAtGoal = refreshed.currentAmount >= refreshed.goalAmount;
                        if (wasUnderGoal && nowAtGoal) {
                            const supporterIds = await getSupporterIdsForCampaign(
                                campaign._id,
                                creator._id?.toString()
                            );
                            if (supporterIds.length > 0) {
                                await notifyCampaignGoalReached({
                                    supporterIds,
                                    campaignTitle: refreshed.title,
                                    campaignSlug: refreshed.username
                                        ? `${refreshed.username}/${refreshed.slug}`
                                        : null,
                                    campaignId: refreshed._id,
                                    goalAmount: refreshed.goalAmount,
                                });
                            }
                        }
                    }
                }
            }
        } catch (notifyError) {
            // Notification failures must never break payment confirmation
            logger.error('Notification failed after payment (non-fatal)', {
                error: notifyError.message,
                paymentId: payment._id?.toString(),
            });
        }

        // Supporter confirmation (non-fatal)
        if (payment.userId) {
            try {
                await notifyPaymentConfirmation({
                    supporterId: payment.userId,
                    campaignTitle: campaign?.title || 'a campaign',
                    campaignSlug: campaign?.username
                        ? `${campaign.username}/${campaign.slug}`
                        : (campaign?.slug || null),
                    campaignId: campaign?._id || paymentData.campaignId,
                    paymentId: payment._id,
                    amount: payment.amount,
                });
            } catch (confirmError) {
                logger.error('Failed to send supporter confirmation (non-fatal)', {
                    error: confirmError.message,
                });
            }
        }

        // Reward tier claimed count
        if (payment.rewardTier && campaign) {
            await Campaign.findOneAndUpdate(
                { _id: campaign._id, 'rewards._id': payment.rewardTier },
                { $inc: { 'rewards.$.claimedCount': 1 } }
            ).catch(() => { /* non-critical */ });
        }

        const duration = Date.now() - startTime;
        logger.response('POST', '/api/payments/verify', 200, duration);

        return NextResponse.json({
            success: true,
            message: 'Payment verified successfully',
            payment: {
                _id: payment._id,
                amount: payment.amount,
                campaign: campaign?.title || 'N/A',
            },
        });
    } catch (error) {
        const duration = Date.now() - startTime;

        logger.error('Payment verification failed', {
            error: { name: error.name, message: error.message },
            duration: `${duration}ms`,
        });

        return NextResponse.json(
            {
                success: false,
                message: 'Payment verification failed',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
            },
            { status: 500 }
        );
    }
}
