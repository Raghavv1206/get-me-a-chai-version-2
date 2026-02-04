// components/dashboard/DashboardClient.js
'use client';

import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import StatsCards from '@/components/dashboard/StatsCards';
import EarningsChart from '@/components/dashboard/EarningsChart';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import CampaignPerformance from '@/components/dashboard/CampaignPerformance';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentActivity from '@/components/dashboard/RecentActivity';

export default function DashboardClient({ data }) {
  return (
    <div className="flex min-h-screen bg-black text-gray-100">
      <DashboardSidebar user={data.user} />

      <main className="flex-1 lg:ml-72 transition-all duration-300 p-4 md:p-8 pt-24 lg:pt-8 min-h-screen relative z-0">
        {/* Background Ambient Effects */}
        <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />
        <div className="fixed bottom-0 left-20 w-[400px] h-[400px] bg-blue-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
              <p className="text-gray-400 mt-1">Welcome back, <span className="text-purple-400 font-medium">{data.user.name}</span>!</p>
            </div>
            {/* Date/Time or Action Button could go here */}
          </div>

          {/* Stats Overview */}
          <StatsCards stats={data.stats} />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column (Charts & Transactions) */}
            <div className="xl:col-span-2 space-y-6 lg:space-y-8">
              <EarningsChart data={data.chartData} />
              <RecentTransactions transactions={data.transactions} />
            </div>

            {/* Right Column (Campaigns & Actions) */}
            <div className="space-y-6 lg:space-y-8">
              <CampaignPerformance campaigns={data.campaigns} />
              <QuickActions />
              <RecentActivity activities={data.activities} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
