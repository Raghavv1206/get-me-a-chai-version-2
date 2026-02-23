'use client';

import { useState, useEffect, useRef } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { AlertTriangle } from 'lucide-react';

export default function DeleteConfirmationModal({ campaign, onConfirm, onCancel, isProcessing }) {
  const [confirmText, setConfirmText] = useState('');
  const [understood, setUnderstood] = useState(false);
  const overlayRef = useRef(null);

  const canDelete = confirmText === campaign.title && understood;

  // Lock body scroll and capture wheel events when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;
    const scrollY = window.scrollY;

    // Freeze the body in place
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;
      document.body.style.overflow = originalOverflow;
      window.scrollTo(0, scrollY);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (canDelete) {
      onConfirm();
    }
  };

  const handleOverlayClick = (e) => {
    // Only close if clicking the dark overlay area itself, not the modal
    if (e.target === overlayRef.current) {
      onCancel();
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[2000] flex items-center justify-center p-5"
      style={{
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(12px)',
        animation: 'fadeIn 0.3s ease'
      }}
      onClick={handleOverlayClick}
    >
      <div
        className="w-full max-w-[600px] max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 p-10"
        style={{
          background: 'linear-gradient(145deg, rgba(17,17,17,0.98) 0%, rgba(10,10,10,0.99) 100%)',
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.6), 0 0 40px rgba(239, 68, 68, 0.08)',
          animation: 'slideUp 0.4s ease',
          overscrollBehavior: 'contain'
        }}
      >
        {/* Warning Icon */}
        <div
          className="w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center text-4xl"
          style={{
            background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.25) 100%)',
            border: '1px solid rgba(239,68,68,0.2)',
          }}
        >
          <FaExclamationTriangle className="text-red-500" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white text-center mb-2">
          Delete Campaign?
        </h2>
        <p className="text-gray-400 text-center mb-6 text-base">
          This action cannot be undone. Please read the consequences carefully.
        </p>

        {/* Consequences Box */}
        <div
          className="rounded-xl p-5 mb-5"
          style={{
            background: 'rgba(239, 68, 68, 0.06)',
            border: '1px solid rgba(239, 68, 68, 0.15)',
            borderLeft: '4px solid rgba(239, 68, 68, 0.6)',
          }}
        >
          <h3 className="text-base font-bold text-red-400 mb-3">What will happen:</h3>
          <ul className="pl-5 space-y-2 text-red-300/80 text-sm list-disc">
            <li>The campaign will be permanently deleted</li>
            <li>All campaign data will be removed</li>
            <li>Supporters will no longer be able to access the campaign</li>
            <li>Active subscriptions will be cancelled</li>
            <li>Campaign URL will become unavailable</li>
            <li>This action is <strong className="text-red-400">irreversible</strong></li>
          </ul>
        </div>

        {/* Supporter Warning */}
        {campaign.stats?.supporters > 0 && (
          <div
            className="rounded-xl p-4 mb-5"
            style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.15)',
              borderLeft: '4px solid rgba(245, 158, 11, 0.5)',
            }}
          >
            <span className="text-amber-400 leading-relaxed text-sm">
              <strong><AlertTriangle className="w-4 h-4 inline-block mr-1" /> Warning:</strong> This campaign has {campaign.stats.supporters} supporter(s)
              and has raised ₹{(campaign.currentAmount || 0).toLocaleString('en-IN')}.
              Deleting will affect all supporters.
            </span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Confirm Input */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-300 mb-2" htmlFor="confirmText">
              Type the campaign title to confirm: <strong className="text-white">{campaign.title}</strong>
            </label>
            <input
              type="text"
              id="confirmText"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Enter campaign title"
              autoComplete="off"
              className="w-full px-4 py-3 rounded-xl text-base text-white placeholder-gray-600 transition-all duration-300 outline-none"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '2px solid rgba(255,255,255,0.1)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Checkbox */}
          <div className="mb-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={understood}
                onChange={(e) => setUnderstood(e.target.checked)}
                className="w-[18px] h-[18px] mt-0.5 cursor-pointer flex-shrink-0 accent-red-500"
              />
              <span className="text-sm text-gray-400 leading-relaxed">
                I understand that this action is permanent and cannot be undone
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="py-3.5 px-5 rounded-xl text-base font-semibold text-gray-400 transition-all duration-300 flex items-center justify-center gap-2 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '2px solid rgba(255,255,255,0.1)',
              }}
              onClick={onCancel}
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-3.5 px-5 rounded-xl text-base font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: canDelete
                  ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                  : 'rgba(239, 68, 68, 0.2)',
                border: 'none',
              }}
              disabled={!canDelete || isProcessing}
              onMouseEnter={(e) => {
                if (canDelete && !isProcessing) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 25px rgba(239, 68, 68, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Campaign'
              )}
            </button>
          </div>
        </form>
      </div>


      <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
            `}</style>
    </div >
  );
}
