import mongoose from "mongoose";
const { Schema, model } = mongoose;

const SubscriptionSchema = new Schema({
    subscriber: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    campaign: { type: Schema.Types.ObjectId, ref: 'Campaign' },
    
    razorpaySubscriptionId: { type: String, required: true },
    amount: { type: Number, required: true },
    frequency: { 
        type: String, 
        enum: ['monthly', 'quarterly', 'yearly'],
        default: 'monthly'
    },
    
    status: { 
        type: String, 
        enum: ['active', 'paused', 'cancelled', 'expired'],
        default: 'active'
    },
    
    nextBillingDate: { type: Date },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

SubscriptionSchema.index({ subscriber: 1, status: 1 });

export default mongoose.models.Subscription || model("Subscription", SubscriptionSchema);
