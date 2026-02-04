// components/contributions/ContributionsSummary.js
"use client"

/**
 * Contributions Summary Component
 * 
 * Features:
 * - Total amount contributed
 * - Number of campaigns supported
 * - Badges earned
 * - Impact score (gamification)
 * - Animated counters
 * - Responsive design
 * 
 * @component
 */

import { useEffect, useState } from 'react';
import { TrendingUp, Heart, Award, Zap } from 'lucide-react';

export default function ContributionsSummary({ summary, badges, impactScore, loading = false }) {
    const [animatedValues, setAnimatedValues] = useState({
        totalAmount: 0,
        campaignsSupported: 0,
        totalContributions: 0,
        impactScore: 0,
    });

    // Animate numbers on mount
    useEffect(() => {
        if (!summary || loading) return;

        const duration = 1500; // 1.5 seconds
        const steps = 60;
        const interval = duration / steps;

        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;

            setAnimatedValues({
                totalAmount: Math.floor(summary.totalAmount * progress),
                campaignsSupported: Math.floor(summary.campaignsSupported * progress),
                totalContributions: Math.floor(summary.totalContributions * progress),
                impactScore: Math.floor(impactScore * progress),
            });

            if (currentStep >= steps) {
                clearInterval(timer);
                setAnimatedValues({
                    totalAmount: summary.totalAmount,
                    campaignsSupported: summary.campaignsSupported,
                    totalContributions: summary.totalContributions,
                    impactScore,
                });
            }
        }, interval);

        return () => clearInterval(timer);
    }, [summary, impactScore, loading]);

    if (loading) {
        return <SummarySkeleton />;
    }

    if (!summary) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400 text-center">
                    No contribution data available
                </p>
            </div>
        );
    }

    const stats = [
        {
            label: 'Total Contributed',
            value: `₹${animatedValues.totalAmount.toLocaleString()}`,
            icon: TrendingUp,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            textColor: 'text-green-600 dark:text-green-400',
        },
        {
            label: 'Campaigns Supported',
            value: animatedValues.campaignsSupported,
            icon: Heart,
            color: 'from-pink-500 to-rose-600',
            bgColor: 'bg-pink-50 dark:bg-pink-900/20',
            textColor: 'text-pink-600 dark:text-pink-400',
        },
        {
            label: 'Badges Earned',
            value: badges?.length || 0,
            icon: Award,
            color: 'from-yellow-500 to-orange-600',
            bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
            textColor: 'text-yellow-600 dark:text-yellow-400',
        },
        {
            label: 'Impact Score',
            value: animatedValues.impactScore.toLocaleString(),
            icon: Zap,
            color: 'from-purple-500 to-indigo-600',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
            textColor: 'text-purple-600 dark:text-purple-400',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, index) => {
                const Icon = stat.icon;

                return (
                    <div
                        key={stat.label}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 group"
                        style={{
                            animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                        }}
                    >
                        {/* Icon */}
                        <div className={`${stat.bgColor} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <Icon className={`w-6 h-6 ${stat.textColor}`} />
                        </div>

                        {/* Value */}
                        <div className="mb-2">
                            <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                                {stat.value}
                            </div>
                        </div>

                        {/* Label */}
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                            {stat.label}
                        </div>

                        {/* Progress bar (visual indicator) */}
                        <div className="mt-4 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-1000 ease-out`}
                                style={{
                                    width: `${Math.min(100, (animatedValues[Object.keys(animatedValues)[index]] / (summary[Object.keys(summary)[index]] || 1)) * 100)}%`,
                                }}
                            />
                        </div>
                    </div>
                );
            })}

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
 * Loading skeleton
 */
function SummarySkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
                <div
                    key={i}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse"
                >
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4" />
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-24" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                    <div className="mt-4 h-1 bg-gray-200 dark:bg-gray-700 rounded-full" />
                </div>
            ))}
        </div>
    );
}
