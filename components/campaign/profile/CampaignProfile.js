'use client';

import { useState } from 'react';
import CampaignCover from './CampaignCover';
import ProfileHeader from './ProfileHeader';
import StatsBar from './StatsBar';
import ActionButtons from './ActionButtons';
import CampaignTabs from './CampaignTabs';
import AboutTab from './AboutTab';
import UpdatesTab from './UpdatesTab';
import SupportersTab from './SupportersTab';
import DiscussionTab from './DiscussionTab';

export default function CampaignProfile({ campaign, creator, isSupporter = false }) {
    const [activeTab, setActiveTab] = useState('about');
    const [selectedReward, setSelectedReward] = useState(null);

    const handleSupportClick = () => {
        // Scroll to payment sidebar or open payment modal
        const paymentSection = document.getElementById('payment-sidebar');
        if (paymentSection) {
            paymentSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleSelectReward = (reward) => {
        setSelectedReward(reward);
        handleSupportClick();
    };

    return (
        <div className="campaign-profile">
            {/* Cover Image with Parallax */}
            <CampaignCover
                coverImage={campaign.coverImage || creator.coverpic}
                title={campaign.title}
            />

            {/* Profile Header */}
            <ProfileHeader
                profilePic={creator.profilepic}
                name={creator.name}
                username={creator.username}
                bio={creator.bio}
                category={campaign.category}
                location={creator.location}
                socialLinks={creator.socialLinks}
                verified={creator.verified}
            />

            {/* Stats Bar */}
            <StatsBar
                totalRaised={creator.stats?.totalRaised || 0}
                supporters={creator.stats?.totalSupporters || 0}
                campaignsCount={creator.stats?.campaignsCount || 0}
                successRate={creator.stats?.successRate || 0}
            />

            {/* Action Buttons */}
            <ActionButtons
                campaignId={campaign._id}
                campaignTitle={campaign.title}
                creatorUsername={creator.username}
                isFollowing={false} // TODO: Get from user's following list
                onSupportClick={handleSupportClick}
            />

            {/* Tabs */}
            <CampaignTabs activeTab={activeTab} onTabChange={setActiveTab}>
                {activeTab === 'about' && (
                    <AboutTab
                        campaign={campaign}
                        onSelectReward={handleSelectReward}
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
            </CampaignTabs>

            <style jsx>{`
        .campaign-profile {
          min-height: 100vh;
          background: #0f172a;
          padding-bottom: 60px;
        }

        @media (max-width: 768px) {
          .campaign-profile {
            padding-bottom: 40px;
          }
        }
      `}</style>
        </div>
    );
}
