'use client';

import { useState } from 'react';
import CampaignHero from './CampaignHero';
import CampaignStats from './CampaignStats';
import CampaignContent from './CampaignContent';
import CampaignSidebar from './CampaignSidebar';

export default function CampaignProfile({ campaign, creator, isSupporter = false }) {
    const [activeTab, setActiveTab] = useState('about');
    const [selectedReward, setSelectedReward] = useState(null);

    const handleSupportClick = () => {
        console.log('Support clicked with reward:', selectedReward);
    };

    const handleSelectReward = (reward) => {
        setSelectedReward(reward);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-black text-gray-100">
            {/* Background Ambient Effects - Same as Dashboard */}
            <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />
            <div className="fixed bottom-0 left-20 w-[400px] h-[400px] bg-blue-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />

            {/* Hero Section - Full Width */}
            <CampaignHero campaign={campaign} creator={creator} />

            {/* Main Content - Same Container as Dashboard */}
            <main className="pt-8 px-4 md:px-8 pb-8 min-h-screen relative">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Stats Overview */}
                    <CampaignStats campaign={campaign} creator={creator} />

                    {/* Main Content Grid - Same as Dashboard */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                        {/* Left Column - Main Content (2/3 width on xl screens) */}
                        <div className="xl:col-span-2 space-y-6 lg:space-y-8">
                            <CampaignContent
                                campaign={campaign}
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
                                campaign={campaign}
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
