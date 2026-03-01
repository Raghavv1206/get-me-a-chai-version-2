// components/dashboard/DashboardClient.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import StatsCards from '@/components/dashboard/StatsCards';
import EarningsChart from '@/components/dashboard/EarningsChart';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import CampaignPerformance from '@/components/dashboard/CampaignPerformance';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentActivity from '@/components/dashboard/RecentActivity';

export default function DashboardClient({ data }) {
  // Guard against missing data
  const user = data?.user || { name: 'User', username: '' };
  const stats = data?.stats || {};
  const chartData = data?.chartData || { daily: [], hourly: [], monthly: [] };
  const transactions = data?.transactions || [];
  const campaigns = data?.campaigns || [];
  const activities = data?.activities || [];

  return (
    <div className="pt-20 px-4 md:px-8 pb-12">
      {/* Background Ambient Effects */}
      <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="fixed bottom-0 left-20 w-[400px] h-[400px] bg-blue-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
            <p className="text-gray-400 mt-1">
              Welcome back, <span className="text-purple-400 font-medium">{user.name}</span>!
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <StatsCards stats={stats} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8 items-start">
          {/* Left Column (Charts & Transactions) */}
          <div className="xl:col-span-2 space-y-6 lg:space-y-8">
            <EarningsChart data={chartData} />
            <RecentTransactions transactions={transactions} />
          </div>

          {/* Right Column (Campaigns & Actions) */}
          <div className="space-y-6 lg:space-y-8">
            <CampaignPerformance campaigns={campaigns} />
            <QuickActions />
            <RecentActivity activities={activities} />
          </div>
        </div>
      </div>
    </div>
  );
}
