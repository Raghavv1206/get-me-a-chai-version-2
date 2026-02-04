import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDb from '@/db/connectDb';
import Campaign from '@/models/Campaign';

export async function POST(request, { params }) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id: campaignId } = await params;

        await connectDb();

        const originalCampaign = await Campaign.findById(campaignId).lean();
        if (!originalCampaign) {
            return NextResponse.json(
                { success: false, message: 'Campaign not found' },
                { status: 404 }
            );
        }

        // Verify ownership
        if (originalCampaign.creator.toString() !== session.user.id) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Create duplicate as draft
        const duplicateData = {
            ...originalCampaign,
            _id: undefined,
            title: `${originalCampaign.title} (Copy)`,
            status: 'draft',
            currentAmount: 0,
            stats: {
                views: 0,
                supporters: 0,
                comments: 0,
                shares: 0
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const duplicateCampaign = await Campaign.create(duplicateData);

        return NextResponse.json({
            success: true,
            campaign: duplicateCampaign
        });
    } catch (error) {
        console.error('Error duplicating campaign:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to duplicate campaign', error: error.message },
            { status: 500 }
        );
    }
}
