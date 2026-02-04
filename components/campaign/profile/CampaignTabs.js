'use client';

import { useState } from 'react';

export default function CampaignTabs({
    activeTab: initialTab = 'about',
    onTabChange,
    children
}) {
    const [activeTab, setActiveTab] = useState(initialTab);

    const tabs = [
        { id: 'about', label: 'About', icon: '📖' },
        { id: 'updates', label: 'Updates', icon: '📢' },
        { id: 'supporters', label: 'Supporters', icon: '❤️' },
        { id: 'discussion', label: 'Discussion', icon: '💬' }
    ];

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
        if (onTabChange) {
            onTabChange(tabId);
        }
    };

    return (
        <div className="campaign-tabs">
            <div className="tabs-header">
                <div className="tabs-nav">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => handleTabClick(tab.id)}
                        >
                            <span className="tab-icon">{tab.icon}</span>
                            <span className="tab-label">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="tabs-content">
                {children}
            </div>

            <style jsx>{`
        .campaign-tabs {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .tabs-header {
          position: sticky;
          top: 70px;
          background: white;
          z-index: 20;
          padding: 20px 0 0;
          margin-bottom: 30px;
          border-bottom: 2px solid #f3f4f6;
        }

        .tabs-nav {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .tabs-nav::-webkit-scrollbar {
          display: none;
        }

        .tab-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          color: #6b7280;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
          position: relative;
        }

        .tab-button:hover {
          color: #374151;
          background: #f9fafb;
          border-radius: 8px 8px 0 0;
        }

        .tab-button.active {
          color: #667eea;
          border-bottom-color: #667eea;
        }

        .tab-button.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          border-radius: 3px 3px 0 0;
        }

        .tab-icon {
          font-size: 1.2rem;
          line-height: 1;
        }

        .tab-label {
          line-height: 1;
        }

        .tabs-content {
          animation: fadeIn 0.4s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .campaign-tabs {
            padding: 0 15px;
          }

          .tabs-header {
            top: 60px;
            padding: 15px 0 0;
            margin-bottom: 20px;
          }

          .tab-button {
            padding: 10px 16px;
            font-size: 0.9rem;
          }

          .tab-icon {
            font-size: 1rem;
          }

          .tab-label {
            display: none;
          }

          .tab-button {
            flex-direction: column;
            gap: 4px;
          }

          .tab-icon {
            display: block;
          }
        }
      `}</style>
        </div>
    );
}
