# 🚀 PRODUCTION OPTIMIZATION - QUICK REFERENCE

**Quick guide for using the production-ready infrastructure**

---

## 📋 QUICK START

### 1. Configuration
```javascript
// Import config
import config from '@/lib/config';

// Access values
const appUrl = config.app.url;
const dbUri = config.database.uri;
const isAIEnabled = config.features.aiCampaignBuilder;

// Or use helpers
import { getConfig, isFeatureEnabled } from '@/lib/config';
const url = getConfig('app.url');
const enabled = isFeatureEnabled('aiChatbot');
```

### 2. Logging
```javascript
// Create logger for your component
import { createLogger } from '@/lib/logger';
const logger = createLogger('MyComponent');

// Log different levels
logger.debug('Debug info', { data });
logger.info('User action', { userId, action });
logger.warn('Warning message', { issue });
logger.error('Error occurred', { error });

// Special logging methods
logger.request('POST', '/api/endpoint', { userId });
logger.response('POST', '/api/endpoint', 200, 150); // status, duration
logger.query('find', 'campaigns', 45, { filter }); // operation, collection, duration
logger.metric('process_time', 1500, 'ms');
```

### 3. Rate Limiting
```javascript
// In API routes
import { withRateLimit, rateLimiters } from '@/lib/rateLimit';

// Use predefined limiters
export const POST = withRateLimit(
    rateLimiters.api, // or .auth, .general, .sensitive, .ai
    async (req) => {
        // Your handler code
    }
);

// Or create custom limiter
import { createRateLimiter } from '@/lib/rateLimit';
const customLimiter = createRateLimiter({
    maxRequests: 50,
    windowMs: 60 * 1000, // 1 minute
    message: 'Custom rate limit message'
});
```

### 4. Input Validation
```javascript
import {
    validateString,
    validateNumber,
    validateEmail,
    validateUrl,
    validateInput,
    ValidationError
} from '@/lib/validation';

// Validate individual fields
try {
    const name = validateString(input.name, {
        fieldName: 'Name',
        minLength: 2,
        maxLength: 50,
        trim: true
    });

    const amount = validateNumber(input.amount, {
        fieldName: 'Amount',
        min: 10,
        max: 1000000,
        integer: true
    });

    const email = validateEmail(input.email);
    const url = validateUrl(input.website);
} catch (error) {
    if (error instanceof ValidationError) {
        // Handle validation error
        console.log(error.field, error.message);
    }
}

// Validate entire object with schema
const validated = validateInput(data, {
    name: (val) => validateString(val, { fieldName: 'Name', maxLength: 50 }),
    email: (val) => validateEmail(val),
    amount: (val) => validateNumber(val, { min: 10, integer: true })
});
```

### 5. Error Boundaries
```javascript
// Wrap components
import ErrorBoundary from '@/components/ErrorBoundary';

<ErrorBoundary componentName="MyFeature">
    <MyComponent />
</ErrorBoundary>

// With custom fallback
<ErrorBoundary
    componentName="MyFeature"
    fallback={(error, reset) => (
        <div>
            <h1>Error: {error.message}</h1>
            <button onClick={reset}>Try Again</button>
        </div>
    )}
>
    <MyComponent />
</ErrorBoundary>

// Use error handler hook
import { useErrorHandler } from '@/components/ErrorBoundary';

function MyComponent() {
    const handleError = useErrorHandler();
    
    try {
        // risky operation
    } catch (error) {
        handleError(error); // Will trigger error boundary
    }
}
```

---

## 📝 COMMON PATTERNS

### API Route Template
```javascript
import { createLogger } from '@/lib/logger';
import { withRateLimit, rateLimiters } from '@/lib/rateLimit';
import { validateInput } from '@/lib/validation';
import config from '@/lib/config';

const logger = createLogger('MyAPI');

export const POST = withRateLimit(
    rateLimiters.api,
    async (req) => {
        const startTime = Date.now();
        
        try {
            // Log request
            logger.request('POST', '/api/my-endpoint');
            
            // Parse and validate input
            const data = await req.json();
            const validated = validateInput(data, {
                name: (val) => validateString(val, { maxLength: 50 }),
                amount: (val) => validateNumber(val, { min: 10 })
            });
            
            // Process request
            const result = await processData(validated);
            
            // Log success
            const duration = Date.now() - startTime;
            logger.response('POST', '/api/my-endpoint', 200, duration);
            
            return Response.json(result);
        } catch (error) {
            // Log error
            logger.error('Request failed', { error });
            
            return Response.json(
                { error: error.message },
                { status: 500 }
            );
        }
    }
);
```

### Server Action Template
```javascript
'use server';

import { createLogger } from '@/lib/logger';
import { validateInput } from '@/lib/validation';
import config from '@/lib/config';

const logger = createLogger('MyAction');

export async function myServerAction(data) {
    const requestId = Math.random().toString(36).substring(7);
    
    try {
        logger.info('Action started', { requestId, data });
        
        // Validate input
        const validated = validateInput(data, {
            // schema
        });
        
        // Process
        const result = await process(validated);
        
        logger.info('Action completed', { requestId, result });
        return { success: true, data: result };
        
    } catch (error) {
        logger.error('Action failed', { requestId, error });
        return { success: false, error: error.message };
    }
}
```

### Component Template
```javascript
'use client';

import { useState } from 'react';
import { createLogger } from '@/lib/logger';
import ErrorBoundary from '@/components/ErrorBoundary';
import config from '@/lib/config';

const logger = createLogger('MyComponent');

function MyComponent() {
    const [data, setData] = useState(null);
    
    const handleAction = async () => {
        try {
            logger.info('User action', { action: 'button_click' });
            
            const result = await fetchData();
            setData(result);
            
            logger.info('Action successful', { result });
        } catch (error) {
            logger.error('Action failed', { error });
            // Handle error
        }
    };
    
    return (
        <div>
            {/* Component JSX */}
        </div>
    );
}

// Export wrapped in error boundary
export default function MyComponentWithBoundary() {
    return (
        <ErrorBoundary componentName="MyComponent">
            <MyComponent />
        </ErrorBoundary>
    );
}
```

---

## 🔧 ENVIRONMENT VARIABLES

### Required (Must Set):
```bash
MONGO_URI=mongodb://...
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
RAZORPAY_KEY_ID=rzp_...
RAZORPAY_KEY_SECRET=...
OPENROUTER_API_KEY=sk-or-v1-...
```

### Recommended:
```bash
# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Cron
CRON_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">

# OAuth (optional)
GITHUB_ID=...
GITHUB_SECRET=...
GOOGLE_ID=...
GOOGLE_SECRET=...
```

### Feature Flags:
```bash
FEATURE_AI_CAMPAIGN_BUILDER=true
FEATURE_AI_CHATBOT=true
FEATURE_AI_RECOMMENDATIONS=true
FEATURE_SUBSCRIPTIONS=true
FEATURE_EMAIL_NOTIFICATIONS=true
```

---

## 🎯 PREDEFINED RATE LIMITERS

```javascript
rateLimiters.auth       // 5 requests / 15 min (strict)
rateLimiters.api        // 100 requests / 15 min (moderate)
rateLimiters.general    // 1000 requests / 15 min (lenient)
rateLimiters.sensitive  // 3 requests / 1 hour (very strict)
rateLimiters.ai         // 20 requests / 1 hour (AI operations)
```

---

## 📊 LOG LEVELS

```javascript
logger.debug()  // Development only, detailed info
logger.info()   // General information, user actions
logger.warn()   // Warnings, potential issues
logger.error()  // Errors, failures
```

**Environment Control:**
```bash
LOG_LEVEL=DEBUG  # Shows all logs
LOG_LEVEL=INFO   # Shows info, warn, error
LOG_LEVEL=WARN   # Shows warn, error only
LOG_LEVEL=ERROR  # Shows errors only
```

---

## ✅ VALIDATION HELPERS

```javascript
// String validation
validateString(value, {
    fieldName: 'Name',
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s]+$/,
    trim: true,
    allowEmpty: false
});

// Number validation
validateNumber(value, {
    fieldName: 'Amount',
    min: 10,
    max: 1000000,
    integer: true
});

// Email validation
validateEmail(email, 'Email');

// URL validation
validateUrl(url, {
    fieldName: 'Website',
    protocols: ['http', 'https'],
    requireProtocol: true
});

// Array validation
validateArray(array, {
    fieldName: 'Items',
    minLength: 1,
    maxLength: 10,
    itemValidator: (item) => validateString(item)
});

// Enum validation
validateEnum(value, ['option1', 'option2'], 'Field');
```

---

## 🚨 ERROR HANDLING

### Try-Catch Pattern:
```javascript
try {
    // Risky operation
    const result = await riskyOperation();
    logger.info('Success', { result });
    return result;
} catch (error) {
    logger.error('Operation failed', { error });
    
    // Return user-friendly error
    if (error instanceof ValidationError) {
        return { error: error.message };
    }
    
    return { error: 'An unexpected error occurred' };
}
```

### Error Boundary Pattern:
```javascript
<ErrorBoundary
    componentName="FeatureName"
    onError={(error, errorInfo) => {
        // Custom error handling
        sendToErrorTracking(error);
    }}
    onReset={() => {
        // Custom reset logic
        resetState();
    }}
>
    <MyComponent />
</ErrorBoundary>
```

---

## 🎨 FEATURE FLAGS

```javascript
import { isFeatureEnabled } from '@/lib/config';

// Check if feature is enabled
if (isFeatureEnabled('aiChatbot')) {
    // Show chatbot
}

// Conditional rendering
{isFeatureEnabled('subscriptions') && <SubscriptionButton />}

// Available flags:
// - aiCampaignBuilder
// - aiChatbot
// - aiRecommendations
// - subscriptions
// - socialSharing
// - emailNotifications
// - pushNotifications
```

---

## 📦 DEPLOYMENT CHECKLIST

- [ ] Copy `.env.example` to `.env.local`
- [ ] Fill in all required environment variables
- [ ] Generate secure secrets (NEXTAUTH_SECRET, CRON_SECRET)
- [ ] Test locally with `npm run dev`
- [ ] Run production build with `npm run build`
- [ ] Set environment variables in hosting platform
- [ ] Deploy application
- [ ] Verify configuration loads correctly
- [ ] Monitor logs for errors
- [ ] Set up error tracking (Sentry recommended)

---

## 📚 DOCUMENTATION

- **Full Guide:** `PRODUCTION_OPTIMIZATION_FINAL.md`
- **Summary:** `PRODUCTION_OPTIMIZATION_SUMMARY.md`
- **Quick Reference:** `PRODUCTION_OPTIMIZATION_QUICK_REF.md` (this file)
- **Environment Variables:** `.env.example`

---

## 💡 TIPS

1. **Always use config** instead of hardcoded values
2. **Always log** important operations
3. **Always validate** user input
4. **Always use rate limiting** on API routes
5. **Always wrap** components in error boundaries
6. **Always handle** errors gracefully
7. **Always test** in development first
8. **Always monitor** logs in production

---

**Happy Coding! 🚀**
