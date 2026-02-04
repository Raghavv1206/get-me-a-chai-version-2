import mongoose from "mongoose";
const { Schema, model } = mongoose;

const CampaignUpdateSchema = new Schema({
    campaign: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    
    title: { type: String, required: true },
    content: { type: String, required: true },
    images: [{ type: String }],
    
    visibility: { 
        type: String, 
        enum: ['public', 'supporters-only'],
        default: 'public'
    },
    
    status: { 
        type: String, 
        enum: ['draft', 'published', 'scheduled'],
        default: 'published'
    },
    
    publishDate: { type: Date, default: Date.now },
    scheduledFor: { type: Date },
    
    stats: {
        views: { type: Number, default: 0 },
        likes: { type: Number, default: 0 }
    },
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

CampaignUpdateSchema.index({ campaign: 1, status: 1, publishDate: -1 });

export default mongoose.models.CampaignUpdate || model("CampaignUpdate", CampaignUpdateSchema);
