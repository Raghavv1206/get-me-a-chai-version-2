import { NextResponse } from 'next/server';
import connectDb from '@/db/connectDb';
import CampaignUpdate from '@/models/CampaignUpdate';
import Campaign from '@/models/Campaign';
import Payment from '@/models/Payment';
import User from '@/models/User';
import { notifyCampaignUpdate } from '@/lib/notifications';

export async function GET(request, { params }) {
    try {
        const { id: campaignId } = await params;
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        await connectDb();

        // Get updates for the campaign
        const updates = await CampaignUpdate.find({
            campaign: campaignId,
            status: 'published'
        })
            .sort({ publishDate: -1 })
            .skip(skip)
            .limit(limit)
            .populate('creator', 'name profilepic')
            .lean();

        const total = await CampaignUpdate.countDocuments({
            campaign: campaignId,
            status: 'published'
        });

        return NextResponse.json({
            success: true,
            updates,
            hasMore: skip + updates.length < total,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error fetching updates:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch updates', error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request, { params }) {
    try {
        const { id: campaignId } = await params;
        const body = await request.json();
        const { title, content, images, visibility, creatorId } = body;

        if (!title || !content || !creatorId) {
            return NextResponse.json(
                { success: false, message: 'Title, content, and creatorId are required' },
                { status: 400 }
            );
        }

        await connectDb();

        // Normalize visibility to match the Mongoose enum
        const VALID_VISIBILITY = ['public', 'supporters-only'];
        let normalizedVisibility = 'public';
        if (visibility && typeof visibility === 'string') {
            const v = visibility.trim().toLowerCase();
            if (VALID_VISIBILITY.includes(v)) {
                normalizedVisibility = v;
            } else if (v.includes('supporter')) {
                normalizedVisibility = 'supporters-only';
            }
        }

        const update = await CampaignUpdate.create({
            campaign: campaignId,
            creator: creatorId,
            title: title.trim(),
            content,
            images: Array.isArray(images) ? images : [],
            visibility: normalizedVisibility,
            status: 'published',
            publishDate: new Date()
        });

        // Notify all supporters of this campaign about the update
        try {
            const campaign = await Campaign.findById(campaignId).select('title slug username').lean();
            const creator = await User.findById(creatorId).select('name username').lean();

            if (campaign && creator) {
                // Find all unique supporters who paid for this campaign
                const payments = await Payment.find({
                    campaign: campaignId,
                    done: true,
                    status: 'success',
                }).select('userId').lean();

                const supporterIds = [...new Set(
                    payments
                        .map(p => p.userId?.toString())
                        .filter(id => id && id !== creatorId?.toString())
                )];

                if (supporterIds.length > 0) {
                    await notifyCampaignUpdate({
                        supporterIds,
                        creatorName: creator.name || creator.username || 'The creator',
                        campaignTitle: campaign.title,
                        campaignSlug: campaign.username ? `${campaign.username}/${campaign.slug}` : null,
                        campaignId,
                        updateTitle: title,
                    });
                }
            }
        } catch (notifyError) {
            // Don't fail the update if notification fails
            console.error('Failed to notify supporters about campaign update:', notifyError);
        }

        return NextResponse.json({
            success: true,
            update
        });
    } catch (error) {
        console.error('Error creating update:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create update', error: error.message },
            { status: 500 }
        );
    }
}
