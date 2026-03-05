// app/campaign/[id]/page.js
import { notFound } from 'next/navigation';
import mongoose from 'mongoose';
import connectDb from '@/db/connectDb';
import Campaign from '@/models/Campaign';
import User from '@/models/User';
import Payment from '@/models/Payment';
import CampaignProfile from '@/components/campaign/profile/CampaignProfile';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

        // Fetch session and campaign in parallel for performance
        const [session, campaign] = await Promise.all([
            getServerSession(authOptions).catch(() => null),
            Campaign.findById(id)
                // NOTE: razorpaysecret is intentionally excluded — it must never be sent to the client.
                // razorpayid (public Key ID) is included because the Razorpay checkout modal needs it.
                .populate('creator', 'name email verified username bio location socialLinks stats coverpic profilepic razorpayid')
        ]);

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
        const uniqueSupporters = await Payment.distinct('userId', {
            to_user: creator.username,
            done: true
        });
        const totalSupporters = uniqueSupporters.length;

        // ─── Determine if the current user is a supporter ───
        let isSupporter = false;

        if (session?.user) {
            // Look up the current user's DB record
            const currentUser = await User.findOne({ email: session.user.email })
                .select('_id email')
                .lean();

            if (currentUser) {
                const currentUserId = currentUser._id.toString();
                const campaignCreatorId = creatorId.toString();

                // The campaign creator can always see supporters-only content
                if (currentUserId === campaignCreatorId) {
                    isSupporter = true;
                } else {
                    // Check if the user has at least one successful payment for this campaign
                    // Use multiple matching strategies for robustness:
                    //   1. Match by campaign ObjectId (for campaign-specific payments)
                    //   2. Match by to_user (for general creator payments)
                    // A user who paid for ANY of this creator's campaigns OR specifically
                    // this campaign counts as a supporter.
                    const supporterPayment = await Payment.findOne({
                        $or: [
                            // Direct campaign supporter (paid for this specific campaign)
                            {
                                campaign: new mongoose.Types.ObjectId(id),
                                userId: currentUser._id,
                                done: true,
                            },
                            // Also check by email in case userId wasn't set on older payments
                            {
                                campaign: new mongoose.Types.ObjectId(id),
                                email: session.user.email,
                                done: true,
                            },
                            // General creator supporter (paid to this creator via to_user)
                            {
                                to_user: creator.username,
                                userId: currentUser._id,
                                done: true,
                            },
                            {
                                to_user: creator.username,
                                email: session.user.email,
                                done: true,
                            }
                        ]
                    })
                        .select('_id')
                        .lean();

                    isSupporter = !!supporterPayment;
                }
            }
        }

        // Ensure creator has required fields with real data
        // Use the correct default image paths that match the files in /public/images/
        const DEFAULT_PROFILE_PIC = '/images/default-profilepic.svg';
        const DEFAULT_COVER_PIC = '/images/default-coverpic.svg';

        // Sanitize image URLs — some users have stale DB values with wrong extensions
        // (e.g. /images/default-profilepic.jpg instead of .svg)
        const sanitizeImageUrl = (url, defaultUrl) => {
            if (!url || typeof url !== 'string' || url.trim() === '') {
                return defaultUrl;
            }
            // Fix known stale default image paths with wrong extensions
            if (url.includes('default-profilepic') && !url.endsWith('.svg')) {
                return DEFAULT_PROFILE_PIC;
            }
            if (url.includes('default-coverpic') && !url.endsWith('.svg')) {
                return DEFAULT_COVER_PIC;
            }
            return url;
        };

        const creatorData = {
            _id: creator._id,
            name: creator.name || 'Anonymous',
            username: creator.username || creator.email?.split('@')[0] || 'user',
            // NOTE: email is included only for display; if you want to hide it from public, remove it.
            email: creator.email,
            profilepic: sanitizeImageUrl(creator.profilepic, DEFAULT_PROFILE_PIC),
            coverpic: sanitizeImageUrl(creator.coverpic, DEFAULT_COVER_PIC),
            bio: creator.bio || '',
            location: creator.location || '',
            verified: creator.verified || false,
            socialLinks: creator.socialLinks || {},
            // razorpayid (public Key ID) is safe to expose — it's used by the Razorpay
            // checkout modal on the frontend. The secret is NEVER sent to the client.
            razorpayid: creator.razorpayid || '',
            stats: {
                totalRaised,
                totalSupporters,
                campaignsCount,
                successRate
            }
        };

        return <CampaignProfile campaign={campaignData} creator={creatorData} isSupporter={isSupporter} />;
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
