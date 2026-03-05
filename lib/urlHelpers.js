// lib/urlHelpers.js
/**
 * Centralized URL builder for campaign and notification links.
 * All link generation should use these helpers to avoid
 * broken or hardcoded URLs across the codebase.
 */

/**
 * Get the application base URL from environment, with fallback.
 * @returns {string} Base URL without trailing slash
 */
export function getBaseUrl() {
    const url = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    return url.replace(/\/+$/, ''); // strip trailing slashes
}

/**
 * Build a campaign page URL.
 * Campaign pages live at /campaign/[campaignId].
 *
 * @param {string|null} campaignId - MongoDB ObjectId of the campaign
 * @param {Object}      [options]
 * @param {string}      [options.hash]     - Optional hash fragment (e.g. 'comments', 'updates')
 * @param {boolean}     [options.absolute] - If true, prepend the base URL
 * @returns {string} Relative or absolute URL
 */
export function buildCampaignUrl(campaignId, options = {}) {
    const { hash, absolute = false } = options;

    if (!campaignId) {
        return absolute ? `${getBaseUrl()}/dashboard` : '/dashboard';
    }

    const path = `/campaign/${campaignId}`;
    const fragment = hash ? `#${hash}` : '';
    const url = `${path}${fragment}`;

    return absolute ? `${getBaseUrl()}${url}` : url;
}

/**
 * Build a dashboard URL.
 *
 * @param {string}  [subPath] - Optional sub-path (e.g. 'supporters', 'campaigns')
 * @param {boolean} [absolute] - If true, prepend the base URL
 * @returns {string}
 */
export function buildDashboardUrl(subPath, absolute = false) {
    const path = subPath ? `/dashboard/${subPath}` : '/dashboard';
    return absolute ? `${getBaseUrl()}${path}` : path;
}

/**
 * Build a settings URL.
 *
 * @param {boolean} [absolute] - If true, prepend the base URL
 * @returns {string}
 */
export function buildSettingsUrl(absolute = false) {
    const path = '/dashboard/settings';
    return absolute ? `${getBaseUrl()}${path}` : path;
}

/**
 * Build a "my contributions" URL.
 *
 * @param {boolean} [absolute] - If true, prepend the base URL
 * @returns {string}
 */
export function buildMyContributionsUrl(absolute = false) {
    const path = '/my-contributions';
    return absolute ? `${getBaseUrl()}${path}` : path;
}
