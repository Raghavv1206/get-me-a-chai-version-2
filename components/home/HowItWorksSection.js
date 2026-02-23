"use client"
import { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Bot, Rocket, Wallet, Film } from 'lucide-react';

export default function HowItWorksSection() {
  const [showVideo, setShowVideo] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  const steps = [
    {
      number: '01',
      title: 'Create with AI',
      description: 'Use our AI-powered campaign builder to craft compelling stories, set goals, and create reward tiers in minutes.',
      icon: <Bot className="w-12 h-12 text-white" />,
      gradient: 'from-purple-500 to-pink-500',
      features: ['AI Story Generation', 'Smart Goal Suggestions', 'Auto-generated FAQs']
    },
    {
      number: '02',
      title: 'Launch & Share',
      description: 'Publish your campaign and share it with your community across social media, email, and more.',
      icon: <Rocket className="w-12 h-12 text-white" />,
      gradient: 'from-blue-500 to-cyan-500',
      features: ['One-click Publishing', 'Social Sharing', 'Email Campaigns']
    },
    {
      number: '03',
      title: 'Get Funded',
      description: 'Receive support from backers worldwide with secure payments, subscriptions, and real-time analytics.',
      icon: <Wallet className="w-12 h-12 text-white" />,
      gradient: 'from-green-500 to-emerald-500',
      features: ['Instant Payments', 'Recurring Support', 'Live Dashboard']
    }
  ];

  return (
    <div className="relative py-20 bg-gradient-to-b from-gray-950 to-gray-900">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-purple-600 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-10 w-64 h-64 bg-blue-600 rounded-full blur-3xl" />
      </div>

      <div ref={ref} className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-semibold backdrop-blur-sm">
              Simple Process
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Three simple steps to turn your ideas into reality with the power of community support
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`group relative ${inView ? 'animate-fade-in-up' : 'opacity-0'}`}
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              {/* Connecting line (desktop only) */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-gray-700 to-transparent z-0" />
              )}

              {/* Card */}
              <div className="relative backdrop-blur-md bg-gray-800/30 border border-gray-700 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-2">
                {/* Number badge */}
                <div className={`absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-r ${step.gradient} rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg rotate-3 group-hover:rotate-0 transition-transform`}>
                  {step.number}
                </div>

                {/* Icon */}
                <div className="mb-6 mt-4 group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  {step.description}
                </p>

                {/* Features list */}
                <ul className="space-y-2">
                  {step.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2 text-sm text-gray-300">
                      <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Video Demo Section */}
        <div className="max-w-4xl mx-auto">
          <div className="relative backdrop-blur-md bg-gray-800/30 border border-gray-700 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              See It In Action
            </h3>
            <p className="text-gray-400 mb-6">
              Watch how easy it is to create and launch your first campaign
            </p>

            {!showVideo ? (
              <button
                onClick={() => setShowVideo(true)}
                className="group relative w-full aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500/50 transition-all"
              >
                {/* Thumbnail overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>

                {/* Fake thumbnail */}
                <div className="w-full h-full flex items-center justify-center">
                  <div className="flex justify-center"><Film className="w-16 h-16 text-gray-500" /></div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                  <p className="text-white font-semibold">Platform Demo Video</p>
                  <p className="text-gray-400 text-sm">2:30 minutes</p>
                </div>
              </button>
            ) : (
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/SSUbntk63Yg?autoplay=1"
                  title="Get Me a Chai Demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-4 justify-center">
              <div className="flex items-center gap-2 text-gray-400">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm">No credit card required</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm">Set up in 5 minutes</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm">Free to start</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}