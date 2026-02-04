import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDb from '@/db/connectDb';
import Comment from '@/models/Comment';
import Campaign from '@/models/Campaign';

export async function POST(request, { params }) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id: commentId } = await params;

        await connectDb();

        const comment = await Comment.findById(commentId).populate('campaign');
        if (!comment) {
            return NextResponse.json(
                { success: false, message: 'Comment not found' },
                { status: 404 }
            );
        }

        // Check if user is the campaign creator
        const campaign = await Campaign.findById(comment.campaign).populate('creator');
        if (campaign.creator._id.toString() !== session.user.id) {
            return NextResponse.json(
                { success: false, message: 'Only the campaign creator can pin comments' },
                { status: 403 }
            );
        }

        // Unpin all other comments first
        await Comment.updateMany(
            { campaign: comment.campaign, pinned: true },
            { pinned: false }
        );

        // Pin this comment
        comment.pinned = !comment.pinned;
        await comment.save();

        return NextResponse.json({
            success: true,
            pinned: comment.pinned
        });
    } catch (error) {
        console.error('Error pinning comment:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to pin comment', error: error.message },
            { status: 500 }
        );
    }
}
