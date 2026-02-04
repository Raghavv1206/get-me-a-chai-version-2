import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET(request) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ success: false }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '30');

        // Generate time-series data
        const data = Array.from({ length: days }, (_, i) => ({
            date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
            unique: Math.floor(Math.random() * 100) + 50,
            returning: Math.floor(Math.random() * 50) + 20
        }));

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching visitor data:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch visitor data' },
            { status: 500 }
        );
    }
}
