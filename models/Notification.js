import mongoose from "mongoose";
const { Schema, model } = mongoose;

const NotificationSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    type: {
        type: String,
        enum: [
            'payment',        // Payment received
            'milestone',      // Campaign milestone reached
            'comment',        // New comment on campaign
            'update',         // Campaign update notification
            'system',         // System announcements
            'campaign',       // Campaign status changes (published, completed, etc.)
            'subscription',   // Subscription events
            'follow',         // New follower
            'reply',          // Reply to comment
        ],
        required: true
    },

    title: { type: String, required: true },
    message: { type: String, required: true },

    // Related entities
    payment: { type: Schema.Types.ObjectId, ref: 'Payment' },
    campaign: { type: Schema.Types.ObjectId, ref: 'Campaign' },
    relatedUser: { type: Schema.Types.ObjectId, ref: 'User' }, // e.g., supporter, commenter

    // Link to redirect
    link: { type: String },

    // Extra metadata
    metadata: { type: Schema.Types.Mixed, default: {} },

    read: { type: Boolean, default: false },
    readAt: { type: Date },

    createdAt: { type: Date, default: Date.now }
});

NotificationSchema.index({ user: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, type: 1, createdAt: -1 });

export default mongoose.models.Notification || model("Notification", NotificationSchema);
