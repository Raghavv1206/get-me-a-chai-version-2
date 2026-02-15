// scripts/check-campaign-data.js
/**
 * Simple script to check campaign and user data
 * Run with: node scripts/check-campaign-data.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function checkData() {
    try {
        console.log('🔍 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected!\n');

        // Define schemas
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false, collection: 'users' }));
        const Campaign = mongoose.model('Campaign', new mongoose.Schema({}, { strict: false, collection: 'campaigns' }));

        // Get users
        const users = await User.find({}).lean();
        console.log(`📊 Users (${users.length}):`);
        users.forEach(u => console.log(`  - ${u.username || u.email} | ID: ${u._id}`));

        // Get campaigns
        const campaigns = await Campaign.find({}).lean();
        console.log(`\n📊 Campaigns (${campaigns.length}):`);
        campaigns.forEach(c => {
            console.log(`\n  "${c.title}"`);
            console.log(`    Creator ID: ${c.creator}`);
            console.log(`    Username: ${c.username}`);
            console.log(`    Status: ${c.status}`);
        });

        // Check associations
        console.log('\n🔗 Checking associations:');
        for (const user of users) {
            const userCampaigns = await Campaign.find({ creator: user._id }).lean();
            console.log(`\n  ${user.username || user.email}:`);
            console.log(`    User ID: ${user._id}`);
            console.log(`    Campaigns found: ${userCampaigns.length}`);
            if (userCampaigns.length > 0) {
                userCampaigns.forEach(c => console.log(`      - ${c.title} (${c.status})`));
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Done!');
        process.exit(0);
    }
}

checkData();
