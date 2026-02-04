// lib/actions/stats.js
'use server';

/**
 * Get platform statistics
 * @returns {Promise<Object>} Platform stats
 */
export async function getStats() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/stats`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store', // Always get fresh stats
        });

        if (!response.ok) {
            console.error('Failed to fetch stats');
            return {
                success: false,
                stats: {
                    totalRaised: 0,
                    activeCampaigns: 0,
                    creatorsFunded: 0,
                    successRate: 0
                }
            };
        }

        const stats = await response.json();
        return {
            success: true,
            stats
        };
    } catch (error) {
        console.error('Get stats error:', error);
        return {
            success: false,
            error: error.message,
            stats: {
                totalRaised: 0,
                activeCampaigns: 0,
                creatorsFunded: 0,
                successRate: 0
            }
        };
    }
}

/**
 * Get trending campaigns based on algorithm
 * @param {number} limit - Number of campaigns to return
 * @returns {Promise<Object>} Trending campaigns
 */
export async function getTrendingCampaigns(limit = 10) {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_URL}/api/campaigns/trending?limit=${limit}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-store',
            }
        );

        if (!response.ok) {
            console.error('Failed to fetch trending campaigns');
            return {
                success: false,
                campaigns: []
            };
        }

        const data = await response.json();
        return {
            success: true,
            campaigns: data.campaigns || []
        };
    } catch (error) {
        console.error('Get trending campaigns error:', error);
        return {
            success: false,
            error: error.message,
            campaigns: []
        };
    }
}

/**
 * Get campaign counts by category
 * @returns {Promise<Object>} Category counts
 */
export async function getCategoryCounts() {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_URL}/api/campaigns/category-counts`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-store',
            }
        );

        if (!response.ok) {
            console.error('Failed to fetch category counts');
            return {
                success: false,
                counts: {}
            };
        }

        const data = await response.json();
        return {
            success: true,
            counts: data.counts || {}
        };
    } catch (error) {
        console.error('Get category counts error:', error);
        return {
            success: false,
            error: error.message,
            counts: {}
        };
    }
}
