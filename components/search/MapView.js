// components/search/MapView.js
"use client"

/**
 * Map View Component (Future Feature)
 * 
 * Features (Planned):
 * - Google Maps integration
 * - Markers for each campaign
 * - Info window on marker click (campaign card)
 * - Cluster markers when zoomed out
 * - Location-based filtering
 * 
 * @component
 * @status FUTURE_FEATURE
 */

import { MapPin, Info } from 'lucide-react';

export default function MapView({ campaigns = [] }) {
    return (
        <div className="w-full h-[600px] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center">
            <div className="text-center max-w-md px-6">
                {/* Icon */}
                <div className="mb-6 flex justify-center">
                    <div className="relative">
                        <MapPin className="w-20 h-20 text-gray-400 dark:text-gray-600" />
                        <div className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                            Soon
                        </div>
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Map View Coming Soon
                </h3>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    We're working on an interactive map view that will let you explore campaigns by location.
                    You'll be able to see campaigns on a map, cluster nearby campaigns, and discover projects in your area.
                </p>

                {/* Features List */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start gap-2 text-left text-sm text-gray-700 dark:text-gray-300 mb-2">
                        <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-600" />
                        <span>Interactive Google Maps integration</span>
                    </div>
                    <div className="flex items-start gap-2 text-left text-sm text-gray-700 dark:text-gray-300 mb-2">
                        <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-600" />
                        <span>Campaign markers with preview cards</span>
                    </div>
                    <div className="flex items-start gap-2 text-left text-sm text-gray-700 dark:text-gray-300 mb-2">
                        <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-600" />
                        <span>Smart clustering for better performance</span>
                    </div>
                    <div className="flex items-start gap-2 text-left text-sm text-gray-700 dark:text-gray-300">
                        <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-600" />
                        <span>Location-based search and filtering</span>
                    </div>
                </div>

                {/* Campaign Count */}
                {campaigns.length > 0 && (
                    <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                        {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} ready to be mapped
                    </p>
                )}
            </div>
        </div>
    );
}

/**
 * Implementation Notes:
 * 
 * To implement this feature, you'll need to:
 * 
 * 1. Install Google Maps dependencies:
 *    npm install @react-google-maps/api
 * 
 * 2. Get a Google Maps API key:
 *    - Go to https://console.cloud.google.com/
 *    - Create a new project or select existing
 *    - Enable Maps JavaScript API
 *    - Create credentials (API key)
 *    - Add to .env.local: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key
 * 
 * 3. Update Campaign model to include location coordinates:
 *    - Add fields: latitude, longitude
 *    - Geocode addresses on campaign creation
 * 
 * 4. Implement the map component:
 *    - Use GoogleMap component from @react-google-maps/api
 *    - Add Marker components for each campaign
 *    - Implement InfoWindow for campaign previews
 *    - Add MarkerClusterer for performance
 * 
 * 5. Add map controls:
 *    - Zoom controls
 *    - Search box for location search
 *    - Filter by visible area
 *    - Recenter button
 */
