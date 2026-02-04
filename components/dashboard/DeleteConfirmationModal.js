'use client';

import { useState } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function DeleteConfirmationModal({ campaign, onConfirm, onCancel, isProcessing }) {
    const [confirmText, setConfirmText] = useState('');
    const [understood, setUnderstood] = useState(false);

    const canDelete = confirmText === campaign.title && understood;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (canDelete) {
            onConfirm();
        }
    };

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="warning-icon">
                    <FaExclamationTriangle />
                </div>

                <h2 className="modal-title">Delete Campaign?</h2>
                <p className="modal-subtitle">
                    This action cannot be undone. Please read the consequences carefully.
                </p>

                <div className="consequences-box">
                    <h3>What will happen:</h3>
                    <ul>
                        <li>The campaign will be permanently deleted</li>
                        <li>All campaign data will be removed</li>
                        <li>Supporters will no longer be able to access the campaign</li>
                        <li>Active subscriptions will be cancelled</li>
                        <li>Campaign URL will become unavailable</li>
                        <li>This action is <strong>irreversible</strong></li>
                    </ul>
                </div>

                {campaign.stats?.supporters > 0 && (
                    <div className="warning-box">
                        <strong>⚠️ Warning:</strong> This campaign has {campaign.stats.supporters} supporter(s)
                        and has raised ₹{(campaign.currentAmount || 0).toLocaleString('en-IN')}.
                        Deleting will affect all supporters.
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="confirmText">
                            Type the campaign title to confirm: <strong>{campaign.title}</strong>
                        </label>
                        <input
                            type="text"
                            id="confirmText"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder="Enter campaign title"
                            className="confirm-input"
                            autoComplete="off"
                        />
                    </div>

                    <div className="checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={understood}
                                onChange={(e) => setUnderstood(e.target.checked)}
                            />
                            <span>I understand that this action is permanent and cannot be undone</span>
                        </label>
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={onCancel}
                            disabled={isProcessing}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-delete"
                            disabled={!canDelete || isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <div className="spinner"></div>
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
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal-content {
          background: white;
          border-radius: 24px;
          max-width: 600px;
          width: 100%;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.4s ease;
          max-height: 90vh;
          overflow-y: auto;
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

        .warning-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 20px;
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          color: #dc2626;
        }

        .modal-title {
          font-size: 2rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 8px 0;
          text-align: center;
        }

        .modal-subtitle {
          font-size: 1rem;
          color: #6b7280;
          margin: 0 0 24px 0;
          text-align: center;
        }

        .consequences-box {
          background: #fef2f2;
          border-left: 4px solid #ef4444;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .consequences-box h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #991b1b;
          margin: 0 0 12px 0;
        }

        .consequences-box ul {
          margin: 0;
          padding-left: 20px;
          color: #7f1d1d;
        }

        .consequences-box li {
          margin-bottom: 8px;
          line-height: 1.5;
        }

        .warning-box {
          background: #fffbeb;
          border-left: 4px solid #f59e0b;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
          color: #92400e;
          line-height: 1.6;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-size: 0.95rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }

        .confirm-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .confirm-input:focus {
          outline: none;
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        .checkbox-group {
          margin-bottom: 24px;
        }

        .checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          margin-top: 2px;
          cursor: pointer;
          flex-shrink: 0;
        }

        .checkbox-label span {
          font-size: 0.95rem;
          color: #4b5563;
          line-height: 1.5;
        }

        .modal-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .btn-cancel,
        .btn-delete {
          padding: 14px 20px;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-cancel {
          background: white;
          color: #6b7280;
          border: 2px solid #e5e7eb;
        }

        .btn-cancel:hover:not(:disabled) {
          background: #f9fafb;
        }

        .btn-delete {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
        }

        .btn-delete:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
        }

        .btn-cancel:disabled,
        .btn-delete:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 640px) {
          .modal-content {
            padding: 30px 20px;
          }

          .modal-title {
            font-size: 1.5rem;
          }

          .warning-icon {
            width: 60px;
            height: 60px;
            font-size: 2rem;
          }

          .modal-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
}
