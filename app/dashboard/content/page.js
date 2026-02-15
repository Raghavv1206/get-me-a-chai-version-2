// app/dashboard/content/page.js
/**
 * Content Manager Page
 * Create and manage campaign updates/posts
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDb from '@/db/connectDb';
import Campaign from '@/models/Campaign';
import CampaignUpdate from '@/models/CampaignUpdate';
import ContentClient from '@/components/content/ContentClient';

export const metadata = {
    title: 'Content Manager - Get Me A Chai',
    description: 'Create and manage campaign updates'
};

async function getContentData(userId) {
    await connectDb();

    // Fetch user's active campaigns (for the create form)
    const campaigns = await Campaign.find({
        creator: userId,
        status: { $in: ['active', 'completed'] }
    }).select('title _id').lean();

    // Fetch user's updates (for the list)
    const updates = await CampaignUpdate.find({
        creator: userId
    })
        .sort({ createdAt: -1 })
        .populate('campaign', 'title')
        .lean();

    // Serialize MongoDB objects
    return {
        campaigns: campaigns.map(c => ({ ...c, _id: c._id.toString() })),
        updates: updates.map(u => ({
            ...u,
            _id: u._id.toString(),
            campaign: u.campaign ? { ...u.campaign, _id: u.campaign._id.toString() } : null,
            creator: u.creator.toString(),
            createdAt: u.createdAt.toISOString(),
            updatedAt: u.updatedAt.toISOString(),
            publishedAt: u.publishedAt?.toISOString(),
            scheduledFor: u.scheduledFor?.toISOString()
        }))
    };
}

export default async function ContentPage() {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login?callbackUrl=/dashboard/content');
    }

    const { campaigns, updates } = await getContentData(session.user.id);

    return (
        <div className="min-h-screen bg-black text-gray-100">
            {/* Background Ambient Effects - Same as Dashboard */}
            <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />
            <div className="fixed bottom-0 left-20 w-[400px] h-[400px] bg-blue-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />

            {/* Main Content */}
            <main className="pt-24 px-4 md:px-8 pb-8 min-h-screen relative">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Content Manager</h1>
                        <p className="text-gray-400 mt-1">
                            Create updates to keep your supporters engaged
                        </p>
                    </div>

                    {/* Content Client - Handles Form and List */}
                    <ContentClient campaigns={campaigns} updates={updates} />

                    {/* Best Practices */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span>✍️</span>
                            <span>Update Best Practices</span>
                        </h3>
                        <ul className="text-gray-300 text-sm space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="text-purple-400 mt-0.5">•</span>
                                <span>Post regular updates to keep supporters engaged (weekly is ideal)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-400 mt-0.5">•</span>
                                <span>Share progress, milestones, and behind-the-scenes content</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-400 mt-0.5">•</span>
                                <span>Be transparent about challenges and setbacks</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-400 mt-0.5">•</span>
                                <span>Include photos and videos to make updates more engaging</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-400 mt-0.5">•</span>
                                <span>Thank supporters and acknowledge their contributions</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-400 mt-0.5">•</span>
                                <span>Use "Supporters Only" updates to make backers feel special</span>
                            </li>
                        </ul>
                    </div>

                </div>
            </main>
        </div>
    );
}
