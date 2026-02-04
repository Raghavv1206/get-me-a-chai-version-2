// lib/actions/getRecommendations.js
'use server';

/**
 * Get personalized campaign recommendations for a user
 * @param {string} userId - The user ID to get recommendations for
 * @returns {Promise<Array>} Array of recommended campaigns with match scores
 */
export async function getRecommendations(userId) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/ai/recommendations`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store', // Don't cache recommendations
        });

        if (!response.ok) {
            console.error('Failed to fetch recommendations');
            return { success: false, recommendations: [] };
        }

        const data = await response.json();
        return {
            success: true,
            recommendations: data.recommendations || []
        };
    } catch (error) {
        console.error('Get recommendations error:', error);
        return {
            success: false,
            error: error.message,
            recommendations: []
        };
    }
}
