// app/api/notifications/preferences/test-email/route.js
/**
 * POST - Send a test notification email to the current user
 * Respects rate limiting (max 3 test emails per minute)
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDb from '@/db/connectDb';
import User from '@/models/User';
import { sendEmail } from '@/lib/email/nodemailer';
import { EmailLayout } from '@/lib/email/templates/EmailLayout';

// Simple in-memory rate limiter for test emails
const testEmailLimiter = new Map();

function checkRateLimit(email) {
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 3;

    const requests = testEmailLimiter.get(email) || [];
    const validRequests = requests.filter(t => now - t < windowMs);

    if (validRequests.length >= maxRequests) {
        return { allowed: false, retryAfter: Math.ceil((validRequests[0] + windowMs - now) / 1000) };
    }

    validRequests.push(now);
    testEmailLimiter.set(email, validRequests);

    // Cleanup periodically
    if (Math.random() < 0.1) {
        for (const [key, timestamps] of testEmailLimiter.entries()) {
            const valid = timestamps.filter(t => now - t < windowMs);
            if (valid.length === 0) testEmailLimiter.delete(key);
            else testEmailLimiter.set(key, valid);
        }
    }

    return { allowed: true, remaining: maxRequests - validRequests.length };
}

export async function POST() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check rate limit
        const rateLimit = checkRateLimit(session.user.email);
        if (!rateLimit.allowed) {
            return NextResponse.json(
                { success: false, error: `Rate limited. Please try again in ${rateLimit.retryAfter} seconds.` },
                { status: 429, headers: { 'Retry-After': rateLimit.retryAfter.toString() } }
            );
        }

        // Check SMTP configuration
        const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
        const missingVars = requiredVars.filter(v => !process.env[v]);
        if (missingVars.length > 0) {
            return NextResponse.json(
                { success: false, error: 'Email service is not configured. Missing SMTP settings.' },
                { status: 503 }
            );
        }

        // Get user name for personalization
        await connectDb();
        const user = await User.findOne({ email: session.user.email })
            .select('name email')
            .lean();

        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        const userName = user.name || 'there';
        const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

        // Build test email HTML
        const content = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #111827; font-size: 28px; font-weight: bold; margin: 0;">
            🎉 Test Email Successful!
          </h1>
        </div>
        
        <p style="margin: 16px 0; font-size: 16px; line-height: 1.6;">
          Hi <strong>${userName}</strong>,
        </p>
        
        <p style="margin: 16px 0; font-size: 16px; line-height: 1.6;">
          This is a test email from <strong>Get Me A Chai</strong> to confirm that your email notifications are working correctly.
        </p>

        <div style="margin: 24px 0; padding: 16px; background: #f3f4f6; border-radius: 12px; border-left: 4px solid #8b5cf6;">
          <p style="margin: 0; font-size: 14px; color: #374151;">
            <strong>✅ Your email configuration is working!</strong><br>
            You will receive email notifications based on your preferences.
          </p>
        </div>

        <p style="margin: 16px 0; font-size: 14px; color: #6b7280;">
          <strong>Sent at:</strong> ${new Date().toLocaleString('en-IN', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
        })}
        </p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${baseUrl}/dashboard/settings" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Back to Settings
          </a>
        </div>
        
        <p style="margin: 16px 0; font-size: 16px; line-height: 1.6; color: #6b7280;">
          Best regards,<br>
          <strong style="color: #374151;">The Get Me A Chai Team</strong>
        </p>
        `;

        const html = EmailLayout({
            content,
            preheader: 'Test email from Get Me A Chai - Your notifications are working!',
            userId: user._id?.toString(),
            type: 'system',
        });

        const result = await sendEmail({
            to: session.user.email,
            subject: '🧪 Test Email - Get Me A Chai Notifications',
            html,
            text: `Hi ${userName}, this is a test email from Get Me A Chai. Your email notifications are working correctly!`,
        });

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: `Test email sent to ${session.user.email}. Check your inbox (and spam folder).`,
            });
        } else {
            console.error('[Test Email] Send failed:', result.error);
            return NextResponse.json(
                {
                    success: false,
                    error: result.error || 'Failed to send test email. Please check SMTP configuration.',
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Test email error:', error);
        return NextResponse.json(
            { success: false, error: 'An unexpected error occurred.' },
            { status: 500 }
        );
    }
}
