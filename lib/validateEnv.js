// lib/validateEnv.js
/**
 * Validates that all required environment variables are present
 * Call this at application startup to fail fast if config is missing
 */
export function validateEnv() {
    const required = [
        'MONGO_URI',
        'NEXTAUTH_SECRET',
        'NEXTAUTH_URL',
        'GITHUB_ID',
        'GITHUB_SECRET',
        'NEXT_PUBLIC_URL'
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:');
        missing.forEach(key => console.error(`   - ${key}`));
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    console.log('✅ All required environment variables are present');
}

/**
 * Validates optional environment variables and warns if missing.
 *
 * NOTE: No Razorpay env vars are listed here.
 * Each creator stores their own Razorpay Key ID & Secret in the database via
 * the Settings page. No global Razorpay credentials are required at the platform level.
 */
export function validateOptionalEnv() {
    const optional = {
        'OPENROUTER_API_KEY': 'AI features (campaign suggestions, chatbot) will be disabled',
        'SMTP_USER': 'Email notifications will be disabled',
        'GOOGLE_ID': 'Google OAuth login will be unavailable',
    };

    Object.entries(optional).forEach(([key, warning]) => {
        if (!process.env[key]) {
            console.warn(`⚠️  Optional env var ${key} is missing: ${warning}`);
        }
    });
}
