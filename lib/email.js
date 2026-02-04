// lib/email.js - Email Service with Nodemailer

/**
 * Production-ready email service with comprehensive error handling,
 * validation, retry logic, and connection pooling.
 */

import nodemailer from 'nodemailer';

// Validate SMTP configuration
function validateSMTPConfig() {
  const required = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.warn(
      `[Email] Missing SMTP configuration: ${missing.join(', ')}. ` +
      'Email functionality will be disabled.'
    );
    return false;
  }
  return true;
}

const isConfigured = validateSMTPConfig();

// Create reusable transporter with connection pooling
let transporter = null;

function getTransporter() {
  if (!isConfigured) {
    throw new Error('SMTP is not configured. Please set required environment variables.');
  }

  if (!transporter) {
    transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      pool: true, // Use connection pooling
      maxConnections: 5, // Max concurrent connections
      maxMessages: 100, // Max messages per connection
      rateDelta: 1000, // Rate limiting: 1 second
      rateLimit: 5 // Max 5 emails per rateDelta
    });

    // Verify connection configuration
    transporter.verify((error) => {
      if (error) {
        console.error('[Email] SMTP connection verification failed:', error);
      } else {
        console.log('[Email] SMTP server is ready to send emails');
      }
    });
  }

  return transporter;
}

// Base email template
function getEmailTemplate(content) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Get Me A Chai</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f3f4f6;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          font-size: 28px;
          margin: 0;
        }
        .content {
          padding: 40px 30px;
        }
        .content h2 {
          color: #111827;
          font-size: 24px;
          margin: 0 0 20px 0;
        }
        .content p {
          color: #374151;
          margin: 0 0 16px 0;
        }
        .button {
          display: inline-block;
          padding: 14px 28px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 0;
        }
        .info-box {
          background: #f9fafb;
          border-left: 4px solid #667eea;
          padding: 20px;
          margin: 20px 0;
        }
        .footer {
          background: #f9fafb;
          padding: 30px;
          text-align: center;
          font-size: 14px;
          color: #6b7280;
          border-top: 1px solid #e5e7eb;
        }
        .footer a {
          color: #667eea;
          text-decoration: none;
        }
        ul {
          padding-left: 20px;
          margin: 16px 0;
        }
        li {
          margin: 8px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>☕ Get Me A Chai</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>© 2026 Get Me A Chai. All rights reserved.</p>
          <p style="margin-top: 10px;">
            <a href="{{unsubscribeLink}}">Unsubscribe</a> | 
            <a href="https://getmeachai.com">Visit Website</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Email templates
export const emailTemplates = {
  welcome: (data) => getEmailTemplate(`
    <h2>Welcome to Get Me A Chai! 🎉</h2>
    <p>Hi ${data.name},</p>
    <p>We're thrilled to have you join our community of creators and supporters!</p>
    
    <h3 style="margin-top: 30px;">Quick Start Guide:</h3>
    <ul>
      <li>Create your first campaign and share your story</li>
      <li>Customize your profile to stand out</li>
      <li>Share your campaign link with your audience</li>
      <li>Engage with your supporters through updates</li>
    </ul>
    
    <a href="${data.dashboardLink}" class="button">Go to Dashboard →</a>
    
    <p style="margin-top: 30px;">If you have any questions, feel free to reach out to our support team.</p>
  `),

  paymentConfirmation: (data) => getEmailTemplate(`
    <h2>Thank You for Your Support! 💝</h2>
    <p>Hi ${data.supporterName},</p>
    <p>Your payment of <strong>₹${data.amount.toLocaleString('en-IN')}</strong> to <strong>${data.campaignTitle}</strong> was successful!</p>
    
    <div class="info-box">
      <h3 style="margin: 0 0 12px 0;">Receipt Details</h3>
      <p style="margin: 4px 0;"><strong>Transaction ID:</strong> ${data.transactionId}</p>
      <p style="margin: 4px 0;"><strong>Date:</strong> ${data.date}</p>
      <p style="margin: 4px 0;"><strong>Amount:</strong> ₹${data.amount.toLocaleString('en-IN')}</p>
      <p style="margin: 4px 0;"><strong>Campaign:</strong> ${data.campaignTitle}</p>
    </div>
    
    <p>Your generosity helps creators continue doing what they love. Thank you for making a difference!</p>
    
    <a href="${data.campaignLink}" class="button">View Campaign →</a>
  `),

  creatorNotification: (data) => getEmailTemplate(`
    <h2>You Received a New Donation! 🎉</h2>
    <p>Hi ${data.creatorName},</p>
    <p><strong>${data.supporterName}</strong> just supported your campaign <strong>${data.campaignTitle}</strong> with <strong>₹${data.amount.toLocaleString('en-IN')}</strong>!</p>
    
    ${data.message ? `
      <div class="info-box">
        <h3 style="margin: 0 0 8px 0;">Message from ${data.supporterName}:</h3>
        <p style="margin: 0;">"${data.message}"</p>
      </div>
    ` : ''}
    
    <p>Show your appreciation by sending a thank you message!</p>
    
    <a href="${data.thankYouLink}" class="button">Thank Your Supporter →</a>
  `),

  milestone: (data) => getEmailTemplate(`
    <h2>Congratulations! Milestone Reached! 🎊</h2>
    <p>Hi ${data.creatorName},</p>
    <p>Amazing news! Your campaign <strong>${data.campaignTitle}</strong> has reached <strong>${data.milestone}%</strong> of its goal!</p>
    
    <div class="info-box">
      <p style="margin: 4px 0;"><strong>Total Raised:</strong> ₹${data.totalRaised.toLocaleString('en-IN')}</p>
      <p style="margin: 4px 0;"><strong>Goal:</strong> ₹${data.goal.toLocaleString('en-IN')}</p>
      <p style="margin: 4px 0;"><strong>Progress:</strong> ${data.milestone}%</p>
      <p style="margin: 4px 0;"><strong>Supporters:</strong> ${data.supportersCount}</p>
    </div>
    
    <p>This is a great time to share your achievement with your audience and thank your supporters!</p>
    
    <a href="${data.shareLink}" class="button">Share Your Achievement →</a>
  `),

  updateNotification: (data) => getEmailTemplate(`
    <h2>New Update from ${data.creatorName} 📝</h2>
    <p>Hi ${data.supporterName},</p>
    <p><strong>${data.creatorName}</strong> posted a new update for <strong>${data.campaignTitle}</strong>:</p>
    
    <div class="info-box">
      <h3 style="margin: 0 0 12px 0;">${data.updateTitle}</h3>
      <p style="margin: 0;">${data.updateSnippet}...</p>
    </div>
    
    <a href="${data.updateLink}" class="button">Read Full Update →</a>
  `),

  weeklySummary: (data) => getEmailTemplate(`
    <h2>Your Weekly Summary 📊</h2>
    <p>Hi ${data.creatorName},</p>
    <p>Here's how your campaigns performed this week:</p>
    
    <div class="info-box">
      <h3 style="margin: 0 0 12px 0;">This Week's Performance</h3>
      <p style="margin: 4px 0;"><strong>Total Earnings:</strong> ₹${data.weeklyEarnings.toLocaleString('en-IN')}</p>
      <p style="margin: 4px 0;"><strong>New Supporters:</strong> ${data.newSupporters}</p>
      <p style="margin: 4px 0;"><strong>Campaign Views:</strong> ${data.views.toLocaleString()}</p>
      <p style="margin: 4px 0;"><strong>Active Campaigns:</strong> ${data.activeCampaigns}</p>
    </div>
    
    <h3 style="margin-top: 30px;">Tips for Success:</h3>
    <ul>
      <li>Post regular updates to keep supporters engaged</li>
      <li>Share your campaign on social media</li>
      <li>Thank your supporters personally</li>
      <li>Set achievable milestones</li>
    </ul>
    
    <a href="${data.dashboardLink}" class="button">View Full Analytics →</a>
  `)
};

/**
 * Send a single email with validation and retry logic
 * 
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email address
 * @param {string} params.subject - Email subject
 * @param {string} params.template - Template name from emailTemplates
 * @param {Object} params.data - Data to populate template
 * @param {number} [params.maxRetries=3] - Maximum retry attempts
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export async function sendEmail({ to, subject, template, data, maxRetries = 3 }) {
  // Input validation
  if (!to || typeof to !== 'string') {
    return { success: false, error: 'Invalid recipient email address' };
  }

  if (!subject || typeof subject !== 'string') {
    return { success: false, error: 'Invalid email subject' };
  }

  if (!template || !emailTemplates[template]) {
    return { success: false, error: `Invalid template: ${template}` };
  }

  if (!data || typeof data !== 'object') {
    return { success: false, error: 'Invalid template data' };
  }

  // Email regex validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    return { success: false, error: 'Invalid email format' };
  }

  // Check if SMTP is configured
  if (!isConfigured) {
    console.warn('[Email] SMTP not configured, skipping email send');
    return { success: false, error: 'Email service not configured' };
  }

  let lastError = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const html = emailTemplates[template](data);
      const smtp = getTransporter();

      const info = await smtp.sendMail({
        from: `"Get Me A Chai" <${process.env.SMTP_USER}>`,
        to: to.trim(),
        subject: subject.trim(),
        html,
        // Add text fallback
        text: html.replace(/<[^>]*>/g, ''), // Strip HTML tags for plain text
      });

      console.log(`[Email] Sent successfully to ${to}:`, info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      lastError = error;
      console.error(`[Email] Attempt ${attempt + 1}/${maxRetries} failed:`, error.message);

      // Don't retry on authentication errors
      if (error.message?.includes('auth') || error.message?.includes('authentication')) {
        return { success: false, error: 'SMTP authentication failed' };
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      }
    }
  }

  console.error(`[Email] Failed after ${maxRetries} attempts:`, lastError);
  return { success: false, error: lastError?.message || 'Failed to send email' };
}

/**
 * Send bulk emails with rate limiting and batch processing
 * 
 * @param {Object} params - Bulk email parameters
 * @param {Array<{email: string, ...}>} params.recipients - Array of recipient objects
 * @param {string} params.subject - Email subject
 * @param {string} params.template - Template name
 * @param {Object} params.data - Base data for template
 * @param {number} [params.batchSize=10] - Number of emails to send concurrently
 * @returns {Promise<{success: boolean, total: number, successful: number, failed: number, errors?: Array}>}
 */
export async function sendBulkEmail({ recipients, subject, template, data, batchSize = 10 }) {
  // Input validation
  if (!Array.isArray(recipients) || recipients.length === 0) {
    return { success: false, error: 'Recipients must be a non-empty array' };
  }

  if (!subject || !template || !data) {
    return { success: false, error: 'Missing required parameters' };
  }

  // Validate each recipient
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const invalidRecipients = recipients.filter(r => !r.email || !emailRegex.test(r.email));

  if (invalidRecipients.length > 0) {
    console.warn(`[Email] ${invalidRecipients.length} invalid recipients will be skipped`);
  }

  const validRecipients = recipients.filter(r => r.email && emailRegex.test(r.email));

  if (validRecipients.length === 0) {
    return { success: false, error: 'No valid recipients found' };
  }

  try {
    const results = [];
    const errors = [];

    // Process in batches to avoid overwhelming the SMTP server
    for (let i = 0; i < validRecipients.length; i += batchSize) {
      const batch = validRecipients.slice(i, i + batchSize);

      console.log(`[Email] Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(validRecipients.length / batchSize)}`);

      const batchPromises = batch.map(recipient =>
        sendEmail({
          to: recipient.email,
          subject,
          template,
          data: { ...data, ...recipient },
          maxRetries: 2 // Fewer retries for bulk sends
        })
      );

      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults);

      // Collect errors
      batchResults.forEach((result, index) => {
        if (result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success)) {
          errors.push({
            email: batch[index].email,
            error: result.status === 'rejected' ? result.reason : result.value.error
          });
        }
      });

      // Small delay between batches to respect rate limits
      if (i + batchSize < validRecipients.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    console.log(`[Email] Bulk send complete: ${successful}/${results.length} successful`);

    return {
      success: true,
      total: results.length,
      successful,
      failed,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    console.error('[Email] Bulk email error:', error);
    return { success: false, error: error.message };
  }
}

export default { sendEmail, sendBulkEmail, emailTemplates };
