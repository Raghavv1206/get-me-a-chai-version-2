// components/dashboard/StatsCards.js
'use client';

import { useState, useEffect } from 'react';
import { FaRupeeSign, FaFolder, FaUsers, FaChartLine, FaArrowUp, FaArrowDown } from 'react-icons/fa';

export default function StatsCards({ stats }) {
  const [period, setPeriod] = useState('all-time'); // today, week, month, all-time
  const [animatedStats, setAnimatedStats] = useState({});

  useEffect(() => {
    // Animate numbers on mount
    const timer = setTimeout(() => {
      setAnimatedStats(stats[period] || {});
    }, 100);
    return () => clearTimeout(timer);
  }, [period, stats]);

  const cards = [
    {
      id: 'earnings',
      icon: FaRupeeSign,
      label: 'Total Earnings',
      value: animatedStats.earnings || 0,
      change: animatedStats.earningsChange || 0,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10 border-green-500/20'
    },
    {
      id: 'campaigns',
      icon: FaFolder,
      label: 'Active Campaigns',
      value: animatedStats.campaigns || 0,
      change: animatedStats.campaignsChange || 0,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      id: 'supporters',
      icon: FaUsers,
      label: 'Total Supporters',
      value: animatedStats.supporters || 0,
      change: animatedStats.supportersChange || 0,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/20'
    },
    {
      id: 'avgDonation',
      icon: FaChartLine,
      label: 'Avg Donation',
      value: animatedStats.avgDonation || 0,
      change: animatedStats.avgDonationChange || 0,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/20'
    }
  ];

  const formatValue = (id, value) => {
    if (id === 'earnings' || id === 'avgDonation') {
      return `₹${value.toLocaleString('en-IN')}`;
    }
    return value.toLocaleString('en-IN');
  };

  const periods = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
    { id: 'all-time', label: 'All Time' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-white">Overview</h2>
        <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl">
          {periods.map((p) => (
            <button
              key={p.id}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${period === p.id
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              onClick={() => setPeriod(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          const isPositive = card.change >= 0;

          return (
            <div key={card.id} className="group relative p-6 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden transition-all hover:border-white/20 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1">

              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${card.bgColor} ${card.color} border`}>
                  <Icon className="w-6 h-6" />
                </div>
                {card.change !== 0 && (
                  <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${isPositive ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {isPositive ? <FaArrowUp className="w-3 h-3" /> : <FaArrowDown className="w-3 h-3" />}
                    <span>{Math.abs(card.change)}%</span>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">{card.label}</h3>
                <div className="text-2xl font-bold text-white tracking-tight animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {formatValue(card.id, card.value)}
                </div>
                {card.change !== 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    vs last {period === 'today' ? 'day' : period}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
