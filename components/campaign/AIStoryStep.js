// components/campaign/AIStoryStep.js
"use client"
import { useState } from 'react';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { toast } from '@/lib/apiToast';

/**
 * Robustly extracts { title, hook, story } from an AI response string.
 *
 * Strategy (tried in order):
 * 1. Strip markdown code fences (```json ... ``` or ``` ... ```)
 * 2. Extract the first {...} block and JSON.parse it
 * 3. If the JSON has a nested "story" key that is itself JSON → unwrap it
 * 4. Return the raw text as the story if all JSON parsing fails
 *
 * @param {string} raw  Full streamed response text
 * @returns {{ title: string, hook: string, story: string }}
 */
function parseAIResponse(raw) {
    if (!raw || typeof raw !== 'string') return { title: '', hook: '', story: '' };

    // 1. Strip markdown code fences if present
    let cleaned = raw
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```\s*$/i, '')
        .trim();

    // 2. Attempt to extract the outermost { … } block
    const braceStart = cleaned.indexOf('{');
    const braceEnd   = cleaned.lastIndexOf('}');

    if (braceStart !== -1 && braceEnd > braceStart) {
        try {
            const jsonStr = cleaned.slice(braceStart, braceEnd + 1);
            const parsed  = JSON.parse(jsonStr);

            let story = parsed.story ?? '';
            let hook  = parsed.hook  ?? '';
            let title = parsed.title ?? '';

            // 3. Guard: if story is itself a JSON string (shouldn't happen but handle it)
            if (typeof story === 'string' && story.trimStart().startsWith('{')) {
                try {
                    const inner = JSON.parse(story);
                    story = inner.story ?? story;
                    hook  = hook  || inner.hook  || '';
                    title = title || inner.title || '';
                } catch {
                    // inner is not JSON, keep as-is
                }
            }

            return {
                title: typeof title === 'string' ? title.trim() : '',
                hook:  typeof hook  === 'string' ? hook.trim()  : '',
                story: typeof story === 'string' ? story.trim() : '',
            };
        } catch {
            // JSON.parse failed — fall through to plain-text fallback
        }
    }

    // 4. Plain-text fallback: use the whole cleaned text as the story
    return { title: '', hook: '', story: cleaned };
}

export default function AIStoryStep({ data, onUpdate, onLiveSync, onNext, onBack }) {
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
        const newData = { ...formData, [name]: value };
        setFormData(newData);
        // Sync to parent in real-time so title is always available
        if (onLiveSync) onLiveSync(newData);
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

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.details || errorData.error || 'Failed to generate story');
            }

            if (!response.body) {
                throw new Error('No response body received from AI service');
            }

            const reader  = response.body.getReader();
            const decoder = new TextDecoder();
            let fullText  = '';

            // Read the full stream
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                fullText += decoder.decode(value, { stream: !done });
                setStreamedText(fullText);
            }

            // Parse using the robust multi-strategy parser
            const { title, hook, story } = parseAIResponse(fullText);

            if (!story) {
                // The AI returned something we couldn't parse at all
                throw new Error('AI returned an empty or unreadable response. Please try again.');
            }

            const newData = {
                ...formData,
                title: title || formData.title,
                hook:  hook  || formData.hook,
                story,
            };
            setFormData(newData);
            if (onLiveSync) onLiveSync(newData);

        } catch (error) {
            console.error('Error generating story:', error);
            toast.error(`Failed to generate story: ${error.message}`);
        } finally {
            setGenerating(false);
            // Clear the raw stream buffer — we've already parsed and populated the fields
            setStreamedText('');
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

            {/* Streaming progress indicator — shows a pulsing message, not raw JSON */}
            {generating && (
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="animate-pulse text-purple-400">●</span>
                        <span className="text-sm font-semibold text-purple-300">AI is writing your campaign story...</span>
                    </div>
                    <div className="flex gap-1 mt-1">
                        {[0, 1, 2].map(i => (
                            <span
                                key={i}
                                className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                                style={{ animationDelay: `${i * 0.15}s` }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Campaign Title - ALWAYS visible so user can type manually */}
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
                    placeholder="Enter your campaign title or generate one with AI above"
                />
                {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title}</p>}
            </div>

            {/* AI Generated Content Section - Regenerate button only shows after generation */}
            {(formData.title || formData.story) && (
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Content (Editable)</h3>
                    <button
                        onClick={handleRegenerate}
                        className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                        <RefreshCw className="w-4 h-4" /> Regenerate
                    </button>
                </div>
            )}

            {/* Hook - only shown after AI generates one */}
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

            {/* Campaign Story - ALWAYS visible so user can type manually */}
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
                    placeholder="Write your campaign story or generate one with AI above"
                />
                <div className="flex justify-between mt-1">
                    {errors.story && <p className="text-sm text-red-400">{errors.story}</p>}
                    <p className="text-sm text-gray-500 ml-auto">
                        {charCount} characters • {wordCount} words
                    </p>
                </div>
            </div>

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
