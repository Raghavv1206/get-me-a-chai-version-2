'use client';

export default function TopSupporters({ supporters }) {
    const getMedal = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return null;
    };

    return (
        <div className="top-supporters">
            <h3 className="supporters-title">Top Supporters</h3>
            <p className="supporters-subtitle">Your most generous supporters</p>

            <div className="supporters-list">
                {supporters.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🏆</div>
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
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 30px;
        }

        .supporters-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 4px 0;
        }

        .supporters-subtitle {
          font-size: 0.9rem;
          color: #6b7280;
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
          background: #f9fafb;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .supporter-item:hover {
          background: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
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
          color: #111827;
          margin-bottom: 4px;
        }

        .supporter-stats {
          font-size: 0.85rem;
          color: #6b7280;
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
          color: #9ca3af;
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
            border-top: 1px solid #e5e7eb;
          }
        }
      `}</style>
        </div>
    );
}
