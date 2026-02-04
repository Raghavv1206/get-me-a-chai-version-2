// app/notifications/page.js
"use client"
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function NotificationsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread, read

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (session) {
            fetchNotifications();
        }
    }, [session, status]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/notifications');
            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications || []);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const response = await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationId, action: 'mark-read' })
            });

            if (response.ok) {
                setNotifications(prev =>
                    prev.map(n =>
                        n._id === notificationId ? { ...n, read: true } : n
                    )
                );
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const response = await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'mark-all-read' })
            });

            if (response.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            const response = await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationId, action: 'delete' })
            });

            if (response.ok) {
                setNotifications(prev => prev.filter(n => n._id !== notificationId));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'payment': return '💰';
            case 'campaign': return '🚀';
            case 'comment': return '💬';
            case 'milestone': return '🎯';
            case 'system': return '🔔';
            default: return '📢';
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.read;
        if (filter === 'read') return n.read;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black pt-24 px-6">
                <div className="container mx-auto max-w-4xl">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-800 rounded w-1/3" />
                        <div className="h-64 bg-gray-800 rounded" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black pt-24 px-6 pb-12">
            <div className="container mx-auto max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Notifications</h1>
                    <p className="text-gray-400">
                        Stay updated with your campaigns and community
                    </p>
                </div>

                {/* Filters & Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    {/* Filter Tabs */}
                    <div className="flex gap-2 bg-gray-800 p-1 rounded-lg">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'all'
                                    ? 'bg-purple-600 text-white'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            All ({notifications.length})
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'unread'
                                    ? 'bg-purple-600 text-white'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Unread ({unreadCount})
                        </button>
                        <button
                            onClick={() => setFilter('read')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'read'
                                    ? 'bg-purple-600 text-white'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Read ({notifications.length - unreadCount})
                        </button>
                    </div>

                    {/* Mark All as Read */}
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="px-4 py-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>

                {/* Notifications List */}
                {filteredNotifications.length === 0 ? (
                    <div className="text-center py-20 bg-gray-800/30 rounded-xl border border-gray-700">
                        <div className="text-6xl mb-4">🔔</div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                        </h3>
                        <p className="text-gray-400">
                            {filter === 'unread'
                                ? "You're all caught up!"
                                : "We'll notify you when something happens"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification._id}
                                className={`group relative bg-gray-800/50 backdrop-blur-sm rounded-xl border transition-all hover:border-purple-500/50 ${!notification.read
                                        ? 'border-purple-500/30 bg-purple-500/5'
                                        : 'border-gray-700'
                                    }`}
                            >
                                <div className="p-6">
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className="text-3xl flex-shrink-0">
                                            {getNotificationIcon(notification.type)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <h3 className="text-lg font-semibold text-white">
                                                    {notification.title}
                                                </h3>
                                                {!notification.read && (
                                                    <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-2" />
                                                )}
                                            </div>
                                            <p className="text-gray-300 mb-3">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span>
                                                    {formatDistanceToNow(new Date(notification.createdAt), {
                                                        addSuffix: true
                                                    })}
                                                </span>
                                                <span className="px-2 py-1 bg-gray-700 rounded text-xs">
                                                    {notification.type}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-700">
                                        {notification.link && (
                                            <Link href={notification.link}>
                                                <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                                                    View Details →
                                                </button>
                                            </Link>
                                        )}
                                        {!notification.read && (
                                            <button
                                                onClick={() => markAsRead(notification._id)}
                                                className="text-sm text-gray-400 hover:text-white transition-colors"
                                            >
                                                Mark as read
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteNotification(notification._id)}
                                            className="text-sm text-red-400 hover:text-red-300 transition-colors ml-auto"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
