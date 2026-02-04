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
import BulkActions from '@/components/supporters/BulkActions';
import ThankYouTemplates from '@/components/supporters/ThankYouTemplates';

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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Supporters</h1>
                <p className="text-gray-400">
                    View and engage with people who support your campaigns
                </p>
            </div>

            {/* Top Supporters */}
            <div className="mb-8">
                <TopSupporters />
            </div>

            {/* Filters and Bulk Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                    <SupporterFilters />
                </div>
                <div>
                    <BulkActions />
                </div>
            </div>

            {/* Supporters Table */}
            <div className="mb-8">
                <SupportersTable />
            </div>

            {/* Thank You Templates */}
            <div className="mb-8">
                <ThankYouTemplates />
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl p-6 border border-green-500/20">
                <h3 className="text-lg font-semibold text-white mb-2">
                    💚 Building Supporter Relationships
                </h3>
                <ul className="text-gray-300 text-sm space-y-2">
                    <li>• Send personalized thank you messages to show appreciation</li>
                    <li>• Keep supporters updated on campaign progress</li>
                    <li>• Recognize top supporters publicly (with their permission)</li>
                    <li>• Respond to messages and comments promptly</li>
                    <li>• Deliver rewards on time and communicate any delays</li>
                </ul>
            </div>
        </div>
    );
}
