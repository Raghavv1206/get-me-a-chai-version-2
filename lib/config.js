// lib/config.js - Centralized Configuration Management

/**
 * Centralized configuration for the entire application.
 * All hardcoded values, URLs, and constants should be defined here.
 * 
 * Features:
 * - Environment-aware configuration
 * - Type-safe config access
 * - Validation on startup
 * - Default values for development
 */

import { createLogger } from './logger';

const logger = createLogger('Config');

/**
 * Get environment variable with validation
 * @param {string} key - Environment variable key
 * @param {*} defaultValue - Default value if not set
 * @param {boolean} required - Whether the variable is required
 * @returns {string} Environment variable value
 */
function getEnv(key, defaultValue = '', required = false) {
    const value = process.env[key];

    if (!value && required) {
        const error = `Required environment variable ${key} is not set`;
        logger.error(error);
        throw new Error(error);
    }

    return value || defaultValue;
}

/**
 * Parse boolean environment variable
 * @param {string} key - Environment variable key
 * @param {boolean} defaultValue - Default value
 * @returns {boolean} Parsed boolean value
 */
function getBoolEnv(key, defaultValue = false) {
    const value = process.env[key];
    if (!value) return defaultValue;
    return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Parse integer environment variable
 * @param {string} key - Environment variable key
 * @param {number} defaultValue - Default value
 * @returns {number} Parsed integer value
 */
function getIntEnv(key, defaultValue = 0) {
    const value = process.env[key];
    if (!value) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Application configuration object
 */
const config = {
    // Environment
    env: getEnv('NODE_ENV', 'development'),
    isDevelopment: process.env.NODE_ENV !== 'production',
    isProduction: process.env.NODE_ENV === 'production',

    // Application URLs
    app: {
        url: getEnv('NEXT_PUBLIC_URL', 'http://localhost:3000', true),
        name: getEnv('NEXT_PUBLIC_APP_NAME', 'Get Me A Chai'),
        description: getEnv('NEXT_PUBLIC_APP_DESCRIPTION', 'AI-Powered Crowdfunding Platform'),
        supportEmail: getEnv('SUPPORT_EMAIL', 'support@getmeachai.com'),
        noreplyEmail: getEnv('NOREPLY_EMAIL', 'noreply@getmeachai.com'),
    },

    // Database
    database: {
        uri: getEnv('MONGO_URI', 'mongodb://localhost:27017/get-me-a-chai', true),
        options: {
            maxPoolSize: getIntEnv('DB_MAX_POOL_SIZE', 10),
            minPoolSize: getIntEnv('DB_MIN_POOL_SIZE', 2),
            serverSelectionTimeoutMS: getIntEnv('DB_TIMEOUT', 5000),
        },
    },

    // Authentication
    auth: {
        nextAuthUrl: getEnv('NEXTAUTH_URL', 'http://localhost:3000', true),
        nextAuthSecret: getEnv('NEXTAUTH_SECRET', '', true),
        sessionMaxAge: getIntEnv('SESSION_MAX_AGE', 30 * 24 * 60 * 60), // 30 days

        // OAuth Providers
        google: {
            clientId: getEnv('GOOGLE_ID', ''),
            clientSecret: getEnv('GOOGLE_SECRET', ''),
            enabled: !!getEnv('GOOGLE_ID'),
        },
        github: {
            clientId: getEnv('GITHUB_ID', ''),
            clientSecret: getEnv('GITHUB_SECRET', ''),
            enabled: !!getEnv('GITHUB_ID'),
        },

        // Demo account
        demo: {
            email: getEnv('DEMO_EMAIL', 'demo@getmeachai.com'),
            password: getEnv('DEMO_PASSWORD', 'demo123456'),
            enabled: getBoolEnv('DEMO_ENABLED', true),
        },
    },

    // Payment Gateway (Razorpay)
    payment: {
        razorpay: {
            keyId: getEnv('RAZORPAY_KEY_ID', '', true),
            keySecret: getEnv('RAZORPAY_KEY_SECRET', '', true),
            publicKeyId: getEnv('NEXT_PUBLIC_RAZORPAY_KEY_ID', ''),
            webhookSecret: getEnv('RAZORPAY_WEBHOOK_SECRET', ''),
            currency: getEnv('PAYMENT_CURRENCY', 'INR'),
            minAmount: getIntEnv('PAYMENT_MIN_AMOUNT', 1), // ₹1
            maxAmount: getIntEnv('PAYMENT_MAX_AMOUNT', 9999999), // ₹99,99,999 (Razorpay limit is < 1 billion paise)
        },
    },

    // AI Configuration (OpenRouter)
    ai: {
        provider: 'openrouter',
        openrouter: {
            apiKey: getEnv('OPENROUTER_API_KEY', '', true),
            baseUrl: getEnv('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1'),
            model: getEnv('OPENROUTER_MODEL', 'deepseek/deepseek-r1'),
            maxTokens: getIntEnv('AI_MAX_TOKENS', 2000),
            temperature: parseFloat(getEnv('AI_TEMPERATURE', '0.7')),
        },
        rateLimit: {
            maxRequests: getIntEnv('AI_RATE_LIMIT_MAX', 20),
            windowMs: getIntEnv('AI_RATE_LIMIT_WINDOW', 60 * 60 * 1000), // 1 hour
        },
    },

    // Email Configuration (SMTP)
    email: {
        smtp: {
            host: getEnv('SMTP_HOST', 'smtp.gmail.com'),
            port: getIntEnv('SMTP_PORT', 587),
            secure: getBoolEnv('SMTP_SECURE', false),
            user: getEnv('SMTP_USER', ''),
            password: getEnv('SMTP_PASS', ''),
            fromName: getEnv('SMTP_FROM_NAME', 'Get Me A Chai'),
            fromEmail: getEnv('SMTP_FROM_EMAIL', getEnv('SMTP_USER', 'noreply@getmeachai.com')),
        },
        enabled: getBoolEnv('EMAIL_ENABLED', true),
        sendWelcome: getBoolEnv('EMAIL_SEND_WELCOME', true),
        sendReceipts: getBoolEnv('EMAIL_SEND_RECEIPTS', true),
        sendWeeklySummary: getBoolEnv('EMAIL_SEND_WEEKLY_SUMMARY', true),
    },

    // Cron Jobs
    cron: {
        secret: getEnv('CRON_SECRET', ''),
        enabled: getBoolEnv('CRON_ENABLED', true),
        weeklySummaryDay: getIntEnv('CRON_WEEKLY_DAY', 1), // Monday
        weeklySummaryHour: getIntEnv('CRON_WEEKLY_HOUR', 9), // 9 AM
    },

    // Rate Limiting
    rateLimit: {
        enabled: getBoolEnv('RATE_LIMIT_ENABLED', true),
        auth: {
            maxRequests: getIntEnv('RATE_LIMIT_AUTH_MAX', 5),
            windowMs: getIntEnv('RATE_LIMIT_AUTH_WINDOW', 15 * 60 * 1000),
        },
        api: {
            maxRequests: getIntEnv('RATE_LIMIT_API_MAX', 100),
            windowMs: getIntEnv('RATE_LIMIT_API_WINDOW', 15 * 60 * 1000),
        },
        general: {
            maxRequests: getIntEnv('RATE_LIMIT_GENERAL_MAX', 1000),
            windowMs: getIntEnv('RATE_LIMIT_GENERAL_WINDOW', 15 * 60 * 1000),
        },
    },

    // Logging
    logging: {
        level: getEnv('LOG_LEVEL', process.env.NODE_ENV === 'production' ? 'INFO' : 'DEBUG'),
        prettyPrint: getBoolEnv('LOG_PRETTY_PRINT', process.env.NODE_ENV !== 'production'),
    },

    // File Upload
    upload: {
        maxFileSize: getIntEnv('UPLOAD_MAX_FILE_SIZE', 5 * 1024 * 1024), // 5MB
        allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        allowedVideoTypes: ['video/mp4', 'video/webm'],
    },

    // Campaign Settings
    campaign: {
        minGoal: getIntEnv('CAMPAIGN_MIN_GOAL', 1000), // ₹1,000
        maxGoal: getIntEnv('CAMPAIGN_MAX_GOAL', 100000000), // ₹10 Crore
        minDuration: getIntEnv('CAMPAIGN_MIN_DURATION', 7), // 7 days
        maxDuration: getIntEnv('CAMPAIGN_MAX_DURATION', 90), // 90 days
        categories: [
            'Technology',
            'Creative',
            'Community',
            'Business',
            'Education',
            'Health',
            'Environment',
            'Other'
        ],
    },

    // Analytics
    analytics: {
        enabled: getBoolEnv('ANALYTICS_ENABLED', true),
        trackPageViews: getBoolEnv('ANALYTICS_TRACK_VIEWS', true),
        trackEvents: getBoolEnv('ANALYTICS_TRACK_EVENTS', true),
    },

    // Security
    security: {
        corsOrigins: getEnv('CORS_ORIGINS', '*').split(','),
        csrfEnabled: getBoolEnv('CSRF_ENABLED', true),
        helmetEnabled: getBoolEnv('HELMET_ENABLED', true),
    },

    // Feature Flags
    features: {
        aiCampaignBuilder: getBoolEnv('FEATURE_AI_CAMPAIGN_BUILDER', true),
        aiChatbot: getBoolEnv('FEATURE_AI_CHATBOT', true),
        aiRecommendations: getBoolEnv('FEATURE_AI_RECOMMENDATIONS', true),
        subscriptions: getBoolEnv('FEATURE_SUBSCRIPTIONS', true),
        socialSharing: getBoolEnv('FEATURE_SOCIAL_SHARING', true),
        emailNotifications: getBoolEnv('FEATURE_EMAIL_NOTIFICATIONS', true),
        pushNotifications: getBoolEnv('FEATURE_PUSH_NOTIFICATIONS', false),
    },

    // External Services
    external: {
        googleMapsApiKey: getEnv('GOOGLE_MAPS_API_KEY', ''),
        sentryDsn: getEnv('SENTRY_DSN', ''),
        googleAnalyticsId: getEnv('GOOGLE_ANALYTICS_ID', ''),
    },
};

/**
 * Validate critical configuration on startup
 */
function validateConfig() {
    const errors = [];

    // Check required fields
    if (!config.app.url) {
        errors.push('NEXT_PUBLIC_URL is required');
    }

    if (!config.database.uri) {
        errors.push('MONGO_URI is required');
    }

    if (!config.auth.nextAuthSecret) {
        errors.push('NEXTAUTH_SECRET is required');
    }

    if (!config.payment.razorpay.keyId) {
        errors.push('RAZORPAY_KEY_ID is required');
    }

    if (!config.ai.openrouter.apiKey) {
        errors.push('OPENROUTER_API_KEY is required');
    }

    // Validate URLs
    try {
        new URL(config.app.url);
    } catch (error) {
        errors.push('NEXT_PUBLIC_URL must be a valid URL');
    }

    // Validate email if enabled
    if (config.email.enabled && !config.email.smtp.user) {
        logger.warn('Email is enabled but SMTP_USER is not set');
    }

    if (errors.length > 0) {
        logger.error('Configuration validation failed', { errors });
        throw new Error(`Configuration errors: ${errors.join(', ')}`);
    }

    logger.info('Configuration validated successfully', {
        env: config.env,
        features: Object.keys(config.features).filter(k => config.features[k]),
    });
}

// Validate on module load (server-side only)
if (typeof window === 'undefined') {
    try {
        validateConfig();
    } catch (error) {
        logger.error('Failed to validate configuration', { error: error.message });
        // In production, you might want to exit the process
        if (config.isProduction) {
            process.exit(1);
        }
    }
}

/**
 * Get configuration value by path
 * @param {string} path - Dot-separated path (e.g., 'app.url')
 * @param {*} defaultValue - Default value if path not found
 * @returns {*} Configuration value
 */
export function getConfig(path, defaultValue = undefined) {
    const keys = path.split('.');
    let value = config;

    for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key];
        } else {
            return defaultValue;
        }
    }

    return value;
}

/**
 * Check if a feature is enabled
 * @param {string} featureName - Feature name
 * @returns {boolean} Whether feature is enabled
 */
export function isFeatureEnabled(featureName) {
    return config.features[featureName] === true;
}

export default config;
