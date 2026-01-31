# Postman Testing Guide - PhonePe Payment API

## Prerequisites

You need a Firebase authentication token (idToken) to test this API. Follow these steps:

---

## Step 1: Get Authentication Token

### Request 1: Login to Get Token

**Method:** `POST`  
**URL:** `https://urbanuplink.ai/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "your-email@example.com",
  "password": "your-password"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "idToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "customToken": "...",
    "refreshToken": "...",
    "user": {
      "uid": "user123",
      "email": "your-email@example.com",
      "name": "Your Name",
      "role": "customer",
      "planType": "prepaid",
      "creditBalance": 0
    }
  }
}
```

**Copy the `idToken` from the response** - you'll need it for the next request.

---

## Step 2: Test PhonePe Payment Initiate API

### Request 2: Initiate PhonePe Payment

**Method:** `POST`  
**URL:** `https://urbanuplink.ai/api/payment/phonepe/initiate`

**Headers:**
```
Authorization: Bearer YOUR_ID_TOKEN_HERE
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "amount": 100
}
```

**Note:** Amount is in INR (Rupees). For example:
- `100` = ₹100
- `500` = ₹500
- `1000` = ₹1000

---

## Complete Postman Setup

### Collection Structure:

```
📁 PhonePe Payment API Tests
  ├── 🔐 Step 1: Login
  └── 💳 Step 2: Initiate Payment
```

---

## Detailed Postman Configuration

### Request 1: Login

**Tab: Authorization**
- Type: `No Auth`

**Tab: Headers**
| Key | Value |
|-----|-------|
| Content-Type | application/json |

**Tab: Body**
- Select: `raw`
- Format: `JSON`
- Content:
```json
{
  "email": "customer1@gmail.com",
  "password": "Customer123"
}
```

**Tab: Tests** (Optional - to auto-save token)
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    if (jsonData.success && jsonData.data.idToken) {
        pm.environment.set("idToken", jsonData.data.idToken);
        console.log("Token saved to environment variable");
    }
}
```

---

### Request 2: Initiate PhonePe Payment

**Tab: Authorization**
- Type: `Bearer Token`
- Token: `{{idToken}}` (if using environment variable)
- OR manually paste the token from Step 1

**Tab: Headers**
| Key | Value |
|-----|-------|
| Content-Type | application/json |
| Authorization | Bearer YOUR_ID_TOKEN_HERE |

**Tab: Body**
- Select: `raw`
- Format: `JSON`
- Content:
```json
{
  "amount": 100
}
```

---

## Expected Responses

### Success Response (200 OK):
```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://mercury-uat.phonepe.com/transact/...",
    "merchantTransactionId": "TXN_abc123-def456-...",
    "amount": 100
  }
}
```

### Error Responses:

**401 Unauthorized:**
```json
{
  "error": "Missing or invalid authorization header"
}
```
**Solution:** Check if Authorization header is set correctly with Bearer token.

**400 Bad Request:**
```json
{
  "error": "Invalid amount. Amount must be greater than 0"
}
```
**Solution:** Ensure amount is a positive number.

**500 Internal Server Error:**
```json
{
  "error": "PhonePe payment gateway is not configured. Please contact support."
}
```
**Solution:** PhonePe environment variables are missing. Check server configuration.

**500 Internal Server Error (PhonePe API):**
```json
{
  "error": "Failed to initiate payment",
  "details": "PhonePe API returned 400: Bad Request",
  "statusCode": 400
}
```
**Solution:** Check PhonePe credentials or API endpoint configuration.

---

## Quick Test Script (cURL)

### Step 1: Login
```bash
curl -X POST https://urbanuplink.ai/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer1@gmail.com",
    "password": "Customer123"
  }'
```

### Step 2: Initiate Payment (Replace YOUR_TOKEN with token from Step 1)
```bash
curl -X POST https://urbanuplink.ai/api/payment/phonepe/initiate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "amount": 100
  }'
```

---

## Common Issues & Solutions

### Issue 1: "Missing or invalid authorization header"
**Cause:** Authorization header not set or incorrect format.

**Solution:**
- Ensure header is: `Authorization: Bearer YOUR_TOKEN`
- No spaces before "Bearer"
- Token should be the `idToken` from login response

### Issue 2: "Token expired or invalid"
**Cause:** Firebase token has expired (tokens expire after 1 hour).

**Solution:**
- Login again to get a new token
- Use the new `idToken` in the Authorization header

### Issue 3: "PhonePe payment gateway is not configured"
**Cause:** Server environment variables are missing.

**Solution:**
- Check if these are set on the server:
  - `PHONEPE_MERCHANT_ID`
  - `PHONEPE_SALT_KEY`
  - `PHONEPE_SALT_INDEX`
  - `PHONEPE_API_URL`

### Issue 4: "Invalid amount"
**Cause:** Amount is 0, negative, or not a number.

**Solution:**
- Use positive numbers only
- Example: `100`, `500`, `1000`

---

## Postman Environment Variables (Recommended)

Create a Postman Environment with:

| Variable | Initial Value | Current Value |
|----------|--------------|---------------|
| `baseUrl` | `https://urbanuplink.ai` | `https://urbanuplink.ai` |
| `idToken` | (empty) | (auto-filled after login) |
| `email` | `customer1@gmail.com` | `customer1@gmail.com` |
| `password` | `Customer123` | `Customer123` |

Then use in requests:
- URL: `{{baseUrl}}/api/payment/phonepe/initiate`
- Authorization: `Bearer {{idToken}}`

---

## Testing Checklist

- [ ] Step 1: Login successful, received idToken
- [ ] Step 2: Authorization header set correctly
- [ ] Step 2: Amount is a positive number
- [ ] Step 2: Received paymentUrl in response
- [ ] Payment URL opens correctly in browser
- [ ] Payment can be completed in PhonePe sandbox

---

## Test Data

**Test User Credentials (if available):**
- Email: `customer1@gmail.com`
- Password: `Customer123`

**Test Amounts:**
- Minimum: `1` (₹1)
- Recommended: `100` (₹100)
- Maximum: No limit (but PhonePe may have limits)

---

## Notes

1. **Sandbox Mode:** The API uses PhonePe sandbox for testing
2. **Token Expiry:** Firebase tokens expire after 1 hour - login again if needed
3. **Amount:** Amount is in INR (Indian Rupees)
4. **Payment URL:** The response contains a `paymentUrl` that should be opened in a browser/webview
5. **Webhook:** After payment, PhonePe will call the webhook automatically to add credits

---

**Last Updated:** 2025-01-27
