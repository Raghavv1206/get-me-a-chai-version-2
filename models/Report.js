import mongoose from "mongoose";
const { Schema, model } = mongoose;

const ReportSchema = new Schema({
    // What is being reported
    targetType: {
        type: String,
        required: true,
        enum: ['campaign', 'comment', 'user'],
    },
    targetId: {
        type: Schema.Types.ObjectId,
        required: true,
    },

    // Who is reporting
    reporter: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    // Report details
    reason: {
        type: String,
        required: true,
        enum: [
            'spam',
            'fraud',
            'misleading',
            'inappropriate',
            'harassment',
            'intellectual_property',
            'other',
        ],
    },
    description: {
        type: String,
        maxLength: 1000,
        default: '',
    },

    // Moderation status
    status: {
        type: String,
        enum: ['pending', 'reviewing', 'resolved', 'dismissed'],
        default: 'pending',
    },

    // Resolution notes (for admin)
    resolution: {
        type: String,
        default: '',
    },
    resolvedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    resolvedAt: {
        type: Date,
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Prevent duplicate reports from the same user for the same target
ReportSchema.index({ targetType: 1, targetId: 1, reporter: 1 }, { unique: true });
ReportSchema.index({ status: 1, createdAt: -1 });
ReportSchema.index({ targetType: 1, targetId: 1, status: 1 });

// Pre-save middleware
ReportSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

export default mongoose.models.Report || model("Report", ReportSchema);
