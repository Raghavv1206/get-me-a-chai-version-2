'use client';

import { useEffect, useState } from 'react';
import { FaCheckCircle, FaDownload, FaShare, FaArrowRight } from 'react-icons/fa';
import confetti from 'canvas-confetti';
import { toast } from '@/lib/apiToast';

export default function PaymentSuccessModal({ payment, onClose }) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    if (showConfetti) {
      // Trigger confetti animation
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          setShowConfetti(false);
          return clearInterval(interval);
        }

        confetti({
          particleCount: 3,
          angle: randomInRange(55, 125),
          spread: randomInRange(50, 70),
          origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
          colors: ['#667eea', '#764ba2', '#f093fb', '#4facfe']
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [showConfetti]);

  const handleDownloadReceipt = () => {
    // Generate and download receipt
    window.open(`/api/payments/${payment._id}/receipt`, '_blank');
  };

  const handleShare = () => {
    const shareText = `I just supported ${payment.campaign} on Get Me A Chai! 🎉`;
    const shareUrl = window.location.origin;

    if (navigator.share) {
      navigator.share({
        title: 'Support Successful!',
        text: shareText,
        url: shareUrl
      });
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="success-icon-wrapper">
          <div className="success-icon-circle">
            <FaCheckCircle className="success-icon" />
          </div>
        </div>

        <h2 className="modal-title">Payment Successful!</h2>
        <p className="modal-subtitle">Thank you for your generous support</p>

        <div className="receipt-details">
          <div className="detail-row">
            <span className="detail-label">Campaign</span>
            <span className="detail-value">{payment.campaign}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Amount</span>
            <span className="detail-value amount">₹{payment.amount.toLocaleString('en-IN')}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Transaction ID</span>
            <span className="detail-value transaction-id">{payment._id}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Date</span>
            <span className="detail-value">
              {new Date().toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>

        <div className="action-buttons">
          <button className="btn-primary" onClick={handleDownloadReceipt}>
            <FaDownload /> Download Receipt
          </button>

          <button className="btn-secondary" onClick={handleShare}>
            <FaShare /> Share
          </button>
        </div>

        <button className="btn-link" onClick={() => window.location.href = '/explore'}>
          Support Another Campaign <FaArrowRight />
        </button>

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

        .success-icon-wrapper {
          margin-bottom: 24px;
        }

        .success-icon-circle {
          width: 100px;
          height: 100px;
          margin: 0 auto;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: scaleIn 0.5s ease 0.2s both;
          box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .success-icon {
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
          font-size: 1.1rem;
          color: #6b7280;
          margin: 0 0 32px 0;
        }

        .receipt-details {
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
          text-align: left;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-label {
          font-size: 0.95rem;
          color: #6b7280;
          font-weight: 500;
        }

        .detail-value {
          font-size: 0.95rem;
          color: #111827;
          font-weight: 600;
        }

        .detail-value.amount {
          font-size: 1.25rem;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .transaction-id {
          font-family: monospace;
          font-size: 0.85rem;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .action-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }

        .btn-primary,
        .btn-secondary,
        .btn-link,
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

        .btn-link {
          background: none;
          color: #667eea;
          padding: 12px;
          font-size: 0.95rem;
        }

        .btn-link:hover {
          text-decoration: underline;
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

          .success-icon-circle {
            width: 80px;
            height: 80px;
          }

          .success-icon {
            font-size: 2.5rem;
          }

          .action-buttons {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
