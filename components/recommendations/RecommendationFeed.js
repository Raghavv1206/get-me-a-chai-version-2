// components/recommendations/RecommendationFeed.js
"use client"
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import RecommendationCard from './RecommendationCard';

/**
 * RecommendationFeed Component
 * 
 * Displays AI-powered campaign recommendations based on user interests and activity.
 * Features automatic retry, error handling, and loading states.
 * 
 * @returns {JSX.Element|null} Recommendation feed or null if not authenticated
 */
export default function RecommendationFeed() {
    const { data: session, status } = useSession();
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 2000;

    /**
     * Fetch recommendations from API with error handling and retry logic
     */
    const fetchRecommendations = useCallback(async (isRetry = false) => {
        // Don't fetch if not authenticated
        if (!session) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            const response = await fetch('/api/ai/recommendations', {
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.message || `HTTP ${response.status}: Failed to fetch recommendations`
                );
            }

            const data = await response.json();

            // Validate response structure
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid response format');
            }

            const recs = Array.isArray(data.recommendations) ? data.recommendations : [];
            setRecommendations(recs);
            setRetryCount(0); // Reset retry count on success
            setError(null);
        } catch (err) {
            console.error('[RecommendationFeed] Error fetching recommendations:', err);

            // Handle different error types
            let errorMessage = 'Failed to load recommendations';

            if (err.name === 'AbortError') {
                errorMessage = 'Request timed out. Please try again.';
            } else if (err.message?.includes('fetch')) {
                errorMessage = 'Network error. Please check your connection.';
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);

            // Automatic retry logic for network errors
            if (!isRetry && retryCount < MAX_RETRIES && err.name !== 'AbortError') {
                const newRetryCount = retryCount + 1;
                setRetryCount(newRetryCount);

                console.log(`[RecommendationFeed] Retrying... (${newRetryCount}/${MAX_RETRIES})`);

                setTimeout(() => {
                    fetchRecommendations(true);
                }, RETRY_DELAY_MS * newRetryCount); // Exponential backoff
            }
        } finally {
            setLoading(false);
        }
    }, [session, retryCount]);

    // Fetch recommendations when session becomes available
    useEffect(() => {
        if (status === 'authenticated' && session) {
            fetchRecommendations();
        }
    }, [status, session, fetchRecommendations]);

    // Manual refresh handler
    const handleRefresh = useCallback(() => {
        setRetryCount(0); // Reset retry count on manual refresh
        fetchRecommendations();
    }, [fetchRecommendations]);

    // Don't render if not authenticated
    if (status === 'unauthenticated' || !session) {
        return null;
    }

    return (
        <section className="py-8" aria-labelledby="recommendations-heading">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2
                        id="recommendations-heading"
                        className="text-2xl font-bold text-white flex items-center gap-2"
                    >
                        <span aria-hidden="true">✨</span> Recommended For You
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                        Based on your interests and activity
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    aria-label="Refresh recommendations"
                >
                    <svg
                        className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                    </svg>
                    Refresh
                </button>
            </div>

            {/* Loading State */}
            {loading && (
                <div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    role="status"
                    aria-live="polite"
                    aria-label="Loading recommendations"
                >
                    {[1, 2, 3].map(i => (
                        <div
                            key={i}
                            className="h-80 bg-gray-800 rounded-xl animate-pulse"
                            aria-hidden="true"
                        />
                    ))}
                </div>
            )}

            {/* Error State */}
            {!loading && error && (
                <div
                    className="text-center py-12 bg-red-900/20 border border-red-500/50 rounded-xl"
                    role="alert"
                    aria-live="assertive"
                >
                    <div className="text-red-400 mb-4">
                        <svg
                            className="w-12 h-12 mx-auto mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <p className="font-semibold">{error}</p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Recommendations Grid */}
            {!loading && !error && recommendations.length > 0 && (
                <div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    role="list"
                    aria-label="Recommended campaigns"
                >
                    {recommendations.map((campaign) => (
                        <div key={campaign._id || campaign.id} role="listitem">
                            <RecommendationCard campaign={campaign} />
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && recommendations.length === 0 && (
                <div className="text-center py-12 bg-gray-800 rounded-xl">
                    <div className="text-6xl mb-4" aria-hidden="true">🔍</div>
                    <p className="text-gray-400 text-lg font-medium mb-2">
                        No recommendations available yet.
                    </p>
                    <p className="text-sm text-gray-500">
                        Support some campaigns to get personalized recommendations!
                    </p>
                </div>
            )}
        </section>
    );
}

