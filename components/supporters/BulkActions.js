'use client';

import { FaEnvelope, FaDownload, FaTag, FaTimes } from 'react-icons/fa';

export default function BulkActions({ selectedSupporters = [], onAction, onClear }) {
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
          background: #1e293b;
          border: 2px solid #334155;
          border-radius: 16px;
          padding: 20px 24px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
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
          border-bottom: 2px solid #334155;
        }

        .selected-count {
          font-size: 0.95rem;
          font-weight: 600;
          color: #e2e8f0;
        }

        .clear-selection {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #0f172a;
          border: 2px solid #334155;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .clear-selection:hover {
          background: #1e293b;
          color: #e2e8f0;
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
          background: #0f172a;
          color: #667eea;
          border-color: #667eea;
        }

        .email-btn:hover {
          background: #1e293b;
          transform: translateY(-2px);
        }

        .export-btn {
          background: #0f172a;
          color: #10b981;
          border-color: #10b981;
        }

        .export-btn:hover {
          background: #1e293b;
          transform: translateY(-2px);
        }

        .tag-btn {
          background: #0f172a;
          color: #f59e0b;
          border-color: #f59e0b;
        }

        .tag-btn:hover {
          background: #1e293b;
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
