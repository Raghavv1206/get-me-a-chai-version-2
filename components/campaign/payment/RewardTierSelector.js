'use client';

import { FaGift, FaClock, FaCheck } from 'react-icons/fa';

export default function RewardTierSelector({ rewards, selectedReward, onSelectReward }) {
    const sortedRewards = [...rewards].sort((a, b) => a.amount - b.amount);

    const getAvailability = (reward) => {
        if (!reward.limitedQuantity) return { available: true, remaining: null };
        const remaining = reward.limitedQuantity - (reward.claimedCount || 0);
        return {
            available: remaining > 0,
            remaining
        };
    };

    return (
        <div className="reward-tier-selector">
            <div className="reward-option no-reward">
                <label className="reward-label">
                    <input
                        type="radio"
                        name="reward"
                        checked={!selectedReward}
                        onChange={() => onSelectReward(null)}
                    />
                    <div className="reward-content">
                        <div className="reward-title">No reward - Just support</div>
                        <div className="reward-description">Support without claiming a reward</div>
                    </div>
                </label>
            </div>

            {sortedRewards.map((reward) => {
                const availability = getAvailability(reward);
                const isSelected = selectedReward?._id === reward._id;

                return (
                    <div
                        key={reward._id}
                        className={`reward-option ${!availability.available ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`}
                    >
                        <label className="reward-label">
                            <input
                                type="radio"
                                name="reward"
                                checked={isSelected}
                                onChange={() => availability.available && onSelectReward(reward)}
                                disabled={!availability.available}
                            />
                            <div className="reward-content">
                                <div className="reward-header">
                                    <div className="reward-amount">
                                        <FaGift className="gift-icon" />
                                        ₹{reward.amount.toLocaleString('en-IN')}
                                    </div>
                                    {!availability.available && (
                                        <span className="sold-out-badge">Sold Out</span>
                                    )}
                                </div>

                                <div className="reward-title">{reward.title}</div>

                                {reward.description && (
                                    <div className="reward-description">{reward.description}</div>
                                )}

                                <div className="reward-meta">
                                    {reward.deliveryTime && (
                                        <div className="meta-item">
                                            <FaClock className="meta-icon" />
                                            <span>{reward.deliveryTime}</span>
                                        </div>
                                    )}

                                    {availability.remaining !== null && (
                                        <div className="meta-item">
                                            <FaCheck className="meta-icon" />
                                            <span className={availability.remaining < 5 ? 'low-stock' : ''}>
                                                {availability.remaining} remaining
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </label>
                    </div>
                );
            })}

            <style jsx>{`
        .reward-tier-selector {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .reward-option {
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .reward-option:hover:not(.disabled) {
          border-color: #d1d5db;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .reward-option.selected {
          border-color: #667eea;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
        }

        .reward-option.disabled {
          opacity: 0.6;
          background: #f9fafb;
          cursor: not-allowed;
        }

        .reward-option.no-reward {
          background: white;
        }

        .reward-label {
          display: flex;
          gap: 12px;
          padding: 16px;
          cursor: pointer;
          width: 100%;
        }

        .reward-option.disabled .reward-label {
          cursor: not-allowed;
        }

        .reward-label input[type="radio"] {
          flex-shrink: 0;
          width: 20px;
          height: 20px;
          margin-top: 2px;
          cursor: pointer;
        }

        .reward-option.disabled input[type="radio"] {
          cursor: not-allowed;
        }

        .reward-content {
          flex: 1;
        }

        .reward-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .reward-amount {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.1rem;
          font-weight: 700;
          color: #667eea;
        }

        .gift-icon {
          font-size: 1rem;
        }

        .sold-out-badge {
          padding: 4px 10px;
          background: #fee2e2;
          color: #dc2626;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .reward-title {
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 6px;
        }

        .reward-description {
          font-size: 0.9rem;
          color: #6b7280;
          line-height: 1.5;
          margin-bottom: 10px;
        }

        .reward-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          color: #6b7280;
        }

        .meta-icon {
          font-size: 0.8rem;
          color: #9ca3af;
        }

        .low-stock {
          color: #f59e0b;
          font-weight: 600;
        }

        @media (max-width: 480px) {
          .reward-label {
            padding: 12px;
          }

          .reward-amount {
            font-size: 1rem;
          }

          .reward-title {
            font-size: 0.95rem;
          }

          .reward-description {
            font-size: 0.85rem;
          }
        }
      `}</style>
        </div>
    );
}
