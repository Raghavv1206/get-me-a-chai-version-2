import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

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
        const period = searchParams.get('period') || '30';

        // Mock data - replace with actual database queries
        const data = {
            '7': {
                views: 450,
                viewsChange: 12,
                clicks: 180,
                clicksChange: 8,
                conversionRate: 4.5,
                conversionChange: 2,
                bounceRate: 48,
                bounceChange: -5
            },
            '30': {
                views: 2100,
                viewsChange: 25,
                clicks: 850,
                clicksChange: 15,
                conversionRate: 5.2,
                conversionChange: 3,
                bounceRate: 45,
                bounceChange: -8
            },
            '90': {
                views: 6500,
                viewsChange: 18,
                clicks: 2600,
                clicksChange: 12,
                conversionRate: 5.8,
                conversionChange: 5,
                bounceRate: 42,
                bounceChange: -10
            },
            'all': {
                views: 15000,
                viewsChange: 0,
                clicks: 6000,
                clicksChange: 0,
                conversionRate: 6.1,
                conversionChange: 0,
                bounceRate: 40,
                bounceChange: 0
            }
        };

        return NextResponse.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error fetching analytics overview:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch analytics', error: error.message },
            { status: 500 }
        );
    }
}
