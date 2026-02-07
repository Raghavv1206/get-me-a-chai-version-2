'use client';

import { FaCheck, FaClock, FaGift } from 'react-icons/fa';

export default function RewardTiers({ rewards = [], onSelectReward }) {
  if (rewards.length === 0) {
    return null;
  }

  const sortedRewards = [...rewards].sort((a, b) => a.amount - b.amount);

  const getAvailability = (reward) => {
    if (!reward.limitedQuantity) return { available: true, text: 'Unlimited' };
    const remaining = reward.limitedQuantity - (reward.claimedCount || 0);
    return {
      available: remaining > 0,
      text: `${remaining} of ${reward.limitedQuantity} remaining`,
      percentage: (remaining / reward.limitedQuantity) * 100
    };
  };

  return (
    <div className="reward-tiers">
      <h3 className="rewards-title">
        <FaGift className="title-icon" />
        Reward Tiers
      </h3>

      <div className="rewards-grid">
        {sortedRewards.map((reward, index) => {
          const availability = getAvailability(reward);
          const isLowStock = availability.percentage && availability.percentage < 20;

          return (
            <div
              key={index}
              className={`reward-card ${!availability.available ? 'sold-out' : ''}`}
            >
              <div className="reward-header">
                <div className="reward-amount">
                  ₹{reward.amount.toLocaleString('en-IN')}
                </div>
                {!availability.available && (
                  <span className="sold-out-badge">Sold Out</span>
                )}
                {availability.available && isLowStock && (
                  <span className="low-stock-badge">Limited</span>
                )}
              </div>

              <h4 className="reward-title">{reward.title}</h4>

              {reward.description && (
                <p className="reward-description">{reward.description}</p>
              )}

              <div className="reward-meta">
                {reward.deliveryTime && (
                  <div className="meta-item">
                    <FaClock className="meta-icon" />
                    <span>Delivery: {reward.deliveryTime}</span>
                  </div>
                )}

                {reward.limitedQuantity && (
                  <div className="meta-item">
                    <FaCheck className="meta-icon" />
                    <span className={isLowStock ? 'low-stock-text' : ''}>
                      {availability.text}
                    </span>
                  </div>
                )}
              </div>

              {availability.available && availability.percentage && (
                <div className="availability-bar">
                  <div
                    className="availability-fill"
                    style={{
                      width: `${availability.percentage}%`,
                      background: isLowStock
                        ? 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)'
                        : 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
                    }}
                  ></div>
                </div>
              )}

              <button
                className="select-reward-btn"
                onClick={() => onSelectReward && onSelectReward(reward)}
                disabled={!availability.available}
              >
                {availability.available ? 'Select Reward' : 'Sold Out'}
              </button>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .reward-tiers {
          margin-top: 40px;
        }

        .rewards-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #f1f5f9;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .title-icon {
          color: #667eea;
          font-size: 1.4rem;
        }

        .rewards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .reward-card {
          background: #1e293b;
          border: 2px solid #334155;
          border-radius: 16px;
          padding: 24px;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .reward-card:hover:not(.sold-out) {
          border-color: #667eea;
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
          transform: translateY(-4px);
        }

        .reward-card.sold-out {
          opacity: 0.6;
          background: #0f172a;
        }

        .reward-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .reward-amount {
          font-size: 1.75rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .sold-out-badge,
        .low-stock-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .sold-out-badge {
          background: #fee2e2;
          color: #dc2626;
        }

        .low-stock-badge {
          background: #fef3c7;
          color: #f59e0b;
          animation: pulse 2s infinite;
        }

        .reward-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #f1f5f9;
          margin: 0 0 12px 0;
        }

        .reward-description {
          color: #94a3b8;
          line-height: 1.6;
          margin: 0 0 16px 0;
          flex: 1;
          font-size: 0.95rem;
        }

        .reward-meta {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #94a3b8;
          font-size: 0.9rem;
        }

        .meta-icon {
          color: #667eea;
          font-size: 0.85rem;
        }

        .low-stock-text {
          color: #f59e0b;
          font-weight: 600;
        }

        .availability-bar {
          height: 6px;
          background: #0f172a;
          border-radius: 100px;
          overflow: hidden;
          margin-bottom: 16px;
        }

        .availability-fill {
          height: 100%;
          border-radius: 100px;
          transition: width 0.5s ease;
        }

        .select-reward-btn {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .select-reward-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .select-reward-btn:disabled {
          background: #d1d5db;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 768px) {
          .rewards-grid {
            grid-template-columns: 1fr;
          }

          .rewards-title {
            font-size: 1.25rem;
          }

          .reward-card {
            padding: 20px;
          }

          .reward-amount {
            font-size: 1.5rem;
          }

          .reward-title {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  );
}
