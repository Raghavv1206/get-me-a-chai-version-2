import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET(request) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ success: false }, { status: 401 });
        }

        const data = [
            { device: 'mobile', name: 'Mobile', value: 1800, percentage: 60 },
            { device: 'desktop', name: 'Desktop', value: 900, percentage: 30 },
            { device: 'tablet', name: 'Tablet', value: 300, percentage: 10 }
        ];

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching device data:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch device data' },
            { status: 500 }
        );
    }
}
