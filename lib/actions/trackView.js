// lib/actions/trackView.js
'use server';

/**
 * Track a campaign view for analytics and recommendations
 * 
 * This function records campaign views for analytics purposes and to improve
 * recommendation algorithms. It includes retry logic and comprehensive error handling.
 * 
 * @param {string} campaignId - The campaign ID to track (required, non-empty string)
 * @returns {Promise<{success: boolean, error?: string}>} Result object indicating success/failure
 * 
 * @example
 * const result = await trackView('campaign-123');
 * if (result.success) {
 *   console.log('View tracked successfully');
 * }
 */
export async function trackView(campaignId) {
    // Input validation
    if (!campaignId || typeof campaignId !== 'string') {
        console.error('[trackView] Invalid campaignId:', campaignId);
        return {
            success: false,
            error: 'Invalid campaign ID: must be a non-empty string'
        };
    }

    // Trim and validate non-empty after trimming
    const trimmedId = campaignId.trim();
    if (trimmedId.length === 0) {
        console.error('[trackView] Empty campaignId after trimming');
        return {
            success: false,
            error: 'Campaign ID cannot be empty'
        };
    }

    // Validate environment configuration
    if (!process.env.NEXT_PUBLIC_URL) {
        console.error('[trackView] NEXT_PUBLIC_URL environment variable not configured');
        return {
            success: false,
            error: 'Server configuration error'
        };
    }

    // Retry configuration
    const MAX_RETRIES = 2;
    const RETRY_DELAY_MS = 1000;
    const REQUEST_TIMEOUT_MS = 5000;

    /**
     * Helper function to delay execution
     * @param {number} ms - Milliseconds to delay
     */
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    /**
     * Attempt to track view with timeout
     * @returns {Promise<Response>}
     */
    const attemptTrack = async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_URL}/api/campaigns/track-view`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ campaignId: trimmedId }),
                    signal: controller.signal,
                }
            );

            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    };

    // Retry loop
    let lastError = null;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await attemptTrack();

            // Check response status
            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Unknown error');
                console.error(
                    `[trackView] HTTP ${response.status} error (attempt ${attempt + 1}/${MAX_RETRIES + 1}):`,
                    errorText
                );

                // Don't retry on client errors (4xx), only server errors (5xx)
                if (response.status >= 400 && response.status < 500) {
                    return {
                        success: false,
                        error: `Client error: ${response.status}`
                    };
                }

                // Store error and continue to retry for 5xx errors
                lastError = new Error(`HTTP ${response.status}: ${errorText}`);

                // Wait before retrying (exponential backoff)
                if (attempt < MAX_RETRIES) {
                    await delay(RETRY_DELAY_MS * Math.pow(2, attempt));
                    continue;
                }
            } else {
                // Success case
                return { success: true };
            }
        } catch (error) {
            lastError = error;

            // Log different error types appropriately
            if (error.name === 'AbortError') {
                console.error(
                    `[trackView] Request timeout (attempt ${attempt + 1}/${MAX_RETRIES + 1})`
                );
            } else if (error.message?.includes('fetch')) {
                console.error(
                    `[trackView] Network error (attempt ${attempt + 1}/${MAX_RETRIES + 1}):`,
                    error.message
                );
            } else {
                console.error(
                    `[trackView] Unexpected error (attempt ${attempt + 1}/${MAX_RETRIES + 1}):`,
                    error
                );
            }

            // Wait before retrying
            if (attempt < MAX_RETRIES) {
                await delay(RETRY_DELAY_MS * Math.pow(2, attempt));
            }
        }
    }

    // All retries exhausted
    console.error(
        `[trackView] Failed after ${MAX_RETRIES + 1} attempts for campaignId: ${trimmedId}`,
        lastError
    );

    return {
        success: false,
        error: lastError?.message || 'Failed to track view after multiple attempts'
    };
}
