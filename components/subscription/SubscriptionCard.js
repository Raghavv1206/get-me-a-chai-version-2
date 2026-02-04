'use client';

import { FaPause, FaPlay, FaTimes, FaEdit, FaCalendar, FaRupeeSign } from 'react-icons/fa';

export default function SubscriptionCard({ subscription, onPause, onResume, onCancel, onUpdate }) {
    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return '#10b981';
            case 'paused':
                return '#f59e0b';
            case 'cancelled':
                return '#ef4444';
            default:
                return '#6b7280';
        }
    };

    const getStatusLabel = (status) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getFrequencyLabel = (frequency) => {
        switch (frequency) {
            case 'monthly':
                return 'Monthly';
            case 'quarterly':
                return 'Every 3 Months';
            case 'yearly':
                return 'Yearly';
            default:
                return frequency;
        }
    };

    return (
        <div className="subscription-card">
            <div className="card-header">
                <div className="campaign-info">
                    <h3 className="campaign-title">{subscription.campaign?.title || 'Campaign'}</h3>
                    <p className="creator-name">by @{subscription.creator?.username}</p>
                </div>
                <div
                    className="status-badge"
                    style={{ backgroundColor: `${getStatusColor(subscription.status)}20`, color: getStatusColor(subscription.status) }}
                >
                    {getStatusLabel(subscription.status)}
                </div>
            </div>

            <div className="card-body">
                <div className="subscription-details">
                    <div className="detail-item">
                        <FaRupeeSign className="detail-icon" />
                        <div>
                            <div className="detail-label">Amount</div>
                            <div className="detail-value">₹{subscription.amount.toLocaleString('en-IN')}</div>
                        </div>
                    </div>

                    <div className="detail-item">
                        <FaCalendar className="detail-icon" />
                        <div>
                            <div className="detail-label">Frequency</div>
                            <div className="detail-value">{getFrequencyLabel(subscription.frequency)}</div>
                        </div>
                    </div>

                    {subscription.status === 'active' && subscription.nextBillingDate && (
                        <div className="detail-item">
                            <FaCalendar className="detail-icon" />
                            <div>
                                <div className="detail-label">Next Billing</div>
                                <div className="detail-value">{formatDate(subscription.nextBillingDate)}</div>
                            </div>
                        </div>
                    )}

                    <div className="detail-item">
                        <div className="detail-label">Started</div>
                        <div className="detail-value">{formatDate(subscription.startDate)}</div>
                    </div>
                </div>
            </div>

            <div className="card-actions">
                {subscription.status === 'active' && (
                    <>
                        <button
                            className="action-btn pause-btn"
                            onClick={() => onPause(subscription._id)}
                        >
                            <FaPause /> Pause
                        </button>
                        <button
                            className="action-btn update-btn"
                            onClick={() => onUpdate(subscription)}
                        >
                            <FaEdit /> Update Amount
                        </button>
                    </>
                )}

                {subscription.status === 'paused' && (
                    <button
                        className="action-btn resume-btn"
                        onClick={() => onResume(subscription._id)}
                    >
                        <FaPlay /> Resume
                    </button>
                )}

                {(subscription.status === 'active' || subscription.status === 'paused') && (
                    <button
                        className="action-btn cancel-btn"
                        onClick={() => onCancel(subscription._id)}
                    >
                        <FaTimes /> Cancel
                    </button>
                )}
            </div>

            <style jsx>{`
        .subscription-card {
          background: white;
          border-radius: 16px;
          border: 2px solid #e5e7eb;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .subscription-card:hover {
          border-color: #d1d5db;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 24px;
          border-bottom: 2px solid #f3f4f6;
        }

        .campaign-info {
          flex: 1;
        }

        .campaign-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 6px 0;
        }

        .creator-name {
          font-size: 0.95rem;
          color: #6b7280;
          margin: 0;
        }

        .status-badge {
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .card-body {
          padding: 24px;
        }

        .subscription-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 20px;
        }

        .detail-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .detail-icon {
          color: #667eea;
          font-size: 1.25rem;
          margin-top: 2px;
        }

        .detail-label {
          font-size: 0.85rem;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .detail-value {
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
        }

        .card-actions {
          display: flex;
          gap: 12px;
          padding: 20px 24px;
          background: #f9fafb;
          border-top: 2px solid #f3f4f6;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid;
          flex: 1;
          justify-content: center;
        }

        .pause-btn {
          background: white;
          color: #f59e0b;
          border-color: #f59e0b;
        }

        .pause-btn:hover {
          background: #fffbeb;
          transform: translateY(-2px);
        }

        .resume-btn {
          background: white;
          color: #10b981;
          border-color: #10b981;
        }

        .resume-btn:hover {
          background: #f0fdf4;
          transform: translateY(-2px);
        }

        .update-btn {
          background: white;
          color: #667eea;
          border-color: #667eea;
        }

        .update-btn:hover {
          background: #f0f9ff;
          transform: translateY(-2px);
        }

        .cancel-btn {
          background: white;
          color: #ef4444;
          border-color: #ef4444;
        }

        .cancel-btn:hover {
          background: #fef2f2;
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .card-header {
            flex-direction: column;
            gap: 12px;
          }

          .subscription-details {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .card-actions {
            flex-direction: column;
          }

          .action-btn {
            width: 100%;
          }
        }
      `}</style>
        </div>
    );
}
