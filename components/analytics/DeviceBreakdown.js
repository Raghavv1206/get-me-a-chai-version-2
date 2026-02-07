'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function DeviceBreakdown({ data = [] }) {
  const COLORS = {
    mobile: '#667eea',
    desktop: '#10b981',
    tablet: '#f59e0b'
  };

  // Ensure data is an array
  const deviceData = Array.isArray(data) ? data : [];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{payload[0].payload.name}</p>
          <p className="tooltip-value">
            {payload[0].value.toLocaleString()} visits ({payload[0].payload.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const total = deviceData.reduce((sum, item) => sum + item.value, 0);

  // Show message if no data
  if (deviceData.length === 0) {
    return (
      <div className="device-breakdown">
        <h3 className="device-title">Device Breakdown</h3>
        <div className="no-data">
          <p>No device data available yet.</p>
        </div>
        <style jsx>{`
                    .device-breakdown {
                        background: #1e293b;
                        border: 2px solid #334155;
                        border-radius: 16px;
                        padding: 24px;
                        margin-bottom: 30px;
                    }
                    .device-title {
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
    <div className="device-breakdown">
      <h3 className="device-title">Device Breakdown</h3>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={deviceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="name"
              stroke="#94a3b8"
              style={{ fontSize: '0.85rem', fill: '#94a3b8' }}
            />
            <YAxis
              stroke="#94a3b8"
              style={{ fontSize: '0.85rem', fill: '#94a3b8' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {deviceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.device] || '#6b7280'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="device-stats">
        {deviceData.map((device) => (
          <div key={device.device} className="stat-item">
            <div className="stat-header">
              <div
                className="stat-dot"
                style={{ backgroundColor: COLORS[device.device] }}
              ></div>
              <span className="stat-name">{device.name}</span>
            </div>
            <div className="stat-values">
              <span className="stat-count">{device.value.toLocaleString()}</span>
              <span className="stat-percentage">{device.percentage}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="total-summary">
        <span className="summary-label">Total Visits</span>
        <span className="summary-value">{total.toLocaleString()}</span>
      </div>

      <style jsx>{`
        .device-breakdown {
          background: #1e293b;
          border: 2px solid #334155;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 30px;
        }

        .device-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 24px 0;
        }

        .chart-container {
          margin-bottom: 24px;
        }

        .device-stats {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #0f172a;
          border-radius: 10px;
        }

        .stat-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .stat-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .stat-name {
          font-size: 0.95rem;
          font-weight: 600;
          color: #e2e8f0;
        }

        .stat-values {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .stat-count {
          font-size: 0.95rem;
          font-weight: 700;
          color: #f1f5f9;
        }

        .stat-percentage {
          font-size: 0.85rem;
          color: #94a3b8;
        }

        .total-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%);
          border-radius: 12px;
        }

        .summary-label {
          font-size: 0.95rem;
          font-weight: 600;
          color: #e2e8f0;
        }

        .summary-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #667eea;
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
        }

        :global(.tooltip-value) {
          font-size: 1rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
