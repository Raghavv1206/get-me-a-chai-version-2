// scripts/seed.js - FIXED for ES Modules
import mongoose from 'mongoose';
import User from '../models/User.js';
import Campaign from '../models/Campaign.js';
import Payment from '../models/Payment.js';
import Analytics from '../models/Analytics.js';
import CampaignUpdate from '../models/CampaignUpdate.js';
import Comment from '../models/Comment.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/get-me-a-chai';

async function seedDatabase() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Campaign.deleteMany({});
        await Payment.deleteMany({});
        await Analytics.deleteMany({});
        await CampaignUpdate.deleteMany({});
        await Comment.deleteMany({});
        console.log('Cleared existing data');

        // Hash demo password
        const demoPassword = await bcrypt.hash('demo123456', 10);

        // Create Demo User
        const demoUser = await User.create({
            email: 'demo@getmeachai.com',
            name: 'Demo Creator',
            username: 'democreator',
            password: demoPassword,
            profilepic: '/images/default-profilepic.svg',
            coverpic: '/images/default-coverpic.jpg',
            bio: 'I am a demo creator building amazing projects!',
            location: 'Mumbai, India',
            role: 'creator',
            verified: true,
            razorpayid: 'rzp_test_demo',
            razorpaysecret: 'secret_demo',
            socialLinks: {
                twitter: 'https://twitter.com/demo',
                github: 'https://github.com/demo'
            },
            stats: {
                totalRaised: 50000,
                totalSupporters: 125,
                campaignsCount: 5,
                successRate: 80
            }
        });

        console.log('Created demo user');

        // Create 5 diverse campaigns
        const campaigns = [
            {
                creator: demoUser._id,
                username: 'democreator',
                title: 'AI-Powered Learning Platform',
                slug: 'ai-learning-platform',
                category: 'technology',
                projectType: 'Software',
                shortDescription: 'Building an AI tutor that adapts to your learning style',
                story: 'We are creating a revolutionary learning platform that uses AI to understand how each student learns best and adapts the curriculum accordingly. This project aims to make quality education accessible to everyone.',
                aiGenerated: true,
                goalAmount: 100000,
                currentAmount: 75000,
                coverImage: '/images/campaigns/tech-1.jpg',
                images: ['/images/campaigns/tech-1.jpg', '/images/campaigns/tech-2.jpg'],
                videoUrl: 'https://youtube.com/watch?v=demo',
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                milestones: [
                    { title: 'MVP Complete', amount: 25000, description: 'Basic platform with AI integration', completed: true },
                    { title: 'Beta Testing', amount: 50000, description: '100 beta testers onboarded', completed: true },
                    { title: 'Full Launch', amount: 100000, description: 'Public release with all features', completed: false }
                ],
                rewards: [
                    { title: 'Early Access', amount: 500, description: 'Get early access to the platform', deliveryTime: '1 month' },
                    { title: 'Lifetime Premium', amount: 2000, description: 'Lifetime premium membership', deliveryTime: '2 months' }
                ],
                faqs: [
                    { question: 'When will the platform launch?', answer: 'We plan to launch in 3 months' },
                    { question: 'What subjects will be covered?', answer: 'All major subjects from K-12 to college level' }
                ],
                status: 'active',
                featured: true,
                stats: { views: 5420, supporters: 48, shares: 234, comments: 12 },
                qualityScore: 92,
                location: 'Bangalore, India'
            },
            {
                creator: demoUser._id,
                username: 'democreator',
                title: 'Indie Game: Pixel Quest Adventures',
                slug: 'pixel-quest-game',
                category: 'games',
                projectType: 'Video Game',
                shortDescription: 'A retro-style RPG with modern gameplay mechanics',
                story: 'Pixel Quest is a nostalgic journey back to the golden age of 16-bit RPGs, but with modern gameplay innovations. Join us in creating this amazing adventure!',
                aiGenerated: true,
                goalAmount: 50000,
                currentAmount: 35000,
                coverImage: '/images/campaigns/game-1.jpg',
                endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
                milestones: [
                    { title: 'Demo Release', amount: 15000, description: 'Playable demo with 2 hours content', completed: true },
                    { title: 'Art Assets Complete', amount: 30000, description: 'All sprites and backgrounds done', completed: false }
                ],
                rewards: [
                    { title: 'Digital Copy', amount: 300, description: 'Get the game on release', deliveryTime: '6 months' },
                    { title: 'Deluxe Edition', amount: 800, description: 'Game + soundtrack + artbook', deliveryTime: '6 months', limitedQuantity: 100, claimedCount: 23 }
                ],
                faqs: [
                    { question: 'What platforms?', answer: 'PC, Mac, Linux, and consoles later' }
                ],
                status: 'active',
                stats: { views: 3210, supporters: 35, shares: 156, comments: 8 },
                qualityScore: 88
            },
            {
                creator: demoUser._id,
                username: 'democreator',
                title: 'Sustainable Coffee Farm Initiative',
                slug: 'sustainable-coffee-farm',
                category: 'food',
                projectType: 'Agriculture',
                shortDescription: 'Organic, ethically sourced coffee from our family farm',
                story: 'We are transforming our traditional coffee farm into a fully sustainable, organic operation. Support us in bringing the best coffee directly from farm to cup!',
                goalAmount: 30000,
                currentAmount: 28500,
                coverImage: '/images/campaigns/food-1.jpg',
                endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                milestones: [
                    { title: 'Equipment Purchase', amount: 15000, description: 'Buy organic processing equipment', completed: true },
                    { title: 'Certification', amount: 25000, description: 'Get organic certification', completed: true }
                ],
                rewards: [
                    { title: 'Coffee Subscription', amount: 500, description: '6 months of fresh coffee', deliveryTime: '3 months' }
                ],
                status: 'active',
                stats: { views: 2150, supporters: 42, shares: 89, comments: 5 },
                qualityScore: 85
            },
            {
                creator: demoUser._id,
                username: 'democreator',
                title: 'Digital Art Gallery & NFT Collection',
                slug: 'digital-art-nft',
                category: 'art',
                projectType: 'Digital Art',
                shortDescription: 'Curated collection of original digital artwork',
                story: 'Creating a unique NFT collection that celebrates Indian culture through modern digital art. Each piece tells a story.',
                goalAmount: 40000,
                currentAmount: 12000,
                coverImage: '/images/campaigns/art-1.jpg',
                endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                milestones: [
                    { title: 'First 10 Artworks', amount: 10000, description: 'Complete first collection', completed: true }
                ],
                rewards: [
                    { title: 'Limited Edition NFT', amount: 1000, description: 'Own a unique NFT', limitedQuantity: 50, claimedCount: 8 }
                ],
                status: 'active',
                stats: { views: 1820, supporters: 12, shares: 45, comments: 3 },
                qualityScore: 78
            },
            {
                creator: demoUser._id,
                username: 'democreator',
                title: 'Community Music Festival 2025',
                slug: 'music-festival-2025',
                category: 'music',
                projectType: 'Event',
                shortDescription: 'Three-day indie music festival featuring local artists',
                story: 'We are organizing the biggest indie music festival in our city, featuring 50+ local artists across 3 days. Help us make this dream a reality!',
                goalAmount: 80000,
                currentAmount: 45000,
                coverImage: '/images/campaigns/music-1.jpg',
                endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                milestones: [
                    { title: 'Venue Booking', amount: 30000, description: 'Secure the venue', completed: true },
                    { title: 'Artist Contracts', amount: 50000, description: 'Confirm all artists', completed: false }
                ],
                rewards: [
                    { title: 'Early Bird Ticket', amount: 500, description: '3-day pass', limitedQuantity: 200, claimedCount: 89 },
                    { title: 'VIP Experience', amount: 2000, description: 'VIP access + meet & greet', limitedQuantity: 50, claimedCount: 12 }
                ],
                status: 'active',
                featured: true,
                stats: { views: 4560, supporters: 89, shares: 312, comments: 18 },
                qualityScore: 90
            }
        ];

        const createdCampaigns = await Campaign.insertMany(campaigns);
        console.log('Created campaigns');

        // Create realistic supporter payments
        const supporters = [
            'Rahul Kumar', 'Priya Singh', 'Amit Patel', 'Sneha Reddy', 'Arjun Verma',
            'Ananya Sharma', 'Rohan Gupta', 'Kavya Iyer', 'Vikram Malhotra', 'Diya Mehta',
            'Karan Kapoor', 'Neha Agarwal', 'Siddharth Roy', 'Pooja Joshi', 'Aditya Nair'
        ];

        const messages = [
            'Great project! Keep it up!',
            'Excited to see this come to life!',
            'Supporting from day one!',
            'Love the vision, best of luck!',
            'This is exactly what we need!',
            'Can\'t wait to see the final product!',
            'Amazing work, keep going!',
            'Proud to be a supporter!',
            'This will change everything!',
            'Supporting innovation!'
        ];

        const payments = [];
        for (let i = 0; i < 50; i++) {
            const campaign = createdCampaigns[Math.floor(Math.random() * createdCampaigns.length)];
            const amount = [500, 1000, 2000, 5000, 10000][Math.floor(Math.random() * 5)];

            payments.push({
                name: supporters[Math.floor(Math.random() * supporters.length)],
                email: `supporter${i}@example.com`,
                to_user: 'democreator',
                campaign: campaign._id,
                oid: `order_${Date.now()}_${i}`,
                paymentId: `pay_${Date.now()}_${i}`,
                amount: amount,
                message: messages[Math.floor(Math.random() * messages.length)],
                type: 'one-time',
                anonymous: Math.random() > 0.8,
                done: true,
                status: 'success',
                createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
            });
        }

        await Payment.insertMany(payments);
        console.log('Created payments');

        // Create analytics data for last 30 days
        const analyticsData = [];
        for (let i = 0; i < 30; i++) {
            for (const campaign of createdCampaigns) {
                const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
                analyticsData.push({
                    campaign: campaign._id,
                    date: date,
                    views: Math.floor(Math.random() * 200) + 50,
                    uniqueVisitors: Math.floor(Math.random() * 150) + 30,
                    clicks: Math.floor(Math.random() * 50) + 10,
                    conversions: Math.floor(Math.random() * 5) + 1,
                    sources: {
                        direct: Math.floor(Math.random() * 50),
                        social: Math.floor(Math.random() * 80),
                        search: Math.floor(Math.random() * 40),
                        referral: Math.floor(Math.random() * 30)
                    },
                    devices: {
                        mobile: Math.floor(Math.random() * 100) + 50,
                        desktop: Math.floor(Math.random() * 80) + 30,
                        tablet: Math.floor(Math.random() * 20) + 5
                    },
                    topCities: [
                        { city: 'Mumbai', count: Math.floor(Math.random() * 50) },
                        { city: 'Delhi', count: Math.floor(Math.random() * 40) },
                        { city: 'Bangalore', count: Math.floor(Math.random() * 45) }
                    ]
                });
            }
        }

        await Analytics.insertMany(analyticsData);
        console.log('Created analytics data');

        // Create campaign updates
        const updates = [
            {
                campaign: createdCampaigns[0]._id,
                creator: demoUser._id,
                title: 'Development Update: Week 4',
                content: 'Great progress this week! We completed the AI integration module and started beta testing with our first group of users. The feedback has been overwhelmingly positive!',
                visibility: 'public',
                status: 'published',
                stats: { views: 234, likes: 45 },
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            },
            {
                campaign: createdCampaigns[1]._id,
                creator: demoUser._id,
                title: 'New Character Reveal!',
                content: 'Meet Luna, one of the main characters in Pixel Quest! Check out her design and abilities. What do you think?',
                visibility: 'public',
                status: 'published',
                stats: { views: 189, likes: 67 },
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
            }
        ];

        await CampaignUpdate.insertMany(updates);
        console.log('Created campaign updates');

        // Create comments
        const comments = [
            {
                campaign: createdCampaigns[0]._id,
                user: demoUser._id,
                content: 'Thank you all for the amazing support! We are working hard to make this the best learning platform.',
                likes: 23,
                pinned: true
            },
            {
                campaign: createdCampaigns[1]._id,
                user: demoUser._id,
                content: 'Luna looks amazing! When can we play the demo?',
                likes: 12
            }
        ];

        await Comment.insertMany(comments);
        console.log('Created comments');

        console.log('\n✅ Database seeded successfully!');
        console.log('\n🔐 Demo User Credentials:');
        console.log('Email: demo@getmeachai.com');
        console.log('Password: demo123456');
        console.log('Username: democreator');
        console.log(`\n📊 Created ${createdCampaigns.length} campaigns`);
        console.log(`💰 Created ${payments.length} payments`);
        console.log(`📈 Created ${analyticsData.length} analytics records`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();