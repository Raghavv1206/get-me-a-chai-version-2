// app/api/notifications/unsubscribe/route.js
/**
 * Handles email unsubscribe requests from the link in email footers.
 * 
 * GET  - Render an unsubscribe confirmation page (handled by the page component)
 * POST - Process the unsubscribe action
 * 
 * Supports unsubscribing from:
 * - 'all' - Disable all email notifications
 * - A specific type (payment, milestone, comment, update, campaign, subscription, follow, reply)
 */

import { NextResponse } from 'next/server';
import connectDb from '@/db/connectDb';
import User from '@/models/User';
import mongoose from 'mongoose';

const VALID_TYPES = ['payment', 'milestone', 'comment', 'update', 'system', 'campaign', 'subscription', 'follow', 'reply'];

export async function POST(req) {
    try {
        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }

        const { userId, type } = body;

        // Validate userId
        if (!userId || typeof userId !== 'string') {
            return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
        }

        // Validate type
        const normalizedType = (type || 'all').toLowerCase().trim();
        if (normalizedType !== 'all' && !VALID_TYPES.includes(normalizedType)) {
            return NextResponse.json(
                { error: `Invalid notification type. Must be 'all' or one of: ${VALID_TYPES.join(', ')}` },
                { status: 400 }
            );
        }

        await connectDb();

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (normalizedType === 'all') {
            // Disable ALL email notifications
            const allDisabled = {};
            for (const key of VALID_TYPES) {
                allDisabled[key] = false;
            }
            await User.updateOne(
                { _id: userId },
                { $set: { 'notificationPreferences.email': allDisabled } }
            );
        } else {
            // Disable a specific type
            await User.updateOne(
                { _id: userId },
                { $set: { [`notificationPreferences.email.${normalizedType}`]: false } }
            );
        }

        console.log(`[Unsubscribe] User ${userId} unsubscribed from: ${normalizedType}`);

        return NextResponse.json({
            success: true,
            message: normalizedType === 'all'
                ? 'You have been unsubscribed from all email notifications.'
                : `You have been unsubscribed from ${normalizedType} email notifications.`,
        });
    } catch (error) {
        console.error('Unsubscribe error:', error);
        return NextResponse.json(
            { error: 'Failed to process unsubscribe request' },
            { status: 500 }
        );
    }
}

export async function GET() {
    // Redirect to the unsubscribe page (with query params preserved via the page)
    return NextResponse.json({
        message: 'Use the unsubscribe page at /unsubscribe',
    });
}
