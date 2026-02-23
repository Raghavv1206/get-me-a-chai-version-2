// components/campaign/MediaStep.js
"use client"
import { useState } from 'react';
import { Lightbulb } from 'lucide-react';

export default function MediaStep({ data, onUpdate, onNext, onBack }) {
    const [formData, setFormData] = useState({
        coverImage: data.coverImage || '',
        gallery: data.gallery || [],
        videoUrl: data.videoUrl || '',
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddGalleryImage = () => {
        const url = prompt('Enter image URL:');
        if (url) {
            setFormData(prev => ({
                ...prev,
                gallery: [...prev.gallery, url],
            }));
        }
    };

    const handleRemoveGalleryImage = (index) => {
        setFormData(prev => ({
            ...prev,
            gallery: prev.gallery.filter((_, i) => i !== index),
        }));
    };

    const handleNext = () => {
        onUpdate(formData);
        onNext();
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Media & Visuals</h2>
                <p className="text-gray-400">Add images and videos to showcase your campaign</p>
            </div>

            {/* Cover Image */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cover Image URL (Optional)
                </label>
                <input
                    type="url"
                    value={formData.coverImage}
                    onChange={(e) => handleChange('coverImage', e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="https://example.com/image.jpg"
                />
                {formData.coverImage && (
                    <div className="mt-3">
                        <img
                            src={formData.coverImage}
                            alt="Cover preview"
                            className="w-full h-48 object-cover rounded-lg"
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/800x400?text=Invalid+Image+URL';
                            }}
                        />
                    </div>
                )}
                <p className="mt-2 text-xs text-gray-500">
                    <Lightbulb className="w-3 h-3 inline-block mr-1 text-yellow-400" /> Tip: Use a high-quality image (recommended: 1200×630px). If no image is provided, a default placeholder will be used.
                </p>
            </div>

            {/* Gallery Images */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Gallery Images (Optional)
                </label>
                <div className="grid grid-cols-3 gap-3 mb-3">
                    {formData.gallery.map((url, index) => (
                        <div key={index} className="relative group">
                            <img
                                src={url}
                                alt={`Gallery ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/300x200?text=Invalid+URL';
                                }}
                            />
                            <button
                                onClick={() => handleRemoveGalleryImage(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
                <button
                    onClick={handleAddGalleryImage}
                    className="w-full py-3 border-2 border-dashed border-gray-700 text-gray-400 rounded-xl hover:border-purple-500 hover:text-purple-400 transition-all"
                >
                    + Add Gallery Image
                </button>
            </div>

            {/* Video URL */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Video URL (Optional)
                </label>
                <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => handleChange('videoUrl', e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="https://youtube.com/watch?v=..."
                />
                <p className="mt-2 text-xs text-gray-500">
                    <Lightbulb className="w-3 h-3 inline-block mr-1 text-yellow-400" /> Supports YouTube and Vimeo links
                </p>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-blue-300">
                    <strong>Note:</strong> For this demo, we're using image URLs. In production, you would implement file upload functionality with cloud storage (e.g., Cloudinary, AWS S3).
                </p>
            </div>

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
                    Continue to FAQs →
                </button>
            </div>
        </div>
    );
}
