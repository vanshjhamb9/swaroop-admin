# 🔧 Fix: "Client Not Found" Error

## The Error

```
Error: Failed to initiate payment
Details: Not Found: Client Not Found, trackingId: 024516f545a9d8aa
```

## 🔍 What This Means

PhonePe API cannot find the client credentials. This happens when:
1. **Wrong environment**: Using PRODUCTION credentials in SANDBOX mode (or vice versa)
2. **Invalid credentials**: Credentials don't match what's in PhonePe dashboard
3. **Account not activated**: Production account not activated/approved
4. **Environment variable mismatch**: `PHONEPE_ENV` doesn't match the credentials

---

## ✅ Solution 1: Use SANDBOX Mode (Recommended for Testing)

If you're testing, use SANDBOX mode instead of PRODUCTION.

### Step 1: Update Vercel Environment Variables

Go to **Vercel Dashboard** → Settings → Environment Variables:

**Remove or change:**
- `PHONEPE_ENV` → Remove it OR set to `SANDBOX` (or anything except `PRODUCTION`)

**Set SANDBOX credentials:**
- `PHONEPE_CLIENT_ID` = `M2303MNTS7JUM_2602011428`
- `PHONEPE_CLIENT_SECRET` = `ZGUzYzAxMjgtZjA4Zi00Y2E0LTkwMjItZTkzMTc2ZWNjN2Rj`
- `PHONEPE_CLIENT_VERSION` = `1`

### Step 2: Redeploy

After updating environment variables, redeploy:
- Vercel will auto-redeploy, OR
- Manually trigger deployment

### Step 3: Test Again

```bash
node test-production-api.js customer1@gmail.com Customer123 100
```

**Expected:** Payment URL should be `mercury-uat.phonepe.com` (SANDBOX)

---

## ✅ Solution 2: Fix Production Credentials

If you need PRODUCTION mode, verify your credentials.

### Step 1: Verify PhonePe Dashboard

1. **Login to PhonePe Dashboard**
2. **Check Production Credentials:**
   - Client ID: Should match `M2303MNTS7JUM`
   - Client Secret: Should match `c78d7749-d9f7-4f29-b165-f09ead02e7ae`
3. **Check Account Status:**
   - Is production account activated?
   - Is it approved/verified?
   - Any pending approvals?

### Step 2: Update Vercel Environment Variables

Ensure these are set correctly:

```
PHONEPE_CLIENT_ID=M2303MNTS7JUM
PHONEPE_CLIENT_SECRET=c78d7749-d9f7-4f29-b165-f09ead02e7ae
PHONEPE_CLIENT_VERSION=1
PHONEPE_ENV=PRODUCTION
```

### Step 3: Redeploy and Test

```bash
node test-production-api.js customer1@gmail.com Customer123 100
```

---

## 🔍 Diagnostic Script

Run this to get detailed diagnosis:

```bash
node diagnose-phonepe-config.js
```

This will:
- Check API accessibility
- Test with valid token
- Show detailed error analysis
- Provide specific solutions

---

## 📋 Quick Checklist

**For SANDBOX (Testing):**
- [ ] `PHONEPE_ENV` is NOT set to `PRODUCTION` (or removed)
- [ ] `PHONEPE_CLIENT_ID` = `M2303MNTS7JUM_2602011428`
- [ ] `PHONEPE_CLIENT_SECRET` = `ZGUzYzAxMjgtZjA4Zi00Y2E0LTkwMjItZTkzMTc2ZWNjN2Rj`
- [ ] Redeployed

**For PRODUCTION:**
- [ ] `PHONEPE_ENV` = `PRODUCTION`
- [ ] `PHONEPE_CLIENT_ID` = `M2303MNTS7JUM`
- [ ] `PHONEPE_CLIENT_SECRET` = `c78d7749-d9f7-4f29-b165-f09ead02e7ae`
- [ ] Credentials verified in PhonePe dashboard
- [ ] Account activated for production
- [ ] Redeployed

---

## ⚠️ Common Mistakes

1. **Mixing credentials:**
   - ❌ Using SANDBOX Client ID with `PHONEPE_ENV=PRODUCTION`
   - ❌ Using PRODUCTION Client ID without `PHONEPE_ENV=PRODUCTION`

2. **Wrong environment variable:**
   - ❌ `PHONEPE_ENV=PRODUCTION` but credentials are SANDBOX
   - ✅ Match environment with credentials

3. **Typo in credentials:**
   - ❌ Extra spaces or characters
   - ✅ Copy exactly from PhonePe dashboard

---

## 🎯 Recommended Action

**For now, use SANDBOX mode** (Solution 1) since you're testing:

1. Remove `PHONEPE_ENV=PRODUCTION` from Vercel
2. Set SANDBOX credentials
3. Redeploy
4. Test again

Once PhonePe production account is fully activated and verified, switch to PRODUCTION mode.

---

**Run diagnostic:** `node diagnose-phonepe-config.js`
