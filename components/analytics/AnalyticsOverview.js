'use client';

import { useState } from 'react';
import { FaEye, FaMousePointer, FaPercentage, FaArrowDown } from 'react-icons/fa';

export default function AnalyticsOverview({ data = {} }) {
  const [period, setPeriod] = useState('30'); // 7, 30, 90, all

  const periods = {
    '7': 'Last 7 Days',
    '30': 'Last 30 Days',
    '90': 'Last 90 Days',
    'all': 'All Time'
  };

  const stats = (data && data[period]) || {};

  const cards = [
    {
      id: 'views',
      icon: FaEye,
      label: 'Total Views',
      value: stats.views || 0,
      change: stats.viewsChange || 0,
      color: '#3b82f6',
      bgColor: '#eff6ff'
    },
    {
      id: 'clicks',
      icon: FaMousePointer,
      label: 'Total Clicks',
      value: stats.clicks || 0,
      change: stats.clicksChange || 0,
      color: '#10b981',
      bgColor: '#f0fdf4'
    },
    {
      id: 'conversions',
      icon: FaPercentage,
      label: 'Conversion Rate',
      value: `${(stats.conversionRate || 0).toFixed(1)}%`,
      change: stats.conversionChange || 0,
      color: '#f59e0b',
      bgColor: '#fffbeb'
    },
    {
      id: 'bounce',
      icon: FaArrowDown,
      label: 'Bounce Rate',
      value: `${(stats.bounceRate || 0).toFixed(1)}%`,
      change: stats.bounceChange || 0,
      color: '#ef4444',
      bgColor: '#fef2f2',
      inverse: true
    }
  ];

  return (
    <div className="analytics-overview">
      <div className="overview-header">
        <h2 className="overview-title">Analytics Overview</h2>
        <div className="period-selector">
          {Object.keys(periods).map((key) => (
            <button
              key={key}
              className={`period-btn ${period === key ? 'active' : ''}`}
              onClick={() => setPeriod(key)}
            >
              {periods[key]}
            </button>
          ))}
        </div>
      </div>

      <div className="stats-grid">
        {cards.map((card) => {
          const Icon = card.icon;
          const isPositive = card.inverse ? card.change < 0 : card.change > 0;

          return (
            <div key={card.id} className="stat-card">
              <div
                className="card-icon"
                style={{ backgroundColor: card.bgColor, color: card.color }}
              >
                <Icon />
              </div>

              <div className="card-content">
                <div className="card-label">{card.label}</div>
                <div className="card-value">{card.value}</div>

                {card.change !== 0 && (
                  <div className={`card-change ${isPositive ? 'positive' : 'negative'}`}>
                    {isPositive ? '↑' : '↓'} {Math.abs(card.change)}%
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .analytics-overview {
          background: #1e293b;
          border: 2px solid #334155;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 30px;
        }

        .overview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .overview-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0;
        }

        .period-selector {
          display: flex;
          gap: 8px;
          background: #0f172a;
          border-radius: 12px;
          padding: 4px;
        }

        .period-btn {
          padding: 8px 16px;
          background: none;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .period-btn:hover {
          background: #1e293b;
          color: #e2e8f0;
        }

        .period-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .stat-card {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: #0f172a;
          border-radius: 12px;
          transition: all 0.3s ease;
          border: 1px solid #334155;
        }

        .stat-card:hover {
          background: #1e293b;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        }

        .card-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .card-content {
          flex: 1;
        }

        .card-label {
          font-size: 0.9rem;
          color: #94a3b8;
          margin-bottom: 8px;
        }

        .card-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: #f1f5f9;
          margin-bottom: 4px;
        }

        .card-change {
          font-size: 0.85rem;
          font-weight: 600;
        }

        .card-change.positive {
          color: #10b981;
        }

        .card-change.negative {
          color: #ef4444;
        }

        @media (max-width: 768px) {
          .overview-header {
            flex-direction: column;
            align-items: stretch;
          }

          .period-selector {
            width: 100%;
          }

          .period-btn {
            flex: 1;
            font-size: 0.8rem;
            padding: 8px 4px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
