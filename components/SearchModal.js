// components/SearchModal.js
"use client"
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SearchModal({ isOpen, onClose }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef(null);
    const router = useRouter();

    const categories = [
        { id: 'technology', name: 'Technology', icon: '💻' },
        { id: 'art', name: 'Art & Design', icon: '🎨' },
        { id: 'music', name: 'Music', icon: '🎵' },
        { id: 'games', name: 'Games', icon: '🎮' },
        { id: 'food', name: 'Food & Drink', icon: '🍕' },
        { id: 'education', name: 'Education', icon: '📚' },
    ];

    // Load recent searches from localStorage
    useEffect(() => {
        if (isOpen) {
            const saved = localStorage.getItem('recentSearches');
            if (saved) {
                setRecentSearches(JSON.parse(saved));
            }
            // Focus input when modal opens
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;

            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < results.length - 1 ? prev + 1 : prev
                );
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
            } else if (e.key === 'Enter' && selectedIndex >= 0) {
                e.preventDefault();
                handleSelectResult(results[selectedIndex]);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, results, selectedIndex]);

    // Debounced search
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const timer = setTimeout(() => {
            performSearch(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const performSearch = async (searchQuery) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
            if (response.ok) {
                const data = await response.json();
                setResults(data.results || []);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectResult = (result) => {
        // Save to recent searches
        const updated = [result.title, ...recentSearches.filter(s => s !== result.title)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));

        // Navigate to result
        router.push(result.url);
        onClose();
    };

    const handleCategoryClick = (categoryId) => {
        router.push(`/explore?category=${categoryId}`);
        onClose();
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden animate-slide-down">
                {/* Search Input */}
                <div className="p-6 border-b border-gray-800">
                    <div className="relative">
                        <svg
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search campaigns, creators, categories..."
                            className="w-full pl-12 pr-4 py-4 bg-gray-800 text-white rounded-xl border border-gray-700 focus:outline-none focus:border-purple-500 transition-colors text-lg"
                        />
                        {loading && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="max-h-[500px] overflow-y-auto">
                    {query.trim() ? (
                        // Search Results
                        results.length > 0 ? (
                            <div className="p-4">
                                <p className="text-sm text-gray-400 mb-3 px-2">
                                    {results.length} results found
                                </p>
                                {results.map((result, index) => (
                                    <button
                                        key={result.id}
                                        onClick={() => handleSelectResult(result)}
                                        className={`w-full text-left p-4 rounded-xl transition-colors ${index === selectedIndex
                                                ? 'bg-purple-500/20 border border-purple-500/50'
                                                : 'hover:bg-gray-800 border border-transparent'
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            {result.image && (
                                                <img
                                                    src={result.image}
                                                    alt={result.title}
                                                    className="w-16 h-16 rounded-lg object-cover"
                                                />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-white font-semibold mb-1 line-clamp-1">
                                                    {result.title}
                                                </h4>
                                                <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                                                    {result.description}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <span className="px-2 py-1 bg-gray-800 rounded">
                                                        {result.category}
                                                    </span>
                                                    {result.creator && (
                                                        <span>by @{result.creator}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            !loading && (
                                <div className="p-12 text-center">
                                    <div className="text-4xl mb-2">🔍</div>
                                    <p className="text-gray-400">No results found</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Try different keywords
                                    </p>
                                </div>
                            )
                        )
                    ) : (
                        // Recent Searches & Categories
                        <div className="p-4 space-y-6">
                            {/* Recent Searches */}
                            {recentSearches.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-3 px-2">
                                        <h3 className="text-sm font-semibold text-gray-400">
                                            Recent Searches
                                        </h3>
                                        <button
                                            onClick={clearRecentSearches}
                                            className="text-xs text-purple-400 hover:text-purple-300"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {recentSearches.map((search, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setQuery(search)}
                                                className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-3"
                                            >
                                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {search}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Category Quick Filters */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 mb-3 px-2">
                                    Browse by Category
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {categories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => handleCategoryClick(category.id)}
                                            className="p-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors text-left border border-gray-700 hover:border-purple-500/50"
                                        >
                                            <div className="text-2xl mb-2">{category.icon}</div>
                                            <div className="text-sm font-medium text-white">
                                                {category.name}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Hint */}
                <div className="p-4 border-t border-gray-800 bg-gray-800/50">
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <kbd className="px-2 py-1 bg-gray-700 rounded">↑</kbd>
                            <kbd className="px-2 py-1 bg-gray-700 rounded">↓</kbd>
                            Navigate
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-2 py-1 bg-gray-700 rounded">Enter</kbd>
                            Select
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-2 py-1 bg-gray-700 rounded">Esc</kbd>
                            Close
                        </span>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes slide-down {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-slide-down {
                    animation: slide-down 0.2s ease-out;
                }
            `}</style>
        </div>
    );
}
