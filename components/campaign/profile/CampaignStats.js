'use client';

import { FaUsers, FaEye, FaHeart, FaChartLine, FaLock } from 'react-icons/fa';

/**
 * CampaignStats
 * Renders four stats cards for the campaign profile page.
 *
 * When isDraft=true the supporter count and view count are replaced with a
 * locked placeholder so the creator isn't misled by zeroed-out metrics that
 * will only start accumulating after the campaign goes live.
 */
export default function CampaignStats({ campaign, isDraft = false }) {
    // Supporters and views are meaningless (always 0) while a campaign is a draft.
    // Show a locked indicator instead so it's clear they are "not yet active".
    const LOCKED = { isLocked: true };

    const stats = [
        {
            icon: FaUsers,
            label: 'Supporters',
            value: isDraft ? LOCKED : (campaign.stats?.supporters ?? 0),
            bgColor: 'bg-purple-500/10',
            textColor: 'text-purple-400',
            borderColor: isDraft ? 'border-gray-700' : 'border-purple-500/20',
        },
        {
            icon: FaEye,
            label: 'Views',
            value: isDraft ? LOCKED : (campaign.stats?.views ?? 0).toLocaleString('en-IN'),
            bgColor: 'bg-blue-500/10',
            textColor: 'text-blue-400',
            borderColor: isDraft ? 'border-gray-700' : 'border-blue-500/20',
        },
        {
            icon: FaHeart,
            label: 'Total Raised',
            // Always show real value — goalAmount exists even on drafts
            value: `₹${((campaign.currentAmount || 0) / 1000).toFixed(1)}K`,
            bgColor: 'bg-green-500/10',
            textColor: 'text-green-400',
            borderColor: 'border-green-500/20',
        },
        {
            icon: FaChartLine,
            label: 'Goal Progress',
            value: `${Math.min(
                ((campaign.currentAmount || 0) / (campaign.goalAmount || 1)) * 100,
                100
            ).toFixed(0)}%`,
            bgColor: 'bg-orange-500/10',
            textColor: 'text-orange-400',
            borderColor: 'border-orange-500/20',
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                const isLocked = stat.value === LOCKED;

                return (
                    <div
                        key={index}
                        title={isLocked ? 'Available after publishing' : undefined}
                        className={`bg-white/5 backdrop-blur-xl border ${stat.borderColor} rounded-2xl p-6 transition-all duration-300 ${
                            isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:bg-white/10'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`${isLocked ? 'bg-gray-700/50' : stat.bgColor} p-3 rounded-xl`}>
                                {isLocked
                                    ? <FaLock className="w-5 h-5 text-gray-500" />
                                    : <Icon className={`w-5 h-5 ${stat.textColor}`} />
                                }
                            </div>
                        </div>
                        <div className={`text-2xl md:text-3xl font-bold mb-1 ${isLocked ? 'text-gray-600' : 'text-white'}`}>
                            {isLocked ? '—' : stat.value}
                        </div>
                        <div className="text-sm text-gray-400">
                            {stat.label}
                            {isLocked && (
                                <span className="ml-1.5 text-xs text-gray-600 italic">
                                    (after publish)
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
