import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDb from '@/db/connectDb';
import Campaign from '@/models/Campaign';

export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id: campaignId } = await params;

        await connectDb();

        const campaign = await Campaign.findById(campaignId)
            .populate('creator', 'name email username profilePicture')
            .lean();

        if (!campaign) {
            return NextResponse.json(
                { success: false, message: 'Campaign not found' },
                { status: 404 }
            );
        }

        // Verify ownership
        if (campaign.creator._id.toString() !== session.user.id) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 403 }
            );
        }

        return NextResponse.json({
            success: true,
            campaign
        });
    } catch (error) {
        console.error('Error fetching campaign:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch campaign', error: error.message },
            { status: 500 }
        );
    }
}
