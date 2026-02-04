# 🧪 TESTING GUIDE - Get Me A Chai

**Quick reference for testing all features**

---

## 🚀 GETTING STARTED

### 1. Start the Server
```bash
cd c:\Users\ragha\project\get-me-a-chai
npm run dev
```

### 2. Open Browser
```
http://localhost:3000
```

### 3. Login
Use demo account:
- Email: `demo@advision.com`
- Password: `demo123`

Or create a new account.

---

## ✅ TEST CHECKLIST

### 1. Authentication (5 min)
- [ ] Sign up with new account
- [ ] Login with credentials
- [ ] Login with Google (if configured)
- [ ] Login with GitHub (if configured)
- [ ] Login with demo account
- [ ] Logout

**Expected:** All auth methods work, redirects to dashboard

---

### 2. Campaign Creation (10 min)

#### Navigate to:
```
/dashboard/campaign/new
```

#### Test Steps:
- [ ] **Step 1: Basic Info**
  - Fill category, goal, duration, location
  - Click "Next"
  
- [ ] **Step 2: AI Story**
  - Enter brief description (min 20 chars)
  - Click "Generate with AI"
  - Wait for streaming response
  - Edit generated story
  - Click "Next"
  
- [ ] **Step 3: Milestones**
  - Review AI-generated milestones
  - Add/edit/remove milestones
  - Click "Next"
  
- [ ] **Step 4: Rewards**
  - Review AI-generated rewards
  - Add/edit/remove rewards
  - Click "Next"
  
- [ ] **Step 5: Media**
  - Upload cover image
  - Add gallery images (optional)
  - Add video URL (optional)
  - Click "Next"
  
- [ ] **Step 6: FAQs**
  - Review AI-generated FAQs
  - Add custom FAQs
  - Click "Next"
  
- [ ] **Step 7: Preview**
  - Review campaign quality score
  - Read AI insights
  - Click "Save as Draft" OR "Publish"

**Expected:** Campaign created successfully, redirects to campaigns list

---

### 3. Campaign Management (5 min)

#### Navigate to:
```
/dashboard/campaigns
```

#### Test Steps:
- [ ] View list of campaigns
- [ ] Filter by status (All, Active, Draft, Paused)
- [ ] Click "Edit" on a campaign
- [ ] Make changes and save
- [ ] Click "Duplicate" on a campaign
- [ ] Click "Delete" on a draft campaign
- [ ] Try to delete a funded campaign (should fail)

**Expected:** All CRUD operations work correctly

---

### 4. Analytics Dashboard (5 min)

#### Navigate to:
```
/dashboard/analytics
```

#### Test Steps:
- [ ] View overview cards (views, clicks, conversions, revenue)
- [ ] Check AI insights panel
- [ ] View visitor chart
- [ ] Check traffic sources pie chart
- [ ] View device breakdown
- [ ] Check conversion funnel
- [ ] View revenue chart
- [ ] Try export reports

**Expected:** All charts display (may be empty if no data)

---

### 5. Content Management (5 min)

#### Navigate to:
```
/dashboard/content
```

#### Test Steps:
- [ ] Click "Create New Update"
- [ ] Select campaign
- [ ] Enter title and content
- [ ] Choose visibility (Public/Supporters Only)
- [ ] Click "Save as Draft"
- [ ] Edit the draft
- [ ] Click "Publish Now"
- [ ] Create another update
- [ ] Click "Schedule for Later"
- [ ] Select future date/time
- [ ] Confirm schedule

**Expected:** Updates created, published, and scheduled successfully

---

### 6. Supporter Management (5 min)

#### Navigate to:
```
/dashboard/supporters
```

#### Test Steps:
- [ ] View top supporters leaderboard
- [ ] View supporters table
- [ ] Use filters (date range, amount, campaign)
- [ ] Search for a supporter
- [ ] Select multiple supporters
- [ ] Click "Send Thank You Email"
- [ ] Choose template
- [ ] Send email

**Expected:** Supporters list displays, filtering works, emails sent

---

### 7. Settings (5 min)

#### Navigate to:
```
/dashboard/settings
```

#### Test Steps:
- [ ] Update profile information
- [ ] Change username
- [ ] Update bio
- [ ] Upload profile picture
- [ ] Upload cover picture
- [ ] Configure notification preferences
- [ ] Add Razorpay credentials
- [ ] Save changes

**Expected:** All settings save successfully

---

### 8. Payment Flow (10 min)

#### Navigate to a campaign:
```
/democreator
```
(or your campaign slug)

#### Test Steps:
- [ ] View campaign page
- [ ] Click "Support this Campaign"
- [ ] Enter name and email
- [ ] Enter message (optional)
- [ ] Select amount (preset or custom)
- [ ] Select reward tier (optional)
- [ ] Choose payment type (one-time/subscription)
- [ ] Check privacy options (anonymous, hide amount)
- [ ] Click "Pay"
- [ ] Complete Razorpay payment (test mode)
- [ ] Verify success message
- [ ] Check notification received

**Expected:** Payment completes, notification sent, analytics tracked

---

### 9. Notifications (5 min)

#### Test Steps:
- [ ] Click notification bell in navbar
- [ ] View notification dropdown
- [ ] Click "View All"
- [ ] Navigate to `/notifications`
- [ ] View all notifications
- [ ] Filter by type
- [ ] Filter by read/unread
- [ ] Mark one as read
- [ ] Mark all as read
- [ ] Delete a notification

**Expected:** Notifications display, filtering works, actions work

---

### 10. AI Features (10 min)

#### Test AI Chat:
- [ ] Click chatbot widget (bottom-right)
- [ ] Type "How do I create a campaign?"
- [ ] Verify AI responds
- [ ] Ask follow-up question
- [ ] Test suggested actions
- [ ] Close chatbot

#### Test AI Recommendations:
- [ ] Go to home page (logged in)
- [ ] View "Recommended For You" section
- [ ] Click "Refresh" for new recommendations
- [ ] Click on a recommended campaign

#### Test AI Search:
- [ ] Click search icon in navbar
- [ ] Type search query
- [ ] View AI-powered results
- [ ] Click on a result

**Expected:** All AI features respond correctly

---

## 🐛 COMMON ISSUES & FIXES

### Issue: "OPENROUTER_API_KEY not configured"
**Fix:** Add to `.env.local`:
```
OPENROUTER_API_KEY=your_key_here
```

### Issue: "MongoDB connection failed"
**Fix:** Check `MONGODB_URI` in `.env.local`

### Issue: "NextAuth error"
**Fix:** Verify all NextAuth env vars are set:
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret
GOOGLE_ID=...
GOOGLE_SECRET=...
GITHUB_ID=...
GITHUB_SECRET=...
```

### Issue: "Razorpay payment fails"
**Fix:** Add Razorpay credentials in settings:
```
RAZORPAY_KEY_ID=...
RAZORPAY_SECRET=...
```

### Issue: "Component not found"
**Fix:** Check if component file exists in `/components`

### Issue: "Server action fails"
**Fix:** Check console for error, verify authentication

---

## 📊 EXPECTED RESULTS

### After Testing, You Should Have:
- ✅ 1-3 test campaigns created
- ✅ 1-2 test payments made
- ✅ 2-3 campaign updates published
- ✅ 5-10 notifications received
- ✅ Analytics data showing visits/clicks
- ✅ Supporters in the list
- ✅ AI chat history
- ✅ Settings configured

---

## 🔍 DEBUGGING TIPS

### Check Browser Console
```
F12 → Console tab
```
Look for:
- API errors (red)
- Network failures
- JavaScript errors

### Check Server Logs
```
Terminal running npm run dev
```
Look for:
- MongoDB connection status
- API route errors
- Server action errors

### Check Network Tab
```
F12 → Network tab
```
Look for:
- Failed API requests (red)
- Slow requests (yellow)
- Response status codes

---

## ✅ SUCCESS CRITERIA

### All Tests Pass If:
- ✅ No console errors
- ✅ All pages load correctly
- ✅ All forms submit successfully
- ✅ AI features respond
- ✅ Payments process
- ✅ Notifications appear
- ✅ Analytics track
- ✅ Data persists in database

---

## 📝 REPORTING BUGS

### If You Find a Bug:

1. **Note the steps to reproduce**
2. **Check console for errors**
3. **Take a screenshot**
4. **Note which file/component**
5. **Try to fix it yourself** (all code is documented)

### Common Fixes:
- Missing import → Add import statement
- Undefined variable → Check spelling
- API error → Check server action
- Database error → Check model/connection

---

## 🎯 PERFORMANCE BENCHMARKS

### Expected Load Times:
- Home page: < 2s
- Dashboard: < 1s
- Campaign page: < 1.5s
- AI generation: 3-10s (streaming)
- Payment: < 3s
- Analytics: < 2s

### If Slower:
- Check database queries
- Optimize images
- Add caching
- Check network speed

---

## 🚀 NEXT STEPS AFTER TESTING

### If All Tests Pass:
1. ✅ Mark features as verified
2. ✅ Document any issues found
3. ✅ Fix critical bugs
4. ✅ Polish UI/UX
5. ✅ Prepare for deployment

### If Tests Fail:
1. ⚠️ Note which tests failed
2. ⚠️ Check error messages
3. ⚠️ Review relevant code
4. ⚠️ Fix issues
5. ⚠️ Re-test

---

## 📞 NEED HELP?

### Check These Files:
- `FINAL_STATUS.md` - Overall status
- `IMPLEMENTATION_COMPLETE.md` - What's done
- `ACTUAL_REMAINING_TASKS.md` - What's left
- Server action files in `/actions`
- Component files in `/components`

### All code includes:
- ✅ Comments explaining logic
- ✅ Error handling
- ✅ Validation
- ✅ Type hints (where applicable)

---

**Happy Testing! 🎉**

Remember: Most features are already implemented and working. This is just verification!
