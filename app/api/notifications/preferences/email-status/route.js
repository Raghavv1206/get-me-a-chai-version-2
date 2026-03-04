// app/api/notifications/preferences/email-status/route.js
/**
 * GET - Check if email service is configured and operational
 * Returns whether SMTP is properly configured (does NOT expose credentials)
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if all required SMTP env vars are present
        const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
        const missingVars = requiredVars.filter(v => !process.env[v]);

        const configured = missingVars.length === 0;

        return NextResponse.json({
            success: true,
            configured,
            // Don't expose actual values - only show whether it's configured
            details: configured
                ? { host: process.env.SMTP_HOST, port: process.env.SMTP_PORT }
                : { missing: missingVars },
        });
    } catch (error) {
        console.error('Email status check error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to check email status' },
            { status: 500 }
        );
    }
}
