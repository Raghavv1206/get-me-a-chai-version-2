// models/CampaignView.js

/**
 * CampaignView Model
 * 
 * Tracks user views of campaigns for analytics and recommendation purposes.
 * Automatically expires old views after 90 days to manage database size.
 * 
 * Features:
 * - Compound indexes for efficient querying
 * - TTL index for automatic cleanup
 * - Timestamps for audit trail
 */

import mongoose from 'mongoose';

const CampaignViewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true,
        validate: {
            validator: function (v) {
                return mongoose.Types.ObjectId.isValid(v);
            },
            message: props => `${props.value} is not a valid user ID`
        }
    },
    campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign',
        required: [true, 'Campaign ID is required'],
        index: true,
        validate: {
            validator: function (v) {
                return mongoose.Types.ObjectId.isValid(v);
            },
            message: props => `${props.value} is not a valid campaign ID`
        }
    },
    viewedAt: {
        type: Date,
        default: Date.now,
        index: true,
        validate: {
            validator: function (v) {
                // Ensure viewedAt is not in the future
                return v <= new Date();
            },
            message: 'View date cannot be in the future'
        }
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt
    collection: 'campaignviews' // Explicit collection name
});

// Compound index for efficient user-campaign queries
// Prevents duplicate views from same user to same campaign
CampaignViewSchema.index({ userId: 1, campaignId: 1 }, { unique: true });

// Index for user's recent views (used in recommendations)
CampaignViewSchema.index({ userId: 1, viewedAt: -1 });

// Index for campaign's recent views (used in analytics)
CampaignViewSchema.index({ campaignId: 1, viewedAt: -1 });

// TTL index to automatically delete old views after 90 days (7,776,000 seconds)
// This helps manage database size while retaining recent data for recommendations
CampaignViewSchema.index({ viewedAt: 1 }, { expireAfterSeconds: 7776000 });

/**
 * Static method to record a view
 * Uses upsert to prevent duplicate views
 * 
 * @param {ObjectId} userId - The user viewing the campaign
 * @param {ObjectId} campaignId - The campaign being viewed
 * @returns {Promise<Object>} The view record
 */
CampaignViewSchema.statics.recordView = async function (userId, campaignId) {
    if (!userId || !campaignId) {
        throw new Error('userId and campaignId are required');
    }

    try {
        return await this.findOneAndUpdate(
            { userId, campaignId },
            { $set: { viewedAt: new Date() } },
            { upsert: true, new: true, runValidators: true }
        );
    } catch (error) {
        console.error('[CampaignView.recordView] Error:', error);
        throw error;
    }
};

/**
 * Static method to get user's recent views
 * 
 * @param {ObjectId} userId - The user ID
 * @param {number} limit - Maximum number of views to return
 * @returns {Promise<Array>} Array of recent views
 */
CampaignViewSchema.statics.getRecentViews = async function (userId, limit = 50) {
    if (!userId) {
        throw new Error('userId is required');
    }

    try {
        return await this.find({ userId })
            .sort({ viewedAt: -1 })
            .limit(limit)
            .populate('campaignId', 'title category')
            .lean();
    } catch (error) {
        console.error('[CampaignView.getRecentViews] Error:', error);
        throw error;
    }
};

// Prevent model recompilation in development
export default mongoose.models.CampaignView || mongoose.model('CampaignView', CampaignViewSchema);

