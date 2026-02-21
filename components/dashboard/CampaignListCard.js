'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FaEllipsisV, FaEdit, FaEye, FaPause, FaPlay, FaChartLine, FaTrash, FaCopy } from 'react-icons/fa';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { apiToast } from '@/lib/apiToast';
import { calculateDaysLeft } from '@/lib/campaignUtils';

// Default cover image for campaigns without images
const DEFAULT_COVER_IMAGE = 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=400&fit=crop';

export default function CampaignListCard({ campaign, viewMode = 'grid', onUpdate, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showMenu && menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const getStatusStyles = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'paused':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'draft':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusLabel = (status) => {
    if (status === 'completed') return 'Ended';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const calculateProgress = () => {
    if (!campaign.goalAmount) return 0;
    return Math.min(((campaign.currentAmount || 0) / campaign.goalAmount) * 100, 100);
  };

  const handleAction = async (action) => {
    setShowMenu(false);
    setIsProcessing(true);

    try {
      switch (action) {
        case 'edit':
          window.location.href = `/dashboard/campaigns/${campaign._id}/edit`;
          break;

        case 'view':
          window.location.href = `/campaign/${campaign._id}`;
          break;

        case 'pause':
        case 'resume': {
          const newStatus = action === 'pause' ? 'paused' : 'active';
          const response = await apiToast(
            () => fetch(`/api/campaigns/${campaign._id}/status`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: newStatus })
            }),
            {
              loading: action === 'pause' ? 'Pausing campaign...' : 'Resuming campaign...',
              success: action === 'pause' ? 'Campaign paused!' : 'Campaign resumed!',
              error: `Failed to ${action} campaign`
            }
          );

          if (response.ok) {
            onUpdate({ ...campaign, status: newStatus });
          }
          break;
        }

        case 'analytics':
          window.location.href = `/dashboard/campaigns/${campaign._id}/analytics`;
          break;

        case 'delete':
          setShowDeleteModal(true);
          break;

        case 'duplicate': {
          const dupResponse = await apiToast(
            () => fetch(`/api/campaigns/${campaign._id}/duplicate`, {
              method: 'POST'
            }),
            {
              loading: 'Duplicating campaign...',
              success: 'Campaign duplicated!',
              error: 'Failed to duplicate campaign'
            }
          );

          if (dupResponse.ok) {
            const data = await dupResponse.json();
            window.location.href = `/dashboard/campaigns/${data.campaign._id}/edit`;
          }
          break;
        }
      }
    } catch (error) {
      console.error('Error performing action:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      const response = await apiToast(
        () => fetch(`/api/campaigns/${campaign._id}/delete`, {
          method: 'DELETE'
        }),
        {
          loading: 'Deleting campaign...',
          success: 'Campaign deleted successfully!',
          error: 'Failed to delete campaign'
        }
      );

      if (response.ok) {
        onDelete(campaign._id);
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const progress = calculateProgress();
  const daysRemaining = calculateDaysLeft(campaign.endDate);

  return (
    <>
      <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl transition-all hover:bg-white/10 hover:border-white/20 ${viewMode === 'grid' ? 'flex flex-col' : 'flex flex-col md:flex-row'
        } ${showMenu ? 'z-[100] relative' : 'relative'}`} style={{ overflow: 'visible' }}>
        {/* Thumbnail */}
        <div className={`relative bg-gray-800 flex-shrink-0 overflow-hidden ${viewMode === 'grid' ? 'w-full h-48 rounded-t-2xl' : 'w-full md:w-48 h-48 md:h-auto md:rounded-l-2xl'
          }`}>
          <Image
            src={campaign.coverImage || DEFAULT_COVER_IMAGE}
            alt={campaign.title}
            fill
            className="object-cover"
            sizes={viewMode === 'grid' ? '350px' : '200px'}
          />
          <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-md ${getStatusStyles(campaign.status)}`}>
            {getStatusLabel(campaign.status)}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-bold text-white line-clamp-2 flex-1 pr-2">
              {campaign.title}
            </h3>

            {/* Actions Menu */}
            <div className="relative">
              <button
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                onClick={() => setShowMenu(!showMenu)}
              >
                <FaEllipsisV className="w-4 h-4" />
              </button>

              {showMenu && (
                <div ref={menuRef} className="absolute top-full right-0 mt-2 w-56 bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100]">
                  {/* Edit */}
                  <button
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all"
                    onClick={() => handleAction('edit')}
                    disabled={isProcessing}
                  >
                    <FaEdit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>

                  {/* View */}
                  <button
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all"
                    onClick={() => handleAction('view')}
                    disabled={isProcessing}
                  >
                    <FaEye className="w-4 h-4" />
                    <span>View</span>
                  </button>

                  {/* Non-draft options: Pause/Resume, Analytics, Duplicate */}
                  {campaign.status !== 'draft' && (
                    <>
                      {campaign.status === 'active' && (
                        <button
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all"
                          onClick={() => handleAction('pause')}
                          disabled={isProcessing}
                        >
                          <FaPause className="w-4 h-4" />
                          <span>Pause</span>
                        </button>
                      )}
                      {campaign.status === 'paused' && (
                        <button
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all"
                          onClick={() => handleAction('resume')}
                          disabled={isProcessing}
                        >
                          <FaPlay className="w-4 h-4" />
                          <span>Resume</span>
                        </button>
                      )}

                      {/* Divider */}
                      <div className="border-t border-white/10 my-1"></div>

                      {/* Analytics */}
                      <button
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all"
                        onClick={() => handleAction('analytics')}
                        disabled={isProcessing}
                      >
                        <FaChartLine className="w-4 h-4" />
                        <span>Analytics</span>
                      </button>

                      {/* Duplicate */}
                      <button
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all"
                        onClick={() => handleAction('duplicate')}
                        disabled={isProcessing}
                      >
                        <FaCopy className="w-4 h-4" />
                        <span>Duplicate</span>
                      </button>
                    </>
                  )}

                  {/* Divider */}
                  <div className="border-t border-white/10 my-1"></div>

                  {/* Delete */}
                  <button
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/20 transition-all"
                    onClick={() => handleAction('delete')}
                    disabled={isProcessing}
                  >
                    <FaTrash className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-bold text-purple-400">
                ₹{(campaign.currentAmount || 0).toLocaleString('en-IN')}
              </span>
              <span className="text-gray-500">
                of ₹{campaign.goalAmount.toLocaleString('en-IN')}
              </span>
              <span className="ml-auto font-semibold text-gray-300">
                {progress.toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-auto">
            <div className="text-center">
              <div className="text-xl font-bold text-white">
                {campaign.stats?.supporters || 0}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Supporters
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">
                {campaign.stats?.views || 0}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Views
              </div>
            </div>
            <div className="text-center">
              <div className={`text-xl font-bold ${campaign.status === 'completed' || daysRemaining === 0 ? 'text-red-400' : 'text-white'}`}>
                {campaign.status === 'completed' || daysRemaining === 0 ? 'Ended' : daysRemaining}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {campaign.status === 'completed' || daysRemaining === 0 ? 'Campaign Ended' : 'Days Left'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          campaign={campaign}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          isProcessing={isProcessing}
        />
      )}
    </>
  );
}
