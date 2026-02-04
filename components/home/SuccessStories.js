"use client"
import { useState, useEffect } from 'react';

export default function SuccessStories() {
  const [activeStory, setActiveStory] = useState(0);

  const stories = [
    {
      id: 1,
      name: 'Priya Sharma',
      username: 'priyatech',
      campaign: 'AI Learning App',
      raised: '₹2.5L',
      supporters: 450,
      image: '👩‍💻',
      quote: 'Get Me a Chai helped me turn my idea into a reality. The AI campaign builder made it so easy to create a professional campaign!',
      category: 'Technology',
      success: 'Fully Funded in 15 days'
    },
    {
      id: 2,
      name: 'Rahul Verma',
      username: 'rahulgames',
      campaign: 'Indie Game Studio',
      raised: '₹5.2L',
      supporters: 890,
      image: '🎮',
      quote: 'The platform\'s AI recommendations brought in supporters I never would have reached. Absolutely game-changing!',
      category: 'Games',
      success: '250% funded'
    },
    {
      id: 3,
      name: 'Ananya Patel',
      username: 'ananyaart',
      campaign: 'Digital Art Gallery',
      raised: '₹1.8L',
      supporters: 320,
      image: '🎨',
      quote: 'As an artist, I was skeptical about crowdfunding. But the supportive community here is incredible!',
      category: 'Art',
      success: 'Reached goal in 3 weeks'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStory((prev) => (prev + 1) % stories.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentStory = stories[activeStory];

  return (
    <div className="relative py-20 bg-gray-900">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-green-600 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-yellow-600 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-full text-green-400 text-sm font-semibold backdrop-blur-sm">
              ⭐ Success Stories
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Real Creators, Real Success
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Join thousands of creators who have successfully funded their dreams
          </p>
        </div>

        {/* Story Carousel */}
        <div className="max-w-5xl mx-auto">
          <div className="relative backdrop-blur-md bg-gray-800/30 border border-gray-700 rounded-3xl p-8 md:p-12 overflow-hidden">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-blue-600/10 opacity-50" />

            <div className="relative z-10">
              {/* Story content */}
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Left: Creator info */}
                <div className="text-center md:text-left">
                  {/* Creator avatar */}
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full text-5xl mb-6 shadow-xl">
                    {currentStory.image}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-xl md:text-2xl text-white font-medium mb-6 leading-relaxed">
                    "{currentStory.quote}"
                  </blockquote>

                  {/* Creator details */}
                  <div className="mb-6">
                    <p className="text-white font-bold text-lg">{currentStory.name}</p>
                    <p className="text-gray-400">@{currentStory.username}</p>
                  </div>

                  {/* Campaign info */}
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <div className="px-4 py-2 bg-gray-900/50 rounded-lg border border-gray-700">
                      <p className="text-gray-400 text-xs">Campaign</p>
                      <p className="text-white font-semibold">{currentStory.campaign}</p>
                    </div>
                    <div className="px-4 py-2 bg-gray-900/50 rounded-lg border border-gray-700">
                      <p className="text-gray-400 text-xs">Raised</p>
                      <p className="text-green-400 font-bold">{currentStory.raised}</p>
                    </div>
                    <div className="px-4 py-2 bg-gray-900/50 rounded-lg border border-gray-700">
                      <p className="text-gray-400 text-xs">Supporters</p>
                      <p className="text-white font-semibold">{currentStory.supporters}</p>
                    </div>
                  </div>
                </div>

                {/* Right: Success metrics */}
                <div className="space-y-6">
                  {/* Success badge */}
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full backdrop-blur-sm">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-400 font-semibold">{currentStory.success}</span>
                  </div>

                  {/* Stats visualization */}
                  <div className="space-y-4">
                    <div className="backdrop-blur-sm bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-400">Campaign Performance</span>
                        <span className="text-green-400 font-bold">Excellent</span>
                      </div>
                      <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{ width: '95%' }} />
                      </div>
                    </div>

                    <div className="backdrop-blur-sm bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                      <p className="text-gray-400 text-sm mb-2">Category</p>
                      <p className="text-white font-semibold text-lg">{currentStory.category}</p>
                    </div>

                    {/* CTA */}
                    <button className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105">
                      Read Full Story
                      <svg className="inline-block w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Navigation dots */}
              <div className="flex justify-center gap-3 mt-8">
                {stories.map((story, idx) => (
                  <button
                    key={story.id}
                    onClick={() => setActiveStory(idx)}
                    className={`transition-all ${
                      idx === activeStory
                        ? 'w-12 h-3 bg-gradient-to-r from-purple-500 to-blue-500'
                        : 'w-3 h-3 bg-gray-600 hover:bg-gray-500'
                    } rounded-full`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-12">
          {[
            { label: 'Success Rate', value: '87%', icon: '📈' },
            { label: 'Avg Time to Goal', value: '23 days', icon: '⏱️' },
            { label: 'Total Funded', value: '₹15Cr+', icon: '💰' },
            { label: 'Happy Creators', value: '2.5K+', icon: '😊' }
          ].map((stat, idx) => (
            <div key={idx} className="backdrop-blur-md bg-gray-800/30 border border-gray-700 rounded-xl p-6 text-center hover:border-purple-500/50 transition-all">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}