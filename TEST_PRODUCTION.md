# 🌐 Testing on Production (urbanuplink.ai)

## ⚠️ Important: Token Expiration Issue

When testing on **production** (`https://urbanuplink.ai`), you **MUST** get a fresh token from the production login endpoint. Tokens from localhost won't work on production!

---

## ✅ Solution: Get Token from Production

### Method 1: Using Helper Script (Easiest)

Run with `--prod` flag:

```bash
node get-firebase-token.js customer1@gmail.com Customer123 --prod
```

Or set BASE_URL:

```bash
BASE_URL=https://urbanuplink.ai node get-firebase-token.js customer1@gmail.com Customer123
```

**Output:**
```
🔐 Logging in to get Firebase token...
📧 Email: customer1@gmail.com
🌐 API URL: https://urbanuplink.ai/api/auth/login

✅ Login successful!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 YOUR FIREBASE TOKEN (copy this):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...
[very long token string]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Copy this token** - it's valid for production!

---

### Method 2: Using Postman (Recommended)

#### Step 1: Create Login Request for Production

1. **Create new POST request** in Postman:
   - **Name**: "🔐 Login - Production"
   - **Method**: POST
   - **URL**: `https://urbanuplink.ai/api/auth/login`
   - **Headers**:
     - `Content-Type`: `application/json`
   - **Body** (raw JSON):
     ```json
     {
       "email": "customer1@gmail.com",
       "password": "Customer123"
     }
     ```

#### Step 2: Add Auto-Save Script

1. Go to **Tests** tab in the Login request
2. Add this code:
   ```javascript
   if (pm.response.code === 200) {
       const jsonData = pm.response.json();
       if (jsonData.success && jsonData.data.idToken) {
           pm.environment.set("firebase_token", jsonData.data.idToken);
           console.log("✅ Production token saved! Expires in 1 hour.");
       }
   }
   ```

#### Step 3: Test PhonePe API

1. **Create PhonePe request**:
   - **Method**: POST
   - **URL**: `https://urbanuplink.ai/api/payment/phonepe/initiate`
   - **Headers**:
     - `Content-Type`: `application/json`
     - `X-Auth-Token`: `{{firebase_token}}`
   - **Body**:
     ```json
     {
       "amount": 100
     }
     ```

2. **Run Login request first** → Token auto-saves
3. **Run PhonePe request** → Uses fresh production token

---

## 🔄 Complete Postman Setup for Production

### Environment Variables

Create a **Production** environment in Postman:

| Variable | Value |
|----------|-------|
| `base_url` | `https://urbanuplink.ai` |
| `firebase_token` | `[will be auto-populated]` |
| `amount` | `100` |

### Collection Structure

1. **🔐 Login - Production**
   - URL: `{{base_url}}/api/auth/login`
   - Auto-saves token to `firebase_token`

2. **💰 Initiate Payment - Production**
   - URL: `{{base_url}}/api/payment/phonepe/initiate`
   - Uses `{{firebase_token}}` from environment

---

## ⚠️ Common Issues

### Issue: "Token expired" on Production

**Cause:** You're using a token from localhost, or the token expired.

**Fix:**
1. Get a fresh token from production:
   ```bash
   node get-firebase-token.js customer1@gmail.com Customer123 --prod
   ```
2. Update `firebase_token` in Postman environment
3. Try again

### Issue: "Invalid credentials"

**Cause:** User doesn't exist in production database.

**Fix:** Make sure the user exists in production Firebase Authentication.

### Issue: Token works on localhost but not production

**Cause:** Tokens are environment-specific. Production tokens must come from production login.

**Fix:** Always get tokens from the same environment you're testing.

---

## 📋 Quick Reference

### Get Production Token:
```bash
# Method 1: Using --prod flag
node get-firebase-token.js customer1@gmail.com Customer123 --prod

# Method 2: Using BASE_URL
BASE_URL=https://urbanuplink.ai node get-firebase-token.js customer1@gmail.com Customer123
```

### Test Production API:
- **Login**: `POST https://urbanuplink.ai/api/auth/login`
- **PhonePe**: `POST https://urbanuplink.ai/api/payment/phonepe/initiate`

### Token Expiration:
- Tokens expire after **1 hour**
- Get a fresh token when you see "expired" error
- Always get token from the same environment you're testing

---

## ✅ Testing Checklist

- [ ] Get token from production login endpoint
- [ ] Token is fresh (not expired)
- [ ] Using correct production URL (`https://urbanuplink.ai`)
- [ ] `X-Auth-Token` header is set correctly
- [ ] User exists in production Firebase

---

## 🎯 Step-by-Step: Test Production Now

1. **Get Production Token:**
   ```bash
   node get-firebase-token.js customer1@gmail.com Customer123 --prod
   ```

2. **Copy the token** from output

3. **In Postman:**
   - Set URL: `https://urbanuplink.ai/api/payment/phonepe/initiate`
   - Set header: `X-Auth-Token` = `[paste token]`
   - Set body: `{"amount": 100}`
   - Click **Send**

4. **Should work!** ✅

---

**Remember:** Always get tokens from the same environment you're testing!
