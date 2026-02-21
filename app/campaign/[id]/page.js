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
            .populate('creator', 'name email profileImage verified username bio location socialLinks stats coverpic profilepic razorpayid razorpaysecret');

        if (!campaign) {
            notFound();
        }

        // Auto-close if expired
        if (['active', 'paused'].includes(campaign.status) && campaign.endDate && new Date() > new Date(campaign.endDate)) {
            campaign.status = 'completed';
            await campaign.save();
        }

        // Convert MongoDB ObjectId to string
        const campaignData = JSON.parse(JSON.stringify(campaign.toObject()));

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

        // Compute real creator stats from database
        const creatorId = campaign.creator._id;

        // Get all campaigns by this creator
        const creatorCampaigns = await Campaign.find({
            creator: creatorId,
            status: { $nin: ['deleted', 'draft'] }
        }).select('currentAmount goalAmount status').lean();

        const campaignsCount = creatorCampaigns.length;
        const totalRaised = creatorCampaigns.reduce((sum, c) => sum + (c.currentAmount || 0), 0);
        const completedCampaigns = creatorCampaigns.filter(c => c.status === 'completed');
        const successfulCampaigns = completedCampaigns.filter(c => (c.currentAmount || 0) >= (c.goalAmount || 1));
        const successRate = campaignsCount > 0 ? Math.round((successfulCampaigns.length / campaignsCount) * 100) : 0;

        // Get unique supporters count from payments
        const Payment = (await import('@/models/Payment')).default;
        const uniqueSupporters = await Payment.distinct('userId', {
            to_user: creator.username,
            done: true
        });
        const totalSupporters = uniqueSupporters.length;

        // Ensure creator has required fields with real data
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
            stats: {
                totalRaised,
                totalSupporters,
                campaignsCount,
                successRate
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
