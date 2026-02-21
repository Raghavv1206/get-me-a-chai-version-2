import mongoose from "mongoose";
const { Schema, model } = mongoose;

const CampaignSchema = new Schema({
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true }, // Denormalized for quick lookups

    // Basic Info
    title: { type: String, required: true, maxLength: 100 },
    slug: { type: String, required: true, unique: true },
    category: {
        type: String,
        required: true,
        enum: ['technology', 'art', 'music', 'film', 'education', 'games', 'food', 'fashion', 'other']
    },
    projectType: { type: String },

    // Story & Description
    brief: { type: String, maxLength: 500 }, // Brief description for AI generation
    hook: { type: String }, // Opening hook paragraph
    shortDescription: { type: String, maxLength: 200 },
    story: { type: String, required: true },
    aiGenerated: { type: Boolean, default: false },

    // Funding
    goalAmount: { type: Number, required: true },
    currentAmount: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },

    // Media
    coverImage: { type: String },
    images: [{ type: String }],
    videoUrl: { type: String },

    // Timeline
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },

    // Milestones
    milestones: [{
        title: { type: String, required: true },
        amount: { type: Number, required: true },
        description: { type: String },
        completed: { type: Boolean, default: false },
        completedAt: Date
    }],

    // Rewards/Perks
    rewards: [{
        title: { type: String, required: true },
        amount: { type: Number, required: true },
        description: { type: String },
        deliveryTime: { type: String },
        limitedQuantity: { type: Number },
        claimedCount: { type: Number, default: 0 }
    }],

    // FAQs
    faqs: [{
        question: { type: String, required: true },
        answer: { type: String, required: true }
    }],

    // Status & Visibility
    status: {
        type: String,
        enum: ['draft', 'active', 'paused', 'completed', 'cancelled'],
        default: 'draft'
    },
    featured: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },

    // Stats
    stats: {
        views: { type: Number, default: 0 },
        supporters: { type: Number, default: 0 },
        shares: { type: Number, default: 0 },
        comments: { type: Number, default: 0 }
    },

    // AI Quality Score
    qualityScore: { type: Number, min: 0, max: 100 },

    // Location
    location: { type: String },

    // Tags
    tags: [{ type: String }],

    // Published date
    publishedAt: { type: Date },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

CampaignSchema.index({ creator: 1, status: 1 });
CampaignSchema.index({ category: 1, status: 1 });
CampaignSchema.index({ 'stats.views': -1 });
CampaignSchema.index({ status: 1, featured: 1 });
CampaignSchema.index({ status: 1, endDate: 1 }); // For efficient expired campaign queries

// Virtual for progress percentage
CampaignSchema.virtual('progress').get(function () {
    return this.goalAmount > 0 ? Math.min((this.currentAmount / this.goalAmount) * 100, 100) : 0;
});

// Virtual for days remaining
CampaignSchema.virtual('daysRemaining').get(function () {
    if (!this.endDate) return 0;
    const now = new Date();
    const end = new Date(this.endDate);
    const diff = end - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

// Virtual to check if campaign has expired
CampaignSchema.virtual('isExpired').get(function () {
    if (!this.endDate) return false;
    return new Date() > new Date(this.endDate);
});

// Pre-save middleware - auto-close expired campaigns
CampaignSchema.pre('save', function (next) {
    this.updatedAt = Date.now();

    // Auto-close: if campaign is active/paused and endDate has passed, mark as completed
    if (['active', 'paused'].includes(this.status) && this.endDate) {
        const now = new Date();
        const end = new Date(this.endDate);
        if (now > end) {
            this.status = 'completed';
        }
    }

    next();
});

// Static method to bulk-close all expired campaigns
CampaignSchema.statics.closeExpiredCampaigns = async function () {
    const now = new Date();
    const result = await this.updateMany(
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
};

// Ensure virtuals are included in JSON
CampaignSchema.set('toJSON', { virtuals: true });
CampaignSchema.set('toObject', { virtuals: true });

export default mongoose.models.Campaign || model("Campaign", CampaignSchema);


