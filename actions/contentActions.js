// actions/contentActions.js
"use server"

/**
 * Server Actions for Content Management
 * Handles campaign updates/posts
 */

import connectDb from '@/db/connectDb';
import CampaignUpdate from '@/models/CampaignUpdate';
import Campaign from '@/models/Campaign';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { notifyContentPublished, getSupporterIdsForCampaign } from '@/lib/notifications';

/**
 * Valid visibility enum values matching the CampaignUpdate model
 */
const VALID_VISIBILITY = ['public', 'supporters-only'];

/**
 * Normalize visibility value to match the Mongoose enum.
 * Handles common variants like 'supporters', 'supporter-only', 'Supporters Only', etc.
 * @param {string} value - Raw visibility value from form/API
 * @returns {string} Normalized visibility value
 */
function normalizeVisibility(value) {
    if (!value || typeof value !== 'string') return 'public';

    const normalized = value.trim().toLowerCase();

    // Direct match
    if (VALID_VISIBILITY.includes(normalized)) return normalized;

    // Map common variants to the canonical value
    const supporterVariants = [
        'supporters',
        'supporter',
        'supporter-only',
        'supporters_only',
        'supporter_only',
        'supportersonly',
        'supporteronly',
    ];

    if (supporterVariants.includes(normalized) || normalized.includes('supporter')) {
        return 'supporters-only';
    }

    // Default to public for any unrecognized value
    return 'public';
}

/**
 * Valid status enum values matching the CampaignUpdate model
 */
const VALID_STATUS = ['draft', 'published', 'scheduled'];

/**
 * Normalize status value to match the Mongoose enum.
 * @param {string} value - Raw status value
 * @returns {string} Normalized status value
 */
function normalizeStatus(value) {
    if (!value || typeof value !== 'string') return 'draft';
    const normalized = value.trim().toLowerCase();
    return VALID_STATUS.includes(normalized) ? normalized : 'draft';
}

/**
 * Create a campaign update
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Created update or error
 */
export async function createUpdate(data) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { error: 'You must be logged in' };
        }

        await connectDb();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return { error: 'User not found' };
        }

        // Validate required fields first
        if (!data.campaign || !data.title || !data.content) {
            return { error: 'Campaign, title, and content are required' };
        }

        // Sanitize and normalize enum values
        const visibility = normalizeVisibility(data.visibility);
        const status = normalizeStatus(data.status);

        // Verify campaign exists and user is the creator
        const campaign = await Campaign.findById(data.campaign);
        if (!campaign) {
            return { error: 'Campaign not found' };
        }

        if (campaign.creator.toString() !== user._id.toString()) {
            return { error: 'You do not have permission to post updates for this campaign' };
        }

        // Create update with normalized values
        const update = await CampaignUpdate.create({
            campaign: data.campaign,
            creator: user._id,
            title: data.title.trim(),
            content: data.content,
            visibility,
            status,
            images: Array.isArray(data.images) ? data.images : [],
            scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : undefined,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // Send notifications to supporters if published immediately
        if (status === 'published') {
            try {
                const supporterIds = await getSupporterIdsForCampaign(data.campaign, user._id.toString());
                if (supporterIds.length > 0) {
                    await notifyContentPublished({
                        supporterIds,
                        creatorName: user.name || user.username || 'The creator',
                        campaignTitle: campaign.title,
                        campaignSlug: campaign.username ? `${campaign.username}/${campaign.slug}` : null,
                        campaignId: data.campaign,
                        contentTitle: data.title.trim(),
                        visibility,
                    });
                }
            } catch (notifyError) {
                console.error('Failed to notify supporters about new content:', notifyError);
            }
        }

        return {
            success: true,
            update: {
                _id: update._id.toString(),
                title: update.title,
                status: update.status
            }
        };

    } catch (error) {
        console.error('Create update error:', error);
        return { error: error.message || 'Failed to create update' };
    }
}

/**
 * Update an existing campaign update
 * @param {string} updateId - Update ID
 * @param {Object} data - Updated data
 * @returns {Promise<Object>} Updated update or error
 */
export async function updateUpdate(updateId, data) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { error: 'You must be logged in' };
        }

        await connectDb();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return { error: 'User not found' };
        }

        // Find update and verify ownership
        const update = await CampaignUpdate.findById(updateId);
        if (!update) {
            return { error: 'Update not found' };
        }

        if (update.creator.toString() !== user._id.toString()) {
            return { error: 'You do not have permission to edit this update' };
        }

        // Update fields with normalization
        if (data.title) update.title = data.title.trim();
        if (data.content) update.content = data.content;
        if (data.visibility) update.visibility = normalizeVisibility(data.visibility);
        if (data.status) update.status = normalizeStatus(data.status);
        if (data.images) update.images = Array.isArray(data.images) ? data.images : [];
        if (data.scheduledFor) update.scheduledFor = new Date(data.scheduledFor);

        update.updatedAt = new Date();
        await update.save();

        return {
            success: true,
            update: {
                _id: update._id.toString(),
                title: update.title
            }
        };

    } catch (error) {
        console.error('Update update error:', error);
        return { error: error.message || 'Failed to update' };
    }
}

/**
 * Delete a campaign update
 * @param {string} updateId - Update ID
 * @returns {Promise<Object>} Success or error
 */
export async function deleteUpdate(updateId) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { error: 'You must be logged in' };
        }

        await connectDb();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return { error: 'User not found' };
        }

        // Find update and verify ownership
        const update = await CampaignUpdate.findById(updateId);
        if (!update) {
            return { error: 'Update not found' };
        }

        if (update.creator.toString() !== user._id.toString()) {
            return { error: 'You do not have permission to delete this update' };
        }

        await CampaignUpdate.findByIdAndDelete(updateId);

        return { success: true };

    } catch (error) {
        console.error('Delete update error:', error);
        return { error: error.message || 'Failed to delete update' };
    }
}

/**
 * Publish a campaign update
 * @param {string} updateId - Update ID
 * @returns {Promise<Object>} Published update or error
 */
export async function publishUpdate(updateId) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { error: 'You must be logged in' };
        }

        await connectDb();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return { error: 'User not found' };
        }

        // Find update and verify ownership
        const update = await CampaignUpdate.findById(updateId);
        if (!update) {
            return { error: 'Update not found' };
        }

        if (update.creator.toString() !== user._id.toString()) {
            return { error: 'You do not have permission to publish this update' };
        }

        // Publish
        update.status = 'published';
        update.publishedAt = new Date();
        update.updatedAt = new Date();
        await update.save();

        // Send notifications to campaign supporters
        try {
            const campaign = await Campaign.findById(update.campaign).select('title slug username creator').lean();
            if (campaign) {
                const supporterIds = await getSupporterIdsForCampaign(
                    update.campaign,
                    user._id.toString()
                );
                if (supporterIds.length > 0) {
                    await notifyContentPublished({
                        supporterIds,
                        creatorName: user.name || user.username || 'The creator',
                        campaignTitle: campaign.title,
                        campaignSlug: campaign.username ? `${campaign.username}/${campaign.slug}` : null,
                        campaignId: update.campaign,
                        contentTitle: update.title,
                        visibility: update.visibility,
                    });
                }
            }
        } catch (notifyError) {
            // Non-fatal: don't fail the publish if notification fails
            console.error('Failed to notify supporters about published update:', notifyError);
        }

        return {
            success: true,
            update: {
                _id: update._id.toString(),
                status: update.status
            }
        };

    } catch (error) {
        console.error('Publish update error:', error);
        return { error: error.message || 'Failed to publish update' };
    }
}

/**
 * Schedule a campaign update for future publishing
 * @param {string} updateId - Update ID
 * @param {Date} publishDate - Scheduled publish date
 * @returns {Promise<Object>} Scheduled update or error
 */
export async function scheduleUpdate(updateId, publishDate) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { error: 'You must be logged in' };
        }

        await connectDb();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return { error: 'User not found' };
        }

        // Find update and verify ownership
        const update = await CampaignUpdate.findById(updateId);
        if (!update) {
            return { error: 'Update not found' };
        }

        if (update.creator.toString() !== user._id.toString()) {
            return { error: 'You do not have permission to schedule this update' };
        }

        // Validate publish date is in the future
        const scheduleDate = new Date(publishDate);
        if (scheduleDate <= new Date()) {
            return { error: 'Scheduled date must be in the future' };
        }

        // Schedule
        update.status = 'scheduled';
        update.scheduledFor = scheduleDate;
        update.updatedAt = new Date();
        await update.save();

        return {
            success: true,
            update: {
                _id: update._id.toString(),
                status: update.status,
                scheduledFor: update.scheduledFor.toISOString()
            }
        };

    } catch (error) {
        console.error('Schedule update error:', error);
        return { error: error.message || 'Failed to schedule update' };
    }
}

/**
 * Get updates for a campaign
 * @param {string} campaignId - Campaign ID
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Updates or error
 */
export async function getUpdates(campaignId, filters = {}) {
    try {
        await connectDb();

        // Build query
        const query = { campaign: campaignId };

        if (filters.status) {
            query.status = filters.status;
        }

        // Fetch updates
        const updates = await CampaignUpdate.find(query)
            .sort({ createdAt: -1 })
            .lean();

        // Serialize for client
        const serialized = updates.map(u => ({
            ...u,
            _id: u._id.toString(),
            campaign: u.campaign.toString(),
            creator: u.creator.toString(),
            createdAt: u.createdAt?.toISOString(),
            updatedAt: u.updatedAt?.toISOString(),
            publishedAt: u.publishedAt?.toISOString(),
            scheduledFor: u.scheduledFor?.toISOString()
        }));

        return { success: true, updates: serialized };

    } catch (error) {
        console.error('Get updates error:', error);
        return { error: error.message || 'Failed to fetch updates' };
    }
}

/**
 * Get user's updates across all campaigns
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Updates or error
 */
export async function getUserUpdates(filters = {}) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { error: 'You must be logged in' };
        }

        await connectDb();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return { error: 'User not found' };
        }

        // Build query
        const query = { creator: user._id };

        if (filters.status) {
            query.status = filters.status;
        }

        // Fetch updates with campaign info
        const updates = await CampaignUpdate.find(query)
            .populate('campaign', 'title slug')
            .sort({ createdAt: -1 })
            .lean();

        // Serialize for client
        const serialized = updates.map(u => ({
            ...u,
            _id: u._id.toString(),
            campaign: {
                _id: u.campaign._id.toString(),
                title: u.campaign.title,
                slug: u.campaign.slug
            },
            creator: u.creator.toString(),
            createdAt: u.createdAt?.toISOString(),
            updatedAt: u.updatedAt?.toISOString(),
            publishedAt: u.publishedAt?.toISOString(),
            scheduledFor: u.scheduledFor?.toISOString()
        }));

        return { success: true, updates: serialized };

    } catch (error) {
        console.error('Get user updates error:', error);
        return { error: error.message || 'Failed to fetch updates' };
    }
}
