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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-20 p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                <p className="text-gray-400">
                    Manage your account settings and preferences
                </p>
            </div>

            {/* Profile & Payment Settings */}
            <div className="mb-8">
                <div className="bg-gray-900/50 backdrop-blur-md rounded-xl border border-gray-800 p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">
                        Profile & Payment Settings
                    </h2>
                    <SettingsForm user={userData} />
                </div>
            </div>

            {/* Notification Preferences */}
            <div className="mb-8">
                <NotificationPreferences />
            </div>

            {/* Account Actions */}
            <div className="mb-8">
                <div className="bg-gray-900/50 backdrop-blur-md rounded-xl border border-gray-800 p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">
                        Account Actions
                    </h2>
                    <div className="space-y-4">
                        <button className="w-full sm:w-auto px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
                            Change Password
                        </button>
                        <button className="w-full sm:w-auto px-6 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors border border-red-500/30 ml-0 sm:ml-4">
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>

            {/* Security Notice */}
            <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-xl p-6 border border-yellow-500/20">
                <h3 className="text-lg font-semibold text-white mb-2">
                    🔒 Security & Privacy
                </h3>
                <ul className="text-gray-300 text-sm space-y-2">
                    <li>• Your payment credentials are encrypted and stored securely</li>
                    <li>• We never share your personal information with third parties</li>
                    <li>• Enable two-factor authentication for added security (coming soon)</li>
                    <li>• Review your connected apps and sessions regularly</li>
                </ul>
            </div>
        </div>
    );
}
