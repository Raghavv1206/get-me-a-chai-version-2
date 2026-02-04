// app/api/campaigns/draft/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDb from '@/db/connectDb';
import Campaign from '@/models/Campaign';

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDb();
        const campaignData = await req.json();

        // Generate slug from title
        const slug = campaignData.title
            ?.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '') || 'untitled';

        // Create campaign
        const campaign = await Campaign.create({
            ...campaignData,
            creator: session.user.id,
            username: session.user.name,
            slug: `${slug}-${Date.now()}`,
            goalAmount: campaignData.goal,
            status: 'draft',
            endDate: new Date(Date.now() + campaignData.duration * 24 * 60 * 60 * 1000),
        });

        return NextResponse.json(
            { campaignId: campaign._id, message: 'Draft saved successfully' },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error saving draft:', error);
        return NextResponse.json(
            { error: 'Failed to save draft' },
            { status: 500 }
        );
    }
}
