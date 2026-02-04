'use client';

export default function ConversionFunnel({ data }) {
    const steps = data.steps || [
        { name: 'Views', value: data.views || 0, color: '#3b82f6' },
        { name: 'Clicks', value: data.clicks || 0, color: '#10b981' },
        { name: 'Donations', value: data.donations || 0, color: '#f59e0b' }
    ];

    const maxValue = Math.max(...steps.map(s => s.value));

    const calculateDropoff = (current, next) => {
        if (!next || current === 0) return 0;
        return (((current - next) / current) * 100).toFixed(1);
    };

    return (
        <div className="conversion-funnel">
            <h3 className="funnel-title">Conversion Funnel</h3>
            <p className="funnel-subtitle">Track visitor journey from view to donation</p>

            <div className="funnel-container">
                {steps.map((step, index) => {
                    const width = (step.value / maxValue) * 100;
                    const dropoff = calculateDropoff(step.value, steps[index + 1]?.value);
                    const conversionRate = ((step.value / steps[0].value) * 100).toFixed(1);

                    return (
                        <div key={step.name} className="funnel-step">
                            <div className="step-header">
                                <span className="step-name">{step.name}</span>
                                <div className="step-stats">
                                    <span className="step-value">{step.value.toLocaleString()}</span>
                                    {index > 0 && (
                                        <span className="step-rate">{conversionRate}%</span>
                                    )}
                                </div>
                            </div>

                            <div className="step-bar-container">
                                <div
                                    className="step-bar"
                                    style={{
                                        width: `${width}%`,
                                        backgroundColor: step.color
                                    }}
                                >
                                    <span className="bar-label">{step.value.toLocaleString()}</span>
                                </div>
                            </div>

                            {index < steps.length - 1 && dropoff > 0 && (
                                <div className="dropoff-indicator">
                                    <span className="dropoff-arrow">↓</span>
                                    <span className="dropoff-text">{dropoff}% drop-off</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="funnel-summary">
                <div className="summary-item">
                    <span className="summary-label">Overall Conversion Rate</span>
                    <span className="summary-value">
                        {((steps[steps.length - 1].value / steps[0].value) * 100).toFixed(2)}%
                    </span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">Total Conversions</span>
                    <span className="summary-value">{steps[steps.length - 1].value.toLocaleString()}</span>
                </div>
            </div>

            <style jsx>{`
        .conversion-funnel {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 30px;
        }

        .funnel-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 4px 0;
        }

        .funnel-subtitle {
          font-size: 0.9rem;
          color: #6b7280;
          margin: 0 0 24px 0;
        }

        .funnel-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 24px;
        }

        .funnel-step {
          position: relative;
        }

        .step-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .step-name {
          font-size: 0.95rem;
          font-weight: 600;
          color: #374151;
        }

        .step-stats {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .step-value {
          font-size: 1.1rem;
          font-weight: 700;
          color: #111827;
        }

        .step-rate {
          font-size: 0.85rem;
          font-weight: 600;
          color: #10b981;
          background: #f0fdf4;
          padding: 4px 10px;
          border-radius: 12px;
        }

        .step-bar-container {
          width: 100%;
          height: 50px;
          background: #f3f4f6;
          border-radius: 10px;
          overflow: hidden;
          position: relative;
        }

        .step-bar {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 16px;
          transition: width 0.5s ease;
          position: relative;
        }

        .bar-label {
          color: white;
          font-weight: 700;
          font-size: 0.95rem;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .dropoff-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
          color: #ef4444;
        }

        .dropoff-arrow {
          font-size: 1.2rem;
        }

        .dropoff-text {
          font-size: 0.85rem;
          font-weight: 600;
        }

        .funnel-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          padding-top: 24px;
          border-top: 2px solid #f3f4f6;
        }

        .summary-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .summary-label {
          font-size: 0.85rem;
          color: #6b7280;
        }

        .summary-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
        }

        @media (max-width: 768px) {
          .step-bar-container {
            height: 40px;
          }

          .bar-label {
            font-size: 0.85rem;
          }

          .summary-value {
            font-size: 1.25rem;
          }
        }
      `}</style>
        </div>
    );
}
