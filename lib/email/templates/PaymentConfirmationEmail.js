// lib/email/templates/PaymentConfirmationEmail.js
/**
 * Payment Confirmation Email Template
 * Sent to supporters after successful payment
 */

import { EmailLayout } from './EmailLayout';

/**
 * Generate payment confirmation email
 * @param {Object} data - Email data
 * @param {string} data.supporterName - Supporter's name
 * @param {string} data.campaignTitle - Campaign title
 * @param {string} data.campaignSlug - Campaign slug
 * @param {string} data.creatorName - Creator's name
 * @param {number} data.amount - Payment amount
 * @param {string} data.paymentId - Payment ID
 * @param {string} data.date - Payment date
 * @param {string} data.message - Supporter's message (optional)
 * @param {boolean} data.isAnonymous - Is payment anonymous
 * @param {string} data.userId - User ID for unsubscribe
 * @returns {Object} Email subject and HTML
 */
export function PaymentConfirmationEmail({
    supporterName,
    campaignTitle,
    campaignSlug,
    creatorName,
    amount,
    paymentId,
    date,
    message = '',
    isAnonymous = false,
    userId
}) {
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const campaignUrl = `${baseUrl}/${campaignSlug}`;
    const formattedAmount = `₹${amount.toLocaleString('en-IN')}`;
    const formattedDate = new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="font-size: 64px; margin-bottom: 16px;">🎉</div>
      <h1 style="color: #111827; font-size: 28px; font-weight: bold; margin: 0;">
        Thank You for Your Support!
      </h1>
    </div>
    
    <p style="margin: 16px 0; font-size: 16px; line-height: 1.6;">
      Hi <strong>${supporterName}</strong>,
    </p>
    
    <p style="margin: 16px 0; font-size: 16px; line-height: 1.6;">
      Your payment of <strong style="color: #059669;">${formattedAmount}</strong> to 
      <strong>"${campaignTitle}"</strong> was successful! 
      ${creatorName} will be thrilled to see your support.
    </p>
    
    <!-- Receipt Card -->
    <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #86efac; border-radius: 12px; padding: 24px; margin: 24px 0;">
      <h2 style="color: #166534; font-size: 20px; font-weight: 600; margin: 0 0 16px;">
        📄 Payment Receipt
      </h2>
      
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Campaign:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">
            ${campaignTitle}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Creator:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">
            ${creatorName}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Amount:</td>
          <td style="padding: 8px 0; color: #059669; font-weight: 700; font-size: 18px; text-align: right;">
            ${formattedAmount}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Payment ID:</td>
          <td style="padding: 8px 0; color: #111827; font-family: monospace; font-size: 12px; text-align: right;">
            ${paymentId}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Date & Time:</td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">
            ${formattedDate}
          </td>
        </tr>
        ${isAnonymous ? `
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Visibility:</td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">
            Anonymous 🕶️
          </td>
        </tr>
        ` : ''}
      </table>
    </div>
    
    ${message ? `
    <div style="background-color: #f3f4f6; border-left: 4px solid #667eea; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <p style="margin: 0 0 8px; color: #374151; font-weight: 600; font-size: 14px;">
        Your Message:
      </p>
      <p style="margin: 0; color: #6b7280; font-size: 14px; font-style: italic;">
        "${message}"
      </p>
    </div>
    ` : ''}
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${campaignUrl}" class="button" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin-right: 12px;">
        View Campaign
      </a>
      <a href="${baseUrl}/my-contributions" style="display: inline-block; padding: 14px 32px; background-color: #f3f4f6; color: #374151 !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        My Contributions
      </a>
    </div>
    
    <!-- Impact Message -->
    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
      <p style="margin: 0; color: #92400e; font-size: 16px; font-weight: 600;">
        💝 Your support makes dreams come true!
      </p>
      <p style="margin: 8px 0 0; color: #78350f; font-size: 14px;">
        Every contribution, big or small, helps creators bring their ideas to life.
      </p>
    </div>
    
    <!-- Tax Information -->
    <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <h3 style="color: #374151; font-size: 16px; font-weight: 600; margin: 0 0 12px;">
        📋 Tax Information
      </h3>
      <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
        This payment may be eligible for tax deduction under Section 80G if the campaign 
        is registered as a charitable organization. Please consult with your tax advisor 
        for specific guidance. Keep this receipt for your records.
      </p>
    </div>
    
    <h3 style="color: #111827; font-size: 18px; font-weight: 600; margin: 24px 0 12px;">
      What's Next?
    </h3>
    
    <ul style="margin: 0; padding-left: 20px; color: #4b5563; line-height: 1.8;">
      <li>You'll receive updates when the creator posts new content</li>
      <li>Track the campaign's progress on the campaign page</li>
      <li>Join the discussion and connect with other supporters</li>
      <li>Share the campaign to help reach the funding goal</li>
    </ul>
    
    <p style="margin: 24px 0 16px; font-size: 16px; line-height: 1.6;">
      Thank you for being part of our community and supporting creators! 🙏
    </p>
    
    <p style="margin: 16px 0; font-size: 16px; line-height: 1.6; color: #6b7280;">
      Best regards,<br>
      <strong style="color: #374151;">The Get Me A Chai Team</strong>
    </p>
    
    <div style="border-top: 1px solid #e5e7eb; margin-top: 32px; padding-top: 16px;">
      <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.6;">
        Questions about your payment? 
        <a href="${baseUrl}/help" style="color: #667eea; text-decoration: none;">Visit our Help Center</a> 
        or reply to this email.
      </p>
    </div>
  `;

    const html = EmailLayout({
        content,
        preheader: `Payment confirmation for ${campaignTitle} - ${formattedAmount}`,
        userId,
        type: 'payment',
    });

    return {
        subject: `✅ Payment Confirmed - ${formattedAmount} to "${campaignTitle}"`,
        html,
        text: `Thank you for your ${formattedAmount} payment to "${campaignTitle}"! Payment ID: ${paymentId}. View campaign: ${campaignUrl}`,
    };
}

export default PaymentConfirmationEmail;
