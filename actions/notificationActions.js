// actions/notificationActions.js
"use server"

/**
 * Server Actions for Notification Management
 * Handles notification creation, reading, and preferences
 */

import connectDb from '@/db/connectDb';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Create a notification
 * @param {string} userId - User ID to notify
 * @param {string} type - Notification type
 * @param {Object} data - Notification data
 * @returns {Promise<Object>} Created notification or error
 */
export async function createNotification(userId, type, data) {
    try {
        await connectDb();

        // Verify user exists
        const user = await User.findById(userId);
        if (!user) {
            return { error: 'User not found' };
        }

        // Validate notification type
        const validTypes = ['payment', 'milestone', 'comment', 'update', 'system'];
        if (!validTypes.includes(type)) {
            return { error: 'Invalid notification type' };
        }

        // Create notification
        const notification = await Notification.create({
            user: userId,
            type,
            title: data.title,
            message: data.message,
            link: data.link,
            metadata: data.metadata || {},
            read: false,
            createdAt: new Date()
        });

        return {
            success: true,
            notification: {
                _id: notification._id.toString(),
                type: notification.type
            }
        };

    } catch (error) {
        console.error('Create notification error:', error);
        return { error: error.message || 'Failed to create notification' };
    }
}

/**
 * Mark a notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} Success or error
 */
export async function markAsRead(notificationId) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { error: 'You must be logged in' };
        }

        await connectDb();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return { error: 'User not found' };
        }

        // Find notification and verify ownership
        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return { error: 'Notification not found' };
        }

        if (notification.user.toString() !== user._id.toString()) {
            return { error: 'You do not have permission to mark this notification as read' };
        }

        // Mark as read
        notification.read = true;
        notification.readAt = new Date();
        await notification.save();

        return { success: true };

    } catch (error) {
        console.error('Mark as read error:', error);
        return { error: error.message || 'Failed to mark notification as read' };
    }
}

/**
 * Mark all notifications as read for a user
 * @param {string} userId - User ID (optional, uses session if not provided)
 * @returns {Promise<Object>} Success or error
 */
export async function markAllAsRead(userId = null) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { error: 'You must be logged in' };
        }

        await connectDb();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return { error: 'User not found' };
        }

        // Use provided userId or session user
        const targetUserId = userId || user._id;

        // Mark all unread notifications as read
        const result = await Notification.updateMany(
            { user: targetUserId, read: false },
            { $set: { read: true, readAt: new Date() } }
        );

        return {
            success: true,
            count: result.modifiedCount
        };

    } catch (error) {
        console.error('Mark all as read error:', error);
        return { error: error.message || 'Failed to mark all notifications as read' };
    }
}

/**
 * Get unread notification count
 * @param {string} userId - User ID (optional, uses session if not provided)
 * @returns {Promise<Object>} Count or error
 */
export async function getUnreadCount(userId = null) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { error: 'You must be logged in' };
        }

        await connectDb();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return { error: 'User not found' };
        }

        // Use provided userId or session user
        const targetUserId = userId || user._id;

        const count = await Notification.countDocuments({
            user: targetUserId,
            read: false
        });

        return {
            success: true,
            count
        };

    } catch (error) {
        console.error('Get unread count error:', error);
        return { error: error.message || 'Failed to get unread count' };
    }
}

/**
 * Get user's notifications
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Notifications or error
 */
export async function getNotifications(filters = {}) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { error: 'You must be logged in' };
        }

        await connectDb();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return { error: 'User not found' };
        }

        // Build query
        const query = { user: user._id };

        if (filters.type) {
            query.type = filters.type;
        }

        if (filters.read !== undefined) {
            query.read = filters.read;
        }

        // Fetch notifications
        const limit = filters.limit || 50;
        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        // Serialize for client
        const serialized = notifications.map(n => ({
            ...n,
            _id: n._id.toString(),
            user: n.user.toString(),
            createdAt: n.createdAt?.toISOString(),
            readAt: n.readAt?.toISOString()
        }));

        return { success: true, notifications: serialized };

    } catch (error) {
        console.error('Get notifications error:', error);
        return { error: error.message || 'Failed to fetch notifications' };
    }
}

/**
 * Delete a notification
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} Success or error
 */
export async function deleteNotification(notificationId) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { error: 'You must be logged in' };
        }

        await connectDb();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return { error: 'User not found' };
        }

        // Find notification and verify ownership
        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return { error: 'Notification not found' };
        }

        if (notification.user.toString() !== user._id.toString()) {
            return { error: 'You do not have permission to delete this notification' };
        }

        await Notification.findByIdAndDelete(notificationId);

        return { success: true };

    } catch (error) {
        console.error('Delete notification error:', error);
        return { error: error.message || 'Failed to delete notification' };
    }
}

/**
 * Helper: Create payment notification
 * @param {string} creatorId - Creator user ID
 * @param {Object} paymentData - Payment details
 * @returns {Promise<Object>} Success or error
 */
export async function notifyPaymentReceived(creatorId, paymentData) {
    return await createNotification(creatorId, 'payment', {
        title: 'New Payment Received!',
        message: `${paymentData.supporterName} supported your campaign "${paymentData.campaignTitle}" with ₹${paymentData.amount}`,
        link: `/dashboard/campaigns/${paymentData.campaignId}`,
        metadata: {
            amount: paymentData.amount,
            campaignId: paymentData.campaignId,
            paymentId: paymentData.paymentId
        }
    });
}

/**
 * Helper: Create milestone notification
 * @param {string} creatorId - Creator user ID
 * @param {Object} milestoneData - Milestone details
 * @returns {Promise<Object>} Success or error
 */
export async function notifyMilestoneReached(creatorId, milestoneData) {
    return await createNotification(creatorId, 'milestone', {
        title: 'Milestone Reached!',
        message: `Your campaign "${milestoneData.campaignTitle}" reached ${milestoneData.percentage}% of its goal!`,
        link: `/dashboard/campaigns/${milestoneData.campaignId}`,
        metadata: {
            campaignId: milestoneData.campaignId,
            percentage: milestoneData.percentage,
            amount: milestoneData.amount
        }
    });
}

/**
 * Helper: Create comment notification
 * @param {string} creatorId - Creator user ID
 * @param {Object} commentData - Comment details
 * @returns {Promise<Object>} Success or error
 */
export async function notifyNewComment(creatorId, commentData) {
    return await createNotification(creatorId, 'comment', {
        title: 'New Comment',
        message: `${commentData.commenterName} commented on your campaign "${commentData.campaignTitle}"`,
        link: `/${commentData.campaignSlug}#comments`,
        metadata: {
            campaignId: commentData.campaignId,
            commentId: commentData.commentId
        }
    });
}

/**
 * Helper: Create update notification for supporters
 * @param {Array} supporterIds - Array of supporter user IDs
 * @param {Object} updateData - Update details
 * @returns {Promise<Object>} Success or error
 */
export async function notifyCampaignUpdate(supporterIds, updateData) {
    try {
        const notifications = supporterIds.map(supporterId => ({
            user: supporterId,
            type: 'update',
            title: 'New Campaign Update',
            message: `${updateData.creatorName} posted an update: "${updateData.updateTitle}"`,
            link: `/${updateData.campaignSlug}#updates`,
            metadata: {
                campaignId: updateData.campaignId,
                updateId: updateData.updateId
            },
            read: false,
            createdAt: new Date()
        }));

        await connectDb();
        await Notification.insertMany(notifications);

        return { success: true, count: notifications.length };

    } catch (error) {
        console.error('Notify campaign update error:', error);
        return { error: error.message || 'Failed to send update notifications' };
    }
}
