'use client';

import { useState, useEffect, useRef } from 'react';
import { FaRupeeSign, FaUsers, FaBullhorn, FaTrophy } from 'react-icons/fa';

export default function StatsBar({ totalRaised, supporters, campaignsCount, successRate }) {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({
    totalRaised: 0,
    supporters: 0,
    campaignsCount: 0,
    successRate: 0
  });
  const statsRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedStats({
        totalRaised: Math.floor(totalRaised * progress),
        supporters: Math.floor(supporters * progress),
        campaignsCount: Math.floor(campaignsCount * progress),
        successRate: Math.floor(successRate * progress)
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedStats({
          totalRaised,
          supporters,
          campaignsCount,
          successRate
        });
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [isVisible, totalRaised, supporters, campaignsCount, successRate]);

  const formatCurrency = (amount) => {
    if (amount === 0) {
      return '₹0';
    } else if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const stats = [
    {
      icon: FaRupeeSign,
      label: 'Total Raised',
      value: formatCurrency(animatedStats.totalRaised),
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      icon: FaUsers,
      label: 'Supporters',
      value: animatedStats.supporters.toLocaleString(),
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    {
      icon: FaBullhorn,
      label: 'Campaigns',
      value: animatedStats.campaignsCount,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    },
    {
      icon: FaTrophy,
      label: 'Success Rate',
      value: `${animatedStats.successRate}%`,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)'
    }
  ];

  return (
    <div className="stats-bar" ref={statsRef}>
      <div className="stats-container">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="stat-item"
            style={{
              animationDelay: `${index * 0.1}s`,
              opacity: isVisible ? 1 : 0
            }}
          >
            <div
              className="stat-icon-wrapper"
              style={{
                backgroundColor: stat.bgColor,
                color: stat.color
              }}
            >
              <stat.icon className="stat-icon" />
            </div>
            <div className="stat-content">
              <div className="stat-value" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .stats-bar {
          background: #1e293b;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          padding: 30px;
          margin: 30px 20px;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stats-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 30px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          border-radius: 12px;
          transition: all 0.3s ease;
          animation: fadeInUp 0.6s ease forwards;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .stat-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .stat-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          border-radius: 12px;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .stat-item:hover .stat-icon-wrapper {
          transform: scale(1.1) rotate(5deg);
        }

        .stat-icon {
          font-size: 1.5rem;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 0.9rem;
          color: #94a3b8;
          font-weight: 500;
        }

        @media (max-width: 1024px) {
          .stats-container {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
        }

        @media (max-width: 640px) {
          .stats-bar {
            padding: 20px;
            margin: 20px 15px;
          }

          .stats-container {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .stat-item {
            padding: 12px;
          }

          .stat-icon-wrapper {
            width: 50px;
            height: 50px;
          }

          .stat-icon {
            font-size: 1.25rem;
          }

          .stat-value {
            font-size: 1.5rem;
          }

          .stat-label {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
}
