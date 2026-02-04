import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDb from '@/db/connectDb';
import Comment from '@/models/Comment';

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

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return NextResponse.json(
                { success: false, message: 'Comment not found' },
                { status: 404 }
            );
        }

        // Toggle like
        comment.likes = (comment.likes || 0) + 1;
        await comment.save();

        return NextResponse.json({
            success: true,
            likes: comment.likes
        });
    } catch (error) {
        console.error('Error liking comment:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to like comment', error: error.message },
            { status: 500 }
        );
    }
}
