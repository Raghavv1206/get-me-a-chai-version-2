// app/api/campaigns/create/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDb from '@/db/connectDb';
import Campaign from '@/models/Campaign';
import { createLogger } from '@/lib/logger';
import { validateNumber, validateString, ValidationError } from '@/lib/validation';
import { resolveCoverImage } from '@/lib/categoryImages';

const logger = createLogger('API:CreateCampaign');

export async function POST(req) {
    const startTime = Date.now();

    try {
        // 1. Authentication
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            logger.warn('Unauthorized campaign creation attempt');
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDb();
        const campaignData = await req.json();

        logger.info('Campaign creation request', {
            userId: session.user.id,
            hasTitle: !!campaignData.title,
            hasStory: !!campaignData.story,
            hasGoal: !!campaignData.goal,
            category: campaignData.category
        });

        // 3. Input validation
        let validatedData;
        try {
            validatedData = {
                title: validateString(campaignData.title, {
                    fieldName: 'Title',
                    minLength: 5,
                    maxLength: 100
                }),
                story: validateString(campaignData.story, {
                    fieldName: 'Story',
                    minLength: 50,
                    maxLength: 10000
                }),
                goal: validateNumber(campaignData.goal, {
                    fieldName: 'Goal',
                    min: 1000,
                    max: 10000000,
                    integer: true
                }),
                category: validateString(campaignData.category, {
                    fieldName: 'Category',
                    minLength: 2,
                    maxLength: 50
                })
            };
        } catch (error) {
            if (error instanceof ValidationError) {
                logger.warn('Validation failed', {
                    field: error.field,
                    message: error.message
                });
                return NextResponse.json(
                    { error: error.message, field: error.field },
                    { status: 400 }
                );
            }
            throw error;
        }

        // 4. Generate unique slug
        const baseSlug = validatedData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        const slug = `${baseSlug}-${Date.now()}`;

        // 5. Calculate end date
        const duration = campaignData.duration || 30;
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + duration);

        logger.info('Creating campaign', {
            title: validatedData.title,
            slug,
            goal: validatedData.goal,
            duration
        });

        // 6. Create campaign
        const campaign = await Campaign.create({
            // Basic info
            title: validatedData.title,
            slug: slug,
            category: validatedData.category,
            projectType: campaignData.projectType || '',

            // Creator
            creator: session.user.id,
            username: session.user.name || session.user.email,

            // Story
            brief: campaignData.brief || '',
            hook: campaignData.hook || '',
            story: validatedData.story,
            shortDescription: campaignData.brief?.substring(0, 200) || validatedData.story.substring(0, 200),
            aiGenerated: campaignData.aiGenerated || false,

            // Funding
            goalAmount: validatedData.goal,
            currentAmount: 0,

            // Timeline
            startDate: new Date(),
            endDate: endDate,

            // Media
            coverImage: resolveCoverImage(campaignData.coverImage, validatedData.category),
            images: campaignData.gallery || [],
            videoUrl: campaignData.videoUrl || '',

            // Content
            milestones: campaignData.milestones || [],
            rewards: campaignData.rewards || [],
            faqs: campaignData.faqs || [],

            // Status
            status: 'active',
            publishedAt: new Date(),

            // Location
            location: campaignData.location || '',

            // Stats
            stats: {
                views: 0,
                supporters: 0,
                shares: 0,
                comments: 0
            }
        });

        const duration_ms = Date.now() - startTime;
        logger.info('Campaign created successfully', {
            campaignId: campaign._id,
            slug: campaign.slug,
            duration: duration_ms
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
        const duration_ms = Date.now() - startTime;
        logger.error('Campaign creation failed', {
            error: error.message,
            stack: error.stack,
            duration: duration_ms
        });

        return NextResponse.json(
            {
                error: 'Failed to create campaign. Please try again.',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}
