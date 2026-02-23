// components/campaign/BasicInfoStep.js
"use client"
import { useState, useEffect } from 'react';
import { toast } from '@/lib/apiToast';
import { Monitor, Palette, Music, Film, BookOpen, Gamepad2, UtensilsCrossed, Shirt, Star, Loader2, Sparkles } from 'lucide-react';

const CATEGORIES = [
    { value: 'technology', label: 'Technology', icon: Monitor },
    { value: 'art', label: 'Art & Design', icon: Palette },
    { value: 'music', label: 'Music', icon: Music },
    { value: 'film', label: 'Film & Video', icon: Film },
    { value: 'education', label: 'Education', icon: BookOpen },
    { value: 'games', label: 'Games', icon: Gamepad2 },
    { value: 'food', label: 'Food & Beverage', icon: UtensilsCrossed },
    { value: 'fashion', label: 'Fashion', icon: Shirt },
    { value: 'other', label: 'Other', icon: Star },
];

export default function BasicInfoStep({ data, onUpdate, onNext }) {
    const [formData, setFormData] = useState({
        category: data.category || '',
        projectType: data.projectType || '',
        goal: data.goal || '',
        duration: data.duration || 30,
        location: data.location || '',
    });

    const [errors, setErrors] = useState({});
    const [suggestedGoal, setSuggestedGoal] = useState(null);
    const [loadingGoal, setLoadingGoal] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSuggestGoal = async () => {
        if (!formData.category || !formData.projectType) {
            toast.error('Please select category and project type first');
            return;
        }

        setLoadingGoal(true);
        try {
            const response = await fetch('/api/ai/suggest-goal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: formData.category,
                    projectType: formData.projectType,
                    brief: 'General project in ' + formData.category,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setSuggestedGoal(data);
            }
        } catch (error) {
            console.error('Error getting goal suggestion:', error);
        } finally {
            setLoadingGoal(false);
        }
    };

    const handleUseSuggestedGoal = () => {
        if (suggestedGoal) {
            setFormData(prev => ({ ...prev, goal: suggestedGoal.suggestedGoal }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.projectType) newErrors.projectType = 'Project type is required';
        if (!formData.goal) {
            newErrors.goal = 'Funding goal is required';
        } else if (formData.goal < 1000) {
            newErrors.goal = 'Minimum goal is ₹1,000';
        }
        if (!formData.duration || formData.duration < 1 || formData.duration > 90) {
            newErrors.duration = 'Duration must be between 1-90 days';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validate()) {
            onUpdate(formData);
            onNext();
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Basic Information</h2>
                <p className="text-gray-400">Let's start with the essentials of your campaign</p>
            </div>

            {/* Category Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                    Campaign Category *
                </label>
                <div className="grid grid-cols-3 gap-3">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.value}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${formData.category === cat.value
                                ? 'border-purple-500 bg-purple-500/10'
                                : 'border-gray-700 hover:border-gray-600 bg-gray-800'
                                }`}
                        >
                            <div className="mb-1"><cat.icon className="w-6 h-6 text-purple-400" /></div>
                            <div className="text-sm font-medium text-white">
                                {cat.label}
                            </div>
                        </button>
                    ))}
                </div>
                {errors.category && <p className="mt-1 text-sm text-red-400">{errors.category}</p>}
            </div>

            {/* Project Type */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Project Type *
                </label>
                <input
                    type="text"
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleChange}
                    className={`w-full p-3 rounded-lg bg-gray-800 text-white border ${errors.projectType ? 'border-red-500' : 'border-gray-700'
                        } focus:outline-none focus:border-purple-500 transition-colors`}
                    placeholder="e.g., Mobile App, Documentary, Art Exhibition"
                />
                {errors.projectType && <p className="mt-1 text-sm text-red-400">{errors.projectType}</p>}
            </div>

            {/* Funding Goal */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-300">
                        Funding Goal (₹) *
                    </label>
                    <button
                        type="button"
                        onClick={handleSuggestGoal}
                        disabled={loadingGoal}
                        className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                        {loadingGoal ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Suggesting...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" /> AI Suggest Goal
                            </>
                        )}
                    </button>
                </div>
                <input
                    type="number"
                    name="goal"
                    value={formData.goal}
                    onChange={handleChange}
                    className={`w-full p-3 rounded-lg bg-gray-800 text-white border ${errors.goal ? 'border-red-500' : 'border-gray-700'
                        } focus:outline-none focus:border-purple-500 transition-colors`}
                    placeholder="50000"
                    min="1000"
                />
                {errors.goal && <p className="mt-1 text-sm text-red-400">{errors.goal}</p>}

                {/* AI Suggestion Card */}
                {suggestedGoal && (
                    <div className="mt-3 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="text-sm font-semibold text-purple-300">AI Suggested Goal</p>
                                <p className="text-2xl font-bold text-white">₹{suggestedGoal.suggestedGoal.toLocaleString()}</p>
                            </div>
                            <button
                                onClick={handleUseSuggestedGoal}
                                className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
                            >
                                Use This
                            </button>
                        </div>
                        <p className="text-sm text-gray-300 mb-2">{suggestedGoal.reasoning}</p>
                        {suggestedGoal.breakdown && (
                            <div className="text-xs text-gray-400 space-y-1">
                                <p className="font-semibold">Breakdown:</p>
                                {Object.entries(suggestedGoal.breakdown).map(([key, value]) => (
                                    <p key={key}>• {key}: ₹{value.toLocaleString()}</p>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Duration */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Campaign Duration (days) *
                </label>
                <div className="flex items-center gap-4">
                    <input
                        type="range"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        min="1"
                        max="90"
                        className="flex-1"
                    />
                    <span className="text-white font-semibold w-16 text-center">
                        {formData.duration} days
                    </span>
                </div>
                {errors.duration && <p className="mt-1 text-sm text-red-400">{errors.duration}</p>}
            </div>

            {/* Location */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location (Optional)
                </label>
                <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="e.g., Mumbai, India"
                />
            </div>

            {/* Next Button */}
            <div className="pt-4">
                <button
                    onClick={handleNext}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105"
                >
                    Continue to AI Story Generation →
                </button>
            </div>
        </div>
    );
}
