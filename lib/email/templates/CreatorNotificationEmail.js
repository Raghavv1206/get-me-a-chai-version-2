// lib/email/templates/CreatorNotificationEmail.js
/**
 * Creator Notification Email Template
 * Sent to creators when they receive a payment
 */

import { EmailLayout } from './EmailLayout';

/**
 * Generate creator notification email
 * @param {Object} data - Email data
 * @param {string} data.creatorName - Creator's name
 * @param {string} data.supporterName - Supporter's name
 * @param {number} data.amount - Payment amount
 * @param {string} data.campaignTitle - Campaign title
 * @param {string} data.campaignSlug - Campaign slug
 * @param {string} data.message - Supporter's message (optional)
 * @param {boolean} data.isAnonymous - Is payment anonymous
 * @param {number} data.totalRaised - Total amount raised so far
 * @param {number} data.goal - Campaign goal
 * @param {number} data.supportersCount - Total supporters count
 * @param {string} data.userId - User ID for unsubscribe
 * @returns {Object} Email subject and HTML
 */
export function CreatorNotificationEmail({
    creatorName,
    supporterName,
    amount,
    campaignTitle,
    campaignSlug,
    message = '',
    isAnonymous = false,
    totalRaised,
    goal,
    supportersCount,
    userId
}) {
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const campaignUrl = `${baseUrl}/${campaignSlug}`;
    const dashboardUrl = `${baseUrl}/dashboard`;
    const supportersUrl = `${baseUrl}/dashboard/supporters`;

    const formattedAmount = `₹${amount.toLocaleString('en-IN')}`;
    const formattedTotal = `₹${totalRaised.toLocaleString('en-IN')}`;
    const formattedGoal = `₹${goal.toLocaleString('en-IN')}`;
    const progressPercent = Math.min(Math.round((totalRaised / goal) * 100), 100);

    const displayName = isAnonymous ? 'An anonymous supporter' : supporterName;

    const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="font-size: 64px; margin-bottom: 16px;">💰</div>
      <h1 style="color: #111827; font-size: 28px; font-weight: bold; margin: 0;">
        You Received a New Payment!
      </h1>
    </div>
    
    <p style="margin: 16px 0; font-size: 16px; line-height: 1.6;">
      Hi <strong>${creatorName}</strong>,
    </p>
    
    <p style="margin: 16px 0; font-size: 18px; line-height: 1.6;">
      Great news! <strong>${displayName}</strong> just supported your campaign 
      <strong>"${campaignTitle}"</strong> with <strong style="color: #059669;">${formattedAmount}</strong>! 🎉
    </p>
    
    <!-- Payment Details Card -->
    <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 2px solid #6ee7b7; border-radius: 12px; padding: 24px; margin: 24px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding: 8px 0; color: #065f46; font-size: 14px;">Supporter:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">
            ${displayName}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #065f46; font-size: 14px;">Amount:</td>
          <td style="padding: 8px 0; color: #059669; font-weight: 700; font-size: 20px; text-align: right;">
            ${formattedAmount}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #065f46; font-size: 14px;">Campaign:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">
            ${campaignTitle}
          </td>
        </tr>
      </table>
    </div>
    
    ${message ? `
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <p style="margin: 0 0 8px; color: #92400e; font-weight: 600; font-size: 14px;">
        💬 Message from ${displayName}:
      </p>
      <p style="margin: 0; color: #78350f; font-size: 15px; font-style: italic; line-height: 1.6;">
        "${message}"
      </p>
    </div>
    ` : ''}
    
    <!-- Campaign Progress -->
    <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; margin: 24px 0;">
      <h3 style="color: #111827; font-size: 18px; font-weight: 600; margin: 0 0 16px;">
        📊 Campaign Progress
      </h3>
      
      <div style="margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #6b7280; font-size: 14px;">
            ${formattedTotal} raised of ${formattedGoal} goal
          </span>
          <span style="color: #059669; font-weight: 600; font-size: 14px;">
            ${progressPercent}%
          </span>
        </div>
        
        <!-- Progress Bar -->
        <div style="background-color: #e5e7eb; border-radius: 9999px; height: 12px; overflow: hidden;">
          <div style="background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); height: 100%; width: ${progressPercent}%; transition: width 0.3s;"></div>
        </div>
      </div>
      
      <div style="display: flex; justify-content: space-between; margin-top: 16px;">
        <div style="text-align: center; flex: 1;">
          <div style="font-size: 24px; font-weight: 700; color: #111827;">
            ${supportersCount}
          </div>
          <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
            Supporters
          </div>
        </div>
        <div style="text-align: center; flex: 1;">
          <div style="font-size: 24px; font-weight: 700; color: #059669;">
            ${formattedTotal}
          </div>
          <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
            Total Raised
          </div>
        </div>
        <div style="text-align: center; flex: 1;">
          <div style="font-size: 24px; font-weight: 700; color: #667eea;">
            ${progressPercent}%
          </div>
          <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
            Complete
          </div>
        </div>
      </div>
    </div>
    
    <!-- Action Buttons -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="${supportersUrl}" class="button" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 8px;">
        Thank Your Supporter
      </a>
      <a href="${campaignUrl}" style="display: inline-block; padding: 14px 32px; background-color: #f3f4f6; color: #374151 !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 8px;">
        View Campaign
      </a>
    </div>
    
    <!-- Tips Section -->
    <div style="background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%); border-radius: 12px; padding: 20px; margin: 24px 0;">
      <h3 style="color: #5b21b6; font-size: 16px; font-weight: 600; margin: 0 0 12px;">
        💡 Keep the Momentum Going
      </h3>
      <ul style="margin: 0; padding-left: 20px; color: #6b21a8; line-height: 1.8; font-size: 14px;">
        <li>Send a personal thank you message to your supporter</li>
        <li>Post an update to keep supporters engaged</li>
        <li>Share your progress on social media</li>
        <li>Respond to comments and questions promptly</li>
      </ul>
    </div>
    
    ${progressPercent >= 25 && progressPercent < 50 ? `
    <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <p style="margin: 0; color: #1e40af; font-size: 14px;">
        <strong>🎯 You're 25% there!</strong> Keep sharing your campaign to reach your goal faster.
      </p>
    </div>
    ` : ''}
    
    ${progressPercent >= 50 && progressPercent < 75 ? `
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <p style="margin: 0; color: #92400e; font-size: 14px;">
        <strong>🔥 Halfway there!</strong> You're doing amazing! Keep the momentum going.
      </p>
    </div>
    ` : ''}
    
    ${progressPercent >= 75 && progressPercent < 100 ? `
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <p style="margin: 0; color: #92400e; font-size: 14px;">
        <strong>🚀 Almost there!</strong> You're 75% funded! One final push to reach your goal!
      </p>
    </div>
    ` : ''}
    
    ${progressPercent >= 100 ? `
    <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <p style="margin: 0; color: #065f46; font-size: 14px;">
        <strong>🎉 Congratulations!</strong> You've reached your funding goal! Time to celebrate and deliver on your promises.
      </p>
    </div>
    ` : ''}
    
    <p style="margin: 24px 0 16px; font-size: 16px; line-height: 1.6;">
      Keep up the great work, ${creatorName}! Your supporters believe in your vision. 💪
    </p>
    
    <p style="margin: 16px 0; font-size: 16px; line-height: 1.6; color: #6b7280;">
      Best regards,<br>
      <strong style="color: #374151;">The Get Me A Chai Team</strong>
    </p>
    
    <div style="border-top: 1px solid #e5e7eb; margin-top: 32px; padding-top: 16px;">
      <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.6;">
        View detailed analytics and manage your campaigns in your 
        <a href="${dashboardUrl}" style="color: #667eea; text-decoration: none;">dashboard</a>.
      </p>
    </div>
  `;

    const html = EmailLayout({
        content,
        preheader: `${displayName} just supported "${campaignTitle}" with ${formattedAmount}!`,
        userId,
        type: 'creator_notification',
    });

    return {
        subject: `💰 New Payment: ${formattedAmount} from ${displayName}`,
        html,
        text: `${displayName} just supported "${campaignTitle}" with ${formattedAmount}! Total raised: ${formattedTotal} (${progressPercent}% of goal). View campaign: ${campaignUrl}`,
    };
}

export default CreatorNotificationEmail;
