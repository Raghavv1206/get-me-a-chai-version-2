// components/campaign/MilestonesStep.js
"use client"
import { useState } from 'react';
import { toast } from '@/lib/apiToast';

export default function MilestonesStep({ data, onUpdate, onNext, onBack }) {
    const [milestones, setMilestones] = useState(data.milestones || []);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/ai/generate-milestones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    goal: data.goal,
                    category: data.category,
                    duration: data.duration,
                }),
            });

            if (response.ok) {
                const result = await response.json();
                setMilestones(result.milestones || []);
            } else {
                // Show error from API
                const error = await response.json();
                console.error('API error:', error);
                toast.error(error.error || 'Failed to generate milestones');
            }
        } catch (error) {
            console.error('Error generating milestones:', error);
            toast.error('Failed to generate milestones');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setMilestones([
            ...milestones,
            {
                percentage: 25,
                amount: data.goal * 0.25,
                title: '',
                description: '',
                deliverable: '',
            },
        ]);
    };

    const handleRemove = (index) => {
        setMilestones(milestones.filter((_, i) => i !== index));
    };

    const handleChange = (index, field, value) => {
        const updated = [...milestones];
        updated[index][field] = value;

        // Auto-calculate amount if percentage changes
        if (field === 'percentage') {
            updated[index].amount = (data.goal * value) / 100;
        }

        setMilestones(updated);
    };

    const handleNext = () => {
        onUpdate({ milestones });
        onNext();
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Milestones & Goals</h2>
                <p className="text-gray-400">Set achievable milestones for your campaign</p>
            </div>

            {/* AI Generate Button */}
            <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105 disabled:opacity-50"
            >
                {loading ? '⚙️ Generating...' : '✨ AI Generate Milestones'}
            </button>

            {/* Milestones List */}
            <div className="space-y-4">
                {milestones.map((milestone, index) => (
                    <div key={index} className="p-4 bg-gray-800 rounded-xl border border-gray-700">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="text-white font-semibold">Milestone {index + 1}</h3>
                            <button
                                onClick={() => handleRemove(index)}
                                className="text-red-400 hover:text-red-300 text-sm"
                            >
                                ✕ Remove
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Percentage</label>
                                <input
                                    type="number"
                                    value={milestone.percentage}
                                    onChange={(e) => handleChange(index, 'percentage', Number(e.target.value))}
                                    className="w-full p-2 rounded bg-gray-900 text-white border border-gray-700 text-sm"
                                    min="0"
                                    max="100"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Amount (₹)</label>
                                <input
                                    type="number"
                                    value={milestone.amount}
                                    onChange={(e) => handleChange(index, 'amount', Number(e.target.value))}
                                    className="w-full p-2 rounded bg-gray-900 text-white border border-gray-700 text-sm"
                                    readOnly
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <input
                                type="text"
                                value={milestone.title}
                                onChange={(e) => handleChange(index, 'title', e.target.value)}
                                placeholder="Milestone title"
                                className="w-full p-2 rounded bg-gray-900 text-white border border-gray-700 text-sm"
                            />
                            <textarea
                                value={milestone.description}
                                onChange={(e) => handleChange(index, 'description', e.target.value)}
                                placeholder="Description"
                                rows={2}
                                className="w-full p-2 rounded bg-gray-900 text-white border border-gray-700 text-sm resize-none"
                            />
                            <input
                                type="text"
                                value={milestone.deliverable}
                                onChange={(e) => handleChange(index, 'deliverable', e.target.value)}
                                placeholder="Deliverable"
                                className="w-full p-2 rounded bg-gray-900 text-white border border-gray-700 text-sm"
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Milestone Button */}
            <button
                onClick={handleAdd}
                className="w-full py-3 border-2 border-dashed border-gray-700 text-gray-400 rounded-xl hover:border-purple-500 hover:text-purple-400 transition-all"
            >
                + Add Milestone
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
                    Continue to Rewards →
                </button>
            </div>
        </div>
    );
}
