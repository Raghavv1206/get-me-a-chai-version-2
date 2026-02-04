import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET(request) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ success: false }, { status: 401 });
        }

        const data = [
            { source: 'direct', name: 'Direct', value: 1200, percentage: 40 },
            { source: 'social', name: 'Social Media', value: 900, percentage: 30 },
            { source: 'search', name: 'Search Engines', value: 600, percentage: 20 },
            { source: 'referral', name: 'Referrals', value: 240, percentage: 8 },
            { source: 'other', name: 'Other', value: 60, percentage: 2 }
        ];

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching traffic sources:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch traffic sources' },
            { status: 500 }
        );
    }
}
