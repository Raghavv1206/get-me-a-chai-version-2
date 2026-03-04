import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDb from '@/db/connectDb';
import Comment from '@/models/Comment';
import Campaign from '@/models/Campaign';
import User from '@/models/User';
import { notifyNewComment, notifyCommentReply } from '@/lib/notifications';

export async function GET(request, { params }) {
    try {
        const { id: campaignId } = await params;
        const { searchParams } = new URL(request.url);
        const sort = searchParams.get('sort') || 'newest';

        await connectDb();

        // Build sort criteria
        let sortCriteria = {};
        switch (sort) {
            case 'oldest':
                sortCriteria = { createdAt: 1 };
                break;
            case 'top':
                sortCriteria = { likes: -1, createdAt: -1 };
                break;
            default: // newest
                sortCriteria = { createdAt: -1 };
        }

        // Get top-level comments (no parent)
        const comments = await Comment.find({
            campaign: campaignId,
            parentComment: null,
            deleted: false
        })
            .sort(sortCriteria)
            .populate('user', 'name profilepic')
            .lean();

        // Get replies for each comment
        const commentsWithReplies = await Promise.all(
            comments.map(async (comment) => {
                const replies = await Comment.find({
                    parentComment: comment._id,
                    deleted: false
                })
                    .sort({ createdAt: 1 })
                    .populate('user', 'name profilepic')
                    .lean();

                return {
                    ...comment,
                    replies
                };
            })
        );

        return NextResponse.json({
            success: true,
            comments: commentsWithReplies
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch comments', error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request, { params }) {
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
        const { content, parentComment } = body;

        if (!content || content.trim().length === 0) {
            return NextResponse.json(
                { success: false, message: 'Comment content is required' },
                { status: 400 }
            );
        }

        await connectDb();

        // Verify campaign exists
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return NextResponse.json(
                { success: false, message: 'Campaign not found' },
                { status: 404 }
            );
        }

        // Validate user ID
        if (!session.user?.id) {
            console.error('User ID not found in session:', session);
            return NextResponse.json(
                { success: false, message: 'User ID not found in session' },
                { status: 400 }
            );
        }

        console.log('Creating comment with user ID:', session.user.id);

        // Create comment
        const comment = await Comment.create({
            campaign: campaignId,
            user: session.user.id,
            content: content.trim(),
            parentComment: parentComment || null
        });

        // Update campaign comment count
        await Campaign.findByIdAndUpdate(campaignId, {
            $inc: { 'stats.comments': 1 }
        });

        // Populate user data
        await comment.populate('user', 'name profilepic');

        // --- Send notifications ---
        const commenterUser = await User.findById(session.user.id).select('name username').lean();
        const commenterName = commenterUser?.name || session.user?.name || 'Someone';

        if (parentComment) {
            // This is a reply — notify the original comment author
            const parentCommentDoc = await Comment.findById(parentComment).select('user').lean();
            if (parentCommentDoc?.user) {
                await notifyCommentReply({
                    commentOwnerId: parentCommentDoc.user,
                    replierId: session.user.id,
                    replierName: commenterName,
                    campaignTitle: campaign.title,
                    campaignSlug: campaign.username ? `${campaign.username}/${campaign.slug}` : null,
                    campaignId: campaignId,
                    replyPreview: content.trim(),
                });
            }
        }

        // Always notify the campaign creator (unless commenter IS the creator)
        if (campaign.creator) {
            await notifyNewComment({
                creatorId: campaign.creator,
                commenterId: session.user.id,
                commenterName: commenterName,
                campaignTitle: campaign.title,
                campaignSlug: campaign.username ? `${campaign.username}/${campaign.slug}` : null,
                campaignId: campaignId,
                commentPreview: content.trim(),
            });
        }

        return NextResponse.json({
            success: true,
            comment
        });
    } catch (error) {
        console.error('Error creating comment:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create comment', error: error.message },
            { status: 500 }
        );
    }
}
