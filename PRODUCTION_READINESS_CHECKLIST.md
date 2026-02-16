# 🚀 Production Readiness Checklist - PhonePe Payment API

## ⚠️ Critical Issues to Fix Before Production

### 1. Remove Debug Logging ❌

**Issue:** The code contains debug logging calls to `http://127.0.0.1:7245` which will fail in production.

**Location:** `app/api/payment/phonepe/initiate/route.ts` (multiple lines)

**Action Required:** Remove all `#region agent log` blocks before deploying.

---

### 2. Environment Variables Configuration ✅

**Required Variables for Production in Vercel:**

| Variable | Production Value | Description |
|----------|-----------------|-------------|
| `PHONEPE_CLIENT_ID` | `M2303MNTS7JUM` | Production Client ID |
| `PHONEPE_CLIENT_SECRET` | `c78d7749-d9f7-4f29-b165-f09ead02e7ae` | Production Client Secret |
| `PHONEPE_CLIENT_VERSION` | `1` | Client Version |
| `PHONEPE_ENV` | `PRODUCTION` | **CRITICAL: Must be set to PRODUCTION** |
| `NEXT_PUBLIC_BASE_URL` | `https://urbanuplink.ai` | Production base URL |
| `FIREBASE_ADMIN_*` | (Your Firebase credentials) | Firebase Admin SDK config |

**⚠️ Important:** 
- `PHONEPE_ENV=PRODUCTION` must be set, otherwise it defaults to SANDBOX
- Never commit production credentials to git
- Set these in Vercel Dashboard → Settings → Environment Variables

---

### 3. Redirect URL Configuration ✅

**Current Code:**
```typescript
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
               (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://urbanuplink.ai');
const redirectUrl = `${baseUrl}/payment/success`;
```

**✅ Status:** Correctly configured. Will use:
1. `NEXT_PUBLIC_BASE_URL` if set
2. `VERCEL_URL` if available (auto-set by Vercel)
3. Falls back to `https://urbanuplink.ai`

**Action:** Ensure `NEXT_PUBLIC_BASE_URL=https://urbanuplink.ai` is set in Vercel.

---

### 4. PhonePe Credentials Verification ✅

**Production Credentials (from PHONEPE_SDK_INTEGRATION_SUMMARY.md):**
- Client ID: `M2303MNTS7JUM`
- Client Secret: `c78d7749-d9f7-4f29-b165-f09ead02e7ae`
- Client Version: `1`
- Environment: `PRODUCTION`

**Action:** Verify these credentials are correct in PhonePe Dashboard and match Vercel environment variables.

---

### 5. Error Handling ✅

**Status:** Good error handling is in place:
- ✅ Token validation
- ✅ Amount validation
- ✅ PhonePe SDK error handling
- ✅ Proper HTTP status codes

---

### 6. Security Considerations ✅

**Status:** 
- ✅ Firebase token verification
- ✅ User authentication required
- ✅ Payment records saved to Firestore
- ✅ Transaction IDs generated with UUID

**Action:** Ensure Firebase Admin credentials are secure in Vercel.

---

## 📋 Pre-Deployment Checklist

### Code Changes
- [ ] Remove all debug logging (`#region agent log` blocks)
- [ ] Remove console.log statements (or make them conditional)
- [ ] Verify no hardcoded test credentials
- [ ] Ensure error messages don't expose sensitive info

### Environment Variables (Vercel)
- [ ] `PHONEPE_CLIENT_ID` = Production Client ID
- [ ] `PHONEPE_CLIENT_SECRET` = Production Client Secret
- [ ] `PHONEPE_CLIENT_VERSION` = `1`
- [ ] `PHONEPE_ENV` = `PRODUCTION` ⚠️ **CRITICAL**
- [ ] `NEXT_PUBLIC_BASE_URL` = `https://urbanuplink.ai`
- [ ] All Firebase Admin variables set

### Testing
- [ ] Test on production URL with production token
- [ ] Verify payment URL is generated correctly
- [ ] Test payment flow end-to-end
- [ ] Verify redirect URL works
- [ ] Check Firestore payment records are created

### PhonePe Dashboard
- [ ] Production credentials verified
- [ ] Redirect URL whitelisted: `https://urbanuplink.ai/payment/success`
- [ ] Webhook URL configured (if using webhooks)

### Monitoring
- [ ] Set up error monitoring (e.g., Sentry)
- [ ] Monitor Vercel logs
- [ ] Set up alerts for payment failures

---

## 🧪 Production Testing Steps

### Step 1: Get Production Token
```bash
node get-firebase-token.js customer1@gmail.com Customer123 --prod
```

### Step 2: Test Payment Initiation
**Postman Request:**
- URL: `https://urbanuplink.ai/api/payment/phonepe/initiate`
- Method: POST
- Headers:
  - `Content-Type`: `application/json`
  - `X-Auth-Token`: `[production token]`
- Body:
  ```json
  {
    "amount": 100
  }
  ```

### Step 3: Verify Response
Expected:
```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://mercury.phonepe.com/transact/...",
    "merchantTransactionId": "TXN_...",
    "amount": 100
  }
}
```

### Step 4: Test Payment Flow
1. Open `paymentUrl` in browser
2. Complete payment (use real payment method for production)
3. Verify redirect to `https://urbanuplink.ai/payment/success`
4. Check Firestore for payment record

---

## 🔧 Quick Fixes Needed

### Fix 1: Remove Debug Logging

Remove all lines containing:
```typescript
fetch('http://127.0.0.1:7245/ingest/...')
```

These are debug logging calls that will fail in production.

### Fix 2: Set Production Environment Variable

In Vercel Dashboard:
1. Go to Settings → Environment Variables
2. Add/Update: `PHONEPE_ENV` = `PRODUCTION`
3. Redeploy

---

## ✅ Production Ready Checklist

Before deploying, ensure:

- [ ] All debug logging removed
- [ ] `PHONEPE_ENV=PRODUCTION` set in Vercel
- [ ] Production PhonePe credentials configured
- [ ] `NEXT_PUBLIC_BASE_URL` set correctly
- [ ] Tested on production URL
- [ ] Payment flow verified end-to-end
- [ ] Redirect URL works
- [ ] Error handling tested
- [ ] Monitoring set up

---

## 🚨 Critical: Environment Variable

**MUST SET IN VERCEL:**
```
PHONEPE_ENV=PRODUCTION
```

Without this, the API will use SANDBOX mode even in production!

---

## 📞 Support

If issues occur:
1. Check Vercel logs
2. Verify environment variables
3. Check PhonePe dashboard for API status
4. Verify Firebase credentials
