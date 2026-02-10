'use client';

import { useState } from 'react';
import { FaEye, FaMousePointer, FaPercentage, FaArrowDown } from 'react-icons/fa';

export default function AnalyticsOverview({ data = {} }) {
  const [period, setPeriod] = useState('30'); // 7, 30, 90, all

  const periods = {
    '7': 'Last 7 Days',
    '30': 'Last 30 Days',
    '90': 'Last 90 Days',
    'all': 'All Time'
  };

  const stats = (data && data[period]) || {};

  const cards = [
    {
      id: 'views',
      icon: FaEye,
      label: 'Total Views',
      value: stats.views || 0,
      change: stats.viewsChange || 0,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      id: 'clicks',
      icon: FaMousePointer,
      label: 'Total Clicks',
      value: stats.clicks || 0,
      change: stats.clicksChange || 0,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20'
    },
    {
      id: 'conversions',
      icon: FaPercentage,
      label: 'Conversion Rate',
      value: `${(stats.conversionRate || 0).toFixed(1)}%`,
      change: stats.conversionChange || 0,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20'
    },
    {
      id: 'bounce',
      icon: FaArrowDown,
      label: 'Bounce Rate',
      value: `${(stats.bounceRate || 0).toFixed(1)}%`,
      change: stats.bounceChange || 0,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/20',
      inverse: true
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-white">Analytics Overview</h2>
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          {Object.keys(periods).map((key) => (
            <button
              key={key}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === key
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              onClick={() => setPeriod(key)}
            >
              {periods[key]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          const isPositive = card.inverse ? card.change < 0 : card.change > 0;

          return (
            <div key={card.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${card.bgColor} ${card.color} border ${card.borderColor}`}
                >
                  <Icon />
                </div>
                {card.change !== 0 && (
                  <div className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-lg ${isPositive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                    {isPositive ? '↑' : '↓'} {Math.abs(card.change)}%
                  </div>
                )}
              </div>

              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">{card.label}</p>
                <h3 className="text-2xl font-bold text-white tracking-tight">{card.value}</h3>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
