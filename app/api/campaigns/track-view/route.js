// app/api/campaigns/track-view/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDb from '@/db/connectDb';
import Campaign from '@/models/Campaign';
import CampaignView from '@/models/CampaignView';

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        const { campaignId } = await req.json();

        if (!campaignId) {
            return NextResponse.json(
                { error: 'Campaign ID is required' },
                { status: 400 }
            );
        }

        await connectDb();

        // Increment campaign view count
        await Campaign.findByIdAndUpdate(
            campaignId,
            { $inc: { 'stats.views': 1 } },
            { new: true }
        );

        // Track view for logged-in users (for recommendation algorithm)
        if (session?.user?.id) {
            await CampaignView.create({
                userId: session.user.id,
                campaignId,
                viewedAt: new Date(),
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Track view error:', error);
        return NextResponse.json(
            { error: 'Failed to track view' },
            { status: 500 }
        );
    }
}
