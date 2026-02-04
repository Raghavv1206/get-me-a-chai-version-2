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
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading updates...</p>
            </div>
        );
    }

    if (updates.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-icon">📢</div>
                <h3>No Updates Yet</h3>
                <p>The creator hasn't posted any updates for this campaign yet.</p>
            </div>
        );
    }

    return (
        <div className="updates-tab">
            <div className="updates-timeline">
                {updates.map((update, index) => {
                    const isLocked = update.visibility === 'supporters-only' && !isSupporter;

                    return (
                        <div key={update._id} className={`update-card ${isLocked ? 'locked' : ''}`}>
                            <div className="update-header">
                                <div className="update-meta">
                                    <FaClock className="meta-icon" />
                                    <span className="update-date">{formatDate(update.publishDate)}</span>
                                    {update.visibility === 'supporters-only' && (
                                        <span className="supporters-badge">
                                            <FaLock /> Supporters Only
                                        </span>
                                    )}
                                </div>
                            </div>

                            <h3 className="update-title">{update.title}</h3>

                            {isLocked ? (
                                <div className="locked-content">
                                    <FaLock className="lock-icon" />
                                    <p>This update is only visible to supporters</p>
                                    <button className="unlock-button">
                                        Support to Unlock
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="update-content">
                                        {update.content}
                                    </div>

                                    {update.images && update.images.length > 0 && (
                                        <div className="update-images">
                                            {update.images.map((image, imgIndex) => (
                                                <div key={imgIndex} className="update-image-wrapper">
                                                    <Image
                                                        src={image}
                                                        alt={`Update image ${imgIndex + 1}`}
                                                        fill
                                                        className="update-image"
                                                        sizes="(max-width: 768px) 100vw, 600px"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="update-actions">
                                        <button
                                            className={`action-button ${likedUpdates.has(update._id) ? 'liked' : ''}`}
                                            onClick={() => handleLike(update._id)}
                                        >
                                            {likedUpdates.has(update._id) ? <FaHeart /> : <FaRegHeart />}
                                            <span>{update.stats?.likes || 0}</span>
                                        </button>

                                        <button className="action-button">
                                            <FaComment />
                                            <span>{update.stats?.comments || 0}</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            {hasMore && (
                <button
                    className="load-more-btn"
                    onClick={() => setPage(prev => prev + 1)}
                    disabled={loading}
                >
                    {loading ? 'Loading...' : 'Load More Updates'}
                </button>
            )}

            <style jsx>{`
        .updates-tab {
          max-width: 800px;
          margin: 0 auto;
        }

        .loading-container,
        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f3f4f6;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 20px;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 10px 0;
        }

        .empty-state p {
          color: #6b7280;
          font-size: 1rem;
        }

        .updates-timeline {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .update-card {
          background: white;
          border-radius: 16px;
          padding: 30px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }

        .update-card:hover {
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }

        .update-card.locked {
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
        }

        .update-header {
          margin-bottom: 16px;
        }

        .update-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .meta-icon {
          color: #9ca3af;
          font-size: 0.9rem;
        }

        .update-date {
          color: #6b7280;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .supporters-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          color: #92400e;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .update-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 16px 0;
        }

        .update-content {
          color: #4b5563;
          line-height: 1.7;
          font-size: 1.05rem;
          white-space: pre-wrap;
          margin-bottom: 20px;
        }

        .locked-content {
          text-align: center;
          padding: 40px 20px;
        }

        .lock-icon {
          font-size: 3rem;
          color: #d1d5db;
          margin-bottom: 16px;
        }

        .locked-content p {
          color: #6b7280;
          margin-bottom: 20px;
        }

        .unlock-button {
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .unlock-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .update-images {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        }

        .update-image-wrapper {
          position: relative;
          aspect-ratio: 16/9;
          border-radius: 12px;
          overflow: hidden;
        }

        .update-image {
          object-fit: cover;
        }

        .update-actions {
          display: flex;
          gap: 16px;
          padding-top: 20px;
          border-top: 2px solid #f3f4f6;
        }

        .action-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          color: #6b7280;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-button:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        .action-button.liked {
          color: #ef4444;
          border-color: #fecaca;
          background: #fef2f2;
        }

        .load-more-btn {
          width: 100%;
          padding: 14px;
          margin-top: 24px;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          color: #667eea;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .load-more-btn:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #667eea;
        }

        .load-more-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .update-card {
            padding: 20px;
          }

          .update-title {
            font-size: 1.25rem;
          }

          .update-content {
            font-size: 1rem;
          }

          .update-images {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
}
