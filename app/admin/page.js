// app/admin/page.js
"use client"

/**
 * Admin Panel Page
 * 
 * Features:
 * - Admin-only access
 * - Dashboard with stats
 * - User management
 * - Campaign moderation
 * - Tab navigation
 * - Real-time data
 * 
 * @page
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Shield, Users, Activity, DollarSign, Settings, AlertTriangle, RefreshCw } from 'lucide-react';
import AdminDashboard from '@/components/admin/AdminDashboard';
import UserManagement from '@/components/admin/UserManagement';
import CampaignModeration from '@/components/admin/CampaignModeration';
import { getUsers } from '@/actions/adminActions';

export default function AdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const [dashboardStats, setDashboardStats] = useState(null);
    const [usersData, setUsersData] = useState(null);
    const [campaignsData, setCampaignsData] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    // ========================================================================
    // AUTHORIZATION CHECK
    // ========================================================================

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login?callbackUrl=/admin');
        } else if (status === 'authenticated' && !session?.user?.isAdmin) {
            router.push('/dashboard');
        }
    }, [status, session, router]);

    // ========================================================================
    // FETCH DATA
    // ========================================================================

    useEffect(() => {
        if (session?.user?.isAdmin) {
            fetchData();
        }
    }, [session, activeTab, currentPage]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            if (activeTab === 'dashboard') {
                await fetchDashboardStats();
            } else if (activeTab === 'users') {
                await fetchUsers();
            } else if (activeTab === 'campaigns') {
                await fetchCampaigns();
            }

        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const fetchDashboardStats = async () => {
        // Fetch dashboard stats from API
        const response = await fetch('/api/admin/stats');
        const data = await response.json();

        if (data.success) {
            setDashboardStats(data.stats);
        } else {
            throw new Error(data.error);
        }
    };

    const fetchUsers = async () => {
        const result = await getUsers({ page: currentPage, limit: 20 });

        if (result.success) {
            setUsersData(result);
        } else {
            throw new Error(result.error);
        }
    };

    const fetchCampaigns = async () => {
        // Fetch campaigns for moderation
        const response = await fetch('/api/admin/campaigns');
        const data = await response.json();

        if (data.success) {
            setCampaignsData(data.campaigns);
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

    if (status === 'loading' || (status === 'authenticated' && loading && !dashboardStats && !usersData && !campaignsData)) {
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
    // UNAUTHORIZED
    // ========================================================================

    if (status === 'authenticated' && !session?.user?.isAdmin) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-black flex items-center justify-center">
                <div className="max-w-md mx-auto bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 border-2 border-red-200 dark:border-red-800 text-center">
                    <Shield className="w-16 h-16 text-red-600 dark:text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-red-900 dark:text-red-200 mb-4">
                        Access Denied
                    </h2>
                    <p className="text-red-700 dark:text-red-300 mb-6">
                        You don't have permission to access the admin panel.
                    </p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // ========================================================================
    // TABS
    // ========================================================================

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: Activity },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'campaigns', label: 'Campaigns', icon: AlertTriangle },
        { id: 'payments', label: 'Payments', icon: DollarSign },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    // ========================================================================
    // RENDER
    // ========================================================================

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-black">
            <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                                    Admin Panel
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    Platform management and moderation
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
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        setCurrentPage(1);
                                    }}
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${isActive
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
                        <AdminDashboard stats={dashboardStats} loading={loading} />
                    )}

                    {activeTab === 'users' && (
                        <UserManagement
                            users={usersData?.users}
                            total={usersData?.total || 0}
                            page={currentPage}
                            totalPages={usersData?.totalPages || 1}
                            onPageChange={setCurrentPage}
                            onRefresh={handleRefresh}
                        />
                    )}

                    {activeTab === 'campaigns' && (
                        <CampaignModeration
                            campaigns={campaignsData}
                            onRefresh={handleRefresh}
                        />
                    )}

                    {activeTab === 'payments' && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 border border-gray-200 dark:border-gray-700 text-center">
                            <DollarSign className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Payment Logs
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Coming soon - View and manage all platform transactions
                            </p>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 border border-gray-200 dark:border-gray-700 text-center">
                            <Settings className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                System Settings
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Coming soon - Configure platform settings and features
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
