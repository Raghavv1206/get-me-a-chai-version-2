// scripts/debug-campaigns.js
/**
 * Debug script to check campaign data and user associations
 * Run with: node scripts/debug-campaigns.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Import models
const UserSchema = new mongoose.Schema({
    email: String,
    username: String,
    name: String,
    profilepic: String,
    verified: Boolean,
    role: String
}, { collection: 'users' });

const CampaignSchema = new mongoose.Schema({
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    title: String,
    slug: String,
    category: String,
    status: String,
    goalAmount: Number,
    currentAmount: Number,
    createdAt: Date
}, { collection: 'campaigns' });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Campaign = mongoose.models.Campaign || mongoose.model('Campaign', CampaignSchema);

async function debugCampaigns() {
    try {
        console.log('🔍 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get all users
        const users = await User.find({}).lean();
        console.log(`📊 Total Users: ${users.length}`);
        users.forEach(user => {
            console.log(`  - ${user.username} (${user.email}) - ID: ${user._id}`);
        });
        console.log('');

        // Get all campaigns
        const campaigns = await Campaign.find({}).populate('creator', 'username email').lean();
        console.log(`📊 Total Campaigns: ${campaigns.length}`);
        campaigns.forEach(campaign => {
            console.log(`  - "${campaign.title}" by ${campaign.username}`);
            console.log(`    Creator ID: ${campaign.creator?._id || campaign.creator}`);
            console.log(`    Creator Object:`, campaign.creator);
            console.log(`    Status: ${campaign.status}`);
            console.log(`    Created: ${campaign.createdAt}`);
            console.log('');
        });

        // Check for each user what campaigns they have
        console.log('🔗 User-Campaign Associations:');
        for (const user of users) {
            const userCampaigns = await Campaign.find({ creator: user._id }).lean();
            console.log(`\n  ${user.username} (${user._id}):`);
            console.log(`    Campaigns found: ${userCampaigns.length}`);

            if (userCampaigns.length > 0) {
                userCampaigns.forEach(c => {
                    console.log(`      - "${c.title}" (${c.status})`);
                });
            } else {
                console.log(`      ⚠️  No campaigns found for this user`);

                // Check if there are campaigns with this username
                const campaignsByUsername = await Campaign.find({ username: user.username }).lean();
                if (campaignsByUsername.length > 0) {
                    console.log(`      ⚠️  But found ${campaignsByUsername.length} campaigns with username "${user.username}":`);
                    campaignsByUsername.forEach(c => {
                        console.log(`        - "${c.title}" - Creator ID: ${c.creator}`);
                        console.log(`          Creator ID type: ${typeof c.creator}`);
                        console.log(`          User ID type: ${typeof user._id}`);
                        console.log(`          IDs match: ${c.creator.toString() === user._id.toString()}`);
                    });
                }
            }
        }

        console.log('\n✅ Debug complete!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
    }
}

debugCampaigns();
