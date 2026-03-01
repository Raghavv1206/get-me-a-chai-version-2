// app/dashboard/supporters/page.js
/**
 * Supporters Management Page
 * View and manage campaign supporters
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDb from '@/db/connectDb';
import Payment from '@/models/Payment';
import Campaign from '@/models/Campaign';
import TopSupporters from '@/components/supporters/TopSupporters';
import SupportersPageClient from '@/components/supporters/SupportersPageClient';
import { HeartHandshake } from 'lucide-react';

export const metadata = {
    title: 'Supporters - Get Me A Chai',
    description: 'Manage your campaign supporters and send thank you messages'
};

async function getPageData(userId) {
    await connectDb();

    // Get current user's username
    const User = (await import('@/models/User')).default;
    const user = await User.findById(userId).select('username');

    if (!user) return { payments: [], campaigns: [], topSupporters: [] };

    // Fetch payments and campaigns in parallel
    const [payments, campaigns] = await Promise.all([
        Payment.find({
            to_user: user.username,
            done: true
        }).sort({ createdAt: -1 }).lean(),

        Campaign.find({
            username: user.username
        }).select('_id title').lean()
    ]);

    // Serialize for client component (convert ObjectIds & Dates to strings)
    const serializedPayments = payments.map(p => ({
        _id: p._id.toString(),
        name: p.name || 'Anonymous',
        email: p.email || '',
        amount: p.amount,
        type: p.type || 'one-time',
        campaign: p.campaign ? p.campaign.toString() : null,
        createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
        message: p.message || ''
    }));

    const serializedCampaigns = campaigns.map(c => ({
        _id: c._id.toString(),
        title: c.title
    }));

    // Aggregate top supporters (for the TopSupporters card — unfiltered, always show overall top 3)
    const supportersMap = {};
    payments.forEach(payment => {
        const supporterId = payment.email || 'anonymous';
        if (!supportersMap[supporterId]) {
            supportersMap[supporterId] = {
                _id: payment._id.toString(),
                name: payment.name || 'Anonymous',
                email: payment.email || 'No Email',
                totalContributed: 0,
                donationsCount: 0,
                lastDonation: new Date(0).toISOString(),
                campaignsSupported: new Set()
            };
        }

        const supporter = supportersMap[supporterId];
        supporter.totalContributed += payment.amount;
        supporter.donationsCount += 1;
        if (payment.campaign) supporter.campaignsSupported.add(payment.campaign.toString());

        const paymentDate = new Date(payment.createdAt);
        if (paymentDate > new Date(supporter.lastDonation)) {
            supporter.lastDonation = paymentDate.toISOString();
        }
    });

    const topSupporters = Object.values(supportersMap)
        .map(s => ({ ...s, campaignsSupported: s.campaignsSupported.size }))
        .sort((a, b) => b.totalContributed - a.totalContributed)
        .slice(0, 3);

    return {
        payments: serializedPayments,
        campaigns: serializedCampaigns,
        topSupporters
    };
}

export default async function SupportersPage() {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login?callbackUrl=/dashboard/supporters');
    }

    const { payments, campaigns, topSupporters } = await getPageData(session.user.id);

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
                        <h1 className="text-3xl font-bold text-white tracking-tight">Supporters</h1>
                        <p className="text-gray-400 mt-1">
                            View and engage with people who support your campaigns
                        </p>
                    </div>

                    {/* Top Supporters (always unfiltered) */}
                    <TopSupporters supporters={topSupporters} />

                    {/* Filters + Table (connected via client wrapper) */}
                    <SupportersPageClient payments={payments} campaigns={campaigns} />

                    {/* Tips */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span><HeartHandshake className="w-5 h-5 text-green-400" /></span>
                            <span>Building Supporter Relationships</span>
                        </h3>
                        <ul className="text-gray-300 text-sm space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-0.5">•</span>
                                <span>Send personalized thank you messages to show appreciation</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-0.5">•</span>
                                <span>Keep supporters updated on campaign progress</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-0.5">•</span>
                                <span>Recognize top supporters publicly (with their permission)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-0.5">•</span>
                                <span>Respond to messages and comments promptly</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-0.5">•</span>
                                <span>Deliver rewards on time and communicate any delays</span>
                            </li>
                        </ul>
                    </div>

                </div>
            </main>
        </div>
    );
}
