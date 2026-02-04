// components/campaign/PreviewStep.js
"use client"
import { useState, useEffect } from 'react';

export default function PreviewStep({ data, onUpdate, onBack }) {
    const [qualityScore, setQualityScore] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Auto-score on mount
        handleScore();
    }, []);

    const handleScore = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/ai/score-campaign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: data.title,
                    category: data.category,
                    goal: data.goal,
                    story: data.story,
                    coverImage: data.coverImage,
                    rewards: data.rewards,
                    faqs: data.faqs,
                    milestones: data.milestones,
                }),
            });

            if (response.ok) {
                const result = await response.json();
                setQualityScore(result);
            }
        } catch (error) {
            console.error('Error scoring campaign:', error);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getScoreBgColor = (score) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Preview & Quality Check</h2>
                <p className="text-gray-400">Review your campaign before publishing</p>
            </div>

            {/* Quality Score */}
            {loading ? (
                <div className="p-6 bg-gray-800 rounded-xl text-center">
                    <div className="animate-spin text-4xl mb-2">⚙️</div>
                    <p className="text-gray-400">AI is analyzing your campaign...</p>
                </div>
            ) : qualityScore ? (
                <div className="p-6 bg-gray-800 rounded-xl border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white">Campaign Quality Score</h3>
                        <button
                            onClick={handleScore}
                            className="text-sm text-purple-400 hover:text-purple-300"
                        >
                            🔄 Re-analyze
                        </button>
                    </div>

                    {/* Overall Score */}
                    <div className="text-center mb-6">
                        <div className={`text-6xl font-bold ${getScoreColor(qualityScore.overallScore)}`}>
                            {qualityScore.overallScore}/100
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3 mt-3">
                            <div
                                className={`h-3 rounded-full ${getScoreBgColor(qualityScore.overallScore)}`}
                                style={{ width: `${qualityScore.overallScore}%` }}
                            />
                        </div>
                    </div>

                    {/* Detailed Scores */}
                    {qualityScore.scores && (
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="p-3 bg-gray-900 rounded-lg">
                                <p className="text-xs text-gray-400">Story Quality</p>
                                <p className="text-lg font-bold text-white">{qualityScore.scores.story}/25</p>
                            </div>
                            <div className="p-3 bg-gray-900 rounded-lg">
                                <p className="text-xs text-gray-400">Goal Realism</p>
                                <p className="text-lg font-bold text-white">{qualityScore.scores.goal}/20</p>
                            </div>
                            <div className="p-3 bg-gray-900 rounded-lg">
                                <p className="text-xs text-gray-400">Visual Quality</p>
                                <p className="text-lg font-bold text-white">{qualityScore.scores.visuals}/20</p>
                            </div>
                            <div className="p-3 bg-gray-900 rounded-lg">
                                <p className="text-xs text-gray-400">Rewards</p>
                                <p className="text-lg font-bold text-white">{qualityScore.scores.rewards}/15</p>
                            </div>
                        </div>
                    )}

                    {/* Insights */}
                    {qualityScore.insights && qualityScore.insights.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-sm font-semibold text-white mb-2">💡 AI Insights</h4>
                            <ul className="space-y-2">
                                {qualityScore.insights.map((insight, index) => (
                                    <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                                        <span className="text-yellow-400">•</span>
                                        <span>{insight}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Strengths & Improvements */}
                    <div className="grid grid-cols-2 gap-4">
                        {qualityScore.strengths && qualityScore.strengths.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-green-400 mb-2">✓ Strengths</h4>
                                <ul className="space-y-1">
                                    {qualityScore.strengths.map((strength, index) => (
                                        <li key={index} className="text-xs text-gray-400">• {strength}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {qualityScore.improvements && qualityScore.improvements.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-yellow-400 mb-2">⚠ Improvements</h4>
                                <ul className="space-y-1">
                                    {qualityScore.improvements.map((improvement, index) => (
                                        <li key={index} className="text-xs text-gray-400">• {improvement}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            ) : null}

            {/* Campaign Preview */}
            <div className="p-6 bg-gray-800 rounded-xl border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">Campaign Summary</h3>

                <div className="space-y-4">
                    {/* Cover Image */}
                    {data.coverImage && (
                        <img
                            src={data.coverImage}
                            alt="Cover"
                            className="w-full h-48 object-cover rounded-lg"
                        />
                    )}

                    {/* Title & Category */}
                    <div>
                        <h2 className="text-2xl font-bold text-white">{data.title}</h2>
                        <p className="text-purple-400">{data.category}</p>
                    </div>

                    {/* Goal */}
                    <div className="flex justify-between items-center p-4 bg-gray-900 rounded-lg">
                        <div>
                            <p className="text-sm text-gray-400">Funding Goal</p>
                            <p className="text-2xl font-bold text-white">₹{data.goal?.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Duration</p>
                            <p className="text-xl font-bold text-white">{data.duration} days</p>
                        </div>
                    </div>

                    {/* Story Preview */}
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-2">Story</h4>
                        <p className="text-sm text-gray-300 line-clamp-3">{data.story}</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-3 bg-gray-900 rounded-lg">
                            <p className="text-xs text-gray-400">Milestones</p>
                            <p className="text-lg font-bold text-white">{data.milestones?.length || 0}</p>
                        </div>
                        <div className="p-3 bg-gray-900 rounded-lg">
                            <p className="text-xs text-gray-400">Rewards</p>
                            <p className="text-lg font-bold text-white">{data.rewards?.length || 0}</p>
                        </div>
                        <div className="p-3 bg-gray-900 rounded-lg">
                            <p className="text-xs text-gray-400">FAQs</p>
                            <p className="text-lg font-bold text-white">{data.faqs?.length || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-4">
                <button
                    onClick={onBack}
                    className="px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-all"
                >
                    ← Back to Edit
                </button>
                <div className="text-sm text-gray-400">
                    Ready to publish? Click "Publish Campaign" at the bottom
                </div>
            </div>
        </div>
    );
}
