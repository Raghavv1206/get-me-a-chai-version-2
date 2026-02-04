// components/admin/CampaignModeration.js
"use client"

/**
 * Campaign Moderation Component
 * 
 * Features:
 * - Queue of pending campaigns
 * - Flagged campaigns
 * - Approve/reject/remove actions
 * - Feature campaign
 * - Campaign details modal
 * 
 * @component
 */

import { useState } from 'react';
import { Flag, Check, X, Star, Eye, AlertTriangle } from 'lucide-react';
import { moderateCampaign, featureCampaign } from '@/actions/adminActions';
import Link from 'next/link';

export default function CampaignModeration({ campaigns, onRefresh }) {
    const [actionLoading, setActionLoading] = useState(null);
    const [filter, setFilter] = useState('all'); // all, pending, flagged

    const handleModerate = async (campaignId, action) => {
        setActionLoading(`${campaignId}-${action}`);

        try {
            let reason = '';
            if (action === 'reject' || action === 'remove') {
                reason = prompt(`Enter reason for ${action}:`);
                if (!reason) {
                    setActionLoading(null);
                    return;
                }
            }

            const result = await moderateCampaign(campaignId, action, reason);

            if (result.success) {
                alert(result.message);
                if (onRefresh) onRefresh();
            } else {
                alert(result.error);
            }
        } catch (error) {
            console.error('Moderation error:', error);
            alert('Failed to moderate campaign');
        } finally {
            setActionLoading(null);
        }
    };

    const handleFeature = async (campaignId) => {
        const duration = prompt('Enter featured duration (days):', '7');
        if (!duration) return;

        setActionLoading(`${campaignId}-feature`);

        try {
            const result = await featureCampaign(campaignId, parseInt(duration));

            if (result.success) {
                alert(result.message);
                if (onRefresh) onRefresh();
            } else {
                alert(result.error);
            }
        } catch (error) {
            console.error('Feature error:', error);
            alert('Failed to feature campaign');
        } finally {
            setActionLoading(null);
        }
    };

    const filteredCampaigns = campaigns?.filter(c => {
        if (filter === 'pending') return c.status === 'pending';
        if (filter === 'flagged') return c.flagged;
        return true;
    }) || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Campaign Moderation
                </h2>

                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                    >
                        All ({campaigns?.length || 0})
                    </button>
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'pending'
                                ? 'bg-orange-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                    >
                        Pending ({campaigns?.filter(c => c.status === 'pending').length || 0})
                    </button>
                    <button
                        onClick={() => setFilter('flagged')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'flagged'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                    >
                        Flagged ({campaigns?.filter(c => c.flagged).length || 0})
                    </button>
                </div>
            </div>

            {/* Campaigns List */}
            <div className="space-y-4">
                {filteredCampaigns.length > 0 ? (
                    filteredCampaigns.map((campaign) => (
                        <CampaignCard
                            key={campaign._id}
                            campaign={campaign}
                            onModerate={handleModerate}
                            onFeature={handleFeature}
                            actionLoading={actionLoading}
                        />
                    ))
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-12 border border-gray-200 dark:border-gray-700 text-center">
                        <p className="text-gray-500 dark:text-gray-400">
                            No campaigns to moderate
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Campaign Card Component
 */
function CampaignCard({ campaign, onModerate, onFeature, actionLoading }) {
    const isLoading = (action) => actionLoading === `${campaign._id}-${action}`;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Campaign Info */}
                <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
                            {campaign.title}
                        </h3>
                        <div className="flex gap-2">
                            {campaign.status === 'pending' && (
                                <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium rounded-full">
                                    Pending
                                </span>
                            )}
                            {campaign.flagged && (
                                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium rounded-full flex items-center gap-1">
                                    <Flag className="w-3 h-3" />
                                    Flagged
                                </span>
                            )}
                            {campaign.featured && (
                                <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs font-medium rounded-full flex items-center gap-1">
                                    <Star className="w-3 h-3" />
                                    Featured
                                </span>
                            )}
                        </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                        {campaign.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                            <span className="font-medium">Goal:</span> ₹{campaign.goal?.toLocaleString()}
                        </div>
                        <div>
                            <span className="font-medium">Raised:</span> ₹{campaign.raised?.toLocaleString() || 0}
                        </div>
                        <div>
                            <span className="font-medium">Creator:</span> {campaign.creator?.name || 'Unknown'}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex md:flex-col gap-2">
                    <Link
                        href={`/campaign/${campaign._id}`}
                        target="_blank"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                    >
                        <Eye className="w-4 h-4" />
                        View
                    </Link>

                    {campaign.status === 'pending' && (
                        <>
                            <button
                                onClick={() => onModerate(campaign._id, 'approve')}
                                disabled={isLoading('approve')}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                            >
                                <Check className="w-4 h-4" />
                                {isLoading('approve') ? 'Approving...' : 'Approve'}
                            </button>
                            <button
                                onClick={() => onModerate(campaign._id, 'reject')}
                                disabled={isLoading('reject')}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
                            >
                                <X className="w-4 h-4" />
                                {isLoading('reject') ? 'Rejecting...' : 'Reject'}
                            </button>
                        </>
                    )}

                    {campaign.status === 'active' && (
                        <>
                            <button
                                onClick={() => onFeature(campaign._id)}
                                disabled={isLoading('feature')}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium disabled:opacity-50"
                            >
                                <Star className="w-4 h-4" />
                                {isLoading('feature') ? 'Featuring...' : 'Feature'}
                            </button>
                            <button
                                onClick={() => onModerate(campaign._id, 'remove')}
                                disabled={isLoading('remove')}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
                            >
                                <AlertTriangle className="w-4 h-4" />
                                {isLoading('remove') ? 'Removing...' : 'Remove'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
