// app/payment-success/page.js
"use client"
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import RecommendationFeed from '@/components/recommendations/RecommendationFeed';
import Link from 'next/link';

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
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black">
            <div className="container mx-auto px-6 py-12">
                {/* Success Message */}
                <div className="max-w-2xl mx-auto mb-12">
                    <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-8 text-center backdrop-blur-md">
                        {/* Success Icon */}
                        <div className="mb-6 flex justify-center">
                            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center animate-bounce">
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            🎉 Payment Successful!
                        </h1>
                        <p className="text-gray-300 text-lg mb-2">
                            Thank you for your generous support!
                        </p>
                        {amount && (
                            <p className="text-2xl font-bold text-green-400 mb-4">
                                ₹{amount}
                            </p>
                        )}
                        {username && (
                            <p className="text-gray-400">
                                Your contribution to <span className="text-purple-400 font-semibold">@{username}</span> has been processed successfully.
                            </p>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                            {username && (
                                <Link href={`/${username}`}>
                                    <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all">
                                        View Campaign
                                    </button>
                                </Link>
                            )}
                            <Link href="/dashboard">
                                <button className="px-6 py-3 bg-gray-800 text-white font-semibold rounded-xl border border-gray-700 hover:bg-gray-700 transition-all">
                                    Go to Dashboard
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* AI-Powered Recommendations */}
                {showRecommendations && session && (
                    <div className="animate-fade-in">
                        <div className="max-w-6xl mx-auto">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-white mb-2">
                                    ✨ Discover More Amazing Campaigns
                                </h2>
                                <p className="text-gray-400">
                                    Based on your interests, you might also like these projects
                                </p>
                            </div>
                            <RecommendationFeed />
                        </div>
                    </div>
                )}

                {/* Continue Exploring */}
                <div className="text-center mt-12">
                    <Link href="/explore">
                        <button className="px-8 py-4 bg-gray-800 text-white font-semibold rounded-xl border border-gray-700 hover:bg-gray-700 hover:border-purple-500/50 transition-all inline-flex items-center gap-2">
                            <span>Explore More Campaigns</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </button>
                    </Link>
                </div>
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
            `}</style>
        </div>
    );
}
