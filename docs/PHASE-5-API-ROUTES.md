# Phase 5: API Routes Implementation Guide

## ✅ Created API Routes (1/10)

1. ✅ `/api/analytics/overview` - Analytics summary stats

---

## 📝 Remaining API Routes Templates

### Analytics APIs

#### 2. `/api/analytics/visitors`
**File**: `app/api/analytics/visitors/route.js`
```javascript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET(request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '30');

  // Generate mock time-series data
  const data = Array.from({ length: days }, (_, i) => ({
    date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    unique: Math.floor(Math.random() * 100) + 50,
    returning: Math.floor(Math.random() * 50) + 20
  }));

  return NextResponse.json({ success: true, data });
}
```

#### 3. `/api/analytics/sources`
**File**: `app/api/analytics/sources/route.js`
```javascript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET(request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const data = [
    { source: 'direct', name: 'Direct', value: 1200, percentage: 40 },
    { source: 'social', name: 'Social Media', value: 900, percentage: 30 },
    { source: 'search', name: 'Search Engines', value: 600, percentage: 20 },
    { source: 'referral', name: 'Referrals', value: 240, percentage: 8 },
    { source: 'other', name: 'Other', value: 60, percentage: 2 }
  ];

  return NextResponse.json({ success: true, data });
}
```

#### 4. `/api/analytics/conversion`
**File**: `app/api/analytics/conversion/route.js`
```javascript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET(request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const data = {
    views: 5000,
    clicks: 2000,
    donations: 250,
    steps: [
      { name: 'Views', value: 5000, color: '#3b82f6' },
      { name: 'Clicks', value: 2000, color: '#10b981' },
      { name: 'Donations', value: 250, color: '#f59e0b' }
    ]
  };

  return NextResponse.json({ success: true, data });
}
```

#### 5. `/api/analytics/geographic`
**File**: `app/api/analytics/geographic/route.js`
```javascript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET(request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const data = {
    cities: [
      { name: 'Mumbai', value: 450 },
      { name: 'Delhi', value: 380 },
      { name: 'Bangalore', value: 320 },
      { name: 'Hyderabad', value: 280 },
      { name: 'Chennai', value: 250 },
      { name: 'Pune', value: 220 },
      { name: 'Kolkata', value: 180 },
      { name: 'Ahmedabad', value: 150 },
      { name: 'Jaipur', value: 120 },
      { name: 'Lucknow', value: 100 }
    ]
  };

  return NextResponse.json({ success: true, data });
}
```

#### 6. `/api/analytics/devices`
**File**: `app/api/analytics/devices/route.js`
```javascript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET(request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const data = [
    { device: 'mobile', name: 'Mobile', value: 1800, percentage: 60 },
    { device: 'desktop', name: 'Desktop', value: 900, percentage: 30 },
    { device: 'tablet', name: 'Tablet', value: 300, percentage: 10 }
  ];

  return NextResponse.json({ success: true, data });
}
```

#### 7. `/api/ai/insights`
**File**: `app/api/ai/insights/route.js`
```javascript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET(request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get('campaignId');

  // AI-generated insights (would use OpenRouter/DeepSeek in production)
  const insights = [
    {
      type: 'timing',
      priority: 'high',
      title: 'Best Posting Time',
      message: 'Your audience is most active on weekdays between 6 PM - 9 PM. Consider posting updates during this window for maximum engagement.',
      action: 'Schedule Posts'
    },
    {
      type: 'traffic',
      priority: 'medium',
      title: 'Traffic Spike on Mondays',
      message: 'Monday sees 2x more traffic than other days. This could be a great day to launch new campaigns or share important updates.',
      action: 'View Analytics'
    },
    {
      type: 'engagement',
      priority: 'low',
      title: 'Video Content Performs Better',
      message: 'Campaigns with video content raise 35% more on average. Consider adding videos to your campaigns.',
      action: 'Add Video'
    }
  ];

  return NextResponse.json({ success: true, insights });
}
```

---

### Supporter APIs

#### 8. `/api/supporters/list`
**File**: `app/api/supporters/list/route.js`
```javascript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDb from '@/db/connectDb';
import Payment from '@/models/Payment';

export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    await connectDb();

    // Aggregate supporters from payments
    const supporters = await Payment.aggregate([
      {
        $match: {
          to_user: session.user.username,
          done: true,
          status: 'success'
        }
      },
      {
        $group: {
          _id: '$email',
          name: { $first: '$name' },
          email: { $first: '$email' },
          totalContributed: { $sum: '$amount' },
          donationsCount: { $sum: 1 },
          firstDonation: { $min: '$createdAt' },
          lastDonation: { $max: '$createdAt' },
          lastAmount: { $last: '$amount' }
        }
      },
      {
        $sort: { totalContributed: -1 }
      }
    ]);

    return NextResponse.json({ success: true, supporters });
  } catch (error) {
    console.error('Error fetching supporters:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch supporters' },
      { status: 500 }
    );
  }
}
```

#### 9. `/api/supporters/[id]`
**File**: `app/api/supporters/[id]/route.js`
```javascript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDb from '@/db/connectDb';
import Payment from '@/models/Payment';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const { id: supporterId } = await params;

    await connectDb();

    // Get supporter details and contribution history
    const contributions = await Payment.find({
      _id: supporterId,
      to_user: session.user.username,
      done: true
    })
      .populate('campaign', 'title')
      .sort({ createdAt: -1 })
      .lean();

    if (contributions.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Supporter not found' },
        { status: 404 }
      );
    }

    const supporter = {
      _id: supporterId,
      name: contributions[0].name,
      email: contributions[0].email,
      totalContributed: contributions.reduce((sum, c) => sum + c.amount, 0),
      donationsCount: contributions.length,
      firstDonation: contributions[contributions.length - 1].createdAt,
      lastDonation: contributions[0].createdAt,
      lastAmount: contributions[0].amount,
      lastCampaign: contributions[0].campaign?.title,
      contributions
    };

    return NextResponse.json({ success: true, supporter });
  } catch (error) {
    console.error('Error fetching supporter details:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch supporter details' },
      { status: 500 }
    );
  }
}
```

#### 10. `/api/supporters/send-email`
**File**: `app/api/supporters/send-email/route.js`
```javascript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const body = await request.json();
    const { to, subject, message } = body;

    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    console.log('Sending email:', { to, subject, message });

    // Mock success
    return NextResponse.json({
      success: true,
      message: 'Email sent successfully'
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send email' },
      { status: 500 }
    );
  }
}
```

---

## 🚀 Quick Implementation

To implement all routes quickly, create each file with the code above.

All routes include:
- ✅ Authentication checks
- ✅ Error handling
- ✅ Mock data (replace with real DB queries)
- ✅ Proper HTTP status codes

---

**Status**: Templates provided for all 9 remaining API routes
**Next**: Create the actual route files using the templates above
