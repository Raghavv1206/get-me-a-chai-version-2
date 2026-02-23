'use client';

import { useState, useEffect, useRef } from 'react';
import { FaBell } from 'react-icons/fa';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Wallet, PartyPopper, MessageCircle, FileEdit, Settings, Megaphone, Bell } from 'lucide-react';

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch('/api/notifications/count');
      const data = await res.json();
      if (data.success) {
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications/list?limit=5');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!showDropdown) {
      fetchNotifications();
    }
    setShowDropdown(!showDropdown);
  };

  const getNotificationIcon = (type) => {
    const icons = {
      payment: <Wallet className="w-5 h-5 text-green-400" />,
      milestone: <PartyPopper className="w-5 h-5 text-yellow-400" />,
      comment: <MessageCircle className="w-5 h-5 text-blue-400" />,
      update: <FileEdit className="w-5 h-5 text-purple-400" />,
      system: <Settings className="w-5 h-5 text-gray-400" />
    };
    return icons[type] || <Megaphone className="w-5 h-5 text-gray-400" />;
  };

  const markAsRead = async (id) => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <button className="bell-button" onClick={handleToggle}>
        <FaBell className="bell-icon" />
        {unreadCount > 0 && (
          <span className="badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="dropdown">
          <div className="dropdown-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <span className="unread-count">{unreadCount} unread</span>
            )}
          </div>

          <div className="notifications-list">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon"><Bell className="w-8 h-8 text-gray-400 mx-auto" /></span>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <Link
                  key={notif._id}
                  href={notif.link || '/notifications'}
                  className={`notification-item ${notif.read ? '' : 'unread'}`}
                  onClick={() => {
                    markAsRead(notif._id);
                    setShowDropdown(false);
                  }}
                >
                  <span className="notif-icon">{getNotificationIcon(notif.type)}</span>
                  <div className="notif-content">
                    <p className="notif-title">{notif.title}</p>
                    <p className="notif-message">{notif.message}</p>
                    <span className="notif-time">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  {!notif.read && <span className="unread-dot"></span>}
                </Link>
              ))
            )}
          </div>

          <Link href="/notifications" className="view-all-btn" onClick={() => setShowDropdown(false)}>
            View All Notifications
          </Link>
        </div>
      )}

      <style jsx>{`
        .notification-bell {
          position: relative;
        }

        .bell-button {
          position: relative;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: white;
          border: 2px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .bell-button:hover {
          background: #f9fafb;
          border-color: #667eea;
        }

        .bell-icon {
          font-size: 1.25rem;
          color: #6b7280;
        }

        .bell-button:hover .bell-icon {
          color: #667eea;
        }

        .badge {
          position: absolute;
          top: -4px;
          right: -4px;
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          background: #ef4444;
          color: white;
          border-radius: 10px;
          font-size: 0.7rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        }

        .dropdown {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 380px;
          max-height: 500px;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          animation: slideDown 0.3s ease;
          overflow: hidden;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-header {
          padding: 16px 20px;
          border-bottom: 2px solid #f3f4f6;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .dropdown-header h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }

        .unread-count {
          font-size: 0.85rem;
          font-weight: 600;
          color: #ef4444;
          background: #fef2f2;
          padding: 4px 10px;
          border-radius: 12px;
        }

        .notifications-list {
          max-height: 360px;
          overflow-y: auto;
        }

        .loading-state,
        .empty-state {
          padding: 40px 20px;
          text-align: center;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #f3f4f6;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 12px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-state p,
        .empty-state p {
          color: #9ca3af;
          margin: 0;
        }

        .empty-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 12px;
        }

        .notification-item {
          display: flex;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid #f3f4f6;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          position: relative;
        }

        .notification-item:hover {
          background: #f9fafb;
        }

        .notification-item.unread {
          background: #eff6ff;
        }

        .notification-item.unread:hover {
          background: #dbeafe;
        }

        .notif-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .notif-content {
          flex: 1;
          min-width: 0;
        }

        .notif-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: #111827;
          margin: 0 0 4px 0;
        }

        .notif-message {
          font-size: 0.85rem;
          color: #6b7280;
          margin: 0 0 6px 0;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .notif-time {
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .unread-dot {
          width: 8px;
          height: 8px;
          background: #3b82f6;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 6px;
        }

        .view-all-btn {
          display: block;
          padding: 14px 20px;
          text-align: center;
          background: #f9fafb;
          color: #667eea;
          font-weight: 600;
          font-size: 0.9rem;
          text-decoration: none;
          border-top: 2px solid #f3f4f6;
          transition: all 0.3s ease;
        }

        .view-all-btn:hover {
          background: #f3f4f6;
          color: #764ba2;
        }

        @media (max-width: 480px) {
          .dropdown {
            width: calc(100vw - 40px);
            right: -100px;
          }
        }
      `}</style>
    </div>
  );
}
