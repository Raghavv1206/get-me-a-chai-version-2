// lib/email/templates/EmailLayout.js
/**
 * Base Email Layout Template
 * Provides consistent styling and structure for all emails
 */

import { getUnsubscribeLink } from '../nodemailer';

/**
 * Email layout wrapper with consistent styling
 * @param {Object} options - Layout options
 * @param {string} options.content - Main email content (HTML)
 * @param {string} options.preheader - Preview text (optional)
 * @param {string} options.userId - User ID for unsubscribe link (optional)
 * @param {string} options.type - Email type for unsubscribe (optional)
 * @returns {string} Complete HTML email
 */
export function EmailLayout({ content, preheader = '', userId = '', type = 'all' }) {
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const currentYear = new Date().getFullYear();
    const unsubscribeUrl = userId ? getUnsubscribeLink(userId, type) : '';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Get Me A Chai</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
  <style>
    /* Reset styles */
    body {
      margin: 0;
      padding: 0;
      min-width: 100%;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      background-color: #f3f4f6;
    }
    
    table {
      border-collapse: collapse;
      border-spacing: 0;
    }
    
    img {
      border: 0;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }
    
    /* Utility classes */
    .container {
      max-width: 600px;
      margin: 0 auto;
    }
    
    .content {
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 32px 24px;
      text-align: center;
    }
    
    .logo {
      color: #ffffff;
      font-size: 28px;
      font-weight: bold;
      text-decoration: none;
      letter-spacing: -0.5px;
    }
    
    .body {
      padding: 40px 32px;
      color: #374151;
      font-size: 16px;
      line-height: 1.6;
    }
    
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 16px 0;
      transition: transform 0.2s;
    }
    
    .button:hover {
      transform: translateY(-2px);
    }
    
    .footer {
      padding: 32px 24px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
    
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    
    .social-links {
      margin: 16px 0;
    }
    
    .social-links a {
      display: inline-block;
      margin: 0 8px;
      color: #6b7280;
      text-decoration: none;
    }
    
    .divider {
      height: 1px;
      background-color: #e5e7eb;
      margin: 24px 0;
    }
    
    /* Responsive */
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
      }
      
      .body {
        padding: 24px 20px !important;
      }
      
      .button {
        display: block !important;
        width: 100% !important;
        text-align: center !important;
      }
    }
  </style>
</head>
<body>
  <!-- Preheader text -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    ${preheader}
  </div>
  
  <!-- Spacer -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="padding: 24px 0;">
        
        <!-- Main container -->
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" align="center">
          <tr>
            <td>
              
              <!-- Content wrapper -->
              <table role="presentation" class="content" width="100%" cellpadding="0" cellspacing="0" border="0">
                
                <!-- Header -->
                <tr>
                  <td class="header">
                    <a href="${baseUrl}" class="logo" style="color: #ffffff; text-decoration: none;">
                      ☕ Get Me A Chai
                    </a>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td class="body">
                    ${content}
                  </td>
                </tr>
                
              </table>
              
              <!-- Footer -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="footer">
                    
                    <!-- Social links -->
                    <div class="social-links">
                      <a href="${baseUrl}/about">About</a> •
                      <a href="${baseUrl}/explore">Explore</a> •
                      <a href="${baseUrl}/contact">Contact</a> •
                      <a href="${baseUrl}/help">Help</a>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <!-- Company info -->
                    <p style="margin: 8px 0; color: #9ca3af; font-size: 13px;">
                      Get Me A Chai - Empowering Creators, One Chai at a Time
                    </p>
                    
                    <p style="margin: 8px 0; color: #9ca3af; font-size: 13px;">
                      © ${currentYear} Get Me A Chai. All rights reserved.
                    </p>
                    
                    ${unsubscribeUrl ? `
                    <p style="margin: 16px 0 8px; color: #9ca3af; font-size: 12px;">
                      Don't want to receive these emails? 
                      <a href="${unsubscribeUrl}" style="color: #667eea;">Unsubscribe</a>
                    </p>
                    ` : ''}
                    
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
        </table>
        
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export default EmailLayout;
