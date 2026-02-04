'use client';

import { useState } from 'react';
import { FaCalendar, FaRupeeSign, FaFolder, FaSync } from 'react-icons/fa';

export default function SupporterFilters({ onFilterChange }) {
    const [filters, setFilters] = useState({
        dateRange: 'all',
        minAmount: '',
        maxAmount: '',
        campaign: 'all',
        frequency: 'all'
    });

    const handleChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleApply = () => {
        onFilterChange(filters);
    };

    const handleClear = () => {
        const clearedFilters = {
            dateRange: 'all',
            minAmount: '',
            maxAmount: '',
            campaign: 'all',
            frequency: 'all'
        };
        setFilters(clearedFilters);
        onFilterChange(clearedFilters);
    };

    return (
        <div className="supporter-filters">
            <h3 className="filters-title">Filters</h3>

            <div className="filters-grid">
                {/* Date Range */}
                <div className="filter-group">
                    <label className="filter-label">
                        <FaCalendar /> Date Range
                    </label>
                    <select
                        value={filters.dateRange}
                        onChange={(e) => handleChange('dateRange', e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                        <option value="quarter">Last 90 Days</option>
                        <option value="year">Last Year</option>
                    </select>
                </div>

                {/* Amount Range */}
                <div className="filter-group">
                    <label className="filter-label">
                        <FaRupeeSign /> Amount Range
                    </label>
                    <div className="amount-inputs">
                        <input
                            type="number"
                            placeholder="Min"
                            value={filters.minAmount}
                            onChange={(e) => handleChange('minAmount', e.target.value)}
                            className="filter-input"
                        />
                        <span className="range-separator">-</span>
                        <input
                            type="number"
                            placeholder="Max"
                            value={filters.maxAmount}
                            onChange={(e) => handleChange('maxAmount', e.target.value)}
                            className="filter-input"
                        />
                    </div>
                </div>

                {/* Campaign */}
                <div className="filter-group">
                    <label className="filter-label">
                        <FaFolder /> Campaign
                    </label>
                    <select
                        value={filters.campaign}
                        onChange={(e) => handleChange('campaign', e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Campaigns</option>
                        {/* Will be populated dynamically */}
                    </select>
                </div>

                {/* Frequency */}
                <div className="filter-group">
                    <label className="filter-label">Frequency</label>
                    <div className="frequency-options">
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="frequency"
                                value="all"
                                checked={filters.frequency === 'all'}
                                onChange={(e) => handleChange('frequency', e.target.value)}
                            />
                            <span>All</span>
                        </label>
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="frequency"
                                value="one-time"
                                checked={filters.frequency === 'one-time'}
                                onChange={(e) => handleChange('frequency', e.target.value)}
                            />
                            <span>One-time</span>
                        </label>
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="frequency"
                                value="recurring"
                                checked={filters.frequency === 'recurring'}
                                onChange={(e) => handleChange('frequency', e.target.value)}
                            />
                            <span>Recurring</span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="filter-actions">
                <button className="clear-btn" onClick={handleClear}>
                    <FaSync /> Clear Filters
                </button>
                <button className="apply-btn" onClick={handleApply}>
                    Apply Filters
                </button>
            </div>

            <style jsx>{`
        .supporter-filters {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 30px;
        }

        .filters-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 20px 0;
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .filter-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #374151;
        }

        .filter-select,
        .filter-input {
          padding: 10px 14px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 0.95rem;
          color: #374151;
          background: white;
          transition: all 0.3s ease;
        }

        .filter-select:hover,
        .filter-input:hover {
          border-color: #d1d5db;
        }

        .filter-select:focus,
        .filter-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .amount-inputs {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .range-separator {
          color: #9ca3af;
          font-weight: 600;
        }

        .frequency-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .radio-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .radio-label:hover {
          background: #f9fafb;
        }

        .radio-label input[type="radio"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .radio-label span {
          font-size: 0.9rem;
          color: #374151;
        }

        .filter-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          padding-top: 20px;
          border-top: 2px solid #f3f4f6;
        }

        .clear-btn,
        .apply-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .clear-btn {
          background: white;
          color: #6b7280;
          border: 2px solid #e5e7eb;
        }

        .clear-btn:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        .apply-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
        }

        .apply-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        @media (max-width: 768px) {
          .filters-grid {
            grid-template-columns: 1fr;
          }

          .filter-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
}
