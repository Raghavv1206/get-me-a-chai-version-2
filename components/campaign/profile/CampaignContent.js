'use client';

import { useState } from 'react';
import AboutTab from './AboutTab';
import UpdatesTab from './UpdatesTab';
import SupportersTab from './SupportersTab';
import DiscussionTab from './DiscussionTab';

export default function CampaignContent({ campaign, creator, activeTab, onTabChange, onSelectReward, isSupporter }) {
    const tabs = [
        { id: 'about', label: 'About', icon: '📖' },
        { id: 'updates', label: 'Updates', icon: '📢' },
        { id: 'supporters', label: 'Supporters', icon: '👥' },
        { id: 'discussion', label: 'Discussion', icon: '💬' }
    ];

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            {/* Tabs Navigation */}
            <div className="border-b border-white/10 bg-white/5">
                <div className="flex overflow-x-auto scrollbar-hide">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap transition-all duration-200 border-b-2 ${activeTab === tab.id
                                    ? 'border-purple-500 text-white bg-white/5'
                                    : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="p-6 md:p-8">
                {activeTab === 'about' && (
                    <AboutTab
                        campaign={campaign}
                        onSelectReward={onSelectReward}
                    />
                )}

                {activeTab === 'updates' && (
                    <UpdatesTab
                        campaignId={campaign._id}
                        isSupporter={isSupporter}
                    />
                )}

                {activeTab === 'supporters' && (
                    <SupportersTab
                        campaignId={campaign._id}
                    />
                )}

                {activeTab === 'discussion' && (
                    <DiscussionTab
                        campaignId={campaign._id}
                        creatorId={creator._id}
                    />
                )}
            </div>
        </div>
    );
}
