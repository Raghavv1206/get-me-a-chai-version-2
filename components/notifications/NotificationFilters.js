'use client';

import { FaFilter } from 'react-icons/fa';
import PropTypes from 'prop-types';
import { useCallback, useMemo } from 'react';

/**
 * NotificationFilters Component
 * 
 * Provides filtering controls for notifications by type and read status.
 * Fully accessible with ARIA labels and keyboard navigation.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.filter - Current filter state
 * @param {string} props.filter.type - Selected notification type
 * @param {string} props.filter.status - Selected notification status
 * @param {Function} props.setFilter - Function to update filter state
 */
export default function NotificationFilters({ filter, setFilter }) {
  // Input validation
  if (!filter || typeof filter !== 'object') {
    console.error('[NotificationFilters] Invalid filter prop:', filter);
    return null;
  }

  if (typeof setFilter !== 'function') {
    console.error('[NotificationFilters] setFilter must be a function');
    return null;
  }

  // Memoized filter options
  const types = useMemo(() => [
    { value: 'all', label: 'All Notifications' },
    { value: 'payment', label: 'Payments' },
    { value: 'milestone', label: 'Milestones' },
    { value: 'comment', label: 'Comments' },
    { value: 'update', label: 'Updates' },
    { value: 'system', label: 'System' }
  ], []);

  const statuses = useMemo(() => [
    { value: 'all', label: 'All' },
    { value: 'unread', label: 'Unread Only' }
  ], []);

  // Event handlers with useCallback to prevent unnecessary re-renders
  const handleTypeChange = useCallback((e) => {
    const newType = e.target.value;
    if (newType !== filter.type) {
      setFilter({ ...filter, type: newType });
    }
  }, [filter, setFilter]);

  const handleStatusChange = useCallback((e) => {
    const newStatus = e.target.value;
    if (newStatus !== filter.status) {
      setFilter({ ...filter, status: newStatus });
    }
  }, [filter, setFilter]);

  return (
    <div className="notification-filters" role="region" aria-label="Notification filters">
      <div className="filters-header">
        <FaFilter className="filter-icon" aria-hidden="true" />
        <span className="filters-title">Filters</span>
      </div>

      <div className="filters-grid">
        <div className="filter-group">
          <label htmlFor="notification-type-filter" className="filter-label">
            Type
          </label>
          <select
            id="notification-type-filter"
            value={filter.type || 'all'}
            onChange={handleTypeChange}
            className="filter-select"
            aria-label="Filter notifications by type"
          >
            {types.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="notification-status-filter" className="filter-label">
            Status
          </label>
          <select
            id="notification-status-filter"
            value={filter.status || 'all'}
            onChange={handleStatusChange}
            className="filter-select"
            aria-label="Filter notifications by read status"
          >
            {statuses.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <style jsx>{`
        .notification-filters {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .filters-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }

        .filter-icon {
          color: #667eea;
          font-size: 1.1rem;
        }

        .filters-title {
          font-size: 1rem;
          font-weight: 700;
          color: #111827;
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .filter-label {
          font-size: 0.9rem;
          font-weight: 600;
          color: #374151;
        }

        .filter-select {
          padding: 10px 14px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 0.95rem;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-select:hover {
          border-color: #d1d5db;
        }

        .filter-select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .filter-select:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 640px) {
          .filters-grid {
            grid-template-columns: 1fr;
          }
          
          .notification-filters {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
}

// PropTypes for development-time validation
NotificationFilters.propTypes = {
  filter: PropTypes.shape({
    type: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
  setFilter: PropTypes.func.isRequired,
};

