'use client';

export default function GeographicDistribution({ data }) {
    const topCities = data.cities || [];
    const maxValue = Math.max(...topCities.map(c => c.value));

    return (
        <div className="geographic-distribution">
            <h3 className="geo-title">Geographic Distribution</h3>
            <p className="geo-subtitle">Top supporter locations</p>

            <div className="cities-list">
                {topCities.map((city, index) => {
                    const percentage = (city.value / maxValue) * 100;

                    return (
                        <div key={city.name} className="city-item">
                            <div className="city-rank">#{index + 1}</div>

                            <div className="city-info">
                                <div className="city-header">
                                    <span className="city-name">{city.name}</span>
                                    <span className="city-value">{city.value.toLocaleString()}</span>
                                </div>

                                <div className="city-bar-container">
                                    <div
                                        className="city-bar"
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {topCities.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">🗺️</div>
                    <p>No geographic data available yet</p>
                </div>
            )}

            <style jsx>{`
        .geographic-distribution {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 30px;
        }

        .geo-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 4px 0;
        }

        .geo-subtitle {
          font-size: 0.9rem;
          color: #6b7280;
          margin: 0 0 24px 0;
        }

        .cities-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .city-item {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .city-rank {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
          flex-shrink: 0;
        }

        .city-info {
          flex: 1;
        }

        .city-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .city-name {
          font-size: 0.95rem;
          font-weight: 600;
          color: #374151;
        }

        .city-value {
          font-size: 0.95rem;
          font-weight: 700;
          color: #111827;
        }

        .city-bar-container {
          width: 100%;
          height: 8px;
          background: #f3f4f6;
          border-radius: 4px;
          overflow: hidden;
        }

        .city-bar {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          transition: width 0.5s ease;
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
          color: #9ca3af;
          margin: 0;
        }

        @media (max-width: 768px) {
          .city-rank {
            width: 32px;
            height: 32px;
            font-size: 0.8rem;
          }

          .city-name,
          .city-value {
            font-size: 0.85rem;
          }
        }
      `}</style>
        </div>
    );
}
