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
                alert(result.error || 'Failed to generate receipt');
            }
        } catch (err) {
            console.error('Error downloading receipt:', err);
            alert('Failed to download receipt');
        }
    };

    // ========================================================================
    // LOADING STATE
    // ========================================================================

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-black">
                <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
                    <div className="animate-pulse space-y-8">
                        <div className="h-12 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
                            ))}
                        </div>
                        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    // ========================================================================
    // ERROR STATE
    // ========================================================================

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-black">
                <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
                    <div className="max-w-2xl mx-auto bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 border-2 border-red-200 dark:border-red-800 text-center">
                        <h2 className="text-2xl font-bold text-red-900 dark:text-red-200 mb-4">
                            Error Loading Contributions
                        </h2>
                        <p className="text-red-700 dark:text-red-300 mb-6">{error}</p>
                        <button
                            onClick={handleRefresh}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ========================================================================
    // RENDER
    // ========================================================================

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-black">
            <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Header */}
                <div className="mb-8 sm:mb-12">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                                💝 My Contributions
                            </h1>
                            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                                Track your impact and support history
                            </p>
                        </div>

                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-300 dark:hover:border-purple-600 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                    </div>
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
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
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
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-8 border-2 border-purple-200 dark:border-purple-800">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            🌟 Your Impact
                        </h2>
                        <div className="prose dark:prose-invert max-w-none">
                            <p className="text-gray-700 dark:text-gray-300 text-lg">
                                You've contributed <strong>₹{contributionsData.summary.totalAmount.toLocaleString()}</strong> across{' '}
                                <strong>{contributionsData.summary.campaignsSupported}</strong> campaign{contributionsData.summary.campaignsSupported !== 1 ? 's' : ''}.
                                Your generosity has helped creators bring their ideas to life and make a real difference in the community.
                            </p>
                            {badgesData?.badges?.length > 0 && (
                                <p className="text-gray-700 dark:text-gray-300">
                                    You've earned <strong>{badgesData.badges.length}</strong> achievement badge{badgesData.badges.length !== 1 ? 's' : ''} and
                                    have an impact score of <strong>{badgesData.impactScore.toLocaleString()}</strong> points!
                                </p>
                            )}
                            <p className="text-gray-600 dark:text-gray-400">
                                Thank you for being an amazing supporter! Every contribution, no matter the size, makes a meaningful impact.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
