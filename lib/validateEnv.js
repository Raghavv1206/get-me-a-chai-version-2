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
 * Validates optional environment variables and warns if missing
 */
export function validateOptionalEnv() {
    const optional = {
        'RAZORPAY_KEY_ID': 'Payment processing will not work',
        'RAZORPAY_KEY_SECRET': 'Payment processing will not work'
    };

    Object.entries(optional).forEach(([key, warning]) => {
        if (!process.env[key]) {
            console.warn(`⚠️  Optional env var ${key} is missing: ${warning}`);
        }
    });
}
