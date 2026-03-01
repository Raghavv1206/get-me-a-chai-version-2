// components/NotificationBell.js
"use client"
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useScrollIsolation } from '../hooks/useScrollIsolation';
import { Wallet, Rocket, MessageCircle, Target, Bell, Megaphone, X } from 'lucide-react';

export default function NotificationBell() {
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const triggerRef = useRef(null);
    const panelRef = useRef(null);
    const scrollRef = useScrollIsolation();
    const [panelStyle, setPanelStyle] = useState({});

    useEffect(() => {
        if (session) {
            fetchNotifications();

            // Poll for new notifications every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [session]);

    // Calculate dropdown position based on trigger button location
    const updatePosition = useCallback(() => {
        if (!triggerRef.current || !isOpen) return;

        const rect = triggerRef.current.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const panelWidth = Math.min(384, vw - 16); // 384px = w-96, 16px margin
        const isMobileView = vw < 640;

        if (isMobileView) {
            // Mobile: near full-width, below navbar
            setPanelStyle({
                position: 'fixed',
                left: '8px',
                right: '8px',
                top: `${Math.min(rect.bottom + 8, 72)}px`,
                bottom: 'auto',
                width: 'auto',
                maxHeight: `${vh - Math.min(rect.bottom + 8, 72) - 16}px`,
            });
        } else {
            // Desktop/tablet: position below trigger, clamped to viewport
            const top = rect.bottom + 8;
            let right = vw - rect.right;

            // Ensure panel doesn't overflow left edge
            const leftEdge = vw - right - panelWidth;
            if (leftEdge < 8) {
                right = vw - panelWidth - 8;
            }
            // Ensure panel doesn't overflow right edge
            if (right < 8) {
                right = 8;
            }

            const maxHeight = vh - top - 16;

            setPanelStyle({
                position: 'fixed',
                top: `${top}px`,
                right: `${right}px`,
                width: `${panelWidth}px`,
                maxHeight: `${Math.min(maxHeight, 500)}px`,
            });
        }
    }, [isOpen]);

    // Update position on open, resize, scroll
    useEffect(() => {
        if (!isOpen) return;

        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [isOpen, updatePosition]);

    // Close dropdown when clicking outside
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event) => {
            if (
                triggerRef.current && !triggerRef.current.contains(event.target) &&
                panelRef.current && !panelRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        const timer = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }, 0);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    const fetchNotifications = async () => {
        try {
            const response = await fetch('/api/notifications');
            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
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
            default:
                return <Megaphone className="w-5 h-5 text-gray-400" />;
        }
    };

    if (!session) return null;

    return (
        <>
            {/* Bell Icon Button */}
            <button
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-gray-800 z-[51]"
                aria-label="Notifications"
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

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-[60] bg-black/50 sm:bg-black/20"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Notification panel - always fixed, position calculated dynamically */}
                    <div
                        ref={panelRef}
                        className="z-[61] flex flex-col"
                        style={panelStyle}
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
                                        onClick={() => setIsOpen(false)}
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
                                                    setIsOpen(false);
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
                                                        {formatDistanceToNow(new Date(notification.createdAt), {
                                                            addSuffix: true
                                                        })}
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
                                        onClick={() => setIsOpen(false)}
                                    >
                                        View All Notifications
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
