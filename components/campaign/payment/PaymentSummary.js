'use client';

import { FaCheckCircle } from 'react-icons/fa';

export default function PaymentSummary({ campaignTitle, amount, reward, paymentType }) {
    return (
        <div className="payment-summary">
            <h4 className="summary-title">Payment Summary</h4>

            <div className="summary-items">
                <div className="summary-item">
                    <span className="item-label">Supporting</span>
                    <span className="item-value campaign-title">{campaignTitle}</span>
                </div>

                <div className="summary-item">
                    <span className="item-label">Amount</span>
                    <span className="item-value amount">₹{amount.toLocaleString('en-IN')}</span>
                </div>

                {reward && (
                    <div className="summary-item reward-item">
                        <span className="item-label">
                            <FaCheckCircle className="check-icon" />
                            Reward
                        </span>
                        <span className="item-value">{reward.title}</span>
                    </div>
                )}

                <div className="summary-item">
                    <span className="item-label">Payment Type</span>
                    <span className="item-value">
                        {paymentType === 'subscription' ? 'Monthly Subscription' : 'One-time'}
                    </span>
                </div>

                {paymentType === 'subscription' && (
                    <div className="subscription-info">
                        <p>You will be charged ₹{amount.toLocaleString('en-IN')} every month until you cancel.</p>
                    </div>
                )}
            </div>

            <div className="summary-total">
                <span className="total-label">
                    {paymentType === 'subscription' ? 'Monthly Total' : 'Total Amount'}
                </span>
                <span className="total-amount">₹{amount.toLocaleString('en-IN')}</span>
            </div>

            <style jsx>{`
        .payment-summary {
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          border-radius: 16px;
          padding: 20px;
          border: 2px solid #e5e7eb;
        }

        .summary-title {
          font-size: 1rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 16px 0;
        }

        .summary-items {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .item-label {
          font-size: 0.9rem;
          color: #6b7280;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .check-icon {
          color: #10b981;
          font-size: 0.85rem;
        }

        .item-value {
          font-size: 0.9rem;
          color: #111827;
          font-weight: 600;
          text-align: right;
        }

        .campaign-title {
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .amount {
          color: #667eea;
          font-size: 1rem;
        }

        .reward-item {
          padding: 12px;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-radius: 10px;
          margin: 4px 0;
        }

        .reward-item .item-label {
          color: #92400e;
        }

        .reward-item .item-value {
          color: #78350f;
        }

        .subscription-info {
          padding: 12px;
          background: #fef3c7;
          border-left: 3px solid #f59e0b;
          border-radius: 8px;
          margin-top: 8px;
        }

        .subscription-info p {
          margin: 0;
          font-size: 0.85rem;
          color: #92400e;
          line-height: 1.5;
        }

        .summary-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 2px solid #e5e7eb;
        }

        .total-label {
          font-size: 1rem;
          font-weight: 700;
          color: #374151;
        }

        .total-amount {
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        @media (max-width: 480px) {
          .payment-summary {
            padding: 16px;
          }

          .item-value {
            font-size: 0.85rem;
          }

          .total-amount {
            font-size: 1.25rem;
          }
        }
      `}</style>
        </div>
    );
}
