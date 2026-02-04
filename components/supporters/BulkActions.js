'use client';

import { FaEnvelope, FaDownload, FaTag, FaTimes } from 'react-icons/fa';

export default function BulkActions({ selectedSupporters, onAction, onClear }) {
    if (selectedSupporters.length === 0) return null;

    return (
        <div className="bulk-actions">
            <div className="actions-info">
                <span className="selected-count">
                    {selectedSupporters.length} supporter{selectedSupporters.length !== 1 ? 's' : ''} selected
                </span>
                <button className="clear-selection" onClick={onClear}>
                    <FaTimes /> Clear
                </button>
            </div>

            <div className="actions-buttons">
                <button
                    className="action-btn email-btn"
                    onClick={() => onAction('email')}
                >
                    <FaEnvelope /> Send Email
                </button>

                <button
                    className="action-btn export-btn"
                    onClick={() => onAction('export')}
                >
                    <FaDownload /> Export Selected
                </button>

                <button
                    className="action-btn tag-btn"
                    onClick={() => onAction('tag')}
                >
                    <FaTag /> Add Tag
                </button>
            </div>

            <style jsx>{`
        .bulk-actions {
          position: fixed;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          padding: 20px 24px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          animation: slideUp 0.3s ease;
          max-width: 90vw;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .actions-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 2px solid #f3f4f6;
        }

        .selected-count {
          font-size: 0.95rem;
          font-weight: 600;
          color: #374151;
        }

        .clear-selection {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #f9fafb;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .clear-selection:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .actions-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid;
        }

        .email-btn {
          background: white;
          color: #667eea;
          border-color: #667eea;
        }

        .email-btn:hover {
          background: #f0f9ff;
          transform: translateY(-2px);
        }

        .export-btn {
          background: white;
          color: #10b981;
          border-color: #10b981;
        }

        .export-btn:hover {
          background: #f0fdf4;
          transform: translateY(-2px);
        }

        .tag-btn {
          background: white;
          color: #f59e0b;
          border-color: #f59e0b;
        }

        .tag-btn:hover {
          background: #fffbeb;
          transform: translateY(-2px);
        }

        @media (max-width: 640px) {
          .bulk-actions {
            bottom: 20px;
            left: 20px;
            right: 20px;
            transform: none;
            max-width: none;
          }

          .actions-buttons {
            flex-direction: column;
          }

          .action-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
        </div>
    );
}
