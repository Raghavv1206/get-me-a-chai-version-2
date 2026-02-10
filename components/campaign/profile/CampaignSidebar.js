'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaHeart, FaShare, FaFlag, FaClock, FaFire } from 'react-icons/fa';

export default function CampaignSidebar({ campaign, creator, selectedReward, onSupportClick }) {
    const router = useRouter();
    const [amount, setAmount] = useState(selectedReward?.amount || 100);

    // Calculate progress
    const currentAmount = campaign.currentAmount || 0;
    const goalAmount = campaign.goalAmount || 1;
    const progress = Math.min((currentAmount / goalAmount) * 100, 100);

    // Calculate days remaining
    const daysRemaining = campaign.daysRemaining || 0;

    const handleSupport = () => {
        // Navigate to payment page or open modal
        router.push(`/pay/${creator.username}?amount=${amount}&campaign=${campaign._id}`);
    };

    return (
        <div className="space-y-6">
            {/* Main Support Card */}
            <div id="payment-sidebar" className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                {/* Progress Section */}
                <div className="mb-6">
                    <div className="flex items-baseline justify-between mb-2">
                        <div>
                            <div className="text-3xl font-bold text-white">
                                ₹{(currentAmount / 1000).toFixed(1)}K
                            </div>
                            <div className="text-sm text-gray-400">
                                raised of ₹{(goalAmount / 1000).toFixed(0)}K goal
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-purple-400">
                                {progress.toFixed(0)}%
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-3 bg-gray-800 rounded-full overflow-hidden mb-4">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1.5 text-gray-400">
                            <FaHeart className="w-3.5 h-3.5 text-red-400" />
                            <span>{campaign.stats?.supporters || 0} supporters</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400">
                            <FaClock className="w-3.5 h-3.5 text-orange-400" />
                            <span>{daysRemaining} days left</span>
                        </div>
                    </div>
                </div>

                {/* Amount Input */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Support Amount
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                            ₹
                        </span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 0))}
                            className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            placeholder="Enter amount"
                            min="1"
                        />
                    </div>
                </div>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                    {[100, 500, 1000].map((quickAmount) => (
                        <button
                            key={quickAmount}
                            onClick={() => setAmount(quickAmount)}
                            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${amount === quickAmount
                                ? 'bg-purple-500 text-white'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                                }`}
                        >
                            ₹{quickAmount}
                        </button>
                    ))}
                </div>

                {/* Support Button */}
                <button
                    onClick={handleSupport}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                    <FaHeart className="w-4 h-4" />
                    <span>Support This Campaign</span>
                </button>

                {/* Trust Badges */}
                <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                            <FaFire className="w-3 h-3 text-orange-400" />
                            <span>Secure Payment</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                            <FaHeart className="w-3 h-3 text-red-400" />
                            <span>100% Safe</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 hover:text-white transition-all">
                    <FaShare className="w-4 h-4" />
                    <span className="text-sm font-medium">Share</span>
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 hover:text-white transition-all">
                    <FaFlag className="w-4 h-4" />
                    <span className="text-sm font-medium">Report</span>
                </button>
            </div>

            {/* Creator Card */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">About Creator</h3>

                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Total Raised</span>
                        <span className="font-semibold text-white">
                            ₹{((creator.stats?.totalRaised || 0) / 1000).toFixed(1)}K
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Supporters</span>
                        <span className="font-semibold text-white">
                            {creator.stats?.totalSupporters || 0}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Campaigns</span>
                        <span className="font-semibold text-white">
                            {creator.stats?.campaignsCount || 0}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Success Rate</span>
                        <span className="font-semibold text-green-400">
                            {creator.stats?.successRate || 0}%
                        </span>
                    </div>
                </div>

                <button
                    onClick={() => router.push(`/${creator.username}`)}
                    className="w-full mt-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 transition-all"
                >
                    View Profile
                </button>
            </div>
        </div>
    );
}
