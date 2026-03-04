// lib/campaignExpiry.js
/**
 * Utility to close expired campaigns and send notifications.
 * 
 * Standalone function instead of a Mongoose static method to avoid
 * Next.js hot-reload model caching issues where statics added after
 * initial model registration are not available.
 */

import Campaign from '@/models/Campaign';
import {
    notifyCampaignStatusChange,
    notifyCampaignCompleted,
    notifyCampaignExpiring,
    getSupporterIdsForCampaign,
} from '@/lib/notifications';

/**
 * Bulk-close all active/paused campaigns whose endDate has passed.
 * Sets their status to 'completed' and sends notifications.
 * 
 * @returns {Promise<{matchedCount: number, modifiedCount: number}>}
 */
export async function closeExpiredCampaigns() {
    const now = new Date();

    // Find campaigns that need closing (instead of blind updateMany)
    const expiredCampaigns = await Campaign.find({
        status: { $in: ['active', 'paused'] },
        endDate: { $lt: now },
    }).select('_id title slug username creator currentAmount goalAmount status').lean();

    if (expiredCampaigns.length === 0) {
        return { matchedCount: 0, modifiedCount: 0 };
    }

    // Bulk update all at once for performance
    const result = await Campaign.updateMany(
        {
            _id: { $in: expiredCampaigns.map(c => c._id) },
        },
        {
            $set: {
                status: 'completed',
                updatedAt: now,
            },
        }
    );

    // Send notifications for each expired campaign (fire-and-forget)
    for (const campaign of expiredCampaigns) {
        try {
            // Notify creator
            await notifyCampaignStatusChange({
                creatorId: campaign.creator,
                campaignTitle: campaign.title,
                campaignId: campaign._id,
                oldStatus: campaign.status,
                newStatus: 'completed',
            });

            // Notify supporters
            const supporterIds = await getSupporterIdsForCampaign(
                campaign._id,
                campaign.creator?.toString()
            );
            if (supporterIds.length > 0) {
                await notifyCampaignCompleted({
                    supporterIds,
                    campaignTitle: campaign.title,
                    campaignSlug: campaign.username ? `${campaign.username}/${campaign.slug}` : null,
                    campaignId: campaign._id,
                    currentAmount: campaign.currentAmount || 0,
                    goalAmount: campaign.goalAmount || 0,
                });
            }
        } catch (err) {
            console.error(`[CampaignExpiry] Notification failed for campaign ${campaign._id}:`, err.message);
        }
    }

    return result;
}

/**
 * Notify creators about campaigns that are expiring soon.
 * Should be called from a daily cron job.
 * Sends warnings at 3 days and 1 day before expiry.
 * 
 * @returns {Promise<{notified: number}>}
 */
export async function notifyExpiringCampaigns() {
    let notified = 0;
    const now = new Date();

    // Find campaigns expiring in 3 days (between 2.5 and 3.5 days from now)
    const thresholds = [
        { days: 3, from: 2.5, to: 3.5 },
        { days: 1, from: 0.5, to: 1.5 },
    ];

    for (const { days, from, to } of thresholds) {
        const fromDate = new Date(now.getTime() + from * 24 * 60 * 60 * 1000);
        const toDate = new Date(now.getTime() + to * 24 * 60 * 60 * 1000);

        const campaigns = await Campaign.find({
            status: 'active',
            endDate: { $gte: fromDate, $lte: toDate },
        }).select('_id title creator').lean();

        for (const campaign of campaigns) {
            try {
                await notifyCampaignExpiring({
                    creatorId: campaign.creator,
                    campaignTitle: campaign.title,
                    campaignId: campaign._id,
                    daysRemaining: days,
                });
                notified++;
            } catch (err) {
                console.error(`[CampaignExpiry] Expiring notification failed for ${campaign._id}:`, err.message);
            }
        }
    }

    return { notified };
}
