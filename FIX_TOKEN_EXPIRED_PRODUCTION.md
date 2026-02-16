# 🔧 Quick Fix: Token Expired on Production

## The Problem
You're testing on `https://urbanuplink.ai` and getting:
```json
{
    "error": "Token expired. Please login again to get a new token."
}
```

## ✅ Solution: Get Fresh Token from Production

### Step 1: Get Production Token

Run this command:
```bash
node get-firebase-token.js customer1@gmail.com Customer123 --prod
```

**Output:**
```
🔐 Logging in to get Firebase token...
🌍 Environment: PRODUCTION
📧 Email: customer1@gmail.com
🌐 API URL: https://urbanuplink.ai/api/auth/login

✅ Login successful!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 YOUR FIREBASE TOKEN (copy this):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...
[very long token]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 2: Update Postman

1. **Copy the token** from the output above
2. In Postman:
   - Go to **Environments** → Edit your environment
   - Update `firebase_token` with the new token
   - **Save**

### Step 3: Test Again

1. In Postman, make sure:
   - URL: `https://urbanuplink.ai/api/payment/phonepe/initiate`
   - Header: `X-Auth-Token` = `{{firebase_token}}`
   - Body: `{"amount": 100}`
2. Click **Send**
3. Should work now! ✅

---

## 🔄 Alternative: Use Postman Login Request

### Step 1: Create Login Request

1. **New Request** in Postman:
   - **Method**: POST
   - **URL**: `https://urbanuplink.ai/api/auth/login`
   - **Headers**: `Content-Type: application/json`
   - **Body**:
     ```json
     {
       "email": "customer1@gmail.com",
       "password": "Customer123"
     }
     ```

### Step 2: Add Auto-Save Script

1. Go to **Tests** tab
2. Add this code:
   ```javascript
   if (pm.response.code === 200) {
       const jsonData = pm.response.json();
       if (jsonData.success && jsonData.data.idToken) {
           pm.environment.set("firebase_token", jsonData.data.idToken);
           console.log("✅ Production token saved!");
       }
   }
   ```

### Step 3: Use It

1. **Run Login request** → Token auto-saves
2. **Run PhonePe request** → Uses fresh token

---

## ⚠️ Important Notes

1. **Tokens are environment-specific:**
   - Token from `localhost:5000` ❌ won't work on `urbanuplink.ai`
   - Token from `urbanuplink.ai` ✅ works on `urbanuplink.ai`

2. **Tokens expire after 1 hour:**
   - Get a fresh token when you see "expired" error
   - Always get token from the same environment you're testing

3. **Always use production login for production testing:**
   ```bash
   node get-firebase-token.js email password --prod
   ```

---

## 🎯 Quick Commands

```bash
# Get token for localhost
node get-firebase-token.js customer1@gmail.com Customer123

# Get token for production
node get-firebase-token.js customer1@gmail.com Customer123 --prod
```

---

**That's it!** Get a fresh token from production and update it in Postman. 🚀
