// app/api/campaigns/draft/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDb from '@/db/connectDb';
import Campaign from '@/models/Campaign';
import { createLogger } from '@/lib/logger';
import { validateNumber, validateString, ValidationError } from '@/lib/validation';
import { resolveCoverImage } from '@/lib/categoryImages';

const logger = createLogger('API:SaveDraft');

export async function POST(req) {
    const startTime = Date.now();

    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            logger.warn('Unauthorized draft save attempt');
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDb();
        const campaignData = await req.json();

        logger.info('Draft save request', {
            userId: session.user.id,
            hasTitle: !!campaignData.title,
            hasStory: !!campaignData.story,
            hasGoal: !!campaignData.goal
        });

        // For drafts, provide defaults for required fields
        const title = campaignData.title || 'Untitled Campaign';
        const story = campaignData.story || 'Draft in progress...';
        const goal = campaignData.goal || 10000;

        // Generate slug from title
        const baseSlug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        const slug = `${baseSlug}-${Date.now()}`;

        // Calculate end date
        const duration = campaignData.duration || 30;
        const endDate = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);

        // Create draft campaign with all required fields
        const campaign = await Campaign.create({
            // Required fields (with defaults for drafts)
            title,
            story,
            slug,
            category: campaignData.category || 'other',
            goalAmount: goal,
            endDate,

            // Creator info
            creator: session.user.id,
            username: session.user.name || session.user.email,

            // Optional fields from campaign data
            brief: campaignData.brief || '',
            hook: campaignData.hook || '',
            shortDescription: campaignData.brief?.substring(0, 200) || '',
            projectType: campaignData.projectType || '',

            // Media
            coverImage: resolveCoverImage(campaignData.coverImage, campaignData.category || 'other'),
            images: campaignData.gallery || [],
            videoUrl: campaignData.videoUrl || '',

            // Content
            milestones: campaignData.milestones || [],
            rewards: campaignData.rewards || [],
            faqs: campaignData.faqs || [],

            // Location
            location: campaignData.location || '',

            // Status
            status: 'draft',
            aiGenerated: campaignData.aiGenerated || false,

            // Stats
            currentAmount: 0,
            stats: {
                views: 0,
                supporters: 0,
                shares: 0,
                comments: 0
            }
        });

        const duration_ms = Date.now() - startTime;
        logger.info('Draft saved successfully', {
            campaignId: campaign._id,
            duration: duration_ms
        });

        return NextResponse.json(
            {
                campaignId: campaign._id,
                slug: campaign.slug,
                message: 'Draft saved successfully'
            },
            { status: 201 }
        );

    } catch (error) {
        const duration_ms = Date.now() - startTime;
        logger.error('Draft save failed', {
            error: error.message,
            stack: error.stack,
            duration: duration_ms
        });

        return NextResponse.json(
            {
                error: 'Failed to save draft',
                details: error.message
            },
            { status: 500 }
        );
    }
}
