// components/recommendations/RecommendationCard.js
"use client"
import Link from 'next/link';
import { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

/**
 * RecommendationCard Component
 * 
 * Displays a campaign card with match score, progress bar, and campaign details.
 * Optimized for performance with memoization and proper error handling.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.campaign - Campaign data object
 * @param {string} props.campaign.username - Creator username
 * @param {string} props.campaign.title - Campaign title
 * @param {string} props.campaign.category - Campaign category
 * @param {number} props.campaign.matchScore - AI match score (0-100)
 * @param {string} props.campaign.reason - Reason for recommendation
 * @param {string} [props.campaign.coverImage] - Cover image URL
 * @param {number} props.campaign.currentAmount - Current funding amount
 * @param {number} props.campaign.goalAmount - Goal funding amount
 * @param {Object} [props.campaign.stats] - Campaign statistics
 * @param {number} [props.campaign.stats.supporters] - Number of supporters
 */
export default function RecommendationCard({ campaign }) {
    // Input validation
    if (!campaign || typeof campaign !== 'object') {
        console.error('[RecommendationCard] Invalid campaign prop:', campaign);
        return null;
    }

    // Destructure with defaults for safety
    const {
        username = '',
        title = 'Untitled Campaign',
        category = 'General',
        matchScore = 0,
        reason = 'Recommended for you',
        coverImage = null,
        currentAmount = 0,
        goalAmount = 1,
        stats = {}
    } = campaign;

    // Validate required fields
    if (!username || typeof username !== 'string') {
        console.error('[RecommendationCard] Invalid or missing username:', username);
        return null;
    }

    // State management
    const [showTooltip, setShowTooltip] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Memoized calculations
    const progress = useMemo(() => {
        // Ensure valid numbers and prevent division by zero
        const current = typeof currentAmount === 'number' && currentAmount >= 0 ? currentAmount : 0;
        const goal = typeof goalAmount === 'number' && goalAmount > 0 ? goalAmount : 1;

        return Math.min((current / goal) * 100, 100);
    }, [currentAmount, goalAmount]);

    const supportersCount = useMemo(() => {
        return typeof stats?.supporters === 'number' && stats.supporters >= 0
            ? stats.supporters
            : 0;
    }, [stats?.supporters]);

    // Memoized helper functions
    const getMatchColor = useCallback((score) => {
        const validScore = typeof score === 'number' ? score : 0;
        if (validScore >= 80) return 'text-green-400';
        if (validScore >= 60) return 'text-yellow-400';
        return 'text-blue-400';
    }, []);

    const formatAmount = useCallback((amount) => {
        const validAmount = typeof amount === 'number' && amount >= 0 ? amount : 0;
        return validAmount.toLocaleString('en-IN');
    }, []);

    // Event handlers
    const handleTooltipShow = useCallback(() => setShowTooltip(true), []);
    const handleTooltipHide = useCallback(() => setShowTooltip(false), []);

    const handleImageError = useCallback((e) => {
        console.warn(`[RecommendationCard] Failed to load image for campaign: ${username}`);
        setImageError(true);
        e.target.src = 'https://via.placeholder.com/400x300?text=Campaign';
    }, [username]);

    // Determine image source with fallback
    const imageSrc = useMemo(() => {
        if (imageError) {
            return 'https://via.placeholder.com/400x300?text=Campaign';
        }
        return coverImage || 'https://via.placeholder.com/400x300?text=No+Image';
    }, [coverImage, imageError]);

    // Sanitize username for URL (basic sanitization)
    const sanitizedUsername = useMemo(() => {
        return username.trim().replace(/[^a-zA-Z0-9_-]/g, '');
    }, [username]);

    // Validate match score range
    const validMatchScore = useMemo(() => {
        const score = typeof matchScore === 'number' ? matchScore : 0;
        return Math.max(0, Math.min(100, score));
    }, [matchScore]);

    return (
        <Link
            href={`/${sanitizedUsername}`}
            aria-label={`View campaign: ${title} by ${username}`}
        >
            <article
                className="group relative bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all hover:scale-105 cursor-pointer"
                role="article"
                aria-labelledby={`campaign-title-${sanitizedUsername}`}
            >
                {/* Match Score Badge */}
                <div className="absolute top-3 right-3 z-10">
                    <div
                        className="relative"
                        onMouseEnter={handleTooltipShow}
                        onMouseLeave={handleTooltipHide}
                        onFocus={handleTooltipShow}
                        onBlur={handleTooltipHide}
                        role="button"
                        tabIndex={0}
                        aria-label={`Match score: ${validMatchScore}%`}
                        aria-describedby={showTooltip ? `tooltip-${sanitizedUsername}` : undefined}
                    >
                        <div className={`px-3 py-1 bg-gray-900/90 backdrop-blur-sm rounded-full flex items-center gap-1 ${getMatchColor(validMatchScore)}`}>
                            <span className="text-xs font-bold">{validMatchScore}%</span>
                            <span className="text-xs" aria-hidden="true">✨</span>
                        </div>

                        {/* Tooltip */}
                        {showTooltip && (
                            <div
                                id={`tooltip-${sanitizedUsername}`}
                                className="absolute top-full right-0 mt-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-20"
                                role="tooltip"
                            >
                                {reason || 'Recommended for you'}
                                <div
                                    className="absolute bottom-full right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"
                                    aria-hidden="true"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Cover Image */}
                <div className="h-48 overflow-hidden bg-gray-700">
                    <img
                        src={imageSrc}
                        alt={`Cover image for ${title}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={handleImageError}
                        loading="lazy"
                    />
                </div>

                {/* Content */}
                <div className="p-4">
                    {/* Category */}
                    <span
                        className="inline-block px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full mb-2"
                        aria-label={`Category: ${category}`}
                    >
                        {category}
                    </span>

                    {/* Title */}
                    <h3
                        id={`campaign-title-${sanitizedUsername}`}
                        className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors"
                    >
                        {title}
                    </h3>

                    {/* Creator */}
                    <p className="text-sm text-gray-400 mb-3">
                        by @{username}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-3" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                                aria-label={`${progress.toFixed(1)}% funded`}
                            />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-between text-sm">
                        <div>
                            <p className="text-white font-semibold">
                                ₹{formatAmount(currentAmount)}
                            </p>
                            <p className="text-gray-500 text-xs">
                                of ₹{formatAmount(goalAmount)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-white font-semibold">
                                {supportersCount}
                            </p>
                            <p className="text-gray-500 text-xs">
                                {supportersCount === 1 ? 'supporter' : 'supporters'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Hover Overlay */}
                <div
                    className="absolute inset-0 bg-gradient-to-t from-purple-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    aria-hidden="true"
                />
            </article>
        </Link>
    );
}

// PropTypes for development-time validation
RecommendationCard.propTypes = {
    campaign: PropTypes.shape({
        username: PropTypes.string.isRequired,
        title: PropTypes.string,
        category: PropTypes.string,
        matchScore: PropTypes.number,
        reason: PropTypes.string,
        coverImage: PropTypes.string,
        currentAmount: PropTypes.number,
        goalAmount: PropTypes.number,
        stats: PropTypes.shape({
            supporters: PropTypes.number,
        }),
    }).isRequired,
};

