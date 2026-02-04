// app/api/cron/publish-scheduled/route.js
/**
 * Publish Scheduled Updates Cron Job
 * Runs every 5 minutes to publish scheduled campaign updates
 * 
 * Vercel Cron Configuration (add to vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/publish-scheduled",
 *     "schedule": "*/5 * * * * "
    *   }]
 * }
 */

import { NextResponse } from 'next/server';
import connectDb from '@/db/connectDb';
import CampaignUpdate from '@/models/CampaignUpdate';
import Campaign from '@/models/Campaign';
import Payment from '@/models/Payment';
import User from '@/models/User';
import { sendUpdateNotifications } from '@/actions/emailActions';
import { notifyCampaignUpdate } from '@/actions/notificationActions';

export async function GET(request) {
    try {
        // Verify cron secret (security)
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDb();

        // Find all scheduled updates that are due
        const now = new Date();
        const scheduledUpdates = await CampaignUpdate.find({
            status: 'scheduled',
            scheduledFor: { $lte: now }
        }).lean();

        const results = {
            total: scheduledUpdates.length,
            published: 0,
            failed: 0,
            errors: []
        };

        for (const update of scheduledUpdates) {
            try {
                // Publish the update
                await CampaignUpdate.findByIdAndUpdate(update._id, {
                    status: 'published',
                    publishedAt: new Date()
                });

                // Get campaign and creator info
                const campaign = await Campaign.findById(update.campaign).lean();
                if (!campaign) {
                    throw new Error('Campaign not found');
                }

                const creator = await User.findById(campaign.creator).lean();
                if (!creator) {
                    throw new Error('Creator not found');
                }

                // Get all supporters of this campaign
                const payments = await Payment.find({
                    campaign: campaign._id
                }).distinct('from_user');

                const supporters = await User.find({
                    _id: { $in: payments }
                }).lean();

                // Prepare supporter data for emails
                const supporterData = supporters.map(s => ({
                    email: s.email,
                    name: s.name,
                    userId: s._id.toString()
                }));

                // Send email notifications
                if (supporterData.length > 0) {
                    await sendUpdateNotifications(supporterData, {
                        creatorName: creator.name,
                        campaignTitle: campaign.title,
                        campaignSlug: campaign.slug,
                        updateTitle: update.title,
                        updateSnippet: update.content.substring(0, 200),
                        updateId: update._id.toString()
                    });
                }

                // Send in-app notifications
                const supporterIds = supporters.map(s => s._id.toString());
                if (supporterIds.length > 0) {
                    await notifyCampaignUpdate(supporterIds, {
                        creatorName: creator.name,
                        campaignSlug: campaign.slug,
                        updateTitle: update.title,
                        campaignId: campaign._id.toString(),
                        updateId: update._id.toString()
                    });
                }

                results.published++;

            } catch (error) {
                console.error(`Failed to publish update ${update._id}:`, error);
                results.failed++;
                results.errors.push({
                    updateId: update._id.toString(),
                    error: error.message
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Scheduled updates processed',
            results
        });

    } catch (error) {
        console.error('Publish scheduled cron error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to publish scheduled updates' },
            { status: 500 }
        );
    }
}
