// lib/email/templates/WelcomeEmail.js
/**
 * Welcome Email Template
 * Sent to new users upon signup
 */

import { EmailLayout } from './EmailLayout';

/**
 * Generate welcome email
 * @param {Object} data - Email data
 * @param {string} data.name - User's name
 * @param {string} data.email - User's email
 * @param {string} data.userId - User ID for unsubscribe
 * @returns {Object} Email subject and HTML
 */
export function WelcomeEmail({ name, email, userId }) {
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

    const content = `
    <h1 style="color: #111827; font-size: 28px; font-weight: bold; margin: 0 0 16px;">
      Welcome to Get Me A Chai! ☕
    </h1>
    
    <p style="margin: 16px 0; font-size: 16px; line-height: 1.6;">
      Hi <strong>${name}</strong>,
    </p>
    
    <p style="margin: 16px 0; font-size: 16px; line-height: 1.6;">
      We're thrilled to have you join our community of creators and supporters! 
      Get Me A Chai is the platform where dreams get funded, one chai at a time.
    </p>
    
    <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border-radius: 8px; padding: 24px; margin: 24px 0;">
      <h2 style="color: #374151; font-size: 20px; font-weight: 600; margin: 0 0 16px;">
        🚀 Quick Start Guide
      </h2>
      
      <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
        <li style="margin: 8px 0;">
          <strong>Create Your First Campaign:</strong> Share your project and start raising funds
        </li>
        <li style="margin: 8px 0;">
          <strong>Explore Campaigns:</strong> Discover amazing projects to support
        </li>
        <li style="margin: 8px 0;">
          <strong>Set Up Your Profile:</strong> Add your bio, profile picture, and social links
        </li>
        <li style="margin: 8px 0;">
          <strong>Connect Payment:</strong> Add your Razorpay details to receive funds
        </li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${baseUrl}/dashboard/campaign/new" class="button" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Create Your First Campaign
      </a>
    </div>
    
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <p style="margin: 0; color: #92400e; font-size: 14px;">
        <strong>💡 Pro Tip:</strong> Campaigns with compelling stories and quality images raise 3x more funds!
      </p>
    </div>
    
    <h3 style="color: #111827; font-size: 18px; font-weight: 600; margin: 24px 0 12px;">
      What Makes Us Different?
    </h3>
    
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 16px 0;">
      <tr>
        <td style="padding: 12px; vertical-align: top;">
          <div style="font-size: 24px; margin-bottom: 8px;">🤖</div>
          <strong style="color: #374151;">AI-Powered</strong>
          <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">
            Our AI helps you craft compelling campaigns in minutes
          </p>
        </td>
        <td style="padding: 12px; vertical-align: top;">
          <div style="font-size: 24px; margin-bottom: 8px;">⚡</div>
          <strong style="color: #374151;">Instant Payouts</strong>
          <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">
            Receive funds directly to your account
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px; vertical-align: top;">
          <div style="font-size: 24px; margin-bottom: 8px;">📊</div>
          <strong style="color: #374151;">Real-Time Analytics</strong>
          <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">
            Track your campaign performance with detailed insights
          </p>
        </td>
        <td style="padding: 12px; vertical-align: top;">
          <div style="font-size: 24px; margin-bottom: 8px;">🛡️</div>
          <strong style="color: #374151;">Secure & Trusted</strong>
          <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">
            Bank-grade security for all transactions
          </p>
        </td>
      </tr>
    </table>
    
    <p style="margin: 24px 0 16px; font-size: 16px; line-height: 1.6;">
      Need help getting started? Our AI chatbot is available 24/7, or you can 
      <a href="${baseUrl}/help" style="color: #667eea; text-decoration: none;">visit our help center</a>.
    </p>
    
    <p style="margin: 16px 0; font-size: 16px; line-height: 1.6;">
      Happy creating! 🎉
    </p>
    
    <p style="margin: 16px 0; font-size: 16px; line-height: 1.6; color: #6b7280;">
      Best regards,<br>
      <strong style="color: #374151;">The Get Me A Chai Team</strong>
    </p>
  `;

    const html = EmailLayout({
        content,
        preheader: 'Welcome to Get Me A Chai! Start your crowdfunding journey today.',
        userId,
        type: 'welcome',
    });

    return {
        subject: '☕ Welcome to Get Me A Chai - Let\'s Get Started!',
        html,
        text: `Welcome to Get Me A Chai, ${name}! We're excited to have you join our community. Create your first campaign at ${baseUrl}/dashboard/campaign/new`,
    };
}

export default WelcomeEmail;
