'use client';

import { FaUsers, FaEye, FaHeart, FaChartLine } from 'react-icons/fa';

export default function CampaignStats({ campaign, creator }) {
    const stats = [
        {
            icon: FaUsers,
            label: 'Supporters',
            value: campaign.stats?.supporters || 0,
            color: 'purple',
            bgColor: 'bg-purple-500/10',
            textColor: 'text-purple-400',
            borderColor: 'border-purple-500/20'
        },
        {
            icon: FaEye,
            label: 'Views',
            value: (campaign.stats?.views || 0).toLocaleString('en-IN'),
            color: 'blue',
            bgColor: 'bg-blue-500/10',
            textColor: 'text-blue-400',
            borderColor: 'border-blue-500/20'
        },
        {
            icon: FaHeart,
            label: 'Total Raised',
            value: `₹${((campaign.currentAmount || 0) / 1000).toFixed(1)}K`,
            color: 'green',
            bgColor: 'bg-green-500/10',
            textColor: 'text-green-400',
            borderColor: 'border-green-500/20'
        },
        {
            icon: FaChartLine,
            label: 'Goal Progress',
            value: `${Math.min(((campaign.currentAmount || 0) / (campaign.goalAmount || 1)) * 100, 100).toFixed(0)}%`,
            color: 'orange',
            bgColor: 'bg-orange-500/10',
            textColor: 'text-orange-400',
            borderColor: 'border-orange-500/20'
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <div
                        key={index}
                        className={`bg-white/5 backdrop-blur-xl border ${stat.borderColor} rounded-2xl p-6 hover:bg-white/10 transition-all duration-300`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`${stat.bgColor} p-3 rounded-xl`}>
                                <Icon className={`w-5 h-5 ${stat.textColor}`} />
                            </div>
                        </div>
                        <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                            {stat.value}
                        </div>
                        <div className="text-sm text-gray-400">
                            {stat.label}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
