// app/api/cron/publish-scheduled/route.js
// Publish Scheduled Updates Cron Job
// Runs every 5 minutes to publish scheduled campaign updates
// Vercel Cron: { "crons": [{ "path": "/api/cron/publish-scheduled", "schedule": "0/5 * * * *" }] }

import { NextResponse } from 'next/server';
import connectDb from '@/db/connectDb';
import CampaignUpdate from '@/models/CampaignUpdate';
import Campaign from '@/models/Campaign';
import User from '@/models/User';
import { sendUpdateNotifications } from '@/actions/emailActions';
import { notifyCampaignUpdate, getSupporterIdsForCampaign } from '@/lib/notifications';

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

                // Get all supporters of this campaign (using shared utility)
                const supporterIds = await getSupporterIdsForCampaign(
                    campaign._id,
                    campaign.creator?.toString()
                );

                // Get supporter user records for email notifications
                const supporters = supporterIds.length > 0
                    ? await User.find({ _id: { $in: supporterIds } }).select('email name').lean()
                    : [];

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
                if (supporterIds.length > 0) {
                    await notifyCampaignUpdate({
                        supporterIds,
                        creatorName: creator.name,
                        campaignTitle: campaign.title,
                        campaignSlug: campaign.username ? `${campaign.username}/${campaign.slug}` : campaign.slug,
                        campaignId: campaign._id.toString(),
                        updateTitle: update.title,
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
