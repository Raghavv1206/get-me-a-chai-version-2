'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Wallet, PartyPopper, MessageCircle, FileEdit, Settings, Megaphone } from 'lucide-react';

export default function NotificationItem({ notification, onMarkAsRead }) {
  const getIcon = (type) => {
    const icons = {
      payment: <Wallet className="w-6 h-6 text-green-400" />,
      milestone: <PartyPopper className="w-6 h-6 text-yellow-400" />,
      comment: <MessageCircle className="w-6 h-6 text-blue-400" />,
      update: <FileEdit className="w-6 h-6 text-purple-400" />,
      system: <Settings className="w-6 h-6 text-gray-400" />
    };
    return icons[type] || <Megaphone className="w-6 h-6 text-gray-400" />;
  };

  const handleClick = async () => {
    if (!notification.read && onMarkAsRead) {
      await onMarkAsRead(notification._id);
    }
  };

  return (
    <Link
      href={notification.link || '#'}
      onClick={handleClick}
      className={`notification-item ${notification.read ? 'read' : 'unread'}`}
    >
      <div className="notif-icon-wrapper">
        <span className="notif-icon">{getIcon(notification.type)}</span>
      </div>

      <div className="notif-content">
        <h4 className="notif-title">{notification.title}</h4>
        <p className="notif-message">{notification.message}</p>
        <span className="notif-time">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </span>
      </div>

      {!notification.read && <span className="unread-indicator"></span>}

      <style jsx>{`
        .notification-item {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          margin-bottom: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          position: relative;
        }

        .notification-item:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
        }

        .notification-item.unread {
          background: #eff6ff;
          border-color: #bfdbfe;
        }

        .notification-item.unread:hover {
          background: #dbeafe;
        }

        .notif-icon-wrapper {
          flex-shrink: 0;
        }

        .notif-icon {
          font-size: 2rem;
          display: block;
        }

        .notif-content {
          flex: 1;
          min-width: 0;
        }

        .notif-title {
          font-size: 1rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 6px 0;
        }

        .notif-message {
          font-size: 0.95rem;
          color: #6b7280;
          margin: 0 0 8px 0;
          line-height: 1.5;
        }

        .notif-time {
          font-size: 0.85rem;
          color: #9ca3af;
        }

        .unread-indicator {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 10px;
          height: 10px;
          background: #3b82f6;
          border-radius: 50%;
          flex-shrink: 0;
        }

        @media (max-width: 640px) {
          .notification-item {
            padding: 16px;
          }

          .notif-icon {
            font-size: 1.5rem;
          }

          .notif-title {
            font-size: 0.95rem;
          }

          .notif-message {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </Link>
  );
}
