'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import SubscriptionCard from './SubscriptionCard';
import { FaSpinner } from 'react-icons/fa';

export default function SubscriptionManager() {
    const { data: session } = useSession();
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, active, paused, cancelled
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState(null);
    const [newAmount, setNewAmount] = useState('');

    useEffect(() => {
        if (session) {
            fetchSubscriptions();
        }
    }, [session]);

    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/subscription/list');
            const data = await response.json();

            if (data.success) {
                setSubscriptions(data.subscriptions);
            }
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePause = async (subscriptionId) => {
        if (!confirm('Are you sure you want to pause this subscription?')) return;

        try {
            const response = await fetch('/api/subscription/pause', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscriptionId })
            });

            const data = await response.json();
            if (data.success) {
                fetchSubscriptions();
                alert('Subscription paused successfully');
            } else {
                alert(data.message || 'Failed to pause subscription');
            }
        } catch (error) {
            console.error('Error pausing subscription:', error);
            alert('Failed to pause subscription');
        }
    };

    const handleResume = async (subscriptionId) => {
        if (!confirm('Are you sure you want to resume this subscription?')) return;

        try {
            const response = await fetch('/api/subscription/resume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscriptionId })
            });

            const data = await response.json();
            if (data.success) {
                fetchSubscriptions();
                alert('Subscription resumed successfully');
            } else {
                alert(data.message || 'Failed to resume subscription');
            }
        } catch (error) {
            console.error('Error resuming subscription:', error);
            alert('Failed to resume subscription');
        }
    };

    const handleCancel = async (subscriptionId) => {
        if (!confirm('Are you sure you want to cancel this subscription? This action cannot be undone.')) return;

        try {
            const response = await fetch('/api/subscription/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscriptionId })
            });

            const data = await response.json();
            if (data.success) {
                fetchSubscriptions();
                alert('Subscription cancelled successfully');
            } else {
                alert(data.message || 'Failed to cancel subscription');
            }
        } catch (error) {
            console.error('Error cancelling subscription:', error);
            alert('Failed to cancel subscription');
        }
    };

    const handleUpdateClick = (subscription) => {
        setSelectedSubscription(subscription);
        setNewAmount(subscription.amount.toString());
        setUpdateModalOpen(true);
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();

        const amount = parseInt(newAmount);
        if (amount < 10) {
            alert('Minimum amount is ₹10');
            return;
        }

        try {
            const response = await fetch('/api/subscription/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subscriptionId: selectedSubscription._id,
                    amount
                })
            });

            const data = await response.json();
            if (data.success) {
                fetchSubscriptions();
                setUpdateModalOpen(false);
                alert('Subscription amount updated successfully');
            } else {
                alert(data.message || 'Failed to update subscription');
            }
        } catch (error) {
            console.error('Error updating subscription:', error);
            alert('Failed to update subscription');
        }
    };

    const filteredSubscriptions = subscriptions.filter(sub => {
        if (filter === 'all') return true;
        return sub.status === filter;
    });

    if (loading) {
        return (
            <div className="loading-container">
                <FaSpinner className="spinner" />
                <p>Loading subscriptions...</p>
            </div>
        );
    }

    return (
        <div className="subscription-manager">
            <div className="manager-header">
                <h2 className="manager-title">My Subscriptions</h2>

                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All ({subscriptions.length})
                    </button>
                    <button
                        className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
                        onClick={() => setFilter('active')}
                    >
                        Active ({subscriptions.filter(s => s.status === 'active').length})
                    </button>
                    <button
                        className={`filter-tab ${filter === 'paused' ? 'active' : ''}`}
                        onClick={() => setFilter('paused')}
                    >
                        Paused ({subscriptions.filter(s => s.status === 'paused').length})
                    </button>
                    <button
                        className={`filter-tab ${filter === 'cancelled' ? 'active' : ''}`}
                        onClick={() => setFilter('cancelled')}
                    >
                        Cancelled ({subscriptions.filter(s => s.status === 'cancelled').length})
                    </button>
                </div>
            </div>

            {filteredSubscriptions.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">💳</div>
                    <h3>No subscriptions found</h3>
                    <p>
                        {filter === 'all'
                            ? "You don't have any subscriptions yet."
                            : `You don't have any ${filter} subscriptions.`
                        }
                    </p>
                </div>
            ) : (
                <div className="subscriptions-grid">
                    {filteredSubscriptions.map(subscription => (
                        <SubscriptionCard
                            key={subscription._id}
                            subscription={subscription}
                            onPause={handlePause}
                            onResume={handleResume}
                            onCancel={handleCancel}
                            onUpdate={handleUpdateClick}
                        />
                    ))}
                </div>
            )}

            {/* Update Amount Modal */}
            {updateModalOpen && (
                <div className="modal-overlay" onClick={() => setUpdateModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-title">Update Subscription Amount</h3>
                        <p className="modal-subtitle">
                            Current amount: ₹{selectedSubscription.amount.toLocaleString('en-IN')}
                        </p>

                        <form onSubmit={handleUpdateSubmit}>
                            <div className="form-group">
                                <label htmlFor="newAmount">New Amount (₹)</label>
                                <input
                                    type="number"
                                    id="newAmount"
                                    value={newAmount}
                                    onChange={(e) => setNewAmount(e.target.value)}
                                    min="10"
                                    step="1"
                                    required
                                    className="amount-input"
                                />
                                <p className="input-hint">Minimum amount is ₹10</p>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setUpdateModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Update Amount
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
        .subscription-manager {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .manager-header {
          margin-bottom: 30px;
        }

        .manager-title {
          font-size: 2rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 20px 0;
        }

        .filter-tabs {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .filter-tab {
          padding: 10px 20px;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 600;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-tab:hover {
          border-color: #d1d5db;
          background: #f9fafb;
        }

        .filter-tab.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: #667eea;
        }

        .loading-container,
        .empty-state {
          text-align: center;
          padding: 80px 20px;
        }

        .spinner {
          font-size: 3rem;
          color: #667eea;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 20px;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 10px 0;
        }

        .empty-state p {
          color: #6b7280;
          font-size: 1rem;
        }

        .subscriptions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 24px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 20px;
          max-width: 500px;
          width: 100%;
          padding: 30px;
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 8px 0;
        }

        .modal-subtitle {
          color: #6b7280;
          margin: 0 0 24px 0;
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

        .amount-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .amount-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .input-hint {
          margin-top: 6px;
          font-size: 0.85rem;
          color: #9ca3af;
        }

        .modal-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .btn-primary,
        .btn-secondary {
          padding: 12px 20px;
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
          color: #6b7280;
          border: 2px solid #e5e7eb;
        }

        .btn-secondary:hover {
          background: #f9fafb;
        }

        @media (max-width: 768px) {
          .subscription-manager {
            padding: 20px 15px;
          }

          .manager-title {
            font-size: 1.5rem;
          }

          .subscriptions-grid {
            grid-template-columns: 1fr;
          }

          .filter-tabs {
            flex-direction: column;
          }

          .filter-tab {
            width: 100%;
          }
        }
      `}</style>
        </div>
    );
}
