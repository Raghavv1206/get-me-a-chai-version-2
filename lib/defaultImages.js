// lib/defaultImages.js - Default image mappings for campaigns and users

/**
 * Get default campaign image based on category
 * @param {string} category - Campaign category
 * @returns {string} Path to default image
 */
export function getDefaultCampaignImage(category) {
    const categoryMap = {
        'technology': '/images/campaigns/tech-1.jpg',
        'art': '/images/campaigns/art-1.jpg',
        'music': '/images/campaigns/music-1.jpg',
        'film': '/images/campaigns/film-1.jpg',
        'education': '/images/campaigns/education.svg',
        'games': '/images/campaigns/game-1.jpg',
        'food': '/images/campaigns/food-1.jpg',
        'fashion': '/images/campaigns/fashion.svg',
        'other': '/images/campaigns/default.svg'
    };

    return categoryMap[category?.toLowerCase()] || categoryMap['other'];
}

/**
 * Get default user profile picture
 * @returns {string} Path to default profile picture
 */
export function getDefaultProfilePic() {
    return '/images/default-profilepic.svg';
}

/**
 * Get default user cover picture
 * @returns {string} Path to default cover picture
 */
export function getDefaultCoverPic() {
    return '/images/default-coverpic.svg';
}

/**
 * Get campaign image with fallback to default
 * @param {string} coverImage - Campaign cover image URL
 * @param {string} category - Campaign category for fallback
 * @returns {string} Image URL or default
 */
export function getCampaignImageWithFallback(coverImage, category) {
    return coverImage || getDefaultCampaignImage(category);
}

/**
 * Get user profile picture with fallback
 * @param {string} profilepic - User profile picture URL
 * @returns {string} Image URL or default
 */
export function getUserProfilePicWithFallback(profilepic) {
    return profilepic || getDefaultProfilePic();
}

/**
 * Get user cover picture with fallback
 * @param {string} coverpic - User cover picture URL
 * @returns {string} Image URL or default
 */
export function getUserCoverPicWithFallback(coverpic) {
    return coverpic || getDefaultCoverPic();
}

/**
 * Get all campaign categories with their default images
 * @returns {Array} Array of category objects with name and image
 */
export function getAllCampaignCategories() {
    return [
        { name: 'technology', label: 'Technology', image: '/images/campaigns/tech-1.jpg' },
        { name: 'art', label: 'Art & Design', image: '/images/campaigns/art-1.jpg' },
        { name: 'music', label: 'Music', image: '/images/campaigns/music-1.jpg' },
        { name: 'film', label: 'Film & Video', image: '/images/campaigns/film-1.jpg' },
        { name: 'education', label: 'Education', image: '/images/campaigns/education.svg' },
        { name: 'games', label: 'Games', image: '/images/campaigns/game-1.jpg' },
        { name: 'food', label: 'Food & Beverage', image: '/images/campaigns/food-1.jpg' },
        { name: 'fashion', label: 'Fashion', image: '/images/campaigns/fashion.svg' },
        { name: 'other', label: 'Other', image: '/images/campaigns/default.svg' }
    ];
}

/**
 * Validate and sanitize image URL
 * @param {string} url - Image URL to validate
 * @returns {string|null} Sanitized URL or null if invalid
 */
export function validateImageUrl(url) {
    if (!url || typeof url !== 'string') return null;

    // Check if it's a valid URL or path
    if (url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    return null;
}
