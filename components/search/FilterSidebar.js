// components/search/FilterSidebar.js
"use client"

/**
 * Enhanced Filter Sidebar Component
 * 
 * Features:
 * - All filters from Phase 4
 * - New filters (AI-generated, featured, verified, has video, ending soon)
 * - Filter count badges
 * - Sticky sidebar
 * - Clear all filters
 * - Active filter indicators
 * - Responsive design
 * 
 * @component
 */

import { useState, useEffect } from 'react';
import {
    Filter, X, ChevronDown, ChevronUp, Sparkles, Star,
    CheckCircle, Video, Clock, DollarSign, Tag
} from 'lucide-react';
import { useScrollIsolation } from '../../hooks/useScrollIsolation';

const CATEGORIES = [
    'Technology',
    'Art',
    'Music',
    'Film',
    'Games',
    'Food',
    'Fashion',
    'Education',
    'Health',
    'Environment',
    'Community',
    'Other',
];

const STATUS_OPTIONS = [
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
];

export default function FilterSidebar({
    filters = {},
    onFilterChange,
    onClearAll,
    className = ''
}) {
    const [expandedSections, setExpandedSections] = useState({
        category: true,
        goal: true,
        status: true,
        special: true,
    });

    const scrollRef = useScrollIsolation();

    const [localFilters, setLocalFilters] = useState({
        category: [],
        minGoal: '',
        maxGoal: '',
        status: '',
        aiGenerated: false,
        featured: false,
        verified: false,
        hasVideo: false,
        endingSoon: false,
        ...filters,
    });

    // ========================================================================
    // SYNC WITH PARENT FILTERS
    // ========================================================================

    useEffect(() => {
        setLocalFilters(prev => ({
            ...prev,
            ...filters,
        }));
    }, [filters]);

    // ========================================================================
    // TOGGLE SECTION
    // ========================================================================

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    // ========================================================================
    // HANDLE FILTER CHANGE
    // ========================================================================

    const handleFilterChange = (key, value) => {
        const newFilters = {
            ...localFilters,
            [key]: value,
        };

        setLocalFilters(newFilters);
        // Don't call onFilterChange here - only on Apply button click
    };

    // ========================================================================
    // HANDLE APPLY FILTERS
    // ========================================================================

    const handleApplyFilters = () => {
        if (onFilterChange) {
            onFilterChange(localFilters);
        }
    };

    // ========================================================================
    // HANDLE CATEGORY TOGGLE
    // ========================================================================

    const handleCategoryToggle = (category) => {
        const currentCategories = localFilters.category || [];
        const newCategories = currentCategories.includes(category)
            ? currentCategories.filter(c => c !== category)
            : [...currentCategories, category];

        handleFilterChange('category', newCategories);
    };

    // ========================================================================
    // HANDLE CLEAR ALL
    // ========================================================================

    const handleClearAll = () => {
        const clearedFilters = {
            category: [],
            minGoal: '',
            maxGoal: '',
            status: '',
            aiGenerated: false,
            featured: false,
            verified: false,
            hasVideo: false,
            endingSoon: false,
        };

        setLocalFilters(clearedFilters);

        if (onClearAll) {
            onClearAll();
        } else if (onFilterChange) {
            onFilterChange(clearedFilters);
        }
    };

    // ========================================================================
    // COUNT ACTIVE FILTERS
    // ========================================================================

    const getActiveFilterCount = () => {
        let count = 0;

        if (localFilters.category?.length > 0) count += localFilters.category.length;
        if (localFilters.minGoal) count++;
        if (localFilters.maxGoal) count++;
        if (localFilters.status) count++;
        if (localFilters.aiGenerated) count++;
        if (localFilters.featured) count++;
        if (localFilters.verified) count++;
        if (localFilters.hasVideo) count++;
        if (localFilters.endingSoon) count++;

        return count;
    };

    const activeCount = getActiveFilterCount();

    // ========================================================================
    // RENDER
    // ========================================================================

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg ${className}`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-purple-600" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Filters
                        </h3>
                        {activeCount > 0 && (
                            <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
                                {activeCount}
                            </span>
                        )}
                    </div>

                    {activeCount > 0 && (
                        <button
                            onClick={handleClearAll}
                            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        >
                            Clear all
                        </button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div ref={scrollRef} className="p-4 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">

                {/* ================================================================ */}
                {/* CATEGORY FILTER */}
                {/* ================================================================ */}

                <div>
                    <button
                        onClick={() => toggleSection('category')}
                        className="w-full flex items-center justify-between mb-3 group"
                    >
                        <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-900 dark:text-white">
                                Category
                            </span>
                            {localFilters.category?.length > 0 && (
                                <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded">
                                    {localFilters.category.length}
                                </span>
                            )}
                        </div>
                        {expandedSections.category ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                    </button>

                    {expandedSections.category && (
                        <div className="space-y-2">
                            {CATEGORIES.map(category => (
                                <label
                                    key={category}
                                    className="flex items-center gap-2 cursor-pointer group"
                                >
                                    <input
                                        type="checkbox"
                                        checked={localFilters.category?.includes(category)}
                                        onChange={() => handleCategoryToggle(category)}
                                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                                        {category}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* ================================================================ */}
                {/* GOAL RANGE FILTER */}
                {/* ================================================================ */}

                <div>
                    <button
                        onClick={() => toggleSection('goal')}
                        className="w-full flex items-center justify-between mb-3 group"
                    >
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-900 dark:text-white">
                                Goal Amount
                            </span>
                        </div>
                        {expandedSections.goal ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                    </button>

                    {expandedSections.goal && (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    Minimum (₹)
                                </label>
                                <input
                                    type="number"
                                    value={localFilters.minGoal}
                                    onChange={(e) => handleFilterChange('minGoal', e.target.value)}
                                    placeholder="0"
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    Maximum (₹)
                                </label>
                                <input
                                    type="number"
                                    value={localFilters.maxGoal}
                                    onChange={(e) => handleFilterChange('maxGoal', e.target.value)}
                                    placeholder="No limit"
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* ================================================================ */}
                {/* STATUS FILTER */}
                {/* ================================================================ */}

                <div>
                    <button
                        onClick={() => toggleSection('status')}
                        className="w-full flex items-center justify-between mb-3 group"
                    >
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-900 dark:text-white">
                                Status
                            </span>
                        </div>
                        {expandedSections.status ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                    </button>

                    {expandedSections.status && (
                        <div className="space-y-2">
                            {STATUS_OPTIONS.map(option => (
                                <label
                                    key={option.value}
                                    className="flex items-center gap-2 cursor-pointer group"
                                >
                                    <input
                                        type="radio"
                                        name="status"
                                        value={option.value}
                                        checked={localFilters.status === option.value}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                        className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                                        {option.label}
                                    </span>
                                </label>
                            ))}
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="status"
                                    value=""
                                    checked={!localFilters.status}
                                    onChange={() => handleFilterChange('status', '')}
                                    className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                                    All
                                </span>
                            </label>
                        </div>
                    )}
                </div>

                {/* ================================================================ */}
                {/* SPECIAL FILTERS (NEW) */}
                {/* ================================================================ */}

                <div>
                    <button
                        onClick={() => toggleSection('special')}
                        className="w-full flex items-center justify-between mb-3 group"
                    >
                        <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-900 dark:text-white">
                                Special Filters
                            </span>
                            {(localFilters.aiGenerated || localFilters.featured || localFilters.verified || localFilters.hasVideo || localFilters.endingSoon) && (
                                <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded">
                                    Active
                                </span>
                            )}
                        </div>
                        {expandedSections.special ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                    </button>

                    {expandedSections.special && (
                        <div className="space-y-3">
                            {/* AI Generated */}
                            <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={localFilters.aiGenerated}
                                    onChange={(e) => handleFilterChange('aiGenerated', e.target.checked)}
                                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <Sparkles className="w-4 h-4 text-purple-500" />
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        AI-Generated
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Campaigns created with AI
                                    </div>
                                </div>
                            </label>

                            {/* Featured */}
                            <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={localFilters.featured}
                                    onChange={(e) => handleFilterChange('featured', e.target.checked)}
                                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <Star className="w-4 h-4 text-yellow-500" />
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        Featured
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Hand-picked campaigns
                                    </div>
                                </div>
                            </label>

                            {/* Verified Creators */}
                            <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={localFilters.verified}
                                    onChange={(e) => handleFilterChange('verified', e.target.checked)}
                                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <CheckCircle className="w-4 h-4 text-blue-500" />
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        Verified Creators
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        From verified accounts
                                    </div>
                                </div>
                            </label>

                            {/* Has Video */}
                            <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={localFilters.hasVideo}
                                    onChange={(e) => handleFilterChange('hasVideo', e.target.checked)}
                                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <Video className="w-4 h-4 text-red-500" />
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        Has Video
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Campaigns with video
                                    </div>
                                </div>
                            </label>

                            {/* Ending Soon */}
                            <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={localFilters.endingSoon}
                                    onChange={(e) => handleFilterChange('endingSoon', e.target.checked)}
                                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <Clock className="w-4 h-4 text-orange-500" />
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        Ending Soon
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Within 7 days
                                    </div>
                                </div>
                            </label>
                        </div>
                    )}
                </div>
            </div>

            {/* Apply Filters Button */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={handleApplyFilters}
                    className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                    <Filter className="w-4 h-4" />
                    Apply Filters
                </button>
            </div>
        </div>
    );
}
