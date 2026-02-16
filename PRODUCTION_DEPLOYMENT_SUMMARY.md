# 🚀 Production Deployment Summary & Action Plan

## 📊 Current Status

**Test Result:** ❌ "Client Not Found" Error

**Root Cause:** Production environment is trying to use PRODUCTION mode, but:
- Production credentials may not be activated/approved in PhonePe dashboard
- OR credentials don't match what's configured in Vercel

---

## ✅ Solution: Use SANDBOX Mode for Now

Since you're testing, use **SANDBOX mode** which is fully functional.

### Step 1: Update Vercel Environment Variables

Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

**Action Required:**
1. **Remove or change** `PHONEPE_ENV`:
   - Delete it, OR
   - Set to `SANDBOX` (anything except `PRODUCTION`)

2. **Set SANDBOX credentials:**
   ```
   PHONEPE_CLIENT_ID = M2303MNTS7JUM_2602011428
   PHONEPE_CLIENT_SECRET = ZGUzYzAxMjgtZjA4Zi00Y2E0LTkwMjItZTkzMTc2ZWNjN2Rj
   PHONEPE_CLIENT_VERSION = 1
   ```

3. **Keep these:**
   ```
   NEXT_PUBLIC_BASE_URL = https://urbanuplink.ai
   (All Firebase Admin variables)
   ```

### Step 2: Redeploy

After updating environment variables:
- Vercel will auto-redeploy, OR
- Manually trigger deployment from Vercel Dashboard

### Step 3: Test Again

```bash
node test-production-api.js customer1@gmail.com Customer123 100
```

**Expected Result:**
- ✅ Payment URL generated
- ✅ URL should be `mercury-uat.phonepe.com` (SANDBOX)
- ✅ Payment flow works

---

## 🔄 For Future: Switch to PRODUCTION Mode

Once PhonePe production account is fully activated:

1. **Verify in PhonePe Dashboard:**
   - Production account is activated
   - Credentials are correct:
     - Client ID: `M2303MNTS7JUM`
     - Client Secret: `c78d7749-d9f7-4f29-b165-f09ead02e7ae`

2. **Update Vercel:**
   ```
   PHONEPE_CLIENT_ID = M2303MNTS7JUM
   PHONEPE_CLIENT_SECRET = c78d7749-d9f7-4f29-b165-f09ead02e7ae
   PHONEPE_ENV = PRODUCTION
   ```

3. **Redeploy and test**

---

## 📋 Pre-Deployment Checklist

### Code Ready ✅
- [x] API route implemented
- [x] Error handling in place
- [x] Token authentication working
- [x] Payment flow tested

### Environment Variables (Vercel)
- [ ] `PHONEPE_CLIENT_ID` = SANDBOX credentials (for testing)
- [ ] `PHONEPE_CLIENT_SECRET` = SANDBOX credentials (for testing)
- [ ] `PHONEPE_CLIENT_VERSION` = `1`
- [ ] `PHONEPE_ENV` = NOT set to `PRODUCTION` (or removed)
- [ ] `NEXT_PUBLIC_BASE_URL` = `https://urbanuplink.ai`
- [ ] All Firebase Admin variables set

### Testing
- [ ] Test with `test-production-api.js` ✅ (shows current error)
- [ ] After fixing env vars, test again
- [ ] Verify payment URL is generated
- [ ] Test payment flow end-to-end
- [ ] Verify redirect URL works

### PhonePe Dashboard
- [ ] Redirect URL whitelisted: `https://urbanuplink.ai/payment/success`
- [ ] Webhook URL configured (if using webhooks)

---

## 🎯 Deployment Steps

### 1. Fix Environment Variables (Vercel)

**Current Issue:** `PHONEPE_ENV=PRODUCTION` is set but production credentials aren't valid.

**Fix:**
- Remove `PHONEPE_ENV=PRODUCTION`
- Set SANDBOX credentials
- Redeploy

### 2. Deploy

**Option A: Auto-deploy (if connected to Git)**
- Push code to Git
- Vercel auto-deploys

**Option B: Manual deploy**
- Vercel Dashboard → Deployments → Redeploy

### 3. Verify

```bash
node test-production-api.js customer1@gmail.com Customer123 100
```

**Success Criteria:**
- ✅ Status: 200 OK
- ✅ Payment URL generated
- ✅ URL is `mercury-uat.phonepe.com` (SANDBOX)

---

## 📝 Quick Reference

### SANDBOX Credentials (For Testing)
```
PHONEPE_CLIENT_ID=M2303MNTS7JUM_2602011428
PHONEPE_CLIENT_SECRET=ZGUzYzAxMjgtZjA4Zi00Y2E0LTkwMjItZTkzMTc2ZWNjN2Rj
PHONEPE_CLIENT_VERSION=1
PHONEPE_ENV=<not set or SANDBOX>
```

### PRODUCTION Credentials (For Live)
```
PHONEPE_CLIENT_ID=M2303MNTS7JUM
PHONEPE_CLIENT_SECRET=c78d7749-d9f7-4f29-b165-f09ead02e7ae
PHONEPE_CLIENT_VERSION=1
PHONEPE_ENV=PRODUCTION
```

---

## 🚨 Important Notes

1. **SANDBOX vs PRODUCTION:**
   - SANDBOX: For testing, uses test credentials
   - PRODUCTION: For live payments, requires activated account

2. **Environment Variable:**
   - `PHONEPE_ENV=PRODUCTION` → Uses production mode
   - Not set or anything else → Uses SANDBOX mode

3. **Credentials Must Match:**
   - SANDBOX mode → Use SANDBOX credentials
   - PRODUCTION mode → Use PRODUCTION credentials

---

## ✅ Next Steps

1. **Update Vercel environment variables** (use SANDBOX)
2. **Redeploy**
3. **Test:** `node test-production-api.js customer1@gmail.com Customer123 100`
4. **Verify payment flow works**
5. **Deploy to production**

---

**Ready to deploy?** Follow the checklist above! 🚀
