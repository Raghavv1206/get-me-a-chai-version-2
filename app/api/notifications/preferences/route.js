// app/api/notifications/preferences/route.js
/**
 * GET  - Fetch user's notification preferences (merges with defaults)
 * POST - Update user's notification preferences (validates and sanitizes)
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDb from '@/db/connectDb';
import User from '@/models/User';

const VALID_KEYS = ['payment', 'milestone', 'comment', 'update', 'system', 'campaign', 'subscription', 'follow', 'reply'];
const VALID_FREQUENCIES = ['realtime', 'daily', 'weekly'];

const DEFAULT_PREFERENCES = {
    email: Object.fromEntries(VALID_KEYS.map(k => [k, true])),
    inApp: Object.fromEntries(VALID_KEYS.map(k => [k, true])),
    frequency: 'realtime',
    newsletter: true,
};

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDb();
        const user = await User.findOne({ email: session.user.email })
            .select('notificationPreferences')
            .lean();

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Merge with defaults so the client always gets a complete/valid object
        const prefs = user.notificationPreferences || {};
        const merged = {
            email: { ...DEFAULT_PREFERENCES.email, ...(prefs.email || {}) },
            inApp: { ...DEFAULT_PREFERENCES.inApp, ...(prefs.inApp || {}) },
            frequency: VALID_FREQUENCIES.includes(prefs.frequency) ? prefs.frequency : DEFAULT_PREFERENCES.frequency,
            newsletter: prefs.newsletter !== undefined ? prefs.newsletter : DEFAULT_PREFERENCES.newsletter,
        };

        // Strip any unknown keys from email/inApp objects
        for (const channel of ['email', 'inApp']) {
            for (const key of Object.keys(merged[channel])) {
                if (!VALID_KEYS.includes(key)) {
                    delete merged[channel][key];
                }
            }
        }

        return NextResponse.json({ success: true, preferences: merged });
    } catch (error) {
        console.error('Get preferences error:', error);
        return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDb();

        // Parse body safely
        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }

        if (!body || typeof body !== 'object') {
            return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
        }

        const { email, inApp, frequency, newsletter } = body;

        // Validate frequency
        const validFrequency = VALID_FREQUENCIES.includes(frequency) ? frequency : 'realtime';

        // Sanitize channel preferences: only allow known keys with boolean values
        const sanitizePrefs = (prefs) => {
            if (!prefs || typeof prefs !== 'object') return { ...DEFAULT_PREFERENCES.email };
            const result = {};
            for (const key of VALID_KEYS) {
                // Explicitly check for `false` — everything else defaults to true
                result[key] = prefs[key] !== false;
            }
            return result;
        };

        const sanitizedEmail = sanitizePrefs(email);
        const sanitizedInApp = sanitizePrefs(inApp);

        // System in-app notifications are always enabled
        sanitizedInApp.system = true;

        const updateData = {
            'notificationPreferences.email': sanitizedEmail,
            'notificationPreferences.inApp': sanitizedInApp,
            'notificationPreferences.frequency': validFrequency,
            'notificationPreferences.newsletter': newsletter !== false,
        };

        const result = await User.updateOne(
            { email: session.user.email },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        console.log(`[Preferences] Updated for ${session.user.email}: frequency=${validFrequency}, newsletter=${newsletter !== false}`);

        return NextResponse.json({ success: true, message: 'Preferences saved successfully' });
    } catch (error) {
        console.error('Save preferences error:', error);
        return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 });
    }
}
