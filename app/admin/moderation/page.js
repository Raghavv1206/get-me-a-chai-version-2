// app/admin/moderation/page.js
"use client"

/**
 * Admin Moderation Page
 * 
 * Features:
 * - AI Moderator Dashboard
 * - Moderation Queue
 * - Tab navigation
 * - Real-time stats
 * 
 * @page
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Shield, Activity, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import AIModeratorDashboard from '@/components/moderation/AIModeratorDashboard';
import ModerationQueue from '@/components/moderation/ModerationQueue';

export default function AdminModerationPage() {
    const { data: session, status } = useSession();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const [dashboardStats, setDashboardStats] = useState(null);
    const [queueItems, setQueueItems] = useState(null);

    // ========================================================================
    // FETCH DATA
    // ========================================================================

    useEffect(() => {
        if (session?.user?.isAdmin) {
            fetchData();
        }
    }, [session, activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            if (activeTab === 'dashboard') {
                await fetchDashboardStats();
            } else if (activeTab === 'queue') {
                await fetchQueue();
            }

        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const fetchDashboardStats = async () => {
        const response = await fetch('/api/admin/moderation/stats');
        const data = await response.json();

        if (data.success) {
            setDashboardStats(data.stats);
        } else {
            throw new Error(data.error);
        }
    };

    const fetchQueue = async () => {
        const response = await fetch('/api/admin/moderation/queue');
        const data = await response.json();

        if (data.success) {
            setQueueItems(data.items);
        } else {
            throw new Error(data.error);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    // ========================================================================
    // LOADING STATE
    // ========================================================================

    if (status === 'loading' || (status === 'authenticated' && loading && !dashboardStats && !queueItems)) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-black">
                <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
                    <div className="animate-pulse space-y-8">
                        <div className="h-12 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    // ========================================================================
    // TABS
    // ========================================================================

    const tabs = [
        { id: 'dashboard', label: 'AI Dashboard', icon: Activity },
        { id: 'queue', label: 'Moderation Queue', icon: Shield },
    ];

    // ========================================================================
    // RENDER
    // ========================================================================

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-black">
            <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/admin"
                        className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Admin Panel
                    </Link>

                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                                    AI Content Moderation
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    Automated content scanning and review
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-300 dark:hover:border-purple-600 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isActive
                                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div>
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border-2 border-red-200 dark:border-red-800 mb-6">
                            <p className="text-red-700 dark:text-red-300">{error}</p>
                        </div>
                    )}

                    {activeTab === 'dashboard' && (
                        <AIModeratorDashboard
                            stats={dashboardStats}
                            recentFlags={dashboardStats?.recentFlags}
                            loading={loading}
                        />
                    )}

                    {activeTab === 'queue' && (
                        <ModerationQueue
                            items={queueItems}
                            onRefresh={handleRefresh}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
