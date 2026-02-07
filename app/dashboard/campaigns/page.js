import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import connectDb from '@/db/connectDb';
import Campaign from '@/models/Campaign';
import CampaignsList from '@/components/dashboard/CampaignsList';

export const metadata = {
    title: 'My Campaigns - Get Me A Chai',
    description: 'Manage your campaigns'
};

async function getCampaigns(userId) {
    'use server';

    await connectDb();

    const campaigns = await Campaign.find({
        creator: userId,
        status: { $ne: 'deleted' }
    })
        .sort({ createdAt: -1 })
        .populate('creator', 'username name')
        .lean();

    // Convert MongoDB objects to plain objects
    return JSON.parse(JSON.stringify(campaigns));
}

export default async function CampaignsPage() {
    const session = await getServerSession();

    if (!session) {
        redirect('/login?callbackUrl=/dashboard/campaigns');
    }

    const campaigns = await getCampaigns(session.user.id);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-20 p-6">
            <CampaignsList campaigns={campaigns} />
        </div>
    );
}
