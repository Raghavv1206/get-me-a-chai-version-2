// components/dashboard/DashboardClient.js
'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  FaHome,
  FaFolder,
  FaChartLine,
  FaUsers,
  FaEdit,
  FaCog,
  FaBars,
  FaTimes,
  FaSignOutAlt
} from 'react-icons/fa';
import { signOut } from 'next-auth/react';
import StatsCards from '@/components/dashboard/StatsCards';
import EarningsChart from '@/components/dashboard/EarningsChart';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import CampaignPerformance from '@/components/dashboard/CampaignPerformance';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentActivity from '@/components/dashboard/RecentActivity';

export default function DashboardClient({ data }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', icon: FaHome, label: 'Overview' },
    { href: '/dashboard/campaigns', icon: FaFolder, label: 'Campaigns' },
    { href: '/dashboard/analytics', icon: FaChartLine, label: 'Analytics' },
    { href: '/dashboard/supporters', icon: FaUsers, label: 'Supporters' },
    { href: '/dashboard/content', icon: FaEdit, label: 'Content' },
    { href: '/dashboard/settings', icon: FaCog, label: 'Settings' }
  ];

  const isActive = (href) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-black text-gray-100">
      {/* Top Navigation Bar - Hidden since we use main Navbar */}
      <nav className="hidden fixed top-0 left-0 right-0 z-[100] bg-black/95 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">


            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 rounded-lg transition-all duration-200 ${active
                      ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white border border-purple-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-purple-400' : 'text-gray-500'}`} />
                    <span className="font-medium text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Profile & Sign Out */}
            <div className="flex items-center gap-3">
              {/* User Profile */}
              <div className="hidden lg:flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-white/5">
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/10">
                  <Image
                    src={data.user?.profilepic || '/images/default-profilepic.svg'}
                    alt={data.user?.name || 'User'}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <p className="text-xs font-semibold text-white">{data.user?.name}</p>
                  <p className="text-xs text-gray-500">@{data.user?.username}</p>
                </div>
              </div>

              {/* Sign Out Button - Desktop */}
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="hidden md:flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
              >
                <FaSignOutAlt className="w-4 h-4" />
                <span className="font-medium text-sm">Sign Out</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 text-white rounded-lg hover:bg-white/5"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-white/10 py-4 space-y-2">
              {/* User Profile - Mobile */}
              <div className="flex items-center gap-3 px-4 py-3 mb-4 rounded-lg bg-white/5 border border-white/5">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10">
                  <Image
                    src={data.user?.profilepic || '/images/default-profilepic.svg'}
                    alt={data.user?.name || 'User'}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{data.user?.name}</p>
                  <p className="text-xs text-gray-500">@{data.user?.username}</p>
                </div>
              </div>

              {/* Mobile Nav Items */}
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${active
                      ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white border border-purple-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <Icon className={`w-5 h-5 ${active ? 'text-purple-400' : 'text-gray-500'}`} />
                    <span className="font-medium text-sm">{item.label}</span>
                  </Link>
                );
              })}

              {/* Sign Out - Mobile */}
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
              >
                <FaSignOutAlt className="w-5 h-5" />
                <span className="font-medium text-sm">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 px-4 md:px-8 pb-8 min-h-screen relative">
        {/* Background Ambient Effects */}
        <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />
        <div className="fixed bottom-0 left-20 w-[400px] h-[400px] bg-blue-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
              <p className="text-gray-400 mt-1">Welcome back, <span className="text-purple-400 font-medium">{data.user.name}</span>!</p>
            </div>
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
