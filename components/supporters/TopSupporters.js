'use client';

import { Medal, Trophy } from 'lucide-react';

export default function TopSupporters({ supporters = [] }) {
  const getMedal = (rank) => {
    const colors = { 1: 'text-yellow-400', 2: 'text-gray-300', 3: 'text-amber-600' };
    if (rank >= 1 && rank <= 3) return <Medal className={`w-5 h-5 ${colors[rank]}`} />;
    return null;
  };

  return (
    <div className="top-supporters">
      <h3 className="supporters-title">Top Supporters</h3>
      <p className="supporters-subtitle">Your most generous supporters</p>

      <div className="supporters-list">
        {supporters.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Trophy className="w-12 h-12 text-gray-500 mx-auto" /></div>
            <p>No supporters yet</p>
          </div>
        ) : (
          supporters.map((supporter, index) => {
            const medal = getMedal(index + 1);

            return (
              <div key={supporter._id} className="supporter-item">
                <div className="rank-badge">
                  {medal || `#${index + 1}`}
                </div>

                <div className="supporter-info">
                  <div className="supporter-avatar">
                    {supporter.name?.charAt(0) || 'U'}
                  </div>
                  <div className="supporter-details">
                    <div className="supporter-name">{supporter.name}</div>
                    <div className="supporter-stats">
                      {supporter.donationsCount} donation{supporter.donationsCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                <div className="supporter-amount">
                  ₹{supporter.totalContributed.toLocaleString('en-IN')}
                </div>
              </div>
            );
          })
        )}
      </div>

      <style jsx>{`
        .top-supporters {
          background: #1e293b;
          border: 2px solid #334155;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 30px;
        }

        .supporters-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 4px 0;
        }

        .supporters-subtitle {
          font-size: 0.9rem;
          color: #94a3b8;
          margin: 0 0 20px 0;
        }

        .supporters-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .supporter-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #0f172a;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .supporter-item:hover {
          background: #1e293b;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
          transform: translateX(4px);
        }

        .rank-badge {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .supporter-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .supporter-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.1rem;
        }

        .supporter-details {
          flex: 1;
        }

        .supporter-name {
          font-size: 1rem;
          font-weight: 600;
          color: #f1f5f9;
          margin-bottom: 4px;
        }

        .supporter-stats {
          font-size: 0.85rem;
          color: #94a3b8;
        }

        .supporter-amount {
          font-size: 1.1rem;
          font-weight: 700;
          color: #10b981;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 12px;
        }

        .empty-state p {
          color: #94a3b8;
          margin: 0;
        }

        @media (max-width: 768px) {
          .supporter-item {
            flex-wrap: wrap;
          }

          .supporter-amount {
            width: 100%;
            text-align: right;
            padding-top: 8px;
            border-top: 1px solid #334155;
          }
        }
      `}</style>
    </div>
  );
}
