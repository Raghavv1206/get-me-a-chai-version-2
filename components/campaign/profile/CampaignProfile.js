'use client';

import { useState, useEffect, useRef } from 'react';
import CampaignHero from './CampaignHero';
import CampaignStats from './CampaignStats';
import CampaignContent from './CampaignContent';
import CampaignSidebar from './CampaignSidebar';

export default function CampaignProfile({ campaign, creator, isSupporter = false }) {
    const [activeTab, setActiveTab] = useState('about');
    const [selectedReward, setSelectedReward] = useState(null);
    const [viewCount, setViewCount] = useState(campaign.stats?.views || 0);
    const viewTracked = useRef(false);

    // Track page view on mount
    useEffect(() => {
        if (viewTracked.current) return;
        viewTracked.current = true;

        const trackView = async () => {
            try {
                const res = await fetch('/api/campaigns/track-view', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ campaignId: campaign._id }),
                });
                if (res.ok) {
                    // Optimistically increment the view count shown on this page
                    setViewCount(prev => prev + 1);
                }
            } catch (error) {
                // Silently fail — view tracking is non-critical
                console.error('Failed to track view:', error);
            }
        };

        trackView();
    }, [campaign._id]);

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
            {/* Background Ambient Effects - Same as Dashboard */}
            <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />
            <div className="fixed bottom-0 left-20 w-[400px] h-[400px] bg-blue-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />

            {/* Hero Section - Full Width */}
            <CampaignHero campaign={campaignWithViews} creator={creator} />

            {/* Main Content - Same Container as Dashboard */}
            <main className="pt-8 px-4 md:px-8 pb-8 min-h-screen relative">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Stats Overview */}
                    <CampaignStats campaign={campaignWithViews} creator={creator} />

                    {/* Main Content Grid - Same as Dashboard */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                        {/* Left Column - Main Content (2/3 width on xl screens) */}
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

                        {/* Right Column - Sidebar (1/3 width on xl screens) */}
                        <div className="space-y-6 lg:space-y-8">
                            <CampaignSidebar
                                campaign={campaignWithViews}
                                creator={creator}
                                selectedReward={selectedReward}
                                onSupportClick={handleSupportClick}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
