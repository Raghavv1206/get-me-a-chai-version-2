// components/search/AdvancedSearch.js
"use client"

/**
 * Advanced Search Component
 * 
 * Features:
 * - AI-powered natural language search
 * - Autocomplete suggestions
 * - Search history (localStorage)
 * - Debounced input (300ms)
 * - Voice search support (future)
 * - Loading states
 * - Error handling
 * 
 * @component
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Clock, TrendingUp, Loader2 } from 'lucide-react';
import SearchSuggestions from './SearchSuggestions';

const SEARCH_HISTORY_KEY = 'search_history';
const MAX_HISTORY_ITEMS = 10;

export default function AdvancedSearch({ onSearch, initialQuery = '', placeholder = 'Search campaigns...' }) {
    const [query, setQuery] = useState(initialQuery);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchHistory, setSearchHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const inputRef = useRef(null);
    const debounceTimerRef = useRef(null);
    const suggestionsRef = useRef(null);

    // ========================================================================
    // LOAD SEARCH HISTORY
    // ========================================================================

    useEffect(() => {
        try {
            const history = localStorage.getItem(SEARCH_HISTORY_KEY);
            if (history) {
                setSearchHistory(JSON.parse(history));
            }
        } catch (error) {
            console.error('Failed to load search history:', error);
        }
    }, []);

    // ========================================================================
    // SAVE TO SEARCH HISTORY
    // ========================================================================

    const saveToHistory = useCallback((searchQuery) => {
        if (!searchQuery || searchQuery.trim().length === 0) return;

        try {
            const trimmedQuery = searchQuery.trim();

            // Remove duplicates and add to front
            const newHistory = [
                trimmedQuery,
                ...searchHistory.filter(item => item !== trimmedQuery)
            ].slice(0, MAX_HISTORY_ITEMS);

            setSearchHistory(newHistory);
            localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
        } catch (error) {
            console.error('Failed to save search history:', error);
        }
    }, [searchHistory]);

    // ========================================================================
    // CLEAR SEARCH HISTORY
    // ========================================================================

    const clearHistory = useCallback(() => {
        try {
            setSearchHistory([]);
            localStorage.removeItem(SEARCH_HISTORY_KEY);
        } catch (error) {
            console.error('Failed to clear search history:', error);
        }
    }, []);

    // ========================================================================
    // FETCH SUGGESTIONS
    // ========================================================================

    const fetchSuggestions = useCallback(async (searchQuery) => {
        if (!searchQuery || searchQuery.trim().length < 2) {
            setSuggestions([]);
            return;
        }

        setIsLoading(true);

        try {
            // Fetch suggestions from API
            const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`);

            if (response.ok) {
                const data = await response.json();
                setSuggestions(data.suggestions || []);
            } else {
                setSuggestions([]);
            }
        } catch (error) {
            console.error('Failed to fetch suggestions:', error);
            setSuggestions([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // ========================================================================
    // DEBOUNCED SEARCH
    // ========================================================================

    const debouncedFetchSuggestions = useCallback((searchQuery) => {
        // Clear existing timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Set new timer
        debounceTimerRef.current = setTimeout(() => {
            fetchSuggestions(searchQuery);
        }, 300); // 300ms debounce
    }, [fetchSuggestions]);

    // ========================================================================
    // HANDLE INPUT CHANGE
    // ========================================================================

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);

        if (value.trim().length >= 2) {
            debouncedFetchSuggestions(value);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    // ========================================================================
    // HANDLE SEARCH SUBMIT
    // ========================================================================

    const handleSearch = (searchQuery = query) => {
        const trimmedQuery = searchQuery.trim();

        if (trimmedQuery.length === 0) return;

        // Save to history
        saveToHistory(trimmedQuery);

        // Hide suggestions
        setShowSuggestions(false);

        // Call parent callback
        if (onSearch) {
            onSearch(trimmedQuery);
        }

        // Blur input
        inputRef.current?.blur();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSearch();
    };

    // ========================================================================
    // HANDLE SUGGESTION CLICK
    // ========================================================================

    const handleSuggestionClick = (suggestion) => {
        setQuery(suggestion);
        handleSearch(suggestion);
    };

    // ========================================================================
    // HANDLE CLEAR
    // ========================================================================

    const handleClear = () => {
        setQuery('');
        setSuggestions([]);
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    // ========================================================================
    // HANDLE FOCUS
    // ========================================================================

    const handleFocus = () => {
        setIsFocused(true);

        // Show history if no query
        if (query.trim().length === 0 && searchHistory.length > 0) {
            setShowSuggestions(true);
        } else if (query.trim().length >= 2) {
            setShowSuggestions(true);
        }
    };

    const handleBlur = () => {
        // Delay to allow suggestion click
        setTimeout(() => {
            setIsFocused(false);
            setShowSuggestions(false);
        }, 200);
    };

    // ========================================================================
    // KEYBOARD NAVIGATION
    // ========================================================================

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setShowSuggestions(false);
            inputRef.current?.blur();
        }
    };

    // ========================================================================
    // CLICK OUTSIDE TO CLOSE
    // ========================================================================

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target) &&
                inputRef.current &&
                !inputRef.current.contains(event.target)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // ========================================================================
    // CLEANUP DEBOUNCE ON UNMOUNT
    // ========================================================================

    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    // ========================================================================
    // RENDER
    // ========================================================================

    return (
        <div className="relative w-full max-w-3xl mx-auto">
            {/* Search Form */}
            <form onSubmit={handleSubmit} className="relative">
                <div className={`
          relative flex items-center
          bg-white dark:bg-gray-800
          border-2 rounded-full
          transition-all duration-200
          ${isFocused
                        ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
        `}>
                    {/* Search Icon */}
                    <div className="absolute left-4 text-gray-400">
                        <Search className="w-5 h-5" />
                    </div>

                    {/* Input */}
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={handleInputChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className="
              w-full py-3 px-12
              bg-transparent
              text-gray-900 dark:text-white
              placeholder-gray-400
              outline-none
              text-base
            "
                        autoComplete="off"
                        spellCheck="false"
                    />

                    {/* Loading Indicator */}
                    {isLoading && (
                        <div className="absolute right-12 text-purple-500">
                            <Loader2 className="w-5 h-5 animate-spin" />
                        </div>
                    )}

                    {/* Clear Button */}
                    {query && !isLoading && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="
                absolute right-12
                text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                transition-colors
              "
                            aria-label="Clear search"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}

                    {/* Search Button */}
                    <button
                        type="submit"
                        disabled={!query.trim()}
                        className="
              absolute right-2
              px-4 py-2
              bg-gradient-to-r from-purple-600 to-pink-600
              text-white font-medium
              rounded-full
              transition-all duration-200
              hover:shadow-lg hover:shadow-purple-500/50
              disabled:opacity-50 disabled:cursor-not-allowed
              disabled:hover:shadow-none
            "
                    >
                        Search
                    </button>
                </div>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && (
                <div
                    ref={suggestionsRef}
                    className="
            absolute top-full left-0 right-0 mt-2
            bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            rounded-2xl shadow-xl
            overflow-hidden
            z-50
          "
                >
                    <SearchSuggestions
                        query={query}
                        suggestions={suggestions}
                        searchHistory={searchHistory}
                        onSuggestionClick={handleSuggestionClick}
                        onClearHistory={clearHistory}
                        isLoading={isLoading}
                    />
                </div>
            )}

            {/* Search Tips (when focused and empty) */}
            {isFocused && !query && searchHistory.length === 0 && (
                <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    <p>Try searching for campaigns, creators, or categories</p>
                    <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                            Technology
                        </span>
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                            Art Projects
                        </span>
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                            Music
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
