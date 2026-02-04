import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDb from '@/db/connectDb';
import CampaignUpdate from '@/models/CampaignUpdate';

export async function POST(request, { params }) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id: updateId } = await params;

        await connectDb();

        const update = await CampaignUpdate.findById(updateId);
        if (!update) {
            return NextResponse.json(
                { success: false, message: 'Update not found' },
                { status: 404 }
            );
        }

        // Toggle like (simple implementation - can be enhanced with a likes collection)
        update.stats.likes = (update.stats.likes || 0) + 1;
        await update.save();

        return NextResponse.json({
            success: true,
            likes: update.stats.likes
        });
    } catch (error) {
        console.error('Error liking update:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to like update', error: error.message },
            { status: 500 }
        );
    }
}
