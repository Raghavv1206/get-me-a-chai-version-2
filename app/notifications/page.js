// app/notifications/page.js
"use client"
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { DollarSign, Rocket, MessageCircle, Target, Bell, Megaphone } from 'lucide-react';

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
        const iconClass = "w-5 h-5";
        switch (type) {
            case 'payment': return <DollarSign className={`${iconClass} text-green-400`} />;
            case 'campaign': return <Rocket className={`${iconClass} text-purple-400`} />;
            case 'comment': return <MessageCircle className={`${iconClass} text-blue-400`} />;
            case 'milestone': return <Target className={`${iconClass} text-yellow-400`} />;
            case 'system': return <Bell className={`${iconClass} text-gray-400`} />;
            default: return <Megaphone className={`${iconClass} text-gray-400`} />;
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
            <div className="min-h-screen bg-black text-gray-100">
                <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />
                <div className="fixed bottom-0 left-20 w-[400px] h-[400px] bg-blue-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />
                <main className="pt-24 px-4 md:px-8 pb-8 min-h-screen relative">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="animate-pulse space-y-4">
                            <div className="h-8 bg-white/5 rounded w-1/3" />
                            <div className="h-64 bg-white/5 rounded" />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-gray-100">
            {/* Background Ambient Effects - Same as Dashboard */}
            <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />
            <div className="fixed bottom-0 left-20 w-[400px] h-[400px] bg-blue-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />

            {/* Main Content */}
            <main className="pt-24 px-4 md:px-8 pb-8 min-h-screen relative">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Notifications</h1>
                        <p className="text-gray-400 mt-1">
                            Stay updated with your campaigns and community
                        </p>
                    </div>

                    {/* Filters & Actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        {/* Filter Tabs */}
                        <div className="flex gap-2 bg-white/5 backdrop-blur-xl border border-white/10 p-1 rounded-xl">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all'
                                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                All ({notifications.length})
                            </button>
                            <button
                                onClick={() => setFilter('unread')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'unread'
                                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                Unread ({unreadCount})
                            </button>
                            <button
                                onClick={() => setFilter('read')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'read'
                                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                Read ({notifications.length - unreadCount})
                            </button>
                        </div>

                        {/* Mark All as Read */}
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="px-4 py-2 text-sm text-purple-400 hover:text-purple-300 transition-colors bg-purple-500/10 hover:bg-purple-500/20 rounded-lg border border-purple-500/20"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    {filteredNotifications.length === 0 ? (
                        <div className="text-center py-20 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                            <div className="mb-4 flex justify-center"><Bell className="w-14 h-14 text-gray-500" /></div>
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
                        <div className="space-y-4">
                            {filteredNotifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`group relative bg-white/5 backdrop-blur-xl rounded-2xl border transition-all hover:border-purple-500/50 hover:bg-white/10 ${!notification.read
                                        ? 'border-purple-500/30 bg-purple-500/5 ring-1 ring-purple-500/20'
                                        : 'border-white/10'
                                        }`}
                                >
                                    <div className="p-6">
                                        <div className="flex items-start gap-4">
                                            {/* Icon */}
                                            <div className="text-3xl flex-shrink-0 bg-white/5 p-3 rounded-xl border border-white/10">
                                                {getNotificationIcon(notification.type)}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-4 mb-2">
                                                    <h3 className={`text-lg font-bold ${!notification.read ? 'text-white' : 'text-gray-200'}`}>
                                                        {notification.title}
                                                    </h3>
                                                    {!notification.read && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                                                            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">New</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-gray-300 mb-3 leading-relaxed">
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span>
                                                        {formatDistanceToNow(new Date(notification.createdAt), {
                                                            addSuffix: true
                                                        })}
                                                    </span>
                                                    <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs font-medium text-gray-300 border border-white/5">
                                                        {notification.type}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/10 pl-[70px]">
                                            {notification.link && (
                                                <Link href={notification.link}>
                                                    <button className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
                                                        View Details
                                                        <span className="text-lg">→</span>
                                                    </button>
                                                </Link>
                                            )}
                                            {!notification.read && (
                                                <button
                                                    onClick={() => markAsRead(notification._id)}
                                                    className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                                                >
                                                    Mark as read
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteNotification(notification._id)}
                                                className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 focus:opacity-100"
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
            </main>
        </div>
    );
}
