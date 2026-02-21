/**
 * Calculate the number of days remaining until a given end date.
 * Returns 0 if the date has passed or is invalid.
 *
 * @param {string|Date} endDate - The campaign end date
 * @returns {number} Days remaining (0 if ended or invalid)
 */
export function calculateDaysLeft(endDate) {
    if (!endDate) return 0;
    const now = new Date();
    const end = new Date(endDate);
    if (isNaN(end.getTime())) return 0;
    const diff = end - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
