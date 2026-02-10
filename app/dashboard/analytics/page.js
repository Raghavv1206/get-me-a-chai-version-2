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
        <div className="min-h-screen bg-black text-gray-100">
            {/* Background Ambient Effects - Same as Dashboard */}
            <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />
            <div className="fixed bottom-0 left-20 w-[400px] h-[400px] bg-blue-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />

            {/* Main Content */}
            <main className="pt-24 px-4 md:px-8 pb-8 min-h-screen relative">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Analytics</h1>
                        <p className="text-gray-400 mt-1">
                            Track your campaign performance and get AI-powered insights
                        </p>
                    </div>

                    {/* Analytics Overview */}
                    <AnalyticsOverview />

                    {/* AI Insights */}
                    <AIInsightsPanel />

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
                        {/* Visitor Chart - Full Width */}
                        <div className="xl:col-span-2">
                            <VisitorChart />
                        </div>

                        {/* Traffic Sources */}
                        <TrafficSources />

                        {/* Device Breakdown */}
                        <DeviceBreakdown />

                        {/* Conversion Funnel */}
                        <ConversionFunnel />

                        {/* Revenue Chart */}
                        <RevenueChart />
                    </div>

                    {/* Export Reports */}
                    <ExportReports />

                    {/* Help Text */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span>📊</span>
                            <span>Understanding Your Analytics</span>
                        </h3>
                        <div className="text-gray-300 text-sm space-y-3">
                            <div className="flex gap-3">
                                <span className="font-semibold text-purple-400 min-w-[140px]">Visitors:</span>
                                <span>Unique people who viewed your campaign page</span>
                            </div>
                            <div className="flex gap-3">
                                <span className="font-semibold text-purple-400 min-w-[140px]">Conversion Rate:</span>
                                <span>Percentage of visitors who made a donation</span>
                            </div>
                            <div className="flex gap-3">
                                <span className="font-semibold text-purple-400 min-w-[140px]">Traffic Sources:</span>
                                <span>Where your visitors are coming from (social media, search, direct, etc.)</span>
                            </div>
                            <div className="flex gap-3">
                                <span className="font-semibold text-purple-400 min-w-[140px]">AI Insights:</span>
                                <span>Personalized recommendations to improve your campaign performance</span>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
