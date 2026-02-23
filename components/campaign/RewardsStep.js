// components/campaign/RewardsStep.js
"use client"
import { useState } from 'react';
import { toast } from '@/lib/apiToast';
import { Loader2, Sparkles } from 'lucide-react';

export default function RewardsStep({ data, onUpdate, onNext, onBack }) {
    const [rewards, setRewards] = useState(data.rewards || []);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/ai/generate-rewards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    goal: data.goal,
                    category: data.category,
                    brief: data.brief || data.story || data.title || '',
                    story: data.story,
                    title: data.title
                }),
            });

            if (response.ok) {
                const result = await response.json();
                setRewards(result.rewards || []);
            } else {
                // Show error from API
                const error = await response.json();
                console.error('API error:', error);
                toast.error(error.error || 'Failed to generate rewards');
            }
        } catch (error) {
            console.error('Error generating rewards:', error);
            toast.error('Failed to generate rewards');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setRewards([
            ...rewards,
            {
                amount: 100,
                title: '',
                description: '',
                deliveryTime: '1 month after campaign ends',
                limited: false,
                quantity: null,
            },
        ]);
    };

    const handleRemove = (index) => {
        setRewards(rewards.filter((_, i) => i !== index));
    };

    const handleChange = (index, field, value) => {
        const updated = [...rewards];
        updated[index][field] = value;
        setRewards(updated);
    };

    const handleNext = () => {
        onUpdate({ rewards });
        onNext();
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Reward Tiers</h2>
                <p className="text-gray-400">Offer attractive rewards to your supporters</p>
            </div>

            {/* AI Generate Button */}
            <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105 disabled:opacity-50"
            >
                {loading ? (<><Loader2 className="w-5 h-5 animate-spin inline-block mr-1" /> Generating...</>) : (<><Sparkles className="w-5 h-5 inline-block mr-1" /> AI Generate Reward Tiers</>)}
            </button>

            {/* Rewards List */}
            <div className="space-y-4">
                {rewards.map((reward, index) => (
                    <div key={index} className="p-4 bg-gray-800 rounded-xl border border-gray-700">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="text-white font-semibold">Tier {index + 1}</h3>
                            <button
                                onClick={() => handleRemove(index)}
                                className="text-red-400 hover:text-red-300 text-sm"
                            >
                                ✕ Remove
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Amount (₹) *</label>
                                    <input
                                        type="number"
                                        value={reward.amount}
                                        onChange={(e) => handleChange(index, 'amount', Number(e.target.value))}
                                        className="w-full p-2 rounded bg-gray-900 text-white border border-gray-700 text-sm"
                                        min="10"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Delivery Time</label>
                                    <input
                                        type="text"
                                        value={reward.deliveryTime}
                                        onChange={(e) => handleChange(index, 'deliveryTime', e.target.value)}
                                        className="w-full p-2 rounded bg-gray-900 text-white border border-gray-700 text-sm"
                                        placeholder="e.g., 1 month"
                                    />
                                </div>
                            </div>

                            <input
                                type="text"
                                value={reward.title}
                                onChange={(e) => handleChange(index, 'title', e.target.value)}
                                placeholder="Reward title *"
                                className="w-full p-2 rounded bg-gray-900 text-white border border-gray-700 text-sm"
                            />

                            <textarea
                                value={reward.description}
                                onChange={(e) => handleChange(index, 'description', e.target.value)}
                                placeholder="What supporters get"
                                rows={3}
                                className="w-full p-2 rounded bg-gray-900 text-white border border-gray-700 text-sm resize-none"
                            />

                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 text-sm text-gray-300">
                                    <input
                                        type="checkbox"
                                        checked={reward.limited}
                                        onChange={(e) => handleChange(index, 'limited', e.target.checked)}
                                        className="rounded"
                                    />
                                    Limited Quantity
                                </label>

                                {reward.limited && (
                                    <input
                                        type="number"
                                        value={reward.quantity || ''}
                                        onChange={(e) => handleChange(index, 'quantity', Number(e.target.value))}
                                        placeholder="Quantity"
                                        className="w-24 p-2 rounded bg-gray-900 text-white border border-gray-700 text-sm"
                                        min="1"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Reward Button */}
            <button
                onClick={handleAdd}
                className="w-full py-3 border-2 border-dashed border-gray-700 text-gray-400 rounded-xl hover:border-purple-500 hover:text-purple-400 transition-all"
            >
                + Add Reward Tier
            </button>

            {/* Navigation */}
            <div className="flex justify-between pt-4">
                <button
                    onClick={onBack}
                    className="px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-all"
                >
                    ← Back
                </button>
                <button
                    onClick={handleNext}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105"
                >
                    Continue to Media →
                </button>
            </div>
        </div>
    );
}
