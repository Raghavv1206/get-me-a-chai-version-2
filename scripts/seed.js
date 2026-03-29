// scripts/seed.js — Production-ready seed for demo account
// Aligned with ALL current model schemas (Analytics v2, Notification, Subscription, CampaignView, Report)

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load env BEFORE importing models (models may read env on load)
dotenv.config({ path: '.env.local' });

import User from '../models/User.js';
import Campaign from '../models/Campaign.js';
import Payment from '../models/Payment.js';
import Analytics from '../models/Analytics.js';
import CampaignUpdate from '../models/CampaignUpdate.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';
import Subscription from '../models/Subscription.js';
import CampaignView from '../models/CampaignView.js';
import Report from '../models/Report.js';

// ─── Config ────────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error('❌  MONGO_URI is not set in .env.local');
    process.exit(1);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
const daysFromNow = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

// ─── Seed Data Definitions ────────────────────────────────────────────────────

const SUPPORTER_NAMES = [
    'Rahul Kumar', 'Priya Singh', 'Amit Patel', 'Sneha Reddy', 'Arjun Verma',
    'Ananya Sharma', 'Rohan Gupta', 'Kavya Iyer', 'Vikram Malhotra', 'Diya Mehta',
    'Karan Kapoor', 'Neha Agarwal', 'Siddharth Roy', 'Pooja Joshi', 'Aditya Nair',
    'Meera Pillai', 'Ravi Shankar', 'Ishaan Chaudhary', 'Tanvi Desai', 'Gaurav Sinha',
];

const SUPPORT_MESSAGES = [
    'Great project! Keep it up!',
    'Excited to see this come to life!',
    'Supporting from day one!',
    'Love the vision, best of luck!',
    'This is exactly what we need!',
    "Can't wait to see the final product!",
    'Amazing work, keep going!',
    'Proud to be a supporter!',
    'This will change everything!',
    'Supporting innovation!',
    'Incredible idea, wishing you all the success!',
    'Just discovered this — instant backer!',
];

const TRAFFIC_SOURCES = ['direct', 'social', 'search', 'referral', 'email'];
const DEVICES = ['mobile', 'desktop', 'tablet'];
const EVENT_TYPES = ['visit', 'click', 'conversion', 'share'];
const EVENT_WEIGHTS = [70, 15, 10, 5]; // probability weights

/** Weighted random pick for analytics event types */
function weightedEventType() {
    const total = EVENT_WEIGHTS.reduce((a, b) => a + b, 0);
    let rand = Math.random() * total;
    for (let i = 0; i < EVENT_TYPES.length; i++) {
        rand -= EVENT_WEIGHTS[i];
        if (rand <= 0) return EVENT_TYPES[i];
    }
    return 'visit';
}

// ─── Main Seed Function ───────────────────────────────────────────────────────
async function seedDatabase() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅  Connected to MongoDB');

        // ── Clear ALL collections ──────────────────────────────────────────────
        await Promise.all([
            User.deleteMany({}),
            Campaign.deleteMany({}),
            Payment.deleteMany({}),
            Analytics.deleteMany({}),
            CampaignUpdate.deleteMany({}),
            Comment.deleteMany({}),
            Notification.deleteMany({}),
            Subscription.deleteMany({}),
            CampaignView.deleteMany({}),
            Report.deleteMany({}),
        ]);
        console.log('🗑️   Cleared existing data');

        // ── Demo User ──────────────────────────────────────────────────────────
        const demoPassword = await bcrypt.hash('demo123456', 10);

        const demoUser = await User.create({
            email: 'demo@getmeachai.com',
            name: 'Demo Creator',
            username: 'democreator',
            password: demoPassword,
            profilepic: '/images/default-profilepic.svg',
            coverpic: '/images/default-coverpic.svg',
            bio: 'I am a demo creator building amazing projects that push boundaries and inspire communities!',
            location: 'Mumbai, India',
            role: 'creator',
            verified: true,
            razorpayid: 'rzp_test_demo',
            razorpaysecret: 'secret_demo',
            socialLinks: {
                twitter: 'https://twitter.com/demo',
                github: 'https://github.com/demo',
                linkedin: 'https://linkedin.com/in/demo',
                website: 'https://democreator.in',
            },
            stats: {
                totalRaised: 195500,
                totalSupporters: 226,
                campaignsCount: 5,
                successRate: 80,
            },
            notificationPreferences: {
                email: {
                    payment: true,
                    milestone: true,
                    comment: true,
                    update: true,
                    system: true,
                    campaign: true,
                    subscription: true,
                    follow: true,
                    reply: true,
                },
                inApp: {
                    payment: true,
                    milestone: true,
                    comment: true,
                    update: true,
                    system: true,
                    campaign: true,
                    subscription: true,
                    follow: true,
                    reply: true,
                },
                frequency: 'realtime',
                newsletter: true,
            },
        });

        // ── Supporter Users (for subscriptions / comments) ─────────────────────
        const supporterPassword = await bcrypt.hash('supporter123', 10);
        const supporterUsers = await User.insertMany(
            SUPPORTER_NAMES.slice(0, 5).map((name, i) => ({
                email: `supporter${i + 1}@example.com`,
                name,
                username: `supporter${i + 1}`,
                password: supporterPassword,
                role: 'supporter',
                verified: true,
                profilepic: '/images/default-profilepic.svg',
                coverpic: '/images/default-coverpic.svg',
            }))
        );

        console.log('👤  Created demo user + 5 supporter users');

        // ── Campaigns ──────────────────────────────────────────────────────────
        const campaignDefs = [
            {
                title: 'AI-Powered Learning Platform',
                slug: 'ai-learning-platform',
                category: 'technology',
                projectType: 'Software',
                shortDescription: 'Building an AI tutor that adapts to your learning style',
                brief: 'An adaptive AI learning platform targeting K-12 and college students in India.',
                hook: 'What if your textbook could understand how you think — and teach you accordingly?',
                story: 'We are creating a revolutionary learning platform that uses AI to understand how each student learns best and adapts the curriculum accordingly. This project aims to make quality education accessible to everyone — regardless of their background or location. Our AI engine has already been trained on thousands of learning patterns and the results are remarkable.',
                aiGenerated: true,
                goalAmount: 100000,
                currentAmount: 75000,
                endDate: daysFromNow(30),
                milestones: [
                    { title: 'MVP Complete', amount: 25000, description: 'Basic platform with AI integration', completed: true, completedAt: daysAgo(45) },
                    { title: 'Beta Testing', amount: 50000, description: '100 beta testers onboarded', completed: true, completedAt: daysAgo(20) },
                    { title: 'Full Launch', amount: 100000, description: 'Public release with all features', completed: false },
                ],
                rewards: [
                    { title: 'Early Access', amount: 500, description: 'Get early access to the platform', deliveryTime: '1 month' },
                    { title: 'Lifetime Premium', amount: 2000, description: 'Lifetime premium membership', deliveryTime: '2 months' },
                ],
                faqs: [
                    { question: 'When will the platform launch?', answer: 'We plan to launch in 3 months after beta testing.' },
                    { question: 'What subjects will be covered?', answer: 'All major subjects from K-12 to college level including Math, Science, History, and Languages.' },
                ],
                status: 'active',
                featured: true,
                verified: true,
                qualityScore: 92,
                location: 'Bangalore, India',
                tags: ['education', 'AI', 'edtech', 'learning'],
                stats: { views: 5420, supporters: 48, shares: 234, comments: 12 },
                publishedAt: daysAgo(60),
            },
            {
                title: 'Indie Game: Pixel Quest Adventures',
                slug: 'pixel-quest-game',
                category: 'games',
                projectType: 'Video Game',
                shortDescription: 'A retro-style RPG with modern gameplay mechanics',
                brief: 'A love letter to 16-bit RPGs with modern roguelike elements and hand-crafted art.',
                hook: 'Remember the magic of 16-bit RPGs? We are bringing it back — but better.',
                story: 'Pixel Quest is a nostalgic journey back to the golden age of 16-bit RPGs, but with modern gameplay innovations. Join us in creating this amazing adventure with a fully hand-crafted world, branching storylines, and a unique dynamic combat system.',
                aiGenerated: true,
                goalAmount: 50000,
                currentAmount: 35000,
                endDate: daysFromNow(45),
                milestones: [
                    { title: 'Demo Release', amount: 15000, description: 'Playable demo with 2 hours of content', completed: true, completedAt: daysAgo(30) },
                    { title: 'Art Assets Complete', amount: 30000, description: 'All sprites and backgrounds done', completed: false },
                    { title: 'Full Game Release', amount: 50000, description: 'Complete game with all chapters', completed: false },
                ],
                rewards: [
                    { title: 'Digital Copy', amount: 300, description: 'Get the game on release', deliveryTime: '6 months' },
                    { title: 'Deluxe Edition', amount: 800, description: 'Game + soundtrack + artbook PDF', deliveryTime: '6 months', limitedQuantity: 100, claimedCount: 23 },
                    { title: 'Name in Credits', amount: 1500, description: 'Your name in the game credits', deliveryTime: '6 months', limitedQuantity: 50, claimedCount: 11 },
                ],
                faqs: [
                    { question: 'What platforms will the game release on?', answer: 'PC, Mac, and Linux at launch. Console ports to follow.' },
                    { question: 'Will there be controller support?', answer: 'Yes, full controller support from day one.' },
                ],
                status: 'active',
                featured: false,
                verified: true,
                qualityScore: 88,
                tags: ['games', 'indie', 'rpg', 'pixel-art'],
                stats: { views: 3210, supporters: 35, shares: 156, comments: 8 },
                publishedAt: daysAgo(40),
            },
            {
                title: 'Sustainable Coffee Farm Initiative',
                slug: 'sustainable-coffee-farm',
                category: 'food',
                projectType: 'Agriculture',
                shortDescription: 'Organic, ethically sourced coffee from our family farm',
                brief: 'Transitioning our 5-acre family farm to fully organic, certified sustainable production.',
                hook: 'The best cup of coffee starts with soil that is loved, not exploited.',
                story: 'We are transforming our traditional coffee farm in Coorg into a fully sustainable, organic operation. Support us in bringing the best single-origin coffee directly from farm to cup! Every purchase supports fair wages for our farm workers and protects the local ecosystem.',
                goalAmount: 30000,
                currentAmount: 28500,
                endDate: daysFromNow(15),
                milestones: [
                    { title: 'Equipment Purchase', amount: 15000, description: 'Buy organic processing equipment', completed: true, completedAt: daysAgo(60) },
                    { title: 'Certification', amount: 25000, description: 'Get organic & fair-trade certification', completed: true, completedAt: daysAgo(10) },
                    { title: 'First Harvest', amount: 30000, description: 'Ship first 100% organic batch to backers', completed: false },
                ],
                rewards: [
                    { title: 'Coffee Subscription', amount: 500, description: '6 months of fresh single-origin coffee', deliveryTime: '3 months' },
                    { title: 'Farm Visit', amount: 5000, description: 'Visit our farm in Coorg for a weekend stay', deliveryTime: '6 months', limitedQuantity: 10, claimedCount: 4 },
                ],
                faqs: [
                    { question: 'What types of coffee do you grow?', answer: 'Arabica and Robusta, both shade-grown.' },
                ],
                status: 'active',
                featured: false,
                verified: true,
                qualityScore: 85,
                location: 'Coorg, Karnataka',
                tags: ['coffee', 'organic', 'sustainable', 'food'],
                stats: { views: 2150, supporters: 42, shares: 89, comments: 5 },
                publishedAt: daysAgo(30),
            },
            {
                title: 'Digital Art Gallery & NFT Collection',
                slug: 'digital-art-nft',
                category: 'art',
                projectType: 'Digital Art',
                shortDescription: 'Curated collection of original digital artwork celebrating Indian culture',
                brief: 'A 100-piece NFT collection fusing classical Indian motifs with contemporary digital art.',
                hook: 'Art that remembers its roots while reaching for the future.',
                story: 'Creating a unique collection that celebrates Indian culture through modern digital art. Each piece tells a story — from the mythology of ancient epics to the energy of modern city life. 10% of all proceeds go directly to art education initiatives for underprivileged children.',
                goalAmount: 40000,
                currentAmount: 12000,
                endDate: daysFromNow(60),
                milestones: [
                    { title: 'First 10 Artworks', amount: 10000, description: 'Complete and reveal first 10 pieces', completed: true, completedAt: daysAgo(15) },
                    { title: 'Full Collection', amount: 40000, description: 'Complete all 100 artworks', completed: false },
                ],
                rewards: [
                    { title: 'Limited Edition NFT', amount: 1000, description: 'Own a unique piece from the collection', limitedQuantity: 50, claimedCount: 8, deliveryTime: '1 month' },
                    { title: 'Collector Pack', amount: 3000, description: '5 NFTs + exclusive physical print', limitedQuantity: 20, claimedCount: 3, deliveryTime: '2 months' },
                ],
                faqs: [
                    { question: 'What blockchain are the NFTs on?', answer: 'Polygon, for low gas fees and eco-friendliness.' },
                ],
                status: 'active',
                featured: false,
                verified: false,
                qualityScore: 78,
                tags: ['art', 'nft', 'digital', 'culture'],
                stats: { views: 1820, supporters: 12, shares: 45, comments: 3 },
                publishedAt: daysAgo(20),
            },
            {
                title: 'Community Music Festival 2025',
                slug: 'music-festival-2025',
                category: 'music',
                projectType: 'Event',
                shortDescription: 'Three-day indie music festival featuring local artists',
                brief: 'Annual grassroots music festival in Pune supporting 50+ indie artists across 3 stages.',
                hook: 'Three days. Fifty artists. One city. This is the sound of Pune.',
                story: 'We are organizing the biggest indie music festival in Pune, featuring 50+ local and national artists across 3 days and 3 stages. Your support directly funds artist fees, stage production, and community outreach programs that bring live music to schools.',
                goalAmount: 80000,
                currentAmount: 45000,
                endDate: daysFromNow(90),
                milestones: [
                    { title: 'Venue Booking', amount: 30000, description: 'Secure the main festival venue', completed: true, completedAt: daysAgo(20) },
                    { title: 'Artist Contracts', amount: 50000, description: 'Confirm all 50+ artists', completed: false },
                    { title: 'Full Production', amount: 80000, description: 'Stage, sound, lighting, and logistics', completed: false },
                ],
                rewards: [
                    { title: 'Early Bird Ticket', amount: 500, description: '3-day festival pass', limitedQuantity: 200, claimedCount: 89, deliveryTime: '1 month' },
                    { title: 'VIP Experience', amount: 2000, description: 'VIP access + backstage meet & greet', limitedQuantity: 50, claimedCount: 12, deliveryTime: '1 month' },
                    { title: 'Sponsor a Stage', amount: 10000, description: 'Your brand on one of our 3 stages', limitedQuantity: 3, claimedCount: 1, deliveryTime: '2 months' },
                ],
                faqs: [
                    { question: 'Where will the festival be held?', answer: 'At Shaniwarwada grounds, Pune — venue confirmed.' },
                    { question: 'Will there be food stalls?', answer: 'Yes, we are partnering with 20+ local food vendors.' },
                ],
                status: 'active',
                featured: true,
                verified: true,
                qualityScore: 90,
                location: 'Pune, Maharashtra',
                tags: ['music', 'festival', 'indie', 'live'],
                stats: { views: 4560, supporters: 89, shares: 312, comments: 18 },
                publishedAt: daysAgo(25),
            },
        ];

        const createdCampaigns = await Campaign.insertMany(
            campaignDefs.map((c) => ({ creator: demoUser._id, username: 'democreator', ...c }))
        );
        console.log(`🎯  Created ${createdCampaigns.length} campaigns`);

        // ── Payments ───────────────────────────────────────────────────────────
        const AMOUNTS = [300, 500, 800, 1000, 1500, 2000, 5000, 10000];

        const payments = Array.from({ length: 60 }, (_, i) => {
            const campaign = randomPick(createdCampaigns);
            const amount = randomPick(AMOUNTS);
            const daysBack = randomInt(0, 60);
            const isAnon = Math.random() > 0.85;
            return {
                name: isAnon ? 'Anonymous' : randomPick(SUPPORTER_NAMES),
                email: `supporter${i}@example.com`,
                to_user: 'democreator',
                campaign: campaign._id,
                oid: `order_seed_${Date.now()}_${i}`,
                paymentId: `pay_seed_${Date.now()}_${i}`,
                amount,
                currency: 'INR',
                message: Math.random() > 0.3 ? randomPick(SUPPORT_MESSAGES) : '',
                type: 'one-time',
                anonymous: isAnon,
                hideAmount: Math.random() > 0.9,
                done: true,
                status: 'success',
                notifiedAt: daysAgo(daysBack),          // ← new field: mark as already notified
                createdAt: daysAgo(daysBack),
                updatedAt: daysAgo(daysBack),
            };
        });

        await Payment.insertMany(payments);
        console.log(`💰  Created ${payments.length} payments`);

        // ── Analytics (Event-based — matches new Analytics schema) ─────────────
        // Each document = one analytics event (visit / click / conversion / share)
        const analyticsEvents = [];

        for (const campaign of createdCampaigns) {
            // Generate 30 days of traffic: 15–40 events per day (kept lean for seed performance)
            for (let day = 0; day < 30; day++) {
                const eventCount = randomInt(15, 40);
                const eventDate = daysAgo(day);

                for (let e = 0; e < eventCount; e++) {
                    const eventType = weightedEventType();
                    const source = randomPick(TRAFFIC_SOURCES);
                    const device = randomPick(DEVICES);

                    analyticsEvents.push({
                        campaign: campaign._id,
                        date: eventDate,
                        eventType,
                        source,
                        device,
                        referrer: source === 'social' ? 'https://twitter.com' : '',
                        utmSource: source === 'social' ? 'twitter' : '',
                        utmMedium: source === 'social' ? 'social' : '',
                        utmCampaign: '',
                        amount: eventType === 'conversion' ? randomPick(AMOUNTS) : 0,
                        metadata: {},
                        createdAt: eventDate,
                    });
                }
            }
        }

        // Insert in batches to avoid hitting document size limits
        const BATCH_SIZE = 1000;
        for (let i = 0; i < analyticsEvents.length; i += BATCH_SIZE) {
            await Analytics.insertMany(analyticsEvents.slice(i, i + BATCH_SIZE));
        }
        console.log(`📈  Created ${analyticsEvents.length} analytics events`);

        // ── Campaign Updates ───────────────────────────────────────────────────
        const campaignUpdates = [
            {
                campaign: createdCampaigns[0]._id,
                creator: demoUser._id,
                title: 'Development Update: Week 4',
                content: 'Great progress this week! We completed the AI integration module and started beta testing with our first group of 50 users. The feedback has been overwhelmingly positive — students report a 30% improvement in comprehension scores.',
                visibility: 'public',
                status: 'published',
                stats: { views: 234, likes: 45 },
                publishDate: daysAgo(7),
                createdAt: daysAgo(7),
            },
            {
                campaign: createdCampaigns[0]._id,
                creator: demoUser._id,
                title: 'Milestone Reached: 75% Funded!',
                content: 'We have reached 75% of our goal thanks to 48 amazing backers! Your support means the world to us. We are on track for our Q2 beta launch.',
                visibility: 'public',
                status: 'published',
                stats: { views: 412, likes: 89 },
                publishDate: daysAgo(14),
                createdAt: daysAgo(14),
            },
            {
                campaign: createdCampaigns[1]._id,
                creator: demoUser._id,
                title: 'New Character Reveal: Meet Luna!',
                content: 'Meet Luna, one of the main characters in Pixel Quest! She is a rogue mage with a mysterious past and a dynamic skill tree. Check out her character design — what abilities would you like to see her master?',
                visibility: 'public',
                status: 'published',
                stats: { views: 189, likes: 67 },
                publishDate: daysAgo(3),
                createdAt: daysAgo(3),
            },
            {
                campaign: createdCampaigns[4]._id,
                creator: demoUser._id,
                title: 'Venue Confirmed: Shaniwarwada Grounds!',
                content: 'Big news! We have officially signed the contract for Shaniwarwada Grounds, Pune. This iconic venue will host all 3 festival stages. Ticket sales going live next week!',
                visibility: 'public',
                status: 'published',
                stats: { views: 876, likes: 213 },
                publishDate: daysAgo(5),
                createdAt: daysAgo(5),
            },
            {
                campaign: createdCampaigns[1]._id,
                creator: demoUser._id,
                title: 'Backers-Only: Alpha Demo Preview',
                content: 'Hey backers! Here is an exclusive look at the first dungeon in Pixel Quest. Download the alpha build link in your backer dashboard.',
                visibility: 'supporters-only',
                status: 'published',
                stats: { views: 98, likes: 34 },
                publishDate: daysAgo(1),
                createdAt: daysAgo(1),
            },
        ];

        await CampaignUpdate.insertMany(campaignUpdates);
        console.log(`📢  Created ${campaignUpdates.length} campaign updates`);

        // ── Comments ───────────────────────────────────────────────────────────
        // ── Step 1: Insert top-level pinned comment ─────────────────────────
        const topComment1 = await Comment.create({
            campaign: createdCampaigns[0]._id,
            user: demoUser._id,
            content: 'Thank you all for the amazing support! We are working hard to make this the best AI learning platform available in India. Every contribution brings us closer to our launch!',
            likes: 23,
            pinned: true,
            createdAt: daysAgo(20),
        });

        // ── Step 2: Insert regular comments (no parent references) ───────────
        const questionComment = await Comment.create({
            campaign: createdCampaigns[0]._id,
            user: supporterUsers[1]._id,
            content: 'How does the AI understand different learning styles? Would love more details.',
            likes: 8,
            createdAt: daysAgo(15),
        });

        const baseComments = [
            {
                campaign: createdCampaigns[0]._id,
                user: supporterUsers[0]._id,
                content: 'This is exactly what Indian students need. Backed and sharing with my college friends!',
                likes: 15,
                createdAt: daysAgo(18),
            },
            {
                campaign: createdCampaigns[1]._id,
                user: demoUser._id,
                content: 'Luna looks amazing! When can we play the demo?',
                likes: 12,
                pinned: true,
                createdAt: daysAgo(10),
            },
            {
                campaign: createdCampaigns[1]._id,
                user: supporterUsers[2]._id,
                content: 'Pledged for the Deluxe Edition — the artbook alone is worth it!',
                likes: 7,
                createdAt: daysAgo(8),
            },
            {
                campaign: createdCampaigns[4]._id,
                user: supporterUsers[3]._id,
                content: 'Already bought 2 VIP tickets. This festival is going to be legendary.',
                likes: 19,
                createdAt: daysAgo(5),
            },
            {
                campaign: createdCampaigns[2]._id,
                user: supporterUsers[4]._id,
                content: 'Love the farm-to-cup concept. Ordered the 6-month subscription!',
                likes: 11,
                createdAt: daysAgo(12),
            },
        ];

        await Comment.insertMany(baseComments);

        // ── Step 3: Insert reply AFTER the parent comment exists ─────────────
        await Comment.create({
            campaign: createdCampaigns[0]._id,
            user: demoUser._id,
            content: 'Great question! We use a combination of learning velocity analysis and adaptive quizzes to build a profile of each learner over time.',
            likes: 12,
            parentComment: questionComment._id,
            createdAt: daysAgo(14),
        });

        const totalComments = baseComments.length + 3; // topComment1 + questionComment + reply
        console.log(`💬  Created ${totalComments} comments (incl. pinned, threaded reply)`);

        // ── Notifications ─────────────────────────────────────────────────────
        const notifications = [
            {
                user: demoUser._id,
                type: 'payment',
                title: 'New Support Received! 🎉',
                message: 'Rahul Kumar just supported your "AI-Powered Learning Platform" with ₹2,000!',
                campaign: createdCampaigns[0]._id,
                link: `/dashboard`,
                metadata: { amount: 2000, supporterName: 'Rahul Kumar' },
                read: false,
                createdAt: daysAgo(0),
            },
            {
                user: demoUser._id,
                type: 'milestone',
                title: 'Milestone Reached! 🏆',
                message: 'Your campaign "AI-Powered Learning Platform" has reached 75% of its goal!',
                campaign: createdCampaigns[0]._id,
                link: `/campaign/ai-learning-platform`,
                metadata: { milestoneTitle: 'Beta Testing', milestoneAmount: 50000 },
                read: true,
                readAt: daysAgo(13),
                createdAt: daysAgo(14),
            },
            {
                user: demoUser._id,
                type: 'comment',
                title: 'New Comment on Your Campaign',
                message: 'Priya Singh commented on "AI-Powered Learning Platform": "This is exactly what Indian students need..."',
                campaign: createdCampaigns[0]._id,
                relatedUser: supporterUsers[0]._id,
                link: `/campaign/ai-learning-platform#comments`,
                read: true,
                readAt: daysAgo(17),
                createdAt: daysAgo(18),
            },
            {
                user: demoUser._id,
                type: 'campaign',
                title: 'Campaign Milestone Unlocked',
                message: 'Your "Sustainable Coffee Farm" campaign is 95% funded — almost there!',
                campaign: createdCampaigns[2]._id,
                link: `/campaign/sustainable-coffee-farm`,
                metadata: { percentage: 95 },
                read: false,
                createdAt: daysAgo(2),
            },
            {
                user: demoUser._id,
                type: 'system',
                title: 'Welcome to Get Me a Chai! ☕',
                message: 'Your account is verified and ready. Start by publishing your first campaign or exploring the dashboard.',
                link: `/dashboard`,
                read: true,
                readAt: daysAgo(55),
                createdAt: daysAgo(60),
            },
            {
                user: demoUser._id,
                type: 'payment',
                title: 'New Support Received! 🎉',
                message: 'Kavya Iyer just supported your "Community Music Festival 2025" with ₹500!',
                campaign: createdCampaigns[4]._id,
                link: `/dashboard`,
                metadata: { amount: 500, supporterName: 'Kavya Iyer' },
                read: false,
                createdAt: daysAgo(1),
            },
            {
                user: demoUser._id,
                type: 'update',
                title: 'Update Posted Successfully',
                message: 'Your update "Venue Confirmed: Shaniwarwada Grounds!" was published to 89 supporters.',
                campaign: createdCampaigns[4]._id,
                link: `/campaign/music-festival-2025/updates`,
                read: false,
                createdAt: daysAgo(5),
            },
            {
                user: demoUser._id,
                type: 'reply',
                title: 'New Reply to Your Comment',
                message: 'Amit Patel replied to your comment on "AI-Powered Learning Platform".',
                campaign: createdCampaigns[0]._id,
                relatedUser: supporterUsers[1]._id,
                link: `/campaign/ai-learning-platform#comments`,
                read: false,
                createdAt: daysAgo(1),
            },
        ];

        await Notification.insertMany(notifications);
        console.log(`🔔  Created ${notifications.length} notifications`);

        // ── Subscriptions ─────────────────────────────────────────────────────
        const subscriptions = [
            {
                subscriber: supporterUsers[0]._id,
                creator: demoUser._id,
                campaign: createdCampaigns[4]._id,
                razorpaySubscriptionId: 'sub_seed_001',
                amount: 500,
                frequency: 'monthly',
                status: 'active',
                startDate: daysAgo(60),
                nextBillingDate: daysFromNow(30),
            },
            {
                subscriber: supporterUsers[1]._id,
                creator: demoUser._id,
                campaign: createdCampaigns[0]._id,
                razorpaySubscriptionId: 'sub_seed_002',
                amount: 1000,
                frequency: 'monthly',
                status: 'active',
                startDate: daysAgo(30),
                nextBillingDate: daysFromNow(1),
            },
            {
                subscriber: supporterUsers[2]._id,
                creator: demoUser._id,
                razorpaySubscriptionId: 'sub_seed_003',
                amount: 2000,
                frequency: 'quarterly',
                status: 'cancelled',
                startDate: daysAgo(90),
                endDate: daysAgo(5),
            },
        ];

        await Subscription.insertMany(subscriptions);
        console.log(`🔁  Created ${subscriptions.length} subscriptions`);

        // ── CampaignViews ──────────────────────────────────────────────────────
        // One view record per (user, campaign) pair — unique constraint enforced
        const viewPairs = [];
        for (const supporter of supporterUsers) {
            for (const campaign of createdCampaigns) {
                viewPairs.push({
                    userId: supporter._id,
                    campaignId: campaign._id,
                    viewedAt: daysAgo(randomInt(0, 30)),
                });
            }
        }

        await CampaignView.insertMany(viewPairs);
        console.log(`👁️   Created ${viewPairs.length} campaign view records`);

        // ── Reports ────────────────────────────────────────────────────────────
        // One example resolved report (won't block any campaign)
        const reports = [
            {
                targetType: 'campaign',
                targetId: createdCampaigns[3]._id,  // Digital Art NFT
                reporter: supporterUsers[0]._id,
                reason: 'misleading',
                description: 'The campaign description seems to overstate the number of artworks completed.',
                status: 'dismissed',
                resolution: 'Reviewed by admin — descriptions are within acceptable accuracy range.',
                resolvedBy: demoUser._id,
                resolvedAt: daysAgo(5),
            },
        ];

        await Report.insertMany(reports);
        console.log(`🚩  Created ${reports.length} report(s)`);

        // ── Done ───────────────────────────────────────────────────────────────
        console.log('\n✅  Database seeded successfully!\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔐  Demo User Credentials:');
        console.log('    Email:    demo@getmeachai.com');
        console.log('    Password: demo123456');
        console.log('    Username: democreator');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`🎯  Campaigns:       ${createdCampaigns.length}`);
        console.log(`💰  Payments:        ${payments.length}`);
        console.log(`📈  Analytics events: ${analyticsEvents.length}`);
        console.log(`📢  Updates:         ${campaignUpdates.length}`);
        console.log(`💬  Comments:        ${totalComments}`);
        console.log(`🔔  Notifications:   ${notifications.length}`);
        console.log(`🔁  Subscriptions:   ${subscriptions.length}`);
        console.log(`👁️   Campaign Views:  ${viewPairs.length}`);
        console.log(`🚩  Reports:         ${reports.length}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('\n❌  Error seeding database:', error);
        await mongoose.disconnect().catch(() => {});
        process.exit(1);
    }
}

seedDatabase();