'use client';

import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function VisitorChart({ data = [] }) {
    const [viewType, setViewType] = useState('all'); // all, unique, returning

    // Ensure data is an array
    const visitorData = Array.isArray(data) ? data : [];

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-label">{payload[0].payload.date}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="tooltip-value" style={{ color: entry.color }}>
                            {entry.name}: {entry.value.toLocaleString()}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const getChartData = () => {
        if (viewType === 'unique') {
            return visitorData.map(d => ({ ...d, returning: 0 }));
        }
        if (viewType === 'returning') {
            return visitorData.map(d => ({ ...d, unique: 0 }));
        }
        return visitorData;
    };

    return (
        <div className="visitor-chart">
            <div className="chart-header">
                <h3 className="chart-title">Visitor Analytics</h3>
                <div className="view-toggle">
                    <button
                        className={`toggle-btn ${viewType === 'all' ? 'active' : ''}`}
                        onClick={() => setViewType('all')}
                    >
                        All Visitors
                    </button>
                    <button
                        className={`toggle-btn ${viewType === 'unique' ? 'active' : ''}`}
                        onClick={() => setViewType('unique')}
                    >
                        Unique Only
                    </button>
                    <button
                        className={`toggle-btn ${viewType === 'returning' ? 'active' : ''}`}
                        onClick={() => setViewType('returning')}
                    >
                        Returning Only
                    </button>
                </div>
            </div>

            <div className="chart-container">
                <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={getChartData()}>
                        <defs>
                            <linearGradient id="colorUnique" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#667eea" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorReturning" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis
                            dataKey="date"
                            stroke="#94a3b8"
                            style={{ fontSize: '0.85rem', fill: '#94a3b8' }}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            style={{ fontSize: '0.85rem', fill: '#94a3b8' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ color: '#94a3b8' }} />
                        {(viewType === 'all' || viewType === 'unique') && (
                            <Area
                                type="monotone"
                                dataKey="unique"
                                name="Unique Visitors"
                                stroke="#667eea"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorUnique)"
                            />
                        )}
                        {(viewType === 'all' || viewType === 'returning') && (
                            <Area
                                type="monotone"
                                dataKey="returning"
                                name="Returning Visitors"
                                stroke="#10b981"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorReturning)"
                            />
                        )}
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <style jsx>{`
        .visitor-chart {
          background: #1e293b;
          border: 2px solid #334155;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 30px;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .chart-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0;
        }

        .view-toggle {
          display: flex;
          gap: 8px;
          background: #0f172a;
          border-radius: 12px;
          padding: 4px;
        }

        .toggle-btn {
          padding: 8px 16px;
          background: none;
          border: none;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .toggle-btn:hover {
          background: #1e293b;
        }

        .toggle-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
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

        @media (max-width: 768px) {
          .chart-header {
            flex-direction: column;
            align-items: stretch;
          }

          .view-toggle {
            width: 100%;
          }

          .toggle-btn {
            flex: 1;
            font-size: 0.75rem;
          }
        }
      `}</style>
        </div>
    );
}
