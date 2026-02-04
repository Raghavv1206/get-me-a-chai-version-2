import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDb from '@/db/connectDb';
import Comment from '@/models/Comment';
import Campaign from '@/models/Campaign';

export async function DELETE(request, { params }) {
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

        // Check if user is comment owner or campaign creator or admin
        const campaign = await Campaign.findById(comment.campaign).populate('creator');
        const isOwner = comment.user.toString() === session.user.id;
        const isCreator = campaign.creator._id.toString() === session.user.id;
        const isAdmin = session.user.role === 'admin';

        if (!isOwner && !isCreator && !isAdmin) {
            return NextResponse.json(
                { success: false, message: 'You do not have permission to delete this comment' },
                { status: 403 }
            );
        }

        // Soft delete
        comment.deleted = true;
        comment.content = '[This comment has been deleted]';
        await comment.save();

        // Update campaign comment count
        await Campaign.findByIdAndUpdate(comment.campaign, {
            $inc: { 'stats.comments': -1 }
        });

        return NextResponse.json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting comment:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to delete comment', error: error.message },
            { status: 500 }
        );
    }
}
