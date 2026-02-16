# 🚀 Final Deployment Steps - PhonePe Payment API

## ⚡ Quick Action Plan

### Step 1: Fix Vercel Environment Variables (5 minutes)

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Click **Settings** → **Environment Variables**

2. **Update/Add these variables:**

   **For SANDBOX (Testing):**
   ```
   PHONEPE_CLIENT_ID = M2303MNTS7JUM_2602011428
   PHONEPE_CLIENT_SECRET = ZGUzYzAxMjgtZjA4Zi00Y2E0LTkwMjItZTkzMTc2ZWNjN2Rj
   PHONEPE_CLIENT_VERSION = 1
   ```

   **Important:** 
   - **Remove** `PHONEPE_ENV` if it's set to `PRODUCTION`
   - OR set it to `SANDBOX` (or anything except `PRODUCTION`)

3. **Ensure these are set:**
   ```
   NEXT_PUBLIC_BASE_URL = https://urbanuplink.ai
   (All Firebase Admin variables)
   ```

4. **Save changes**

### Step 2: Redeploy (2 minutes)

- Vercel will auto-redeploy after saving env vars
- OR manually trigger: **Deployments** → **Redeploy**

### Step 3: Test Production API (1 minute)

```bash
node test-production-api.js customer1@gmail.com Customer123 100
```

**Expected Output:**
```
✅ Login successful!
✅ Payment initiated successfully!
🔗 Payment URL: https://mercury-uat.phonepe.com/transact/...
```

**✅ Success if:**
- Status: 200 OK
- Payment URL is generated
- URL contains `mercury-uat.phonepe.com` (SANDBOX)

### Step 4: Test Payment Flow (2 minutes)

1. **Copy payment URL** from test output
2. **Open in browser**
3. **Complete payment** (use test credentials)
4. **Verify redirect** to `https://urbanuplink.ai/payment/success`

---

## ✅ Deployment Checklist

- [ ] Vercel environment variables updated (SANDBOX credentials)
- [ ] `PHONEPE_ENV` removed or set to SANDBOX
- [ ] Redeployed
- [ ] Test script passes
- [ ] Payment URL generated
- [ ] Payment flow tested
- [ ] Redirect URL works

---

## 🎯 What's Ready

✅ **Code:** API route implemented and tested  
✅ **Authentication:** Firebase token verification working  
✅ **Error Handling:** Proper error messages  
✅ **Testing:** Test scripts ready  
✅ **Documentation:** Complete guides created  

---

## 📋 Environment Variables Summary

### Current (SANDBOX for Testing)
```
PHONEPE_CLIENT_ID=M2303MNTS7JUM_2602011428
PHONEPE_CLIENT_SECRET=ZGUzYzAxMjgtZjA4Zi00Y2E0LTkwMjItZTkzMTc2ZWNjN2Rj
PHONEPE_CLIENT_VERSION=1
PHONEPE_ENV=<not set> (defaults to SANDBOX)
NEXT_PUBLIC_BASE_URL=https://urbanuplink.ai
```

---

## 🚀 Deploy Now

1. **Update Vercel env vars** (use SANDBOX)
2. **Redeploy**
3. **Test:** `node test-production-api.js customer1@gmail.com Customer123 100`
4. **Done!** ✅

---

**Total Time:** ~10 minutes  
**Status:** Ready to deploy! 🎉
