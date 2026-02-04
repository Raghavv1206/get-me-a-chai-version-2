import { NextResponse } from 'next/server';
import connectDb from '@/db/connectDb';
import CampaignUpdate from '@/models/CampaignUpdate';

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

        await connectDb();

        const update = await CampaignUpdate.create({
            campaign: campaignId,
            creator: creatorId,
            title,
            content,
            images: images || [],
            visibility: visibility || 'public',
            status: 'published',
            publishDate: new Date()
        });

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
