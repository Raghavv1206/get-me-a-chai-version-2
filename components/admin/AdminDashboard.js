// components/admin/AdminDashboard.js
"use client"

/**
 * Admin Dashboard Component
 * 
 * Features:
 * - Platform-wide statistics
 * - Total users, campaigns, revenue
 * - Growth charts
 * - Recent signups
 * - Real-time metrics
 * 
 * @component
 */

import { useState, useEffect } from 'react';
import { Users, DollarSign, TrendingUp, Activity, Calendar, Award } from 'lucide-react';

export default function AdminDashboard({ stats, loading = false }) {
    const [animatedStats, setAnimatedStats] = useState({
        totalUsers: 0,
        totalCampaigns: 0,
        totalRevenue: 0,
        activeSubscriptions: 0,
    });

    // Animate numbers
    useEffect(() => {
        if (!stats || loading) return;

        const duration = 1500;
        const steps = 60;
        const interval = duration / steps;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;

            setAnimatedStats({
                totalUsers: Math.floor(stats.totalUsers * progress),
                totalCampaigns: Math.floor(stats.totalCampaigns * progress),
                totalRevenue: Math.floor(stats.totalRevenue * progress),
                activeSubscriptions: Math.floor(stats.activeSubscriptions * progress),
            });

            if (currentStep >= steps) {
                clearInterval(timer);
                setAnimatedStats({
                    totalUsers: stats.totalUsers,
                    totalCampaigns: stats.totalCampaigns,
                    totalRevenue: stats.totalRevenue,
                    activeSubscriptions: stats.activeSubscriptions,
                });
            }
        }, interval);

        return () => clearInterval(timer);
    }, [stats, loading]);

    if (loading) {
        return <DashboardSkeleton />;
    }

    if (!stats) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400 text-center">
                    No statistics available
                </p>
            </div>
        );
    }

    const statCards = [
        {
            label: 'Total Users',
            value: animatedStats.totalUsers.toLocaleString(),
            icon: Users,
            color: 'from-blue-500 to-cyan-600',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            textColor: 'text-blue-600 dark:text-blue-400',
            change: stats.userGrowth,
        },
        {
            label: 'Total Campaigns',
            value: animatedStats.totalCampaigns.toLocaleString(),
            icon: Activity,
            color: 'from-purple-500 to-pink-600',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
            textColor: 'text-purple-600 dark:text-purple-400',
            change: stats.campaignGrowth,
        },
        {
            label: 'Total Revenue',
            value: `₹${animatedStats.totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            textColor: 'text-green-600 dark:text-green-400',
            change: stats.revenueGrowth,
        },
        {
            label: 'Active Subscriptions',
            value: animatedStats.activeSubscriptions.toLocaleString(),
            icon: Award,
            color: 'from-orange-500 to-red-600',
            bgColor: 'bg-orange-50 dark:bg-orange-900/20',
            textColor: 'text-orange-600 dark:text-orange-400',
            change: stats.subscriptionGrowth,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    const isPositive = stat.change >= 0;

                    return (
                        <div
                            key={stat.label}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
                            style={{
                                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                            }}
                        >
                            {/* Icon */}
                            <div className={`${stat.bgColor} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                                <Icon className={`w-6 h-6 ${stat.textColor}`} />
                            </div>

                            {/* Value */}
                            <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                                {stat.value}
                            </div>

                            {/* Label */}
                            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">
                                {stat.label}
                            </div>

                            {/* Growth */}
                            {stat.change !== undefined && (
                                <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    <TrendingUp className={`w-4 h-4 ${!isPositive && 'rotate-180'}`} />
                                    <span>{Math.abs(stat.change)}%</span>
                                    <span className="text-gray-500 dark:text-gray-400">vs last month</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Signups */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-600" />
                        Recent Signups
                    </h3>
                    {stats.recentSignups && stats.recentSignups.length > 0 ? (
                        <div className="space-y-3">
                            {stats.recentSignups.slice(0, 5).map((user) => (
                                <div
                                    key={user._id}
                                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                                >
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                                        {user.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-gray-900 dark:text-white truncate">
                                            {user.name || 'Unknown User'}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                            {user.email}
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                            No recent signups
                        </p>
                    )}
                </div>

                {/* Quick Stats */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-purple-600" />
                        Quick Stats
                    </h3>
                    <div className="space-y-4">
                        <QuickStat
                            label="Verified Users"
                            value={stats.verifiedUsers || 0}
                            total={stats.totalUsers}
                            color="text-green-600 dark:text-green-400"
                        />
                        <QuickStat
                            label="Active Campaigns"
                            value={stats.activeCampaigns || 0}
                            total={stats.totalCampaigns}
                            color="text-blue-600 dark:text-blue-400"
                        />
                        <QuickStat
                            label="Pending Approvals"
                            value={stats.pendingCampaigns || 0}
                            total={stats.totalCampaigns}
                            color="text-orange-600 dark:text-orange-400"
                        />
                        <QuickStat
                            label="Flagged Content"
                            value={stats.flaggedContent || 0}
                            total={stats.totalCampaigns}
                            color="text-red-600 dark:text-red-400"
                        />
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}

/**
 * Quick Stat Component
 */
function QuickStat({ label, value, total, color }) {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                </span>
                <span className={`text-sm font-semibold ${color}`}>
                    {value.toLocaleString()}
                </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                    className={`h-full ${color.replace('text-', 'bg-')} transition-all duration-1000 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {percentage}% of total
            </div>
        </div>
    );
}

/**
 * Loading skeleton
 */
function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse"
                    >
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4" />
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-24" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse"
                    >
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4" />
                        <div className="space-y-3">
                            {[...Array(3)].map((_, j) => (
                                <div key={j} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
