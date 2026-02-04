# ⚡ QUICK TESTING CHECKLIST

## 🚀 Fast 5-Minute Test

**Open:** http://localhost:3000

---

## ✅ Quick Checks

### 1. Home Page (30 seconds)
- [ ] LiveStatsBar visible with 4 stats
- [ ] Stats animate on load
- [ ] No console errors

### 2. Search (30 seconds)
- [ ] Press `Ctrl+K` (or `Cmd+K`)
- [ ] Modal opens
- [ ] Type "test" - results appear
- [ ] Press `Esc` - modal closes

### 3. About Page (1 minute)
- [ ] Navigate to `/about`
- [ ] See Hero section
- [ ] See Impact Stats (4 cards)
- [ ] See Timeline (5 milestones)
- [ ] See 6 feature cards
- [ ] See Team section
- [ ] See FAQ accordion
- [ ] Click FAQ - expands/collapses

### 4. Notifications (1 minute)
**If logged in:**
- [ ] Bell icon in navbar
- [ ] Click bell - dropdown appears
- [ ] Navigate to `/notifications`
- [ ] Page loads correctly

**If not logged in:**
- [ ] Bell icon not visible (expected)

### 5. Console Check (30 seconds)
- [ ] Press F12
- [ ] No red errors
- [ ] APIs returning data

---

## 🎯 PASS/FAIL

**All checks passed?**
- ✅ YES → Ready for next phase!
- ❌ NO → Check detailed guide in `TESTING-GUIDE.md`

---

## 📝 Quick Test APIs

Open Console (F12) and run:

```javascript
// Quick API test
Promise.all([
  fetch('/api/stats').then(r => r.json()),
  fetch('/api/campaigns/trending').then(r => r.json()),
  fetch('/api/search?q=test').then(r => r.json())
]).then(results => {
  console.log('✅ All APIs working!', results);
}).catch(err => {
  console.error('❌ API Error:', err);
});
```

---

**Expected Result:** All APIs return data, no errors

---

*Quick Test - 5 minutes total*
