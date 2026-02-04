# Phase 4 Testing Checklist

## ✅ Testing Guide for Days 15-17

### Pre-Testing Setup

- [ ] Install dependencies: `npm install razorpay canvas-confetti`
- [ ] Set up `.env.local` with Razorpay credentials
- [ ] Ensure MongoDB is running
- [ ] Create test user accounts (creator and supporter)
- [ ] Create test campaign with all fields populated

---

## Day 15: Campaign Profile Page

### CampaignCover Component
- [ ] Cover image displays correctly
- [ ] Parallax effect works on scroll
- [ ] Gradient overlay is visible
- [ ] Responsive on mobile devices
- [ ] Fallback gradient shows when no image

### ProfileHeader Component
- [ ] Profile picture displays correctly
- [ ] Profile picture overlaps cover image
- [ ] Verification badge shows for verified users
- [ ] Bio expands/collapses correctly
- [ ] Social links open in new tabs
- [ ] Category badge displays
- [ ] Location shows correctly
- [ ] Responsive layout on mobile

### StatsBar Component
- [ ] All 4 stats display correctly
- [ ] Counter animation triggers on scroll
- [ ] Numbers format correctly (K, L, Cr)
- [ ] Responsive grid layout
- [ ] Hover effects work

### ActionButtons Component
- [ ] Support button scrolls to payment section
- [ ] Follow button toggles state
- [ ] Share button opens modal
- [ ] Message button is visible
- [ ] Buttons are responsive on mobile

### CampaignTabs Component
- [ ] All 4 tabs are visible
- [ ] Active tab highlights correctly
- [ ] Tab content switches smoothly
- [ ] Sticky header works on scroll
- [ ] Mobile icons display correctly

### AboutTab Component
- [ ] Progress bar animates correctly
- [ ] Campaign story displays
- [ ] Media gallery shows all images
- [ ] Lightbox opens on image click
- [ ] Lightbox navigation works (prev/next)
- [ ] Milestones section displays
- [ ] Rewards section shows all tiers
- [ ] FAQs are searchable
- [ ] FAQ accordion expands/collapses
- [ ] Video embed works (if present)

### UpdatesTab Component
- [ ] Updates load with pagination
- [ ] Supporter-only updates are locked
- [ ] Like button works
- [ ] Like count updates
- [ ] Load more button works
- [ ] Empty state shows when no updates
- [ ] Update images display correctly

### SupportersTab Component
- [ ] Top 10 supporters show with medals
- [ ] Recent supporters list displays
- [ ] Anonymous supporters show correctly
- [ ] Hidden amounts display as "Hidden"
- [ ] Infinite scroll works
- [ ] Total count is accurate
- [ ] Empty state shows when no supporters

### DiscussionTab Component
- [ ] Comments load correctly
- [ ] Sort options work (newest, top, oldest)
- [ ] Add comment form works
- [ ] Reply functionality works
- [ ] Like comment works
- [ ] Pin comment works (creator only)
- [ ] Delete comment works (owner/creator/admin)
- [ ] Report comment works
- [ ] Login prompt shows for guests
- [ ] Nested replies display correctly

---

## Day 16: Payment System

### PaymentSidebar Component
- [ ] Sidebar is sticky on desktop
- [ ] Bottom sheet works on mobile
- [ ] Form fields auto-fill for logged-in users
- [ ] All form validations work
- [ ] Razorpay modal opens on submit
- [ ] Payment processing indicator shows

### AmountSelector Component
- [ ] Preset buttons select amounts
- [ ] Custom amount input works
- [ ] Minimum ₹10 validation works
- [ ] Selected amount highlights
- [ ] Amount updates in summary

### RewardTierSelector Component
- [ ] All reward tiers display
- [ ] "No reward" option works
- [ ] Sold out tiers are disabled
- [ ] Limited quantity shows correctly
- [ ] Selecting reward updates amount

### PaymentSummary Component
- [ ] Campaign title displays
- [ ] Amount shows correctly
- [ ] Reward tier shows (if selected)
- [ ] Payment type displays
- [ ] Subscription info shows for subscriptions

### Payment Flow
- [ ] Create order API works
- [ ] Razorpay modal opens
- [ ] Test payment succeeds
- [ ] Verify API confirms payment
- [ ] Campaign amount updates
- [ ] Creator stats update
- [ ] Notification is created

### PaymentSuccessModal Component
- [ ] Confetti animation plays
- [ ] Receipt details show correctly
- [ ] Download receipt button works
- [ ] Share button works
- [ ] Support another campaign link works

### PaymentFailureModal Component
- [ ] Error message displays
- [ ] Retry button works
- [ ] Contact support link works
- [ ] Common reasons list shows

### Subscription Payment
- [ ] Subscription plan creates
- [ ] Subscription activates
- [ ] Next billing date calculates correctly
- [ ] Subscription record saves to database

### Webhook Handler
- [ ] payment.captured event works
- [ ] payment.failed event works
- [ ] subscription.activated event works
- [ ] subscription.charged event works
- [ ] subscription.cancelled event works
- [ ] subscription.paused event works
- [ ] subscription.resumed event works
- [ ] Signature verification works

### Campaign Interaction APIs
- [ ] Fetch updates works
- [ ] Create update works
- [ ] Fetch supporters works
- [ ] Fetch comments works
- [ ] Create comment works
- [ ] Like update works
- [ ] Like comment works
- [ ] Pin comment works
- [ ] Delete comment works
- [ ] Report comment works
- [ ] Follow/unfollow works

---

## Day 17: Subscription Management

### SubscriptionCard Component
- [ ] Campaign info displays
- [ ] Amount shows correctly
- [ ] Next billing date shows
- [ ] Status badge displays with correct color
- [ ] Pause button works (active subscriptions)
- [ ] Resume button works (paused subscriptions)
- [ ] Cancel button works
- [ ] Update amount button works
- [ ] Frequency displays correctly

### SubscriptionManager Component
- [ ] All subscriptions load
- [ ] Filter tabs work (all, active, paused, cancelled)
- [ ] Subscription counts are accurate
- [ ] Empty state shows when no subscriptions
- [ ] Update amount modal opens
- [ ] Update amount form validates
- [ ] Update amount submits successfully

### Subscription APIs
- [ ] List subscriptions works
- [ ] Pause subscription works
- [ ] Resume subscription works
- [ ] Cancel subscription works
- [ ] Update subscription works
- [ ] Ownership verification works
- [ ] Razorpay API calls succeed

### /my-contributions Page
- [ ] Page requires authentication
- [ ] Redirects to login if not authenticated
- [ ] SubscriptionManager displays
- [ ] Page is responsive

---

## Security Testing

### Authentication
- [ ] Protected routes redirect to login
- [ ] Session persists across page reloads
- [ ] Logout works correctly

### Authorization
- [ ] Only campaign creator can pin comments
- [ ] Only comment owner can delete own comments
- [ ] Only subscription owner can manage subscriptions
- [ ] Admin can delete any comment

### Payment Security
- [ ] Payment signature verification works
- [ ] Webhook signature verification works
- [ ] Invalid signatures are rejected
- [ ] Amount tampering is prevented

### Input Validation
- [ ] Minimum amounts are enforced
- [ ] Maximum character limits work
- [ ] SQL injection is prevented
- [ ] XSS is prevented

---

## Performance Testing

### Page Load
- [ ] Campaign profile loads in < 3 seconds
- [ ] Images lazy load
- [ ] Components render progressively

### API Response Times
- [ ] APIs respond in < 500ms
- [ ] Pagination works efficiently
- [ ] Database queries are optimized

### Animations
- [ ] Animations are smooth (60fps)
- [ ] No janky scrolling
- [ ] Transitions are fluid

---

## Responsive Testing

### Mobile (320px - 640px)
- [ ] All components are readable
- [ ] Buttons are tappable
- [ ] Forms are usable
- [ ] Navigation works
- [ ] Bottom sheet works

### Tablet (641px - 1024px)
- [ ] Layout adapts correctly
- [ ] Grid columns adjust
- [ ] Sidebar behavior is appropriate

### Desktop (1025px+)
- [ ] Full layout displays
- [ ] Sticky sidebar works
- [ ] Hover effects work

---

## Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## Accessibility Testing

### Keyboard Navigation
- [ ] All interactive elements are focusable
- [ ] Tab order is logical
- [ ] Enter/Space activate buttons
- [ ] Escape closes modals

### Screen Reader
- [ ] ARIA labels are present
- [ ] Alt text on images
- [ ] Form labels are associated
- [ ] Error messages are announced

### Color Contrast
- [ ] Text meets WCAG AA standards
- [ ] Buttons have sufficient contrast
- [ ] Focus indicators are visible

---

## Edge Cases

### Empty States
- [ ] No campaigns
- [ ] No updates
- [ ] No supporters
- [ ] No comments
- [ ] No subscriptions
- [ ] No FAQs
- [ ] No rewards
- [ ] No milestones

### Error States
- [ ] Network error
- [ ] API error
- [ ] Payment failure
- [ ] Invalid data
- [ ] Unauthorized access

### Boundary Cases
- [ ] Very long campaign titles
- [ ] Very long comments
- [ ] Very large amounts
- [ ] Zero supporters
- [ ] Expired campaigns
- [ ] Cancelled subscriptions

---

## Integration Testing

### Payment Flow
1. [ ] Select amount
2. [ ] Select reward
3. [ ] Fill form
4. [ ] Submit payment
5. [ ] Razorpay modal opens
6. [ ] Complete test payment
7. [ ] Verify payment
8. [ ] Success modal shows
9. [ ] Database updates
10. [ ] Notification created

### Subscription Flow
1. [ ] Select subscription
2. [ ] Create subscription
3. [ ] Activate subscription
4. [ ] View in my-contributions
5. [ ] Pause subscription
6. [ ] Resume subscription
7. [ ] Update amount
8. [ ] Cancel subscription

### Comment Flow
1. [ ] Post comment
2. [ ] Like comment
3. [ ] Reply to comment
4. [ ] Pin comment (creator)
5. [ ] Delete comment
6. [ ] Report comment

---

## Regression Testing

After any changes, verify:
- [ ] Existing features still work
- [ ] No new console errors
- [ ] No broken links
- [ ] No styling issues
- [ ] No performance degradation

---

## Production Readiness

- [ ] All environment variables set
- [ ] Razorpay webhook configured
- [ ] Error logging set up
- [ ] Analytics integrated
- [ ] SEO meta tags added
- [ ] Sitemap generated
- [ ] robots.txt configured
- [ ] SSL certificate installed

---

## Sign-off

- [ ] All tests passed
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Accessibility compliant
- [ ] Documentation complete

---

**Testing Completed**: ___________
**Tested By**: ___________
**Sign-off**: ___________
