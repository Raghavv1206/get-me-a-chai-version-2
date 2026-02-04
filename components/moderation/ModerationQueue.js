// components/moderation/ModerationQueue.js
"use client"

/**
 * Moderation Queue Component
 * 
 * Features:
 * - List of flagged content
 * - Campaigns, comments, updates
 * - AI moderation scores
 * - Human review interface
 * - Filter by type and risk level
 * - Bulk actions
 * 
 * @component
 */

import { useState } from 'react';
import { AlertTriangle, Check, X, Eye, Flag, Shield, TrendingUp } from 'lucide-react';
import { reviewFlaggedContent } from '@/actions/moderationActions';
import Link from 'next/link';

export default function ModerationQueue({ items, onRefresh }) {
    const [filter, setFilter] = useState('all'); // all, high, medium, low
    const [typeFilter, setTypeFilter] = useState('all'); // all, campaign, comment, update
    const [actionLoading, setActionLoading] = useState(null);

    const handleReview = async (itemId, itemType, action) => {
        setActionLoading(`${itemId}-${action}`);

        try {
            // Get admin ID from session (you'll need to pass this)
            const adminId = 'admin-id-placeholder'; // TODO: Get from session

            const result = await reviewFlaggedContent(itemId, itemType, action, adminId);

            if (result.success) {
                alert(result.message);
                if (onRefresh) onRefresh();
            } else {
                alert(result.error);
            }
        } catch (error) {
            console.error('Review error:', error);
            alert('Failed to review content');
        } finally {
            setActionLoading(null);
        }
    };

    // Filter items
    const filteredItems = items?.filter(item => {
        // Filter by risk level
        if (filter === 'high' && item.riskScore < 70) return false;
        if (filter === 'medium' && (item.riskScore < 50 || item.riskScore >= 70)) return false;
        if (filter === 'low' && item.riskScore >= 50) return false;

        // Filter by type
        if (typeFilter !== 'all' && item.type !== typeFilter) return false;

        return true;
    }) || [];

    const getRiskColor = (score) => {
        if (score >= 70) return 'text-red-600 dark:text-red-400';
        if (score >= 50) return 'text-orange-600 dark:text-orange-400';
        return 'text-yellow-600 dark:text-yellow-400';
    };

    const getRiskBg = (score) => {
        if (score >= 70) return 'bg-red-100 dark:bg-red-900/30';
        if (score >= 50) return 'bg-orange-100 dark:bg-orange-900/30';
        return 'bg-yellow-100 dark:bg-yellow-900/30';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Shield className="w-6 h-6 text-purple-600" />
                        Moderation Queue
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {filteredItems.length} items pending review
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
                {/* Risk Level Filter */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('high')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'high'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                    >
                        High Risk (70+)
                    </button>
                    <button
                        onClick={() => setFilter('medium')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'medium'
                                ? 'bg-orange-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                    >
                        Medium Risk (50-69)
                    </button>
                    <button
                        onClick={() => setFilter('low')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'low'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                    >
                        Low Risk (&lt;50)
                    </button>
                </div>

                {/* Type Filter */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setTypeFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${typeFilter === 'all'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                    >
                        All Types
                    </button>
                    <button
                        onClick={() => setTypeFilter('campaign')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${typeFilter === 'campaign'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                    >
                        Campaigns
                    </button>
                </div>
            </div>

            {/* Queue Items */}
            <div className="space-y-4">
                {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                        <QueueItem
                            key={item._id}
                            item={item}
                            onReview={handleReview}
                            actionLoading={actionLoading}
                        />
                    ))
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-12 border border-gray-200 dark:border-gray-700 text-center">
                        <Shield className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No Items in Queue
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            All content has been reviewed or no flagged content found
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Queue Item Component
 */
function QueueItem({ item, onReview, actionLoading }) {
    const [expanded, setExpanded] = useState(false);
    const isLoading = (action) => actionLoading === `${item._id}-${action}`;

    const getRiskColor = (score) => {
        if (score >= 70) return 'text-red-600 dark:text-red-400';
        if (score >= 50) return 'text-orange-600 dark:text-orange-400';
        return 'text-yellow-600 dark:text-yellow-400';
    };

    const getRiskBg = (score) => {
        if (score >= 70) return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700';
        if (score >= 50) return 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700';
        return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700';
    };

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 border-2 ${getRiskBg(item.riskScore)} hover:shadow-lg transition-all`}>
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Content Info */}
                <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${getRiskBg(item.riskScore)}`}>
                            <AlertTriangle className={`w-5 h-5 ${getRiskColor(item.riskScore)}`} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                {item.title || 'Untitled Content'}
                            </h3>
                            <div className="flex flex-wrap gap-2 mb-2">
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full">
                                    {item.type}
                                </span>
                                <span className={`px-2 py-1 ${getRiskBg(item.riskScore)} ${getRiskColor(item.riskScore)} text-xs font-medium rounded-full`}>
                                    Risk: {item.riskScore}/100
                                </span>
                                {item.flagCount > 0 && (
                                    <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium rounded-full flex items-center gap-1">
                                        <Flag className="w-3 h-3" />
                                        {item.flagCount} {item.flagCount === 1 ? 'flag' : 'flags'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Content Preview */}
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                        {item.description || item.content || 'No description available'}
                    </p>

                    {/* AI Scores */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                        <ScoreBadge label="Inappropriate" score={item.scores?.inappropriate || 0} />
                        <ScoreBadge label="Spam" score={item.scores?.spam || 0} />
                        <ScoreBadge label="Scam" score={item.scores?.scam || 0} />
                        <ScoreBadge label="Prohibited" score={item.scores?.prohibited || 0} />
                    </div>

                    {/* Reasons */}
                    {item.reasons && item.reasons.length > 0 && (
                        <div className="mb-3">
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                AI Detection Reasons:
                            </div>
                            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                {item.reasons.map((reason, idx) => (
                                    <li key={idx}>{reason}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* User Flags */}
                    {item.flags && item.flags.length > 0 && (
                        <div>
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline"
                            >
                                {expanded ? 'Hide' : 'Show'} user reports ({item.flags.length})
                            </button>
                            {expanded && (
                                <div className="mt-2 space-y-2">
                                    {item.flags.map((flag, idx) => (
                                        <div key={idx} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 text-sm">
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {flag.reason}
                                            </div>
                                            <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                                                Reported {new Date(flag.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2 lg:w-48">
                    {item.type === 'campaign' && (
                        <Link
                            href={`/campaign/${item._id}`}
                            target="_blank"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                        >
                            <Eye className="w-4 h-4" />
                            View
                        </Link>
                    )}

                    <button
                        onClick={() => onReview(item._id, item.type, 'approve')}
                        disabled={isLoading('approve')}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                        <Check className="w-4 h-4" />
                        {isLoading('approve') ? 'Approving...' : 'Approve'}
                    </button>

                    <button
                        onClick={() => onReview(item._id, item.type, 'remove')}
                        disabled={isLoading('remove')}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                        <X className="w-4 h-4" />
                        {isLoading('remove') ? 'Removing...' : 'Remove'}
                    </button>

                    <button
                        onClick={() => {
                            if (confirm('This will ban the user and remove all their content. Continue?')) {
                                onReview(item._id, item.type, 'ban_user');
                            }
                        }}
                        disabled={isLoading('ban_user')}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                        <Shield className="w-4 h-4" />
                        {isLoading('ban_user') ? 'Banning...' : 'Ban User'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/**
 * Score Badge Component
 */
function ScoreBadge({ label, score }) {
    const getColor = () => {
        if (score >= 70) return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
        if (score >= 50) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
        if (score >= 30) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
    };

    return (
        <div className={`px-3 py-2 rounded-lg ${getColor()} text-center`}>
            <div className="text-xs font-medium">{label}</div>
            <div className="text-lg font-bold">{score}</div>
        </div>
    );
}
