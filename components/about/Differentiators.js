// components/about/Differentiators.js
"use client"
import { useInView } from 'react-intersection-observer';

export default function Differentiators() {
    const { ref, inView } = useInView({
        threshold: 0.2,
        triggerOnce: true
    });

    const features = [
        {
            icon: '🤖',
            title: 'AI-Powered Campaign Builder',
            description: 'Create professional campaigns in minutes with our intelligent AI assistant that writes compelling stories, suggests rewards, and optimizes your pitch.',
            highlight: 'Save 10+ hours',
            color: 'from-purple-500 to-pink-500'
        },
        {
            icon: '🎯',
            title: 'Smart Recommendations',
            description: 'Our ML algorithm connects you with supporters who are genuinely interested in your project, increasing your success rate by 3x.',
            highlight: '3x Success Rate',
            color: 'from-blue-500 to-cyan-500'
        },
        {
            icon: '💬',
            title: '24/7 AI Chatbot',
            description: 'Get instant answers to questions, troubleshoot issues, and receive guidance anytime with our intelligent support assistant.',
            highlight: 'Instant Support',
            color: 'from-green-500 to-emerald-500'
        },
        {
            icon: '📊',
            title: 'Real-Time Analytics',
            description: 'Track your campaign performance with detailed insights, supporter demographics, and AI-powered suggestions for improvement.',
            highlight: 'Data-Driven',
            color: 'from-orange-500 to-red-500'
        },
        {
            icon: '⚡',
            title: 'Lightning Fast Setup',
            description: 'Launch your campaign in under 15 minutes. No complex forms, no confusing processes - just your idea and our AI.',
            highlight: '15 Min Setup',
            color: 'from-yellow-500 to-orange-500'
        },
        {
            icon: '🔒',
            title: 'Secure & Transparent',
            description: 'Bank-grade security, transparent fees, and automatic fraud detection keep your funds and supporters safe.',
            highlight: '100% Secure',
            color: 'from-indigo-500 to-purple-500'
        }
    ];

    return (
        <div className="py-20 bg-gray-900">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <div className="inline-block mb-4">
                        <span className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-semibold">
                            Why Choose Us
                        </span>
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-4">
                        What Makes Us Different
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        We're not just another crowdfunding platform - we're your AI-powered partner in success
                    </p>
                </div>

                <div ref={ref} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={`group relative bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-500 hover:scale-105 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                                }`}
                            style={{
                                transitionDelay: `${index * 100}ms`
                            }}
                        >
                            {/* Gradient background on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity`} />

                            {/* Icon */}
                            <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">
                                {feature.icon}
                            </div>

                            {/* Highlight badge */}
                            <div className={`inline-block px-3 py-1 bg-gradient-to-r ${feature.color} rounded-full text-white text-xs font-bold mb-3`}>
                                {feature.highlight}
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-bold text-white mb-3">
                                {feature.title}
                            </h3>

                            {/* Description */}
                            <p className="text-gray-400 text-sm leading-relaxed">
                                {feature.description}
                            </p>

                            {/* Decorative corner */}
                            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${feature.color} rounded-bl-full opacity-0 group-hover:opacity-10 transition-opacity`} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
