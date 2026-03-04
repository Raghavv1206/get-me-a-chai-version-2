import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDb from '@/db/connectDb';
import Payment from '@/models/Payment';
import Campaign from '@/models/Campaign';
import User from '@/models/User';
import { notifyPaymentReceived, notifyMilestoneReached, notifyPaymentConfirmation, notifyCampaignGoalReached, getSupporterIdsForCampaign } from '@/lib/notifications';

export async function POST(request) {
    try {
        const body = await request.json();
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            paymentData
        } = body;

        // Validate required fields
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !paymentData) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Verify signature
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!keySecret) {
            console.error('RAZORPAY_KEY_SECRET is not configured');
            return NextResponse.json(
                { success: false, message: 'Payment gateway not configured' },
                { status: 500 }
            );
        }

        const generatedSignature = crypto
            .createHmac('sha256', keySecret)
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
        let campaign = null;
        if (paymentData.campaignId) {
            campaign = await Campaign.findByIdAndUpdate(
                paymentData.campaignId,
                {
                    $inc: {
                        currentAmount: payment.amount,
                        'stats.supporters': 1
                    }
                },
                { new: true }
            );
        }

        // Update creator stats
        const creator = paymentData.creatorUsername
            ? await User.findOne({ username: paymentData.creatorUsername })
            : null;

        if (creator) {
            await User.findByIdAndUpdate(creator._id, {
                $inc: {
                    'stats.totalRaised': payment.amount,
                    'stats.totalSupporters': 1
                }
            });

            // Atomically check notifiedAt to prevent duplicate notifications
            const updatedPayment = await Payment.findOneAndUpdate(
                { _id: payment._id, notifiedAt: null },
                { $set: { notifiedAt: new Date() } },
                { new: true }
            );

            if (updatedPayment) {
                // Create notification for creator
                await notifyPaymentReceived({
                    creatorId: creator._id,
                    supporterName: payment.name,
                    campaignTitle: campaign?.title || 'your campaign',
                    campaignId: campaign?._id || paymentData.campaignId,
                    paymentId: payment._id,
                    amount: payment.amount,
                    anonymous: payment.anonymous || false,
                    campaignSlug: campaign?.username ? `${campaign.username}/${campaign.slug}` : (campaign?.slug || null),
                    message: payment.message || '',
                });

                // Check for milestone notifications
                if (campaign && campaign.goalAmount > 0) {
                    const updatedCampaign = await Campaign.findById(campaign._id).lean();
                    if (updatedCampaign) {
                        const prevAmount = updatedCampaign.currentAmount - payment.amount;
                        const prevPercentage = Math.floor((prevAmount / updatedCampaign.goalAmount) * 100);
                        const newPercentage = Math.floor((updatedCampaign.currentAmount / updatedCampaign.goalAmount) * 100);

                        // Check custom milestones
                        if (updatedCampaign.milestones && updatedCampaign.milestones.length > 0) {
                            for (const milestone of updatedCampaign.milestones) {
                                if (!milestone.completed && updatedCampaign.currentAmount >= milestone.amount) {
                                    await notifyMilestoneReached({
                                        creatorId: creator._id,
                                        campaignTitle: campaign.title,
                                        campaignId: campaign._id,
                                        milestoneTitle: milestone.title,
                                        percentage: Math.floor((milestone.amount / updatedCampaign.goalAmount) * 100),
                                        currentAmount: updatedCampaign.currentAmount,
                                    });
                                    // Mark milestone as completed
                                    await Campaign.updateOne(
                                        { _id: campaign._id, 'milestones._id': milestone._id },
                                        { $set: { 'milestones.$.completed': true, 'milestones.$.completedAt': new Date() } }
                                    );
                                }
                            }
                        }

                        // Check percentage milestones (25%, 50%, 75%, 100%)
                        const milestoneThresholds = [25, 50, 75, 100];
                        for (const threshold of milestoneThresholds) {
                            if (prevPercentage < threshold && newPercentage >= threshold) {
                                await notifyMilestoneReached({
                                    creatorId: creator._id,
                                    campaignTitle: campaign.title,
                                    campaignId: campaign._id,
                                    milestoneTitle: `${threshold}% funded`,
                                    percentage: threshold,
                                    currentAmount: updatedCampaign.currentAmount,
                                });
                            }
                        }
                    }
                }
            }
        }

        // Notify the SUPPORTER that their payment was successful
        if (payment.userId) {
            try {
                await notifyPaymentConfirmation({
                    supporterId: payment.userId,
                    campaignTitle: campaign?.title || 'a campaign',
                    campaignSlug: campaign?.username ? `${campaign.username}/${campaign.slug}` : (campaign?.slug || null),
                    campaignId: campaign?._id || paymentData.campaignId,
                    paymentId: payment._id,
                    amount: payment.amount,
                });
            } catch (confirmError) {
                console.error('Failed to send supporter confirmation (non-fatal):', confirmError);
            }
        }

        // Check if campaign just reached its goal — notify all supporters
        if (campaign && campaign.goalAmount > 0) {
            try {
                const refreshedCampaign = await Campaign.findById(campaign._id).lean();
                if (refreshedCampaign) {
                    const prevAmount = refreshedCampaign.currentAmount - payment.amount;
                    const wasUnderGoal = prevAmount < refreshedCampaign.goalAmount;
                    const nowAtGoal = refreshedCampaign.currentAmount >= refreshedCampaign.goalAmount;

                    if (wasUnderGoal && nowAtGoal) {
                        const supporterIds = await getSupporterIdsForCampaign(campaign._id, campaign.creator?.toString());
                        if (supporterIds.length > 0) {
                            await notifyCampaignGoalReached({
                                supporterIds,
                                campaignTitle: campaign.title,
                                campaignSlug: campaign.username ? `${campaign.username}/${campaign.slug}` : null,
                                campaignId: campaign._id,
                                goalAmount: campaign.goalAmount,
                            });
                        }
                    }
                }
            } catch (goalError) {
                console.error('Failed to send goal-reached notifications (non-fatal):', goalError);
            }
        }

        // Update reward tier claimed count if applicable
        if (payment.rewardTier && campaign) {
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
                campaign: campaign?.title || 'N/A'
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
