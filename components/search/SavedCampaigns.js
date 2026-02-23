// components/search/SavedCampaigns.js
"use client"

/**
 * Saved Campaigns Component (Future Feature)
 * 
 * Features (Planned):
 * - Heart icon to save/bookmark campaigns
 * - "My Saved" page to view all saved campaigns
 * - Remove from saved
 * - Sync across devices (if logged in)
 * - Offline support with localStorage
 * 
 * @component
 * @status FUTURE_FEATURE
 */

import { useState, useEffect } from 'react';
import { Heart, Bookmark, Info } from 'lucide-react';
import { useSession } from 'next-auth/react';

/**
 * Hook to manage saved campaigns
 */
export function useSavedCampaigns() {
    const { data: session } = useSession();
    const [savedCampaigns, setSavedCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load saved campaigns on mount
    useEffect(() => {
        loadSavedCampaigns();
    }, [session]);

    const loadSavedCampaigns = async () => {
        try {
            setLoading(true);

            if (session?.user?.id) {
                // TODO: Fetch from API when implemented
                // const response = await fetch(`/api/users/${session.user.id}/saved-campaigns`);
                // const data = await response.json();
                // setSavedCampaigns(data.campaigns || []);

                // For now, use localStorage
                const saved = localStorage.getItem('saved_campaigns');
                setSavedCampaigns(saved ? JSON.parse(saved) : []);
            } else {
                // Guest users: use localStorage only
                const saved = localStorage.getItem('saved_campaigns');
                setSavedCampaigns(saved ? JSON.parse(saved) : []);
            }
        } catch (error) {
            console.error('Failed to load saved campaigns:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveCampaign = async (campaignId) => {
        try {
            if (session?.user?.id) {
                // TODO: Save to API when implemented
                // await fetch(`/api/users/${session.user.id}/saved-campaigns`, {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify({ campaignId }),
                // });

                // For now, use localStorage
                const newSaved = [...savedCampaigns, campaignId];
                setSavedCampaigns(newSaved);
                localStorage.setItem('saved_campaigns', JSON.stringify(newSaved));
            } else {
                // Guest users: localStorage only
                const newSaved = [...savedCampaigns, campaignId];
                setSavedCampaigns(newSaved);
                localStorage.setItem('saved_campaigns', JSON.stringify(newSaved));
            }

            return { success: true };
        } catch (error) {
            console.error('Failed to save campaign:', error);
            return { success: false, error: error.message };
        }
    };

    const unsaveCampaign = async (campaignId) => {
        try {
            if (session?.user?.id) {
                // TODO: Remove from API when implemented
                // await fetch(`/api/users/${session.user.id}/saved-campaigns/${campaignId}`, {
                //     method: 'DELETE',
                // });

                // For now, use localStorage
                const newSaved = savedCampaigns.filter(id => id !== campaignId);
                setSavedCampaigns(newSaved);
                localStorage.setItem('saved_campaigns', JSON.stringify(newSaved));
            } else {
                // Guest users: localStorage only
                const newSaved = savedCampaigns.filter(id => id !== campaignId);
                setSavedCampaigns(newSaved);
                localStorage.setItem('saved_campaigns', JSON.stringify(newSaved));
            }

            return { success: true };
        } catch (error) {
            console.error('Failed to unsave campaign:', error);
            return { success: false, error: error.message };
        }
    };

    const isSaved = (campaignId) => {
        return savedCampaigns.includes(campaignId);
    };

    const toggleSave = async (campaignId) => {
        if (isSaved(campaignId)) {
            return await unsaveCampaign(campaignId);
        } else {
            return await saveCampaign(campaignId);
        }
    };

    return {
        savedCampaigns,
        loading,
        saveCampaign,
        unsaveCampaign,
        isSaved,
        toggleSave,
    };
}

/**
 * Save Button Component
 */
export function SaveButton({ campaignId, className = '' }) {
    const { isSaved, toggleSave } = useSavedCampaigns();
    const [saving, setSaving] = useState(false);
    const saved = isSaved(campaignId);

    const handleClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        setSaving(true);
        await toggleSave(campaignId);
        setSaving(false);
    };

    return (
        <button
            onClick={handleClick}
            disabled={saving}
            className={`
                p-2 rounded-full
                bg-white/90 dark:bg-gray-800/90
                backdrop-blur-sm
                hover:scale-110
                transition-transform
                disabled:opacity-50
                ${className}
            `}
            aria-label={saved ? 'Unsave campaign' : 'Save campaign'}
            title={saved ? 'Remove from saved' : 'Save for later'}
        >
            <Heart
                className={`w-5 h-5 ${saved
                    ? 'fill-red-500 text-red-500'
                    : 'text-gray-600 dark:text-gray-400'
                    }`}
            />
        </button>
    );
}

/**
 * Saved Campaigns Page Component (Placeholder)
 */
export default function SavedCampaignsPage() {
    const { savedCampaigns, loading } = useSavedCampaigns();

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-black">
            <div className="container mx-auto px-6 py-12">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        <Heart className="w-8 h-8 inline-block mr-2 text-pink-400" /> Saved Campaigns
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Your bookmarked campaigns in one place
                    </p>
                </div>

                {/* Coming Soon Message */}
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
                        {/* Icon */}
                        <div className="mb-6 flex justify-center">
                            <div className="relative">
                                <Bookmark className="w-20 h-20 text-gray-400 dark:text-gray-600" />
                                <div className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                                    Soon
                                </div>
                            </div>
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            Saved Campaigns Feature Coming Soon
                        </h2>

                        {/* Description */}
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            We're building a powerful bookmarking system that will let you save campaigns for later,
                            organize them into collections, and sync across all your devices.
                        </p>

                        {/* Features List */}
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-start gap-2 text-left text-sm text-gray-700 dark:text-gray-300 mb-3">
                                <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-600" />
                                <span>Save unlimited campaigns with one click</span>
                            </div>
                            <div className="flex items-start gap-2 text-left text-sm text-gray-700 dark:text-gray-300 mb-3">
                                <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-600" />
                                <span>Organize into custom collections</span>
                            </div>
                            <div className="flex items-start gap-2 text-left text-sm text-gray-700 dark:text-gray-300 mb-3">
                                <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-600" />
                                <span>Sync across all your devices</span>
                            </div>
                            <div className="flex items-start gap-2 text-left text-sm text-gray-700 dark:text-gray-300 mb-3">
                                <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-600" />
                                <span>Get notifications when saved campaigns update</span>
                            </div>
                            <div className="flex items-start gap-2 text-left text-sm text-gray-700 dark:text-gray-300">
                                <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-600" />
                                <span>Share your collections with friends</span>
                            </div>
                        </div>

                        {/* Temporary Count */}
                        {!loading && savedCampaigns.length > 0 && (
                            <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                <p className="text-sm text-purple-700 dark:text-purple-300">
                                    You have {savedCampaigns.length} campaign{savedCampaigns.length !== 1 ? 's' : ''} saved locally.
                                    They'll be synced to your account when this feature launches!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Implementation Notes:
 * 
 * To implement this feature, you'll need to:
 * 
 * 1. Create database schema for saved campaigns:
 *    - Create SavedCampaign model with userId, campaignId, savedAt, collections
 *    - Add indexes for efficient queries
 * 
 * 2. Create API routes:
 *    - GET /api/users/[userId]/saved-campaigns - List saved campaigns
 *    - POST /api/users/[userId]/saved-campaigns - Save a campaign
 *    - DELETE /api/users/[userId]/saved-campaigns/[campaignId] - Unsave
 *    - POST /api/users/[userId]/collections - Create collection
 *    - PUT /api/users/[userId]/collections/[collectionId] - Update collection
 * 
 * 3. Add server actions:
 *    - saveCampaign(userId, campaignId)
 *    - unsaveCampaign(userId, campaignId)
 *    - getSavedCampaigns(userId)
 *    - createCollection(userId, name)
 *    - addToCollection(userId, campaignId, collectionId)
 * 
 * 4. Create UI components:
 *    - SavedCampaignsGrid - Display saved campaigns
 *    - CollectionManager - Manage collections
 *    - CollectionCard - Display collection
 *    - ShareCollectionModal - Share with others
 * 
 * 5. Add notifications:
 *    - Notify when saved campaign gets updated
 *    - Notify when campaign is ending soon
 *    - Notify when campaign reaches goal
 */
