# Comment Creation Fix

## Issue
Comment creation was failing with error:
```
Error: Comment validation failed: user: Path `user` is required.
```

## Root Cause
The `getServerSession()` call in `/api/campaigns/[id]/comments/route.js` was not receiving the `authOptions` parameter, which meant the session wasn't being properly configured with the user ID.

## Fix Applied

### 1. Import authOptions
```javascript
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
```

### 2. Pass authOptions to getServerSession
```javascript
// Before
const session = await getServerSession();

// After
const session = await getServerSession(authOptions);
```

### 3. Added User ID Validation
```javascript
// Validate user ID
if (!session.user?.id) {
    console.error('User ID not found in session:', session);
    return NextResponse.json(
        { success: false, message: 'User ID not found in session' },
        { status: 400 }
    );
}

console.log('Creating comment with user ID:', session.user.id);
```

## How Session Works

### JWT Callback (authOptions)
```javascript
async jwt({ token, user, account }) {
    // Fetch latest user data
    const dbUser = await User.findOne({ email: token.email });
    if (dbUser) {
        token.id = dbUser._id.toString(); // MongoDB _id
        token.username = dbUser.username;
        token.role = dbUser.role;
        token.verified = dbUser.verified;
    }
    return token;
}
```

### Session Callback
```javascript
async session({ session, token }) {
    if (session.user) {
        session.user.id = token.id;        // ← This is the MongoDB _id
        session.user.name = token.username;
        session.user.role = token.role;
        session.user.verified = token.verified;
    }
    return session;
}
```

## Testing

### Test Comment Creation
1. **Login** to the application
2. **Navigate** to any campaign page
3. **Scroll** to comments section
4. **Type** a comment
5. **Submit** the comment
6. **Verify:**
   - Comment appears immediately
   - No error in console
   - Comment is saved to database

### Expected Logs
```
Creating comment with user ID: 507f1f77bcf86cd799439011
MongoDB Connected: localhost
POST /api/campaigns/[id]/comments 200 in 150ms
```

### Error Scenarios

#### If User Not Logged In
```json
{
    "success": false,
    "message": "Unauthorized"
}
```
**Status:** 401

#### If User ID Missing
```json
{
    "success": false,
    "message": "User ID not found in session"
}
```
**Status:** 400

#### If Comment Empty
```json
{
    "success": false,
    "message": "Comment content is required"
}
```
**Status:** 400

## Files Modified

### ✅ `/app/api/campaigns/[id]/comments/route.js`
- Added `authOptions` import
- Updated `getServerSession(authOptions)`
- Added user ID validation
- Added debug logging

## Related Models

### Comment Schema
```javascript
{
    campaign: ObjectId (required),
    user: ObjectId (required),     // ← This was failing
    content: String (required),
    parentComment: ObjectId,
    likes: Number,
    pinned: Boolean,
    deleted: Boolean,
    createdAt: Date,
    updatedAt: Date
}
```

## Prevention

### Always Use authOptions with getServerSession
```javascript
// ❌ Wrong
const session = await getServerSession();

// ✅ Correct
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
const session = await getServerSession(authOptions);
```

### Check for User ID
```javascript
if (!session?.user?.id) {
    return NextResponse.json(
        { success: false, message: 'User ID not found' },
        { status: 400 }
    );
}
```

## Similar Issues to Check

### Other API Routes Using getServerSession
Search for files that might have the same issue:
```bash
grep -r "getServerSession()" app/api/
```

### Routes to Verify
- ✅ `/api/campaigns/[id]/comments/route.js` - FIXED
- ⚠️ Check other API routes for same pattern

---

**Status:** ✅ FIXED
**Date:** 2026-02-14
**Impact:** Comments can now be created successfully
