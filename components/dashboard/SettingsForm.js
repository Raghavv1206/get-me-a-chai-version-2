// components/dashboard/SettingsForm.js
"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiToast } from '@/lib/apiToast';
import { CreditCard } from 'lucide-react';

export default function SettingsForm({ user }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        profileImage: user?.profileImage || '',
        coverImage: user?.coverImage || '',
        bio: user?.bio || '',
        username: user?.username || '',
        razorpayid: user?.razorpayid || '',
        razorpaysecret: user?.razorpaysecret || '',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await apiToast(
                () => fetch('/api/user/update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                }),
                {
                    loading: 'Saving settings...',
                    success: 'Settings updated successfully!',
                    error: 'Failed to update settings'
                }
            );

            const data = await response.json();

            if (data.success) {
                setMessage('Settings updated successfully!');
                router.refresh();
            } else {
                setMessage(data.error || 'Failed to update settings');
            }
        } catch (error) {
            setMessage('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
                <div className={`p-3 rounded-lg ${message.includes('success') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {message}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name
                </label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                </label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    required
                    disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                </label>
                <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bio
                </label>
                <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="Tell us about yourself..."
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Profile Image URL
                </label>
                <input
                    type="url"
                    name="profileImage"
                    value={formData.profileImage}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="https://example.com/image.jpg"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cover Image URL
                </label>
                <input
                    type="url"
                    name="coverImage"
                    value={formData.coverImage}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="https://example.com/cover.jpg"
                />
            </div>

            {/* Payment Settings Section */}
            <div className="pt-6 mt-6 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-purple-400" /> Payment Settings</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Razorpay Key ID
                        </label>
                        <input
                            type="text"
                            name="razorpayid"
                            value={formData.razorpayid}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                            placeholder="rzp_test_xxxxxxxxxxxxx"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Required to receive payments. Get your key from{' '}
                            <a
                                href="https://dashboard.razorpay.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-400 hover:text-purple-300"
                            >
                                Razorpay Dashboard
                            </a>
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Razorpay Secret
                        </label>
                        <input
                            type="password"
                            name="razorpaysecret"
                            value={formData.razorpaysecret}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                            placeholder="Enter your Razorpay Secret"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Keep this secret safe. Never share it publicly.
                        </p>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Saving...' : 'Save Changes'}
            </button>
        </form>
    );
}
