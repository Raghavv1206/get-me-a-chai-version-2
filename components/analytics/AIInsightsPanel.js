'use client';

import { useState, useEffect } from 'react';
import { FaLightbulb, FaChartLine, FaClock, FaUsers, FaSync } from 'react-icons/fa';

export default function AIInsightsPanel({ campaignId }) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchInsights();
  }, [campaignId]);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ai/insights?campaignId=${campaignId || 'all'}`);
      const data = await response.json();

      if (data.success) {
        setInsights(data.insights);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'timing':
        return FaClock;
      case 'traffic':
        return FaChartLine;
      case 'engagement':
        return FaUsers;
      default:
        return FaLightbulb;
    }
  };

  const getInsightColor = (priority) => {
    switch (priority) {
      case 'high':
        return { bg: '#1e1b1b', color: '#ef4444', border: '#7f1d1d' };
      case 'medium':
        return { bg: '#1e1a13', color: '#f59e0b', border: '#78350f' };
      default:
        return { bg: '#172554', color: '#3b82f6', border: '#1e3a8a' };
    }
  };

  return (
    <div className="ai-insights-panel">
      <div className="panel-header">
        <div className="header-left">
          <FaLightbulb className="header-icon" />
          <div>
            <h3 className="panel-title">AI Insights</h3>
            <p className="panel-subtitle">
              {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Powered by AI'}
            </p>
          </div>
        </div>
        <button
          className="refresh-btn"
          onClick={fetchInsights}
          disabled={loading}
        >
          <FaSync className={loading ? 'spinning' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Generating insights...</p>
        </div>
      ) : insights.length === 0 ? (
        <div className="empty-state">
          <FaLightbulb className="empty-icon" />
          <p>No insights available yet. Check back later!</p>
        </div>
      ) : (
        <div className="insights-list">
          {insights.map((insight, index) => {
            const Icon = getInsightIcon(insight.type);
            const colors = getInsightColor(insight.priority);

            return (
              <div
                key={index}
                className="insight-card"
                style={{
                  backgroundColor: colors.bg,
                  borderColor: colors.border
                }}
              >
                <div
                  className="insight-icon"
                  style={{ color: colors.color }}
                >
                  <Icon />
                </div>

                <div className="insight-content">
                  <h4 className="insight-title">{insight.title}</h4>
                  <p className="insight-message">{insight.message}</p>

                  {insight.action && (
                    <button className="insight-action">
                      {insight.action}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .ai-insights-panel {
          background: #1e293b;
          border: 2px solid #334155;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 30px;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-icon {
          font-size: 1.5rem;
          color: #f59e0b;
        }

        .panel-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0;
        }

        .panel-subtitle {
          font-size: 0.85rem;
          color: #94a3b8;
          margin: 4px 0 0 0;
        }

        .refresh-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #0f172a;
          border: 2px solid #334155;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #94a3b8;
        }

        .refresh-btn:hover:not(:disabled) {
          background: #1e293b;
          border-color: #667eea;
          color: #667eea;
        }

        .refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .loading-state,
        .empty-state {
          text-align: center;
          padding: 40px 20px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #334155;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }

        .loading-state p,
        .empty-state p {
          color: #94a3b8;
          margin: 0;
        }

        .empty-icon {
          font-size: 3rem;
          color: #475569;
          margin-bottom: 16px;
        }

        .insights-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .insight-card {
          display: flex;
          gap: 16px;
          padding: 20px;
          border: 2px solid;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .insight-card:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        }

        .insight-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .insight-content {
          flex: 1;
        }

        .insight-title {
          font-size: 1rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 8px 0;
        }

        .insight-message {
          font-size: 0.95rem;
          color: #e2e8f0;
          line-height: 1.6;
          margin: 0 0 12px 0;
        }

        .insight-action {
          padding: 8px 16px;
          background: #0f172a;
          border: 2px solid #334155;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #667eea;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .insight-action:hover {
          background: #1e293b;
          border-color: #667eea;
        }

        @media (max-width: 768px) {
          .insight-card {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
