// app/api/campaigns/[id]/status/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDb from '@/db/connectDb';
import Campaign from '@/models/Campaign';
import User from '@/models/User';
import { notifyCampaignStatusChange, notifyCampaignCompleted, getSupporterIdsForCampaign } from '@/lib/notifications';

export async function PATCH(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id: campaignId } = await params;
        const body = await request.json();
        const { status } = body;

        if (!['active', 'paused', 'completed'].includes(status)) {
            return NextResponse.json(
                { success: false, message: 'Invalid status' },
                { status: 400 }
            );
        }

        await connectDb();

        // ── Razorpay credentials check when publishing/re-activating a campaign ──
        // Supporters do NOT need Razorpay credentials — this only gates CREATORS.
        if (status === 'active') {
            const creator = await User.findById(session.user.id)
                .select('razorpayid razorpaysecret')
                .lean();
            const hasRazorpayId = !!(creator?.razorpayid?.trim());
            const hasRazorpaySecret = !!(creator?.razorpaysecret?.trim());

            if (!hasRazorpayId || !hasRazorpaySecret) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            'You must save your Razorpay Key ID and Secret in Settings before publishing a campaign. ' +
                            'Go to Dashboard → Settings → Payment Settings.',
                        code: 'RAZORPAY_CREDENTIALS_MISSING',
                    },
                    { status: 422 }
                );
            }
        }

        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return NextResponse.json(
                { success: false, message: 'Campaign not found' },
                { status: 404 }
            );
        }

        // Verify ownership
        if (campaign.creator.toString() !== session.user.id) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 403 }
            );
        }

        const oldStatus = campaign.status;
        campaign.status = status;
        await campaign.save();

        // Notify creator about status change
        if (oldStatus !== status) {
            await notifyCampaignStatusChange({
                creatorId: session.user.id,
                campaignTitle: campaign.title,
                campaignId: campaign._id,
                oldStatus,
                newStatus: status,
            });

            // When campaign is completed, notify all supporters
            if (status === 'completed') {
                try {
                    const supporterIds = await getSupporterIdsForCampaign(
                        campaign._id,
                        campaign.creator.toString()
                    );
                    if (supporterIds.length > 0) {
                        await notifyCampaignCompleted({
                            supporterIds,
                            campaignTitle: campaign.title,
                            campaignSlug: campaign.username ? `${campaign.username}/${campaign.slug}` : null,
                            campaignId: campaign._id,
                            currentAmount: campaign.currentAmount,
                            goalAmount: campaign.goalAmount,
                        });
                    }
                } catch (notifyError) {
                    console.error('Failed to notify supporters about campaign completion:', notifyError);
                }
            }
        }

        return NextResponse.json({
            success: true,
            campaign
        });
    } catch (error) {
        console.error('Error updating campaign status:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update campaign status', error: error.message },
            { status: 500 }
        );
    }
}
