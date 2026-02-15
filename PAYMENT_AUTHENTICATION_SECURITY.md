# Authentication Security for Campaign Payments

## Overview
Added authentication checks to ensure only logged-in users can support campaigns. This provides both client-side and server-side security.

## Security Implementation

### 🔒 Two-Layer Security

#### 1. Client-Side Authentication (CampaignSidebar.js)
**Purpose:** Provide immediate user feedback and prevent unnecessary API calls

**Features:**
- ✅ Checks user session status using `useSession()` from NextAuth
- ✅ Shows "Login to Support" button for unauthenticated users
- ✅ Displays lock icon (🔒) instead of heart icon when not logged in
- ✅ Shows helpful message: "You need to be logged in to support this campaign"
- ✅ Redirects to login page with return URL when clicked
- ✅ Toast notification: "Please login to support this campaign"

**User Experience:**
```
Unauthenticated User:
1. Sees "Login to Support" button with lock icon
2. Clicks button
3. Gets toast notification
4. Redirected to login page
5. After login, returns to campaign page
6. Can now make payment

Authenticated User:
1. Sees "Support This Campaign" button with heart icon
2. Can fill form and make payment normally
```

#### 2. Server-Side Authentication (useractions.js)
**Purpose:** Enforce security at the API level, prevent unauthorized payments

**Features:**
- ✅ Uses `getServerSession()` to verify authentication
- ✅ Checks session before processing any payment
- ✅ Logs authentication attempts for security monitoring
- ✅ Returns user-friendly error message if not authenticated
- ✅ Prevents payment initiation without valid session

**Security Flow:**
```javascript
export const initiate = async (amount, to_username, paymentform) => {
    // 1. Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
        throw new Error('You must be logged in to make a payment.');
    }
    
    // 2. Log authenticated user
    logger.info('Payment initiated by authenticated user', { 
        userEmail: session.user?.email 
    });
    
    // 3. Proceed with payment...
}
```

## Code Changes

### 1. CampaignSidebar Component

**Imports Added:**
```javascript
import { useSession } from 'next-auth/react';
import { FaLock } from 'react-icons/fa';
```

**Session Hook:**
```javascript
const { data: session, status } = useSession();
```

**Authentication Check in handleSupport:**
```javascript
const handleSupport = () => {
    // Check loading state
    if (status === 'loading') {
        toast.info('Checking authentication...');
        return;
    }

    // Check if authenticated
    if (!session) {
        toast.error('Please login to support this campaign');
        router.push(`/login?callbackUrl=/campaign/${campaign._id}`);
        return;
    }

    // Proceed with payment
    pay(amount);
};
```

**Dynamic Button Content:**
```javascript
<button onClick={handleSupport}>
    {!session ? (
        <>
            <FaLock className="w-4 h-4" />
            <span>Login to Support</span>
        </>
    ) : (
        <>
            <FaHeart className="w-4 h-4" />
            <span>Support This Campaign</span>
        </>
    )}
</button>
```

**Login Required Message:**
```javascript
{!session && (
    <div className="mt-3 text-center text-sm text-gray-400">
        <p>🔒 You need to be logged in to support this campaign</p>
    </div>
)}
```

### 2. Server Action (useractions.js)

**Imports Added:**
```javascript
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
```

**Authentication Check:**
```javascript
// Check if user is authenticated (server-side)
const session = await getServerSession(authOptions);
if (!session) {
    logger.warn('Unauthenticated payment attempt', { to_username });
    throw new Error('You must be logged in to make a payment. Please login and try again.');
}

logger.info('Payment initiated by authenticated user', { 
    userEmail: session.user?.email,
    to_username 
});
```

## Security Benefits

### 1. **Prevents Anonymous Payments** ✅
- All payments are tied to authenticated users
- Better tracking and accountability
- Reduces fraud and abuse

### 2. **Better User Management** ✅
- Can track which users support which campaigns
- Enable payment history for users
- Send email confirmations to authenticated users

### 3. **Improved Analytics** ✅
- Know exactly who is supporting campaigns
- Track user engagement and conversion
- Build user profiles based on support history

### 4. **Enhanced Security** ✅
- Server-side validation prevents API abuse
- Session-based authentication is secure
- Logs all authentication attempts

### 5. **Better UX** ✅
- Clear feedback for unauthenticated users
- Seamless redirect to login with return URL
- Automatic return to campaign after login

## Testing

### Test Case 1: Unauthenticated User
1. **Open campaign page** while logged out
2. **Verify:**
   - Button shows "Login to Support" with lock icon
   - Message shows "You need to be logged in"
   - Button is enabled (not disabled)
3. **Click button**
4. **Verify:**
   - Toast notification appears
   - Redirected to `/login?callbackUrl=/campaign/[id]`
5. **Login**
6. **Verify:**
   - Redirected back to campaign page
   - Button now shows "Support This Campaign" with heart icon
   - Can proceed with payment

### Test Case 2: Authenticated User
1. **Login first**
2. **Open campaign page**
3. **Verify:**
   - Button shows "Support This Campaign" with heart icon
   - No login message displayed
   - Form validation works normally
4. **Fill form and click button**
5. **Verify:**
   - Payment process initiates normally
   - No authentication errors

### Test Case 3: Session Expiry
1. **Login and open campaign page**
2. **Let session expire** (or clear cookies)
3. **Try to make payment**
4. **Verify:**
   - Client-side check catches expired session
   - Redirected to login
   - OR server-side check returns auth error

### Test Case 4: Direct API Call (Security Test)
1. **Try to call `/api/razorpay` directly** without session
2. **Verify:**
   - Server-side check blocks the request
   - Error logged: "Unauthenticated payment attempt"
   - Returns error message

## Error Messages

### Client-Side Errors:
- **Loading:** "Checking authentication..."
- **Not Logged In:** "Please login to support this campaign"

### Server-Side Errors:
- **No Session:** "You must be logged in to make a payment. Please login and try again."

## Logging

All authentication events are logged:

```javascript
// Successful authentication
logger.info('Payment initiated by authenticated user', { 
    userEmail: session.user?.email,
    to_username 
});

// Failed authentication
logger.warn('Unauthenticated payment attempt', { to_username });
```

## Future Enhancements

### Potential Improvements:
1. **Email Verification** - Require verified email before payments
2. **Payment Limits** - Set limits for new users
3. **Two-Factor Authentication** - Optional 2FA for large payments
4. **Payment History** - Show user's past payments in dashboard
5. **Supporter Badges** - Award badges for supporting campaigns
6. **Anonymous Option** - Allow logged-in users to support anonymously

## Configuration

No additional configuration needed! The feature uses existing NextAuth setup.

**Required:**
- NextAuth configured in `/app/api/auth/[...nextauth]/route.js`
- Session provider in root layout
- Valid authentication providers (Google, GitHub, etc.)

## Rollback

If you need to disable authentication requirement:

1. **Remove client-side check:**
   - Remove `useSession()` hook
   - Remove authentication logic from `handleSupport()`
   - Restore original button

2. **Remove server-side check:**
   - Remove `getServerSession()` call
   - Remove session validation in `initiate()`

---

**Status:** ✅ Fully Implemented & Tested
**Security Level:** High
**User Impact:** Positive (clear feedback, seamless flow)
