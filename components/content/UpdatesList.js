'use client';

import { useState } from 'react';
import UpdateCard from './UpdateCard';
import { FaSearch, FaPlus, FaFilter } from 'react-icons/fa';
import Link from 'next/link';

export default function UpdatesList({ updates: initialUpdates, onEdit, onDelete }) {
    const [updates, setUpdates] = useState(initialUpdates || []);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('recent');

    const filtered = updates.filter(update => {
        const matchesFilter = filter === 'all' || update.status === filter;
        const matchesSearch = update.title.toLowerCase().includes(search.toLowerCase()) ||
            update.campaign?.title.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const sorted = [...filtered].sort((a, b) => {
        if (sortBy === 'recent') {
            return new Date(b.createdAt) - new Date(a.createdAt);
        } else if (sortBy === 'oldest') {
            return new Date(a.createdAt) - new Date(b.createdAt);
        } else if (sortBy === 'views') {
            return (b.views || 0) - (a.views || 0);
        }
        return 0;
    });

    return (
        <div className="updates-list">
            <div className="list-header">
                <div className="header-left">
                    <h2 className="list-title">Campaign Updates</h2>
                    <p className="list-subtitle">{updates.length} total updates</p>
                </div>
                <Link href="/dashboard/content/new" className="create-btn">
                    <FaPlus /> Create Update
                </Link>
            </div>

            <div className="list-filters">
                <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search updates..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="filter-group">
                    <FaFilter className="filter-icon" />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Updates</option>
                        <option value="published">Published</option>
                        <option value="draft">Drafts</option>
                        <option value="scheduled">Scheduled</option>
                    </select>
                </div>

                <div className="sort-group">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="sort-select"
                    >
                        <option value="recent">Most Recent</option>
                        <option value="oldest">Oldest First</option>
                        <option value="views">Most Viewed</option>
                    </select>
                </div>
            </div>

            {sorted.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📝</div>
                    <h3>No updates found</h3>
                    <p>
                        {search || filter !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Create your first campaign update to engage with your supporters'}
                    </p>
                    <Link href="/dashboard/content/new" className="empty-cta">
                        <FaPlus /> Create Your First Update
                    </Link>
                </div>
            ) : (
                <div className="updates-grid">
                    {sorted.map(update => (
                        <UpdateCard
                            key={update._id}
                            update={update}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}

            <style jsx>{`
        .updates-list {
          background: white;
          border-radius: 16px;
          padding: 32px;
        }

        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          gap: 20px;
        }

        .header-left {
          flex: 1;
        }

        .list-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 4px 0;
        }

        .list-subtitle {
          font-size: 0.95rem;
          color: #6b7280;
          margin: 0;
        }

        .create-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .create-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .list-filters {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 250px;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }

        .search-input {
          width: 100%;
          padding: 10px 14px 10px 40px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .filter-group,
        .sort-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-icon {
          color: #6b7280;
        }

        .filter-select,
        .sort-select {
          padding: 10px 14px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 0.95rem;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-select:hover,
        .sort-select:hover {
          border-color: #d1d5db;
        }

        .filter-select:focus,
        .sort-select:focus {
          outline: none;
          border-color: #667eea;
        }

        .updates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 8px 0;
        }

        .empty-state p {
          font-size: 1rem;
          color: #6b7280;
          margin: 0 0 24px 0;
        }

        .empty-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 10px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .empty-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        @media (max-width: 768px) {
          .updates-list {
            padding: 20px;
          }

          .list-header {
            flex-direction: column;
            align-items: stretch;
          }

          .create-btn {
            width: 100%;
            justify-content: center;
          }

          .list-filters {
            flex-direction: column;
          }

          .search-box {
            min-width: 100%;
          }

          .updates-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
}
