// components/about/AboutHero.js
"use client"
import { useInView } from 'react-intersection-observer';

export default function AboutHero() {
    const { ref, inView } = useInView({
        threshold: 0.3,
        triggerOnce: true
    });

    return (
        <div ref={ref} className="py-20 bg-gradient-to-b from-gray-900 to-gray-950">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Left: Mission Text */}
                    <div className={`transition-all duration-700 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                        }`}>
                        <div className="inline-block mb-4">
                            <span className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-semibold">
                                Our Mission
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Empowering Creators with
                            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> AI-Powered </span>
                            Crowdfunding
                        </h1>
                        <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                            Get Me a Chai is revolutionizing crowdfunding by combining the power of artificial intelligence with community support. We make it easier than ever for creators to bring their dreams to life.
                        </p>
                        <p className="text-gray-400 mb-8">
                            Our platform uses cutting-edge AI to help you create compelling campaigns, connect with the right supporters, and achieve your funding goals faster than traditional platforms.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <a href="/login">
                                <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105">
                                    Start Your Campaign
                                </button>
                            </a>
                            <a href="/explore">
                                <button className="px-8 py-4 bg-gray-800 text-white font-semibold rounded-xl border border-gray-700 hover:bg-gray-700 transition-all">
                                    Explore Campaigns
                                </button>
                            </a>
                        </div>
                    </div>

                    {/* Right: Animated Illustration */}
                    <div className={`transition-all duration-700 delay-300 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
                        }`}>
                        <div className="relative">
                            {/* Animated background blobs */}
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-3xl blur-3xl animate-pulse" />

                            {/* Main illustration container */}
                            <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700">
                                {/* Floating elements */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-xl animate-float">
                                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-2xl">
                                            🚀
                                        </div>
                                        <div>
                                            <div className="h-3 w-32 bg-gray-600 rounded mb-2" />
                                            <div className="h-2 w-24 bg-gray-700 rounded" />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-xl animate-float" style={{ animationDelay: '0.5s' }}>
                                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl">
                                            🎯
                                        </div>
                                        <div>
                                            <div className="h-3 w-28 bg-gray-600 rounded mb-2" />
                                            <div className="h-2 w-20 bg-gray-700 rounded" />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-xl animate-float" style={{ animationDelay: '1s' }}>
                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-2xl">
                                            💡
                                        </div>
                                        <div>
                                            <div className="h-3 w-36 bg-gray-600 rounded mb-2" />
                                            <div className="h-2 w-28 bg-gray-700 rounded" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
