// components/moderation/AIModeratorDashboard.js
"use client"

/**
 * AI Moderator Dashboard Component
 * 
 * Features:
 * - Shows what AI has flagged
 * - Reason for flagging
 * - Statistics and trends
 * - Quick actions
 * 
 * @component
 */

import { Shield, AlertTriangle, CheckCircle, XCircle, TrendingUp, Activity } from 'lucide-react';

export default function AIModeratorDashboard({ stats, recentFlags, loading = false }) {
    if (loading) {
        return <DashboardSkeleton />;
    }

    if (!stats) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400 text-center">
                    No moderation data available
                </p>
            </div>
        );
    }

    const statCards = [
        {
            label: 'Total Scanned',
            value: stats.totalScanned || 0,
            icon: Activity,
            color: 'from-blue-500 to-cyan-600',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            textColor: 'text-blue-600 dark:text-blue-400',
        },
        {
            label: 'Auto-Approved',
            value: stats.autoApproved || 0,
            icon: CheckCircle,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            textColor: 'text-green-600 dark:text-green-400',
        },
        {
            label: 'Pending Review',
            value: stats.pendingReview || 0,
            icon: AlertTriangle,
            color: 'from-orange-500 to-red-600',
            bgColor: 'bg-orange-50 dark:bg-orange-900/20',
            textColor: 'text-orange-600 dark:text-orange-400',
        },
        {
            label: 'Auto-Rejected',
            value: stats.autoRejected || 0,
            icon: XCircle,
            color: 'from-red-500 to-pink-600',
            bgColor: 'bg-red-50 dark:bg-red-900/20',
            textColor: 'text-red-600 dark:text-red-400',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;

                    return (
                        <div
                            key={stat.label}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
                        >
                            <div className={`${stat.bgColor} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                                <Icon className={`w-6 h-6 ${stat.textColor}`} />
                            </div>

                            <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                                {stat.value.toLocaleString()}
                            </div>

                            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                {stat.label}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent AI Flags */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-600" />
                    Recent AI Detections
                </h3>

                {recentFlags && recentFlags.length > 0 ? (
                    <div className="space-y-3">
                        {recentFlags.slice(0, 5).map((flag, idx) => (
                            <div
                                key={idx}
                                className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                            >
                                <div className={`p-2 rounded-lg ${flag.riskScore >= 70
                                        ? 'bg-red-100 dark:bg-red-900/30'
                                        : flag.riskScore >= 50
                                            ? 'bg-orange-100 dark:bg-orange-900/30'
                                            : 'bg-yellow-100 dark:bg-yellow-900/30'
                                    }`}>
                                    <AlertTriangle className={`w-4 h-4 ${flag.riskScore >= 70
                                            ? 'text-red-600 dark:text-red-400'
                                            : flag.riskScore >= 50
                                                ? 'text-orange-600 dark:text-orange-400'
                                                : 'text-yellow-600 dark:text-yellow-400'
                                        }`} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900 dark:text-white truncate">
                                        {flag.title || 'Untitled Content'}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        Risk Score: {flag.riskScore}/100 • {flag.type}
                                    </div>
                                    {flag.reasons && flag.reasons.length > 0 && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {flag.reasons[0]}
                                        </div>
                                    )}
                                </div>

                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(flag.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                        No recent AI detections
                    </p>
                )}
            </div>

            {/* Detection Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Detection Categories
                    </h3>
                    <div className="space-y-3">
                        <CategoryBar
                            label="Inappropriate Language"
                            count={stats.categories?.inappropriate || 0}
                            total={stats.totalScanned || 1}
                            color="bg-red-600"
                        />
                        <CategoryBar
                            label="Spam Patterns"
                            count={stats.categories?.spam || 0}
                            total={stats.totalScanned || 1}
                            color="bg-orange-600"
                        />
                        <CategoryBar
                            label="Scam Indicators"
                            count={stats.categories?.scam || 0}
                            total={stats.totalScanned || 1}
                            color="bg-yellow-600"
                        />
                        <CategoryBar
                            label="Prohibited Content"
                            count={stats.categories?.prohibited || 0}
                            total={stats.totalScanned || 1}
                            color="bg-purple-600"
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        AI Performance
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Accuracy Rate
                                </span>
                                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                    {stats.accuracyRate || 95}%
                                </span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-600 transition-all duration-1000"
                                    style={{ width: `${stats.accuracyRate || 95}%` }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    False Positive Rate
                                </span>
                                <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                                    {stats.falsePositiveRate || 5}%
                                </span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-orange-600 transition-all duration-1000"
                                    style={{ width: `${stats.falsePositiveRate || 5}%` }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Average Response Time
                                </span>
                                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                    {stats.avgResponseTime || 150}ms
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Category Bar Component
 */
function CategoryBar({ label, count, total, color }) {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {count}
                </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} transition-all duration-1000`}
                    style={{ width: `${percentage}%` }}
                />
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
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                    </div>
                ))}
            </div>
        </div>
    );
}
