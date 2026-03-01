import mongoose from "mongoose";
const { Schema, model } = mongoose;

const AnalyticsSchema = new Schema({
    campaign: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
    date: { type: Date, required: true, default: Date.now },

    // Event type: 'visit', 'click', 'conversion', 'share'
    eventType: {
        type: String,
        required: true,
        enum: ['visit', 'click', 'conversion', 'share'],
        default: 'visit'
    },

    // Traffic source classification
    source: {
        type: String,
        enum: ['direct', 'social', 'search', 'referral', 'email', 'unknown'],
        default: 'direct'
    },

    // Raw referrer URL for detailed analysis
    referrer: { type: String, default: '' },

    // UTM parameters for campaign tracking
    utmSource: { type: String, default: '' },
    utmMedium: { type: String, default: '' },
    utmCampaign: { type: String, default: '' },

    // Device info
    device: {
        type: String,
        enum: ['mobile', 'desktop', 'tablet', 'unknown'],
        default: 'unknown'
    },

    // For conversion events
    amount: { type: Number, default: 0 },

    // Optional user reference (for logged-in users)
    userId: { type: Schema.Types.ObjectId, ref: 'User' },

    // Additional metadata
    metadata: { type: Schema.Types.Mixed, default: {} },

    createdAt: { type: Date, default: Date.now }
});

// Compound indexes for efficient querying
AnalyticsSchema.index({ campaign: 1, date: -1 });
AnalyticsSchema.index({ campaign: 1, eventType: 1, date: -1 });
AnalyticsSchema.index({ campaign: 1, source: 1 });
AnalyticsSchema.index({ campaign: 1, eventType: 1, source: 1 });

/**
 * Static: classify a referrer URL into a traffic source category
 * @param {string} referrer - The document.referrer value
 * @param {Object} utmParams - { utmSource, utmMedium, utmCampaign }
 * @returns {string} One of: 'direct', 'social', 'search', 'referral', 'email'
 */
AnalyticsSchema.statics.classifySource = function (referrer = '', utmParams = {}) {
    // 1. UTM parameters take highest priority
    if (utmParams.utmMedium || utmParams.utmSource) {
        const medium = (utmParams.utmMedium || '').toLowerCase();
        const source = (utmParams.utmSource || '').toLowerCase();

        if (medium === 'email' || source === 'email' || source === 'newsletter') {
            return 'email';
        }
        if (medium === 'social' || ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok', 'pinterest', 'reddit', 'whatsapp', 'telegram'].includes(source)) {
            return 'social';
        }
        if (medium === 'cpc' || medium === 'ppc' || medium === 'search' || ['google', 'bing', 'yahoo', 'duckduckgo', 'baidu'].includes(source)) {
            return 'search';
        }
        if (medium === 'referral') {
            return 'referral';
        }
        // Has UTM but doesn't match known categories
        return 'referral';
    }

    // 2. No referrer = direct traffic
    if (!referrer || referrer.trim() === '') {
        return 'direct';
    }

    const ref = referrer.toLowerCase();

    // 3. Ignore same-site referrers (treat as direct)
    try {
        const refUrl = new URL(ref);
        const appDomains = [
            'localhost',
            'get-me-a-chai.vercel.app',
            'getmeachai.com',
        ];
        if (appDomains.some(d => refUrl.hostname.includes(d))) {
            return 'direct';
        }
    } catch {
        // Invalid URL, continue classification
    }

    // 4. Social media platforms
    const socialDomains = [
        'facebook.com', 'fb.com', 'fb.me',
        'twitter.com', 'x.com', 't.co',
        'instagram.com',
        'linkedin.com', 'lnkd.in',
        'youtube.com', 'youtu.be',
        'tiktok.com',
        'pinterest.com', 'pin.it',
        'reddit.com',
        'tumblr.com',
        'snapchat.com',
        'whatsapp.com', 'wa.me',
        'telegram.org', 't.me',
        'discord.com', 'discord.gg',
        'threads.net',
        'mastodon.social',
    ];
    if (socialDomains.some(domain => ref.includes(domain))) {
        return 'social';
    }

    // 5. Search engines
    const searchDomains = [
        'google.com', 'google.co.',
        'bing.com',
        'yahoo.com',
        'duckduckgo.com',
        'baidu.com',
        'yandex.com', 'yandex.ru',
        'ecosia.org',
        'ask.com',
        'aol.com',
    ];
    if (searchDomains.some(domain => ref.includes(domain))) {
        return 'search';
    }

    // 6. Email clients / webmail
    const emailDomains = [
        'mail.google.com',
        'outlook.live.com', 'outlook.office.com',
        'mail.yahoo.com',
        'mail.proton.me', 'protonmail.com',
    ];
    if (emailDomains.some(domain => ref.includes(domain))) {
        return 'email';
    }

    // 7. Everything else is a referral
    return 'referral';
};

/**
 * Static: detect device type from user-agent string
 * @param {string} userAgent
 * @returns {string} 'mobile', 'tablet', 'desktop', or 'unknown'
 */
AnalyticsSchema.statics.detectDevice = function (userAgent = '') {
    if (!userAgent) return 'unknown';
    const ua = userAgent.toLowerCase();

    // Tablet detection (must come before mobile since tablets may match mobile patterns)
    if (/ipad|tablet|playbook|silk/.test(ua) || (/android/.test(ua) && !/mobile/.test(ua))) {
        return 'tablet';
    }

    // Mobile detection
    if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry|opera mini|iemobile/.test(ua)) {
        return 'mobile';
    }

    // Desktop (anything else with a known OS)
    if (/windows|macintosh|mac os|linux|cros/.test(ua)) {
        return 'desktop';
    }

    return 'unknown';
};

/**
 * Static: get aggregated traffic sources for a campaign
 * @param {string} campaignId
 * @returns {Object} { labels: string[], data: number[] }
 */
AnalyticsSchema.statics.getTrafficSources = async function (campaignId) {
    const pipeline = [
        {
            $match: {
                campaign: new mongoose.Types.ObjectId(campaignId),
                eventType: 'visit'
            }
        },
        {
            $group: {
                _id: '$source',
                count: { $sum: 1 }
            }
        },
        {
            $sort: { count: -1 }
        }
    ];

    const results = await this.aggregate(pipeline);

    // Map source keys to display labels
    const sourceLabels = {
        direct: 'Direct',
        social: 'Social Media',
        search: 'Search',
        referral: 'Referral',
        email: 'Email',
        unknown: 'Unknown'
    };

    if (!results || results.length === 0) {
        return { labels: [], data: [], total: 0 };
    }

    const labels = [];
    const data = [];
    let total = 0;

    for (const r of results) {
        labels.push(sourceLabels[r._id] || r._id || 'Unknown');
        data.push(r.count);
        total += r.count;
    }

    return { labels, data, total };
};

export default mongoose.models.Analytics || model("Analytics", AnalyticsSchema);