// scripts/verify-seed.mjs — Verify seed data integrity
import mongoose from 'mongoose';

const MONGO_URI = 'mongodb://localhost:27017/get-me-a-chai';

async function verify() {
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;

    // 1. Check demo user
    const user = await db.collection('users').findOne({ email: 'demo@getmeachai.com' });
    console.log('--- DEMO USER ---');
    console.log('EXISTS:', !!user);
    console.log('ID:', user?._id?.toString());
    console.log('USERNAME:', user?.username);
    console.log('HAS_PASSWORD:', !!user?.password);
    console.log('VERIFIED:', user?.verified);
    console.log('ROLE:', user?.role);
    console.log('STATS:', JSON.stringify(user?.stats));

    // 2. Check campaigns
    const campaigns = await db.collection('campaigns').find({ creator: user._id }).toArray();
    console.log('\n--- CAMPAIGNS ---');
    console.log('COUNT:', campaigns.length);
    for (const c of campaigns) {
        console.log('  -', c.slug, '| status:', c.status, '| amount:', c.currentAmount + '/' + c.goalAmount);
    }

    // 3. Check payments
    const campaignIds = campaigns.map(c => c._id);
    const validPayments = await db.collection('payments').countDocuments({ campaign: { $in: campaignIds } });
    const totalPayments = await db.collection('payments').countDocuments({});
    const paymentsToDemo = await db.collection('payments').countDocuments({ to_user: 'democreator' });
    console.log('\n--- PAYMENTS ---');
    console.log('TOTAL:', totalPayments);
    console.log('VALID_CAMPAIGN_REF:', validPayments + '/' + totalPayments);
    console.log('TO_DEMOCREATOR:', paymentsToDemo);

    // 4. Check analytics
    const validAnalytics = await db.collection('analytics').countDocuments({ campaign: { $in: campaignIds } });
    const totalAnalytics = await db.collection('analytics').countDocuments({});
    console.log('\n--- ANALYTICS ---');
    console.log('TOTAL:', totalAnalytics);
    console.log('VALID_CAMPAIGN_REF:', validAnalytics + '/' + totalAnalytics);

    // 5. Check notifications
    const notifs = await db.collection('notifications').countDocuments({ user: user._id });
    const unread = await db.collection('notifications').countDocuments({ user: user._id, read: false });
    console.log('\n--- NOTIFICATIONS ---');
    console.log('FOR_DEMO:', notifs);
    console.log('UNREAD:', unread);

    // 6. Check subscriptions
    const subs = await db.collection('subscriptions').find({}).toArray();
    console.log('\n--- SUBSCRIPTIONS ---');
    console.log('COUNT:', subs.length);
    for (const s of subs) {
        console.log('  -', s.status, '| amount:', s.amount, '| freq:', s.frequency);
    }

    // 7. Check comments
    const totalComments = await db.collection('comments').countDocuments({});
    const threaded = await db.collection('comments').countDocuments({ parentComment: { $ne: null } });
    console.log('\n--- COMMENTS ---');
    console.log('TOTAL:', totalComments);
    console.log('THREADED_REPLIES:', threaded);

    // 8. Check campaign updates
    const updates = await db.collection('campaignupdates').countDocuments({});
    console.log('\n--- CAMPAIGN UPDATES ---');
    console.log('TOTAL:', updates);

    // 9. Check campaign views
    const views = await db.collection('campaignviews').countDocuments({});
    console.log('\n--- CAMPAIGN VIEWS ---');
    console.log('TOTAL:', views);

    // 10. Check reports
    const reports = await db.collection('reports').countDocuments({});
    console.log('\n--- REPORTS ---');
    console.log('TOTAL:', reports);

    // 11. Verify login would work (check password hash exists)
    const bcrypt = await import('bcryptjs');
    const passwordValid = await bcrypt.default.compare('demo123456', user.password);
    console.log('\n--- AUTH TEST ---');
    console.log('PASSWORD_VALID:', passwordValid);

    // Summary
    console.log('\n=== VERIFICATION SUMMARY ===');
    const issues = [];
    if (!user) issues.push('Demo user not found');
    if (!passwordValid) issues.push('Demo password invalid');
    if (campaigns.length !== 5) issues.push('Expected 5 campaigns, got ' + campaigns.length);
    if (validPayments !== totalPayments) issues.push('Some payments reference invalid campaigns');
    if (validAnalytics !== totalAnalytics) issues.push('Some analytics reference invalid campaigns');
    if (notifs === 0) issues.push('No notifications for demo user');
    if (subs.length === 0) issues.push('No subscriptions');
    if (totalComments === 0) issues.push('No comments');

    if (issues.length === 0) {
        console.log('ALL CHECKS PASSED');
    } else {
        console.log('ISSUES FOUND:');
        issues.forEach(i => console.log('  - ' + i));
    }

    await mongoose.disconnect();
}

verify().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
