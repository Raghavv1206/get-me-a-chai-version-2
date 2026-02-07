// app/explore/page.js
"use client"

/**
 * Enhanced Explore Page
 * 
 * Features:
 * - Advanced search with AI
 * - Filter sidebar with all options
 * - Campaign grid with infinite scroll
 * - Sort options
 * - View toggle (grid/list)
 * - Responsive design
 * - Loading states
 * - Error handling
 * 
 * @page
 */

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Filter, X } from 'lucide-react';
import AdvancedSearch from '@/components/search/AdvancedSearch';
import FilterSidebar from '@/components/search/FilterSidebar';
import CampaignGrid from '@/components/search/CampaignGrid';
import SortOptions from '@/components/search/SortOptions';
import ViewToggle from '@/components/search/ViewToggle';

export default function ExplorePage() {
    const { data: session } = useSession();

    // ========================================================================
    // STATE
    // ========================================================================

    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        category: [],
        minGoal: '',
        maxGoal: '',
        status: '',
        aiGenerated: false,
        featured: false,
        verified: false,
        hasVideo: false,
        endingSoon: false,
    });
    const [sortBy, setSortBy] = useState('trending');
    const [viewMode, setViewMode] = useState('grid');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [totalResults, setTotalResults] = useState(0);
    const [showFilters, setShowFilters] = useState(false); // Mobile filter toggle

    // ========================================================================
    // FETCH CAMPAIGNS
    // ========================================================================

    const fetchCampaigns = useCallback(async (resetPage = false) => {
        try {
            const currentPage = resetPage ? 1 : page;
            setLoading(true);
            setError(null);

            // Build query parameters
            const params = new URLSearchParams();

            // Add search query if exists
            if (searchQuery) {
                params.append('q', searchQuery);
            }

            // Add filters
            if (filters.category?.length > 0) {
                params.append('category', filters.category.join(','));
            }
            if (filters.location) {
                params.append('location', filters.location);
            }
            if (filters.minGoal) {
                params.append('minGoal', filters.minGoal);
            }
            if (filters.maxGoal) {
                params.append('maxGoal', filters.maxGoal);
            }
            if (filters.status) {
                params.append('status', filters.status);
            }
            if (filters.aiGenerated) {
                params.append('aiGenerated', 'true');
            }
            if (filters.featured) {
                params.append('featured', 'true');
            }
            if (filters.verified) {
                params.append('verified', 'true');
            }
            if (filters.hasVideo) {
                params.append('hasVideo', 'true');
            }
            if (filters.endingSoon) {
                params.append('endingSoon', 'true');
            }

            // Add sort and pagination
            params.append('sort', sortBy);
            params.append('page', currentPage.toString());
            params.append('limit', '12');

            if (session?.user?.id) {
                params.append('userId', session.user.id);
            }

            // Choose endpoint based on whether we have a search query
            const endpoint = searchQuery
                ? `/api/search?${params.toString()}`
                : `/api/campaigns/filter?${params.toString()}`;

            const response = await fetch(endpoint);
            const data = await response.json();

            if (data.success) {
                if (resetPage) {
                    setCampaigns(data.campaigns || []);
                } else {
                    setCampaigns(prev => [...prev, ...(data.campaigns || [])]);
                }

                setTotalResults(data.total || 0);
                setHasMore(data.hasMore || false);

                if (!resetPage) {
                    setPage(currentPage + 1);
                }
            } else {
                throw new Error(data.error || 'Failed to fetch campaigns');
            }
        } catch (err) {
            console.error('Error fetching campaigns:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, filters, sortBy, page, session]);

    // ========================================================================
    // INITIAL LOAD
    // ========================================================================

    useEffect(() => {
        fetchCampaigns(true);
    }, [searchQuery, filters, sortBy]); // Reset when search/filters/sort change

    // ========================================================================
    // HANDLERS
    // ========================================================================

    const handleSearch = (query) => {
        setSearchQuery(query);
        setPage(1);
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setPage(1);
    };

    const handleClearFilters = () => {
        setFilters({
            category: [],
            minGoal: '',
            maxGoal: '',
            status: '',
            aiGenerated: false,
            featured: false,
            verified: false,
            hasVideo: false,
            endingSoon: false,
        });
        setPage(1);
    };

    const handleSortChange = (newSort) => {
        setSortBy(newSort);
        setPage(1);
    };

    const handleViewChange = (newView) => {
        setViewMode(newView);
    };

    const handleLoadMore = async () => {
        await fetchCampaigns(false);
    };

    // Count active filters
    const activeFilterCount = Object.values(filters).filter(v =>
        Array.isArray(v) ? v.length > 0 : Boolean(v)
    ).length;

    // ========================================================================
    // RENDER
    // ========================================================================

    return (
        <div className="min-h-screen bg-black text-gray-100">
            {/* Background Ambient Effects */}
            <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />
            <div className="fixed bottom-0 left-20 w-[400px] h-[400px] bg-blue-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />

            <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 pt-24 relative">
                {/* Header */}
                <div className="mb-8 sm:mb-12">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
                        🔍 Explore Campaigns
                    </h1>
                    <p className="text-base sm:text-lg text-gray-400">
                        Discover amazing projects and support creators
                    </p>
                </div>

                {/* Search Bar */}
                <div className="mb-8">
                    <AdvancedSearch
                        onSearch={handleSearch}
                        initialQuery={searchQuery}
                        placeholder="Search campaigns, creators, or categories..."
                    />
                </div>

                {/* Controls Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    {/* Left: Results Count */}
                    <div className="text-sm text-gray-400">
                        {loading && campaigns.length === 0 ? (
                            <span>Loading campaigns...</span>
                        ) : (
                            <span>
                                {totalResults.toLocaleString()} campaign{totalResults !== 1 ? 's' : ''} found
                                {searchQuery && ` for "${searchQuery}"`}
                            </span>
                        )}
                    </div>

                    {/* Right: Sort & View Controls */}
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {/* Mobile Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-gray-800 border-2 border-gray-700 rounded-lg text-sm font-medium hover:border-purple-600 transition-colors text-white"
                        >
                            <Filter className="w-4 h-4" />
                            <span>Filters</span>
                            {activeFilterCount > 0 && (
                                <span className="px-2 py-0.5 bg-purple-900/30 text-purple-300 text-xs font-medium rounded-full">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>

                        <SortOptions value={sortBy} onChange={handleSortChange} />
                        <ViewToggle value={viewMode} onChange={handleViewChange} />
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    {/* Filter Sidebar */}
                    <aside className={`
                        lg:w-80 lg:flex-shrink-0
                        ${showFilters ? 'block' : 'hidden lg:block'}
                    `}>
                        <div className="lg:sticky lg:top-24">
                            {/* Mobile Close Button */}
                            <div className="lg:hidden flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                    Filters
                                </h2>
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <FilterSidebar
                                filters={filters}
                                onFilterChange={handleFilterChange}
                                onClearAll={handleClearFilters}
                            />
                        </div>
                    </aside>

                    {/* Campaign Grid */}
                    <main className="flex-1 min-w-0">
                        <CampaignGrid
                            campaigns={campaigns}
                            loading={loading}
                            error={error}
                            hasMore={hasMore}
                            onLoadMore={handleLoadMore}
                            viewMode={viewMode}
                            emptyMessage={searchQuery ? `No campaigns found for "${searchQuery}"` : 'No campaigns found'}
                            emptyDescription={
                                searchQuery
                                    ? 'Try adjusting your search query or filters'
                                    : 'Try adjusting your filters or check back later'
                            }
                        />
                    </main>
                </div>
            </div>

            {/* Mobile Filter Overlay */}
            {showFilters && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setShowFilters(false)}
                />
            )}
        </div>
    );
}
