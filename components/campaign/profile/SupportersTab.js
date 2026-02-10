'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaTrophy, FaHeart, FaClock } from 'react-icons/fa';

export default function SupportersTab({ campaignId }) {
  const [supporters, setSupporters] = useState([]);
  const [topSupporters, setTopSupporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchSupporters();
  }, [campaignId, page]);

  const fetchSupporters = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/campaigns/${campaignId}/supporters?page=${page}&limit=20`);
      const data = await response.json();

      if (data.success) {
        if (page === 1) {
          setTopSupporters(data.topSupporters || []);
        }
        setSupporters(prev => page === 1 ? data.supporters : [...prev, ...data.supporters]);
        setHasMore(data.hasMore);
        setTotalCount(data.total);
      }
    } catch (error) {
      console.error('Error fetching supporters:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount, hideAmount) => {
    if (hideAmount) return 'Hidden';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const supportDate = new Date(date);
    const diffTime = Math.abs(now - supportDate);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return supportDate.toLocaleDateString('en-IN');
  };

  if (loading && page === 1) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-gray-700 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Loading supporters...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Total Count */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <FaHeart className="text-red-400" />
          {totalCount} {totalCount === 1 ? 'Supporter' : 'Supporters'}
        </h3>
      </div>

      {/* Top Supporters Leaderboard */}
      {topSupporters.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaTrophy className="text-yellow-400" />
            Top Supporters
          </h3>

          <div className="space-y-4">
            {topSupporters.map((supporter, index) => (
              <div
                key={supporter._id}
                className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] ${index === 0
                    ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
                    : index === 1
                      ? 'bg-gradient-to-r from-gray-500/20 to-gray-400/20 border-gray-400/30'
                      : index === 2
                        ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30'
                        : 'bg-white/5 border-white/10'
                  }`}
              >
                {/* Rank Badge */}
                <div className="text-3xl min-w-[50px] text-center">
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && <span className="text-gray-400 font-bold">#{index + 1}</span>}
                </div>

                {/* Avatar */}
                <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-gray-700 border-2 border-white/20">
                  <Image
                    src={supporter.anonymous ? '/images/anonymous-avatar.png' : (supporter.profilePic || '/images/default-profilepic.jpg')}
                    alt={supporter.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="font-semibold text-white">
                    {supporter.anonymous ? 'Anonymous Supporter' : supporter.name}
                  </div>
                  {supporter.message && !supporter.anonymous && (
                    <div className="text-sm text-gray-400 italic mt-1">
                      "{supporter.message}"
                    </div>
                  )}
                </div>

                {/* Amount */}
                <div className="text-xl font-bold text-green-400">
                  {formatAmount(supporter.totalAmount, supporter.hideAmount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Supporters */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Recent Supporters</h3>

        {supporters.length === 0 ? (
          <div className="text-center py-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
            <div className="text-6xl mb-4">💝</div>
            <p className="text-gray-400">No supporters yet. Be the first to support this campaign!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {supporters.map((supporter) => (
              <div
                key={supporter._id}
                className="flex gap-4 p-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all"
              >
                {/* Avatar */}
                <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-700">
                  <Image
                    src={supporter.anonymous ? '/images/anonymous-avatar.png' : (supporter.profilePic || '/images/default-profilepic.jpg')}
                    alt={supporter.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white">
                      {supporter.anonymous ? 'Anonymous Supporter' : supporter.name}
                    </span>
                    <span className="font-bold text-green-400">
                      {formatAmount(supporter.amount, supporter.hideAmount)}
                    </span>
                  </div>

                  {supporter.message && (
                    <div className="text-gray-300 text-sm mb-2 italic">
                      "{supporter.message}"
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <FaClock className="w-3 h-3" />
                    {formatTimeAgo(supporter.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <button
            className="w-full mt-4 py-4 bg-white/5 border border-white/10 rounded-xl text-purple-400 font-semibold hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setPage(prev => prev + 1)}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        )}
      </div>
    </div>
  );
}
