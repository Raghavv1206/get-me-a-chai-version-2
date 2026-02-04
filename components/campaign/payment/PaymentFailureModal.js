'use client';

import { FaExclamationTriangle, FaRedo, FaEnvelope } from 'react-icons/fa';

export default function PaymentFailureModal({ error, onRetry, onClose }) {
    const handleContactSupport = () => {
        window.location.href = 'mailto:support@getmeachai.com?subject=Payment%20Failed';
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="error-icon-wrapper">
                    <div className="error-icon-circle">
                        <FaExclamationTriangle className="error-icon" />
                    </div>
                </div>

                <h2 className="modal-title">Payment Failed</h2>
                <p className="modal-subtitle">
                    {error || 'We couldn\'t process your payment. Please try again.'}
                </p>

                <div className="error-details">
                    <h3>What happened?</h3>
                    <ul>
                        <li>Your payment was not processed</li>
                        <li>No amount has been charged</li>
                        <li>You can try again safely</li>
                    </ul>
                </div>

                <div className="common-reasons">
                    <h4>Common reasons for payment failure:</h4>
                    <ul>
                        <li>Insufficient funds in account</li>
                        <li>Incorrect card details</li>
                        <li>Bank declined the transaction</li>
                        <li>Network connectivity issues</li>
                        <li>Payment gateway timeout</li>
                    </ul>
                </div>

                <div className="action-buttons">
                    <button className="btn-primary" onClick={onRetry}>
                        <FaRedo /> Try Again
                    </button>

                    <button className="btn-secondary" onClick={handleContactSupport}>
                        <FaEnvelope /> Contact Support
                    </button>
                </div>

                <button className="close-button" onClick={onClose}>
                    Close
                </button>
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
          max-width: 500px;
          width: 100%;
          padding: 40px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.4s ease;
          position: relative;
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

        .error-icon-wrapper {
          margin-bottom: 24px;
        }

        .error-icon-circle {
          width: 100px;
          height: 100px;
          margin: 0 auto;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: shake 0.5s ease 0.2s both;
          box-shadow: 0 10px 30px rgba(239, 68, 68, 0.3);
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
          }
        }

        .error-icon {
          font-size: 3.5rem;
          color: white;
        }

        .modal-title {
          font-size: 2rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 8px 0;
        }

        .modal-subtitle {
          font-size: 1.05rem;
          color: #6b7280;
          margin: 0 0 24px 0;
          line-height: 1.6;
        }

        .error-details,
        .common-reasons {
          background: #fef2f2;
          border-left: 4px solid #ef4444;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          text-align: left;
        }

        .error-details h3,
        .common-reasons h4 {
          font-size: 1rem;
          font-weight: 700;
          color: #991b1b;
          margin: 0 0 12px 0;
        }

        .error-details ul,
        .common-reasons ul {
          margin: 0;
          padding-left: 20px;
          color: #7f1d1d;
        }

        .error-details li,
        .common-reasons li {
          margin-bottom: 8px;
          line-height: 1.5;
        }

        .common-reasons {
          background: #fffbeb;
          border-left-color: #f59e0b;
        }

        .common-reasons h4 {
          color: #92400e;
        }

        .common-reasons ul {
          color: #78350f;
        }

        .action-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }

        .btn-primary,
        .btn-secondary,
        .close-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 20px;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
        }

        .btn-secondary:hover {
          background: #f9fafb;
          transform: translateY(-2px);
        }

        .close-button {
          width: 100%;
          background: #f3f4f6;
          color: #6b7280;
          margin-top: 8px;
        }

        .close-button:hover {
          background: #e5e7eb;
        }

        @media (max-width: 640px) {
          .modal-content {
            padding: 30px 20px;
          }

          .modal-title {
            font-size: 1.5rem;
          }

          .error-icon-circle {
            width: 80px;
            height: 80px;
          }

          .error-icon {
            font-size: 2.5rem;
          }

          .action-buttons {
            grid-template-columns: 1fr;
          }

          .error-details,
          .common-reasons {
            padding: 16px;
          }
        }
      `}</style>
        </div>
    );
}
