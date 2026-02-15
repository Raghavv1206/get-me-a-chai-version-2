// C:\Users\ragha\project\get-me-a-chai\models\User.js

import mongoose from "mongoose";
const { Schema, model } = mongoose;

const UserSchema = new Schema({
    email: { type: String, required: true },
    name: { type: String },
    username: { type: String, required: true },
    password: { type: String }, // ADD THIS - optional for OAuth users
    profilepic: { type: String, default: "/images/default-profilepic.svg" },
    coverpic: { type: String, default: "/images/default-coverpic.jpg" },
    bio: { type: String, maxLength: 500 },
    location: { type: String },

    // Role & Verification
    role: { type: String, enum: ['creator', 'supporter', 'admin'], default: 'creator' },
    verified: { type: Boolean, default: false },

    // Payment details
    razorpayid: { type: String },
    razorpaysecret: { type: String },

    // Password reset
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },

    // Social links
    socialLinks: {
        twitter: String,
        linkedin: String,
        github: String,
        website: String
    },

    // Stats (denormalized for performance)
    stats: {
        totalRaised: { type: Number, default: 0 },
        totalSupporters: { type: Number, default: 0 },
        campaignsCount: { type: Number, default: 0 },
        successRate: { type: Number, default: 0 }
    },

    // Settings
    settings: {
        emailNotifications: { type: Boolean, default: true },
        newsletter: { type: Boolean, default: true }
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });

export default mongoose.models.User || model("User", UserSchema);