'use client';

import { useState, useEffect } from 'react';
import { FaLightbulb, FaChartLine, FaClock, FaUsers, FaSync } from 'react-icons/fa';

export default function AIInsightsPanel({ campaignId }) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchInsights();
  }, [campaignId]);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ai/insights?campaignId=${campaignId || 'all'}`);
      const data = await response.json();

      if (data.success) {
        setInsights(data.insights);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'timing':
        return FaClock;
      case 'traffic':
        return FaChartLine;
      case 'engagement':
        return FaUsers;
      default:
        return FaLightbulb;
    }
  };

  const getInsightStyles = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20 text-rose-400';
      case 'medium':
        return 'bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20 text-amber-400';
      default:
        return 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20 text-blue-400';
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/10 to-blue-900/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 lg:p-8 relative overflow-hidden group">
      {/* Decorative gradient blob */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none -z-10 group-hover:bg-purple-500/20 transition-all duration-700" />

      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-900/30">
            <FaLightbulb className="text-white text-xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              AI Insights
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white">BETA</span>
            </h3>
            <p className="text-sm text-gray-400 flex items-center gap-1">
              {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Powered by AI'}
            </p>
          </div>
        </div>

        <button
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
          onClick={fetchInsights}
          disabled={loading}
          title="Refresh Insights"
        >
          <FaSync className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center bg-black/20 rounded-xl border border-white/5 animate-pulse">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400 font-medium">Analyzing campaign data...</p>
        </div>
      ) : insights.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center bg-black/20 rounded-xl border border-white/5 text-center px-4">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-gray-500">
            <FaLightbulb className="text-2xl" />
          </div>
          <p className="text-gray-300 font-medium text-lg mb-1">No insights available yet</p>
          <p className="text-gray-500 text-sm">Our AI needs more data to generate recommendations. Check back later!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {insights.map((insight, index) => {
            const Icon = getInsightIcon(insight.type);
            const styleClass = getInsightStyles(insight.priority);

            return (
              <div
                key={index}
                className={`flex gap-4 p-5 rounded-xl border transition-all duration-300 ${styleClass}`}
              >
                <div className="shrink-0">
                  <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center text-current border border-white/5">
                    <Icon className="text-lg" />
                  </div>
                </div>

                <div className="flex-1">
                  <h4 className="font-bold text-white mb-1.5 flex items-center gap-2">
                    {insight.title}
                    {insight.priority === 'high' && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-500 text-white">High Priority</span>
                    )}
                  </h4>
                  <p className="text-gray-300 text-sm leading-relaxed mb-3">
                    {insight.message}
                  </p>

                  {insight.action && (
                    <button className="text-xs font-bold uppercase tracking-wider px-4 py-2 bg-black/20 hover:bg-black/40 border border-white/10 rounded-lg transition-colors flex items-center gap-2">
                      <span>Take Action</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
