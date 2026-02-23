'use client';

import { useState, useEffect, useRef } from 'react';
import { Trophy } from 'lucide-react';

export default function ProgressBar({
  current,
  goal,
  milestones = [],
  animated = true
}) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const progressRef = useRef(null);

  const percentage = Math.min((current / goal) * 100, 100);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (progressRef.current) {
      observer.observe(progressRef.current);
    }

    return () => {
      if (progressRef.current) {
        observer.unobserve(progressRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible || !animated) {
      setProgress(percentage);
      return;
    }

    const duration = 1500;
    const steps = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const currentProgress = (percentage / steps) * currentStep;
      setProgress(Math.min(currentProgress, percentage));

      if (currentStep >= steps) {
        clearInterval(interval);
        setProgress(percentage);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [isVisible, percentage, animated]);

  const getProgressColor = () => {
    if (percentage >= 100) return '#10b981'; // Green
    if (percentage >= 75) return '#3b82f6'; // Blue
    if (percentage >= 50) return '#f59e0b'; // Orange
    return '#667eea'; // Purple
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="progress-bar-container" ref={progressRef}>
      <div className="progress-info">
        <div className="progress-amounts">
          <span className="current-amount">{formatCurrency(current)}</span>
          <span className="goal-amount">of {formatCurrency(goal)}</span>
        </div>
        <div className="progress-percentage">
          {Math.round(progress)}%
        </div>
      </div>

      <div className="progress-bar-wrapper">
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${getProgressColor()} 0%, ${getProgressColor()}dd 100%)`
            }}
          >
            <div className="progress-bar-shine"></div>
          </div>

          {/* Milestone markers */}
          {milestones.map((milestone, index) => {
            const milestonePercentage = (milestone.amount / goal) * 100;
            if (milestonePercentage > 100) return null;

            return (
              <div
                key={index}
                className="milestone-marker"
                style={{ left: `${milestonePercentage}%` }}
                title={`${milestone.title}: ${formatCurrency(milestone.amount)}`}
              >
                <div className={`milestone-dot ${progress >= milestonePercentage ? 'reached' : ''}`}></div>
              </div>
            );
          })}
        </div>
      </div>

      {percentage >= 100 && (
        <div className="goal-reached-badge">
          <Trophy className="w-5 h-5 inline-block mr-1" /> Goal Reached!
        </div>
      )}

      <style jsx>{`
        .progress-bar-container {
          width: 100%;
        }

        .progress-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .progress-amounts {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .current-amount {
          font-size: 1.5rem;
          font-weight: 700;
          color: #f1f5f9;
        }

        .goal-amount {
          font-size: 0.9rem;
          color: #94a3b8;
        }

        .progress-percentage {
          font-size: 1.75rem;
          font-weight: 700;
          color: ${getProgressColor()};
        }

        .progress-bar-wrapper {
          position: relative;
          margin-bottom: 8px;
        }

        .progress-bar-track {
          position: relative;
          width: 100%;
          height: 16px;
          background: #0f172a;
          border-radius: 100px;
          overflow: hidden;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .progress-bar-fill {
          height: 100%;
          border-radius: 100px;
          transition: width 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .progress-bar-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.3) 50%,
            transparent 100%
          );
          animation: shine 2s infinite;
        }

        @keyframes shine {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }

        .milestone-marker {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          z-index: 10;
        }

        .milestone-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #1e293b;
          border: 3px solid #475569;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .milestone-dot:hover {
          transform: scale(1.3);
        }

        .milestone-dot.reached {
          border-color: ${getProgressColor()};
          background: ${getProgressColor()};
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
        }

        .goal-reached-badge {
          display: inline-block;
          padding: 8px 16px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          margin-top: 12px;
          animation: bounceIn 0.6s ease;
        }

        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @media (max-width: 640px) {
          .current-amount {
            font-size: 1.25rem;
          }

          .progress-percentage {
            font-size: 1.5rem;
          }

          .progress-bar-track {
            height: 12px;
          }

          .milestone-dot {
            width: 10px;
            height: 10px;
            border-width: 2px;
          }
        }
      `}</style>
    </div>
  );
}
