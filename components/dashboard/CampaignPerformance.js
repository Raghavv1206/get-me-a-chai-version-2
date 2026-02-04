'use client';

import Link from 'next/link';
import { FaEye, FaEdit, FaChartBar, FaPlus } from 'react-icons/fa';

export default function CampaignPerformance({ campaigns }) {
  const getProgressColor = (progress) => {
    if (progress >= 100) return 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]';
    if (progress >= 75) return 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]';
    if (progress >= 50) return 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]';
    return 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]';
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden flex flex-col">
      <div className="p-6 flex items-center justify-between border-b border-white/10">
        <h3 className="text-xl font-bold text-white">Campaign Performance</h3>
        <Link
          href="/dashboard/campaigns"
          className="text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors"
        >
          View All →
        </Link>
      </div>

      <div className="p-4 space-y-4">
        {campaigns.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 border border-white/10">
              📊
            </div>
            <p className="text-gray-400 mb-6">No campaigns yet</p>
            <Link
              href="/dashboard/create-campaign"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105 transition-all"
            >
              <FaPlus className="w-4 h-4" />
              Create Your First Campaign
            </Link>
          </div>
        ) : (
          campaigns.map((campaign) => {
            const progress = ((campaign.currentAmount || 0) / campaign.goalAmount) * 100;
            const progressColorClass = getProgressColor(progress);

            return (
              <div key={campaign._id} className="group p-4 bg-black/20 hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-xl transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-white truncate pr-4">{campaign.title}</h4>
                    <div className="flex items-center text-xs space-x-1 mt-1">
                      <span className="text-green-400 font-bold">₹{(campaign.currentAmount || 0).toLocaleString('en-IN')}</span>
                      <span className="text-gray-500">raised of</span>
                      <span className="text-gray-400">₹{campaign.goalAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/${campaign.creator?.username}`}
                      className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                      title="View Campaign"
                    >
                      <FaEye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/dashboard/campaigns/${campaign._id}/edit`}
                      className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all"
                      title="Edit Campaign"
                    >
                      <FaEdit className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${progressColorClass}`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold w-10 text-right ${progress >= 100 ? 'text-green-400' :
                      progress >= 50 ? 'text-blue-400' : 'text-purple-400'
                    }`}>
                    {progress.toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
