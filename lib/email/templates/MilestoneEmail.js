// lib/email/templates/MilestoneEmail.js
/**
 * Milestone Email Template
 * Sent when campaign reaches a funding milestone
 */

import { EmailLayout } from './EmailLayout';

/**
 * Generate milestone email
 * @param {Object} data - Email data
 * @param {string} data.creatorName - Creator's name
 * @param {string} data.campaignTitle - Campaign title
 * @param {string} data.campaignSlug - Campaign slug
 * @param {number} data.percentage - Milestone percentage (25, 50, 75, 100)
 * @param {number} data.totalRaised - Total amount raised
 * @param {number} data.goal - Campaign goal
 * @param {number} data.supportersCount - Total supporters
 * @param {string} data.userId - User ID for unsubscribe
 * @returns {Object} Email subject and HTML
 */
export function MilestoneEmail({
    creatorName,
    campaignTitle,
    campaignSlug,
    percentage,
    totalRaised,
    goal,
    supportersCount,
    userId
}) {
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const campaignUrl = `${baseUrl}/${campaignSlug}`;
    const shareUrl = `${baseUrl}/share/${campaignSlug}`;

    const formattedTotal = `₹${totalRaised.toLocaleString('en-IN')}`;
    const formattedGoal = `₹${goal.toLocaleString('en-IN')}`;

    const milestones = {
        25: {
            emoji: '🎯',
            title: 'Quarter Way There!',
            message: 'You\'ve reached 25% of your goal! Keep the momentum going!',
            color: '#3b82f6',
            bg: '#dbeafe'
        },
        50: {
            emoji: '🔥',
            title: 'Halfway to Success!',
            message: 'Amazing! You\'re 50% funded! You\'re doing great!',
            color: '#f59e0b',
            bg: '#fef3c7'
        },
        75: {
            emoji: '🚀',
            title: 'Almost There!',
            message: 'Incredible! 75% funded! One final push to reach your goal!',
            color: '#8b5cf6',
            bg: '#ede9fe'
        },
        100: {
            emoji: '🎉',
            title: 'Goal Achieved!',
            message: 'Congratulations! You\'ve reached your funding goal!',
            color: '#10b981',
            bg: '#d1fae5'
        }
    };

    const milestone = milestones[percentage] || milestones[25];

    const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="font-size: 80px; margin-bottom: 16px;">${milestone.emoji}</div>
      <h1 style="color: #111827; font-size: 32px; font-weight: bold; margin: 0;">
        ${milestone.title}
      </h1>
    </div>
    
    <p style="margin: 16px 0; font-size: 16px; line-height: 1.6;">
      Hi <strong>${creatorName}</strong>,
    </p>
    
    <p style="margin: 16px 0; font-size: 18px; line-height: 1.6; text-align: center;">
      ${milestone.message}
    </p>
    
    <!-- Milestone Card -->
    <div style="background: ${milestone.bg}; border: 3px solid ${milestone.color}; border-radius: 16px; padding: 32px; margin: 32px 0; text-align: center;">
      <div style="font-size: 48px; font-weight: 800; color: ${milestone.color}; margin-bottom: 8px;">
        ${percentage}%
      </div>
      <div style="font-size: 20px; font-weight: 600; color: #111827; margin-bottom: 16px;">
        ${formattedTotal} raised
      </div>
      <div style="font-size: 14px; color: #6b7280;">
        of ${formattedGoal} goal
      </div>
      
      <!-- Progress Bar -->
      <div style="background-color: rgba(255,255,255,0.5); border-radius: 9999px; height: 16px; overflow: hidden; margin: 24px 0;">
        <div style="background: ${milestone.color}; height: 100%; width: ${percentage}%;"></div>
      </div>
      
      <div style="font-size: 16px; color: #374151; margin-top: 16px;">
        <strong>${supportersCount}</strong> amazing supporters
      </div>
    </div>
    
    ${percentage === 100 ? `
    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 24px; margin: 24px 0;">
      <h3 style="color: #92400e; font-size: 18px; font-weight: 600; margin: 0 0 12px;">
        🎊 What's Next?
      </h3>
      <ul style="margin: 0; padding-left: 20px; color: #78350f; line-height: 1.8;">
        <li>Thank all your supporters with a heartfelt update</li>
        <li>Start working on delivering your promises</li>
        <li>Keep supporters updated on your progress</li>
        <li>Consider stretch goals if you want to raise more</li>
      </ul>
    </div>
    ` : `
    <div style="background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%); border-radius: 12px; padding: 24px; margin: 24px 0;">
      <h3 style="color: #5b21b6; font-size: 18px; font-weight: 600; margin: 0 0 12px;">
        💪 Keep the Momentum Going
      </h3>
      <ul style="margin: 0; padding-left: 20px; color: #6b21a8; line-height: 1.8;">
        <li>Post an update celebrating this milestone</li>
        <li>Share your progress on social media</li>
        <li>Thank your supporters personally</li>
        <li>Engage with comments and questions</li>
        <li>Reach out to potential supporters</li>
      </ul>
    </div>
    `}
    
    <!-- Action Buttons -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="${campaignUrl}" class="button" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 8px;">
        View Campaign
      </a>
      <a href="${shareUrl}" style="display: inline-block; padding: 14px 32px; background-color: #10b981; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 8px;">
        Share Your Success
      </a>
    </div>
    
    <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <p style="margin: 0; color: #065f46; font-size: 14px; line-height: 1.6;">
        <strong>💡 Pro Tip:</strong> Campaigns that post updates after reaching milestones 
        see 40% more engagement and often exceed their goals!
      </p>
    </div>
    
    <p style="margin: 24px 0 16px; font-size: 16px; line-height: 1.6; text-align: center;">
      Your supporters believe in you, ${creatorName}. Keep making magic happen! ✨
    </p>
    
    <p style="margin: 16px 0; font-size: 16px; line-height: 1.6; color: #6b7280; text-align: center;">
      Cheers,<br>
      <strong style="color: #374151;">The Get Me A Chai Team</strong>
    </p>
  `;

    const html = EmailLayout({
        content,
        preheader: `${milestone.title} Your campaign "${campaignTitle}" is ${percentage}% funded!`,
        userId,
        type: 'milestone',
    });

    return {
        subject: `${milestone.emoji} Milestone Reached: ${percentage}% Funded - "${campaignTitle}"`,
        html,
        text: `Congratulations! Your campaign "${campaignTitle}" has reached ${percentage}% of its goal (${formattedTotal} of ${formattedGoal}). View campaign: ${campaignUrl}`,
    };
}

export default MilestoneEmail;
