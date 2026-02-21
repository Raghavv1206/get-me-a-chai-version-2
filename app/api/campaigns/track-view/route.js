// app/api/campaigns/track-view/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDb from '@/db/connectDb';
import Campaign from '@/models/Campaign';
import CampaignView from '@/models/CampaignView';

export async function POST(req) {
    try {
        const { campaignId } = await req.json();

        if (!campaignId) {
            return NextResponse.json(
                { error: 'Campaign ID is required' },
                { status: 400 }
            );
        }

        await connectDb();

        // Always increment the campaign's total view counter
        await Campaign.findByIdAndUpdate(
            campaignId,
            { $inc: { 'stats.views': 1 } },
            { new: true }
        );

        // For logged-in users, record in CampaignView using upsert
        // (prevents duplicate errors, updates viewedAt timestamp)
        const session = await getServerSession(authOptions);
        if (session?.user?.id) {
            try {
                await CampaignView.recordView(session.user.id, campaignId);
            } catch (err) {
                // Non-critical: don't fail the whole request if user view tracking fails
                console.error('CampaignView.recordView error:', err.message);
            }
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
