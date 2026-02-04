// components/search/ViewToggle.js
"use client"

/**
 * View Toggle Component
 * 
 * Features:
 * - Grid view icon
 * - List view icon
 * - Map view icon (future)
 * - Active state highlighting
 * - Smooth transitions
 * - Keyboard accessible
 * 
 * @component
 */

import { Grid3x3, List, Map } from 'lucide-react';

const VIEW_MODES = [
    {
        value: 'grid',
        label: 'Grid View',
        icon: Grid3x3,
        description: 'View campaigns in a grid layout',
    },
    {
        value: 'list',
        label: 'List View',
        icon: List,
        description: 'View campaigns in a list layout',
    },
    {
        value: 'map',
        label: 'Map View',
        icon: Map,
        description: 'View campaigns on a map (coming soon)',
        disabled: true, // Future feature
    },
];

export default function ViewToggle({
    value = 'grid',
    onChange,
    className = '',
    showMapView = false, // Set to true when map view is implemented
}) {
    // Filter out map view if not enabled
    const availableViews = showMapView
        ? VIEW_MODES
        : VIEW_MODES.filter(mode => mode.value !== 'map');

    const handleChange = (newValue) => {
        if (onChange && newValue !== value) {
            onChange(newValue);
        }
    };

    return (
        <div className={`flex items-center ${className}`}>
            {/* Label (optional, for accessibility) */}
            <span className="sr-only">View mode</span>

            {/* Toggle Buttons */}
            <div className="inline-flex items-center bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-1 gap-1">
                {availableViews.map((mode) => {
                    const Icon = mode.icon;
                    const isActive = mode.value === value;
                    const isDisabled = mode.disabled;

                    return (
                        <button
                            key={mode.value}
                            onClick={() => !isDisabled && handleChange(mode.value)}
                            disabled={isDisabled}
                            className={`
                                relative px-3 py-2
                                rounded-md
                                transition-all duration-200
                                ${isActive
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                                    : isDisabled
                                        ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                                }
                                ${!isDisabled && 'cursor-pointer'}
                            `}
                            aria-label={mode.label}
                            aria-pressed={isActive}
                            title={mode.description}
                        >
                            <Icon className="w-5 h-5" />

                            {/* Active Indicator */}
                            {isActive && (
                                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                            )}

                            {/* Coming Soon Badge */}
                            {isDisabled && (
                                <div className="absolute -top-1 -right-1">
                                    <span className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-[10px] font-medium rounded-full whitespace-nowrap">
                                        Soon
                                    </span>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Current View Label (visible on larger screens) */}
            <span className="hidden md:inline-block ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                {availableViews.find(mode => mode.value === value)?.label || 'Grid View'}
            </span>
        </div>
    );
}
