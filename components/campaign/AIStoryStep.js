// components/campaign/AIStoryStep.js
"use client"
import { useState } from 'react';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { toast } from '@/lib/apiToast';

export default function AIStoryStep({ data, onUpdate, onNext, onBack }) {
    const [formData, setFormData] = useState({
        brief: data.brief || '',
        title: data.title || '',
        hook: data.hook || '',
        story: data.story || '',
    });

    const [generating, setGenerating] = useState(false);
    const [streamedText, setStreamedText] = useState('');
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleGenerate = async () => {
        if (!formData.brief || formData.brief.length < 50) {
            setErrors({ brief: 'Please provide at least 50 characters describing your project' });
            return;
        }

        setGenerating(true);
        setStreamedText('');

        try {
            console.log('Sending request to generate campaign...');
            const response = await fetch('/api/ai/generate-campaign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: data.category,
                    projectType: data.projectType,
                    goal: data.goal,
                    brief: formData.brief,
                }),
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('API error:', errorData);
                throw new Error(errorData.details || errorData.error || 'Failed to generate story');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullText = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                fullText += chunk;
                setStreamedText(fullText);
            }

            // Parse the JSON response
            try {
                const jsonMatch = fullText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    setFormData(prev => ({
                        ...prev,
                        title: parsed.title || prev.title,
                        hook: parsed.hook || prev.hook,
                        story: parsed.story || prev.story,
                    }));
                } else {
                    // If no JSON, use the full text as story
                    setFormData(prev => ({ ...prev, story: fullText }));
                }
            } catch (parseError) {
                console.warn('JSON parsing failed, using raw text:', parseError);
                // If parsing fails, use the full text
                setFormData(prev => ({ ...prev, story: fullText }));
            }

        } catch (error) {
            console.error('Error generating story:', error);
            toast.error(`Failed to generate story: ${error.message}`);
        } finally {
            setGenerating(false);
        }
    };

    const handleRegenerate = () => {
        setFormData(prev => ({ ...prev, title: '', hook: '', story: '' }));
        setStreamedText('');
        handleGenerate();
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.brief) newErrors.brief = 'Brief description is required';
        if (!formData.title) newErrors.title = 'Campaign title is required';
        if (!formData.story) newErrors.story = 'Campaign story is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validate()) {
            onUpdate(formData);
            onNext();
        }
    };

    const charCount = formData.story?.length || 0;
    const wordCount = formData.story ? formData.story.trim().split(/\s+/).length : 0;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">AI Story Generation <Sparkles className="w-5 h-5 text-yellow-400" /></h2>
                <p className="text-gray-400">Let AI craft a compelling story for your campaign</p>
            </div>

            {/* Brief Description Input */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Brief Description (3-4 sentences) *
                </label>
                <textarea
                    name="brief"
                    value={formData.brief}
                    onChange={handleChange}
                    rows={4}
                    className={`w-full p-3 rounded-lg bg-gray-800 text-white border ${errors.brief ? 'border-red-500' : 'border-gray-700'
                        } focus:outline-none focus:border-purple-500 transition-colors resize-none overflow-y-auto`}
                    placeholder="Describe your project in a few sentences. What problem does it solve? Who is it for? What makes it unique?"
                />
                <div className="flex justify-between mt-1">
                    {errors.brief && <p className="text-sm text-red-400">{errors.brief}</p>}
                    <p className="text-sm text-gray-500 ml-auto">{formData.brief.length} / 500</p>
                </div>
            </div>

            {/* Generate Button */}
            <div>
                <button
                    onClick={handleGenerate}
                    disabled={generating || !formData.brief}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {generating ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Generating with AI...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5" /> Generate Campaign Story with AI
                        </>
                    )}
                </button>
            </div>

            {/* Streaming Display */}
            {generating && streamedText && (
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="animate-pulse text-purple-400">●</span>
                        <span className="text-sm font-semibold text-purple-300">AI is writing...</span>
                    </div>
                    <div className="text-gray-300 whitespace-pre-wrap text-sm">
                        {streamedText}
                        <span className="animate-pulse">|</span>
                    </div>
                </div>
            )}

            {/* Generated Content - Editable */}
            {formData.title && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-white">Generated Content (Editable)</h3>
                        <button
                            onClick={handleRegenerate}
                            className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                        >
                            <RefreshCw className="w-4 h-4" /> Regenerate
                        </button>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Campaign Title *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className={`w-full p-3 rounded-lg bg-gray-800 text-white border ${errors.title ? 'border-red-500' : 'border-gray-700'
                                } focus:outline-none focus:border-purple-500 transition-colors`}
                            placeholder="Your campaign title"
                        />
                        {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title}</p>}
                    </div>

                    {/* Hook */}
                    {formData.hook && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Opening Hook
                            </label>
                            <textarea
                                name="hook"
                                value={formData.hook}
                                onChange={handleChange}
                                rows={3}
                                className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-purple-500 transition-colors resize-none overflow-y-auto"
                            />
                        </div>
                    )}

                    {/* Story */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Campaign Story *
                        </label>
                        <textarea
                            name="story"
                            value={formData.story}
                            onChange={handleChange}
                            rows={15}
                            className={`w-full p-3 rounded-lg bg-gray-800 text-white border ${errors.story ? 'border-red-500' : 'border-gray-700'
                                } focus:outline-none focus:border-purple-500 transition-colors resize-none font-mono text-sm overflow-y-auto`}
                        />
                        <div className="flex justify-between mt-1">
                            {errors.story && <p className="text-sm text-red-400">{errors.story}</p>}
                            <p className="text-sm text-gray-500 ml-auto">
                                {charCount} characters • {wordCount} words
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
                <button
                    onClick={onBack}
                    className="px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-all"
                >
                    ← Back
                </button>
                <button
                    onClick={handleNext}
                    disabled={!formData.title || !formData.story}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Continue to Milestones →
                </button>
            </div>
        </div>
    );
}
