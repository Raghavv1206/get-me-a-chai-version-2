'use client';

import { useState } from 'react';
import CampaignListCard from './CampaignListCard';
import { FaThLarge, FaList, FaPlus } from 'react-icons/fa';

export default function CampaignsList({ campaigns: initialCampaigns, onUpdate }) {
    const [campaigns, setCampaigns] = useState(initialCampaigns);
    const [filter, setFilter] = useState('all'); // all, active, paused, completed, drafts
    const [sortBy, setSortBy] = useState('recent'); // recent, oldest, most-funded
    const [viewMode, setViewMode] = useState('grid'); // grid, list

    // Filter campaigns
    const filteredCampaigns = campaigns.filter(campaign => {
        if (filter === 'all') return true;
        if (filter === 'drafts') return campaign.status === 'draft';
        if (filter === 'active') return campaign.status === 'active';
        if (filter === 'paused') return campaign.status === 'paused';
        if (filter === 'completed') return campaign.status === 'completed';
        return true;
    });

    // Sort campaigns
    const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
        if (sortBy === 'recent') {
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
        if (sortBy === 'oldest') {
            return new Date(a.createdAt) - new Date(b.createdAt);
        }
        if (sortBy === 'most-funded') {
            return (b.currentAmount || 0) - (a.currentAmount || 0);
        }
        return 0;
    });

    const handleCampaignUpdate = (updatedCampaign) => {
        setCampaigns(prev =>
            prev.map(c => c._id === updatedCampaign._id ? updatedCampaign : c)
        );
        if (onUpdate) onUpdate(updatedCampaign);
    };

    const handleCampaignDelete = (campaignId) => {
        setCampaigns(prev => prev.filter(c => c._id !== campaignId));
    };

    const getCounts = () => ({
        all: campaigns.length,
        active: campaigns.filter(c => c.status === 'active').length,
        paused: campaigns.filter(c => c.status === 'paused').length,
        completed: campaigns.filter(c => c.status === 'completed').length,
        drafts: campaigns.filter(c => c.status === 'draft').length
    });

    const counts = getCounts();

    return (
        <div className="campaigns-list">
            <div className="list-header">
                <div className="header-top">
                    <h2 className="list-title">My Campaigns</h2>
                    <button
                        className="btn-create"
                        onClick={() => window.location.href = '/dashboard/create-campaign'}
                    >
                        <FaPlus /> Create Campaign
                    </button>
                </div>

                <div className="header-controls">
                    {/* Filters */}
                    <div className="filter-tabs">
                        <button
                            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All ({counts.all})
                        </button>
                        <button
                            className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
                            onClick={() => setFilter('active')}
                        >
                            Active ({counts.active})
                        </button>
                        <button
                            className={`filter-tab ${filter === 'paused' ? 'active' : ''}`}
                            onClick={() => setFilter('paused')}
                        >
                            Paused ({counts.paused})
                        </button>
                        <button
                            className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
                            onClick={() => setFilter('completed')}
                        >
                            Completed ({counts.completed})
                        </button>
                        <button
                            className={`filter-tab ${filter === 'drafts' ? 'active' : ''}`}
                            onClick={() => setFilter('drafts')}
                        >
                            Drafts ({counts.drafts})
                        </button>
                    </div>

                    {/* Sort and View */}
                    <div className="controls-right">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="sort-select"
                        >
                            <option value="recent">Most Recent</option>
                            <option value="oldest">Oldest First</option>
                            <option value="most-funded">Most Funded</option>
                        </select>

                        <div className="view-toggle">
                            <button
                                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                                title="Grid View"
                            >
                                <FaThLarge />
                            </button>
                            <button
                                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                onClick={() => setViewMode('list')}
                                title="List View"
                            >
                                <FaList />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {sortedCampaigns.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h3>No campaigns found</h3>
                    <p>
                        {filter === 'all'
                            ? "You haven't created any campaigns yet."
                            : `You don't have any ${filter} campaigns.`
                        }
                    </p>
                    <button
                        className="btn-create-empty"
                        onClick={() => window.location.href = '/dashboard/create-campaign'}
                    >
                        <FaPlus /> Create Your First Campaign
                    </button>
                </div>
            ) : (
                <div className={`campaigns-${viewMode}`}>
                    {sortedCampaigns.map(campaign => (
                        <CampaignListCard
                            key={campaign._id}
                            campaign={campaign}
                            viewMode={viewMode}
                            onUpdate={handleCampaignUpdate}
                            onDelete={handleCampaignDelete}
                        />
                    ))}
                </div>
            )}

            <style jsx>{`
        .campaigns-list {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .list-header {
          margin-bottom: 30px;
        }

        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .list-title {
          font-size: 2rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }

        .btn-create {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-create:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .header-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .filter-tabs {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .filter-tab {
          padding: 10px 20px;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 600;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-tab:hover {
          border-color: #d1d5db;
          background: #f9fafb;
        }

        .filter-tab.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: #667eea;
        }

        .controls-right {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .sort-select {
          padding: 10px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 600;
          color: #374151;
          cursor: pointer;
          background: white;
          transition: all 0.3s ease;
        }

        .sort-select:hover {
          border-color: #d1d5db;
        }

        .sort-select:focus {
          outline: none;
          border-color: #667eea;
        }

        .view-toggle {
          display: flex;
          gap: 4px;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 4px;
        }

        .view-btn {
          padding: 8px 12px;
          background: none;
          border: none;
          border-radius: 8px;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1.1rem;
        }

        .view-btn:hover {
          background: #f3f4f6;
        }

        .view-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .campaigns-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 24px;
        }

        .campaigns-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
        }

        .empty-icon {
          font-size: 5rem;
          margin-bottom: 20px;
        }

        .empty-state h3 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 12px 0;
        }

        .empty-state p {
          font-size: 1.05rem;
          color: #6b7280;
          margin: 0 0 24px 0;
        }

        .btn-create-empty {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1.05rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-create-empty:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        @media (max-width: 1024px) {
          .campaigns-grid {
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .campaigns-list {
            padding: 20px 15px;
          }

          .list-title {
            font-size: 1.5rem;
          }

          .header-top {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .btn-create {
            width: 100%;
            justify-content: center;
          }

          .header-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-tabs {
            flex-direction: column;
          }

          .filter-tab {
            width: 100%;
          }

          .controls-right {
            flex-direction: column;
            align-items: stretch;
          }

          .sort-select {
            width: 100%;
          }

          .campaigns-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
}
