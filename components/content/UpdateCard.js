'use client';

import Link from 'next/link';
import { FaEye, FaEdit, FaTrash, FaClock, FaLock, FaGlobe } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

export default function UpdateCard({ update, onEdit, onDelete }) {
  const getStatusBadge = () => {
    const badges = {
      published: { color: '#10b981', label: 'Published', icon: FaGlobe },
      draft: { color: '#6b7280', label: 'Draft', icon: FaEdit },
      scheduled: { color: '#f59e0b', label: 'Scheduled', icon: FaClock }
    };
    return badges[update.status] || badges.draft;
  };

  const badge = getStatusBadge();
  const StatusIcon = badge.icon;

  return (
    <div className="update-card">
      <div className="card-header">
        <div className="header-left">
          <h3 className="card-title">{update.title}</h3>
          <span className="status-badge" style={{ backgroundColor: badge.color }}>
            <StatusIcon /> {badge.label}
          </span>
        </div>
        {update.visibility === 'supporters' && (
          <span className="visibility-badge">
            <FaLock /> Supporters Only
          </span>
        )}
      </div>

      <p className="campaign-name">
        Campaign: <strong>{update.campaign?.title || 'Unknown'}</strong>
      </p>

      <div className="card-stats">
        <span className="stat-item">
          <FaEye /> {update.views || 0} views
        </span>
        <span className="stat-item">
          {update.status === 'published'
            ? `Published ${formatDistanceToNow(new Date(update.publishedAt || update.createdAt), { addSuffix: true })}`
            : update.status === 'scheduled'
              ? `Scheduled for ${new Date(update.scheduledFor).toLocaleString()}`
              : `Created ${formatDistanceToNow(new Date(update.createdAt), { addSuffix: true })}`
          }
        </span>
      </div>

      <div className="card-actions">
        <Link href={`/dashboard/content/${update._id}`} className="action-btn view-btn">
          <FaEye /> View
        </Link>
        <button onClick={() => onEdit(update)} className="action-btn edit-btn">
          <FaEdit /> Edit
        </button>
        <button onClick={() => onDelete(update._id)} className="action-btn delete-btn">
          <FaTrash /> Delete
        </button>
      </div>

      <style jsx>{`
        .update-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 20px;
          transition: all 0.3s ease;
        }

        .update-card:hover {
          border-color: rgba(139, 92, 246, 0.3);
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 4px 20px rgba(139, 92, 246, 0.1);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
          gap: 12px;
        }

        .header-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .card-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #f3f4f6;
          margin: 0;
          line-height: 1.4;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          color: white;
          width: fit-content;
        }

        .visibility-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .campaign-name {
          font-size: 0.9rem;
          color: #6b7280;
          margin: 0 0 16px 0;
        }

        .campaign-name strong {
          color: #d1d5db;
        }

        .card-stats {
          display: flex;
          gap: 20px;
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          flex-wrap: wrap;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          color: #6b7280;
        }

        .card-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .view-btn {
          background: rgba(139, 92, 246, 0.1);
          color: #a78bfa;
          border: 1px solid rgba(139, 92, 246, 0.25);
        }

        .view-btn:hover {
          background: rgba(139, 92, 246, 0.2);
        }

        .edit-btn {
          background: rgba(16, 185, 129, 0.1);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.25);
        }

        .edit-btn:hover {
          background: rgba(16, 185, 129, 0.2);
        }

        .delete-btn {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.25);
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.2);
        }

        @media (max-width: 640px) {
          .card-header {
            flex-direction: column;
          }

          .card-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
