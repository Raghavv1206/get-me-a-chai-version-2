'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    FaArrowLeft,
    FaEye,
    FaUsers,
    FaComments,
    FaShare,
    FaChartLine,
    FaCalendar,
    FaMoneyBillWave,
    FaSpinner,
    FaTrophy
} from 'react-icons/fa';
import { Check } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export default function CampaignAnalyticsPage() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [campaign, setCampaign] = useState(null);
    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {
        fetchData();
    }, [params.id]);

    const fetchData = async () => {
        try {
            // Fetch campaign details
            const campaignRes = await fetch(`/api/campaigns/${params.id}`);
            if (!campaignRes.ok) throw new Error('Failed to fetch campaign');
            const campaignData = await campaignRes.json();

            if (campaignData.success) {
                setCampaign(campaignData.campaign);
            }

            // Fetch analytics data
            const analyticsRes = await fetch(`/api/campaigns/${params.id}/analytics`);
            if (analyticsRes.ok) {
                const analyticsData = await analyticsRes.json();
                if (analyticsData.success) {
                    setAnalytics(analyticsData.analytics);
                }
            }
        } catch (err) {
            setError('Failed to load analytics');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <FaSpinner className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading analytics...</p>
                </div>
            </div>
        );
    }

    if (error || !campaign) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error || 'Campaign not found'}</p>
                    <button
                        onClick={() => router.push('/dashboard/campaigns')}
                        className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all"
                    >
                        Back to Campaigns
                    </button>
                </div>
            </div>
        );
    }

    const progress = campaign.goalAmount > 0
        ? Math.min(((campaign.currentAmount || 0) / campaign.goalAmount) * 100, 100)
        : 0;

    // Chart data
    const viewsChartData = {
        labels: analytics?.viewsOverTime?.labels || ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
            {
                label: 'Views',
                data: analytics?.viewsOverTime?.data || [120, 190, 300, 450],
                borderColor: 'rgb(147, 51, 234)',
                backgroundColor: 'rgba(147, 51, 234, 0.1)',
                tension: 0.4,
            },
        ],
    };

    const contributionsChartData = {
        labels: analytics?.contributionsOverTime?.labels || ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
            {
                label: 'Contributions (₹)',
                data: analytics?.contributionsOverTime?.data || [5000, 12000, 18000, 25000],
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1,
            },
        ],
    };

    const trafficSourcesData = {
        labels: analytics?.trafficSources?.labels || ['Direct', 'Social Media', 'Search', 'Referral'],
        datasets: [
            {
                data: analytics?.trafficSources?.data || [35, 30, 20, 15],
                backgroundColor: [
                    'rgba(147, 51, 234, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                ],
                borderWidth: 0,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: '#9CA3AF',
                },
            },
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                ticks: {
                    color: '#9CA3AF',
                },
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                ticks: {
                    color: '#9CA3AF',
                },
            },
        },
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#9CA3AF',
                    padding: 15,
                },
            },
        },
    };

    return (
        <div className="min-h-screen bg-black py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/dashboard/campaigns')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-all mb-4"
                    >
                        <FaArrowLeft className="w-4 h-4" />
                        <span>Back to Campaigns</span>
                    </button>
                    <h1 className="text-3xl font-bold text-white mb-2">{campaign.title}</h1>
                    <p className="text-gray-400">Campaign Analytics & Performance</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Views */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                <FaEye className="w-6 h-6 text-purple-400" />
                            </div>
                            <span className="text-green-400 text-sm font-medium">+12%</span>
                        </div>
                        <h3 className="text-gray-400 text-sm mb-1">Total Views</h3>
                        <p className="text-3xl font-bold text-white">{campaign.stats?.views || 0}</p>
                    </div>

                    {/* Supporters */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                <FaUsers className="w-6 h-6 text-blue-400" />
                            </div>
                            <span className="text-green-400 text-sm font-medium">+8%</span>
                        </div>
                        <h3 className="text-gray-400 text-sm mb-1">Supporters</h3>
                        <p className="text-3xl font-bold text-white">{campaign.stats?.supporters || 0}</p>
                    </div>

                    {/* Total Raised */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                                <FaMoneyBillWave className="w-6 h-6 text-green-400" />
                            </div>
                            <span className="text-green-400 text-sm font-medium">{progress.toFixed(0)}%</span>
                        </div>
                        <h3 className="text-gray-400 text-sm mb-1">Total Raised</h3>
                        <p className="text-3xl font-bold text-white">₹{(campaign.currentAmount || 0).toLocaleString('en-IN')}</p>
                    </div>

                    {/* Engagement */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                                <FaChartLine className="w-6 h-6 text-yellow-400" />
                            </div>
                            <span className="text-green-400 text-sm font-medium">+15%</span>
                        </div>
                        <h3 className="text-gray-400 text-sm mb-1">Engagement Rate</h3>
                        <p className="text-3xl font-bold text-white">
                            {campaign.stats?.views > 0
                                ? ((campaign.stats?.supporters / campaign.stats?.views) * 100).toFixed(1)
                                : 0}%
                        </p>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Views Over Time */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-6">Views Over Time</h2>
                        <div className="h-64">
                            <Line data={viewsChartData} options={chartOptions} />
                        </div>
                    </div>

                    {/* Contributions Over Time */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-6">Contributions Over Time</h2>
                        <div className="h-64">
                            <Bar data={contributionsChartData} options={chartOptions} />
                        </div>
                    </div>
                </div>

                {/* Additional Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Traffic Sources */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-6">Traffic Sources</h2>
                        <div className="h-64">
                            <Doughnut data={trafficSourcesData} options={doughnutOptions} />
                        </div>
                    </div>

                    {/* Campaign Progress */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-6">Campaign Progress</h2>
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-400 text-sm">Goal Progress</span>
                                    <span className="text-white font-bold">{progress.toFixed(1)}%</span>
                                </div>
                                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/10">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-gray-400 text-sm">Raised</span>
                                    <span className="text-white font-bold">₹{(campaign.currentAmount || 0).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-gray-400 text-sm">Goal</span>
                                    <span className="text-white font-bold">₹{campaign.goalAmount.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400 text-sm">Remaining</span>
                                    <span className="text-white font-bold">₹{Math.max(0, campaign.goalAmount - (campaign.currentAmount || 0)).toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-6">Quick Stats</h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                    <FaComments className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{campaign.stats?.comments || 0}</p>
                                    <p className="text-sm text-gray-400">Comments</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                    <FaShare className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{campaign.stats?.shares || 0}</p>
                                    <p className="text-sm text-gray-400">Shares</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                    <FaCalendar className="w-5 h-5 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{campaign.daysRemaining || 0}</p>
                                    <p className="text-sm text-gray-400">Days Remaining</p>
                                </div>
                            </div>

                            {campaign.qualityScore && (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                                        <FaTrophy className="w-5 h-5 text-yellow-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-white">{campaign.qualityScore}/100</p>
                                        <p className="text-sm text-gray-400">Quality Score</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Milestones Progress */}
                {campaign.milestones && campaign.milestones.length > 0 && (
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-6">Milestones Progress</h2>
                        <div className="space-y-4">
                            {campaign.milestones.map((milestone, index) => {
                                const milestoneProgress = campaign.goalAmount > 0
                                    ? Math.min(((campaign.currentAmount || 0) / milestone.amount) * 100, 100)
                                    : 0;

                                return (
                                    <div key={index} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="text-white font-semibold">{milestone.title}</h3>
                                                <p className="text-sm text-gray-400 mt-1">{milestone.description}</p>
                                            </div>
                                            <span className="text-purple-400 font-bold">₹{milestone.amount.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${milestone.completed
                                                    ? 'bg-green-500'
                                                    : 'bg-gradient-to-r from-purple-500 to-blue-500'
                                                    }`}
                                                style={{ width: `${milestoneProgress}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-gray-400">{milestoneProgress.toFixed(1)}% Complete</span>
                                            {milestone.completed && (
                                                <span className="text-xs text-green-400 font-medium flex items-center gap-1"><Check className="w-3 h-3" /> Completed</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
