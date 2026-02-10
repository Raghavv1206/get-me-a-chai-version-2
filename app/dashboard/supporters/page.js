// app/dashboard/supporters/page.js
/**
 * Supporters Management Page
 * View and manage campaign supporters
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import SupportersTable from '@/components/supporters/SupportersTable';
import SupporterFilters from '@/components/supporters/SupporterFilters';
import TopSupporters from '@/components/supporters/TopSupporters';

export const metadata = {
    title: 'Supporters - Get Me A Chai',
    description: 'Manage your campaign supporters and send thank you messages'
};

export default async function SupportersPage() {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login?callbackUrl=/dashboard/supporters');
    }

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
                    <TopSupporters />

                    {/* Filters */}
                    <SupporterFilters />

                    {/* Supporters Table */}
                    <SupportersTable />

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
