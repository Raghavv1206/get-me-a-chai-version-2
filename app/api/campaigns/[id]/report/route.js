// app/api/campaigns/[id]/report/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDb from '@/db/connectDb';
import Campaign from '@/models/Campaign';
import Report from '@/models/Report';

export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, message: 'You must be logged in to report a campaign' },
                { status: 401 }
            );
        }

        const { id: campaignId } = await params;

        // Parse request body
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, message: 'Invalid request body' },
                { status: 400 }
            );
        }

        const { reason, description = '' } = body;

        // Validate reason
        const validReasons = [
            'spam', 'fraud', 'misleading', 'inappropriate',
            'harassment', 'intellectual_property', 'other'
        ];
        if (!reason || !validReasons.includes(reason)) {
            return NextResponse.json(
                { success: false, message: 'Please select a valid reason for reporting' },
                { status: 400 }
            );
        }

        // Validate description length
        if (description && description.length > 1000) {
            return NextResponse.json(
                { success: false, message: 'Description must be 1000 characters or less' },
                { status: 400 }
            );
        }

        // If reason is 'other', require description
        if (reason === 'other' && (!description || description.trim().length < 10)) {
            return NextResponse.json(
                { success: false, message: 'Please provide a detailed description when selecting "Other"' },
                { status: 400 }
            );
        }

        await connectDb();

        // Verify campaign exists
        const campaign = await Campaign.findById(campaignId).select('_id creator').lean();
        if (!campaign) {
            return NextResponse.json(
                { success: false, message: 'Campaign not found' },
                { status: 404 }
            );
        }

        // Prevent self-reporting
        if (campaign.creator.toString() === session.user.id) {
            return NextResponse.json(
                { success: false, message: 'You cannot report your own campaign' },
                { status: 400 }
            );
        }

        // Check for existing report (duplicate prevention)
        const existingReport = await Report.findOne({
            targetType: 'campaign',
            targetId: campaignId,
            reporter: session.user.id,
        }).lean();

        if (existingReport) {
            return NextResponse.json(
                { success: false, message: 'You have already reported this campaign. Our team is reviewing it.' },
                { status: 409 }
            );
        }

        // Create the report
        await Report.create({
            targetType: 'campaign',
            targetId: campaignId,
            reporter: session.user.id,
            reason,
            description: description.trim(),
        });

        return NextResponse.json({
            success: true,
            message: 'Report submitted successfully. Our team will review it shortly.',
        });
    } catch (error) {
        console.error('Error reporting campaign:', error);

        // Handle mongoose duplicate key error (race condition)
        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, message: 'You have already reported this campaign.' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { success: false, message: 'Failed to submit report. Please try again later.' },
            { status: 500 }
        );
    }
}
