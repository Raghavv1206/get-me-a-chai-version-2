// actions/notificationActions.js
"use server"

/**
 * Server Actions for Notification Management
 * These actions are called from client components.
 * All notification creation goes through @/lib/notifications.
 */

import connectDb from '@/db/connectDb';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Mark a single notification as read
 */
export async function markAsRead(notificationId) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { error: 'You must be logged in' };
        }

        await connectDb();
        const user = await User.findOne({ email: session.user.email }).select('_id').lean();
        if (!user) return { error: 'User not found' };

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, user: user._id },
            { $set: { read: true, readAt: new Date() } },
            { new: true }
        );

        if (!notification) return { error: 'Notification not found' };

        return { success: true };
    } catch (error) {
        console.error('Mark as read error:', error);
        return { error: error.message || 'Failed to mark notification as read' };
    }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { error: 'You must be logged in' };
        }

        await connectDb();
        const user = await User.findOne({ email: session.user.email }).select('_id').lean();
        if (!user) return { error: 'User not found' };

        const result = await Notification.updateMany(
            { user: user._id, read: false },
            { $set: { read: true, readAt: new Date() } }
        );

        return { success: true, count: result.modifiedCount };
    } catch (error) {
        console.error('Mark all as read error:', error);
        return { error: error.message || 'Failed to mark all notifications as read' };
    }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { success: false, count: 0 };
        }

        await connectDb();
        const user = await User.findOne({ email: session.user.email }).select('_id').lean();
        if (!user) return { success: false, count: 0 };

        const count = await Notification.countDocuments({
            user: user._id,
            read: false,
        });

        return { success: true, count };
    } catch (error) {
        console.error('Get unread count error:', error);
        return { success: false, count: 0 };
    }
}

/**
 * Get user's notifications
 */
export async function getNotifications(filters = {}) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { error: 'You must be logged in' };
        }

        await connectDb();
        const user = await User.findOne({ email: session.user.email }).select('_id').lean();
        if (!user) return { error: 'User not found' };

        const query = { user: user._id };
        if (filters.type) query.type = filters.type;
        if (filters.read !== undefined) query.read = filters.read;

        const limit = Math.min(filters.limit || 50, 100);
        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        const serialized = notifications.map(n => ({
            _id: n._id.toString(),
            type: n.type,
            title: n.title,
            message: n.message,
            link: n.link || null,
            read: n.read,
            metadata: n.metadata || {},
            createdAt: n.createdAt?.toISOString?.() || n.createdAt,
            readAt: n.readAt?.toISOString?.() || null,
        }));

        return { success: true, notifications: serialized };
    } catch (error) {
        console.error('Get notifications error:', error);
        return { error: error.message || 'Failed to fetch notifications' };
    }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { error: 'You must be logged in' };
        }

        await connectDb();
        const user = await User.findOne({ email: session.user.email }).select('_id').lean();
        if (!user) return { error: 'User not found' };

        const notification = await Notification.findOneAndDelete({
            _id: notificationId,
            user: user._id,
        });

        if (!notification) return { error: 'Notification not found' };

        return { success: true };
    } catch (error) {
        console.error('Delete notification error:', error);
        return { error: error.message || 'Failed to delete notification' };
    }
}

/**
 * Get notification preferences for the current user
 */
export async function getNotificationPreferences() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { error: 'You must be logged in' };
        }

        await connectDb();
        const user = await User.findOne({ email: session.user.email })
            .select('notificationPreferences')
            .lean();

        if (!user) return { error: 'User not found' };

        const defaults = {
            email: {
                payment: true, milestone: true, comment: true, update: true,
                system: true, campaign: true, subscription: true, follow: true, reply: true,
            },
            inApp: {
                payment: true, milestone: true, comment: true, update: true,
                system: true, campaign: true, subscription: true, follow: true, reply: true,
            },
            frequency: 'realtime',
            newsletter: true,
        };

        const prefs = user.notificationPreferences || {};
        return {
            success: true,
            preferences: {
                email: { ...defaults.email, ...(prefs.email || {}) },
                inApp: { ...defaults.inApp, ...(prefs.inApp || {}) },
                frequency: prefs.frequency || defaults.frequency,
                newsletter: prefs.newsletter !== undefined ? prefs.newsletter : defaults.newsletter,
            },
        };
    } catch (error) {
        console.error('Get preferences error:', error);
        return { error: error.message || 'Failed to fetch preferences' };
    }
}

/**
 * Save notification preferences for the current user
 */
export async function saveNotificationPreferences(preferences) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { error: 'You must be logged in' };
        }

        if (!preferences || typeof preferences !== 'object') {
            return { error: 'Invalid preferences data' };
        }

        await connectDb();

        const validFrequencies = ['realtime', 'daily', 'weekly'];
        const validKeys = ['payment', 'milestone', 'comment', 'update', 'system', 'campaign', 'subscription', 'follow', 'reply'];

        const sanitize = (obj) => {
            if (!obj || typeof obj !== 'object') return {};
            const result = {};
            for (const k of validKeys) result[k] = obj[k] !== false;
            return result;
        };

        const sanitizedInApp = sanitize(preferences?.inApp);
        // System in-app notifications are always enabled
        sanitizedInApp.system = true;

        const updateData = {
            'notificationPreferences.email': sanitize(preferences?.email),
            'notificationPreferences.inApp': sanitizedInApp,
            'notificationPreferences.frequency': validFrequencies.includes(preferences?.frequency) ? preferences.frequency : 'realtime',
            'notificationPreferences.newsletter': preferences?.newsletter !== false,
        };

        const result = await User.updateOne(
            { email: session.user.email },
            { $set: updateData }
        );

        if (result.matchedCount === 0) return { error: 'User not found' };

        return { success: true };
    } catch (error) {
        console.error('Save preferences error:', error);
        return { error: error.message || 'Failed to save preferences' };
    }
}
// NOTE: Do NOT re-export notification helpers (notifyPaymentReceived, etc.) here.
// This is a "use server" file — re-exporting them would expose them as client-callable
// server actions, allowing anyone to create fake notifications.
// Those functions should only be called from server-side code (API routes, webhooks).
