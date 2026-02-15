// app/dashboard/analytics/page.js
/**
 * Analytics Dashboard Page
 * Comprehensive analytics and insights for campaign performance
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDb from '@/db/connectDb';
import Campaign from '@/models/Campaign';
import Payment from '@/models/Payment';
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

async function getAnalyticsData(userId) {
    await connectDb();

    // Fetch user's campaigns
    const campaigns = await Campaign.find({
        creator: userId,
        status: { $ne: 'deleted' }
    }).lean();

    // Fetch successful payments
    const payments = await Payment.find({
        to_user: (await import('@/models/User').then(m => m.default.findById(userId).select('username'))).username,
        done: true
    }).populate('campaign', 'title').sort({ createdAt: 1 }).lean();

    // Aggregate stats
    const totalViews = campaigns.reduce((sum, c) => sum + (c.stats?.views || 0), 0);
    const totalSupporters = new Set(payments.map(p => p.name || p.email)).size;
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    // Calculate conversion rate (avoid division by zero)
    const conversionRate = totalViews > 0 ? (totalSupporters / totalViews) * 100 : 0;

    // Mock data for trends (since we don't track historical daily snapshots yet)
    // In a real app, you'd having a daily_stats collection
    const overviewData = {
        '30': {
            views: totalViews,
            viewsChange: 12, // Mock change percentage
            clicks: Math.floor(totalViews * 0.6), // Mock clicks
            clicksChange: 8,
            conversionRate: conversionRate,
            conversionChange: 2.5,
            bounceRate: 45, // Mock bounce rate
            bounceChange: -5
        },
        '7': {
            views: Math.floor(totalViews * 0.25),
            viewsChange: 5,
            clicks: Math.floor(totalViews * 0.15),
            clicksChange: 3,
            conversionRate: conversionRate,
            conversionChange: 1.2,
            bounceRate: 42,
            bounceChange: -2
        },
        '90': {
            views: totalViews, // Assuming all within 90 days for now
            viewsChange: 15,
            clicks: Math.floor(totalViews * 0.6),
            clicksChange: 10,
            conversionRate: conversionRate,
            conversionChange: 3.0,
            bounceRate: 48,
            bounceChange: -4
        },
        'all': {
            views: totalViews,
            viewsChange: 0,
            clicks: Math.floor(totalViews * 0.6),
            clicksChange: 0,
            conversionRate: conversionRate,
            conversionChange: 0,
            bounceRate: 45,
            bounceChange: 0
        }
    };

    // Prepare chart data based on actual payments
    const revenueData = payments.map(p => ({
        date: new Date(p.createdAt).toLocaleDateString(),
        amount: p.amount,
        campaign: p.campaign?.title || 'General Support'
    }));

    // Generate mock visitor chart data (since we don't have daily tracking yet)
    const visitorChartData = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));

        // Distribute total views somewhat randomly or use 0
        const dailyViews = totalViews > 0 ? Math.max(0, Math.floor(totalViews / 30) + (Math.random() * 4 - 2)) : 0;

        return {
            date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
            unique: Math.floor(dailyViews * 0.7),
            returning: Math.floor(dailyViews * 0.3)
        };
    });

    return {
        overview: overviewData,
        revenue: revenueData,
        visitorChartData,
        campaigns: campaigns.map(c => ({ title: c.title, views: c.stats?.views || 0 })),
        totalRevenue
    };
}

export default async function AnalyticsPage() {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login?callbackUrl=/dashboard/analytics');
    }

    const data = await getAnalyticsData(session.user.id);

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
                    <AnalyticsOverview data={data.overview} />

                    {/* AI Insights */}
                    <AIInsightsPanel campaigns={data.campaigns} />

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
                        {/* Visitor Chart - Full Width */}
                        <div className="xl:col-span-2">
                            <VisitorChart data={data.visitorChartData} />
                        </div>

                        {/* Traffic Sources */}
                        <TrafficSources />

                        {/* Device Breakdown */}
                        <DeviceBreakdown />

                        {/* Conversion Funnel */}
                        <ConversionFunnel conversionRate={data.overview['30'].conversionRate} />

                        {/* Revenue Chart */}
                        <RevenueChart data={data.revenue} total={data.totalRevenue} />
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
