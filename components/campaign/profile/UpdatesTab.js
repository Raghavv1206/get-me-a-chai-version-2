'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaHeart, FaRegHeart, FaComment, FaLock, FaClock } from 'react-icons/fa';

export default function UpdatesTab({ campaignId, isSupporter = false }) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [likedUpdates, setLikedUpdates] = useState(new Set());

  useEffect(() => {
    fetchUpdates();
  }, [campaignId, page]);

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/campaigns/${campaignId}/updates?page=${page}&limit=10`);
      const data = await response.json();

      if (data.success) {
        setUpdates(prev => page === 1 ? data.updates : [...prev, ...data.updates]);
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error('Error fetching updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (updateId) => {
    try {
      const response = await fetch(`/api/campaigns/updates/${updateId}/like`, {
        method: 'POST'
      });

      if (response.ok) {
        setLikedUpdates(prev => {
          const newSet = new Set(prev);
          if (newSet.has(updateId)) {
            newSet.delete(updateId);
          } else {
            newSet.add(updateId);
          }
          return newSet;
        });

        setUpdates(prev => prev.map(update => {
          if (update._id === updateId) {
            return {
              ...update,
              stats: {
                ...update.stats,
                likes: likedUpdates.has(updateId)
                  ? update.stats.likes - 1
                  : update.stats.likes + 1
              }
            };
          }
          return update;
        }));
      }
    } catch (error) {
      console.error('Error liking update:', error);
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const updateDate = new Date(date);
    const diffTime = Math.abs(now - updateDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return updateDate.toLocaleDateString('en-IN');
  };

  if (loading && page === 1) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-gray-700 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Loading updates...</p>
      </div>
    );
  }

  if (updates.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📢</div>
        <h3 className="text-xl font-bold text-white mb-2">No Updates Yet</h3>
        <p className="text-gray-400">The creator hasn't posted any updates for this campaign yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {updates.map((update) => {
        const isLocked = update.visibility === 'supporters-only' && !isSupporter;

        return (
          <div
            key={update._id}
            className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all duration-300 ${isLocked ? 'opacity-75' : 'hover:bg-white/10'
              }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <FaClock className="w-4 h-4" />
                <span>{formatDate(update.publishDate)}</span>
                {update.visibility === 'supporters-only' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-yellow-300 text-xs font-semibold">
                    <FaLock className="w-3 h-3" />
                    Supporters Only
                  </span>
                )}
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-white mb-4">{update.title}</h3>

            {/* Content */}
            {isLocked ? (
              <div className="text-center py-12">
                <FaLock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">This update is only visible to supporters</p>
                <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all">
                  Support to Unlock
                </button>
              </div>
            ) : (
              <>
                <div className="text-gray-300 leading-relaxed mb-4 whitespace-pre-wrap">
                  {update.content}
                </div>

                {/* Images */}
                {update.images && update.images.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {update.images.map((image, imgIndex) => (
                      <div key={imgIndex} className="relative aspect-video rounded-xl overflow-hidden">
                        <Image
                          src={image}
                          alt={`Update image ${imgIndex + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                  <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${likedUpdates.has(update._id)
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'
                      }`}
                    onClick={() => handleLike(update._id)}
                  >
                    {likedUpdates.has(update._id) ? <FaHeart /> : <FaRegHeart />}
                    <span>{update.stats?.likes || 0}</span>
                  </button>

                  <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 font-medium hover:bg-white/10 hover:text-white transition-all">
                    <FaComment />
                    <span>{update.stats?.comments || 0}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}

      {/* Load More */}
      {hasMore && (
        <button
          className="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-purple-400 font-semibold hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setPage(prev => prev + 1)}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Load More Updates'}
        </button>
      )}
    </div>
  );
}
