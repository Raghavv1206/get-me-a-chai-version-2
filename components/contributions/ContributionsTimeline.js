// components/contributions/ContributionsTimeline.js
"use client"

/**
 * Contributions Timeline Component
 * 
 * Features:
 * - Chronological list of all contributions
 * - Group by month
 * - Each entry: Campaign, amount, date, receipt
 * - Download receipt button
 * - Responsive design
 * - Loading states
 * - Dark theme
 * 
 * @component
 */

import { useState } from 'react';
import { Calendar, Download, ExternalLink, MessageSquare, Wallet } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ContributionsTimeline({ groupedByMonth, loading = false, onDownloadReceipt }) {
    const [downloadingReceipt, setDownloadingReceipt] = useState(null);

    const handleDownloadReceipt = async (paymentId) => {
        setDownloadingReceipt(paymentId);
        try {
            if (onDownloadReceipt) {
                await onDownloadReceipt(paymentId);
            }
        } finally {
            setDownloadingReceipt(null);
        }
    };

    if (loading) {
        return <TimelineSkeleton />;
    }

    if (!groupedByMonth || Object.keys(groupedByMonth).length === 0) {
        return (
            <div className="bg-white/5 rounded-2xl p-12 border border-white/10 text-center backdrop-blur-xl">
                <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                    No Contributions Yet
                </h3>
                <p className="text-gray-400 mb-6">
                    Start supporting campaigns to see your contribution history here
                </p>
                <Link
                    href="/explore"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                >
                    Explore Campaigns
                    <ExternalLink className="w-4 h-4" />
                </Link>
            </div>
        );
    }

    // Sort months in descending order (newest first)
    const sortedMonths = Object.keys(groupedByMonth).sort((a, b) => b.localeCompare(a));

    return (
        <div className="space-y-8">
            {sortedMonths.map((monthKey) => {
                const payments = groupedByMonth[monthKey];
                const monthDate = new Date(monthKey + '-01');
                const monthName = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                const monthTotal = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

                return (
                    <div key={monthKey} className="space-y-4">
                        {/* Month Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">
                                        {monthName}
                                    </h3>
                                    <p className="text-sm text-gray-400">
                                        {payments.length} contribution{payments.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-bold text-white">
                                    ₹{monthTotal.toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500">
                                    Total
                                </div>
                            </div>
                        </div>

                        {/* Payments List */}
                        <div className="space-y-3">
                            {payments.map((payment) => (
                                <PaymentCard
                                    key={payment._id}
                                    payment={payment}
                                    onDownloadReceipt={handleDownloadReceipt}
                                    isDownloading={downloadingReceipt === payment._id}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

/**
 * Individual Payment Card
 */
function PaymentCard({ payment, onDownloadReceipt, isDownloading }) {
    const date = new Date(payment.createdAt);
    const formattedDate = date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });

    // Get campaign link — handle both populated object and string ID
    const campaignId = payment.campaign?._id || payment.campaign;
    const campaignTitle = payment.campaign?.title || 'Unknown Campaign';
    const campaignLink = campaignId ? `/campaign/${campaignId}` : '#';

    return (
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-purple-500/30 hover:bg-white/[0.07] transition-all group backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Campaign Image */}
                <Link
                    href={campaignLink}
                    className="relative w-full sm:w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-900/30 to-pink-900/30"
                >
                    {payment.campaign?.coverImage ? (
                        <Image
                            src={payment.campaign.coverImage}
                            alt={campaignTitle}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Wallet className="w-10 h-10 text-purple-400" />
                        </div>
                    )}
                </Link>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <Link
                            href={campaignLink}
                            className="font-semibold text-white hover:text-purple-400 transition-colors line-clamp-1"
                        >
                            {campaignTitle}
                        </Link>
                        <div className="text-right flex-shrink-0">
                            <div className="text-lg font-bold text-white">
                                ₹{(payment.amount || 0).toLocaleString()}
                            </div>
                            {payment.type === 'subscription' && (
                                <span className="inline-block px-2 py-0.5 bg-purple-900/30 text-purple-300 text-xs font-medium rounded-full">
                                    Monthly
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <span>{formattedTime}</span>
                        {payment.to_user && (
                            <>
                                <span>•</span>
                                <span className="text-purple-400">to @{payment.to_user}</span>
                            </>
                        )}
                    </div>

                    {payment.message && (
                        <div className="flex items-start gap-2 text-sm text-gray-300 bg-white/5 rounded-lg p-2 mb-2">
                            <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                            <p className="line-clamp-2">{payment.message}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onDownloadReceipt(payment._id)}
                            disabled={isDownloading}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-gray-300 text-sm font-medium rounded-lg hover:bg-white/20 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download className="w-4 h-4" />
                            {isDownloading ? 'Downloading...' : 'Receipt'}
                        </button>

                        {payment.paymentId && (
                            <span className="text-xs text-gray-500">
                                ID: {payment.paymentId.slice(-8)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Loading skeleton
 */
function TimelineSkeleton() {
    return (
        <div className="space-y-8">
            {[...Array(3)].map((_, monthIndex) => (
                <div key={monthIndex} className="space-y-4">
                    {/* Month Header Skeleton */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/10 rounded-lg animate-pulse" />
                            <div>
                                <div className="h-5 w-32 bg-white/10 rounded animate-pulse mb-2" />
                                <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="h-6 w-20 bg-white/10 rounded animate-pulse mb-1" />
                            <div className="h-3 w-12 bg-white/10 rounded animate-pulse" />
                        </div>
                    </div>

                    {/* Payment Cards Skeleton */}
                    <div className="space-y-3">
                        {[...Array(2)].map((_, cardIndex) => (
                            <div
                                key={cardIndex}
                                className="bg-white/5 rounded-xl p-4 border border-white/10 animate-pulse"
                            >
                                <div className="flex gap-4">
                                    <div className="w-24 h-24 bg-white/10 rounded-lg" />
                                    <div className="flex-1">
                                        <div className="h-5 bg-white/10 rounded mb-2 w-3/4" />
                                        <div className="h-4 bg-white/10 rounded mb-2 w-1/2" />
                                        <div className="h-4 bg-white/10 rounded w-1/3" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
