# 🚀 Deploy PhonePe Payment API to Production

## ⚠️ Critical Steps Before Deployment

### Step 1: Remove Debug Logging

The code contains debug logging that must be removed before production.

**Action:** Remove all lines containing:
```typescript
fetch('http://127.0.0.1:7245/ingest/...')
```

**Quick Fix:** Search for `#region agent log` and remove those entire blocks.

---

### Step 2: Configure Vercel Environment Variables

Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

Add/Update these variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `PHONEPE_CLIENT_ID` | `M2303MNTS7JUM` | Production |
| `PHONEPE_CLIENT_SECRET` | `c78d7749-d9f7-4f29-b165-f09ead02e7ae` | Production |
| `PHONEPE_CLIENT_VERSION` | `1` | Production |
| `PHONEPE_ENV` | `PRODUCTION` | Production ⚠️ **CRITICAL** |
| `NEXT_PUBLIC_BASE_URL` | `https://urbanuplink.ai` | Production |
| `FIREBASE_ADMIN_*` | (Your Firebase credentials) | Production |

**⚠️ IMPORTANT:** 
- `PHONEPE_ENV=PRODUCTION` must be set, otherwise API uses SANDBOX mode
- Set these for **Production** environment only
- Never commit these to git

---

### Step 3: Verify PhonePe Dashboard Settings

1. **Login to PhonePe Dashboard**
2. **Check Production Credentials:**
   - Client ID: `M2303MNTS7JUM`
   - Client Secret: `c78d7749-d9f7-4f29-b165-f09ead02e7ae`
3. **Whitelist Redirect URL:**
   - Add: `https://urbanuplink.ai/payment/success`
4. **Verify Webhook URL** (if using webhooks):
   - Add: `https://urbanuplink.ai/api/payment/phonepe/webhook`

---

### Step 4: Test Before Deploying

Run production test:
```bash
node test-production-api.js customer1@gmail.com Customer123 100
```

**Expected Output:**
- ✅ Login successful
- ✅ Payment URL generated
- ✅ URL should be `mercury.phonepe.com` (production), NOT `mercury-uat.phonepe.com` (sandbox)

---

## 🚀 Deployment Steps

### Option 1: Deploy via Vercel CLI

```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Option 2: Deploy via Vercel Dashboard

1. **Push code to Git** (GitHub/GitLab/Bitbucket)
2. **Vercel will auto-deploy** if connected
3. **Or manually trigger** deployment from Vercel Dashboard

---

## ✅ Post-Deployment Verification

### 1. Test Payment Initiation

```bash
node test-production-api.js customer1@gmail.com Customer123 100
```

**Check:**
- ✅ Response status: 200 OK
- ✅ Payment URL is production (`mercury.phonepe.com`)
- ✅ Transaction ID generated

### 2. Test Payment Flow

1. **Copy payment URL** from API response
2. **Open in browser**
3. **Complete payment** (use real payment method)
4. **Verify redirect** to `https://urbanuplink.ai/payment/success`

### 3. Check Firestore

Verify payment record is created:
- Collection: `payments`
- Document ID: `TXN_...` (from response)
- Fields: `status`, `amount`, `userId`, `environment: 'production'`

### 4. Monitor Logs

- **Vercel Dashboard** → Deployments → View Logs
- Check for errors
- Verify environment variables are loaded

---

## 🐛 Troubleshooting

### Issue: Payment URL is SANDBOX (mercury-uat.phonepe.com)

**Cause:** `PHONEPE_ENV` is not set to `PRODUCTION`

**Fix:**
1. Go to Vercel → Settings → Environment Variables
2. Set `PHONEPE_ENV` = `PRODUCTION`
3. Redeploy

### Issue: "PhonePe payment gateway is not configured"

**Cause:** Missing environment variables

**Fix:**
1. Check Vercel environment variables
2. Ensure `PHONEPE_CLIENT_ID` and `PHONEPE_CLIENT_SECRET` are set
3. Redeploy

### Issue: "Token expired"

**Cause:** Firebase token expired

**Fix:**
```bash
node get-firebase-token.js customer1@gmail.com Customer123 --prod
```
Update token in Postman/script

### Issue: Redirect URL not working

**Cause:** URL not whitelisted in PhonePe dashboard

**Fix:**
1. Login to PhonePe Dashboard
2. Add `https://urbanuplink.ai/payment/success` to whitelist
3. Wait a few minutes for changes to propagate

---

## 📋 Pre-Deployment Checklist

- [ ] Debug logging removed
- [ ] `PHONEPE_ENV=PRODUCTION` set in Vercel
- [ ] Production PhonePe credentials configured
- [ ] `NEXT_PUBLIC_BASE_URL` set to `https://urbanuplink.ai`
- [ ] Redirect URL whitelisted in PhonePe dashboard
- [ ] Tested with `test-production-api.js`
- [ ] Payment URL is production (not sandbox)
- [ ] Payment flow tested end-to-end
- [ ] Firestore records verified
- [ ] Error monitoring set up

---

## 🎯 Quick Deployment Command

```bash
# 1. Test production API
node test-production-api.js customer1@gmail.com Customer123 100

# 2. If test passes, deploy
vercel --prod

# 3. Verify after deployment
node test-production-api.js customer1@gmail.com Customer123 100
```

---

## 📞 Support

If issues occur:
1. Check `PRODUCTION_READINESS_CHECKLIST.md`
2. Review Vercel logs
3. Verify environment variables
4. Check PhonePe dashboard

---

**Ready to deploy?** Follow the checklist above! 🚀
