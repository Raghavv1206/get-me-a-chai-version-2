"use client"
import { useRouter } from 'next/navigation';
import { Bot, MessageCircle, BarChart3, CreditCard, Target, ShieldCheck, Zap } from 'lucide-react';

export default function PlatformFeatures() {
  const router = useRouter();
  const features = [
    {
      icon: <Bot className="w-7 h-7 text-white" />,
      title: 'AI Campaign Builder',
      description: 'Create professional campaigns in minutes with AI-generated stories, milestones, and reward tiers.',
      benefits: ['Smart story generation', 'Goal suggestions', 'Auto FAQs'],
      gradient: 'from-purple-500 to-pink-500',
      link: '/features/ai-builder'
    },
    {
      icon: <MessageCircle className="w-7 h-7 text-white" />,
      title: 'AI Assistant',
      description: 'Get instant help with our AI chatbot that understands your needs and provides personalized guidance.',
      benefits: ['24/7 support', 'Smart answers', 'Context-aware'],
      gradient: 'from-blue-500 to-cyan-500',
      link: '/features/ai-assistant'
    },
    {
      icon: <BarChart3 className="w-7 h-7 text-white" />,
      title: 'Advanced Analytics',
      description: 'Track your campaign performance with real-time analytics, insights, and AI-powered recommendations.',
      benefits: ['Real-time data', 'AI insights', 'Export reports'],
      gradient: 'from-green-500 to-emerald-500',
      link: '/dashboard/analytics'
    },
    {
      icon: <CreditCard className="w-7 h-7 text-white" />,
      title: 'Seamless Payments',
      description: 'Accept one-time payments and recurring subscriptions with industry-leading security.',
      benefits: ['Multiple payment methods', 'Subscriptions', 'Instant transfers'],
      gradient: 'from-orange-500 to-red-500',
      link: '/features/payments'
    },
    {
      icon: <Target className="w-7 h-7 text-white" />,
      title: 'Smart Recommendations',
      description: 'AI-powered recommendations connect supporters with campaigns they will love.',
      benefits: ['Personalized', 'ML-powered', 'Higher conversions'],
      gradient: 'from-indigo-500 to-purple-500',
      link: '/features/recommendations'
    },
    {
      icon: <ShieldCheck className="w-7 h-7 text-white" />,
      title: 'Fraud Protection',
      description: 'Advanced AI moderation and fraud detection keeps the platform safe and trustworthy.',
      benefits: ['AI moderation', 'Spam detection', 'Secure platform'],
      gradient: 'from-yellow-500 to-orange-500',
      link: '/features/security'
    }
  ];

  return (
    <div className="relative py-20 bg-gradient-to-b from-gray-950 to-gray-900">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-2 
    bg-gradient-to-r from-purple-500/10 to-blue-500/10 
    border border-purple-500/20 rounded-full 
    text-purple-400 text-sm font-semibold backdrop-blur-sm">
              <Zap className="w-4 h-4 text-purple-400" /> Powerful Features
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Our platform combines cutting-edge AI technology with creator-friendly tools to help you build, launch, and grow successful campaigns
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group relative backdrop-blur-md bg-gray-800/30 border border-gray-700 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/20"
            >
              {/* Gradient glow on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`} />

              {/* Icon */}
              <div className="relative">
                <div className={`inline-flex items-center justify-center w-16 h-16 mb-6 bg-gradient-to-br ${feature.gradient} rounded-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                  <span className="flex items-center justify-center">{feature.icon}</span>
                </div>
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all">
                {feature.title}
              </h3>

              <p className="text-gray-400 mb-6 leading-relaxed">
                {feature.description}
              </p>

              {/* Benefits list */}
              <ul className="space-y-3 mb-6">
                {feature.benefits.map((benefit, bIdx) => (
                  <li key={bIdx} className="flex items-center gap-2 text-sm text-gray-300">
                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${feature.gradient}`} />
                    {benefit}
                  </li>
                ))}
              </ul>

              {/* Learn more link */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(feature.link);
                }}
                className="group/btn flex items-center gap-2 text-purple-400 hover:text-purple-300 font-semibold text-sm transition-colors"
              >
                Learn more
                <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>

              {/* Corner decoration */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className={`w-8 h-8 bg-gradient-to-br ${feature.gradient} rounded-lg blur-md`} />
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparison CTA */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="relative backdrop-blur-md bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-purple-900/20 border border-purple-500/30 rounded-2xl p-8 md:p-12 text-center overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 animate-pulse" />
            </div>

            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Build Something Amazing?
              </h3>
              <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of creators who are already using our platform to turn their dreams into reality
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => router.push('/dashboard/campaign/new')}
                  className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all duration-300 hover:scale-105"
                >
                  <span className="flex items-center gap-2">
                    Start Free Campaign
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>

                <button
                  onClick={() => router.push('/pricing')}
                  className="px-8 py-4 bg-gray-800/50 text-white font-semibold rounded-xl border border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 hover:border-purple-500/50 transition-all duration-300"
                >
                  Compare Plans
                </button>
              </div>

              {/* Trust badges */}
              <div className="mt-8 flex flex-wrap justify-center gap-8 text-gray-400 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>No setup fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Cancel anytime</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>24/7 AI support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}