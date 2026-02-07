'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function RevenueChart({ data = {} }) {
    const campaigns = (data && data.campaigns) || [];

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-label">{payload[0].payload.name}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="tooltip-value" style={{ color: entry.color }}>
                            {entry.name}: ₹{entry.value.toLocaleString('en-IN')}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Show message if no data
    if (campaigns.length === 0) {
        return (
            <div className="revenue-chart">
                <h3 className="chart-title">Revenue by Campaign</h3>
                <p className="chart-subtitle">Compare performance across campaigns</p>
                <div className="no-data">
                    <p>No campaign revenue data available yet.</p>
                </div>
                <style jsx>{`
                    .revenue-chart {
                        background: #1e293b;
                        border: 2px solid #334155;
                        border-radius: 16px;
                        padding: 24px;
                        margin-bottom: 30px;
                    }
                    .chart-title {
                        font-size: 1.25rem;
                        font-weight: 700;
                        color: #f1f5f9;
                        margin: 0 0 4px 0;
                    }
                    .chart-subtitle {
                        font-size: 0.9rem;
                        color: #94a3b8;
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
        <div className="revenue-chart">
            <h3 className="chart-title">Revenue by Campaign</h3>
            <p className="chart-subtitle">Compare performance across campaigns</p>

            <div className="chart-container">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={campaigns}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis
                            dataKey="name"
                            stroke="#94a3b8"
                            style={{ fontSize: '0.85rem', fill: '#94a3b8' }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            style={{ fontSize: '0.85rem', fill: '#94a3b8' }}
                            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ color: '#94a3b8' }} />
                        <Bar
                            dataKey="thisMonth"
                            name="This Month"
                            fill="#667eea"
                            radius={[8, 8, 0, 0]}
                        />
                        <Bar
                            dataKey="lastMonth"
                            name="Last Month"
                            fill="#10b981"
                            radius={[8, 8, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <style jsx>{`
        .revenue-chart {
          background: #1e293b;
          border: 2px solid #334155;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 30px;
        }

        .chart-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 4px 0;
        }

        .chart-subtitle {
          font-size: 0.9rem;
          color: #94a3b8;
          margin: 0 0 24px 0;
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
          margin: 0 0 8px 0;
        }

        :global(.tooltip-value) {
          font-size: 0.95rem;
          font-weight: 600;
          margin: 4px 0;
        }
      `}</style>
        </div>
    );
}
