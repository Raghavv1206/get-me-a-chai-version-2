'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FaTimes, FaExclamationTriangle, FaCheck } from 'react-icons/fa';
import { AlertTriangle, ShieldAlert, Ban, MessageSquareWarning, Scale, HelpCircle, Loader2 } from 'lucide-react';

const REPORT_REASONS = [
    {
        value: 'spam',
        label: 'Spam',
        description: 'Unsolicited or irrelevant content',
        icon: Ban,
    },
    {
        value: 'fraud',
        label: 'Fraud / Scam',
        description: 'Fake campaign or deceptive fundraising',
        icon: ShieldAlert,
    },
    {
        value: 'misleading',
        label: 'Misleading Information',
        description: 'False claims or exaggerated promises',
        icon: AlertTriangle,
    },
    {
        value: 'inappropriate',
        label: 'Inappropriate Content',
        description: 'Offensive, violent, or adult content',
        icon: MessageSquareWarning,
    },
    {
        value: 'harassment',
        label: 'Harassment',
        description: 'Bullying, threats, or targeting individuals',
        icon: MessageSquareWarning,
    },
    {
        value: 'intellectual_property',
        label: 'Intellectual Property',
        description: 'Copyright infringement or stolen content',
        icon: Scale,
    },
    {
        value: 'other',
        label: 'Other',
        description: 'Something else not listed above',
        icon: HelpCircle,
    },
];

export default function ReportModal({ campaignId, campaignTitle, onClose }) {
    const [selectedReason, setSelectedReason] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const overlayRef = useRef(null);

    // Pause Lenis smooth scroll while modal is open & lock body scroll
    useEffect(() => {
        // Pause Lenis so it doesn't intercept wheel events
        if (window.lenis) {
            window.lenis.stop();
        }

        // Lock body scroll
        const scrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.overflow = 'hidden';

        return () => {
            // Restore body scroll
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.left = '';
            document.body.style.right = '';
            document.body.style.overflow = '';
            window.scrollTo(0, scrollY);

            // Resume Lenis
            if (window.lenis) {
                window.lenis.start();
            }
        };
    }, []);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && !submitting) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, submitting]);

    const handleSubmit = async () => {
        if (!selectedReason) {
            setError('Please select a reason for reporting');
            return;
        }

        if (selectedReason === 'other' && description.trim().length < 10) {
            setError('Please provide a detailed description (at least 10 characters)');
            return;
        }

        setError('');
        setSubmitting(true);

        try {
            const res = await fetch(`/api/campaigns/${campaignId}/report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reason: selectedReason,
                    description: description.trim(),
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setSubmitted(true);
            } else {
                setError(data.message || 'Failed to submit report. Please try again.');
            }
        } catch (err) {
            console.error('Report submission error:', err);
            setError('Network error. Please check your connection and try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleOverlayClick = useCallback((e) => {
        if (e.target === overlayRef.current) {
            onClose();
        }
    }, [onClose]);

    // Success state
    if (submitted) {
        return (
            <div
                ref={overlayRef}
                className="report-modal-overlay"
                onClick={handleOverlayClick}
            >
                <div className="report-modal-card" style={{ maxHeight: 'none' }}>
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaCheck className="w-8 h-8 text-green-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Report Submitted</h2>
                        <p className="text-gray-400 text-sm mb-6">
                            Thank you for helping keep our community safe. Our team will review your report shortly.
                        </p>
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                        >
                            Close
                        </button>
                    </div>
                </div>

                <style jsx>{`
                    .report-modal-overlay {
                        position: fixed;
                        inset: 0;
                        background: rgba(0, 0, 0, 0.85);
                        backdrop-filter: blur(8px);
                        z-index: 99999;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 5rem 1rem 1rem 1rem;
                    }
                    .report-modal-card {
                        background: #111827;
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 1rem;
                        max-width: 28rem;
                        width: 100%;
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
                        animation: slideUp 0.25s ease-out;
                    }
                    @keyframes slideUp {
                        from { opacity: 0; transform: translateY(20px) scale(0.97); }
                        to { opacity: 1; transform: translateY(0) scale(1); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div
            ref={overlayRef}
            className="report-modal-overlay"
            onClick={handleOverlayClick}
        >
            <div className="report-modal-card">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <FaExclamationTriangle className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Report Campaign</h2>
                            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">
                                {campaignTitle}
                            </p>
                        </div>
                    </div>
                    <button
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        onClick={onClose}
                        disabled={submitting}
                    >
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>

                {/* Body — scrollable */}
                <div className="report-modal-body" data-lenis-prevent>
                    {/* Reason Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-3">
                            Why are you reporting this campaign?
                        </label>
                        <div className="space-y-2">
                            {REPORT_REASONS.map((reason) => {
                                const Icon = reason.icon;
                                const isSelected = selectedReason === reason.value;
                                return (
                                    <button
                                        key={reason.value}
                                        onClick={() => {
                                            setSelectedReason(reason.value);
                                            setError('');
                                        }}
                                        disabled={submitting}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${isSelected
                                                ? 'bg-red-500/10 border-red-500/30 text-white'
                                                : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        <Icon className={`w-5 h-5 flex-shrink-0 ${isSelected ? 'text-red-400' : 'text-gray-500'
                                            }`} />
                                        <div className="min-w-0">
                                            <div className="text-sm font-medium">{reason.label}</div>
                                            <div className="text-xs text-gray-500">{reason.description}</div>
                                        </div>
                                        {isSelected && (
                                            <FaCheck className="w-4 h-4 text-red-400 flex-shrink-0 ml-auto" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Additional Details */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Additional Details {selectedReason === 'other' && <span className="text-red-400">*</span>}
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => {
                                setDescription(e.target.value);
                                setError('');
                            }}
                            disabled={submitting}
                            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all resize-none h-24 text-sm"
                            placeholder={
                                selectedReason === 'other'
                                    ? 'Please describe the issue in detail (required)...'
                                    : 'Provide any additional context (optional)...'
                            }
                            maxLength={1000}
                        />
                        <div className="flex justify-between mt-1">
                            <span className="text-xs text-gray-600">
                                {selectedReason === 'other' ? 'Min 10 characters required' : 'Optional'}
                            </span>
                            <span className={`text-xs ${description.length > 900 ? 'text-red-400' : 'text-gray-600'}`}>
                                {description.length}/1000
                            </span>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 pt-3 flex gap-3 border-t border-white/10">
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 font-medium hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !selectedReason}
                        className="flex-1 py-3 bg-red-500/80 hover:bg-red-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-500/80"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Submitting...</span>
                            </>
                        ) : (
                            <>
                                <FaExclamationTriangle className="w-4 h-4" />
                                <span>Submit Report</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <style jsx>{`
                .report-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.85);
                    backdrop-filter: blur(8px);
                    z-index: 99999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 5rem 1rem 1rem 1rem;
                }
                .report-modal-card {
                    background: #111827;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 1rem;
                    max-width: 28rem;
                    width: 100%;
                    max-height: calc(100vh - 7rem);
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
                    animation: slideUp 0.25s ease-out;
                }
                .report-modal-body {
                    padding: 1.5rem;
                    overflow-y: auto;
                    flex: 1;
                    min-height: 0;
                    overscroll-behavior: contain;
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }
                .report-modal-body::-webkit-scrollbar {
                    width: 6px;
                }
                .report-modal-body::-webkit-scrollbar-track {
                    background: transparent;
                }
                .report-modal-body::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.15);
                    border-radius: 3px;
                }
                .report-modal-body::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.3);
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
}
