import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDb from '@/db/connectDb';
import Campaign from '@/models/Campaign';

export async function GET(request) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const filter = searchParams.get('filter') || 'all';
        const sort = searchParams.get('sort') || 'recent';

        await connectDb();

        // Build query
        let query = { creator: session.user.id };

        if (filter !== 'all') {
            query.status = filter;
        }

        // Build sort
        let sortCriteria = {};
        switch (sort) {
            case 'oldest':
                sortCriteria = { createdAt: 1 };
                break;
            case 'most-funded':
                sortCriteria = { currentAmount: -1 };
                break;
            default: // recent
                sortCriteria = { createdAt: -1 };
        }

        const campaigns = await Campaign.find(query)
            .sort(sortCriteria)
            .populate('creator', 'username name')
            .lean();

        return NextResponse.json({
            success: true,
            campaigns
        });
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch campaigns', error: error.message },
            { status: 500 }
        );
    }
}
