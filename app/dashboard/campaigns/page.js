import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import connectDb from '@/db/connectDb';
import Campaign from '@/models/Campaign';
import CampaignsList from '@/components/dashboard/CampaignsList';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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

    console.log('Campaigns Page - User ID:', userId);
    console.log('Campaigns Page - Campaigns found:', campaigns.length);
    if (campaigns.length > 0) {
        console.log('First campaign:', {
            title: campaigns[0].title,
            creator: campaigns[0].creator,
            status: campaigns[0].status
        });
    }

    // Convert MongoDB objects to plain objects
    return JSON.parse(JSON.stringify(campaigns));
}

export default async function CampaignsPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login?callbackUrl=/dashboard/campaigns');
    }

    const campaigns = await getCampaigns(session.user.id);

    return (
        <div className="min-h-screen bg-black text-gray-100">
            {/* Background Ambient Effects - Same as Dashboard */}
            <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />
            <div className="fixed bottom-0 left-20 w-[400px] h-[400px] bg-blue-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />

            {/* Main Content */}
            <main className="pt-24 px-4 md:px-8 pb-8 min-h-screen relative">
                <div className="max-w-7xl mx-auto">
                    <CampaignsList campaigns={campaigns} />
                </div>
            </main>
        </div>
    );
}
