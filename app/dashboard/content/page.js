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
        <div className="min-h-screen bg-black text-gray-100">
            {/* Background Ambient Effects - Same as Dashboard */}
            <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />
            <div className="fixed bottom-0 left-20 w-[400px] h-[400px] bg-blue-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />

            {/* Main Content */}
            <main className="pt-24 px-4 md:px-8 pb-8 min-h-screen relative">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Content Manager</h1>
                        <p className="text-gray-400 mt-1">
                            Create updates to keep your supporters engaged
                        </p>
                    </div>

                    {/* Create Update Form */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">
                            Create New Update
                        </h2>
                        <CreateUpdateForm />
                    </div>

                    {/* Updates List */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">
                            Your Updates
                        </h2>
                        <UpdatesList />
                    </div>

                    {/* Best Practices */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span>✍️</span>
                            <span>Update Best Practices</span>
                        </h3>
                        <ul className="text-gray-300 text-sm space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="text-purple-400 mt-0.5">•</span>
                                <span>Post regular updates to keep supporters engaged (weekly is ideal)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-400 mt-0.5">•</span>
                                <span>Share progress, milestones, and behind-the-scenes content</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-400 mt-0.5">•</span>
                                <span>Be transparent about challenges and setbacks</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-400 mt-0.5">•</span>
                                <span>Include photos and videos to make updates more engaging</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-400 mt-0.5">•</span>
                                <span>Thank supporters and acknowledge their contributions</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-400 mt-0.5">•</span>
                                <span>Use "Supporters Only" updates to make backers feel special</span>
                            </li>
                        </ul>
                    </div>

                </div>
            </main>
        </div>
    );
}
