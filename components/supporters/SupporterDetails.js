'use client';

import { formatDistanceToNow } from 'date-fns';
import { FaTimes, FaEnvelope, FaHeart } from 'react-icons/fa';

export default function SupporterDetails({ supporter, onClose, onSendEmail }) {
    if (!supporter) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>
                    <FaTimes />
                </button>

                <div className="supporter-header">
                    <div className="supporter-avatar">
                        {supporter.name?.charAt(0) || 'U'}
                    </div>
                    <div className="supporter-info">
                        <h2 className="supporter-name">{supporter.name}</h2>
                        <p className="supporter-email">{supporter.email}</p>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-label">Total Contributed</div>
                        <div className="stat-value">₹{supporter.totalContributed.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Donations</div>
                        <div className="stat-value">{supporter.donationsCount}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">First Donation</div>
                        <div className="stat-value">
                            {new Date(supporter.firstDonation).toLocaleDateString()}
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Last Donation</div>
                        <div className="stat-value">
                            {formatDistanceToNow(new Date(supporter.lastDonation), { addSuffix: true })}
                        </div>
                    </div>
                </div>

                <div className="contribution-history">
                    <h3 className="section-title">Contribution History</h3>
                    <div className="history-list">
                        {supporter.contributions?.map((contribution) => (
                            <div key={contribution._id} className="history-item">
                                <div className="history-info">
                                    <div className="history-campaign">{contribution.campaign?.title}</div>
                                    <div className="history-date">
                                        {new Date(contribution.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="history-amount">
                                    ₹{contribution.amount.toLocaleString('en-IN')}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {supporter.messages && supporter.messages.length > 0 && (
                    <div className="messages-section">
                        <h3 className="section-title">Messages Left</h3>
                        <div className="messages-list">
                            {supporter.messages.map((message, index) => (
                                <div key={index} className="message-item">
                                    <FaHeart className="message-icon" />
                                    <p className="message-text">{message.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="modal-actions">
                    <button
                        className="action-btn primary"
                        onClick={() => onSendEmail(supporter)}
                    >
                        <FaEnvelope /> Send Thank You Email
                    </button>
                </div>

                <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            padding: 20px;
            animation: fadeIn 0.3s ease;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          .modal-content {
            background: white;
            border-radius: 24px;
            max-width: 700px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            padding: 32px;
            position: relative;
            animation: slideUp 0.4s ease;
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          .close-btn {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #f3f4f6;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            color: #6b7280;
          }

          .close-btn:hover {
            background: #e5e7eb;
            color: #374151;
          }

          .supporter-header {
            display: flex;
            align-items: center;
            gap: 20px;
            margin-bottom: 24px;
            padding-bottom: 24px;
            border-bottom: 2px solid #f3f4f6;
          }

          .supporter-avatar {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 2rem;
          }

          .supporter-name {
            font-size: 1.75rem;
            font-weight: 700;
            color: #111827;
            margin: 0 0 4px 0;
          }

          .supporter-email {
            font-size: 1rem;
            color: #6b7280;
            margin: 0;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            margin-bottom: 24px;
          }

          .stat-card {
            padding: 16px;
            background: #f9fafb;
            border-radius: 12px;
          }

          .stat-label {
            font-size: 0.85rem;
            color: #6b7280;
            margin-bottom: 8px;
          }

          .stat-value {
            font-size: 1.25rem;
            font-weight: 700;
            color: #111827;
          }

          .section-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: #111827;
            margin: 0 0 16px 0;
          }

          .contribution-history,
          .messages-section {
            margin-bottom: 24px;
          }

          .history-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .history-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            background: #f9fafb;
            border-radius: 10px;
          }

          .history-campaign {
            font-size: 0.95rem;
            font-weight: 600;
            color: #374151;
            margin-bottom: 4px;
          }

          .history-date {
            font-size: 0.85rem;
            color: #9ca3af;
          }

          .history-amount {
            font-size: 1rem;
            font-weight: 700;
            color: #10b981;
          }

          .messages-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .message-item {
            display: flex;
            gap: 12px;
            padding: 12px;
            background: #fef2f2;
            border-left: 4px solid #ef4444;
            border-radius: 8px;
          }

          .message-icon {
            color: #ef4444;
            font-size: 1.25rem;
            flex-shrink: 0;
            margin-top: 2px;
          }

          .message-text {
            color: #7f1d1d;
            margin: 0;
            line-height: 1.6;
          }

          .modal-actions {
            display: flex;
            gap: 12px;
            padding-top: 24px;
            border-top: 2px solid #f3f4f6;
          }

          .action-btn {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 14px 24px;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .action-btn.primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
          }

          .action-btn.primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
          }

          @media (max-width: 640px) {
            .modal-content {
              padding: 24px;
            }

            .stats-grid {
              grid-template-columns: 1fr;
            }

            .supporter-header {
              flex-direction: column;
              text-align: center;
            }
          }
        `}</style>
            </div>
        </div>
    );
}
