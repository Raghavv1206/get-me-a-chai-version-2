import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDb from '@/db/connectDb';
import Campaign from '@/models/Campaign';

export async function PATCH(request, { params }) {
    try {
        const session = await getServerSession();
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

        campaign.status = status;
        await campaign.save();

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
