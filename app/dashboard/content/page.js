// app/dashboard/content/page.js
/**
 * Content Manager Page
 * Create and manage campaign updates/posts
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import UpdatesList from '@/components/content/UpdatesList';
import CreateUpdateForm from '@/components/content/CreateUpdateForm';

export const metadata = {
    title: 'Content Manager - Get Me A Chai',
    description: 'Create and manage campaign updates'
};

export default async function ContentPage() {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login?callbackUrl=/dashboard/content');
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Content Manager</h1>
                <p className="text-gray-400">
                    Create updates to keep your supporters engaged
                </p>
            </div>

            {/* Create Update Form */}
            <div className="mb-8">
                <div className="bg-gray-900/50 backdrop-blur-md rounded-xl border border-gray-800 p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">
                        Create New Update
                    </h2>
                    <CreateUpdateForm />
                </div>
            </div>

            {/* Updates List */}
            <div className="mb-8">
                <div className="bg-gray-900/50 backdrop-blur-md rounded-xl border border-gray-800 p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">
                        Your Updates
                    </h2>
                    <UpdatesList />
                </div>
            </div>

            {/* Best Practices */}
            <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/20">
                <h3 className="text-lg font-semibold text-white mb-2">
                    ✍️ Update Best Practices
                </h3>
                <ul className="text-gray-300 text-sm space-y-2">
                    <li>• Post regular updates to keep supporters engaged (weekly is ideal)</li>
                    <li>• Share progress, milestones, and behind-the-scenes content</li>
                    <li>• Be transparent about challenges and setbacks</li>
                    <li>• Include photos and videos to make updates more engaging</li>
                    <li>• Thank supporters and acknowledge their contributions</li>
                    <li>• Use "Supporters Only" updates to make backers feel special</li>
                </ul>
            </div>
        </div>
    );
}
