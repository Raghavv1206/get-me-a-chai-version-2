// C:\Users\ragha\project\get-me-a-chai\models\Payment.js
// Enhanced Payment Model
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const PaymentSchema = new Schema({
    // Supporter Info
    name: { type: String, required: true },
    email: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    
    // Campaign/Creator Info
    to_user: { type: String, required: true },
    campaign: { type: Schema.Types.ObjectId, ref: 'Campaign' },
    
    // Payment Details
    oid: { type: String, required: true }, // Razorpay Order ID
    paymentId: { type: String }, // Razorpay Payment ID
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    
    // Message & Reward
    message: { type: String, maxLength: 500 },
    rewardTier: { type: Schema.Types.ObjectId },
    
    // Payment Type
    type: { 
        type: String, 
        enum: ['one-time', 'subscription'],
        default: 'one-time'
    },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription' },
    
    // Privacy
    anonymous: { type: Boolean, default: false },
    hideAmount: { type: Boolean, default: false },
    
    // Status
    done: { type: Boolean, default: false },
    status: { 
        type: String, 
        enum: ['pending', 'success', 'failed', 'refunded'],
        default: 'pending'
    },
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

PaymentSchema.index({ to_user: 1, done: 1 });
PaymentSchema.index({ oid: 1 });
PaymentSchema.index({ campaign: 1, done: 1 });

export default mongoose.models.Payment || model("Payment", PaymentSchema);