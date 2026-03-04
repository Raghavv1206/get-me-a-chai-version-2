// app/unsubscribe/page.js
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MailX, CheckCircle2, AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';

const TYPE_LABELS = {
    all: 'all email notifications',
    payment: 'payment notifications',
    milestone: 'milestone notifications',
    comment: 'comment notifications',
    update: 'campaign update notifications',
    campaign: 'campaign status notifications',
    subscription: 'subscription notifications',
    follow: 'new follower notifications',
    reply: 'comment reply notifications',
    system: 'system notifications',
};

function UnsubscribeContent() {
    const searchParams = useSearchParams();
    const userId = searchParams.get('user');
    const type = searchParams.get('type') || 'all';

    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

    const typeLabel = TYPE_LABELS[type] || type;

    const handleUnsubscribe = async () => {
        setStatus('loading');
        try {
            const res = await fetch('/api/notifications/unsubscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, type }),
            });

            const data = await res.json();
            if (data.success || res.ok) {
                setStatus('success');
                setMessage(data.message || `Successfully unsubscribed from ${typeLabel}.`);
            } else {
                setStatus('error');
                setMessage(data.error || 'Failed to unsubscribe. Please try again.');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Network error. Please try again.');
        }
    };

    if (!userId) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
                    <div className="p-4 bg-red-500/20 rounded-full inline-flex mb-6">
                        <AlertTriangle className="w-8 h-8 text-red-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Invalid Request</h1>
                    <p className="text-gray-400 mb-6">This unsubscribe link appears to be invalid or expired.</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
                {status === 'success' ? (
                    <>
                        <div className="p-4 bg-green-500/20 rounded-full inline-flex mb-6">
                            <CheckCircle2 className="w-8 h-8 text-green-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Unsubscribed</h1>
                        <p className="text-gray-400 mb-6">{message}</p>
                        <p className="text-sm text-gray-500 mb-6">
                            You can re-enable notifications anytime from your{' '}
                            <Link href="/dashboard/settings" className="text-purple-400 hover:text-purple-300 underline">
                                settings page
                            </Link>.
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Go Home
                        </Link>
                    </>
                ) : status === 'error' ? (
                    <>
                        <div className="p-4 bg-red-500/20 rounded-full inline-flex mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Unsubscribe Failed</h1>
                        <p className="text-gray-400 mb-6">{message}</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={handleUnsubscribe}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all"
                            >
                                Try Again
                            </button>
                            <Link
                                href="/"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition-all border border-white/10"
                            >
                                Go Home
                            </Link>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="p-4 bg-amber-500/20 rounded-full inline-flex mb-6">
                            <MailX className="w-8 h-8 text-amber-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Unsubscribe</h1>
                        <p className="text-gray-400 mb-6">
                            Are you sure you want to unsubscribe from <strong className="text-white">{typeLabel}</strong>?
                        </p>
                        <p className="text-sm text-gray-500 mb-8">
                            You can re-enable notifications anytime from your settings page.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={handleUnsubscribe}
                                disabled={status === 'loading'}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white font-semibold rounded-xl transition-all"
                            >
                                {status === 'loading' ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <MailX className="w-4 h-4" />
                                )}
                                {status === 'loading' ? 'Processing...' : 'Unsubscribe'}
                            </button>
                            <Link
                                href="/"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition-all border border-white/10"
                            >
                                Cancel
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function UnsubscribePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            </div>
        }>
            <UnsubscribeContent />
        </Suspense>
    );
}
