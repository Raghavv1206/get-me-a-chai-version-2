import mongoose from "mongoose";
const { Schema, model } = mongoose;

const AnalyticsSchema = new Schema({
    campaign: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
    date: { type: Date, required: true },
    
    views: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    
    // Traffic sources
    sources: {
        direct: { type: Number, default: 0 },
        social: { type: Number, default: 0 },
        search: { type: Number, default: 0 },
        referral: { type: Number, default: 0 }
    },
    
    // Device breakdown
    devices: {
        mobile: { type: Number, default: 0 },
        desktop: { type: Number, default: 0 },
        tablet: { type: Number, default: 0 }
    },
    
    // Geographic data
    topCities: [{ city: String, count: Number }],
    
    createdAt: { type: Date, default: Date.now }
});

AnalyticsSchema.index({ campaign: 1, date: -1 });

export default mongoose.models.Analytics || model("Analytics", AnalyticsSchema);