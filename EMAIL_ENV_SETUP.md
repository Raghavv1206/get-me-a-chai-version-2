# Email System Environment Variables

## Required for Email Functionality

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Sender Information
SMTP_FROM_NAME=Get Me A Chai

# Cron Job Security
CRON_SECRET=your-random-secret-key-here

## SMTP Provider Examples

### Gmail
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password (not your regular password!)
# 
# To get Gmail App Password:
# 1. Go to Google Account settings
# 2. Security → 2-Step Verification
# 3. App passwords → Generate new password
# 4. Use that password here

### SendGrid
# SMTP_HOST=smtp.sendgrid.net
# SMTP_PORT=587
# SMTP_USER=apikey
# SMTP_PASS=your-sendgrid-api-key

### Mailgun
# SMTP_HOST=smtp.mailgun.org
# SMTP_PORT=587
# SMTP_USER=postmaster@your-domain.mailgun.org
# SMTP_PASS=your-mailgun-password

### AWS SES
# SMTP_HOST=email-smtp.us-east-1.amazonaws.com
# SMTP_PORT=587
# SMTP_USER=your-ses-smtp-username
# SMTP_PASS=your-ses-smtp-password

## Testing Email Configuration

# To test your email configuration, run:
# node -e "require('./lib/email/nodemailer').verifyEmailConfig()"

## Notes

1. **Gmail Users**: You MUST use an App Password, not your regular password
2. **Rate Limits**: Be aware of your SMTP provider's rate limits
3. **Cron Secret**: Generate a random string for CRON_SECRET (used to secure cron endpoints)
4. **Production**: Use a professional email service (SendGrid, Mailgun) for production
5. **Testing**: Use Gmail for development/testing

## Security Best Practices

- Never commit .env files to version control
- Use different credentials for development and production
- Rotate credentials regularly
- Monitor email sending logs
- Set up SPF, DKIM, and DMARC records for your domain
