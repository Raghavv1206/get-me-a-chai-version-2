'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FaEllipsisV, FaEdit, FaEye, FaPause, FaPlay, FaChartLine, FaTrash, FaCopy } from 'react-icons/fa';
import DeleteConfirmationModal from './DeleteConfirmationModal';

export default function CampaignListCard({ campaign, viewMode = 'grid', onUpdate, onDelete }) {
    const [showMenu, setShowMenu] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return '#10b981';
            case 'paused':
                return '#f59e0b';
            case 'completed':
                return '#3b82f6';
            case 'draft':
                return '#6b7280';
            default:
                return '#6b7280';
        }
    };

    const getStatusLabel = (status) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const calculateProgress = () => {
        if (!campaign.goalAmount) return 0;
        return Math.min(((campaign.currentAmount || 0) / campaign.goalAmount) * 100, 100);
    };

    const handleAction = async (action) => {
        setShowMenu(false);
        setIsProcessing(true);

        try {
            switch (action) {
                case 'edit':
                    window.location.href = `/dashboard/campaigns/${campaign._id}/edit`;
                    break;

                case 'view':
                    window.location.href = `/${campaign.creator?.username || 'campaign'}`;
                    break;

                case 'pause':
                case 'resume':
                    const newStatus = action === 'pause' ? 'paused' : 'active';
                    const response = await fetch(`/api/campaigns/${campaign._id}/status`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: newStatus })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        onUpdate({ ...campaign, status: newStatus });
                    }
                    break;

                case 'analytics':
                    window.location.href = `/dashboard/campaigns/${campaign._id}/analytics`;
                    break;

                case 'delete':
                    setShowDeleteModal(true);
                    break;

                case 'duplicate':
                    const dupResponse = await fetch(`/api/campaigns/${campaign._id}/duplicate`, {
                        method: 'POST'
                    });

                    if (dupResponse.ok) {
                        const data = await dupResponse.json();
                        window.location.href = `/dashboard/campaigns/${data.campaign._id}/edit`;
                    }
                    break;
            }
        } catch (error) {
            console.error('Error performing action:', error);
            alert('Failed to perform action. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async () => {
        setIsProcessing(true);
        try {
            const response = await fetch(`/api/campaigns/${campaign._id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                onDelete(campaign._id);
                setShowDeleteModal(false);
            } else {
                alert('Failed to delete campaign');
            }
        } catch (error) {
            console.error('Error deleting campaign:', error);
            alert('Failed to delete campaign');
        } finally {
            setIsProcessing(false);
        }
    };

    const progress = calculateProgress();

    return (
        <>
            <div className={`campaign-card ${viewMode}`}>
                {/* Thumbnail */}
                <div className="card-thumbnail">
                    <Image
                        src={campaign.coverImage || '/images/default-campaign.jpg'}
                        alt={campaign.title}
                        fill
                        className="thumbnail-image"
                        sizes={viewMode === 'grid' ? '350px' : '200px'}
                    />
                    <div
                        className="status-badge"
                        style={{ backgroundColor: `${getStatusColor(campaign.status)}20`, color: getStatusColor(campaign.status) }}
                    >
                        {getStatusLabel(campaign.status)}
                    </div>
                </div>

                {/* Content */}
                <div className="card-content">
                    <div className="card-header">
                        <h3 className="campaign-title">{campaign.title}</h3>

                        <div className="actions-menu">
                            <button
                                className="menu-trigger"
                                onClick={() => setShowMenu(!showMenu)}
                            >
                                <FaEllipsisV />
                            </button>

                            {showMenu && (
                                <div className="menu-dropdown">
                                    <button onClick={() => handleAction('edit')}>
                                        <FaEdit /> Edit
                                    </button>
                                    <button onClick={() => handleAction('view')}>
                                        <FaEye /> View
                                    </button>
                                    {campaign.status === 'active' && (
                                        <button onClick={() => handleAction('pause')}>
                                            <FaPause /> Pause
                                        </button>
                                    )}
                                    {campaign.status === 'paused' && (
                                        <button onClick={() => handleAction('resume')}>
                                            <FaPlay /> Resume
                                        </button>
                                    )}
                                    <button onClick={() => handleAction('analytics')}>
                                        <FaChartLine /> Analytics
                                    </button>
                                    <button onClick={() => handleAction('duplicate')}>
                                        <FaCopy /> Duplicate
                                    </button>
                                    <button onClick={() => handleAction('delete')} className="danger">
                                        <FaTrash /> Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="progress-section">
                        <div className="progress-bar-container">
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <div className="progress-stats">
                            <span className="raised">
                                ₹{(campaign.currentAmount || 0).toLocaleString('en-IN')}
                            </span>
                            <span className="goal">
                                of ₹{campaign.goalAmount.toLocaleString('en-IN')}
                            </span>
                            <span className="percentage">
                                {progress.toFixed(0)}%
                            </span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="card-stats">
                        <div className="stat-item">
                            <span className="stat-value">{campaign.stats?.supporters || 0}</span>
                            <span className="stat-label">Supporters</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{campaign.stats?.views || 0}</span>
                            <span className="stat-label">Views</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{campaign.daysRemaining || 0}</span>
                            <span className="stat-label">Days Left</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <DeleteConfirmationModal
                    campaign={campaign}
                    onConfirm={handleDelete}
                    onCancel={() => setShowDeleteModal(false)}
                    isProcessing={isProcessing}
                />
            )}

            <style jsx>{`
        .campaign-card {
          background: white;
          border-radius: 16px;
          border: 2px solid #e5e7eb;
          overflow: hidden;
          transition: all 0.3s ease;
          position: relative;
        }

        .campaign-card:hover {
          border-color: #d1d5db;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
        }

        .campaign-card.grid {
          display: flex;
          flex-direction: column;
        }

        .campaign-card.list {
          display: flex;
          flex-direction: row;
        }

        .card-thumbnail {
          position: relative;
          width: 100%;
          height: 200px;
          background: #f3f4f6;
          flex-shrink: 0;
        }

        .campaign-card.list .card-thumbnail {
          width: 200px;
          height: auto;
        }

        .thumbnail-image {
          object-fit: cover;
        }

        .status-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: capitalize;
          backdrop-filter: blur(8px);
        }

        .card-content {
          padding: 20px;
          flex: 1;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .campaign-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .actions-menu {
          position: relative;
          margin-left: 12px;
        }

        .menu-trigger {
          padding: 8px;
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .menu-trigger:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .menu-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          min-width: 160px;
          z-index: 10;
          overflow: hidden;
        }

        .menu-dropdown button {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 12px 16px;
          background: none;
          border: none;
          color: #374151;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .menu-dropdown button:hover {
          background: #f9fafb;
        }

        .menu-dropdown button.danger {
          color: #ef4444;
        }

        .menu-dropdown button.danger:hover {
          background: #fef2f2;
        }

        .progress-section {
          margin-bottom: 16px;
        }

        .progress-bar-container {
          width: 100%;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          transition: width 0.3s ease;
        }

        .progress-stats {
          display: flex;
          gap: 8px;
          align-items: center;
          font-size: 0.9rem;
        }

        .raised {
          font-weight: 700;
          color: #667eea;
        }

        .goal {
          color: #6b7280;
        }

        .percentage {
          margin-left: auto;
          font-weight: 600;
          color: #374151;
        }

        .card-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
        }

        .stat-label {
          font-size: 0.85rem;
          color: #6b7280;
          margin-top: 4px;
        }

        @media (max-width: 768px) {
          .campaign-card.list {
            flex-direction: column;
          }

          .campaign-card.list .card-thumbnail {
            width: 100%;
            height: 200px;
          }

          .campaign-title {
            font-size: 1.1rem;
          }

          .card-stats {
            gap: 12px;
          }

          .stat-value {
            font-size: 1.1rem;
          }
        }
      `}</style>
        </>
    );
}
