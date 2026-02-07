'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function SupporterDemographics({ data }) {
  const donationDistribution = data.donationDistribution || [];
  const supporterTypes = data.supporterTypes || [];
  const avgBySource = data.avgBySource || [];

  const COLORS = ['#667eea', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="supporter-demographics">
      <h3 className="demographics-title">Supporter Demographics</h3>

      <div className="demographics-grid">
        {/* Donation Amount Distribution */}
        <div className="demo-card">
          <h4 className="card-title">Donation Amount Distribution</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={donationDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {donationDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="distribution-legend">
            {donationDistribution.map((item, index) => (
              <div key={item.range} className="legend-item">
                <div
                  className="legend-dot"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="legend-text">{item.range}: {item.count} supporters</span>
              </div>
            ))}
          </div>
        </div>

        {/* First-time vs Repeat */}
        <div className="demo-card">
          <h4 className="card-title">Supporter Types</h4>
          <div className="supporter-types">
            {supporterTypes.map((type, index) => (
              <div key={type.name} className="type-item">
                <div className="type-header">
                  <span className="type-name">{type.name}</span>
                  <span className="type-count">{type.count}</span>
                </div>
                <div className="type-bar-container">
                  <div
                    className="type-bar"
                    style={{
                      width: `${type.percentage}%`,
                      backgroundColor: COLORS[index]
                    }}
                  ></div>
                </div>
                <span className="type-percentage">{type.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Average Donation by Source */}
        <div className="demo-card full-width">
          <h4 className="card-title">Average Donation by Source</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={avgBySource}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="source"
                stroke="#94a3b8"
                style={{ fontSize: '0.85rem', fill: '#94a3b8' }}
              />
              <YAxis
                stroke="#94a3b8"
                style={{ fontSize: '0.85rem', fill: '#94a3b8' }}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip
                formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                contentStyle={{
                  background: '#1e293b',
                  border: '2px solid #334155',
                  borderRadius: '12px',
                  padding: '12px'
                }}
              />
              <Bar dataKey="avgAmount" fill="#667eea" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <style jsx>{`
        .supporter-demographics {
          background: #1e293b;
          border: 2px solid #334155;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 30px;
        }

        .demographics-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 24px 0;
        }

        .demographics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .demo-card {
          background: #0f172a;
          border-radius: 12px;
          padding: 20px;
        }

        .demo-card.full-width {
          grid-column: 1 / -1;
        }

        .card-title {
          font-size: 1rem;
          font-weight: 600;
          color: #e2e8f0;
          margin: 0 0 16px 0;
        }

        .distribution-legend {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 16px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .legend-text {
          font-size: 0.85rem;
          color: #94a3b8;
        }

        .supporter-types {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .type-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .type-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .type-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: #e2e8f0;
        }

        .type-count {
          font-size: 0.9rem;
          font-weight: 700;
          color: #f1f5f9;
        }

        .type-bar-container {
          width: 100%;
          height: 8px;
          background: #1e293b;
          border-radius: 4px;
          overflow: hidden;
        }

        .type-bar {
          height: 100%;
          transition: width 0.5s ease;
        }

        .type-percentage {
          font-size: 0.85rem;
          color: #94a3b8;
        }

        @media (max-width: 768px) {
          .demographics-grid {
            grid-template-columns: 1fr;
          }

          .demo-card.full-width {
            grid-column: 1;
          }
        }
      `}</style>
    </div>
  );
}
