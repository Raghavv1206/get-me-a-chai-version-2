import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDb from '@/db/connectDb';
import Campaign from '@/models/Campaign';

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

        // Validate required fields
        if (!body.title || !body.category || !body.story || !body.goalAmount || !body.endDate) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
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

        // Update allowed fields
        const allowedUpdates = [
            'title',
            'category',
            'shortDescription',
            'story',
            'goalAmount',
            'endDate',
            'coverImage',
            'videoUrl',
            'location',
            'tags',
            'milestones',
            'rewards',
            'faqs'
        ];

        allowedUpdates.forEach(field => {
            if (body[field] !== undefined) {
                campaign[field] = body[field];
            }
        });

        // Update the updatedAt timestamp
        campaign.updatedAt = new Date();

        await campaign.save();

        return NextResponse.json({
            success: true,
            campaign,
            message: 'Campaign updated successfully'
        });
    } catch (error) {
        console.error('Error updating campaign:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update campaign', error: error.message },
            { status: 500 }
        );
    }
}
