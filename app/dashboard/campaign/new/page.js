// app/dashboard/campaign/new/page.js
"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import CampaignBuilderWizard from '@/components/campaign/CampaignBuilderWizard';

/**
 * NewCampaignPage Component
 * 
 * Protected page for creating new campaigns. Requires authentication.
 * Redirects unauthenticated users to login page.
 * 
 * @returns {JSX.Element} Campaign creation page or loading/error state
 */
export default function NewCampaignPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [hasRedirected, setHasRedirected] = useState(false);

    // Handle authentication redirect
    useEffect(() => {
        // Only redirect once to prevent infinite loops
        if (status === 'unauthenticated' && !hasRedirected) {
            console.log('[NewCampaignPage] User not authenticated, redirecting to login');
            setHasRedirected(true);

            // Preserve the intended destination for post-login redirect
            const currentPath = window.location.pathname;
            router.push(`/login?callbackUrl=${encodeURIComponent(currentPath)}`);
        }
    }, [status, router, hasRedirected]);

    // Loading state - show while checking authentication
    if (status === 'loading') {
        return (
            <div
                className="min-h-screen bg-gray-950 flex items-center justify-center"
                role="status"
                aria-live="polite"
                aria-label="Loading campaign builder"
            >
                <div className="text-center">
                    {/* Loading Spinner */}
                    <div className="inline-block w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"
                        aria-hidden="true"
                    />
                    <div className="text-white text-lg font-medium">
                        Loading Campaign Builder...
                    </div>
                    <div className="text-gray-400 text-sm mt-2">
                        Please wait while we prepare your workspace
                    </div>
                </div>
            </div>
        );
    }

    // Unauthenticated state - show briefly before redirect
    if (!session || status === 'unauthenticated') {
        return (
            <div
                className="min-h-screen bg-gray-950 flex items-center justify-center"
                role="alert"
                aria-live="assertive"
            >
                <div className="text-center">
                    <div className="text-white text-lg font-medium mb-2">
                        Authentication Required
                    </div>
                    <div className="text-gray-400 text-sm">
                        Redirecting to login page...
                    </div>
                </div>
            </div>
        );
    }

    // Authenticated state - render campaign builder
    return (
        <div className="min-h-screen bg-gray-950">
            <CampaignBuilderWizard />
        </div>
    );
}

