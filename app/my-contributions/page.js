// app/my-contributions/page.js
"use client"

/**
 * My Contributions Page
 * 
 * Features:
 * - Contributions summary
 * - Timeline of contributions
 * - Badges display
 * - Subscriptions manager
 * - Campaign updates
 * - Impact story
 * - Receipt downloads
 * 
 * @page
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Download, RefreshCw } from 'lucide-react';
import { toast } from '@/lib/apiToast';
import ContributionsSummary from '@/components/contributions/ContributionsSummary';
import ContributionsTimeline from '@/components/contributions/ContributionsTimeline';
import BadgesDisplay from '@/components/contributions/BadgesDisplay';
import { getContributions, generateReceipt, getBadges } from '@/actions/contributionsActions';

export default function MyContributionsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const [contributionsData, setContributionsData] = useState(null);
    const [badgesData, setBadgesData] = useState(null);

    // ========================================================================
    // AUTHENTICATION CHECK
    // ========================================================================

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login?callbackUrl=/my-contributions');
        }
    }, [status, router]);

    // ========================================================================
    // FETCH DATA
    // ========================================================================

    useEffect(() => {
        if (session?.user?.id) {
            fetchData();
        }
    }, [session]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [contributionsResult, badgesResult] = await Promise.all([
                getContributions(session.user.id),
                getBadges(session.user.id),
            ]);

            if (contributionsResult.success) {
                setContributionsData(contributionsResult);
            } else {
                throw new Error(contributionsResult.error);
            }

            if (badgesResult.success) {
                setBadgesData(badgesResult);
            }

        } catch (err) {
            console.error('Error fetching contributions:', err);
            setError(err.message || 'Failed to load contributions');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    // ========================================================================
    // RECEIPT DOWNLOAD
    // ========================================================================

    const handleDownloadReceipt = async (paymentId) => {
        try {
            const result = await generateReceipt(paymentId, session.user.id);

            if (result.success) {
                // Create downloadable receipt
                const receiptText = `
GET ME A CHAI - DONATION RECEIPT
================================

Receipt Number: ${result.receipt.receiptNumber}
Date: ${result.receipt.date}
Payment ID: ${result.receipt.paymentId}

Donor Information:
Name: ${result.receipt.donorName}
Email: ${result.receipt.donorEmail}

Campaign: ${result.receipt.campaignTitle}

Amount: ${result.receipt.currency} ${result.receipt.amount}

${result.receipt.message ? `Message: ${result.receipt.message}` : ''}

${result.receipt.taxDeductible ? 'This donation is tax-deductible.' : ''}

Thank you for your generous support!
================================
                `.trim();

                // Download as text file
                const blob = new Blob([receiptText], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `receipt-${result.receipt.receiptNumber}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } else {
                toast.error(result.error || 'Failed to generate receipt');
            }
        } catch (err) {
            console.error('Error downloading receipt:', err);
            toast.error('Failed to download receipt');
        }
    };

    // ========================================================================
    // LOADING STATE
    // ========================================================================

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-black text-gray-100">
                <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />
                <div className="fixed bottom-0 left-20 w-[400px] h-[400px] bg-blue-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />
                <main className="pt-24 px-4 md:px-8 pb-8 min-h-screen relative">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <div className="animate-pulse space-y-8">
                            <div className="h-12 w-64 bg-white/5 rounded" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="h-40 bg-white/5 rounded-2xl" />
                                ))}
                            </div>
                            <div className="h-96 bg-white/5 rounded-2xl" />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // ========================================================================
    // ERROR STATE
    // ========================================================================

    if (error) {
        return (
            <div className="min-h-screen bg-black text-gray-100">
                <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />
                <div className="fixed bottom-0 left-20 w-[400px] h-[400px] bg-blue-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />
                <main className="pt-24 px-4 md:px-8 pb-8 min-h-screen relative">
                    <div className="max-w-2xl mx-auto bg-red-900/20 rounded-2xl p-8 border-2 border-red-900/50 text-center backdrop-blur-xl">
                        <h2 className="text-2xl font-bold text-red-200 mb-4">
                            Error Loading Contributions
                        </h2>
                        <p className="text-red-300 mb-6">{error}</p>
                        <button
                            onClick={handleRefresh}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Try Again
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    // ========================================================================
    // RENDER
    // ========================================================================

    return (
        <div className="min-h-screen bg-black text-gray-100">
            {/* Background Ambient Effects - Same as Dashboard */}
            <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />
            <div className="fixed bottom-0 left-20 w-[400px] h-[400px] bg-blue-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />

            {/* Main Content */}
            <main className="pt-24 px-4 md:px-8 pb-8 min-h-screen relative">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">
                                💝 My Contributions
                            </h1>
                            <p className="text-gray-400">
                                Track your impact and support history
                            </p>
                        </div>

                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50 text-gray-300 hover:text-white"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                    </div>

                    {/* Summary Cards */}
                    <div className="mb-12">
                        <ContributionsSummary
                            summary={contributionsData?.summary}
                            badges={badgesData?.badges}
                            impactScore={badgesData?.impactScore || 0}
                            loading={loading}
                        />
                    </div>

                    {/* Badges */}
                    <div className="mb-12">
                        <BadgesDisplay
                            badges={badgesData?.badges}
                            loading={loading}
                        />
                    </div>

                    {/* Timeline */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-white mb-6">
                            Contribution History
                        </h2>
                        <ContributionsTimeline
                            groupedByMonth={contributionsData?.groupedByMonth}
                            loading={loading}
                            onDownloadReceipt={handleDownloadReceipt}
                        />
                    </div>

                    {/* Impact Story */}
                    {contributionsData?.summary?.totalAmount > 0 && (
                        <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-2xl p-8 border border-white/10 backdrop-blur-xl">
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                <span>🌟</span>
                                <span>Your Impact</span>
                            </h2>
                            <div className="prose prose-invert max-w-none">
                                <p className="text-gray-300 text-lg leading-relaxed">
                                    You've contributed <strong className="text-purple-400">₹{contributionsData.summary.totalAmount.toLocaleString()}</strong> across{' '}
                                    <strong className="text-purple-400">{contributionsData.summary.campaignsSupported}</strong> campaign{contributionsData.summary.campaignsSupported !== 1 ? 's' : ''}.
                                    Your generosity has helped creators bring their ideas to life and make a real difference in the community.
                                </p>
                                {badgesData?.badges?.length > 0 && (
                                    <p className="text-gray-300 leading-relaxed mt-4">
                                        You've earned <strong className="text-blue-400">{badgesData.badges.length}</strong> achievement badge{badgesData.badges.length !== 1 ? 's' : ''} and
                                        have an impact score of <strong className="text-blue-400">{badgesData.impactScore.toLocaleString()}</strong> points!
                                    </p>
                                )}
                                <p className="text-gray-400 mt-4 italic">
                                    Thank you for being an amazing supporter! Every contribution, no matter the size, makes a meaningful impact.
                                </p>
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
