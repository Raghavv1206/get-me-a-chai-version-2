// app/payment-success/page.js
"use client"
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import RecommendationFeed from '@/components/recommendations/RecommendationFeed';
import Link from 'next/link';
import { PartyPopper, Sparkles } from 'lucide-react';

export default function PaymentSuccessPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showRecommendations, setShowRecommendations] = useState(false);

    const username = searchParams.get('username');
    const amount = searchParams.get('amount');

    useEffect(() => {
        // Show recommendations after a short delay
        const timer = setTimeout(() => {
            setShowRecommendations(true);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-black text-gray-100">
            {/* Background Ambient Effects - Same as Dashboard */}
            <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />
            <div className="fixed bottom-0 left-20 w-[400px] h-[400px] bg-blue-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />
            {/* Noise overlay */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 pointer-events-none mix-blend-overlay -z-10"></div>

            <div className="container mx-auto px-6 py-12 pt-24">
                {/* Success Message */}
                <div className="max-w-2xl mx-auto mb-12">
                    <div className="bg-white/5 backdrop-blur-xl border border-green-500/30 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden group">
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />

                        {/* Success Icon */}
                        <div className="mb-6 flex justify-center">
                            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-green-500/30">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                            <PartyPopper className="w-8 h-8 inline-block mr-2 text-green-400" /> Payment Successful!
                        </h1>
                        <p className="text-gray-300 text-lg mb-4">
                            Thank you for your generous support!
                        </p>

                        <div className="bg-black/40 rounded-xl p-6 border border-white/10 mb-8 inline-block min-w-[200px]">
                            {amount && (
                                <p className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                                    ₹{amount}
                                </p>
                            )}
                            {username && (
                                <p className="text-gray-400 text-sm">
                                    sent to <span className="text-purple-400 font-semibold">@{username}</span>
                                </p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {username && (
                                <Link href={`/${username}`}>
                                    <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all hover:-translate-y-0.5">
                                        View Campaign
                                    </button>
                                </Link>
                            )}
                            <Link href="/dashboard">
                                <button className="px-6 py-3 bg-white/5 text-white font-semibold rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                                    Go to Dashboard
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* AI-Powered Recommendations */}
                {showRecommendations && (
                    <div className="animate-fade-in">
                        <div className="max-w-6xl mx-auto">
                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-bold text-white mb-3">
                                    <Sparkles className="w-6 h-6 inline-block mr-2 text-yellow-400" /> Discover More Amazing Campaigns
                                </h2>
                                <p className="text-gray-400">
                                    Based on your interests, you might also like these projects
                                </p>
                            </div>
                            <RecommendationFeed />

                            {/* Continue Exploring */}
                            <div className="text-center mt-12">
                                <Link href="/explore">
                                    <button className="px-8 py-4 bg-white/5 text-white font-semibold rounded-xl border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all inline-flex items-center gap-2 group">
                                        <span>Explore More Campaigns</span>
                                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.6s ease-out;
                }
                @keyframes shimmer {
                    100% {
                        transform: translateX(100%);
                    }
                }
                .animate-shimmer {
                    animation: shimmer 1.5s infinite;
                }
            `}</style>
        </div>
    );
}
