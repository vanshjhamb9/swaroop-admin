# ⚡ Quick Start: Test Production API

## 🎯 3-Step Process

### Step 1: Test Production API

```bash
node test-production-api.js customer1@gmail.com Customer123 100
```

This will:
- ✅ Login to production
- ✅ Get fresh token
- ✅ Test PhonePe payment API
- ✅ Show payment URL
- ✅ Warn if using SANDBOX instead of PRODUCTION

### Step 2: Check Results

**✅ Success:**
- Payment URL generated
- URL should be `mercury.phonepe.com` (production)

**❌ If URL is `mercury-uat.phonepe.com` (sandbox):**
- Set `PHONEPE_ENV=PRODUCTION` in Vercel
- Redeploy

### Step 3: Complete Payment Flow

1. Copy payment URL from output
2. Open in browser
3. Complete payment
4. Verify redirect works

---

## 🔧 Before Production Deployment

### Critical: Set Environment Variable

**In Vercel Dashboard:**
1. Settings → Environment Variables
2. Add: `PHONEPE_ENV` = `PRODUCTION`
3. Redeploy

**Without this, API will use SANDBOX mode!**

---

## 📋 Required Vercel Environment Variables

```
PHONEPE_CLIENT_ID=M2303MNTS7JUM
PHONEPE_CLIENT_SECRET=c78d7749-d9f7-4f29-b165-f09ead02e7ae
PHONEPE_CLIENT_VERSION=1
PHONEPE_ENV=PRODUCTION  ⚠️ CRITICAL
NEXT_PUBLIC_BASE_URL=https://urbanuplink.ai
```

---

## 🐛 Common Issues

### "Token expired"
```bash
node get-firebase-token.js customer1@gmail.com Customer123 --prod
```

### "Payment URL is SANDBOX"
- Set `PHONEPE_ENV=PRODUCTION` in Vercel
- Redeploy

### "PhonePe not configured"
- Check Vercel environment variables
- Ensure all PhonePe variables are set

---

**Ready?** Run: `node test-production-api.js customer1@gmail.com Customer123 100`
