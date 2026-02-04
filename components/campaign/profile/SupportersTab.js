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
        setSupport(prev => page === 1 ? data.supporters : [...prev, ...data.supporters]);
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
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading supporters...</p>
      </div>
    );
  }

  return (
    <div className="supporters-tab">
      {/* Total Count */}
      <div className="supporters-header">
        <h3 className="supporters-count">
          <FaHeart className="count-icon" />
          {totalCount} {totalCount === 1 ? 'Supporter' : 'Supporters'}
        </h3>
      </div>

      {/* Top Supporters Leaderboard */}
      {topSupporters.length > 0 && (
        <div className="top-supporters-section">
          <h3 className="section-title">
            <FaTrophy className="title-icon" />
            Top Supporters
          </h3>

          <div className="leaderboard">
            {topSupporters.map((supporter, index) => (
              <div key={supporter._id} className={`leaderboard-item rank-${index + 1}`}>
                <div className="rank-badge">
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && `#${index + 1}`}
                </div>

                <div className="supporter-avatar">
                  <Image
                    src={supporter.anonymous ? '/images/anonymous-avatar.png' : (supporter.profilePic || '/images/default-profilepic.jpg')}
                    alt={supporter.name}
                    fill
                    className="avatar-image"
                    sizes="60px"
                  />
                </div>

                <div className="supporter-info">
                  <div className="supporter-name">
                    {supporter.anonymous ? 'Anonymous Supporter' : supporter.name}
                  </div>
                  {supporter.message && !supporter.anonymous && (
                    <div className="supporter-message">{supporter.message}</div>
                  )}
                </div>

                <div className="supporter-amount">
                  {formatAmount(supporter.totalAmount, supporter.hideAmount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Supporters */}
      <div className="recent-supporters-section">
        <h3 className="section-title">Recent Supporters</h3>

        {supporters.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💝</div>
            <p>No supporters yet. Be the first to support this campaign!</p>
          </div>
        ) : (
          <div className="supporters-list">
            {supporters.map((supporter) => (
              <div key={supporter._id} className="supporter-card">
                <div className="supporter-avatar-small">
                  <Image
                    src={supporter.anonymous ? '/images/anonymous-avatar.png' : (supporter.profilePic || '/images/default-profilepic.jpg')}
                    alt={supporter.name}
                    fill
                    className="avatar-image"
                    sizes="50px"
                  />
                </div>

                <div className="supporter-details">
                  <div className="supporter-header">
                    <span className="supporter-name">
                      {supporter.anonymous ? 'Anonymous Supporter' : supporter.name}
                    </span>
                    <span className="support-amount">
                      {formatAmount(supporter.amount, supporter.hideAmount)}
                    </span>
                  </div>

                  {supporter.message && (
                    <div className="support-message">
                      "{supporter.message}"
                    </div>
                  )}

                  <div className="support-time">
                    <FaClock className="time-icon" />
                    {formatTimeAgo(supporter.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {hasMore && (
          <button
            className="load-more-btn"
            onClick={() => setPage(prev => prev + 1)}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        )}
      </div>

      <style jsx>{`
        .supporters-tab {
          max-width: 800px;
          margin: 0 auto;
        }

        .loading-container {
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

        .supporters-header {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          margin-bottom: 30px;
        }

        .supporters-count {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .count-icon {
          color: #ef4444;
          font-size: 1.4rem;
        }

        .top-supporters-section,
        .recent-supporters-section {
          background: white;
          border-radius: 16px;
          padding: 30px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          margin-bottom: 30px;
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 24px 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .title-icon {
          color: #f59e0b;
        }

        .leaderboard {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .leaderboard-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .leaderboard-item.rank-1 {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 2px solid #fbbf24;
        }

        .leaderboard-item.rank-2 {
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          border: 2px solid #d1d5db;
        }

        .leaderboard-item.rank-3 {
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
          border: 2px solid #fca5a5;
        }

        .leaderboard-item:not(.rank-1):not(.rank-2):not(.rank-3) {
          background: white;
          border: 2px solid #e5e7eb;
        }

        .leaderboard-item:hover {
          transform: translateX(8px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .rank-badge {
          font-size: 1.5rem;
          font-weight: 700;
          min-width: 40px;
          text-align: center;
        }

        .supporter-avatar,
        .supporter-avatar-small {
          position: relative;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          background: #f3f4f6;
        }

        .supporter-avatar {
          width: 60px;
          height: 60px;
        }

        .supporter-avatar-small {
          width: 50px;
          height: 50px;
        }

        .avatar-image {
          object-fit: cover;
        }

        .supporter-info {
          flex: 1;
        }

        .supporter-name {
          font-size: 1.05rem;
          font-weight: 600;
          color: #111827;
        }

        .supporter-message {
          font-size: 0.9rem;
          color: #6b7280;
          margin-top: 4px;
          font-style: italic;
        }

        .supporter-amount {
          font-size: 1.25rem;
          font-weight: 700;
          color: #10b981;
        }

        .supporters-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .supporter-card {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .supporter-card:hover {
          border-color: #d1d5db;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .supporter-details {
          flex: 1;
        }

        .supporter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .support-amount {
          font-weight: 700;
          color: #10b981;
        }

        .support-message {
          color: #4b5563;
          font-size: 0.95rem;
          line-height: 1.5;
          margin-bottom: 8px;
          font-style: italic;
        }

        .support-time {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #9ca3af;
          font-size: 0.85rem;
        }

        .time-icon {
          font-size: 0.8rem;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 16px;
        }

        .empty-state p {
          color: #6b7280;
          font-size: 1rem;
        }

        .load-more-btn {
          width: 100%;
          padding: 14px;
          margin-top: 20px;
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
          .top-supporters-section,
          .recent-supporters-section {
            padding: 20px;
          }

          .leaderboard-item {
            padding: 16px;
          }

          .supporter-card {
            padding: 16px;
          }

          .supporter-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
        }
      `}</style>
    </div>
  );
}
