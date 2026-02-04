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

        // TODO: Implement actual reporting system (email admin, flag in database, etc.)
        // For now, just log it
        console.log(`Comment ${commentId} reported by user ${session.user.id}`);

        return NextResponse.json({
            success: true,
            message: 'Comment reported successfully. Our team will review it.'
        });
    } catch (error) {
        console.error('Error reporting comment:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to report comment', error: error.message },
            { status: 500 }
        );
    }
}
