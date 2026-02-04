# 🐛 RAZORPAY WEBHOOK CONTENT TYPE FIX

**Date:** January 31, 2026  
**Status:** ✅ **FIXED**

---

## ❌ ERROR

**Error Message:**
```
SyntaxError: Unexpected token 'r', "razorpay_p"... is not valid JSON
at JSON.parse (<anonymous>)
```

**Problem:**
- Webhook was trying to parse all requests as JSON
- Razorpay sends payment verification as **form-encoded data** (`application/x-www-form-urlencoded`)
- Body contains: `razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature`
- `JSON.parse()` failed on form data

---

## ✅ SOLUTION

**Updated webhook to handle both content types:**

1. ✅ **JSON webhooks** - From Razorpay Dashboard (webhook events)
2. ✅ **Form-encoded data** - From frontend (payment verification)
3. ✅ Content-type detection
4. ✅ Proper parsing for each type
5. ✅ Payment signature verification

---

## 📝 IMPLEMENTATION

### **File:** `app/api/razorpay/route.js`

**Before (Only JSON):**
```javascript
// ❌ Crashes on form data
const event = JSON.parse(body);

switch (event.event) {
    case 'payment.captured':
        // Handle event
        break;
}
```

**After (Handles Both):**
```javascript
// Check content type
const contentType = request.headers.get('content-type') || '';

if (contentType.includes('application/json')) {
    // ✅ Razorpay webhook events (JSON)
    const event = JSON.parse(body);
    
    switch (event.event) {
        case 'payment.captured':
            await handlePaymentCaptured(event.payload.payment.entity);
            break;
        // ... other events
    }
    
} else if (contentType.includes('application/x-www-form-urlencoded')) {
    // ✅ Payment verification from frontend (form data)
    const formData = new URLSearchParams(body);
    const razorpay_payment_id = formData.get('razorpay_payment_id');
    const razorpay_order_id = formData.get('razorpay_order_id');
    const razorpay_signature = formData.get('razorpay_signature');
    
    // Verify signature
    const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');
    
    if (razorpay_signature === expectedSignature) {
        // Update payment record
        // Update campaign stats
        // Update creator stats
    }
}
```

---

## 🔧 TWO TYPES OF REQUESTS

### **Type 1: JSON Webhooks (from Razorpay Dashboard)**

**Content-Type:** `application/json`

**Body:**
```json
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_xxxxx",
        "order_id": "order_xxxxx",
        "amount": 50000,
        "status": "captured"
      }
    }
  }
}
```

**Handling:**
- Parse as JSON
- Extract event type
- Call appropriate handler function
- Update database

---

### **Type 2: Form Data (from Frontend)**

**Content-Type:** `application/x-www-form-urlencoded`

**Body:**
```
razorpay_payment_id=pay_xxxxx&razorpay_order_id=order_xxxxx&razorpay_signature=abc123...
```

**Handling:**
- Parse as URLSearchParams
- Extract payment details
- Verify signature
- Update payment record
- Update campaign/creator stats

---

## 🔒 PAYMENT VERIFICATION

### **Signature Verification:**
```javascript
// For form data payments
const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

if (razorpay_signature !== expectedSignature) {
    return NextResponse.json(
        { success: false, message: 'Invalid payment signature' },
        { status: 400 }
    );
}
```

**Security:**
- ✅ Verifies payment authenticity
- ✅ Prevents tampering
- ✅ Uses HMAC-SHA256
- ✅ Logs verification attempts

---

## 📊 PAYMENT FLOW

### **Complete Payment Process:**

```
1. User initiates payment
   ↓
2. Frontend calls Razorpay
   ↓
3. User completes payment
   ↓
4. Razorpay returns to frontend
   ↓
5. Frontend sends verification to /api/razorpay
   Content-Type: application/x-www-form-urlencoded
   Body: razorpay_payment_id, razorpay_order_id, razorpay_signature
   ↓
6. Webhook verifies signature
   ↓
7. Updates payment record (done = true)
   ↓
8. Updates campaign stats (currentAmount, supporters)
   ↓
9. Updates creator stats (totalRaised, totalSupporters)
   ↓
10. Returns success to frontend
```

---

## ✅ FEATURES ADDED

### 1. **Content-Type Detection**
```javascript
const contentType = request.headers.get('content-type') || '';

logger.info('Processing webhook request', {
    contentType,
    bodyLength: body.length
});
```

### 2. **Form Data Parsing**
```javascript
const formData = new URLSearchParams(body);
const razorpay_payment_id = formData.get('razorpay_payment_id');
const razorpay_order_id = formData.get('razorpay_order_id');
const razorpay_signature = formData.get('razorpay_signature');
```

### 3. **Field Validation**
```javascript
if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    logger.warn('Missing required payment verification fields');
    return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
    );
}
```

### 4. **Payment Record Update**
```javascript
const paymentRecord = await Payment.findOne({ oid: razorpay_order_id });

if (paymentRecord && !paymentRecord.done) {
    paymentRecord.paymentId = razorpay_payment_id;
    paymentRecord.status = 'success';
    paymentRecord.done = true;
    await paymentRecord.save();
    
    // Update campaign and creator stats
}
```

### 5. **Comprehensive Logging**
```javascript
logger.info('Processing payment verification', {
    payment_id: razorpay_payment_id,
    order_id: razorpay_order_id,
    hasSignature: !!razorpay_signature
});

logger.info('Payment record updated', {
    order_id: razorpay_order_id,
    payment_id: razorpay_payment_id
});
```

---

## 📈 DATABASE UPDATES

### **Payment Record:**
```javascript
{
  oid: "order_xxxxx",           // Order ID
  paymentId: "pay_xxxxx",        // ✅ Updated
  status: "success",             // ✅ Updated
  done: true,                    // ✅ Updated
  amount: 50000,
  to_user: "username",
  campaign: ObjectId("...")
}
```

### **Campaign Stats:**
```javascript
{
  currentAmount: +50000,         // ✅ Incremented
  stats: {
    supporters: +1               // ✅ Incremented
  }
}
```

### **Creator Stats:**
```javascript
{
  stats: {
    totalRaised: +50000,         // ✅ Incremented
    totalSupporters: +1          // ✅ Incremented
  }
}
```

---

## 🔍 ERROR HANDLING

### **Missing Fields:**
```json
{
  "success": false,
  "message": "Missing required fields"
}
```

### **Invalid Signature:**
```json
{
  "success": false,
  "message": "Invalid payment signature"
}
```

### **Unsupported Content-Type:**
```json
{
  "success": false,
  "message": "Unsupported content type"
}
```

### **Payment Already Processed:**
```
⚠️  Warning: Payment record not found or already processed
```

---

## ✅ TESTING

### **Test 1: JSON Webhook**
```bash
POST /api/razorpay
Content-Type: application/json

{
  "event": "payment.captured",
  "payload": { ... }
}

Expected: ✅ Processes as webhook event
```

### **Test 2: Form Data Payment**
```bash
POST /api/razorpay
Content-Type: application/x-www-form-urlencoded

razorpay_payment_id=pay_xxx&razorpay_order_id=order_xxx&razorpay_signature=abc...

Expected: ✅ Verifies and updates payment
```

### **Test 3: Invalid Signature**
```bash
POST /api/razorpay
Content-Type: application/x-www-form-urlencoded

razorpay_signature=invalid_signature

Expected: ❌ Returns 400 Bad Request
```

### **Test 4: Missing Fields**
```bash
POST /api/razorpay
Content-Type: application/x-www-form-urlencoded

razorpay_payment_id=pay_xxx
# Missing order_id and signature

Expected: ❌ Returns 400 Bad Request
```

---

## 📊 LOGGING OUTPUT

### **Form Data Payment:**
```json
{
  "level": "INFO",
  "component": "RazorpayWebhook",
  "message": "Processing webhook request",
  "contentType": "application/x-www-form-urlencoded",
  "bodyLength": 156
}
{
  "level": "INFO",
  "message": "Processing payment verification",
  "payment_id": "pay_SAWwFbxyIc2i1S",
  "order_id": "order_SAWwFCwVgBJg8e",
  "hasSignature": true
}
{
  "level": "INFO",
  "message": "Payment signature verified successfully"
}
{
  "level": "INFO",
  "message": "Payment record updated",
  "order_id": "order_SAWwFCwVgBJg8e",
  "payment_id": "pay_SAWwFbxyIc2i1S"
}
```

---

## ✅ RESULT

**Webhook is now WORKING for both types!** ✅

The webhook now:
- ✅ Handles JSON webhooks from Razorpay Dashboard
- ✅ Handles form-encoded payment verification
- ✅ Detects content type automatically
- ✅ Verifies payment signatures
- ✅ Updates payment records
- ✅ Updates campaign and creator stats
- ✅ Logs all activity comprehensively
- ✅ Returns helpful error messages

---

## 📚 FILES MODIFIED

1. ✅ `app/api/razorpay/route.js` - Added content-type handling

**Lines Changed:** ~100 lines added/modified

---

## 🎯 SUPPORTED SCENARIOS

| Scenario | Content-Type | Handling | Status |
|----------|--------------|----------|--------|
| Razorpay Webhook | `application/json` | Parse JSON, handle events | ✅ |
| Payment Verification | `application/x-www-form-urlencoded` | Parse form data, verify signature | ✅ |
| Invalid Content-Type | Other | Return error | ✅ |
| Missing Fields | Any | Return error | ✅ |
| Invalid Signature | Any | Return error | ✅ |

---

**Fixed by:** Antigravity AI  
**Date:** January 31, 2026  
**Time:** 20:45 IST  
**Status:** ✅ **COMPLETE**
