"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Monitor, Palette, Music, Gamepad2, Pizza, BookOpen, Star, Package, Flame } from 'lucide-react';

// Reusable Campaign Card Component
function CampaignCard({ campaign, featured = false }) {
  const progress = (campaign.currentAmount / campaign.goalAmount) * 100;
  const daysLeft = Math.ceil((new Date(campaign.endDate) - new Date()) / (1000 * 60 * 60 * 24));

  const categoryColors = {
    technology: 'from-blue-500 to-cyan-500',
    art: 'from-purple-500 to-pink-500',
    music: 'from-red-500 to-orange-500',
    games: 'from-green-500 to-emerald-500',
    food: 'from-yellow-500 to-orange-500',
    education: 'from-indigo-500 to-purple-500'
  };

  const categoryIcons = {
    technology: <Monitor className="w-12 h-12 text-blue-400" />,
    art: <Palette className="w-12 h-12 text-pink-400" />,
    music: <Music className="w-12 h-12 text-red-400" />,
    games: <Gamepad2 className="w-12 h-12 text-green-400" />,
    food: <Pizza className="w-12 h-12 text-orange-400" />,
    education: <BookOpen className="w-12 h-12 text-indigo-400" />
  };

  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/campaign/${campaign.id}`)}
      className="group relative backdrop-blur-md bg-gray-800/30 border border-gray-700 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-1 cursor-pointer"
    >
      {/* Featured badge */}
      {featured && (
        <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-xs font-bold text-white shadow-lg flex items-center gap-1">
          <Star className="w-3 h-3 text-white fill-white" /> Featured
        </div>
      )}

      {/* Campaign Image */}
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
          {categoryIcons[campaign.category] || <Package className="w-12 h-12 text-gray-400" />}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

        {/* Category badge */}
        <div className={`absolute top-4 right-4 px-3 py-1 bg-gradient-to-r ${categoryColors[campaign.category] || 'from-gray-500 to-gray-600'} rounded-full text-xs font-semibold text-white backdrop-blur-sm`}>
          {campaign.category}
        </div>

        {/* Quick stats overlay */}
        <div className="absolute bottom-3 left-3 flex gap-2">
          <div className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-xs text-white flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {campaign.stats?.views || 0}
          </div>
          <div className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-xs text-white flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            {campaign.stats?.supporters || 0}
          </div>
        </div>
      </div>

      {/* Campaign Content */}
      <div className="p-5">
        {/* Creator info */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
            {campaign.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-xs text-gray-400">by @{campaign.username}</p>
          </div>
          {campaign.verified && (
            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
          {campaign.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
          {campaign.shortDescription || campaign.story?.substring(0, 100) + '...'}
        </p>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span className="font-semibold text-white">₹{(campaign.currentAmount / 1000).toFixed(1)}K</span>
            <span>{progress.toFixed(0)}% funded</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${categoryColors[campaign.category] || 'from-gray-500 to-gray-600'} rounded-full transition-all duration-500`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Footer stats */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={daysLeft <= 7 ? 'text-orange-400 font-semibold' : ''}>
              {daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span>Goal:</span>
            <span className="font-semibold text-white">₹{(campaign.goalAmount / 1000).toFixed(0)}K</span>
          </div>
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
}

// Main Trending Campaigns Component
export default function TrendingCampaigns() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    // Simulated API call - replace with actual API
    const fetchCampaigns = async () => {
      // Mock data
      const mockCampaigns = [
        {
          id: 1,
          username: 'democreator',
          title: 'AI-Powered Learning Platform',
          category: 'technology',
          shortDescription: 'Building an AI tutor that adapts to your learning style',
          goalAmount: 100000,
          currentAmount: 75000,
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          stats: { views: 5420, supporters: 48 },
          featured: true,
          verified: true
        },
        {
          id: 2,
          username: 'pixelartist',
          title: 'Indie Game: Pixel Quest Adventures',
          category: 'games',
          shortDescription: 'A retro-style RPG with modern gameplay mechanics',
          goalAmount: 50000,
          currentAmount: 35000,
          endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
          stats: { views: 3210, supporters: 35 }
        },
        {
          id: 3,
          username: 'coffeefarm',
          title: 'Sustainable Coffee Farm Initiative',
          category: 'food',
          shortDescription: 'Organic, ethically sourced coffee from our family farm',
          goalAmount: 30000,
          currentAmount: 28500,
          endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          stats: { views: 2150, supporters: 42 }
        },
        {
          id: 4,
          username: 'digitalartist',
          title: 'Digital Art Gallery & NFT Collection',
          category: 'art',
          shortDescription: 'Curated collection of original digital artwork',
          goalAmount: 40000,
          currentAmount: 12000,
          endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          stats: { views: 1820, supporters: 12 }
        },
        {
          id: 5,
          username: 'musicfest',
          title: 'Community Music Festival 2025',
          category: 'music',
          shortDescription: 'Three-day indie music festival featuring local artists',
          goalAmount: 80000,
          currentAmount: 45000,
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          stats: { views: 4560, supporters: 89 },
          featured: true
        }
      ];

      setTimeout(() => {
        setCampaigns(mockCampaigns);
        setLoading(false);
      }, 500);
    };

    fetchCampaigns();
  }, []);

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % Math.max(1, campaigns.length - 2));
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + Math.max(1, campaigns.length - 2)) % Math.max(1, campaigns.length - 2));
  };

  return (
    <div className="relative py-20 bg-gradient-to-b from-gray-900 to-gray-950">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="inline-block mb-4">
              <span className="px-4 py-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-full text-orange-400 text-sm font-semibold backdrop-blur-sm">
                <Flame className="w-4 h-4 inline-block mr-1" /> Trending Now
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">
              Popular Campaigns
            </h2>
            <p className="text-gray-400">
              Discover amazing projects making waves in the community
            </p>
          </div>

          {/* Navigation buttons - desktop */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={prevSlide}
              className="p-3 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 hover:border-purple-500/50 transition-all"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="p-3 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 hover:border-purple-500/50 transition-all"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Campaigns Grid/Carousel */}
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-gray-800 rounded-t-2xl" />
                <div className="bg-gray-800/30 p-5 rounded-b-2xl">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-gray-700 rounded w-1/2 mb-4" />
                  <div className="h-2 bg-gray-700 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Desktop Grid */}
            <div className="hidden md:grid md:grid-cols-3 gap-6">
              {campaigns.slice(0, 6).map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} featured={campaign.featured} />
              ))}
            </div>

            {/* Mobile Carousel */}
            <div className="md:hidden relative overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${activeSlide * 100}%)` }}
              >
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="w-full flex-shrink-0 px-2">
                    <CampaignCard campaign={campaign} featured={campaign.featured} />
                  </div>
                ))}
              </div>

              {/* Mobile dots */}
              <div className="flex justify-center gap-2 mt-6">
                {campaigns.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`h-2 rounded-full transition-all ${idx === activeSlide ? 'w-8 bg-purple-500' : 'w-2 bg-gray-600'
                      }`}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* View All Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => router.push('/explore')}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105"
          >
            View All Campaigns
            <svg className="inline-block w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}