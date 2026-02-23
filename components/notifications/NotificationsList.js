'use client';

import { useState } from 'react';
import NotificationItem from './NotificationItem';
import { Bell } from 'lucide-react';

export default function NotificationsList({ notifications: initialNotifications, onMarkAsRead }) {
  const [notifications, setNotifications] = useState(initialNotifications || []);

  const groupNotifications = () => {
    const grouped = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: []
    };

    notifications.forEach(notif => {
      const date = new Date(notif.createdAt);
      const now = new Date();
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) grouped.today.push(notif);
      else if (diffDays === 1) grouped.yesterday.push(notif);
      else if (diffDays <= 7) grouped.thisWeek.push(notif);
      else grouped.older.push(notif);
    });

    return grouped;
  };

  const grouped = groupNotifications();

  const handleMarkAsRead = async (id) => {
    if (onMarkAsRead) {
      await onMarkAsRead(id);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notifications-list">
      <div className="list-header">
        <div className="header-left">
          <h2 className="list-title">Notifications</h2>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount} unread</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button className="mark-all-btn" onClick={handleMarkAllAsRead}>
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Bell className="w-12 h-12 text-gray-400 mx-auto" /></div>
          <h3>No notifications yet</h3>
          <p>When you receive notifications, they'll appear here</p>
        </div>
      ) : (
        <div className="notifications-content">
          {Object.entries(grouped).map(([period, items]) => (
            items.length > 0 && (
              <div key={period} className="notification-group">
                <h3 className="group-title">
                  {period === 'today' ? 'Today' :
                    period === 'yesterday' ? 'Yesterday' :
                      period === 'thisWeek' ? 'This Week' :
                        'Older'}
                </h3>
                <div className="group-items">
                  {items.map(notif => (
                    <NotificationItem
                      key={notif._id}
                      notification={notif}
                      onMarkAsRead={handleMarkAsRead}
                    />
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}

      <style jsx>{`
        .notifications-list {
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
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .list-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }

        .unread-badge {
          padding: 6px 14px;
          background: #eff6ff;
          color: #3b82f6;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .mark-all-btn {
          padding: 10px 20px;
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .mark-all-btn:hover {
          background: #f0f9ff;
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
          margin: 0;
        }

        .notification-group {
          margin-bottom: 32px;
        }

        .notification-group:last-child {
          margin-bottom: 0;
        }

        .group-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #374151;
          margin: 0 0 16px 0;
          padding-bottom: 12px;
          border-bottom: 2px solid #f3f4f6;
        }

        .group-items {
          display: flex;
          flex-direction: column;
        }

        @media (max-width: 768px) {
          .notifications-list {
            padding: 20px;
          }

          .list-header {
            flex-direction: column;
            align-items: stretch;
          }

          .mark-all-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
