// app/dashboard/settings/page.js
/**
 * Settings Page
 * User profile and account settings
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDb from '@/db/connectDb';
import User from '@/models/User';
import SettingsForm from '@/components/dashboard/SettingsForm';
import NotificationPreferences from '@/components/notifications/NotificationPreferences';
import { Shield } from 'lucide-react';

export const metadata = {
    title: 'Settings - Get Me A Chai',
    description: 'Manage your account settings and preferences'
};

export default async function SettingsPage() {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login?callbackUrl=/dashboard/settings');
    }

    // Fetch user data
    await connectDb();
    const user = await User.findOne({ email: session.user.email }).lean();

    if (!user) {
        redirect('/login');
    }

    // Serialize user data
    const userData = {
        ...user,
        _id: user._id.toString(),
        createdAt: user.createdAt?.toISOString(),
        updatedAt: user.updatedAt?.toISOString()
    };

    return (
        <div className="min-h-screen bg-black text-gray-100">
            {/* Background Ambient Effects - Same as Dashboard */}
            <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />
            <div className="fixed bottom-0 left-20 w-[400px] h-[400px] bg-blue-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />

            {/* Main Content */}
            <main className="pt-24 px-4 md:px-8 pb-8 min-h-screen relative">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
                        <p className="text-gray-400 mt-1">
                            Manage your account settings and preferences
                        </p>
                    </div>

                    {/* Profile & Payment Settings */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">
                            Profile & Payment Settings
                        </h2>
                        <SettingsForm user={userData} />
                    </div>

                    {/* Notification Preferences */}
                    <NotificationPreferences />

                    {/* Account Actions */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">
                            Account Actions
                        </h2>
                        <div className="space-y-4">
                            <button className="w-full sm:w-auto px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors border border-gray-700">
                                Change Password
                            </button>
                            <button className="w-full sm:w-auto px-6 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors border border-red-500/30 ml-0 sm:ml-4">
                                Delete Account
                            </button>
                        </div>
                    </div>

                    {/* Security Notice */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span><Shield className="w-5 h-5 text-yellow-400" /></span>
                            <span>Security & Privacy</span>
                        </h3>
                        <ul className="text-gray-300 text-sm space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="text-yellow-500/70 mt-0.5">•</span>
                                <span>Your payment credentials are encrypted and stored securely</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-yellow-500/70 mt-0.5">•</span>
                                <span>We never share your personal information with third parties</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-yellow-500/70 mt-0.5">•</span>
                                <span>Enable two-factor authentication for added security (coming soon)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-yellow-500/70 mt-0.5">•</span>
                                <span>Review your connected apps and sessions regularly</span>
                            </li>
                        </ul>
                    </div>

                </div>
            </main>
        </div>
    );
}
