'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaArrowLeft, FaSave, FaSpinner } from 'react-icons/fa';
import Image from 'next/image';

export default function EditCampaignPage() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [campaign, setCampaign] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        shortDescription: '',
        story: '',
        goalAmount: '',
        endDate: '',
        coverImage: '',
        videoUrl: '',
        location: '',
        tags: '',
        milestones: [],
        rewards: [],
        faqs: []
    });

    useEffect(() => {
        fetchCampaign();
    }, [params.id]);

    const fetchCampaign = async () => {
        try {
            const response = await fetch(`/api/campaigns/${params.id}`);
            if (!response.ok) throw new Error('Failed to fetch campaign');

            const data = await response.json();
            if (data.success) {
                setCampaign(data.campaign);

                // Format date for input
                const endDate = data.campaign.endDate
                    ? new Date(data.campaign.endDate).toISOString().split('T')[0]
                    : '';

                setFormData({
                    title: data.campaign.title || '',
                    category: data.campaign.category || '',
                    shortDescription: data.campaign.shortDescription || '',
                    story: data.campaign.story || '',
                    goalAmount: data.campaign.goalAmount || '',
                    endDate: endDate,
                    coverImage: data.campaign.coverImage || '',
                    videoUrl: data.campaign.videoUrl || '',
                    location: data.campaign.location || '',
                    tags: (data.campaign.tags || []).join(', '),
                    milestones: data.campaign.milestones || [],
                    rewards: data.campaign.rewards || [],
                    faqs: data.campaign.faqs || []
                });
            }
        } catch (err) {
            setError('Failed to load campaign');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleArrayChange = (index, field, value, arrayName) => {
        setFormData(prev => ({
            ...prev,
            [arrayName]: prev[arrayName].map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const addArrayItem = (arrayName, template) => {
        setFormData(prev => ({
            ...prev,
            [arrayName]: [...prev[arrayName], template]
        }));
    };

    const removeArrayItem = (index, arrayName) => {
        setFormData(prev => ({
            ...prev,
            [arrayName]: prev[arrayName].filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const payload = {
                ...formData,
                goalAmount: Number(formData.goalAmount),
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
            };

            const response = await fetch(`/api/campaigns/${params.id}/update`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.success) {
                router.push('/dashboard/campaigns');
            } else {
                setError(data.message || 'Failed to update campaign');
            }
        } catch (err) {
            setError('An error occurred while updating the campaign');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <FaSpinner className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading campaign...</p>
                </div>
            </div>
        );
    }

    if (error && !campaign) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                        onClick={() => router.push('/dashboard/campaigns')}
                        className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all"
                    >
                        Back to Campaigns
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/dashboard/campaigns')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-all mb-4"
                    >
                        <FaArrowLeft className="w-4 h-4" />
                        <span>Back to Campaigns</span>
                    </button>
                    <h1 className="text-3xl font-bold text-white">Edit Campaign</h1>
                    <p className="text-gray-400 mt-2">Update your campaign details</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Basic Information</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Campaign Title *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    maxLength={100}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Enter campaign title"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Category *
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="" className="bg-gray-900">Select category</option>
                                        <option value="technology" className="bg-gray-900">Technology</option>
                                        <option value="art" className="bg-gray-900">Art</option>
                                        <option value="music" className="bg-gray-900">Music</option>
                                        <option value="film" className="bg-gray-900">Film</option>
                                        <option value="education" className="bg-gray-900">Education</option>
                                        <option value="games" className="bg-gray-900">Games</option>
                                        <option value="food" className="bg-gray-900">Food</option>
                                        <option value="fashion" className="bg-gray-900">Fashion</option>
                                        <option value="other" className="bg-gray-900">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="City, Country"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Short Description
                                </label>
                                <input
                                    type="text"
                                    name="shortDescription"
                                    value={formData.shortDescription}
                                    onChange={handleChange}
                                    maxLength={200}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Brief description of your campaign"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Campaign Story *
                                </label>
                                <textarea
                                    name="story"
                                    value={formData.story}
                                    onChange={handleChange}
                                    required
                                    rows={8}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                    placeholder="Tell your story..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Funding Details */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Funding Details</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Goal Amount (₹) *
                                </label>
                                <input
                                    type="number"
                                    name="goalAmount"
                                    value={formData.goalAmount}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="10000"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    End Date *
                                </label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Media */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Media</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Cover Image URL
                                </label>
                                <input
                                    type="url"
                                    name="coverImage"
                                    value={formData.coverImage}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="https://example.com/image.jpg"
                                />
                                {formData.coverImage && (
                                    <div className="mt-3 relative w-full h-48 rounded-xl overflow-hidden">
                                        <Image
                                            src={formData.coverImage}
                                            alt="Cover preview"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Video URL (YouTube, Vimeo, etc.)
                                </label>
                                <input
                                    type="url"
                                    name="videoUrl"
                                    value={formData.videoUrl}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="https://youtube.com/watch?v=..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Tags</h2>
                        <input
                            type="text"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="gaming, indie, creative (comma separated)"
                        />
                    </div>

                    {/* Milestones */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white">Milestones</h2>
                            <button
                                type="button"
                                onClick={() => addArrayItem('milestones', { title: '', amount: '', description: '' })}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all text-sm"
                            >
                                Add Milestone
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.milestones.map((milestone, index) => (
                                <div key={index} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                    <div className="flex items-start justify-between mb-3">
                                        <span className="text-sm font-medium text-gray-400">Milestone {index + 1}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeArrayItem(index, 'milestones')}
                                            className="text-red-400 hover:text-red-300 text-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={milestone.title}
                                            onChange={(e) => handleArrayChange(index, 'title', e.target.value, 'milestones')}
                                            placeholder="Milestone title"
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                        <input
                                            type="number"
                                            value={milestone.amount}
                                            onChange={(e) => handleArrayChange(index, 'amount', e.target.value, 'milestones')}
                                            placeholder="Amount (₹)"
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                        <textarea
                                            value={milestone.description}
                                            onChange={(e) => handleArrayChange(index, 'description', e.target.value, 'milestones')}
                                            placeholder="Description"
                                            rows={2}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Rewards */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white">Rewards</h2>
                            <button
                                type="button"
                                onClick={() => addArrayItem('rewards', { title: '', amount: '', description: '', deliveryTime: '' })}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all text-sm"
                            >
                                Add Reward
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.rewards.map((reward, index) => (
                                <div key={index} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                    <div className="flex items-start justify-between mb-3">
                                        <span className="text-sm font-medium text-gray-400">Reward {index + 1}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeArrayItem(index, 'rewards')}
                                            className="text-red-400 hover:text-red-300 text-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={reward.title}
                                            onChange={(e) => handleArrayChange(index, 'title', e.target.value, 'rewards')}
                                            placeholder="Reward title"
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <input
                                                type="number"
                                                value={reward.amount}
                                                onChange={(e) => handleArrayChange(index, 'amount', e.target.value, 'rewards')}
                                                placeholder="Amount (₹)"
                                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                            <input
                                                type="text"
                                                value={reward.deliveryTime}
                                                onChange={(e) => handleArrayChange(index, 'deliveryTime', e.target.value, 'rewards')}
                                                placeholder="Delivery time"
                                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                        <textarea
                                            value={reward.description}
                                            onChange={(e) => handleArrayChange(index, 'description', e.target.value, 'rewards')}
                                            placeholder="Description"
                                            rows={2}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FAQs */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white">FAQs</h2>
                            <button
                                type="button"
                                onClick={() => addArrayItem('faqs', { question: '', answer: '' })}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all text-sm"
                            >
                                Add FAQ
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.faqs.map((faq, index) => (
                                <div key={index} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                    <div className="flex items-start justify-between mb-3">
                                        <span className="text-sm font-medium text-gray-400">FAQ {index + 1}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeArrayItem(index, 'faqs')}
                                            className="text-red-400 hover:text-red-300 text-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={faq.question}
                                            onChange={(e) => handleArrayChange(index, 'question', e.target.value, 'faqs')}
                                            placeholder="Question"
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                        <textarea
                                            value={faq.answer}
                                            onChange={(e) => handleArrayChange(index, 'answer', e.target.value, 'faqs')}
                                            placeholder="Answer"
                                            rows={2}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {saving ? (
                                <>
                                    <FaSpinner className="w-5 h-5 animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <FaSave className="w-5 h-5" />
                                    <span>Save Changes</span>
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push('/dashboard/campaigns')}
                            disabled={saving}
                            className="px-6 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
