// components/search/SearchSuggestions.js
"use client"

/**
 * Search Suggestions Component
 * 
 * Features:
 * - Dropdown with suggestions as you type
 * - Categories, campaigns, creators
 * - Keyboard navigation (arrow keys, Enter)
 * - Search history display
 * - Loading states
 * 
 * @component
 */

import { useState, useEffect, useRef } from 'react';
import { Search, Clock, TrendingUp, X, Sparkles, Loader2 } from 'lucide-react';

export default function SearchSuggestions({
    query,
    suggestions = [],
    searchHistory = [],
    onSuggestionClick,
    onClearHistory,
    isLoading = false,
}) {
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const suggestionsListRef = useRef(null);

    // ========================================================================
    // KEYBOARD NAVIGATION
    // ========================================================================

    useEffect(() => {
        const handleKeyDown = (e) => {
            const totalItems = (query ? suggestions.length : searchHistory.length);

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < totalItems - 1 ? prev + 1 : prev
                );
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
            } else if (e.key === 'Enter' && selectedIndex >= 0) {
                e.preventDefault();
                const items = query ? suggestions : searchHistory;
                if (items[selectedIndex]) {
                    onSuggestionClick(items[selectedIndex]);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIndex, suggestions, searchHistory, query, onSuggestionClick]);

    // ========================================================================
    // SCROLL SELECTED ITEM INTO VIEW
    // ========================================================================

    useEffect(() => {
        if (selectedIndex >= 0 && suggestionsListRef.current) {
            const selectedElement = suggestionsListRef.current.children[selectedIndex];
            if (selectedElement) {
                selectedElement.scrollIntoView({
                    block: 'nearest',
                    behavior: 'smooth',
                });
            }
        }
    }, [selectedIndex]);

    // ========================================================================
    // RESET SELECTION WHEN SUGGESTIONS CHANGE
    // ========================================================================

    useEffect(() => {
        setSelectedIndex(-1);
    }, [suggestions, searchHistory, query]);

    // ========================================================================
    // RENDER LOADING STATE
    // ========================================================================

    if (isLoading) {
        return (
            <div className="p-4 text-center">
                <Loader2 className="w-6 h-6 mx-auto text-purple-500 animate-spin" />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Searching...
                </p>
            </div>
        );
    }

    // ========================================================================
    // RENDER SEARCH HISTORY (when no query)
    // ========================================================================

    if (!query && searchHistory.length > 0) {
        return (
            <div className="py-2">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Clock className="w-4 h-4" />
                        <span>Recent Searches</span>
                    </div>
                    <button
                        onClick={onClearHistory}
                        className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    >
                        Clear all
                    </button>
                </div>

                {/* History Items */}
                <ul ref={suggestionsListRef} className="max-h-64 overflow-y-auto">
                    {searchHistory.map((item, index) => (
                        <li key={index}>
                            <button
                                onClick={() => onSuggestionClick(item)}
                                className={`
                  w-full px-4 py-2.5
                  flex items-center gap-3
                  text-left text-sm
                  transition-colors
                  ${selectedIndex === index
                                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                    }
                `}
                            >
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="flex-1">{item}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    // ========================================================================
    // RENDER SUGGESTIONS (when query exists)
    // ========================================================================

    if (query && suggestions.length > 0) {
        return (
            <div className="py-2">
                {/* Header */}
                <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span>AI Suggestions</span>
                </div>

                {/* Suggestion Items */}
                <ul ref={suggestionsListRef} className="max-h-64 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                        <li key={index}>
                            <button
                                onClick={() => onSuggestionClick(suggestion)}
                                className={`
                  w-full px-4 py-2.5
                  flex items-center gap-3
                  text-left text-sm
                  transition-colors
                  ${selectedIndex === index
                                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                    }
                `}
                            >
                                <Search className="w-4 h-4 text-gray-400" />
                                <span className="flex-1">
                                    {highlightMatch(suggestion, query)}
                                </span>
                                <TrendingUp className="w-3 h-3 text-gray-400" />
                            </button>
                        </li>
                    ))}
                </ul>

                {/* Footer Tip */}
                <div className="px-4 py-2 mt-1 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">↑</kbd> <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">↓</kbd> to navigate, <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Enter</kbd> to select
                    </p>
                </div>
            </div>
        );
    }

    // ========================================================================
    // RENDER EMPTY STATE
    // ========================================================================

    if (query && suggestions.length === 0 && !isLoading) {
        return (
            <div className="p-8 text-center">
                <Search className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    No suggestions found
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Try a different search term
                </p>
            </div>
        );
    }

    // ========================================================================
    // RENDER DEFAULT STATE
    // ========================================================================

    return (
        <div className="p-8 text-center">
            <Search className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                Start typing to search
            </p>
        </div>
    );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Highlight matching text in suggestion
 */
function highlightMatch(text, query) {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));

    return (
        <span>
            {parts.map((part, index) =>
                part.toLowerCase() === query.toLowerCase() ? (
                    <strong key={index} className="font-semibold text-purple-600 dark:text-purple-400">
                        {part}
                    </strong>
                ) : (
                    <span key={index}>{part}</span>
                )
            )}
        </span>
    );
}
