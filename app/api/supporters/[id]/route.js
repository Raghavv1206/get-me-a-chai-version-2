import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDb from '@/db/connectDb';
import Payment from '@/models/Payment';

export async function GET(request, { params }) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ success: false }, { status: 401 });
        }

        const { id: supporterId } = await params;

        await connectDb();

        // Get supporter details and contribution history
        const contributions = await Payment.find({
            email: supporterId,
            to_user: session.user.username,
            done: true
        })
            .populate('campaign', 'title')
            .sort({ createdAt: -1 })
            .lean();

        if (contributions.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Supporter not found' },
                { status: 404 }
            );
        }

        const supporter = {
            _id: supporterId,
            name: contributions[0].name,
            email: contributions[0].email,
            totalContributed: contributions.reduce((sum, c) => sum + c.amount, 0),
            donationsCount: contributions.length,
            firstDonation: contributions[contributions.length - 1].createdAt,
            lastDonation: contributions[0].createdAt,
            lastAmount: contributions[0].amount,
            lastCampaign: contributions[0].campaign?.title,
            contributions
        };

        return NextResponse.json({ success: true, supporter });
    } catch (error) {
        console.error('Error fetching supporter details:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch supporter details' },
            { status: 500 }
        );
    }
}
