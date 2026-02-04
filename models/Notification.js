import mongoose from "mongoose";
const { Schema, model } = mongoose;

const NotificationSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    
    type: { 
        type: String, 
        enum: ['payment', 'milestone', 'comment', 'update', 'system'],
        required: true
    },
    
    title: { type: String, required: true },
    message: { type: String, required: true },
    
    // Related entities
    payment: { type: Schema.Types.ObjectId, ref: 'Payment' },
    campaign: { type: Schema.Types.ObjectId, ref: 'Campaign' },
    
    // Link to redirect
    link: { type: String },
    
    read: { type: Boolean, default: false },
    readAt: { type: Date },
    
    createdAt: { type: Date, default: Date.now }
});

NotificationSchema.index({ user: 1, read: 1, createdAt: -1 });

export default mongoose.models.Notification || model("Notification", NotificationSchema);
