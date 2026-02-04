// app/api/campaigns/category-counts/route.js
import { NextResponse } from 'next/server';
import connectDb from '@/db/connectDb';
import Campaign from '@/models/Campaign';

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        await connectDb();

        // Aggregate campaigns by category
        const categoryCounts = await Campaign.aggregate([
            {
                $match: {
                    status: { $in: ['active', 'successful'] }
                }
            },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    totalRaised: { $sum: '$currentAmount' },
                    avgGoal: { $avg: '$goalAmount' }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        // Transform to object format
        const counts = {};
        categoryCounts.forEach(cat => {
            counts[cat._id] = {
                count: cat.count,
                totalRaised: cat.totalRaised,
                avgGoal: Math.round(cat.avgGoal)
            };
        });

        return NextResponse.json({
            counts,
            total: categoryCounts.reduce((sum, cat) => sum + cat.count, 0)
        });
    } catch (error) {
        console.error('Category counts API error:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch category counts',
                counts: {}
            },
            { status: 500 }
        );
    }
}

// Cache for 15 minutes
export const revalidate = 900;
