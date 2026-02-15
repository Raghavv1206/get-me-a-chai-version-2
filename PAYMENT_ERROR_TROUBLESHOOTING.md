# Payment Error Troubleshooting Guide

## Current Error
**Error:** "Failed to initiate payment. Please try again or contact support."

## Common Causes & Solutions

### 1. Missing Razorpay Credentials ⚠️

**Check if the creator has configured Razorpay credentials:**

1. Log in as the creator (`democreator` in this case)
2. Go to **Dashboard → Settings**
3. Scroll to the **Payment Settings** section
4. Check if **Razorpay Key ID** and **Razorpay Secret** are filled

**Solution:**
- If empty, add your Razorpay test credentials:
  - Get them from: https://dashboard.razorpay.com/app/keys
  - Use **Test Mode** keys for testing
  - Format: `rzp_test_xxxxxxxxxxxxx` (Key ID)

### 2. Invalid Razorpay Credentials ❌

**Check if credentials are valid:**
- Razorpay Key ID should start with `rzp_test_` (test mode) or `rzp_live_` (live mode)
- Both Key ID and Secret must be from the same mode (test/live)
- Credentials must not have extra spaces or characters

**Solution:**
- Re-copy credentials from Razorpay dashboard
- Ensure you're using **Test Mode** credentials for development
- Save the settings again

### 3. Environment Variables Not Set 🔧

**Check your `.env.local` file:**

```env
# Required for fallback if creator hasn't configured their own
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

**Solution:**
- Create `.env.local` if it doesn't exist
- Add the above variables with your Razorpay credentials
- Restart the dev server: `npm run dev`

### 4. Database Connection Issue 🗄️

**Check MongoDB connection:**
- Look for "MongoDB Connected: localhost" in console
- Ensure MongoDB is running locally

**Solution:**
```bash
# Start MongoDB (if using local installation)
mongod

# Or check if MongoDB service is running
```

## Testing Steps

### Step 1: Check Logs
With the enhanced logging I just added, try the payment again and look for these log messages:

1. ✅ `"Initiating payment"` - Payment request received
2. ✅ `"Creating Razorpay instance"` - Credentials found
3. ✅ `"Creating Razorpay order"` - About to create order
4. ✅ `"Razorpay order created"` - Order created successfully

**If it stops before "Razorpay order created"**, the error is in the Razorpay API call.

### Step 2: Verify Creator Account
```javascript
// Check in MongoDB or your database
db.users.findOne({ username: "democreator" })

// Should have:
{
  username: "democreator",
  razorpayid: "rzp_test_xxxxx",  // Should not be empty
  razorpaysecret: "xxxxx"         // Should not be empty
}
```

### Step 3: Test with Different Amount
Try with a simple amount like ₹100 (10000 paise) to rule out amount validation issues.

### Step 4: Check Razorpay Dashboard
1. Go to https://dashboard.razorpay.com/
2. Check if API keys are active
3. Verify test mode is enabled
4. Check for any IP restrictions or security settings

## Quick Fix Checklist

- [ ] Creator has Razorpay credentials configured in dashboard settings
- [ ] Credentials are valid test mode keys (start with `rzp_test_`)
- [ ] `.env.local` has fallback Razorpay credentials
- [ ] MongoDB is connected
- [ ] Dev server restarted after adding credentials
- [ ] Using test mode credentials (not live mode)
- [ ] No extra spaces in credentials
- [ ] Internet connection is working (for Razorpay API)

## Next Steps

1. **Try the payment again** - The enhanced logging will show exactly where it fails
2. **Check the console** - Look for the new detailed log messages
3. **Copy the full error** - Share the complete error with stack trace if issue persists

## Example: Setting Up Test Credentials

### For Creator (in Dashboard Settings):
```
Razorpay Key ID: rzp_test_1234567890abcd
Razorpay Secret: secret_1234567890abcd
```

### For Global Fallback (in .env.local):
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_1234567890abcd
RAZORPAY_KEY_SECRET=secret_1234567890abcd
RAZORPAY_WEBHOOK_SECRET=webhook_secret_here
```

## Still Having Issues?

If the error persists after checking all the above:

1. **Check the new detailed logs** in the console
2. **Look for the specific error message** in the enhanced error logging
3. **Share the complete error** including:
   - The full error message
   - The log messages before the error
   - Whether you see "Creating Razorpay instance" or "Creating Razorpay order"

---

**Note:** The enhanced logging I just added will help pinpoint the exact issue. Try the payment again and check the console for detailed error information.
