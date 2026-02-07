'use client';

export default function PeakHoursAnalysis({ data }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getIntensityColor = (value) => {
    if (value === 0) return '#0f172a';
    if (value < 20) return '#312e81';
    if (value < 40) return '#4c1d95';
    if (value < 60) return '#6d28d9';
    if (value < 80) return '#8b5cf6';
    return '#a78bfa';
  };

  const getIntensityLabel = (value) => {
    if (value === 0) return 'No activity';
    if (value < 20) return 'Very low';
    if (value < 40) return 'Low';
    if (value < 60) return 'Medium';
    if (value < 80) return 'High';
    return 'Very high';
  };

  return (
    <div className="peak-hours-analysis">
      <h3 className="analysis-title">Peak Hours Analysis</h3>
      <p className="analysis-subtitle">Best times to post and engage</p>

      <div className="heatmap-container">
        <div className="heatmap-grid">
          {/* Hour labels */}
          <div className="hour-labels">
            <div className="corner-cell"></div>
            {hours.map(hour => (
              <div key={hour} className="hour-label">
                {hour.toString().padStart(2, '0')}
              </div>
            ))}
          </div>

          {/* Day rows */}
          {days.map((day, dayIndex) => (
            <div key={day} className="day-row">
              <div className="day-label">{day}</div>
              {hours.map((hour) => {
                const value = data[dayIndex]?.[hour] || 0;

                return (
                  <div
                    key={`${day}-${hour}`}
                    className="heat-cell"
                    style={{ backgroundColor: getIntensityColor(value) }}
                    title={`${day} ${hour}:00 - ${getIntensityLabel(value)} (${value}%)`}
                  >
                    {value > 0 && <span className="cell-value">{value}</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="legend">
        <span className="legend-label">Engagement Level:</span>
        <div className="legend-scale">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#f3f4f6' }}></div>
            <span>None</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#ddd6fe' }}></div>
            <span>Low</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#a78bfa' }}></div>
            <span>Medium</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#7c3aed' }}></div>
            <span>High</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .peak-hours-analysis {
          background: #1e293b;
          border: 2px solid #334155;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 30px;
        }

        .analysis-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 4px 0;
        }

        .analysis-subtitle {
          font-size: 0.9rem;
          color: #94a3b8;
          margin: 0 0 24px 0;
        }

        .heatmap-container {
          overflow-x: auto;
          margin-bottom: 20px;
        }

        .heatmap-grid {
          display: inline-block;
          min-width: 100%;
        }

        .hour-labels {
          display: grid;
          grid-template-columns: 60px repeat(24, 30px);
          gap: 2px;
          margin-bottom: 2px;
        }

        .corner-cell {
          width: 60px;
        }

        .hour-label {
          font-size: 0.7rem;
          color: #94a3b8;
          text-align: center;
          padding: 4px 0;
        }

        .day-row {
          display: grid;
          grid-template-columns: 60px repeat(24, 30px);
          gap: 2px;
          margin-bottom: 2px;
        }

        .day-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #e2e8f0;
          display: flex;
          align-items: center;
          padding-right: 8px;
        }

        .heat-cell {
          width: 30px;
          height: 30px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .heat-cell:hover {
          transform: scale(1.1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          z-index: 1;
        }

        .cell-value {
          font-size: 0.7rem;
          font-weight: 600;
          color: white;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .legend {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #0f172a;
          border-radius: 12px;
        }

        .legend-label {
          font-size: 0.9rem;
          font-weight: 600;
          color: #e2e8f0;
        }

        .legend-scale {
          display: flex;
          gap: 12px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .legend-color {
          width: 20px;
          height: 20px;
          border-radius: 4px;
          border: 1px solid #334155;
        }

        .legend-item span {
          font-size: 0.85rem;
          color: #94a3b8;
        }

        @media (max-width: 768px) {
          .hour-label {
            font-size: 0.6rem;
          }

          .day-label {
            font-size: 0.75rem;
          }

          .heat-cell {
            width: 25px;
            height: 25px;
          }

          .legend {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
