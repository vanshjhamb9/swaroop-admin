# 🔄 Quick Fix: Token Expired Error

## The Problem
You're seeing this error:
```
Token verification failed: Firebase ID token has expired. 
Get a fresh ID token from your client app and try again (auth/id-token-expired).
```

**Why?** Firebase tokens expire after 1 hour for security reasons.

---

## ✅ Solution 1: Use Helper Script (Fastest)

Run this command:
```bash
node get-firebase-token.js customer1@gmail.com Customer123
```

**Output:**
```
✅ Login successful!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 YOUR FIREBASE TOKEN (copy this):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Then:**
1. Copy the token
2. In Postman: **Environments** → Edit → Update `firebase_token` → Save
3. Try your request again

---

## ✅ Solution 2: Use Postman Login Request (Recommended)

### Step 1: Import Updated Collection
1. Import `PhonePe_API.postman_collection.json` into Postman
2. You'll see a new request: **"🔐 Login - Get Fresh Token"**

### Step 2: Run Login Request
1. Open **"🔐 Login - Get Fresh Token"** request
2. Update email/password if needed (default: `customer1@gmail.com` / `Customer123`)
3. Click **Send**
4. Check **Test Results** tab - you should see: `✅ Token saved to environment!`

### Step 3: Use PhonePe API
1. Now run your **"Initiate Payment"** request
2. It will automatically use the fresh token!

**The login request automatically saves the token to your environment!**

---

## ✅ Solution 3: Manual Login in Postman

1. **Create new POST request**:
   - URL: `http://localhost:3000/api/auth/login`
   - Body:
     ```json
     {
       "email": "customer1@gmail.com",
       "password": "Customer123"
     }
     ```

2. **Send request** and copy `idToken` from response

3. **Update environment**:
   - Environments → Edit → `firebase_token` → Paste token → Save

---

## 📋 Test Credentials

From `TEST_CREDENTIALS.md`:

| Role | Email | Password |
|------|-------|----------|
| Customer | `customer1@gmail.com` | `Customer123` |
| Admin | `admin1@car360.com` | `Admin123` |
| Dealer | `dealer1@car360.com` | `Dealer123` |

---

## 💡 Pro Tip: Auto-Refresh Setup

Add this **Test Script** to your Login request in Postman:

```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    if (jsonData.success && jsonData.data.idToken) {
        pm.environment.set("firebase_token", jsonData.data.idToken);
        console.log("✅ Token saved! Expires in 1 hour.");
    }
}
```

Then:
1. Run Login request → Token auto-saves
2. Run PhonePe request → Uses fresh token
3. If token expires → Run Login again

---

## ⚠️ Remember

- Tokens expire after **1 hour**
- Get a fresh token when you see "expired" error
- Use the helper script or Postman login request
- Token format: `eyJ...` (very long string)

---

## 🐛 Still Having Issues?

1. **Check server is running**: `npm run dev`
2. **Verify credentials**: Use test credentials from above
3. **Check environment**: Make sure Postman environment is selected
4. **Check header**: Use `X-Auth-Token` (not `Authorization`)

---

**Quick Command Reference:**
```bash
# Get fresh token
node get-firebase-token.js customer1@gmail.com Customer123

# Or use different user
node get-firebase-token.js admin1@car360.com Admin123
```
