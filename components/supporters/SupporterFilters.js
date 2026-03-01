'use client';

import { useState, useEffect } from 'react';
import { FaCalendar, FaRupeeSign, FaFolder, FaSync } from 'react-icons/fa';

export default function SupporterFilters({
  onFilterChange = () => { },
  campaigns = [],
  activeFilters: externalFilters
}) {
  const defaultFilters = {
    dateRange: 'all',
    minAmount: '',
    maxAmount: '',
    campaign: 'all',
    frequency: 'all'
  };

  const [filters, setFilters] = useState(externalFilters || defaultFilters);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Sync with external filters if they change
  useEffect(() => {
    if (externalFilters) {
      setFilters(externalFilters);
    }
  }, [externalFilters]);

  const handleChange = (field, value) => {
    const updated = { ...filters, [field]: value };
    setFilters(updated);
    // Apply filters immediately on change for responsive UX
    onFilterChange(updated);
  };

  const handleClear = () => {
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  // Check if any filter is active (for visual indicator)
  const hasActiveFilters =
    filters.dateRange !== 'all' ||
    filters.minAmount !== '' ||
    filters.maxAmount !== '' ||
    filters.campaign !== 'all' ||
    filters.frequency !== 'all';

  return (
    <div className="supporter-filters">
      <div className="filters-header">
        <h3 className="filters-title">
          Filters
          {hasActiveFilters && (
            <span className="active-badge">Active</span>
          )}
        </h3>
        <button
          className="collapse-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? 'Show filters' : 'Hide filters'}
        >
          <svg
            className={`collapse-icon ${isCollapsed ? '' : 'rotated'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            width="20"
            height="20"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {!isCollapsed && (
        <>
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
                  min="0"
                  inputMode="numeric"
                />
                <span className="range-separator">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxAmount}
                  onChange={(e) => handleChange('maxAmount', e.target.value)}
                  className="filter-input"
                  min="0"
                  inputMode="numeric"
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
                {campaigns.map((campaign) => (
                  <option key={campaign.value} value={campaign.value}>
                    {campaign.label}
                  </option>
                ))}
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

          {hasActiveFilters && (
            <div className="filter-actions">
              <button className="clear-btn" onClick={handleClear}>
                <FaSync /> Clear Filters
              </button>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .supporter-filters {
          background: #1e293b;
          border: 2px solid #334155;
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 30px;
          overflow: hidden;
          box-sizing: border-box;
          width: 100%;
        }

        @media (min-width: 640px) {
          .supporter-filters {
            padding: 24px;
          }
        }

        .filters-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0;
        }

        .filters-grid ~ .filter-actions,
        .filters-grid {
          margin-top: 16px;
        }

        .filters-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .active-badge {
          font-size: 0.65rem;
          font-weight: 600;
          color: #a78bfa;
          background: rgba(139, 92, 246, 0.15);
          border: 1px solid rgba(139, 92, 246, 0.3);
          padding: 2px 8px;
          border-radius: 9999px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .collapse-toggle {
          background: none;
          border: none;
          padding: 6px;
          cursor: pointer;
          color: #94a3b8;
          border-radius: 8px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .collapse-toggle:hover {
          background: #0f172a;
          color: #e2e8f0;
        }

        .collapse-icon {
          transition: transform 0.3s ease;
        }

        .collapse-icon.rotated {
          transform: rotate(180deg);
        }

        .filters-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          margin-bottom: 0;
        }

        @media (min-width: 640px) {
          .filters-grid {
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
        }

        .filter-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #e2e8f0;
        }

        @media (min-width: 640px) {
          .filter-label {
            font-size: 0.9rem;
          }
        }

        .filter-select,
        .filter-input {
          width: 100%;
          padding: 10px 12px;
          border: 2px solid #334155;
          border-radius: 10px;
          font-size: 0.9rem;
          color: #f1f5f9;
          background: #0f172a;
          transition: all 0.3s ease;
          box-sizing: border-box;
          min-width: 0;
        }

        .filter-select {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 16px;
          padding-right: 36px;
        }

        @media (min-width: 640px) {
          .filter-select,
          .filter-input {
            padding: 10px 14px;
            font-size: 0.95rem;
          }

          .filter-select {
            padding-right: 40px;
          }
        }

        .filter-select:hover,
        .filter-input:hover {
          border-color: #475569;
        }

        .filter-select:focus,
        .filter-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
        }

        .amount-inputs {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          min-width: 0;
        }

        .amount-inputs .filter-input {
          flex: 1;
          min-width: 0;
        }

        .range-separator {
          color: #94a3b8;
          font-weight: 600;
          flex-shrink: 0;
        }

        .frequency-options {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        @media (min-width: 640px) {
          .frequency-options {
            gap: 10px;
          }
        }

        .radio-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.3s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .radio-label:hover {
          background: #0f172a;
        }

        .radio-label:active {
          background: #0f172a;
        }

        .radio-label input[type="radio"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          flex-shrink: 0;
          accent-color: #667eea;
        }

        .radio-label span {
          font-size: 0.9rem;
          color: #e2e8f0;
        }

        .filter-actions {
          display: flex;
          padding-top: 16px;
          border-top: 2px solid #334155;
          margin-top: 16px;
        }

        .clear-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
          background: #0f172a;
          color: #94a3b8;
          border: 2px solid #334155;
          width: 100%;
        }

        @media (min-width: 480px) {
          .clear-btn {
            width: auto;
          }
        }

        .clear-btn:hover {
          background: #1e293b;
          border-color: #475569;
          color: #e2e8f0;
        }

        .clear-btn:active {
          transform: scale(0.98);
        }

        /* Remove number input spinners for cleaner look */
        .filter-input[type="number"]::-webkit-outer-spin-button,
        .filter-input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        .filter-input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}
