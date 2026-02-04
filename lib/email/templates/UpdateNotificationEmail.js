// lib/email/templates/UpdateNotificationEmail.js
/**
 * Update Notification Email Template
 * Sent to supporters when creator posts a campaign update
 */

import { EmailLayout } from './EmailLayout';

/**
 * Generate update notification email
 * @param {Object} data - Email data
 * @param {string} data.supporterName - Supporter's name
 * @param {string} data.creatorName - Creator's name
 * @param {string} data.campaignTitle - Campaign title
 * @param {string} data.campaignSlug - Campaign slug
 * @param {string} data.updateTitle - Update title
 * @param {string} data.updateSnippet - Update content snippet (first 200 chars)
 * @param {string} data.updateId - Update ID
 * @param {string} data.userId - User ID for unsubscribe
 * @returns {Object} Email subject and HTML
 */
export function UpdateNotificationEmail({
    supporterName,
    creatorName,
    campaignTitle,
    campaignSlug,
    updateTitle,
    updateSnippet,
    updateId,
    userId
}) {
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const updateUrl = `${baseUrl}/${campaignSlug}#update-${updateId}`;
    const campaignUrl = `${baseUrl}/${campaignSlug}`;

    const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="font-size: 64px; margin-bottom: 16px;">📝</div>
      <h1 style="color: #111827; font-size: 28px; font-weight: bold; margin: 0;">
        New Campaign Update
      </h1>
    </div>
    
    <p style="margin: 16px 0; font-size: 16px; line-height: 1.6;">
      Hi <strong>${supporterName}</strong>,
    </p>
    
    <p style="margin: 16px 0; font-size: 16px; line-height: 1.6;">
      <strong>${creatorName}</strong> just posted a new update for 
      <strong>"${campaignTitle}"</strong> - a campaign you supported!
    </p>
    
    <!-- Update Card -->
    <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border-radius: 12px; padding: 24px; margin: 24px 0; border-left: 4px solid #667eea;">
      <h2 style="color: #111827; font-size: 22px; font-weight: 600; margin: 0 0 12px;">
        ${updateTitle}
      </h2>
      
      <p style="margin: 12px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
        ${updateSnippet}${updateSnippet.length >= 200 ? '...' : ''}
      </p>
      
      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #d1d5db;">
        <span style="color: #6b7280; font-size: 14px;">
          Posted by <strong style="color: #374151;">${creatorName}</strong>
        </span>
      </div>
    </div>
    
    <!-- CTA Button -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="${updateUrl}" class="button" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Read Full Update
      </a>
    </div>
    
    <!-- Engagement Section -->
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
        <strong>💬 Join the conversation!</strong> Leave a comment and let ${creatorName} 
        know what you think about this update.
      </p>
    </div>
    
    <!-- Campaign Info -->
    <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <h3 style="color: #374151; font-size: 16px; font-weight: 600; margin: 0 0 12px;">
        About This Campaign
      </h3>
      <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
        <strong style="color: #111827;">${campaignTitle}</strong><br>
        by ${creatorName}
      </p>
      <div style="margin-top: 12px;">
        <a href="${campaignUrl}" style="color: #667eea; text-decoration: none; font-size: 14px;">
          View campaign →
        </a>
      </div>
    </div>
    
    <p style="margin: 24px 0 16px; font-size: 16px; line-height: 1.6;">
      Thank you for supporting this campaign! Your contribution is making a real difference. 🙏
    </p>
    
    <p style="margin: 16px 0; font-size: 16px; line-height: 1.6; color: #6b7280;">
      Best regards,<br>
      <strong style="color: #374151;">The Get Me A Chai Team</strong>
    </p>
    
    <div style="border-top: 1px solid #e5e7eb; margin-top: 32px; padding-top: 16px;">
      <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.6;">
        You're receiving this because you supported "${campaignTitle}". 
        You can manage your notification preferences in your 
        <a href="${baseUrl}/settings" style="color: #667eea; text-decoration: none;">account settings</a>.
      </p>
    </div>
  `;

    const html = EmailLayout({
        content,
        preheader: `${creatorName} posted: ${updateTitle}`,
        userId,
        type: 'update',
    });

    return {
        subject: `📝 New Update: "${updateTitle}" - ${campaignTitle}`,
        html,
        text: `${creatorName} posted a new update for "${campaignTitle}": ${updateTitle}. ${updateSnippet} Read more: ${updateUrl}`,
    };
}

export default UpdateNotificationEmail;
