// app/api/cron/close-expired-campaigns/route.js
/**
 * Cron Job: Close Expired Campaigns
 * 
 * Automatically marks campaigns as 'completed' when their endDate has passed.
 * Can be called periodically (e.g., every hour) via a cron service, or manually.
 * 
 * Security: Protected by CRON_SECRET in production.
 */

import { NextResponse } from 'next/server';
import connectDb from '@/db/connectDb';
import { closeExpiredCampaigns } from '@/lib/campaignExpiry';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        // In production, verify cron secret
        if (process.env.NODE_ENV === 'production') {
            const { searchParams } = new URL(request.url);
            const secret = searchParams.get('secret');
            if (secret !== process.env.CRON_SECRET) {
                return NextResponse.json(
                    { success: false, message: 'Unauthorized' },
                    { status: 401 }
                );
            }
        }

        await connectDb();

        // Bulk close all expired campaigns
        const result = await closeExpiredCampaigns();

        console.log(`[Cron] Closed ${result.modifiedCount} expired campaigns`);

        return NextResponse.json({
            success: true,
            message: `Closed ${result.modifiedCount} expired campaigns`,
            modifiedCount: result.modifiedCount,
            matchedCount: result.matchedCount,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('[Cron] Error closing expired campaigns:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to close expired campaigns', error: error.message },
            { status: 500 }
        );
    }
}

// Also support POST for webhook-style cron services
export async function POST(request) {
    return GET(request);
}
