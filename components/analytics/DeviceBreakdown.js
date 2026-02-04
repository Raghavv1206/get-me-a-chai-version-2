'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function DeviceBreakdown({ data }) {
    const COLORS = {
        mobile: '#667eea',
        desktop: '#10b981',
        tablet: '#f59e0b'
    };

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

    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="device-breakdown">
            <h3 className="device-title">Device Breakdown</h3>

            <div className="chart-container">
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="name"
                            stroke="#9ca3af"
                            style={{ fontSize: '0.85rem' }}
                        />
                        <YAxis
                            stroke="#9ca3af"
                            style={{ fontSize: '0.85rem' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[entry.device] || '#6b7280'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="device-stats">
                {data.map((device) => (
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
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 30px;
        }

        .device-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
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
          background: #f9fafb;
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
          color: #374151;
        }

        .stat-values {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .stat-count {
          font-size: 0.95rem;
          font-weight: 700;
          color: #111827;
        }

        .stat-percentage {
          font-size: 0.85rem;
          color: #6b7280;
        }

        .total-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-radius: 12px;
        }

        .summary-label {
          font-size: 0.95rem;
          font-weight: 600;
          color: #374151;
        }

        .summary-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #667eea;
        }

        :global(.custom-tooltip) {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 12px 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        :global(.tooltip-label) {
          font-size: 0.85rem;
          color: #6b7280;
          margin: 0 0 4px 0;
        }

        :global(.tooltip-value) {
          font-size: 1rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }
      `}</style>
        </div>
    );
}
