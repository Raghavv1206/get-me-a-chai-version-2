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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Campaigns</h1>
          <p className="text-gray-400 mt-1">Manage and track your campaigns</p>
        </div>
        <button
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105"
          onClick={() => window.location.href = '/dashboard/create-campaign'}
        >
          <FaPlus className="w-4 h-4" />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === 'all'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            onClick={() => setFilter('all')}
          >
            All ({counts.all})
          </button>
          <button
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === 'active'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            onClick={() => setFilter('active')}
          >
            Active ({counts.active})
          </button>
          <button
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === 'paused'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            onClick={() => setFilter('paused')}
          >
            Paused ({counts.paused})
          </button>
          <button
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === 'completed'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            onClick={() => setFilter('completed')}
          >
            Completed ({counts.completed})
          </button>
          <button
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === 'drafts'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            onClick={() => setFilter('drafts')}
          >
            Drafts ({counts.drafts})
          </button>
        </div>

        {/* Sort and View Controls */}
        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          >
            <option value="recent" className="bg-gray-900">Most Recent</option>
            <option value="oldest" className="bg-gray-900">Oldest First</option>
            <option value="most-funded" className="bg-gray-900">Most Funded</option>
          </select>

          <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-xl">
            <button
              className={`p-2 rounded-lg text-sm transition-all ${viewMode === 'grid'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <FaThLarge className="w-4 h-4" />
            </button>
            <button
              className={`p-2 rounded-lg text-sm transition-all ${viewMode === 'list'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <FaList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Campaigns Grid/List */}
      {sortedCampaigns.length === 0 ? (
        <div className="text-center py-20 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
          <div className="text-6xl mb-6">📋</div>
          <h3 className="text-2xl font-bold text-white mb-3">No campaigns found</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            {filter === 'all'
              ? "You haven't created any campaigns yet."
              : `You don't have any ${filter} campaigns.`
            }
          </p>
          <button
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105"
            onClick={() => window.location.href = '/dashboard/create-campaign'}
          >
            <FaPlus className="w-4 h-4" />
            <span>Create Your First Campaign</span>
          </button>
        </div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
            : 'flex flex-col gap-4'
        }>
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
    </div>
  );
}
