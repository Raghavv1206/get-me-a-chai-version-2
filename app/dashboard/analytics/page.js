// app/dashboard/analytics/page.js
/**
 * Analytics Dashboard Page
 * Comprehensive analytics and insights for campaign performance
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import AnalyticsOverview from '@/components/analytics/AnalyticsOverview';
import VisitorChart from '@/components/analytics/VisitorChart';
import TrafficSources from '@/components/analytics/TrafficSources';
import ConversionFunnel from '@/components/analytics/ConversionFunnel';
import DeviceBreakdown from '@/components/analytics/DeviceBreakdown';
import RevenueChart from '@/components/analytics/RevenueChart';
import AIInsightsPanel from '@/components/analytics/AIInsightsPanel';
import ExportReports from '@/components/analytics/ExportReports';

export const metadata = {
    title: 'Analytics - Get Me A Chai',
    description: 'View detailed analytics and insights for your campaigns'
};

export default async function AnalyticsPage() {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login?callbackUrl=/dashboard/analytics');
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-20 p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
                <p className="text-gray-400">
                    Track your campaign performance and get AI-powered insights
                </p>
            </div>

            {/* Analytics Overview */}
            <div className="mb-8">
                <AnalyticsOverview />
            </div>

            {/* AI Insights */}
            <div className="mb-8">
                <AIInsightsPanel />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Visitor Chart */}
                <div className="lg:col-span-2">
                    <VisitorChart />
                </div>

                {/* Traffic Sources */}
                <div>
                    <TrafficSources />
                </div>

                {/* Device Breakdown */}
                <div>
                    <DeviceBreakdown />
                </div>

                {/* Conversion Funnel */}
                <div>
                    <ConversionFunnel />
                </div>

                {/* Revenue Chart */}
                <div>
                    <RevenueChart />
                </div>
            </div>

            {/* Export Reports */}
            <div className="mb-8">
                <ExportReports />
            </div>

            {/* Help Text */}
            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-500/20">
                <h3 className="text-lg font-semibold text-white mb-2">
                    📊 Understanding Your Analytics
                </h3>
                <div className="text-gray-300 text-sm space-y-2">
                    <p>
                        <strong>Visitors:</strong> Unique people who viewed your campaign page
                    </p>
                    <p>
                        <strong>Conversion Rate:</strong> Percentage of visitors who made a donation
                    </p>
                    <p>
                        <strong>Traffic Sources:</strong> Where your visitors are coming from (social media, search, direct, etc.)
                    </p>
                    <p>
                        <strong>AI Insights:</strong> Personalized recommendations to improve your campaign performance
                    </p>
                </div>
            </div>
        </div>
    );
}
