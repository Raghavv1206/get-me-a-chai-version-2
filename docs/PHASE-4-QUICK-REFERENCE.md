# Phase 4 Quick Reference Guide

## 🚀 How to Use the Components

### Campaign Profile Page

#### Basic Setup:
```javascript
import CampaignProfile from '@/components/campaign/profile/CampaignProfile';

// In your page component
<CampaignProfile 
  campaign={campaignData}
  creator={creatorData}
  isSupporter={false}
/>
```

#### Required Data Structure:
```javascript
const campaignData = {
  _id: 'campaign_id',
  title: 'Campaign Title',
  coverImage: '/path/to/cover.jpg',
  category: 'technology',
  goalAmount: 100000,
  currentAmount: 50000,
  story: 'Campaign story...',
  images: ['/img1.jpg', '/img2.jpg'],
  milestones: [
    {
      title: 'Milestone 1',
      amount: 25000,
      description: 'First milestone',
      completed: true
    }
  ],
  rewards: [
    {
      _id: 'reward_id',
      title: 'Early Bird',
      amount: 500,
      description: 'Get early access',
      deliveryTime: '1 month',
      limitedQuantity: 100,
      claimedCount: 50
    }
  ],
  faqs: [
    {
      question: 'How does it work?',
      answer: 'It works like this...'
    }
  ],
  stats: {
    views: 1000,
    supporters: 50,
    comments: 25
  },
  daysRemaining: 30
};

const creatorData = {
  _id: 'creator_id',
  name: 'Creator Name',
  username: 'creator',
  profilepic: '/path/to/profile.jpg',
  coverpic: '/path/to/cover.jpg',
  bio: 'Creator bio...',
  location: 'Mumbai, India',
  verified: true,
  socialLinks: {
    twitter: 'https://twitter.com/creator',
    linkedin: 'https://linkedin.com/in/creator',
    github: 'https://github.com/creator',
    website: 'https://creator.com'
  },
  stats: {
    totalRaised: 500000,
    totalSupporters: 200,
    campaignsCount: 5,
    successRate: 80
  }
};
```

---

### Payment Sidebar

#### Basic Setup:
```javascript
import PaymentSidebar from '@/components/campaign/payment/PaymentSidebar';

<PaymentSidebar
  campaign={campaignData}
  creator={creatorData}
  selectedReward={null}
  onPaymentSuccess={(payment) => {
    console.log('Payment successful:', payment);
  }}
/>
```

#### Handling Payment Success:
```javascript
const handlePaymentSuccess = (payment) => {
  // Show success modal
  // Update campaign stats
  // Redirect to thank you page
  window.location.href = `/payment-success?id=${payment._id}`;
};
```

---

### Subscription Manager

#### Basic Setup:
```javascript
import SubscriptionManager from '@/components/subscription/SubscriptionManager';

// In a protected page
<SubscriptionManager />
```

#### API Integration:
```javascript
// Fetch subscriptions
const response = await fetch('/api/subscription/list');
const data = await response.json();

// Pause subscription
await fetch('/api/subscription/pause', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ subscriptionId: 'sub_id' })
});

// Resume subscription
await fetch('/api/subscription/resume', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ subscriptionId: 'sub_id' })
});

// Cancel subscription
await fetch('/api/subscription/cancel', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ subscriptionId: 'sub_id' })
});

// Update amount
await fetch('/api/subscription/update', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    subscriptionId: 'sub_id',
    amount: 1000
  })
});
```

---

## 📡 API Endpoints Reference

### Payment APIs

#### Create Payment Order:
```javascript
POST /api/payments/create
Body: {
  amount: 1000,
  campaign: 'campaign_id',
  creatorUsername: 'creator',
  name: 'Supporter Name',
  email: 'supporter@email.com',
  message: 'Keep up the good work!',
  rewardTier: 'reward_id', // optional
  paymentType: 'one-time', // or 'subscription'
  anonymous: false,
  hideAmount: false
}

Response: {
  success: true,
  order: {
    id: 'order_id',
    amount: 100000, // in paise
    currency: 'INR'
  },
  paymentData: {
    paymentId: 'payment_id',
    campaignId: 'campaign_id',
    creatorUsername: 'creator'
  }
}
```

#### Verify Payment:
```javascript
POST /api/payments/verify
Body: {
  razorpay_order_id: 'order_id',
  razorpay_payment_id: 'payment_id',
  razorpay_signature: 'signature',
  paymentData: { ... }
}

Response: {
  success: true,
  message: 'Payment verified successfully',
  payment: { ... }
}
```

#### Create Subscription:
```javascript
POST /api/payments/subscription
Body: {
  amount: 1000,
  frequency: 'monthly', // or 'quarterly', 'yearly'
  campaign: 'campaign_id',
  creatorUsername: 'creator',
  subscriberId: 'user_id'
}

Response: {
  success: true,
  subscription: {
    id: 'sub_id',
    subscriptionId: 'db_sub_id',
    amount: 1000,
    frequency: 'monthly',
    nextBillingDate: '2026-02-24'
  }
}
```

---

### Campaign APIs

#### Get Campaign Updates:
```javascript
GET /api/campaigns/{campaignId}/updates?page=1&limit=10

Response: {
  success: true,
  updates: [ ... ],
  hasMore: true,
  total: 50,
  page: 1,
  totalPages: 5
}
```

#### Create Campaign Update:
```javascript
POST /api/campaigns/{campaignId}/updates
Body: {
  title: 'Update Title',
  content: 'Update content...',
  images: ['/img1.jpg'],
  visibility: 'public', // or 'supporters-only'
  creatorId: 'creator_id'
}

Response: {
  success: true,
  update: { ... }
}
```

#### Get Supporters:
```javascript
GET /api/campaigns/{campaignId}/supporters?page=1&limit=20

Response: {
  success: true,
  supporters: [ ... ],
  topSupporters: [ ... ],
  hasMore: true,
  total: 100,
  page: 1
}
```

#### Get Comments:
```javascript
GET /api/campaigns/{campaignId}/comments?sort=newest

Response: {
  success: true,
  comments: [
    {
      _id: 'comment_id',
      content: 'Great campaign!',
      user: { name: 'User', profilepic: '...' },
      likes: 5,
      pinned: false,
      replies: [ ... ],
      createdAt: '2026-01-24'
    }
  ]
}
```

#### Create Comment:
```javascript
POST /api/campaigns/{campaignId}/comments
Body: {
  content: 'My comment...',
  parentComment: 'parent_id' // optional for replies
}

Response: {
  success: true,
  comment: { ... }
}
```

#### Like Update:
```javascript
POST /api/campaigns/updates/{updateId}/like

Response: {
  success: true,
  likes: 10
}
```

#### Like Comment:
```javascript
POST /api/campaigns/comments/{commentId}/like

Response: {
  success: true,
  likes: 5
}
```

#### Pin Comment:
```javascript
POST /api/campaigns/comments/{commentId}/pin

Response: {
  success: true,
  pinned: true
}
```

#### Delete Comment:
```javascript
DELETE /api/campaigns/comments/{commentId}

Response: {
  success: true,
  message: 'Comment deleted successfully'
}
```

#### Report Comment:
```javascript
POST /api/campaigns/comments/{commentId}/report

Response: {
  success: true,
  message: 'Comment reported successfully'
}
```

---

### Subscription APIs

#### List Subscriptions:
```javascript
GET /api/subscription/list

Response: {
  success: true,
  subscriptions: [
    {
      _id: 'sub_id',
      campaign: { title: '...' },
      creator: { username: '...', name: '...' },
      amount: 1000,
      frequency: 'monthly',
      status: 'active',
      nextBillingDate: '2026-02-24',
      startDate: '2026-01-24'
    }
  ]
}
```

#### Pause Subscription:
```javascript
POST /api/subscription/pause
Body: { subscriptionId: 'sub_id' }

Response: {
  success: true,
  message: 'Subscription paused successfully'
}
```

#### Resume Subscription:
```javascript
POST /api/subscription/resume
Body: { subscriptionId: 'sub_id' }

Response: {
  success: true,
  message: 'Subscription resumed successfully'
}
```

#### Cancel Subscription:
```javascript
POST /api/subscription/cancel
Body: { subscriptionId: 'sub_id' }

Response: {
  success: true,
  message: 'Subscription cancelled successfully'
}
```

#### Update Subscription:
```javascript
POST /api/subscription/update
Body: { 
  subscriptionId: 'sub_id',
  amount: 2000
}

Response: {
  success: true,
  message: 'Subscription amount updated successfully',
  subscription: { ... }
}
```

---

### Follow API

```javascript
POST /api/follow
Body: {
  username: 'creator',
  action: 'follow' // or 'unfollow'
}

Response: {
  success: true,
  action: 'follow',
  message: 'Successfully followed creator'
}
```

---

## 🔐 Authentication

Most APIs require authentication. Include session in requests:

```javascript
import { getServerSession } from 'next-auth';

const session = await getServerSession();
if (!session) {
  return redirect('/login');
}
```

---

## 🎨 Styling

All components use CSS-in-JS (styled-jsx). To customize:

```javascript
<style jsx>{`
  .your-class {
    /* Your custom styles */
  }
`}</style>
```

---

## 🔔 Notifications

Notifications are created automatically for:
- New support received
- New subscription
- Subscription cancelled
- Payment success/failure

---

## 📱 Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 640px) { }

/* Tablet */
@media (max-width: 768px) { }

/* Desktop */
@media (max-width: 1024px) { }

/* Large Desktop */
@media (max-width: 1200px) { }
```

---

## ⚡ Performance Tips

1. **Use pagination** for large lists
2. **Lazy load images** with Next.js Image component
3. **Debounce search** inputs
4. **Cache API responses** where appropriate
5. **Use React.memo** for expensive components

---

## 🐛 Common Issues & Solutions

### Payment Not Processing:
- Check Razorpay credentials in `.env.local`
- Verify webhook secret is correct
- Check browser console for errors

### Subscription Not Updating:
- Ensure Razorpay subscription ID is valid
- Check user ownership in API
- Verify subscription status in database

### Comments Not Showing:
- Check if campaign ID is correct
- Verify user is authenticated
- Check database connection

---

## 📚 Additional Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)

---

**Last Updated**: 2026-01-24
