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
import TopSupporters from '@/components/supporters/TopSupporters';
import SupporterFilters from '@/components/supporters/SupporterFilters';
import SupportersTable from '@/components/supporters/SupportersTable';

export const metadata = {
    title: 'Supporters - Get Me A Chai',
    description: 'Manage your campaign supporters and send thank you messages'
};

async function getSupportersData(userId) {
    await connectDb();

    // Get current user's username
    const user = await import('@/models/User').then(m => m.default.findById(userId).select('username'));

    if (!user) return [];

    // Fetch successful payments
    const payments = await Payment.find({
        to_user: user.username,
        done: true
    }).sort({ createdAt: -1 }).lean();

    // Aggregate supporters
    const supportersMap = {};

    payments.forEach(payment => {
        const supporterId = payment.email || 'anonymous'; // Use email as unique identifier

        if (!supportersMap[supporterId]) {
            supportersMap[supporterId] = {
                _id: payment._id.toString(), // Use first payment ID as key reference
                name: payment.name || 'Anonymous',
                email: payment.email || 'No Email',
                totalContributed: 0,
                donationsCount: 0,
                lastDonation: new Date(0), // Initialize with old date
                campaignsSupported: new Set()
            };
        }

        const supporter = supportersMap[supporterId];
        supporter.totalContributed += payment.amount;
        supporter.donationsCount += 1;
        supporter.campaignsSupported.add(payment.campaign);

        const paymentDate = new Date(payment.createdAt);
        if (paymentDate > supporter.lastDonation) {
            supporter.lastDonation = paymentDate;
        }
    });

    // Convert map to array and format
    const supporters = Object.values(supportersMap).map(s => ({
        ...s,
        lastDonation: s.lastDonation.toISOString(),
        campaignsSupported: Array.from(s.campaignsSupported).length
    }));

    // Sort by total contributed (descending)
    return supporters.sort((a, b) => b.totalContributed - a.totalContributed);
}

export default async function SupportersPage() {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login?callbackUrl=/dashboard/supporters');
    }

    const supporters = await getSupportersData(session.user.id);

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

                    {/* Top Supporters */}
                    <TopSupporters supporters={supporters.slice(0, 3)} />

                    {/* Filters */}
                    <SupporterFilters />

                    {/* Supporters Table */}
                    <SupportersTable supporters={supporters} />

                    {/* Tips */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span>💚</span>
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
