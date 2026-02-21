// lib/campaignExpiry.js
/**
 * Utility to close expired campaigns.
 * 
 * Standalone function instead of a Mongoose static method to avoid
 * Next.js hot-reload model caching issues where statics added after
 * initial model registration are not available.
 */

import Campaign from '@/models/Campaign';

/**
 * Bulk-close all active/paused campaigns whose endDate has passed.
 * Sets their status to 'completed'.
 * 
 * @returns {Promise<{matchedCount: number, modifiedCount: number}>}
 */
export async function closeExpiredCampaigns() {
    const now = new Date();
    const result = await Campaign.updateMany(
        {
            status: { $in: ['active', 'paused'] },
            endDate: { $lt: now }
        },
        {
            $set: {
                status: 'completed',
                updatedAt: now
            }
        }
    );
    return result;
}
