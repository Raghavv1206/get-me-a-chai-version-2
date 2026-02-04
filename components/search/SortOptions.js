// components/search/SortOptions.js
"use client"

/**
 * Sort Options Component
 * 
 * Features:
 * - Dropdown with sort options
 * - Trending (default)
 * - Most recent
 * - Ending soon
 * - Most funded
 * - Least funded
 * - Alphabetical A-Z
 * - Active state highlighting
 * - Keyboard navigation
 * 
 * @component
 */

import { useState, useRef, useEffect } from 'react';
import { ArrowUpDown, Check, ChevronDown, TrendingUp, Clock, DollarSign, Calendar, Type } from 'lucide-react';

const SORT_OPTIONS = [
    {
        value: 'trending',
        label: 'Trending',
        icon: TrendingUp,
        description: 'Most popular campaigns',
    },
    {
        value: 'recent',
        label: 'Most Recent',
        icon: Calendar,
        description: 'Newest campaigns first',
    },
    {
        value: 'ending-soon',
        label: 'Ending Soon',
        icon: Clock,
        description: 'Campaigns ending soonest',
    },
    {
        value: 'most-funded',
        label: 'Most Funded',
        icon: DollarSign,
        description: 'Highest funding amount',
    },
    {
        value: 'least-funded',
        label: 'Least Funded',
        icon: DollarSign,
        description: 'Lowest funding amount',
    },
    {
        value: 'alphabetical',
        label: 'A-Z',
        icon: Type,
        description: 'Alphabetical order',
    },
];

export default function SortOptions({
    value = 'trending',
    onChange,
    className = '',
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    // Find current option
    const currentOption = SORT_OPTIONS.find(opt => opt.value === value) || SORT_OPTIONS[0];

    // ========================================================================
    // CLICK OUTSIDE TO CLOSE
    // ========================================================================

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // ========================================================================
    // KEYBOARD NAVIGATION
    // ========================================================================

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < SORT_OPTIONS.length - 1 ? prev + 1 : prev
                );
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                handleSelect(SORT_OPTIONS[selectedIndex].value);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedIndex]);

    // ========================================================================
    // HANDLERS
    // ========================================================================

    const handleToggle = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            // Set selected index to current value
            const currentIndex = SORT_OPTIONS.findIndex(opt => opt.value === value);
            setSelectedIndex(currentIndex >= 0 ? currentIndex : 0);
        }
    };

    const handleSelect = (newValue) => {
        if (onChange) {
            onChange(newValue);
        }
        setIsOpen(false);
    };

    // ========================================================================
    // RENDER
    // ========================================================================

    return (
        <div className={`relative ${className}`}>
            {/* Trigger Button */}
            <button
                ref={buttonRef}
                onClick={handleToggle}
                className={`
                    flex items-center gap-2 px-4 py-2.5
                    bg-white dark:bg-gray-800
                    border-2 rounded-lg
                    text-sm font-medium
                    transition-all duration-200
                    hover:border-purple-300 dark:hover:border-purple-600
                    ${isOpen
                        ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }
                `}
                aria-label="Sort options"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <ArrowUpDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-900 dark:text-white">
                    Sort: {currentOption.label}
                </span>
                <ChevronDown
                    className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''
                        }`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="
                        absolute top-full right-0 mt-2
                        w-72
                        bg-white dark:bg-gray-800
                        border border-gray-200 dark:border-gray-700
                        rounded-xl shadow-xl
                        overflow-hidden
                        z-50
                        animate-in fade-in slide-in-from-top-2 duration-200
                    "
                >
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Sort By
                        </h3>
                    </div>

                    {/* Options */}
                    <div className="py-2 max-h-96 overflow-y-auto">
                        {SORT_OPTIONS.map((option, index) => {
                            const Icon = option.icon;
                            const isSelected = option.value === value;
                            const isHighlighted = index === selectedIndex;

                            return (
                                <button
                                    key={option.value}
                                    onClick={() => handleSelect(option.value)}
                                    className={`
                                        w-full px-4 py-3
                                        flex items-start gap-3
                                        text-left
                                        transition-colors
                                        ${isHighlighted
                                            ? 'bg-purple-50 dark:bg-purple-900/20'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                        }
                                    `}
                                >
                                    {/* Icon */}
                                    <div className={`
                                        flex-shrink-0 mt-0.5
                                        ${isSelected
                                            ? 'text-purple-600 dark:text-purple-400'
                                            : 'text-gray-400 dark:text-gray-500'
                                        }
                                    `}>
                                        <Icon className="w-5 h-5" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className={`
                                            text-sm font-medium
                                            ${isSelected
                                                ? 'text-purple-700 dark:text-purple-300'
                                                : 'text-gray-900 dark:text-white'
                                            }
                                        `}>
                                            {option.label}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            {option.description}
                                        </div>
                                    </div>

                                    {/* Check Mark */}
                                    {isSelected && (
                                        <div className="flex-shrink-0">
                                            <Check className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer Tip */}
                    <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Use <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">↑</kbd> <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">↓</kbd> to navigate
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
