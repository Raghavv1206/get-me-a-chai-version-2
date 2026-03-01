// app/api/campaigns/track-view/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDb from '@/db/connectDb';
import Campaign from '@/models/Campaign';
import CampaignView from '@/models/CampaignView';
import Analytics from '@/models/Analytics';

export async function POST(req) {
    try {
        const body = await req.json();
        const {
            campaignId,
            referrer = '',
            utmSource = '',
            utmMedium = '',
            utmCampaign = '',
        } = body;

        if (!campaignId) {
            return NextResponse.json(
                { error: 'Campaign ID is required' },
                { status: 400 }
            );
        }

        // Validate campaignId format
        if (typeof campaignId !== 'string' || campaignId.length < 12) {
            return NextResponse.json(
                { error: 'Invalid campaign ID format' },
                { status: 400 }
            );
        }

        await connectDb();

        // Always increment the campaign's total view counter
        const campaign = await Campaign.findByIdAndUpdate(
            campaignId,
            { $inc: { 'stats.views': 1 } },
            { new: true }
        );

        if (!campaign) {
            return NextResponse.json(
                { error: 'Campaign not found' },
                { status: 404 }
            );
        }

        // Classify the traffic source from referrer and UTM params
        const source = Analytics.classifySource(referrer, {
            utmSource,
            utmMedium,
            utmCampaign,
        });

        // Detect device type from user-agent header
        const userAgent = req.headers.get('user-agent') || '';
        const device = Analytics.detectDevice(userAgent);

        // Get user session (optional, for logged-in users)
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id || null;

        // Record analytics event (fire-and-forget for speed,
        // but we still await to ensure it's written)
        try {
            await Analytics.create({
                campaign: campaignId,
                date: new Date(),
                eventType: 'visit',
                source,
                referrer: (referrer || '').substring(0, 2048), // Truncate long referrers
                utmSource: (utmSource || '').substring(0, 255),
                utmMedium: (utmMedium || '').substring(0, 255),
                utmCampaign: (utmCampaign || '').substring(0, 255),
                device,
                userId: userId || undefined,
                metadata: {
                    userAgent: userAgent.substring(0, 512), // Store truncated UA
                },
            });
        } catch (analyticsErr) {
            // Non-critical: analytics recording shouldn't block the response
            console.error('Analytics recording error:', analyticsErr.message);
        }

        // For logged-in users, record in CampaignView using upsert
        // (prevents duplicate errors, updates viewedAt timestamp)
        if (userId) {
            try {
                await CampaignView.recordView(userId, campaignId);
            } catch (err) {
                // Non-critical: don't fail the whole request if user view tracking fails
                console.error('CampaignView.recordView error:', err.message);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Track view error:', error);
        return NextResponse.json(
            { error: 'Failed to track view' },
            { status: 500 }
        );
    }
}
