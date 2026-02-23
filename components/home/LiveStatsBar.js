// components/home/LiveStatsBar.js
"use client"
import { useState, useEffect } from 'react';
import { Wallet, Rocket, Users, TrendingUp } from 'lucide-react';

export default function LiveStatsBar() {
    const [stats, setStats] = useState({
        totalRaised: 0,
        activeCampaigns: 0,
        creatorsFunded: 0,
        successRate: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/stats');
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            icon: <Wallet className="w-10 h-10 sm:w-12 sm:h-12 text-green-400" />,
            label: 'Total Raised',
            value: stats.totalRaised,
            prefix: '₹',
            suffix: 'L+',
            decimals: 1,
            color: 'from-green-500 to-emerald-500'
        },
        {
            icon: <Rocket className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400" />,
            label: 'Active Campaigns',
            value: stats.activeCampaigns,
            prefix: '',
            suffix: '+',
            decimals: 0,
            color: 'from-blue-500 to-cyan-500'
        },
        {
            icon: <Users className="w-10 h-10 sm:w-12 sm:h-12 text-purple-400" />,
            label: 'Creators Funded',
            value: stats.creatorsFunded,
            prefix: '',
            suffix: '+',
            decimals: 0,
            color: 'from-purple-500 to-pink-500'
        },
        {
            icon: <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 text-orange-400" />,
            label: 'Success Rate',
            value: stats.successRate,
            prefix: '',
            suffix: '%',
            decimals: 0,
            color: 'from-orange-500 to-red-500'
        }
    ];

    return (
        <div className="w-full relative z-30 px-4 mt-6 md:mt-10 mb-12">
            <div className="max-w-7xl mx-auto">
                {/* The Floating Card - Matching CampaignCard Design */}
                <div className="backdrop-blur-md bg-gray-800/30 border border-gray-700 rounded-2xl shadow-xl overflow-hidden hover:border-purple-500/30 transition-colors duration-500">

                    <div className="flex flex-wrap items-center justify-around py-8 px-4 gap-y-8">
                        {statCards.map((stat, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-5 sm:gap-6 group px-4 md:px-8 border-r last:border-0 border-gray-700/50 relative"
                            >
                                {/* Icon */}
                                <div className="transform group-hover:scale-110 transition-transform duration-300 drop-shadow-lg grayscale group-hover:grayscale-0">
                                    {stat.icon}
                                </div>

                                <div className="flex flex-col">
                                    {/* Value */}
                                    <div className={`text-3xl sm:text-4xl font-extrabold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent group-hover:brightness-125 transition-all`}>
                                        {loading ? (
                                            <div className="h-10 w-28 bg-gray-700/50 rounded-md animate-pulse" />
                                        ) : (
                                            <>
                                                {stat.prefix}
                                                {stat.decimals > 0
                                                    ? stat.value.toFixed(stat.decimals)
                                                    : stat.value.toLocaleString()
                                                }
                                                {stat.suffix}
                                            </>
                                        )}
                                    </div>
                                    {/* Label */}
                                    <div className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-widest mt-1 group-hover:text-gray-200 transition-colors">
                                        {stat.label}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
