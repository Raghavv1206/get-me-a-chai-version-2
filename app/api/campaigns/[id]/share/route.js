// app/api/campaigns/[id]/share/route.js
import { NextResponse } from 'next/server';
import connectDb from '@/db/connectDb';
import Campaign from '@/models/Campaign';

export async function POST(request, { params }) {
    try {
        const { id: campaignId } = await params;

        if (!campaignId) {
            return NextResponse.json(
                { success: false, message: 'Campaign ID is required' },
                { status: 400 }
            );
        }

        await connectDb();

        const campaign = await Campaign.findByIdAndUpdate(
            campaignId,
            { $inc: { 'stats.shares': 1 } },
            { new: true }
        );

        if (!campaign) {
            return NextResponse.json(
                { success: false, message: 'Campaign not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            shares: campaign.stats?.shares || 0,
        });
    } catch (error) {
        console.error('Error tracking share:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to track share' },
            { status: 500 }
        );
    }
}
