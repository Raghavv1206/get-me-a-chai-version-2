'use client';

import { useState } from 'react';
import { FaHeart, FaRegHeart, FaShare, FaEnvelope } from 'react-icons/fa';
import ShareModal from './ShareModal';

export default function ActionButtons({
  campaignId,
  campaignTitle,
  creatorUsername,
  isFollowing: initialFollowing = false,
  onSupportClick
}) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const handleFollowToggle = async () => {
    setIsFollowLoading(true);
    try {
      const response = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: creatorUsername,
          action: isFollowing ? 'unfollow' : 'follow'
        })
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  return (
    <>
      <div className="action-buttons">
        <div className="action-buttons-container">
          <button
            className="btn-primary btn-support"
            onClick={onSupportClick}
          >
            <FaHeart className="btn-icon" />
            Support Now
          </button>

          <button
            className={`btn-secondary btn-follow ${isFollowing ? 'following' : ''}`}
            onClick={handleFollowToggle}
            disabled={isFollowLoading}
          >
            {isFollowing ? <FaHeart className="btn-icon" /> : <FaRegHeart className="btn-icon" />}
            {isFollowing ? 'Following' : 'Follow'}
          </button>

          <button
            className="btn-secondary btn-share"
            onClick={() => setShowShareModal(true)}
          >
            <FaShare className="btn-icon" />
            Share
          </button>

          <button className="btn-secondary btn-message">
            <FaEnvelope className="btn-icon" />
            Message
          </button>
        </div>
      </div>

      {showShareModal && (
        <ShareModal
          campaignId={campaignId}
          campaignTitle={campaignTitle}
          creatorUsername={creatorUsername}
          onClose={() => setShowShareModal(false)}
        />
      )}

      <style jsx>{`
        .action-buttons {
          padding: 0 20px 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .action-buttons-container {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-icon {
          font-size: 1.1rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
        }

        .btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-secondary {
          background: #1e293b;
          color: #e2e8f0;
          border: 2px solid #334155;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .btn-secondary:hover:not(:disabled) {
          background: #334155;
          border-color: #475569;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .btn-follow.following {
          background: #fef2f2;
          border-color: #fca5a5;
          color: #dc2626;
        }

        .btn-follow.following:hover:not(:disabled) {
          background: #fee2e2;
          border-color: #f87171;
        }

        .btn-support {
          flex: 1;
          min-width: 200px;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .action-buttons {
            padding: 0 15px 15px;
          }

          .action-buttons-container {
            gap: 10px;
          }

          button {
            padding: 10px 20px;
            font-size: 0.95rem;
          }

          .btn-support {
            width: 100%;
            min-width: unset;
          }

          .btn-message {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .action-buttons-container {
            flex-direction: column;
          }

          button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}
