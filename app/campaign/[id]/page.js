// app/campaign/[id]/page.js
import { notFound } from 'next/navigation';
import mongoose from 'mongoose';
import connectDb from '@/db/connectDb';
import Campaign from '@/models/Campaign';
import User from '@/models/User';
import CampaignProfile from '@/components/campaign/profile/CampaignProfile';

/**
 * Campaign Detail Page
 * 
 * Public page for viewing individual campaigns
 * Accessible at /campaign/[campaignId]
 */
export default async function CampaignPage({ params }) {
    const { id } = await params;

    // Validate that the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        notFound();
    }

    try {
        await connectDb();

        // Fetch campaign with creator details
        const campaign = await Campaign.findById(id)
            .populate('creator', 'name email profileImage verified username bio location socialLinks stats coverpic profilepic razorpayid razorpaysecret')
            .lean();

        if (!campaign) {
            notFound();
        }

        // Convert MongoDB ObjectId to string
        const campaignData = JSON.parse(JSON.stringify(campaign));

        // Calculate days remaining
        const deadline = new Date(campaign.endDate);
        const now = new Date();
        const daysRemaining = Math.max(0, Math.ceil((deadline - now) / (1000 * 60 * 60 * 24)));

        // Separate creator data from campaign data
        const creator = campaignData.creator;
        delete campaignData.creator;

        // Add computed fields to campaign
        campaignData.daysRemaining = daysRemaining;
        // Use the actual field names from the Campaign model
        campaignData.currentAmount = campaign.currentAmount || 0;
        campaignData.goalAmount = campaign.goalAmount || 0;

        // Ensure creator has required fields with defaults
        const creatorData = {
            _id: creator._id,
            name: creator.name || 'Anonymous',
            username: creator.username || creator.email?.split('@')[0] || 'user',
            email: creator.email,
            profilepic: creator.profileImage || creator.profilepic || '/default-avatar.png',
            coverpic: creator.coverpic || '/default-cover.jpg',
            bio: creator.bio || '',
            location: creator.location || '',
            verified: creator.verified || false,
            socialLinks: creator.socialLinks || {},
            razorpayid: creator.razorpayid || '',
            razorpaysecret: creator.razorpaysecret || '',
            stats: creator.stats || {
                totalRaised: 0,
                totalSupporters: 0,
                campaignsCount: 1,
                successRate: 0
            }
        };

        return <CampaignProfile campaign={campaignData} creator={creatorData} />;
    } catch (error) {
        console.error('Error loading campaign:', error);
        notFound();
    }
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }) {
    const { id } = await params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
            title: 'Campaign Not Found | Get Me A Chai',
        };
    }

    try {
        await connectDb();
        const campaign = await Campaign.findById(id).select('title description').lean();

        if (!campaign) {
            return {
                title: 'Campaign Not Found',
            };
        }

        return {
            title: `${campaign.title} | Get Me A Chai`,
            description: campaign.description || campaign.title,
        };
    } catch (error) {
        return {
            title: 'Campaign | Get Me A Chai',
        };
    }
}
