import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDb from '@/db/connectDb';
import Payment from '@/models/Payment';

export async function GET(request) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ success: false }, { status: 401 });
        }

        await connectDb();

        // Aggregate supporters from payments
        const supporters = await Payment.aggregate([
            {
                $match: {
                    to_user: session.user.username,
                    done: true,
                    status: 'success'
                }
            },
            {
                $group: {
                    _id: '$email',
                    name: { $first: '$name' },
                    email: { $first: '$email' },
                    totalContributed: { $sum: '$amount' },
                    donationsCount: { $sum: 1 },
                    firstDonation: { $min: '$createdAt' },
                    lastDonation: { $max: '$createdAt' },
                    lastAmount: { $last: '$amount' }
                }
            },
            {
                $sort: { totalContributed: -1 }
            }
        ]);

        return NextResponse.json({ success: true, supporters });
    } catch (error) {
        console.error('Error fetching supporters:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch supporters' },
            { status: 500 }
        );
    }
}
