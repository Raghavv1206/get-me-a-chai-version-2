// actions/campaignActions.js
"use server"

/**
 * Server Actions for Campaign Management
 * Handles CRUD operations for campaigns
 */

import connectDb from '@/db/connectDb';
import Campaign from '@/models/Campaign';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Create a new campaign
 * @param {Object} data - Campaign data
 * @returns {Promise<Object>} Created campaign or error
 */
export async function createCampaign(data) {
    try {
        // Get authenticated user
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { error: 'You must be logged in to create a campaign' };
        }

        await connectDb();

        // Get user from database
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return { error: 'User not found' };
        }

        // Validate required fields
        if (!data.title || !data.category || !data.goal) {
            return { error: 'Missing required fields: title, category, and goal' };
        }

        // Validate goal amount
        if (data.goal < 1000 || data.goal > 10000000) {
            return { error: 'Goal must be between ₹1,000 and ₹1,00,00,000' };
        }

        // Generate unique slug from title
        const baseSlug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        let slug = baseSlug;
        let counter = 1;

        // Ensure slug is unique
        while (await Campaign.findOne({ slug })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        // Create campaign
        const campaign = await Campaign.create({
            ...data,
            slug,
            creator: user._id,
            creatorUsername: user.username,
            status: data.status || 'draft',
            raised: 0,
            supportersCount: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return {
            success: true,
            campaign: {
                _id: campaign._id.toString(),
                slug: campaign.slug,
                title: campaign.title,
                status: campaign.status
            }
        };

    } catch (error) {
        console.error('Create campaign error:', error);
        return { error: error.message || 'Failed to create campaign' };
    }
}

/**
 * Save campaign as draft
 * @param {Object} data - Campaign data
 * @returns {Promise<Object>} Saved draft or error
 */
export async function saveDraft(data) {
    return await createCampaign({ ...data, status: 'draft' });
}

/**
 * Publish a campaign
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<Object>} Published campaign or error
 */
export async function publishCampaign(campaignId) {
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

        // Find campaign and verify ownership
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return { error: 'Campaign not found' };
        }

        if (campaign.creator.toString() !== user._id.toString()) {
            return { error: 'You do not have permission to publish this campaign' };
        }

        // Validate campaign is complete enough to publish
        if (!campaign.title || !campaign.story || !campaign.goal) {
            return { error: 'Campaign must have title, story, and goal to publish' };
        }

        // Update status to active
        campaign.status = 'active';
        campaign.publishedAt = new Date();
        campaign.updatedAt = new Date();
        await campaign.save();

        return {
            success: true,
            campaign: {
                _id: campaign._id.toString(),
                slug: campaign.slug,
                status: campaign.status
            }
        };

    } catch (error) {
        console.error('Publish campaign error:', error);
        return { error: error.message || 'Failed to publish campaign' };
    }
}

/**
 * Update an existing campaign
 * @param {string} campaignId - Campaign ID
 * @param {Object} data - Updated campaign data
 * @returns {Promise<Object>} Updated campaign or error
 */
export async function updateCampaign(campaignId, data) {
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

        // Find campaign and verify ownership
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return { error: 'Campaign not found' };
        }

        if (campaign.creator.toString() !== user._id.toString()) {
            return { error: 'You do not have permission to edit this campaign' };
        }

        // Prevent changing certain fields after campaign is funded
        if (campaign.raised > 0) {
            delete data.goal;
            delete data.category;
        }

        // Update campaign
        Object.assign(campaign, data);
        campaign.updatedAt = new Date();
        await campaign.save();

        return {
            success: true,
            campaign: {
                _id: campaign._id.toString(),
                slug: campaign.slug,
                title: campaign.title
            }
        };

    } catch (error) {
        console.error('Update campaign error:', error);
        return { error: error.message || 'Failed to update campaign' };
    }
}

/**
 * Delete a campaign (soft delete)
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<Object>} Success or error
 */
export async function deleteCampaign(campaignId) {
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

        // Find campaign and verify ownership
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return { error: 'Campaign not found' };
        }

        if (campaign.creator.toString() !== user._id.toString()) {
            return { error: 'You do not have permission to delete this campaign' };
        }

        // Prevent deletion if campaign has received funds
        if (campaign.raised > 0) {
            return { error: 'Cannot delete a campaign that has received funds. You can pause it instead.' };
        }

        // Soft delete
        campaign.status = 'deleted';
        campaign.updatedAt = new Date();
        await campaign.save();

        return { success: true };

    } catch (error) {
        console.error('Delete campaign error:', error);
        return { error: error.message || 'Failed to delete campaign' };
    }
}

/**
 * Duplicate a campaign
 * @param {string} campaignId - Campaign ID to duplicate
 * @returns {Promise<Object>} New campaign or error
 */
export async function duplicateCampaign(campaignId) {
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

        // Find original campaign
        const original = await Campaign.findById(campaignId);
        if (!original) {
            return { error: 'Campaign not found' };
        }

        if (original.creator.toString() !== user._id.toString()) {
            return { error: 'You do not have permission to duplicate this campaign' };
        }

        // Create duplicate
        const duplicate = {
            title: `${original.title} (Copy)`,
            category: original.category,
            goal: original.goal,
            duration: original.duration,
            story: original.story,
            coverImage: original.coverImage,
            gallery: original.gallery,
            milestones: original.milestones,
            rewards: original.rewards,
            faqs: original.faqs,
            location: original.location,
            status: 'draft'
        };

        return await createCampaign(duplicate);

    } catch (error) {
        console.error('Duplicate campaign error:', error);
        return { error: error.message || 'Failed to duplicate campaign' };
    }
}

/**
 * Get user's campaigns
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Campaigns or error
 */
export async function getCampaigns(filters = {}) {
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

        // Fetch campaigns
        const campaigns = await Campaign.find(query)
            .sort({ createdAt: -1 })
            .lean();

        // Serialize for client
        const serialized = campaigns.map(c => ({
            ...c,
            _id: c._id.toString(),
            creator: c.creator.toString(),
            createdAt: c.createdAt?.toISOString(),
            updatedAt: c.updatedAt?.toISOString(),
            publishedAt: c.publishedAt?.toISOString(),
            deadline: c.deadline?.toISOString()
        }));

        return { success: true, campaigns: serialized };

    } catch (error) {
        console.error('Get campaigns error:', error);
        return { error: error.message || 'Failed to fetch campaigns' };
    }
}

/**
 * Get campaign by ID or slug
 * @param {string} identifier - Campaign ID or slug
 * @returns {Promise<Object>} Campaign or error
 */
export async function getCampaign(identifier) {
    try {
        await connectDb();

        // Try to find by ID first, then by slug
        let campaign = await Campaign.findById(identifier).lean();
        if (!campaign) {
            campaign = await Campaign.findOne({ slug: identifier }).lean();
        }

        if (!campaign) {
            return { error: 'Campaign not found' };
        }

        // Serialize for client
        const serialized = {
            ...campaign,
            _id: campaign._id.toString(),
            creator: campaign.creator.toString(),
            createdAt: campaign.createdAt?.toISOString(),
            updatedAt: campaign.updatedAt?.toISOString(),
            publishedAt: campaign.publishedAt?.toISOString(),
            deadline: campaign.deadline?.toISOString()
        };

        return { success: true, campaign: serialized };

    } catch (error) {
        console.error('Get campaign error:', error);
        return { error: error.message || 'Failed to fetch campaign' };
    }
}
