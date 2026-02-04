// lib/email/templates/WeeklySummaryEmail.js
/**
 * Weekly Summary Email Template
 * Sent every Monday with campaign performance summary
 */

import { EmailLayout } from './EmailLayout';

/**
 * Generate weekly summary email
 * @param {Object} data - Email data
 * @param {string} data.creatorName - Creator's name
 * @param {number} data.weeklyEarnings - Earnings this week
 * @param {number} data.newSupporters - New supporters this week
 * @param {number} data.totalViews - Total views this week
 * @param {number} data.conversionRate - Conversion rate percentage
 * @param {Array} data.topCampaigns - Top performing campaigns [{title, raised, supporters}]
 * @param {Array} data.recentPayments - Recent payments [{name, amount, campaign, date}]
 * @param {Array} data.tips - AI-generated tips
 * @param {string} data.userId - User ID for unsubscribe
 * @returns {Object} Email subject and HTML
 */
export function WeeklySummaryEmail({
    creatorName,
    weeklyEarnings,
    newSupporters,
    totalViews,
    conversionRate,
    topCampaigns = [],
    recentPayments = [],
    tips = [],
    userId
}) {
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const dashboardUrl = `${baseUrl}/dashboard`;
    const analyticsUrl = `${baseUrl}/dashboard/analytics`;

    const formattedEarnings = `₹${weeklyEarnings.toLocaleString('en-IN')}`;
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weekEnd = new Date();

    const dateRange = `${weekStart.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}`;

    const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="font-size: 64px; margin-bottom: 16px;">📊</div>
      <h1 style="color: #111827; font-size: 28px; font-weight: bold; margin: 0;">
        Your Weekly Summary
      </h1>
      <p style="margin: 8px 0 0; color: #6b7280; font-size: 14px;">
        ${dateRange}
      </p>
    </div>
    
    <p style="margin: 16px 0; font-size: 16px; line-height: 1.6;">
      Hi <strong>${creatorName}</strong>,
    </p>
    
    <p style="margin: 16px 0; font-size: 16px; line-height: 1.6;">
      Here's how your campaigns performed this week! 📈
    </p>
    
    <!-- Stats Grid -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0;">
      <tr>
        <td style="width: 50%; padding: 12px;">
          <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 12px; padding: 20px; text-align: center;">
            <div style="font-size: 32px; font-weight: 800; color: #065f46; margin-bottom: 4px;">
              ${formattedEarnings}
            </div>
            <div style="font-size: 14px; color: #047857; font-weight: 600;">
              Weekly Earnings
            </div>
          </div>
        </td>
        <td style="width: 50%; padding: 12px;">
          <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 12px; padding: 20px; text-align: center;">
            <div style="font-size: 32px; font-weight: 800; color: #1e40af; margin-bottom: 4px;">
              ${newSupporters}
            </div>
            <div style="font-size: 14px; color: #1e3a8a; font-weight: 600;">
              New Supporters
            </div>
          </div>
        </td>
      </tr>
      <tr>
        <td style="width: 50%; padding: 12px;">
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 20px; text-align: center;">
            <div style="font-size: 32px; font-weight: 800; color: #92400e; margin-bottom: 4px;">
              ${totalViews.toLocaleString()}
            </div>
            <div style="font-size: 14px; color: #78350f; font-weight: 600;">
              Total Views
            </div>
          </div>
        </td>
        <td style="width: 50%; padding: 12px;">
          <div style="background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%); border-radius: 12px; padding: 20px; text-align: center;">
            <div style="font-size: 32px; font-weight: 800; color: #5b21b6; margin-bottom: 4px;">
              ${conversionRate.toFixed(1)}%
            </div>
            <div style="font-size: 14px; color: #6b21a8; font-weight: 600;">
              Conversion Rate
            </div>
          </div>
        </td>
      </tr>
    </table>
    
    ${topCampaigns.length > 0 ? `
    <!-- Top Campaigns -->
    <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; margin: 24px 0;">
      <h3 style="color: #111827; font-size: 18px; font-weight: 600; margin: 0 0 16px;">
        🏆 Top Performing Campaigns
      </h3>
      ${topCampaigns.slice(0, 3).map((campaign, index) => `
        <div style="padding: 12px 0; ${index < topCampaigns.length - 1 ? 'border-bottom: 1px solid #e5e7eb;' : ''}">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">
                ${index + 1}. ${campaign.title}
              </div>
              <div style="font-size: 13px; color: #6b7280;">
                ${campaign.supporters} supporters
              </div>
            </div>
            <div style="font-weight: 700; color: #059669; font-size: 16px;">
              ₹${campaign.raised.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      `).join('')}
    </div>
    ` : ''}
    
    ${recentPayments.length > 0 ? `
    <!-- Recent Payments -->
    <div style="background-color: #f0fdf4; border-radius: 12px; padding: 24px; margin: 24px 0;">
      <h3 style="color: #065f46; font-size: 18px; font-weight: 600; margin: 0 0 16px;">
        💰 Recent Payments
      </h3>
      ${recentPayments.slice(0, 5).map((payment, index) => `
        <div style="padding: 10px 0; ${index < recentPayments.length - 1 ? 'border-bottom: 1px solid #d1fae5;' : ''}">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 600; color: #111827; font-size: 14px;">
                ${payment.name}
              </div>
              <div style="font-size: 12px; color: #6b7280;">
                ${payment.campaign} • ${new Date(payment.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              </div>
            </div>
            <div style="font-weight: 600; color: #059669;">
              ₹${payment.amount.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      `).join('')}
    </div>
    ` : ''}
    
    ${tips.length > 0 ? `
    <!-- AI Tips -->
    <div style="background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%); border-radius: 12px; padding: 24px; margin: 24px 0;">
      <h3 style="color: #5b21b6; font-size: 18px; font-weight: 600; margin: 0 0 16px;">
        💡 AI-Powered Tips for You
      </h3>
      <ul style="margin: 0; padding-left: 20px; color: #6b21a8; line-height: 1.8;">
        ${tips.map(tip => `<li>${tip}</li>`).join('')}
      </ul>
    </div>
    ` : ''}
    
    <!-- Action Buttons -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="${analyticsUrl}" class="button" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 8px;">
        View Full Analytics
      </a>
      <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 32px; background-color: #f3f4f6; color: #374151 !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 8px;">
        Go to Dashboard
      </a>
    </div>
    
    <!-- Motivational Message -->
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px; text-align: center;">
      <p style="margin: 0; color: #92400e; font-size: 15px; line-height: 1.6;">
        ${weeklyEarnings > 0
            ? `<strong>Great work this week, ${creatorName}!</strong> Keep engaging with your supporters and sharing your progress.`
            : `<strong>Don't give up, ${creatorName}!</strong> Every successful campaign starts somewhere. Keep sharing and improving your campaigns.`
        }
      </p>
    </div>
    
    <p style="margin: 24px 0 16px; font-size: 16px; line-height: 1.6;">
      Keep creating amazing campaigns! We're here to support you every step of the way. 🚀
    </p>
    
    <p style="margin: 16px 0; font-size: 16px; line-height: 1.6; color: #6b7280;">
      Best regards,<br>
      <strong style="color: #374151;">The Get Me A Chai Team</strong>
    </p>
    
    <div style="border-top: 1px solid #e5e7eb; margin-top: 32px; padding-top: 16px;">
      <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.6;">
        This is your weekly summary email. You can adjust your email preferences in your 
        <a href="${baseUrl}/settings" style="color: #667eea; text-decoration: none;">account settings</a>.
      </p>
    </div>
  `;

    const html = EmailLayout({
        content,
        preheader: `Your weekly summary: ${formattedEarnings} earned, ${newSupporters} new supporters`,
        userId,
        type: 'weekly_summary',
    });

    return {
        subject: `📊 Your Weekly Summary: ${formattedEarnings} Earned`,
        html,
        text: `Weekly Summary (${dateRange}): Earned ${formattedEarnings}, ${newSupporters} new supporters, ${totalViews} views, ${conversionRate.toFixed(1)}% conversion rate. View full analytics: ${analyticsUrl}`,
    };
}

export default WeeklySummaryEmail;
