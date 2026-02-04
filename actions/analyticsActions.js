// actions/analyticsActions.js
"use server"

/**
 * Server Actions for Analytics Tracking
 * Handles event tracking and analytics data retrieval
 */

import connectDb from '@/db/connectDb';
import Analytics from '@/models/Analytics';
import Campaign from '@/models/Campaign';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Track a campaign visit
 * @param {string} campaignId - Campaign ID
 * @param {string} source - Traffic source
 * @param {string} device - Device type
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} Success or error
 */
export async function trackVisit(campaignId, source = 'direct', device = 'desktop', metadata = {}) {
    try {
        await connectDb();

        // Verify campaign exists
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return { error: 'Campaign not found' };
        }

        // Create analytics event
        await Analytics.create({
            campaign: campaignId,
            eventType: 'visit',
            source,
            device,
            metadata,
            timestamp: new Date()
        });

        return { success: true };

    } catch (error) {
        console.error('Track visit error:', error);
        return { error: error.message || 'Failed to track visit' };
    }
}

/**
 * Track a button click
 * @param {string} campaignId - Campaign ID
 * @param {string} buttonType - Type of button clicked
 * @returns {Promise<Object>} Success or error
 */
export async function trackClick(campaignId, buttonType = 'support') {
    try {
        await connectDb();

        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return { error: 'Campaign not found' };
        }

        await Analytics.create({
            campaign: campaignId,
            eventType: 'click',
            metadata: { buttonType },
            timestamp: new Date()
        });

        return { success: true };

    } catch (error) {
        console.error('Track click error:', error);
        return { error: error.message || 'Failed to track click' };
    }
}

/**
 * Track a successful conversion (payment)
 * @param {string} campaignId - Campaign ID
 * @param {number} amount - Payment amount
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} Success or error
 */
export async function trackConversion(campaignId, amount, metadata = {}) {
    try {
        await connectDb();

        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return { error: 'Campaign not found' };
        }

        await Analytics.create({
            campaign: campaignId,
            eventType: 'conversion',
            amount,
            metadata,
            timestamp: new Date()
        });

        return { success: true };

    } catch (error) {
        console.error('Track conversion error:', error);
        return { error: error.message || 'Failed to track conversion' };
    }
}

/**
 * Get analytics for a campaign
 * @param {string} campaignId - Campaign ID
 * @param {Object} dateRange - Date range filter
 * @returns {Promise<Object>} Analytics data or error
 */
export async function getAnalytics(campaignId, dateRange = {}) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { error: 'You must be logged in' };
        }

        await connectDb();

        // Verify campaign ownership
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return { error: 'Campaign not found' };
        }

        // Build date filter
        const filter = { campaign: campaignId };
        if (dateRange.start || dateRange.end) {
            filter.timestamp = {};
            if (dateRange.start) filter.timestamp.$gte = new Date(dateRange.start);
            if (dateRange.end) filter.timestamp.$lte = new Date(dateRange.end);
        }

        // Fetch analytics events
        const events = await Analytics.find(filter).sort({ timestamp: -1 }).lean();

        // Calculate metrics
        const totalViews = events.filter(e => e.eventType === 'visit').length;
        const totalClicks = events.filter(e => e.eventType === 'click').length;
        const conversions = events.filter(e => e.eventType === 'conversion');
        const totalConversions = conversions.length;
        const totalRevenue = conversions.reduce((sum, e) => sum + (e.amount || 0), 0);

        // Calculate conversion rate
        const conversionRate = totalViews > 0 ? ((totalConversions / totalViews) * 100).toFixed(2) : 0;

        // Device breakdown
        const deviceCounts = events.reduce((acc, e) => {
            if (e.device) {
                acc[e.device] = (acc[e.device] || 0) + 1;
            }
            return acc;
        }, {});

        // Source breakdown
        const sourceCounts = events.reduce((acc, e) => {
            if (e.source) {
                acc[e.source] = (acc[e.source] || 0) + 1;
            }
            return acc;
        }, {});

        // Time series data (daily)
        const dailyData = events.reduce((acc, e) => {
            const date = new Date(e.timestamp).toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = { visits: 0, clicks: 0, conversions: 0, revenue: 0 };
            }
            if (e.eventType === 'visit') acc[date].visits++;
            if (e.eventType === 'click') acc[date].clicks++;
            if (e.eventType === 'conversion') {
                acc[date].conversions++;
                acc[date].revenue += e.amount || 0;
            }
            return acc;
        }, {});

        return {
            success: true,
            analytics: {
                totalViews,
                totalClicks,
                totalConversions,
                totalRevenue,
                conversionRate: parseFloat(conversionRate),
                avgDonation: totalConversions > 0 ? (totalRevenue / totalConversions).toFixed(2) : 0,
                devices: deviceCounts,
                sources: sourceCounts,
                dailyData: Object.entries(dailyData).map(([date, data]) => ({
                    date,
                    ...data
                })).sort((a, b) => new Date(a.date) - new Date(b.date))
            }
        };

    } catch (error) {
        console.error('Get analytics error:', error);
        return { error: error.message || 'Failed to fetch analytics' };
    }
}

/**
 * Get platform-wide statistics
 * @returns {Promise<Object>} Platform stats or error
 */
export async function getPlatformStats() {
    try {
        await connectDb();

        const [
            totalCampaigns,
            activeCampaigns,
            totalRevenue,
            totalConversions
        ] = await Promise.all([
            Campaign.countDocuments(),
            Campaign.countDocuments({ status: 'active' }),
            Analytics.aggregate([
                { $match: { eventType: 'conversion' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Analytics.countDocuments({ eventType: 'conversion' })
        ]);

        return {
            success: true,
            stats: {
                totalCampaigns,
                activeCampaigns,
                totalRevenue: totalRevenue[0]?.total || 0,
                totalDonations: totalConversions
            }
        };

    } catch (error) {
        console.error('Get platform stats error:', error);
        return { error: error.message || 'Failed to fetch platform stats' };
    }
}
