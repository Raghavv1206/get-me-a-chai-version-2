'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function TrafficSources({ data = [] }) {
  const COLORS = {
    direct: '#667eea',
    social: '#10b981',
    search: '#f59e0b',
    referral: '#3b82f6',
    other: '#6b7280'
  };

  // Ensure data is an array
  const trafficData = Array.isArray(data) ? data : [];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{payload[0].name}</p>
          <p className="tooltip-value">
            {payload[0].value.toLocaleString()} visits ({payload[0].payload.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Show message if no data
  if (trafficData.length === 0) {
    return (
      <div className="traffic-sources">
        <h3 className="sources-title">Traffic Sources</h3>
        <div className="no-data">
          <p>No traffic data available yet.</p>
        </div>
        <style jsx>{`
                    .traffic-sources {
                        background: #1e293b;
                        border: 2px solid #334155;
                        border-radius: 16px;
                        padding: 24px;
                        margin-bottom: 30px;
                    }
                    .sources-title {
                        font-size: 1.25rem;
                        font-weight: 700;
                        color: #f1f5f9;
                        margin: 0 0 24px 0;
                    }
                    .no-data {
                        text-align: center;
                        padding: 40px 20px;
                        color: #94a3b8;
                    }
                `}</style>
      </div>
    );
  }

  return (
    <div className="traffic-sources">
      <h3 className="sources-title">Traffic Sources</h3>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={trafficData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name} ${percentage}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {trafficData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.source] || COLORS.other} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="sources-list">
        {trafficData.map((source) => (
          <div key={source.source} className="source-item">
            <div className="source-info">
              <div
                className="source-dot"
                style={{ backgroundColor: COLORS[source.source] || COLORS.other }}
              ></div>
              <span className="source-name">{source.name}</span>
            </div>
            <div className="source-stats">
              <span className="source-value">{source.value.toLocaleString()}</span>
              <span className="source-percentage">{source.percentage}%</span>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .traffic-sources {
          background: #1e293b;
          border: 2px solid #334155;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 30px;
        }

        .sources-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 24px 0;
        }

        .chart-container {
          margin-bottom: 24px;
        }

        .sources-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .source-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #0f172a;
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .source-item:hover {
          background: #1e293b;
        }

        .source-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .source-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .source-name {
          font-size: 0.95rem;
          font-weight: 600;
          color: #e2e8f0;
          text-transform: capitalize;
        }

        .source-stats {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .source-value {
          font-size: 0.95rem;
          font-weight: 700;
          color: #f1f5f9;
        }

        .source-percentage {
          font-size: 0.85rem;
          color: #94a3b8;
        }

        :global(.custom-tooltip) {
          background: #1e293b;
          border: 2px solid #334155;
          border-radius: 12px;
          padding: 12px 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        }

        :global(.tooltip-label) {
          font-size: 0.85rem;
          color: #94a3b8;
          margin: 0 0 4px 0;
          text-transform: capitalize;
        }

        :global(.tooltip-value) {
          font-size: 1rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0;
        }

        @media (max-width: 768px) {
          .chart-container {
            height: 250px;
          }
        }
      `}</style>
    </div>
  );
}
