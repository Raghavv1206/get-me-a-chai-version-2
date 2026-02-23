// components/search/CampaignGrid.js
"use client"

/**
 * Campaign Grid Component
 * 
 * Features:
 * - Responsive grid (1-3 columns)
 * - Loading skeletons
 * - Infinite scroll with Intersection Observer
 * - Empty state (no results)
 * - Error handling
 * - Optimized rendering
 * 
 * @component
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, AlertCircle, Heart, Sparkles, Star, Search, BadgeCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Default cover image for campaigns without images
const DEFAULT_COVER_IMAGE = 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=400&fit=crop';

export default function CampaignGrid({
    campaigns = [],
    loading = false,
    error = null,
    hasMore = false,
    onLoadMore,
    viewMode = 'grid', // 'grid' or 'list'
    emptyMessage = 'No campaigns found',
    emptyDescription = 'Try adjusting your filters or search query',
}) {
    const [loadingMore, setLoadingMore] = useState(false);
    const observerRef = useRef(null);
    const loadMoreTriggerRef = useRef(null);

    // ========================================================================
    // INFINITE SCROLL SETUP
    // ========================================================================

    const handleLoadMore = useCallback(async () => {
        if (loadingMore || !hasMore || !onLoadMore) return;

        setLoadingMore(true);
        try {
            await onLoadMore();
        } catch (error) {
            console.error('Failed to load more campaigns:', error);
        } finally {
            setLoadingMore(false);
        }
    }, [loadingMore, hasMore, onLoadMore]);

    // ========================================================================
    // INTERSECTION OBSERVER
    // ========================================================================

    useEffect(() => {
        if (!hasMore || !loadMoreTriggerRef.current) return;

        const options = {
            root: null,
            rootMargin: '100px', // Start loading 100px before reaching the trigger
            threshold: 0.1,
        };

        observerRef.current = new IntersectionObserver((entries) => {
            const [entry] = entries;
            if (entry.isIntersecting && !loadingMore && hasMore) {
                handleLoadMore();
            }
        }, options);

        observerRef.current.observe(loadMoreTriggerRef.current);

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [hasMore, loadingMore, handleLoadMore]);

    // ========================================================================
    // RENDER ERROR STATE
    // ========================================================================

    if (error && !loading && campaigns.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="bg-red-50 dark:bg-red-900/20 rounded-full p-4 mb-4">
                    <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Something went wrong
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                    {error}
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-6 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    // ========================================================================
    // RENDER LOADING SKELETONS
    // ========================================================================

    if (loading && campaigns.length === 0) {
        return (
            <div className={`
                grid gap-6
                ${viewMode === 'grid'
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-1'
                }
            `}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <CampaignCardSkeleton key={i} viewMode={viewMode} />
                ))}
            </div>
        );
    }

    // ========================================================================
    // RENDER EMPTY STATE
    // ========================================================================

    if (!loading && campaigns.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="mb-4 flex justify-center"><Search className="w-14 h-14 text-gray-400" /></div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {emptyMessage}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                    {emptyDescription}
                </p>
            </div>
        );
    }

    // ========================================================================
    // RENDER CAMPAIGNS GRID
    // ========================================================================

    return (
        <div>
            <div className={`
                grid gap-6
                ${viewMode === 'grid'
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-1'
                }
            `}>
                {campaigns.map((campaign) => (
                    <CampaignCard
                        key={campaign._id || campaign.id}
                        campaign={campaign}
                        viewMode={viewMode}
                    />
                ))}
            </div>

            {/* Load More Trigger */}
            {hasMore && (
                <div
                    ref={loadMoreTriggerRef}
                    className="flex justify-center items-center py-8"
                >
                    {loadingMore && (
                        <div className="flex items-center gap-2 text-purple-600">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="text-sm font-medium">Loading more campaigns...</span>
                        </div>
                    )}
                </div>
            )}

            {/* End of Results */}
            {!hasMore && campaigns.length > 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p className="text-sm">You've reached the end of the results</p>
                </div>
            )}
        </div>
    );
}

// ============================================================================
// CAMPAIGN CARD COMPONENT
// ============================================================================

function CampaignCard({ campaign, viewMode }) {
    const [saved, setSaved] = useState(false);

    // Calculate progress percentage - defensive calculation to avoid NaN
    const raisedAmount = campaign.raisedAmount || campaign.currentAmount || 0;
    const goalAmount = campaign.goalAmount || 1; // Avoid division by zero
    const progress = Math.min((raisedAmount / goalAmount) * 100, 100);

    // Calculate days remaining
    const daysRemaining = campaign.endDate
        ? Math.max(0, Math.ceil((new Date(campaign.endDate) - new Date()) / (1000 * 60 * 60 * 24)))
        : null;
    const isEnded = campaign.status === 'completed' || daysRemaining === 0;

    const handleSave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setSaved(!saved);
        // TODO: Implement save functionality
    };

    if (viewMode === 'list') {
        return (
            <Link
                href={`/campaign/${campaign._id || campaign.id}`}
                className="group block bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
            >
                <div className="flex flex-col sm:flex-row">
                    {/* Image */}
                    <div className="relative w-full sm:w-64 h-48 sm:h-auto overflow-hidden bg-gray-200 dark:bg-gray-700">
                        <Image
                            src={campaign.coverImage || DEFAULT_COVER_IMAGE}
                            alt={campaign.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full hover:scale-110 transition-transform"
                            aria-label={saved ? 'Unsave campaign' : 'Save campaign'}
                        >
                            <Heart
                                className={`w-5 h-5 ${saved ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-400'}`}
                            />
                        </button>

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                            {campaign.aiGenerated && (
                                <span className="px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded-full">
                                    <Sparkles className="w-3 h-3 inline-block mr-0.5" /> AI
                                </span>
                            )}
                            {campaign.featured && (
                                <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
                                    <Star className="w-3 h-3 inline-block mr-0.5" /> Featured
                                </span>
                            )}
                            {campaign.verified && (
                                <span className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                                    <BadgeCheck className="w-3 h-3 inline-block mr-0.5" /> Verified
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                                    {campaign.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                    {campaign.description}
                                </p>
                            </div>
                        </div>

                        {/* Creator */}
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                {campaign.creatorName?.[0] || 'U'}
                            </div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                by {campaign.creatorName || 'Anonymous'}
                            </span>
                        </div>

                        {/* Progress */}
                        <div className="mb-4">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    ₹{raisedAmount.toLocaleString()}
                                </span>
                                <span className="text-gray-600 dark:text-gray-400">
                                    of ₹{goalAmount.toLocaleString()}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span>{progress.toFixed(0)}% funded</span>
                            <span>•</span>
                            <span>{campaign.supportersCount || 0} supporters</span>
                            {daysRemaining !== null && (
                                <>
                                    <span>•</span>
                                    <span className={isEnded ? 'text-red-500 dark:text-red-400 font-medium' : daysRemaining <= 7 ? 'text-orange-600 dark:text-orange-400 font-medium' : ''}>
                                        {isEnded ? 'Campaign Ended' : `${daysRemaining} days left`}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    // Grid view (default)
    return (
        <Link
            href={`/campaign/${campaign._id || campaign.id}`}
            className="group block bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
        >
            {/* Image */}
            <div className="relative w-full h-48 overflow-hidden bg-gray-200 dark:bg-gray-700">
                <Image
                    src={campaign.coverImage || DEFAULT_COVER_IMAGE}
                    alt={campaign.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full hover:scale-110 transition-transform"
                    aria-label={saved ? 'Unsave campaign' : 'Save campaign'}
                >
                    <Heart
                        className={`w-5 h-5 ${saved ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-400'}`}
                    />
                </button>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    {campaign.aiGenerated && (
                        <span className="px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded-full">
                            <Sparkles className="w-3 h-3 inline-block mr-0.5" /> AI
                        </span>
                    )}
                    {campaign.featured && (
                        <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
                            <Star className="w-3 h-3 inline-block mr-0.5" /> Featured
                        </span>
                    )}
                    {campaign.verified && (
                        <span className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                            <BadgeCheck className="w-3 h-3 inline-block mr-0.5" /> Verified
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                    {campaign.title}
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {campaign.description}
                </p>

                {/* Creator */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {campaign.creatorName?.[0] || 'U'}
                    </div>
                    <span className="text-xs text-gray-700 dark:text-gray-300">
                        {campaign.creatorName || 'Anonymous'}
                    </span>
                </div>

                {/* Progress */}
                <div className="mb-3">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                            ₹{raisedAmount.toLocaleString()}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 text-xs">
                            {progress.toFixed(0)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>{campaign.supportersCount || 0} supporters</span>
                    {daysRemaining !== null && (
                        <span className={isEnded ? 'text-red-500 dark:text-red-400 font-medium' : daysRemaining <= 7 ? 'text-orange-600 dark:text-orange-400 font-medium' : ''}>
                            {isEnded ? 'Campaign Ended' : `${daysRemaining} days left`}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function CampaignCardSkeleton({ viewMode }) {
    if (viewMode === 'list') {
        return (
            <div className="animate-pulse bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row">
                    <div className="w-full sm:w-64 h-48 sm:h-auto bg-gray-300 dark:bg-gray-700" />
                    <div className="flex-1 p-6">
                        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3" />
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2" />
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3 mb-4" />
                        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-4" />
                        <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded w-full mb-4" />
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-pulse bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="h-48 bg-gray-300 dark:bg-gray-700" />
            <div className="p-5">
                <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3" />
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2" />
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3 mb-4" />
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4" />
                <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded w-full mb-3" />
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
            </div>
        </div>
    );
}
