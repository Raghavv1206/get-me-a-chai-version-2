// lib/categoryImages.js

/**
 * Get the default cover image path based on campaign category
 * @param {string} category - The campaign category
 * @returns {string} - The path to the default image for that category
 */
export function getCategoryDefaultImage(category) {
    const categoryImageMap = {
        'technology': '/images/campaigns/tech-1.jpg',
        'art': '/images/campaigns/art-1.jpg',
        'music': '/images/campaigns/music-1.jpg',
        'games': '/images/campaigns/game-1.jpg',
        'food': '/images/campaigns/food-1.jpg',
        'fashion': '/images/campaigns/fashion.svg',
        'education': '/images/campaigns/education.svg',
        'film': '/images/campaigns/default.svg',
        'other': '/images/campaigns/default.svg',
    };

    // Return category-specific image or default fallback
    return categoryImageMap[category?.toLowerCase()] || '/images/campaigns/default.svg';
}

/**
 * Get the full URL for a category default image
 * Used when absolute URLs are needed (e.g., for external services, emails, etc.)
 * @param {string} category - The campaign category
 * @param {string} baseUrl - The base URL of the application (optional)
 * @returns {string} - The full URL to the default image
 */
export function getCategoryDefaultImageUrl(category, baseUrl = '') {
    const imagePath = getCategoryDefaultImage(category);

    // If baseUrl is provided, return absolute URL
    if (baseUrl) {
        return `${baseUrl}${imagePath}`;
    }

    // Otherwise return the path (for use in Next.js Image component or img tags)
    return imagePath;
}

/**
 * Check if a cover image is provided, otherwise return category default
 * @param {string} coverImage - The user-provided cover image URL
 * @param {string} category - The campaign category
 * @returns {string} - The cover image URL or category default
 */
export function resolveCoverImage(coverImage, category) {
    if (coverImage && coverImage.trim() !== '') {
        return coverImage;
    }
    return getCategoryDefaultImage(category);
}
