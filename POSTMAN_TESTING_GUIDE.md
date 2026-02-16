# PhonePe API - Postman Testing Guide

## 📋 Prerequisites

1. **Firebase Authentication Token**: You need a valid Firebase ID token to authenticate requests
2. **Postman Installed**: Download from [postman.com](https://www.postman.com/downloads/)
3. **Next.js Server Running**: Make sure your dev server is running (`npm run dev`)

## 🔧 Step-by-Step Postman Setup

### Step 1: Get Your Firebase Token

**📖 For detailed instructions, see: `HOW_TO_GET_FIREBASE_TOKEN.md`**

**Quick Method (Easiest):**
1. Use Postman to call your login API:
   - **POST** `http://localhost:3000/api/auth/login`
   - **Body**: `{"email": "your-email@example.com", "password": "your-password"}`
2. Copy the `idToken` from the response
3. Use it as your `firebase_token` environment variable

**Alternative Methods:**
- Use the helper script: `node get-firebase-token.js your-email@example.com your-password`
- Get it from Firebase Console (see detailed guide)
- Extract from browser console if you have a frontend app

**⚠️ IMPORTANT**: Firebase tokens expire after 1 hour. If you get "Token expired" error, get a fresh token:

**Quick Refresh:**
1. Run: `node get-firebase-token.js your-email@example.com your-password`
2. Copy the new token
3. Update `firebase_token` in Postman environment
4. Or use the Login request in Postman (see "Auto-Refresh Setup" below)

### Step 2: Configure Environment Variables in Postman

1. Open Postman
2. Click on **Environments** (left sidebar)
3. Click **+** to create a new environment
4. Add these variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `http://localhost:3000` | `http://localhost:3000` |
| `firebase_token` | `YOUR_FIREBASE_TOKEN_HERE` | `YOUR_FIREBASE_TOKEN_HERE` |
| `amount` | `100` | `100` |

5. Save the environment
6. Select this environment from the dropdown (top right)

### Step 3: Create a New Request

1. Click **New** → **HTTP Request**
2. Set the request method to **POST**
3. Enter the URL: `{{base_url}}/api/payment/phonepe/initiate`

### Step 4: Configure Headers

Add the following headers:

| Key | Value |
|-----|-------|
| `Content-Type` | `application/json` |
| `X-Auth-Token` | `{{firebase_token}}` |

**Important**: Use `X-Auth-Token` header instead of `Authorization` header because:
- Vercel strips the `Authorization` header in production
- The API accepts `X-Auth-Token` as an alternative
- The value should be your Firebase token **without** the "Bearer " prefix

**Alternative**: If testing locally and not on Vercel, you can also use:
- `Authorization` header with value: `Bearer {{firebase_token}}`

### Step 5: Configure Request Body

1. Select **Body** tab
2. Select **raw**
3. Select **JSON** from the dropdown
4. Enter the following JSON:

```json
{
  "amount": 100
}
```

Or use the environment variable:
```json
{
  "amount": {{amount}}
}
```

**Note**: 
- Amount is in **rupees** (not paise)
- Minimum amount: 1 rupee
- The API will convert it to paise automatically

### Step 6: Send the Request

1. Click **Send**
2. Check the response

## 📤 Expected Response

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://mercury-uat.phonepe.com/transact/...",
    "merchantTransactionId": "TXN_12345678-1234-1234-1234-123456789012",
    "amount": 100
  }
}
```

**What to do next:**
- Copy the `paymentUrl` from the response
- Open it in a browser to complete the payment
- Use PhonePe test credentials to complete the payment

### Error Responses

#### 401 Unauthorized - Missing Token
```json
{
  "error": "Missing authorization header",
  "debug": "Vercel is stripping the Authorization header...",
  "solution": "Use header \"X-Auth-Token\" in Postman instead of \"Authorization\"..."
}
```
**Solution**: Make sure you've added the `X-Auth-Token` header with your Firebase token

#### 401 Unauthorized - Invalid Token
```json
{
  "error": "Invalid token",
  "details": "Token expired. Please login again to get a new token."
}
```
**Solution**: Get a fresh Firebase token (tokens expire after 1 hour)

#### 400 Bad Request - Invalid Amount
```json
{
  "error": "Invalid amount. Amount must be greater than 0"
}
```
**Solution**: Make sure the amount in the request body is a positive number

#### 500 Internal Server Error - Configuration Missing
```json
{
  "error": "PhonePe payment gateway is not configured. Please contact support."
}
```
**Solution**: Check your `.env.local` file has the PhonePe credentials

## 🧪 Testing Different Scenarios

### Test Case 1: Successful Payment Initiation
- **Amount**: 100
- **Expected**: 200 OK with payment URL

### Test Case 2: Minimum Amount
- **Amount**: 1
- **Expected**: 200 OK with payment URL

### Test Case 3: Large Amount
- **Amount**: 10000
- **Expected**: 200 OK with payment URL

### Test Case 4: Invalid Amount (Zero)
- **Amount**: 0
- **Expected**: 400 Bad Request

### Test Case 5: Invalid Amount (Negative)
- **Amount**: -10
- **Expected**: 400 Bad Request

### Test Case 6: Missing Amount
- **Body**: `{}`
- **Expected**: 400 Bad Request

### Test Case 7: Missing Token
- **Headers**: Remove `X-Auth-Token`
- **Expected**: 401 Unauthorized

### Test Case 8: Invalid Token
- **X-Auth-Token**: `invalid_token_12345`
- **Expected**: 401 Unauthorized

## 🔐 PhonePe Test Credentials

When you open the payment URL in browser, use these test credentials:

**For SANDBOX/Test Mode:**
- Use any test phone number (e.g., 9999999999)
- Use any test UPI ID (e.g., test@ybl)
- Use any test card number (e.g., 4111111111111111)
- Use any future expiry date (e.g., 12/25)
- Use any CVV (e.g., 123)

**Note**: PhonePe sandbox environment allows any test credentials.

## 📝 Postman Collection JSON

You can import this collection directly into Postman:

```json
{
  "info": {
    "name": "PhonePe Payment API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Initiate Payment",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "X-Auth-Token",
            "value": "{{firebase_token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"amount\": 100\n}"
        },
        "url": {
          "raw": "{{base_url}}/api/payment/phonepe/initiate",
          "host": ["{{base_url}}"],
          "path": ["api", "payment", "phonepe", "initiate"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000"
    },
    {
      "key": "firebase_token",
      "value": "YOUR_FIREBASE_TOKEN_HERE"
    }
  ]
}
```

## 🚀 Quick Start Checklist

- [ ] Firebase token obtained and added to Postman environment
- [ ] Next.js dev server running (`npm run dev`)
- [ ] Postman environment created with `base_url` and `firebase_token`
- [ ] Request configured with POST method
- [ ] URL set to `{{base_url}}/api/payment/phonepe/initiate`
- [ ] Headers added: `Content-Type` and `X-Auth-Token`
- [ ] Body set to JSON with `amount` field
- [ ] Environment selected in Postman
- [ ] Request sent successfully

## 🔄 Handling Token Expiration (Auto-Refresh Setup)

Firebase tokens expire after 1 hour. Here's how to set up automatic token refresh in Postman:

### Option 1: Auto-Save Token from Login Request (Recommended)

1. **Create a Login Request** in your Postman collection:
   - **Name**: "Login - Get Token"
   - **Method**: POST
   - **URL**: `{{base_url}}/api/auth/login`
   - **Body** (JSON):
     ```json
     {
       "email": "customer1@gmail.com",
       "password": "Customer123"
     }
     ```

2. **Add Test Script** to automatically save the token:
   - Go to **Tests** tab in the Login request
   - Add this code:
     ```javascript
     if (pm.response.code === 200) {
         const jsonData = pm.response.json();
         if (jsonData.success && jsonData.data.idToken) {
             pm.environment.set("firebase_token", jsonData.data.idToken);
             console.log("✅ Token saved! Expires in 1 hour.");
         }
     }
     ```

3. **Before testing PhonePe API**:
   - Run the "Login - Get Token" request first
   - The token will be automatically saved to your environment
   - Then run your PhonePe API request

### Option 2: Use Helper Script

Run this command whenever your token expires:
```bash
node get-firebase-token.js customer1@gmail.com Customer123
```

Copy the token and update it in Postman environment manually.

### Option 3: Pre-request Script (Advanced)

Add this to your PhonePe API request's **Pre-request Script** tab to auto-refresh if expired:

```javascript
// Check if token exists and is not too old (optional)
// For now, just run login request manually before PhonePe request
// This is a placeholder for future auto-refresh logic
```

**Note**: For now, manually refresh tokens using Option 1 or 2.

## 🐛 Troubleshooting

### Issue: "Missing authorization header"
- **Solution**: Make sure you're using `X-Auth-Token` header (not `Authorization`)

### Issue: "Token expired" or "Invalid token"
- **Error Message**: `Firebase ID token has expired. Get a fresh ID token from your client app`
- **Cause**: Firebase tokens expire after 1 hour for security reasons
- **Solution**: 
  1. **Quick Fix**: Run `node get-firebase-token.js your-email@example.com your-password`
  2. Copy the new token from the output
  3. Update `firebase_token` in your Postman environment
  4. Or use the Login request in Postman (see "Auto-Refresh Setup" below)

### Issue: "Connection refused"
- **Solution**: Make sure your Next.js dev server is running on the correct port

### Issue: "PhonePe payment gateway is not configured"
- **Solution**: Check your `.env.local` file has:
  ```
  PHONEPE_CLIENT_ID=M2303MNTS7JUM_2602011428
  PHONEPE_CLIENT_SECRET=ZGUzYzAxMjgtZjA4Zi00Y2E0LTkwMjItZTkzMTc2ZWNjN2Rj
  PHONEPE_CLIENT_VERSION=1
  ```

### Issue: Payment URL not working
- **Solution**: Make sure you're using SANDBOX credentials and test the payment URL in a browser

## ⚠️ Common Error: Token Expired

**If you see this error:**
```
Token verification failed: Firebase ID token has expired. Get a fresh ID token from your client app
```

**Quick Fix:**
1. Run: `node get-firebase-token.js customer1@gmail.com Customer123`
2. Copy the new token
3. In Postman: Environments → Edit → Update `firebase_token` → Save
4. Try your request again

**Test Credentials** (from TEST_CREDENTIALS.md):
- Customer: `customer1@gmail.com` / `Customer123`
- Admin: `admin1@car360.com` / `Admin123`
- Dealer: `dealer1@car360.com` / `Dealer123`

## 🌐 Testing on Production

**Important:** When testing on production (`https://urbanuplink.ai`), you **MUST** get a token from the production login endpoint!

### Get Production Token:
```bash
node get-firebase-token.js customer1@gmail.com Customer123 --prod
```

Or in Postman:
1. Create Login request: `POST https://urbanuplink.ai/api/auth/login`
2. Add Test Script to auto-save token
3. Run Login → Token auto-saves
4. Use token in PhonePe request

**See `TEST_PRODUCTION.md` for detailed production testing guide.**

---

## 📞 Support

If you encounter issues:
1. **Token expired**: Get a fresh token using the helper script
   - Localhost: `node get-firebase-token.js email password`
   - Production: `node get-firebase-token.js email password --prod`
2. **Testing on production**: Make sure you get token from production login endpoint
3. Check the server logs for detailed error messages
4. Verify all environment variables are set correctly
5. Ensure Firebase token is valid and not expired (tokens expire after 1 hour)
6. Check PhonePe dashboard for API status
