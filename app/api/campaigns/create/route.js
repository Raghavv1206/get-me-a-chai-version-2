// app/api/campaigns/create/route.js
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

        // Validation
        if (!campaignData.title || !campaignData.story || !campaignData.goal) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Generate unique slug
        const baseSlug = campaignData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        const slug = `${baseSlug}-${Date.now()}`;

        // Calculate end date
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + (campaignData.duration || 30));

        // Create campaign
        const campaign = await Campaign.create({
            // Basic info
            title: campaignData.title,
            slug: slug,
            category: campaignData.category,
            projectType: campaignData.projectType,

            // Creator
            creator: session.user.id,
            username: session.user.name,

            // Story
            brief: campaignData.brief,
            hook: campaignData.hook,
            story: campaignData.story,
            shortDescription: campaignData.brief?.substring(0, 200),
            aiGenerated: true,

            // Funding
            goalAmount: campaignData.goal,
            currentAmount: 0,

            // Timeline
            startDate: new Date(),
            endDate: endDate,

            // Media
            coverImage: campaignData.coverImage,
            images: campaignData.gallery || [],
            videoUrl: campaignData.videoUrl,

            // Content
            milestones: campaignData.milestones || [],
            rewards: campaignData.rewards || [],
            faqs: campaignData.faqs || [],

            // Status
            status: 'active',
            publishedAt: new Date(),

            // Location
            location: campaignData.location,
        });

        return NextResponse.json(
            {
                campaignId: campaign._id,
                slug: campaign.slug,
                message: 'Campaign published successfully!'
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating campaign:', error);
        return NextResponse.json(
            { error: 'Failed to create campaign' },
            { status: 500 }
        );
    }
}
