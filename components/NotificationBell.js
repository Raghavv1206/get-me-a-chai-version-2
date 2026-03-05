// components/NotificationBell.js
"use client"
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useScrollIsolation } from '../hooks/useScrollIsolation';
import { Wallet, Rocket, MessageCircle, Target, Bell, Megaphone, X, CreditCard, UserPlus, Reply, FileEdit } from 'lucide-react';

export default function NotificationBell() {
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef(null);
    const scrollRef = useScrollIsolation();

    // Track whether there were unread notifications when the panel was opened.
    // Using a ref avoids stale-closure issues inside event handlers.
    const hadUnreadRef = useRef(false);
    // Guard against duplicate mark-all-read calls in the same open/close cycle
    const markingAllRef = useRef(false);

    useEffect(() => {
        if (session) {
            fetchUnreadCount();

            // Poll for unread count every 30 seconds (lightweight)
            const interval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [session]);

    // ─── Centralized close handler ───────────────────────────────────────
    // Every place that closes the panel calls this instead of setIsOpen(false)
    const closePanel = useCallback(() => {
        // Only act if the panel is actually open
        setIsOpen((prev) => {
            if (!prev) return prev; // already closed — no-op

            // Fire mark-all-read if there were unread notifications and we haven't
            // already sent the request in this cycle
            if (hadUnreadRef.current && !markingAllRef.current) {
                markingAllRef.current = true;
                // Fire-and-forget: don't block the UI
                fetch('/api/notifications', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'mark-all-read' }),
                })
                    .then((res) => {
                        if (res.ok) {
                            // Update local state so the badge disappears immediately
                            setNotifications((n) => n.map((item) => ({ ...item, read: true })));
                            setUnreadCount(0);
                        }
                    })
                    .catch((err) => console.error('Auto mark-all-read error:', err))
                    .finally(() => {
                        markingAllRef.current = false;
                    });
            }

            hadUnreadRef.current = false;
            return false; // close the panel
        });
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                closePanel();
            }
        };

        // Use setTimeout to avoid closing immediately on the same click that opens
        const timer = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }, 0);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isOpen, closePanel]);

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') closePanel();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, closePanel]);

    const fetchUnreadCount = async () => {
        try {
            const response = await fetch('/api/notifications/count');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setUnreadCount(data.count || 0);
                }
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const fetchNotifications = async () => {
        try {
            const response = await fetch('/api/notifications?limit=10');
            if (response.ok) {
                const data = await response.json();
                const fetched = data.notifications || [];
                setNotifications(fetched);
                const fetchedUnread = data.unreadCount ?? 0;
                setUnreadCount(fetchedUnread);

                // Record whether there are unread notifications in this batch
                hadUnreadRef.current = fetchedUnread > 0 || fetched.some((n) => !n.read);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleToggleDropdown = () => {
        if (!isOpen) {
            // Opening — reset the guard and fetch fresh data
            markingAllRef.current = false;
            fetchNotifications();
            setIsOpen(true);
        } else {
            // Closing via the bell button — use centralized close
            closePanel();
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
                // Update local state
                setNotifications(prev =>
                    prev.map(n =>
                        n._id === notificationId ? { ...n, read: true } : n
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'mark-all-read' })
            });

            if (response.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                setUnreadCount(0);
                // Already marked all — no need to repeat on close
                hadUnreadRef.current = false;
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        } finally {
            setLoading(false);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'payment':
                return <Wallet className="w-5 h-5 text-green-400" />;
            case 'campaign':
                return <Rocket className="w-5 h-5 text-blue-400" />;
            case 'comment':
                return <MessageCircle className="w-5 h-5 text-purple-400" />;
            case 'milestone':
                return <Target className="w-5 h-5 text-yellow-400" />;
            case 'system':
                return <Bell className="w-5 h-5 text-gray-400" />;
            case 'subscription':
                return <CreditCard className="w-5 h-5 text-pink-400" />;
            case 'follow':
                return <UserPlus className="w-5 h-5 text-emerald-400" />;
            case 'reply':
                return <Reply className="w-5 h-5 text-cyan-400" />;
            case 'update':
                return <FileEdit className="w-5 h-5 text-indigo-400" />;
            default:
                return <Megaphone className="w-5 h-5 text-gray-400" />;
        }
    };

    if (!session) return null;

    return (
        <div ref={wrapperRef} className="relative">
            {/* Bell Icon Button */}
            <button
                onClick={handleToggleDropdown}
                className="relative p-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-gray-800 z-[51]"
                aria-label="Notifications"
                aria-expanded={isOpen}
                aria-haspopup="true"
                type="button"
            >
                <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>

                {/* Unread Badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <>
                    {/* Backdrop - visible on mobile, subtle on desktop */}
                    <div
                        className="fixed inset-0 z-[60] bg-black/50 sm:bg-transparent"
                        onClick={closePanel}
                    />

                    {/* Panel: right-aligned via CSS, no JS positioning needed */}
                    <div
                        className="
                            z-[61]
                            fixed sm:absolute
                            inset-x-2 top-16 sm:inset-x-auto sm:top-full
                            sm:right-0 sm:mt-2
                            w-auto sm:w-96
                            max-h-[calc(100vh-5rem)] sm:max-h-[500px]
                        "
                    >
                        <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl flex flex-col overflow-hidden h-full">
                            {/* Header */}
                            <div className="p-4 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
                                <h3 className="text-lg font-bold text-white">Notifications</h3>
                                <div className="flex items-center gap-3">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            disabled={loading}
                                            className="text-xs text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
                                        >
                                            Mark all as read
                                        </button>
                                    )}
                                    <button
                                        onClick={closePanel}
                                        className="sm:hidden p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                                        aria-label="Close notifications"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Notifications List */}
                            <div ref={scrollRef} className="overflow-y-auto flex-1">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <div className="flex justify-center mb-2"><Bell className="w-8 h-8 text-gray-500" /></div>
                                        <p className="text-gray-400">No notifications yet</p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            We&apos;ll notify you when something happens
                                        </p>
                                    </div>
                                ) : (
                                    notifications.slice(0, 5).map((notification) => (
                                        <div
                                            key={notification._id}
                                            className={`p-4 border-b border-gray-800 hover:bg-gray-800/50 transition-colors cursor-pointer ${!notification.read ? 'bg-purple-500/5' : ''
                                                }`}
                                            onClick={() => {
                                                if (!notification.read) {
                                                    markAsRead(notification._id);
                                                }
                                                if (notification.link) {
                                                    closePanel();
                                                    window.location.href = notification.link;
                                                }
                                            }}
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Icon */}
                                                <div className="text-2xl flex-shrink-0">
                                                    {getNotificationIcon(notification.type)}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-white font-medium line-clamp-2">
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        {notification.createdAt
                                                            ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
                                                            : 'Just now'}
                                                    </p>
                                                </div>

                                                {/* Unread Indicator */}
                                                {!notification.read && (
                                                    <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-2" />
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            {notifications.length > 0 && (
                                <div className="p-3 border-t border-gray-800 flex-shrink-0">
                                    <Link
                                        href="/notifications"
                                        className="block text-center text-sm text-purple-400 hover:text-purple-300 transition-colors"
                                        onClick={closePanel}
                                    >
                                        View All Notifications
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
