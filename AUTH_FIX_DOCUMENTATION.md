# Authentication Fix for Campaign API Routes

## Issue
The campaign API routes were failing with "Failed to fetch campaign" error because `getServerSession()` was being called without the required `authOptions` parameter.

## Root Cause
In Next.js 15 with NextAuth v4, `getServerSession()` requires the `authOptions` configuration to be passed as a parameter. Without it, the session cannot be properly retrieved, causing authentication to fail.

## Solution
Updated all campaign API routes to:
1. Import `authOptions` from the NextAuth configuration
2. Pass `authOptions` to `getServerSession()`

## Files Updated

### New API Routes (Created in this session)
✅ `app/api/campaigns/[id]/route.js` - GET single campaign
✅ `app/api/campaigns/[id]/update/route.js` - PATCH update campaign  
✅ `app/api/campaigns/[id]/analytics/route.js` - GET analytics

### Existing API Routes (Also updated for consistency)
✅ `app/api/campaigns/[id]/status/route.js` - PATCH status
✅ `app/api/campaigns/[id]/delete/route.js` - DELETE campaign
✅ `app/api/campaigns/[id]/duplicate/route.js` - POST duplicate

## Changes Made

### Before:
```javascript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDb from '@/db/connectDb';
import Campaign from '@/models/Campaign';

export async function GET(request, { params }) {
    try {
        const session = await getServerSession(); // ❌ Missing authOptions
        // ...
    }
}
```

### After:
```javascript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // ✅ Import authOptions
import connectDb from '@/db/connectDb';
import Campaign from '@/models/Campaign';

export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions); // ✅ Pass authOptions
        // ...
    }
}
```

## Testing
After this fix, all campaign features should work properly:
- ✅ Edit campaign page loads correctly
- ✅ Analytics page loads correctly
- ✅ All dropdown menu actions work
- ✅ Authentication is properly verified
- ✅ Session data is correctly retrieved

## Next.js 15 + NextAuth Compatibility
This pattern is required for Next.js 15 with NextAuth v4. The `authOptions` must be:
1. Exported from the NextAuth route handler
2. Imported in any route that uses `getServerSession()`
3. Passed as a parameter to `getServerSession()`

## Status
🟢 **FIXED** - All API routes now properly authenticate users and retrieve session data.
