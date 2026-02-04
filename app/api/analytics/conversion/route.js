import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET(request) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ success: false }, { status: 401 });
        }

        const data = {
            views: 5000,
            clicks: 2000,
            donations: 250,
            steps: [
                { name: 'Views', value: 5000, color: '#3b82f6' },
                { name: 'Clicks', value: 2000, color: '#10b981' },
                { name: 'Donations', value: 250, color: '#f59e0b' }
            ]
        };

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching conversion data:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch conversion data' },
            { status: 500 }
        );
    }
}
