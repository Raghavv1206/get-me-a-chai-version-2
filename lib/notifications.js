// lib/notifications.js
import { buildCampaignUrl, buildDashboardUrl, buildMyContributionsUrl, getBaseUrl } from '@/lib/urlHelpers';
/**
 * Centralized Notification Service
 * Creates in-app notifications AND sends emails while respecting user preferences.
 * All notification creation should go through this module.
 *
 * Auto-cleanup: Only the most recent MAX_NOTIFICATIONS_PER_USER notifications
 * are kept per user. Older ones are deleted automatically after each create.
 */

import connectDb from '@/db/connectDb';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { sendEmail, sendBulkEmail } from '@/lib/email/nodemailer';
import { CreatorNotificationEmail } from '@/lib/email/templates/CreatorNotificationEmail';
import { PaymentConfirmationEmail } from '@/lib/email/templates/PaymentConfirmationEmail';
import { MilestoneEmail } from '@/lib/email/templates/MilestoneEmail';
import { UpdateNotificationEmail } from '@/lib/email/templates/UpdateNotificationEmail';
import { WelcomeEmail } from '@/lib/email/templates/WelcomeEmail';

/**
 * Maximum number of notifications to retain per user.
 * After each notification creation, any excess is deleted.
 */
const MAX_NOTIFICATIONS_PER_USER = 20;

/**
 * Default notification preferences (used when user has no preferences set)
 */
const DEFAULT_PREFERENCES = {
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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Get user's notification preferences with defaults
 */
function getUserPreferences(user) {
    const prefs = user?.notificationPreferences || {};
    return {
        email: { ...DEFAULT_PREFERENCES.email, ...(prefs.email || {}) },
        inApp: { ...DEFAULT_PREFERENCES.inApp, ...(prefs.inApp || {}) },
        frequency: prefs.frequency || DEFAULT_PREFERENCES.frequency,
    };
}

/**
 * Check if user has in-app notifications enabled for a given type
 */
function isInAppEnabled(user, type) {
    const prefs = getUserPreferences(user);
    if (type === 'system') return true;
    return prefs.inApp[type] !== false;
}

/**
 * Check if user has email notifications enabled for a given type.
 * This checks the per-type toggle only — does NOT check frequency.
 */
function isEmailEnabled(user, type) {
    const prefs = getUserPreferences(user);
    if (type === 'system') return true;
    return prefs.email[type] !== false;
}

/**
 * Check if real-time email should be sent based on frequency preference.
 * Returns false when user has chosen daily/weekly digest (except for system emails).
 * System emails always bypass the frequency check.
 */
function isRealtimeEmailAllowed(user, type) {
    if (type === 'system') return true; // system always sent immediately
    const prefs = getUserPreferences(user);
    // Only send real-time emails if frequency is 'realtime'
    // If user selected 'daily' or 'weekly', skip real-time sends
    return prefs.frequency === 'realtime';
}

/**
 * Combined check: email enabled for this type AND real-time delivery allowed.
 */
function shouldSendRealtimeEmail(user, type) {
    return isEmailEnabled(user, type) && isRealtimeEmailAllowed(user, type);
}

/**
 * Check if a string is a valid email address
 */
function isValidEmail(email) {
    return email && typeof email === 'string' && EMAIL_REGEX.test(email.trim());
}

/**
 * Send an email safely (fire-and-forget, never throws)
 * @param {Object} options - { to, subject, html, text }
 */
async function safeEmailSend(options) {
    try {
        if (!options.to || !isValidEmail(options.to)) {
            return;
        }
        const result = await sendEmail(options);
        if (result.success) {
            console.log(`[Notifications] Email sent to ${options.to}: ${options.subject?.substring(0, 50)}`);
        } else {
            console.warn(`[Notifications] Email failed to ${options.to}: ${result.error}`);
        }
    } catch (error) {
        console.error('[Notifications] Email send error (non-fatal):', error.message);
    }
}

/**
 * Trim notifications for a user, keeping only the most recent MAX_NOTIFICATIONS_PER_USER.
 */
async function trimUserNotifications(userId, maxCount = MAX_NOTIFICATIONS_PER_USER) {
    try {
        if (!userId) return;

        const toKeep = await Notification.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(maxCount)
            .select('_id')
            .lean();

        if (toKeep.length < maxCount) return;

        const keepIds = toKeep.map(n => n._id);
        const result = await Notification.deleteMany({
            user: userId,
            _id: { $nin: keepIds },
        });

        if (result.deletedCount > 0) {
            console.log(`[Notifications] Trimmed ${result.deletedCount} old notification(s) for user ${userId}`);
        }
    } catch (error) {
        console.error('[Notifications] Trim failed (non-fatal):', error.message);
    }
}

/**
 * Core notification creation function
 * Creates in-app notification. Email sending is handled by individual helper functions
 * to allow per-event email templates.
 */
export async function createNotification({
    userId,
    type,
    title,
    message,
    link,
    metadata = {},
    campaignId,
    paymentId,
    relatedUserId,
}) {
    try {
        if (!userId || !type || !title || !message) {
            console.warn('[Notifications] Missing required fields:', { userId: !!userId, type, title: !!title, message: !!message });
            return null;
        }

        await connectDb();

        const user = await User.findById(userId).lean();
        if (!user) {
            console.warn('[Notifications] User not found:', userId);
            return null;
        }

        // Don't notify user about their own actions
        if (relatedUserId && relatedUserId.toString() === userId.toString()) {
            return null;
        }

        // Check if in-app notification is enabled
        if (!isInAppEnabled(user, type)) {
            return null;
        }

        const notification = await Notification.create({
            user: userId,
            type,
            title,
            message,
            link: link || undefined,
            metadata,
            campaign: campaignId || undefined,
            payment: paymentId || undefined,
            relatedUser: relatedUserId || undefined,
            read: false,
        });

        // Trim old notifications (fire-and-forget)
        trimUserNotifications(userId).catch(() => { });

        return {
            success: true,
            notification: {
                _id: notification._id.toString(),
                type: notification.type,
            },
        };
    } catch (error) {
        console.error('[Notifications] Failed to create notification:', error.message);
        return null;
    }
}

/**
 * Create notifications for multiple users (bulk)
 */
export async function createBulkNotifications(notifications) {
    try {
        if (!notifications || notifications.length === 0) return { success: true, count: 0 };

        await connectDb();

        const userIds = [...new Set(notifications.map(n => n.userId?.toString()).filter(Boolean))];
        const users = await User.find({ _id: { $in: userIds } }).lean();
        const userMap = new Map(users.map(u => [u._id.toString(), u]));

        const validNotifications = notifications
            .filter(n => {
                const user = userMap.get(n.userId?.toString());
                if (!user) return false;
                if (n.relatedUserId && n.relatedUserId.toString() === n.userId.toString()) return false;
                return isInAppEnabled(user, n.type);
            })
            .map(n => ({
                user: n.userId,
                type: n.type,
                title: n.title,
                message: n.message,
                link: n.link || undefined,
                metadata: n.metadata || {},
                campaign: n.campaignId || undefined,
                payment: n.paymentId || undefined,
                relatedUser: n.relatedUserId || undefined,
                read: false,
                createdAt: new Date(),
            }));

        if (validNotifications.length === 0) return { success: true, count: 0 };

        await Notification.insertMany(validNotifications);

        // Trim old notifications for each affected user (fire-and-forget)
        const affectedUserIds = [...new Set(validNotifications.map(n => n.user.toString()))];
        for (const uid of affectedUserIds) {
            trimUserNotifications(uid).catch(() => { });
        }

        return { success: true, count: validNotifications.length };
    } catch (error) {
        console.error('[Notifications] Bulk create failed:', error.message);
        return { success: false, error: error.message };
    }
}


// ============================================================
//  Pre-built notification helpers for specific events
//  Each one creates an in-app notification + sends an email
// ============================================================

/**
 * Notify creator about a new payment received
 */
export async function notifyPaymentReceived({ creatorId, supporterName, campaignTitle, campaignId, paymentId, amount, anonymous = false, campaignSlug, message: supporterMessage }) {
    const displayName = anonymous ? 'Someone' : (supporterName || 'Someone');

    // In-app notification
    const result = await createNotification({
        userId: creatorId,
        type: 'payment',
        title: 'New Payment Received!',
        message: `${displayName} supported your campaign "${campaignTitle}" with ₹${amount}`,
        link: buildCampaignUrl(campaignId),
        campaignId,
        paymentId,
        metadata: { amount, anonymous },
    });

    // Email notification (fire-and-forget)
    _sendPaymentReceivedEmail({
        creatorId, supporterName: displayName, campaignTitle, campaignSlug,
        campaignId, amount, anonymous, supporterMessage,
    }).catch(() => { });

    return result;
}

/**
 * Internal: Send payment-received email to creator
 */
async function _sendPaymentReceivedEmail({ creatorId, supporterName, campaignTitle, campaignSlug, campaignId, amount, anonymous, supporterMessage }) {
    try {
        await connectDb();
        const creator = await User.findById(creatorId).select('email name notificationPreferences').lean();
        if (!creator?.email || !isValidEmail(creator.email)) return;
        if (!shouldSendRealtimeEmail(creator, 'payment')) return;

        // Get campaign stats for the email template
        const Campaign = (await import('@/models/Campaign')).default;
        const Payment = (await import('@/models/Payment')).default;
        let campaign = null;
        let totalRaised = 0;
        let goal = 0;
        let supportersCount = 0;

        if (campaignId) {
            campaign = await Campaign.findById(campaignId).lean();
            if (campaign) {
                totalRaised = campaign.currentAmount || 0;
                goal = campaign.goalAmount || totalRaised;
                const paymentCount = await Payment.countDocuments({
                    campaign: campaignId,
                    done: true,
                    status: 'success',
                });
                supportersCount = paymentCount;
            }
        }

        const emailData = CreatorNotificationEmail({
            creatorName: creator.name || 'Creator',
            supporterName,
            amount: Number(amount) || 0,
            campaignTitle: campaignTitle || 'your campaign',
            campaignId: campaignId || '',
            message: supporterMessage || '',
            isAnonymous: anonymous || false,
            totalRaised: Number(totalRaised) || 0,
            goal: Number(goal) || 1,
            supportersCount: Number(supportersCount) || 0,
            userId: creatorId?.toString(),
        });

        await safeEmailSend({
            to: creator.email,
            subject: emailData.subject,
            html: emailData.html,
            text: emailData.text,
        });
    } catch (error) {
        console.error('[Notifications] Payment email failed (non-fatal):', error.message);
    }
}

/**
 * Notify creator that a campaign milestone was reached
 */
export async function notifyMilestoneReached({ creatorId, campaignTitle, campaignId, milestoneTitle, percentage, currentAmount }) {
    const result = await createNotification({
        userId: creatorId,
        type: 'milestone',
        title: 'Milestone Reached! 🎉',
        message: `Your campaign "${campaignTitle}" reached ${percentage}% of its goal! Milestone: ${milestoneTitle}`,
        link: buildCampaignUrl(campaignId),
        campaignId,
        metadata: { percentage, currentAmount, milestoneTitle },
    });

    // Email notification (fire-and-forget)
    _sendMilestoneEmail({ creatorId, campaignTitle, campaignId, percentage, currentAmount }).catch(() => { });

    return result;
}

/**
 * Internal: Send milestone email to creator
 */
async function _sendMilestoneEmail({ creatorId, campaignTitle, campaignId, percentage, currentAmount }) {
    try {
        // Only send email for standard milestones (25, 50, 75, 100)
        const validMilestones = [25, 50, 75, 100];
        if (!validMilestones.includes(percentage)) return;

        await connectDb();
        const creator = await User.findById(creatorId).select('email name notificationPreferences').lean();
        if (!creator?.email || !isValidEmail(creator.email)) return;
        if (!shouldSendRealtimeEmail(creator, 'milestone')) return;

        const Campaign = (await import('@/models/Campaign')).default;
        const Payment = (await import('@/models/Payment')).default;
        let campaign = null;
        let goal = 0;
        let supportersCount = 0;

        if (campaignId) {
            campaign = await Campaign.findById(campaignId).lean();
            if (campaign) {
                goal = campaign.goalAmount || 0;
                supportersCount = await Payment.countDocuments({
                    campaign: campaignId, done: true, status: 'success',
                });
            }
        }

        const emailData = MilestoneEmail({
            creatorName: creator.name || 'Creator',
            campaignTitle: campaignTitle || 'your campaign',
            campaignId: campaignId || '',
            percentage,
            totalRaised: Number(currentAmount) || 0,
            goal: Number(goal) || 1,
            supportersCount: Number(supportersCount) || 0,
            userId: creatorId?.toString(),
        });

        await safeEmailSend({
            to: creator.email,
            subject: emailData.subject,
            html: emailData.html,
            text: emailData.text,
        });
    } catch (error) {
        console.error('[Notifications] Milestone email failed (non-fatal):', error.message);
    }
}

/**
 * Notify creator about a new comment on their campaign
 */
export async function notifyNewComment({ creatorId, commenterId, commenterName, campaignTitle, campaignSlug, campaignId, commentPreview }) {
    const preview = commentPreview?.length > 80 ? commentPreview.substring(0, 80) + '...' : commentPreview;
    const result = await createNotification({
        userId: creatorId,
        type: 'comment',
        title: 'New Comment',
        message: `${commenterName} commented on "${campaignTitle}": "${preview || ''}"`,
        link: buildCampaignUrl(campaignId, { hash: 'comments' }),
        campaignId,
        relatedUserId: commenterId,
        metadata: { commenterName },
    });

    // Email notification for comments (fire-and-forget, uses generic template)
    _sendGenericNotificationEmail({
        userId: creatorId,
        type: 'comment',
        subject: `💬 New Comment on "${campaignTitle}"`,
        heading: 'New Comment on Your Campaign',
        body: `<strong>${commenterName}</strong> commented on your campaign "<strong>${campaignTitle}</strong>":<br><br><em>"${preview || ''}"</em>`,
        ctaText: 'View Comment',
        ctaUrl: buildCampaignUrl(campaignId, { hash: 'comments' }),
    }).catch(() => { });

    return result;
}

/**
 * Notify a user when someone replies to their comment
 */
export async function notifyCommentReply({ commentOwnerId, replierId, replierName, campaignTitle, campaignSlug, campaignId, replyPreview }) {
    const preview = replyPreview?.length > 80 ? replyPreview.substring(0, 80) + '...' : replyPreview;
    const result = await createNotification({
        userId: commentOwnerId,
        type: 'reply',
        title: 'Reply to Your Comment',
        message: `${replierName} replied to your comment on "${campaignTitle}": "${preview || ''}"`,
        link: buildCampaignUrl(campaignId, { hash: 'comments' }),
        campaignId,
        relatedUserId: replierId,
        metadata: { replierName },
    });

    // Email notification for replies (fire-and-forget)
    _sendGenericNotificationEmail({
        userId: commentOwnerId,
        type: 'reply',
        subject: `↩️ ${replierName} replied to your comment`,
        heading: 'Reply to Your Comment',
        body: `<strong>${replierName}</strong> replied to your comment on "<strong>${campaignTitle}</strong>":<br><br><em>"${preview || ''}"</em>`,
        ctaText: 'View Reply',
        ctaUrl: buildCampaignUrl(campaignId, { hash: 'comments' }),
    }).catch(() => { });

    return result;
}

/**
 * Notify supporters about a campaign update
 */
export async function notifyCampaignUpdate({ supporterIds, creatorName, campaignTitle, campaignSlug, campaignId, updateTitle }) {
    const notifications = supporterIds.map(supporterId => ({
        userId: supporterId,
        type: 'update',
        title: 'Campaign Update',
        message: `${creatorName} posted an update on "${campaignTitle}": "${updateTitle}"`,
        link: buildCampaignUrl(campaignId, { hash: 'updates' }),
        campaignId,
        metadata: { creatorName, updateTitle },
    }));

    const result = await createBulkNotifications(notifications);

    // Send emails to all supporters (fire-and-forget)
    _sendUpdateEmails({
        supporterIds, creatorName, campaignTitle, campaignSlug, campaignId, updateTitle,
    }).catch(() => { });

    return result;
}

/**
 * Internal: Send update notification emails to supporters
 */
async function _sendUpdateEmails({ supporterIds, creatorName, campaignTitle, campaignSlug, campaignId, updateTitle }) {
    try {
        if (!supporterIds || supporterIds.length === 0) return;

        await connectDb();
        const supporters = await User.find({ _id: { $in: supporterIds } })
            .select('email name notificationPreferences')
            .lean();

        const recipients = [];
        for (const supporter of supporters) {
            if (!supporter.email || !isValidEmail(supporter.email)) continue;
            if (!shouldSendRealtimeEmail(supporter, 'update')) continue;

            recipients.push({
                email: supporter.email,
                data: {
                    supporterName: supporter.name || 'Supporter',
                    creatorName: creatorName || 'The creator',
                    campaignTitle: campaignTitle || 'a campaign',
                    campaignId: campaignId?.toString() || '',
                    updateTitle: updateTitle || 'New Update',
                    updateSnippet: `${creatorName} posted a new update: "${updateTitle}"`,
                    updateId: campaignId?.toString() || '',
                    userId: supporter._id?.toString(),
                },
            });
        }

        if (recipients.length === 0) return;

        const templateFn = (data) => {
            try {
                return UpdateNotificationEmail(data);
            } catch (err) {
                return {
                    subject: `📝 New Update: ${data.updateTitle}`,
                    html: `<h1>New Update from ${data.creatorName}</h1><p>${data.updateSnippet}</p>`,
                    text: `New Update from ${data.creatorName}: ${data.updateSnippet}`,
                };
            }
        };

        await sendBulkEmail(recipients, templateFn, 100);
        console.log(`[Notifications] Update emails sent to ${recipients.length} supporter(s)`);
    } catch (error) {
        console.error('[Notifications] Update emails failed (non-fatal):', error.message);
    }
}

/**
 * Notify creator about campaign status changes
 */
export async function notifyCampaignStatusChange({ creatorId, campaignTitle, campaignId, oldStatus, newStatus }) {
    const statusMessages = {
        active: `Your campaign "${campaignTitle}" is now live!`,
        paused: `Your campaign "${campaignTitle}" has been paused.`,
        completed: `Your campaign "${campaignTitle}" has been completed! Thank you for using Get Me A Chai.`,
        cancelled: `Your campaign "${campaignTitle}" has been cancelled.`,
        draft: `Your campaign "${campaignTitle}" has been moved to draft.`,
    };

    const result = await createNotification({
        userId: creatorId,
        type: 'campaign',
        title: `Campaign ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
        message: statusMessages[newStatus] || `Your campaign "${campaignTitle}" status changed to ${newStatus}.`,
        link: buildDashboardUrl(),
        campaignId,
        metadata: { oldStatus, newStatus },
    });

    // Email notification for status changes
    _sendGenericNotificationEmail({
        userId: creatorId,
        type: 'campaign',
        subject: `📢 Campaign ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}: "${campaignTitle}"`,
        heading: `Campaign ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
        body: statusMessages[newStatus] || `Your campaign "${campaignTitle}" status changed to ${newStatus}.`,
        ctaText: 'View Dashboard',
        ctaUrl: buildDashboardUrl(),
    }).catch(() => { });

    return result;
}

/**
 * Notify creator about a new subscription
 */
export async function notifyNewSubscription({ creatorId, subscriberId, subscriberName, amount, frequency, campaignId }) {
    const result = await createNotification({
        userId: creatorId,
        type: 'subscription',
        title: 'New Subscription!',
        message: `${subscriberName || 'Someone'} started a ${frequency} subscription of ₹${amount}`,
        link: buildDashboardUrl(),
        campaignId,
        relatedUserId: subscriberId,
        metadata: { amount, frequency },
    });

    _sendGenericNotificationEmail({
        userId: creatorId,
        type: 'subscription',
        subject: `🔄 New ${frequency} Subscription: ₹${amount}`,
        heading: 'New Subscription!',
        body: `<strong>${subscriberName || 'Someone'}</strong> started a <strong>${frequency}</strong> subscription of <strong>₹${amount}</strong>! 🎉`,
        ctaText: 'View Dashboard',
        ctaUrl: buildDashboardUrl(),
    }).catch(() => { });

    return result;
}

/**
 * Notify creator about subscription cancellation
 */
export async function notifySubscriptionCancelled({ creatorId, amount, frequency }) {
    const result = await createNotification({
        userId: creatorId,
        type: 'subscription',
        title: 'Subscription Cancelled',
        message: `A ${frequency} subscription of ₹${amount} was cancelled.`,
        link: buildDashboardUrl(),
        metadata: { amount, frequency },
    });

    // Email notification for subscription cancellation (fire-and-forget)
    _sendGenericNotificationEmail({
        userId: creatorId,
        type: 'subscription',
        subject: `❌ Subscription Cancelled: ₹${amount}/${frequency}`,
        heading: 'Subscription Cancelled',
        body: `A <strong>${frequency}</strong> subscription of <strong>₹${amount}</strong> has been cancelled.`,
        ctaText: 'View Dashboard',
        ctaUrl: buildDashboardUrl(),
    }).catch(() => { });

    return result;
}

/**
 * Notify creator about a subscription charge (recurring payment)
 */
export async function notifySubscriptionCharged({ creatorId, amount, frequency, campaignId }) {
    const result = await createNotification({
        userId: creatorId,
        type: 'payment',
        title: 'Subscription Payment Received',
        message: `A ${frequency} subscription payment of ₹${amount} was received.`,
        link: buildDashboardUrl(),
        campaignId,
        metadata: { amount, frequency, isSubscription: true },
    });

    // Email notification for subscription charge (fire-and-forget)
    _sendGenericNotificationEmail({
        userId: creatorId,
        type: 'payment',
        subject: `💳 Subscription Payment Received: ₹${amount}`,
        heading: 'Subscription Payment Received!',
        body: `A <strong>${frequency}</strong> subscription payment of <strong>₹${amount}</strong> has been successfully processed. 🎉`,
        ctaText: 'View Dashboard',
        ctaUrl: buildDashboardUrl(),
    }).catch(() => { });

    return result;
}

/**
 * Notify a user about a new follower
 */
export async function notifyNewFollower({ userId, followerId, followerName }) {
    const result = await createNotification({
        userId,
        type: 'follow',
        title: 'New Follower',
        message: `${followerName} started following you!`,
        link: buildDashboardUrl(),
        relatedUserId: followerId,
        metadata: { followerName },
    });

    // Email notification for new follower (fire-and-forget)
    _sendGenericNotificationEmail({
        userId,
        type: 'follow',
        subject: `👤 ${followerName} started following you!`,
        heading: 'You Have a New Follower!',
        body: `<strong>${followerName}</strong> started following you on Get Me A Chai! 🎉<br><br>Keep creating great content to grow your community.`,
        ctaText: 'View Dashboard',
        ctaUrl: buildDashboardUrl(),
    }).catch(() => { });

    return result;
}

/**
 * Send a system notification to a user
 */
export async function notifySystem({ userId, title, message, link }) {
    return createNotification({
        userId,
        type: 'system',
        title: title || 'System Notification',
        message,
        link,
    });
}

// ============================================================
//  Supporter-side notification helpers
// ============================================================

/**
 * Notify the supporter that their payment was successful (confirmation receipt)
 */
export async function notifyPaymentConfirmation({ supporterId, campaignTitle, campaignSlug, campaignId, paymentId, amount }) {
    if (!supporterId) return null;

    const result = await createNotification({
        userId: supporterId,
        type: 'payment',
        title: 'Payment Successful! 🎉',
        message: `Your payment of ₹${amount} to "${campaignTitle}" was successful. Thank you for your support!`,
        link: buildCampaignUrl(campaignId) || buildMyContributionsUrl(),
        campaignId,
        paymentId,
        metadata: { amount, isConfirmation: true },
    });

    // Send payment confirmation email to supporter (fire-and-forget)
    _sendPaymentConfirmationEmail({
        supporterId, campaignTitle, campaignSlug, campaignId, paymentId, amount,
    }).catch(() => { });

    return result;
}

/**
 * Internal: Send payment confirmation email to supporter
 */
async function _sendPaymentConfirmationEmail({ supporterId, campaignTitle, campaignId, paymentId, amount }) {
    try {
        await connectDb();
        const supporter = await User.findById(supporterId).select('email name notificationPreferences').lean();
        if (!supporter?.email || !isValidEmail(supporter.email)) return;
        if (!shouldSendRealtimeEmail(supporter, 'payment')) return;

        // Get creator name
        const Campaign = (await import('@/models/Campaign')).default;
        let creatorName = 'The Creator';
        if (campaignId) {
            const campaign = await Campaign.findById(campaignId).populate('creator', 'name').lean();
            if (campaign) {
                creatorName = campaign.creator?.name || 'The Creator';
            }
        }

        const emailData = PaymentConfirmationEmail({
            supporterName: supporter.name || 'Supporter',
            campaignTitle: campaignTitle || 'a campaign',
            campaignId: campaignId || '',
            creatorName,
            amount: Number(amount) || 0,
            paymentId: paymentId?.toString() || '',
            date: new Date().toLocaleDateString('en-IN', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit',
            }),
            userId: supporterId?.toString(),
        });

        await safeEmailSend({
            to: supporter.email,
            subject: emailData.subject,
            html: emailData.html,
            text: emailData.text,
        });
    } catch (error) {
        console.error('[Notifications] Payment confirmation email failed (non-fatal):', error.message);
    }
}

/**
 * Notify all supporters when a campaign reaches its funding goal
 */
export async function notifyCampaignGoalReached({ supporterIds, campaignTitle, campaignSlug, campaignId, goalAmount }) {
    if (!supporterIds || supporterIds.length === 0) return { success: true, count: 0 };
    const notifications = supporterIds.map(supporterId => ({
        userId: supporterId,
        type: 'milestone',
        title: 'Campaign Goal Reached! 🎯',
        message: `"${campaignTitle}" has reached its funding goal of ₹${goalAmount}! Thank you for being a supporter.`,
        link: buildCampaignUrl(campaignId) || buildMyContributionsUrl(),
        campaignId,
        metadata: { goalAmount, goalReached: true },
    }));

    const result = await createBulkNotifications(notifications);

    // Email supporters about goal reached (fire-and-forget)
    _sendBulkGenericEmail({
        userIds: supporterIds,
        type: 'milestone',
        subject: `🎯 "${campaignTitle}" Reached Its Goal!`,
        heading: 'Campaign Goal Reached! 🎯',
        body: `Great news! <strong>"${campaignTitle}"</strong> has reached its funding goal of <strong>₹${goalAmount?.toLocaleString('en-IN')}</strong>!<br><br>Thank you for being an amazing supporter and helping make this possible! 🙏`,
        ctaText: 'View Campaign',
        ctaUrl: buildCampaignUrl(campaignId) || buildMyContributionsUrl(),
    }).catch(() => { });

    return result;
}

/**
 * Notify the creator that their campaign is expiring soon
 */
export async function notifyCampaignExpiring({ creatorId, campaignTitle, campaignId, daysRemaining }) {
    const result = await createNotification({
        userId: creatorId,
        type: 'campaign',
        title: `Campaign Ending Soon ⏰`,
        message: `Your campaign "${campaignTitle}" will end in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}. Share it to reach your goal!`,
        link: buildDashboardUrl(),
        campaignId,
        metadata: { daysRemaining },
    });

    // Email notification for campaign expiring (fire-and-forget)
    _sendGenericNotificationEmail({
        userId: creatorId,
        type: 'campaign',
        subject: `⏰ "${campaignTitle}" Ending in ${daysRemaining} Day${daysRemaining === 1 ? '' : 's'}!`,
        heading: 'Campaign Ending Soon! ⏰',
        body: `Your campaign <strong>"${campaignTitle}"</strong> will end in <strong>${daysRemaining} day${daysRemaining === 1 ? '' : 's'}</strong>.<br><br>Share it with your network to reach your goal before time runs out! 🚀`,
        ctaText: 'View Dashboard',
        ctaUrl: buildDashboardUrl(),
    }).catch(() => { });

    return result;
}

/**
 * Notify all supporters when a campaign is completed
 */
export async function notifyCampaignCompleted({ supporterIds, campaignTitle, campaignSlug, campaignId, currentAmount, goalAmount }) {
    if (!supporterIds || supporterIds.length === 0) return { success: true, count: 0 };
    const percentage = goalAmount > 0 ? Math.floor((currentAmount / goalAmount) * 100) : 0;
    const notifications = supporterIds.map(supporterId => ({
        userId: supporterId,
        type: 'campaign',
        title: 'Campaign Completed',
        message: `"${campaignTitle}" has been completed at ${percentage}% of its goal. Thank you for your support!`,
        link: buildCampaignUrl(campaignId) || buildMyContributionsUrl(),
        campaignId,
        metadata: { currentAmount, goalAmount, percentage },
    }));

    const result = await createBulkNotifications(notifications);

    // Email supporters about campaign completion (fire-and-forget)
    _sendBulkGenericEmail({
        userIds: supporterIds,
        type: 'campaign',
        subject: `✅ "${campaignTitle}" Has Been Completed!`,
        heading: 'Campaign Completed! ✅',
        body: `<strong>"${campaignTitle}"</strong> has been completed at <strong>${percentage}%</strong> of its goal (<strong>₹${currentAmount?.toLocaleString('en-IN')}</strong> of ₹${goalAmount?.toLocaleString('en-IN')}).<br><br>Thank you for being a part of this journey! Your support made a real difference. 💪`,
        ctaText: 'View Campaign',
        ctaUrl: buildCampaignUrl(campaignId) || buildMyContributionsUrl(),
    }).catch(() => { });

    return result;
}

/**
 * Notify supporters about new content published on a campaign
 */
export async function notifyContentPublished({ supporterIds, creatorName, campaignTitle, campaignSlug, campaignId, contentTitle, visibility }) {
    if (!supporterIds || supporterIds.length === 0) return { success: true, count: 0 };
    const visibilityLabel = visibility === 'supporters-only' ? ' (Supporters Only)' : '';
    const notifications = supporterIds.map(supporterId => ({
        userId: supporterId,
        type: 'update',
        title: `New Post${visibilityLabel}`,
        message: `${creatorName} published "${contentTitle}" on "${campaignTitle}"`,
        link: buildCampaignUrl(campaignId) || buildMyContributionsUrl(),
        campaignId,
        metadata: { creatorName, contentTitle, visibility },
    }));

    const result = await createBulkNotifications(notifications);

    // Send emails for content publish (reuses update email infrastructure)
    _sendUpdateEmails({
        supporterIds,
        creatorName,
        campaignTitle,
        campaignSlug,
        campaignId,
        updateTitle: contentTitle,
    }).catch(() => { });

    return result;
}

// ============================================================
//  Welcome email (no in-app notification, just email)
// ============================================================

/**
 * Send welcome email to a newly registered user
 * @param {Object} options
 * @param {string} options.userId - User's MongoDB _id
 * @param {string} options.name - User's name
 * @param {string} options.email - User's email
 */
export async function sendWelcomeEmailNotification({ userId, name, email }) {
    try {
        if (!email || !isValidEmail(email)) return;

        const emailData = WelcomeEmail({
            name: name || 'there',
            email,
            userId: userId?.toString() || '',
        });

        await safeEmailSend({
            to: email,
            subject: emailData.subject,
            html: emailData.html,
            text: emailData.text,
        });

        console.log(`[Notifications] Welcome email sent to ${email}`);
    } catch (error) {
        console.error('[Notifications] Welcome email failed (non-fatal):', error.message);
    }
}

// ============================================================
//  Generic email helper for events without custom templates
// ============================================================

import { EmailLayout } from '@/lib/email/templates/EmailLayout';

/**
 * Send a generic notification email using the base layout
 * Used for comment, reply, campaign status, subscription events
 */
async function _sendGenericNotificationEmail({ userId, type, subject, heading, body, ctaText, ctaUrl }) {
    try {
        await connectDb();
        const user = await User.findById(userId).select('email name notificationPreferences').lean();
        if (!user?.email || !isValidEmail(user.email)) return;
        if (!shouldSendRealtimeEmail(user, type)) return;

        const baseUrl = getBaseUrl();
        const fullCtaUrl = ctaUrl?.startsWith('http') ? ctaUrl : `${baseUrl}${ctaUrl}`;

        const content = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #111827; font-size: 28px; font-weight: bold; margin: 0;">
            ${heading}
          </h1>
        </div>
        
        <p style="margin: 16px 0; font-size: 16px; line-height: 1.6;">
          Hi <strong>${user.name || 'there'}</strong>,
        </p>
        
        <p style="margin: 16px 0; font-size: 16px; line-height: 1.6;">
          ${body}
        </p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${fullCtaUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
            ${ctaText || 'View Details'}
          </a>
        </div>
        
        <p style="margin: 16px 0; font-size: 16px; line-height: 1.6; color: #6b7280;">
          Best regards,<br>
          <strong style="color: #374151;">The Get Me A Chai Team</strong>
        </p>
        `;

        const html = EmailLayout({
            content,
            preheader: subject,
            userId: userId?.toString(),
            type,
        });

        await safeEmailSend({
            to: user.email,
            subject,
            html,
            text: `${heading}: ${body.replace(/<[^>]+>/g, '')}`,
        });
    } catch (error) {
        console.error('[Notifications] Generic email failed (non-fatal):', error.message);
    }
}

/**
 * Send a generic notification email to multiple users
 * Used for bulk events like campaign goal reached, campaign completed, etc.
 */
async function _sendBulkGenericEmail({ userIds, type, subject, heading, body, ctaText, ctaUrl }) {
    try {
        if (!userIds || userIds.length === 0) return;

        await connectDb();
        const users = await User.find({ _id: { $in: userIds } })
            .select('email name notificationPreferences')
            .lean();

        const baseUrl = getBaseUrl();

        let sentCount = 0;
        for (const user of users) {
            if (!user.email || !isValidEmail(user.email)) continue;
            if (!shouldSendRealtimeEmail(user, type)) continue;

            const fullCtaUrl = ctaUrl?.startsWith('http') ? ctaUrl : `${baseUrl}${ctaUrl}`;

            const content = `
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #111827; font-size: 28px; font-weight: bold; margin: 0;">
                ${heading}
              </h1>
            </div>
            
            <p style="margin: 16px 0; font-size: 16px; line-height: 1.6;">
              Hi <strong>${user.name || 'there'}</strong>,
            </p>
            
            <p style="margin: 16px 0; font-size: 16px; line-height: 1.6;">
              ${body}
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${fullCtaUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                ${ctaText || 'View Details'}
              </a>
            </div>
            
            <p style="margin: 16px 0; font-size: 16px; line-height: 1.6; color: #6b7280;">
              Best regards,<br>
              <strong style="color: #374151;">The Get Me A Chai Team</strong>
            </p>
            `;

            const html = EmailLayout({
                content,
                preheader: subject,
                userId: user._id?.toString(),
                type,
            });

            await safeEmailSend({
                to: user.email,
                subject,
                html,
                text: `${heading}: ${body.replace(/<[^>]+>/g, '')}`,
            });

            sentCount++;

            // Rate limit: small delay between emails to avoid SMTP throttling
            if (sentCount < users.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        if (sentCount > 0) {
            console.log(`[Notifications] Bulk generic email sent to ${sentCount} user(s): ${subject?.substring(0, 50)}`);
        }
    } catch (error) {
        console.error('[Notifications] Bulk generic email failed (non-fatal):', error.message);
    }
}

// ============================================================
//  Shared utility: look up supporter user IDs for a campaign
// ============================================================

import Payment from '@/models/Payment';

/**
 * Returns an array of unique user-ID strings for people who have
 * successfully paid for a given campaign.
 */
export async function getSupporterIdsForCampaign(campaignId, excludeUserId) {
    try {
        if (!campaignId) return [];
        await connectDb();

        const payments = await Payment.find({
            campaign: campaignId,
            done: true,
            status: 'success',
        }).select('userId').lean();

        const ids = [...new Set(
            payments
                .map(p => p.userId?.toString())
                .filter(id => id && id !== excludeUserId?.toString())
        )];

        return ids;
    } catch (error) {
        console.error('[Notifications] getSupporterIdsForCampaign failed:', error.message);
        return [];
    }
}
