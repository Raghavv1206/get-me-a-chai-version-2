import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET(request) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ success: false }, { status: 401 });
        }

        const data = {
            cities: [
                { name: 'Mumbai', value: 450 },
                { name: 'Delhi', value: 380 },
                { name: 'Bangalore', value: 320 },
                { name: 'Hyderabad', value: 280 },
                { name: 'Chennai', value: 250 },
                { name: 'Pune', value: 220 },
                { name: 'Kolkata', value: 180 },
                { name: 'Ahmedabad', value: 150 },
                { name: 'Jaipur', value: 120 },
                { name: 'Lucknow', value: 100 }
            ]
        };

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching geographic data:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch geographic data' },
            { status: 500 }
        );
    }
}
