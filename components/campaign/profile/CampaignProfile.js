'use client';

import { useState, useEffect, useRef } from 'react';
import CampaignHero from './CampaignHero';
import CampaignStats from './CampaignStats';
import CampaignContent from './CampaignContent';
import CampaignSidebar from './CampaignSidebar';

export default function CampaignProfile({ campaign, creator, isSupporter = false, isDraft = false }) {
    const [activeTab, setActiveTab] = useState('about');
    const [selectedReward, setSelectedReward] = useState(null);
    const [viewCount, setViewCount] = useState(campaign.stats?.views || 0);
    const viewTracked = useRef(false);

    // Track page view on mount — skipped entirely for draft campaigns to avoid
    // polluting view counters while the creator is previewing.
    useEffect(() => {
        if (isDraft) return;          // ← never track draft previews
        if (viewTracked.current) return;
        viewTracked.current = true;

        const trackView = async () => {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const utmSource = urlParams.get('utm_source') || '';
                const utmMedium = urlParams.get('utm_medium') || '';
                const utmCampaign = urlParams.get('utm_campaign') || '';
                const referrer = document.referrer || '';

                const res = await fetch('/api/campaigns/track-view', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        campaignId: campaign._id,
                        referrer,
                        utmSource,
                        utmMedium,
                        utmCampaign,
                    }),
                });
                if (res.ok) {
                    const data = await res.json();
                    // Only increment the local counter when the API actually recorded a view
                    if (data.success) {
                        setViewCount(prev => prev + 1);
                    }
                }
            } catch (error) {
                console.error('Failed to track view:', error);
            }
        };

        trackView();
    }, [campaign._id, isDraft]);

    const handleSupportClick = () => {
        console.log('Support clicked with reward:', selectedReward);
    };

    const handleSelectReward = (reward) => {
        setSelectedReward(reward);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Override campaign stats with the live view count
    const campaignWithViews = {
        ...campaign,
        stats: {
            ...campaign.stats,
            views: viewCount,
        },
    };

    return (
        <div className="min-h-screen bg-black text-gray-100">
            {/* Background Ambient Effects */}
            <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />
            <div className="fixed bottom-0 left-20 w-[400px] h-[400px] bg-blue-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />

            {/* Draft Preview Banner — only shown to the campaign creator */}
            {isDraft && (
                <div className="sticky top-0 z-50 w-full bg-yellow-500/95 backdrop-blur-sm border-b border-yellow-400/50 px-4 py-3">
                    <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-yellow-950 font-semibold">
                            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                            <span>Draft Preview — This campaign is not yet published. Stats, views, and donations are disabled.</span>
                        </div>
                        <span className="text-xs text-yellow-900 bg-yellow-400/60 px-2 py-1 rounded-full font-medium whitespace-nowrap">
                            Only you can see this
                        </span>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <CampaignHero campaign={campaignWithViews} creator={creator} isDraft={isDraft} />

            {/* Main Content */}
            <main className="pt-8 px-4 md:px-8 pb-8 min-h-screen relative">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Stats Overview */}
                    <CampaignStats campaign={campaignWithViews} creator={creator} isDraft={isDraft} />

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                        <div className="xl:col-span-2 space-y-6 lg:space-y-8">
                            <CampaignContent
                                campaign={campaignWithViews}
                                creator={creator}
                                activeTab={activeTab}
                                onTabChange={setActiveTab}
                                onSelectReward={handleSelectReward}
                                isSupporter={isSupporter}
                            />
                        </div>

                        <div className="space-y-6 lg:space-y-8">
                            <CampaignSidebar
                                campaign={campaignWithViews}
                                creator={creator}
                                selectedReward={selectedReward}
                                onSupportClick={handleSupportClick}
                                isDraft={isDraft}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
