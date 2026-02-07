'use client';

import { FaCheckCircle, FaClock, FaCircle } from 'react-icons/fa';

export default function MilestonesSection({ milestones = [], currentAmount = 0 }) {
  if (milestones.length === 0) {
    return null;
  }

  const getMilestoneStatus = (milestone) => {
    if (milestone.completed) return 'completed';
    if (currentAmount >= milestone.amount) return 'completed';
    if (currentAmount >= milestone.amount * 0.5) return 'in-progress';
    return 'not-started';
  };

  const getMilestoneProgress = (milestone) => {
    if (milestone.completed || currentAmount >= milestone.amount) return 100;
    const progress = (currentAmount / milestone.amount) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  return (
    <div className="milestones-section">
      <h3 className="milestones-title">Milestones</h3>

      <div className="milestones-list">
        {milestones.map((milestone, index) => {
          const status = getMilestoneStatus(milestone);
          const progress = getMilestoneProgress(milestone);

          return (
            <div key={index} className={`milestone-item ${status}`}>
              <div className="milestone-icon-wrapper">
                {status === 'completed' && <FaCheckCircle className="milestone-icon completed" />}
                {status === 'in-progress' && <FaClock className="milestone-icon in-progress" />}
                {status === 'not-started' && <FaCircle className="milestone-icon not-started" />}
              </div>

              <div className="milestone-content">
                <div className="milestone-header">
                  <h4 className="milestone-title">{milestone.title}</h4>
                  <span className="milestone-amount">
                    ₹{milestone.amount.toLocaleString('en-IN')}
                  </span>
                </div>

                {milestone.description && (
                  <p className="milestone-description">{milestone.description}</p>
                )}

                {status === 'in-progress' && (
                  <div className="milestone-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{Math.round(progress)}% reached</span>
                  </div>
                )}

                {milestone.completed && milestone.completedAt && (
                  <p className="milestone-completed-date">
                    Completed on {new Date(milestone.completedAt).toLocaleDateString('en-IN')}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .milestones-section {
          margin-top: 40px;
        }

        .milestones-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #f1f5f9;
          margin-bottom: 20px;
        }

        .milestones-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .milestone-item {
          display: flex;
          gap: 20px;
          padding: 24px;
          background: #1e293b;
          border: 2px solid #334155;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .milestone-item:hover {
          border-color: #475569;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .milestone-item.completed {
          background: linear-gradient(135deg, #1e3a2f 0%, #2d4a3f 100%);
          border-color: #10b981;
        }

        .milestone-item.in-progress {
          background: linear-gradient(135deg, #3a2e1e 0%, #4a3e2d 100%);
          border-color: #f59e0b;
        }

        .milestone-icon-wrapper {
          flex-shrink: 0;
          display: flex;
          align-items: flex-start;
          padding-top: 2px;
        }

        .milestone-icon {
          font-size: 1.5rem;
        }

        .milestone-icon.completed {
          color: #10b981;
        }

        .milestone-icon.in-progress {
          color: #f59e0b;
          animation: pulse 2s infinite;
        }

        .milestone-icon.not-started {
          color: #d1d5db;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .milestone-content {
          flex: 1;
        }

        .milestone-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 8px;
        }

        .milestone-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #f1f5f9;
          margin: 0;
          flex: 1;
        }

        .milestone-amount {
          font-size: 1rem;
          font-weight: 700;
          color: #667eea;
          white-space: nowrap;
        }

        .milestone-description {
          color: #94a3b8;
          line-height: 1.6;
          margin: 0 0 12px 0;
          font-size: 0.95rem;
        }

        .milestone-progress {
          margin-top: 12px;
        }

        .progress-bar {
          height: 8px;
          background: #0f172a;
          border-radius: 100px;
          overflow: hidden;
          margin-bottom: 6px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
          border-radius: 100px;
          transition: width 0.5s ease;
        }

        .progress-text {
          font-size: 0.85rem;
          color: #f59e0b;
          font-weight: 600;
        }

        .milestone-completed-date {
          font-size: 0.85rem;
          color: #10b981;
          font-weight: 500;
          margin: 8px 0 0 0;
        }

        @media (max-width: 640px) {
          .milestone-item {
            padding: 16px;
            gap: 12px;
          }

          .milestones-title {
            font-size: 1.25rem;
          }

          .milestone-icon {
            font-size: 1.25rem;
          }

          .milestone-header {
            flex-direction: column;
            gap: 8px;
          }

          .milestone-title {
            font-size: 1rem;
          }

          .milestone-amount {
            font-size: 0.9rem;
          }

          .milestone-description {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
}
