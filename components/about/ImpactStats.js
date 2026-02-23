// components/about/ImpactStats.js
"use client"
import { useInView } from 'react-intersection-observer';
import { useState, useEffect, useRef } from 'react';
import { IndianRupee, Users, TrendingUp, Target } from 'lucide-react';

export default function ImpactStats() {
    const [stats, setStats] = useState({
        totalRaised: 0,
        creatorsFunded: 0,
        successRate: 0,
        avgCampaign: 0
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/stats');
            if (response.ok) {
                const data = await response.json();
                setStats({
                    totalRaised: data.totalRaised * 100000, // Convert lakhs to rupees
                    creatorsFunded: data.creatorsFunded,
                    successRate: data.successRate,
                    avgCampaign: 45000 // Placeholder - calculate from API
                });
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const impactStats = [
        {
            icon: IndianRupee,
            label: 'Total Raised',
            value: stats.totalRaised,
            prefix: '₹',
            suffix: '',
            decimals: 0,
            color: 'from-green-500 to-emerald-500',
            description: 'Funds raised for creators'
        },
        {
            icon: Users,
            label: 'Creators Funded',
            value: stats.creatorsFunded,
            prefix: '',
            suffix: '+',
            decimals: 0,
            color: 'from-purple-500 to-pink-500',
            description: 'Dreams brought to life'
        },
        {
            icon: TrendingUp,
            label: 'Success Rate',
            value: stats.successRate,
            prefix: '',
            suffix: '%',
            decimals: 0,
            color: 'from-blue-500 to-cyan-500',
            description: 'Campaigns reach their goal'
        },
        {
            icon: Target,
            label: 'Avg Campaign',
            value: stats.avgCampaign,
            prefix: '₹',
            suffix: '',
            decimals: 0,
            color: 'from-orange-500 to-red-500',
            description: 'Average funding amount'
        }
    ];

    return (
        <div className="py-20 bg-gradient-to-b from-gray-950 to-gray-900">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-white mb-4">Our Impact</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Real numbers that showcase the power of our community
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {impactStats.map((stat, index) => (
                        <div
                            key={index}
                            className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-purple-500/50 transition-all duration-500 hover:scale-105"
                            style={{
                                transitionDelay: `${index * 100}ms`
                            }}
                        >
                            {/* Gradient overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`} />

                            {/* Icon */}
                            <div className="mb-4 transform group-hover:scale-110 transition-transform">
                                <stat.icon className="w-10 h-10 text-purple-400" />
                            </div>

                            {/* Value */}
                            <div className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                                {stat.prefix}
                                {stat.value.toLocaleString(undefined, {
                                    minimumFractionDigits: stat.decimals,
                                    maximumFractionDigits: stat.decimals
                                })}
                                {stat.suffix}
                            </div>

                            {/* Label */}
                            <div className="text-lg font-semibold text-white mb-2">
                                {stat.label}
                            </div>

                            {/* Description */}
                            <div className="text-sm text-gray-400">
                                {stat.description}
                            </div>

                            {/* Decorative element */}
                            <div className={`absolute -bottom-2 -right-2 w-24 h-24 bg-gradient-to-r ${stat.color} rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity`} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
