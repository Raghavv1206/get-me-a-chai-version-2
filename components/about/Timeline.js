// components/about/Timeline.js
"use client"
import { useInView } from 'react-intersection-observer';

export default function Timeline() {
    const milestones = [
        {
            year: '2024',
            title: 'Platform Launch',
            description: 'Get Me a Chai officially launches with AI-powered campaign building',
            icon: '🚀',
            color: 'from-blue-500 to-cyan-500'
        },
        {
            year: '2024',
            title: 'AI Chatbot Integration',
            description: '24/7 AI assistant to help creators and supporters',
            icon: '🤖',
            color: 'from-purple-500 to-pink-500'
        },
        {
            year: '2025',
            title: 'Smart Recommendations',
            description: 'Personalized campaign recommendations powered by machine learning',
            icon: '🎯',
            color: 'from-green-500 to-emerald-500'
        },
        {
            year: '2025',
            title: '1000+ Campaigns',
            description: 'Reached milestone of 1000 successful campaigns funded',
            icon: '🎉',
            color: 'from-orange-500 to-red-500'
        },
        {
            year: '2026',
            title: 'Global Expansion',
            description: 'Expanding to support creators worldwide',
            icon: '🌍',
            color: 'from-indigo-500 to-purple-500'
        }
    ];

    return (
        <div className="py-20 bg-gray-950">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-white mb-4">Our Journey</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        From a simple idea to a revolutionary platform - here's how we've grown
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    {milestones.map((milestone, index) => (
                        <TimelineItem
                            key={index}
                            milestone={milestone}
                            index={index}
                            isLast={index === milestones.length - 1}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function TimelineItem({ milestone, index, isLast }) {
    const { ref, inView } = useInView({
        threshold: 0.3,
        triggerOnce: true
    });

    const isLeft = index % 2 === 0;

    return (
        <div ref={ref} className="relative">
            {/* Timeline line */}
            {!isLast && (
                <div className="absolute left-1/2 top-20 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/50 to-transparent hidden md:block" />
            )}

            <div className={`flex flex-col md:flex-row gap-8 mb-12 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}>
                {/* Content */}
                <div className={`flex-1 transition-all duration-700 ${inView
                        ? 'opacity-100 translate-y-0'
                        : `opacity-0 ${isLeft ? 'translate-x-10' : '-translate-x-10'}`
                    }`}>
                    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all ${isLeft ? 'md:text-right' : 'md:text-left'
                        }`}>
                        <div className={`inline-block px-3 py-1 bg-gradient-to-r ${milestone.color} rounded-full text-white text-sm font-bold mb-3`}>
                            {milestone.year}
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                            {milestone.title}
                        </h3>
                        <p className="text-gray-400">
                            {milestone.description}
                        </p>
                    </div>
                </div>

                {/* Center icon */}
                <div className="flex-shrink-0 flex items-center justify-center">
                    <div className={`w-16 h-16 bg-gradient-to-r ${milestone.color} rounded-full flex items-center justify-center text-3xl shadow-lg transition-all duration-700 ${inView ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
                        }`}>
                        {milestone.icon}
                    </div>
                </div>

                {/* Spacer for alternating layout */}
                <div className="flex-1 hidden md:block" />
            </div>
        </div>
    );
}
