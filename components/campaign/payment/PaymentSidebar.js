'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import AmountSelector from './AmountSelector';
import RewardTierSelector from './RewardTierSelector';
import PaymentSummary from './PaymentSummary';
import { FaHeart, FaLock } from 'react-icons/fa';
import { apiToast, toast } from '@/lib/apiToast';

export default function PaymentSidebar({
  campaign,
  creator,
  selectedReward: initialReward = null,
  onPaymentSuccess
}) {
  const { data: session } = useSession();
  const [isSticky, setIsSticky] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState(100);
  const [selectedReward, setSelectedReward] = useState(initialReward);
  const [paymentType, setPaymentType] = useState('one-time');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [hideAmount, setHideAmount] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (session) {
      setName(session.user?.name || '');
      setEmail(session.user?.email || '');
    }
  }, [session]);

  useEffect(() => {
    if (initialReward) {
      setSelectedReward(initialReward);
      setAmount(initialReward.amount);
    }
  }, [initialReward]);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleRewardSelect = (reward) => {
    setSelectedReward(reward);
    if (reward) {
      setAmount(reward.amount);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email) {
      toast.error('Please fill in your name and email');
      return;
    }

    if (amount < 10) {
      toast.error('Minimum amount is ₹10');
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment order
      const orderResponse = await apiToast(
        () => fetch('/api/payments/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount,
            campaign: campaign._id,
            creatorUsername: creator.username,
            name,
            email,
            message,
            rewardTier: selectedReward?._id,
            paymentType,
            anonymous: isAnonymous,
            hideAmount
          })
        }),
        {
          loading: 'Creating payment order...',
          success: 'Payment order created!',
          error: 'Failed to create payment order'
        }
      );

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'Get Me A Chai',
        description: `Support ${campaign.title}`,
        order_id: orderData.order.id,
        prefill: {
          name,
          email
        },
        theme: {
          color: '#667eea'
        },
        handler: async function (response) {
          // Verify payment
          const verifyResponse = await apiToast(
            () => fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                paymentData: orderData.paymentData
              })
            }),
            {
              loading: 'Verifying payment...',
              success: 'Payment verified!',
              error: 'Payment verification failed'
            }
          );

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            if (onPaymentSuccess) {
              onPaymentSuccess(verifyData.payment);
            }
            // Redirect to success page
            window.location.href = `/payment-success?id=${verifyData.payment._id}`;
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`payment-sidebar desktop ${isSticky ? 'sticky' : ''}`} id="payment-sidebar">
        <div className="sidebar-content">
          <h3 className="sidebar-title">
            <FaHeart className="title-icon" />
            Support this Campaign
          </h3>

          <form onSubmit={handleSubmit} className="payment-form">
            {/* Name Input */}
            <div className="form-group">
              <label htmlFor="name">Your Name *</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                className="form-input"
              />
            </div>

            {/* Email Input */}
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="form-input"
              />
            </div>

            {/* Amount Selector */}
            <div className="form-group">
              <label>Support Amount *</label>
              <AmountSelector
                amount={amount}
                onAmountChange={setAmount}
              />
            </div>

            {/* Reward Tier Selector */}
            {campaign.rewards && campaign.rewards.length > 0 && (
              <div className="form-group">
                <label>Select a Reward (Optional)</label>
                <RewardTierSelector
                  rewards={campaign.rewards}
                  selectedReward={selectedReward}
                  onSelectReward={handleRewardSelect}
                />
              </div>
            )}

            {/* Payment Type */}
            <div className="form-group">
              <label>Payment Type</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="paymentType"
                    value="one-time"
                    checked={paymentType === 'one-time'}
                    onChange={(e) => setPaymentType(e.target.value)}
                  />
                  <span>One-time</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="paymentType"
                    value="subscription"
                    checked={paymentType === 'subscription'}
                    onChange={(e) => setPaymentType(e.target.value)}
                  />
                  <span>Monthly Subscription</span>
                </label>
              </div>
            </div>

            {/* Message */}
            <div className="form-group">
              <label htmlFor="message">Message (Optional)</label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 200))}
                placeholder="Leave a message for the creator..."
                className="form-textarea"
                rows="3"
                maxLength="200"
              />
              <div className="char-count">{message.length}/200</div>
            </div>

            {/* Privacy Options */}
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                <span>Make my support anonymous</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={hideAmount}
                  onChange={(e) => setHideAmount(e.target.checked)}
                />
                <span>Hide my support amount</span>
              </label>
            </div>

            {/* Payment Summary */}
            <PaymentSummary
              campaignTitle={campaign.title}
              amount={amount}
              reward={selectedReward}
              paymentType={paymentType}
            />

            {/* Submit Button */}
            <button
              type="submit"
              className="pay-button"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="spinner"></div>
                  Processing...
                </>
              ) : (
                <>
                  <FaLock className="btn-icon" />
                  Pay ₹{amount.toLocaleString('en-IN')}
                </>
              )}
            </button>

            <div className="secure-badge">
              <FaLock /> Secured by Razorpay
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Bottom Sheet */}
      <div className={`payment-mobile ${isMobileOpen ? 'open' : ''}`}>
        <button
          className="mobile-trigger"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          <FaHeart /> Support Now - ₹{amount}
        </button>

        <div className="mobile-sheet">
          <div className="sheet-handle"></div>
          <div className="sheet-content">
            {/* Same form as desktop */}
            <form onSubmit={handleSubmit} className="payment-form">
              {/* ... same form fields ... */}
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        .payment-sidebar {
          display: none;
        }

        .payment-sidebar.desktop {
          display: block;
          width: 100%;
          max-width: 400px;
        }

        .payment-sidebar.sticky .sidebar-content {
          position: sticky;
          top: 90px;
        }

        .sidebar-content {
          background: white;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          border: 2px solid #e5e7eb;
        }

        .sidebar-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 24px 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .title-icon {
          color: #ef4444;
          font-size: 1.4rem;
        }

        .payment-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 0.9rem;
          font-weight: 600;
          color: #374151;
        }

        .form-input,
        .form-textarea {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-textarea {
          resize: vertical;
          font-family: inherit;
        }

        .char-count {
          font-size: 0.8rem;
          color: #9ca3af;
          text-align: right;
        }

        .radio-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .radio-label {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .radio-label:hover {
          border-color: #d1d5db;
          background: #f9fafb;
        }

        .radio-label input[type="radio"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .radio-label input[type="radio"]:checked + span {
          font-weight: 600;
          color: #667eea;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          padding: 8px 0;
        }

        .checkbox-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .checkbox-label span {
          font-size: 0.9rem;
          color: #4b5563;
        }

        .pay-button {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .pay-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
        }

        .pay-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-icon {
          font-size: 1rem;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .secure-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 12px;
          color: #6b7280;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .payment-mobile {
          display: none;
        }

        @media (max-width: 1024px) {
          .payment-sidebar.desktop {
            display: none;
          }

          .payment-mobile {
            display: block;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 100;
          }

          .mobile-trigger {
            width: 100%;
            padding: 16px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            font-size: 1.1rem;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
          }

          .mobile-sheet {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: white;
            border-radius: 20px 20px 0 0;
            max-height: 90vh;
            overflow-y: auto;
            transform: translateY(100%);
            transition: transform 0.3s ease;
            box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.2);
          }

          .payment-mobile.open .mobile-sheet {
            transform: translateY(0);
          }

          .sheet-handle {
            width: 40px;
            height: 4px;
            background: #d1d5db;
            border-radius: 2px;
            margin: 12px auto;
          }

          .sheet-content {
            padding: 20px;
          }
        }
      `}</style>

      {/* Load Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </>
  );
}
