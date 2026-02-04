"use client"
import { useState } from 'react';

export default function CategoriesSection() {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const categories = [
    {
      id: 'technology',
      name: 'Technology',
      icon: '💻',
      count: 234,
      gradient: 'from-blue-500 to-cyan-500',
      description: 'Software, hardware, AI, and innovation',
      topCampaign: 'AI Learning Platform - ₹75K raised'
    },
    {
      id: 'art',
      name: 'Art & Design',
      icon: '🎨',
      count: 189,
      gradient: 'from-purple-500 to-pink-500',
      description: 'Digital art, illustrations, and NFTs',
      topCampaign: 'Digital Gallery - ₹12K raised'
    },
    {
      id: 'music',
      name: 'Music',
      icon: '🎵',
      count: 156,
      gradient: 'from-red-500 to-orange-500',
      description: 'Albums, concerts, and music videos',
      topCampaign: 'Music Festival - ₹45K raised'
    },
    {
      id: 'games',
      name: 'Games',
      icon: '🎮',
      count: 198,
      gradient: 'from-green-500 to-emerald-500',
      description: 'Video games, board games, and more',
      topCampaign: 'Pixel Quest - ₹35K raised'
    },
    {
      id: 'food',
      name: 'Food & Drink',
      icon: '🍕',
      count: 142,
      gradient: 'from-yellow-500 to-orange-500',
      description: 'Restaurants, products, and cookbooks',
      topCampaign: 'Coffee Farm - ₹28.5K raised'
    },
    {
      id: 'education',
      name: 'Education',
      icon: '📚',
      count: 167,
      gradient: 'from-indigo-500 to-purple-500',
      description: 'Courses, books, and learning tools',
      topCampaign: 'Online Course - ₹22K raised'
    },
    {
      id: 'film',
      name: 'Film & Video',
      icon: '🎬',
      count: 134,
      gradient: 'from-pink-500 to-rose-500',
      description: 'Movies, documentaries, and web series',
      topCampaign: 'Documentary - ₹18K raised'
    },
    {
      id: 'fashion',
      name: 'Fashion',
      icon: '👗',
      count: 123,
      gradient: 'from-violet-500 to-purple-500',
      description: 'Clothing, accessories, and jewelry',
      topCampaign: 'Fashion Line - ₹31K raised'
    }
  ];

  return (
    <div className="relative py-20 bg-gray-950">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-full text-green-400 text-sm font-semibold backdrop-blur-sm">
              Explore Categories
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Find Your Passion
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Browse campaigns across diverse categories and discover projects that inspire you
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {categories.map((category, idx) => (
            <div
              key={category.id}
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
              className="group relative backdrop-blur-md bg-gray-800/30 border border-gray-700 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden"
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />

              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <div className="text-5xl md:text-6xl mb-4 group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>

                {/* Category name */}
                <h3 className="text-lg md:text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all">
                  {category.name}
                </h3>

                {/* Campaign count */}
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span>{category.count} campaigns</span>
                </div>

                {/* Description - shows on hover */}
                <div className={`transition-all duration-300 ${hoveredCategory === category.id ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0'} overflow-hidden`}>
                  <p className="text-sm text-gray-400 mb-3">
                    {category.description}
                  </p>
                  <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                    <p className="text-xs text-gray-500 mb-1">Top Campaign:</p>
                    <p className="text-xs text-white font-semibold">
                      {category.topCampaign}
                    </p>
                  </div>
                </div>

                {/* Arrow icon */}
                <div className={`absolute top-6 right-6 transition-all duration-300 ${hoveredCategory === category.id ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>

              {/* Shine effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent" />
              </div>
            </div>
          ))}
        </div>

        {/* Browse All Button */}
        <div className="text-center mt-12">
          <button className="group inline-flex items-center gap-2 px-8 py-4 bg-gray-800/50 text-white font-semibold rounded-xl border border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 hover:border-purple-500/50 transition-all duration-300">
            Browse All Categories
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}