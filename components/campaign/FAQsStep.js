// components/campaign/FAQsStep.js
"use client"
import { useState } from 'react';
import { toast } from '@/lib/apiToast';

export default function FAQsStep({ data, onUpdate, onNext, onBack }) {
    const [faqs, setFaqs] = useState(data.faqs || []);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/ai/generate-faqs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: data.category,
                    story: data.story || data.brief || data.title || '',
                    goal: data.goal,
                    brief: data.brief,
                    title: data.title
                }),
            });

            if (response.ok) {
                const result = await response.json();
                setFaqs(result.faqs || []);
            } else {
                // Show error from API
                const error = await response.json();
                console.error('API error:', error);
                toast.error(error.error || 'Failed to generate FAQs');
            }
        } catch (error) {
            console.error('Error generating FAQs:', error);
            toast.error('Failed to generate FAQs');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setFaqs([
            ...faqs,
            {
                question: '',
                answer: '',
            },
        ]);
    };

    const handleRemove = (index) => {
        setFaqs(faqs.filter((_, i) => i !== index));
    };

    const handleChange = (index, field, value) => {
        const updated = [...faqs];
        updated[index][field] = value;
        setFaqs(updated);
    };

    const handleNext = () => {
        onUpdate({ faqs });
        onNext();
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Frequently Asked Questions</h2>
                <p className="text-gray-400">Answer common questions supporters might have</p>
            </div>

            {/* AI Generate Button */}
            <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105 disabled:opacity-50"
            >
                {loading ? '⚙️ Generating...' : '✨ AI Generate FAQs'}
            </button>

            {/* FAQs List */}
            <div className="space-y-4">
                {faqs.map((faq, index) => (
                    <div key={index} className="p-4 bg-gray-800 rounded-xl border border-gray-700">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="text-white font-semibold">FAQ {index + 1}</h3>
                            <button
                                onClick={() => handleRemove(index)}
                                className="text-red-400 hover:text-red-300 text-sm"
                            >
                                ✕ Remove
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Question</label>
                                <input
                                    type="text"
                                    value={faq.question}
                                    onChange={(e) => handleChange(index, 'question', e.target.value)}
                                    placeholder="What is your question?"
                                    className="w-full p-2 rounded bg-gray-900 text-white border border-gray-700 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Answer</label>
                                <textarea
                                    value={faq.answer}
                                    onChange={(e) => handleChange(index, 'answer', e.target.value)}
                                    placeholder="Provide a clear answer"
                                    rows={3}
                                    className="w-full p-2 rounded bg-gray-900 text-white border border-gray-700 text-sm resize-none"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add FAQ Button */}
            <button
                onClick={handleAdd}
                className="w-full py-3 border-2 border-dashed border-gray-700 text-gray-400 rounded-xl hover:border-purple-500 hover:text-purple-400 transition-all"
            >
                + Add FAQ
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
                    Continue to Preview →
                </button>
            </div>
        </div>
    );
}
