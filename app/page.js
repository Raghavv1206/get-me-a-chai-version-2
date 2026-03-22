// app/page.js
import dynamic from 'next/dynamic';
import ChaiScrollytelling from '@/components/home/ChaiScrollytelling';

// Lazy-load all below-the-fold sections — they don't affect FCP/LCP
const LiveStatsBar = dynamic(() => import('@/components/home/LiveStatsBar'));
const HowItWorksSection = dynamic(() => import('@/components/home/HowItWorksSection'));
const TrendingCampaigns = dynamic(() => import('@/components/home/TrendingCampaigns'));
const RecommendationFeed = dynamic(() => import('@/components/recommendations/RecommendationFeed'));
const CategoriesSection = dynamic(() => import('@/components/home/CategoriesSection'));
const SuccessStories = dynamic(() => import('@/components/home/SuccessStories'));
const PlatformFeatures = dynamic(() => import('@/components/home/PlatformFeatures'));
const CTASection = dynamic(() => import('@/components/home/CTASection'));

export const metadata = {
  title: 'Get Me a Chai - AI-Powered Crowdfunding Platform',
  description: 'Turn your creative projects into reality with AI-powered campaign building, smart recommendations, and seamless community support.',
};

export default function Home() {
  return (
    <main className="min-h-screen -mt-24">
      {/* ChaiScrollytelling is the LCP element — loaded eagerly */}
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