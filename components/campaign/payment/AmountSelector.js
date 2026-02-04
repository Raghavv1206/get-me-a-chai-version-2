'use client';

import { useState } from 'react';

export default function AmountSelector({ amount, onAmountChange }) {
    const [customAmount, setCustomAmount] = useState('');
    const [isCustom, setIsCustom] = useState(false);

    const presetAmounts = [10, 50, 100, 500, 1000, 5000];

    const handlePresetClick = (preset) => {
        setIsCustom(false);
        setCustomAmount('');
        onAmountChange(preset);
    };

    const handleCustomChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setCustomAmount(value);
        setIsCustom(true);

        const numValue = parseInt(value) || 0;
        if (numValue >= 10) {
            onAmountChange(numValue);
        }
    };

    return (
        <div className="amount-selector">
            <div className="preset-amounts">
                {presetAmounts.map((preset) => (
                    <button
                        key={preset}
                        type="button"
                        className={`preset-btn ${!isCustom && amount === preset ? 'active' : ''}`}
                        onClick={() => handlePresetClick(preset)}
                    >
                        ₹{preset}
                    </button>
                ))}
            </div>

            <div className="custom-amount">
                <div className="custom-input-wrapper">
                    <span className="currency-symbol">₹</span>
                    <input
                        type="text"
                        value={isCustom ? customAmount : ''}
                        onChange={handleCustomChange}
                        onFocus={() => setIsCustom(true)}
                        placeholder="Custom amount"
                        className="custom-input"
                    />
                </div>
                {isCustom && customAmount && parseInt(customAmount) < 10 && (
                    <div className="error-message">Minimum amount is ₹10</div>
                )}
            </div>

            <style jsx>{`
        .amount-selector {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .preset-amounts {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .preset-btn {
          padding: 12px;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          color: #374151;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .preset-btn:hover {
          border-color: #667eea;
          background: #f9fafb;
        }

        .preset-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: #667eea;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .custom-amount {
          position: relative;
        }

        .custom-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .currency-symbol {
          position: absolute;
          left: 16px;
          font-size: 1.1rem;
          font-weight: 600;
          color: #6b7280;
          pointer-events: none;
        }

        .custom-input {
          width: 100%;
          padding: 12px 16px 12px 36px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .custom-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .custom-input::placeholder {
          color: #9ca3af;
          font-weight: 400;
        }

        .error-message {
          margin-top: 6px;
          font-size: 0.85rem;
          color: #ef4444;
          font-weight: 500;
        }

        @media (max-width: 480px) {
          .preset-amounts {
            grid-template-columns: repeat(2, 1fr);
          }

          .preset-btn {
            padding: 10px;
            font-size: 0.95rem;
          }
        }
      `}</style>
        </div>
    );
}
