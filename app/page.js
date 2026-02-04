// app/page.js - Complete Redesigned Home Page
import ChaiScrollytelling from '@/components/home/ChaiScrollytelling';
import LiveStatsBar from '@/components/home/LiveStatsBar';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import TrendingCampaigns from '@/components/home/TrendingCampaigns';
import RecommendationFeed from '@/components/recommendations/RecommendationFeed';
import CategoriesSection from '@/components/home/CategoriesSection';
import SuccessStories from '@/components/home/SuccessStories';
import PlatformFeatures from '@/components/home/PlatformFeatures';
import CTASection from '@/components/home/CTASection';

export default function Home() {
  return (
    <main className="min-h-screen -mt-24">
      <ChaiScrollytelling />
      <LiveStatsBar />
      <HowItWorksSection />
      <TrendingCampaigns />
      {/* AI-Powered Personalized Recommendations for logged-in users */}
      <div className="bg-gradient-to-b from-gray-950 to-gray-900">
        <div className="container mx-auto px-6">
          <RecommendationFeed />
        </div>
      </div>
      <CategoriesSection />
      <SuccessStories />
      <PlatformFeatures />
      <CTASection />
    </main>
  );
}

export const metadata = {
  title: 'Get Me a Chai - AI-Powered Crowdfunding Platform',
  description: 'Turn your creative projects into reality with AI-powered campaign building, smart recommendations, and seamless community support.',
};