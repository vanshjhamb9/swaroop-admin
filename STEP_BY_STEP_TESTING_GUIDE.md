# 🧪 Step-by-Step Testing Guide - PhonePe API

Follow these steps to test your PhonePe payment API end-to-end.

---

## ✅ Step 1: Start Your Server

Open a terminal and run:

```bash
npm run dev
```

**Expected output:**
```
▲ Next.js 15.1.3
- Local:        http://localhost:5000
- Ready in 2.3s
```

**✅ Check:** Make sure you see "Ready" and the server is running on port **5000**

---

## ✅ Step 2: Get Your Firebase Token

### Option A: Using Helper Script (Recommended)

Open a **new terminal** (keep server running) and run:

```bash
node get-firebase-token.js customer1@gmail.com Customer123
```

**Expected output:**
```
🔐 Logging in to get Firebase token...
📧 Email: customer1@gmail.com
🌐 API URL: http://localhost:5000/api/auth/login

✅ Login successful!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 YOUR FIREBASE TOKEN (copy this):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...
[very long token string]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 User Info:
   UID: abc123...
   Email: customer1@gmail.com
   Role: customer
```

**📋 Copy the entire token** (the long string between the lines)

### Option B: Using Postman Login Request

1. Import `PhonePe_API.postman_collection.json` into Postman
2. Run the **"🔐 Login - Get Fresh Token"** request
3. Check **Test Results** tab - token is auto-saved!

---

## ✅ Step 3: Set Up Postman

### 3.1 Create Environment

1. Open Postman
2. Click **Environments** (left sidebar)
3. Click **+** (Create Environment)
4. Name it: `PhonePe Testing`
5. Add these variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `http://localhost:5000` | `http://localhost:5000` |
| `firebase_token` | `[paste your token here]` | `[paste your token here]` |
| `amount` | `100` | `100` |

6. Click **Save**
7. **Select this environment** from dropdown (top right)

### 3.2 Import Collection (Optional but Recommended)

1. Click **Import** button
2. Select `PhonePe_API.postman_collection.json`
3. You'll see pre-configured requests

---

## ✅ Step 4: Test PhonePe Payment API

### Method 1: Using Imported Collection

1. Open **"Initiate Payment - Success"** request
2. Click **Send**
3. Check the response

### Method 2: Create New Request

1. Click **New** → **HTTP Request**
2. Configure:

   **Request Details:**
   - Method: **POST**
   - URL: `{{base_url}}/api/payment/phonepe/initiate`

   **Headers:**
   - `Content-Type`: `application/json`
   - `X-Auth-Token`: `{{firebase_token}}`

   **Body** (raw JSON):
   ```json
   {
     "amount": 100
   }
   ```

3. Click **Send**

---

## ✅ Step 5: Check the Response

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

**✅ What to do next:**
1. Copy the `paymentUrl`
2. Open it in a browser
3. Complete the payment using PhonePe test credentials

### Error Responses

#### 401 - Token Expired
```json
{
  "error": "Token expired. Please login again to get a new token."
}
```
**Fix:** Run `node get-firebase-token.js customer1@gmail.com Customer123` again

#### 401 - Missing Token
```json
{
  "error": "Missing authorization header"
}
```
**Fix:** Make sure `X-Auth-Token` header is set with your token

#### 400 - Invalid Amount
```json
{
  "error": "Invalid amount. Amount must be greater than 0"
}
```
**Fix:** Check the amount in request body is a positive number

---

## ✅ Step 6: Test Payment Flow

1. **Copy the payment URL** from the API response
2. **Open in browser** (Chrome/Firefox)
3. **Use PhonePe test credentials:**
   - Phone: Any number (e.g., 9999999999)
   - UPI ID: Any test UPI (e.g., test@ybl)
   - Card: 4111111111111111
   - Expiry: Any future date (e.g., 12/25)
   - CVV: Any 3 digits (e.g., 123)

4. **Complete the payment**
5. **Check redirect** - should redirect to your success page

---

## 🧪 Test Different Scenarios

### Test Case 1: Minimum Amount
- Amount: `1`
- Expected: Success with payment URL

### Test Case 2: Large Amount
- Amount: `10000`
- Expected: Success with payment URL

### Test Case 3: Invalid Amount (Zero)
- Amount: `0`
- Expected: 400 Bad Request

### Test Case 4: Missing Token
- Remove `X-Auth-Token` header
- Expected: 401 Unauthorized

---

## 🔄 If Token Expires

**Quick Refresh:**
```bash
node get-firebase-token.js customer1@gmail.com Customer123
```

Then update `firebase_token` in Postman environment.

---

## 📋 Test Credentials Reference

| Role | Email | Password |
|------|-------|----------|
| Customer | `customer1@gmail.com` | `Customer123` |
| Admin | `admin1@car360.com` | `Admin123` |
| Dealer | `dealer1@car360.com` | `Dealer123` |

---

## ✅ Checklist

Before testing, make sure:

- [ ] Server is running (`npm run dev`)
- [ ] Server is on port **5000** (not 3000)
- [ ] Firebase token obtained (using helper script or Postman)
- [ ] Postman environment created with `base_url` and `firebase_token`
- [ ] Environment selected in Postman
- [ ] Request has `X-Auth-Token` header set
- [ ] Request body has `amount` field

---

## 🐛 Troubleshooting

### Server not starting?
```bash
# Check if port 5000 is already in use
netstat -ano | findstr :5000

# Or try different port
PORT=5001 npm run dev
# Then update BASE_URL in helper script
```

### Token not working?
- Make sure token is fresh (not expired)
- Check token starts with `eyJ`
- Verify `X-Auth-Token` header is set (not `Authorization`)

### API returns error?
- Check server logs in terminal
- Verify PhonePe credentials in `.env.local`
- Make sure amount is > 0

---

## 📞 Quick Commands Reference

```bash
# Start server
npm run dev

# Get fresh token
node get-firebase-token.js customer1@gmail.com Customer123

# Test with different user
node get-firebase-token.js admin1@car360.com Admin123
```

---

## 🎯 Expected Flow

```
1. Start Server → http://localhost:5000
2. Get Token → Run helper script
3. Copy Token → Update Postman environment
4. Send Request → POST /api/payment/phonepe/initiate
5. Get Payment URL → Copy from response
6. Open in Browser → Complete payment
7. Verify Redirect → Check success page
```

---

**Ready to test?** Start with Step 1! 🚀
