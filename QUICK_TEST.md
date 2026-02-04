# ⚡ Quick Test - PhonePe API

## 🚀 Fastest Way to Test

### Step 1: Start Server (Terminal 1)
```bash
npm run dev
```
Wait for: `Ready in X.Xs` and `Local: http://localhost:5000`

### Step 2: Run Complete Test (Terminal 2)
```bash
node test-phonepe-api.js customer1@gmail.com Customer123 100
```

**That's it!** The script will:
- ✅ Login and get token automatically
- ✅ Test the PhonePe API
- ✅ Show you the payment URL

---

## 📋 What You'll See

### Success Output:
```
🧪 Testing PhonePe Payment API

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 1: Getting Firebase Token...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Login successful!
👤 User: customer1@gmail.com (customer)
🔑 Token obtained (expires in 1 hour)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 2: Testing PhonePe Payment API...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📡 API Response Status: 200 OK

✅ Payment initiated successfully!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 PAYMENT DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 Amount: ₹100
🆔 Transaction ID: TXN_12345678-1234-1234-1234-123456789012
🔗 Payment URL:
   https://mercury-uat.phonepe.com/transact/...
```

---

## 🔧 Alternative: Step-by-Step Testing

### Option 1: Get Token Only
```bash
node get-firebase-token.js customer1@gmail.com Customer123
```
Then use the token in Postman.

### Option 2: Use Postman
1. Import `PhonePe_API.postman_collection.json`
2. Run "🔐 Login - Get Fresh Token" first
3. Run "Initiate Payment - Success"

---

## 🐛 Troubleshooting

### "Connection refused" or "ECONNREFUSED"
- **Fix:** Make sure server is running (`npm run dev`)
- **Check:** Server should be on port **5000** (not 3000)

### "Token expired"
- **Fix:** Run the test script again (gets fresh token automatically)

### "Invalid credentials"
- **Fix:** Use correct test credentials:
  - `customer1@gmail.com` / `Customer123`
  - `admin1@car360.com` / `Admin123`

---

## 📝 Test Credentials

| Email | Password | Role |
|-------|----------|------|
| `customer1@gmail.com` | `Customer123` | Customer |
| `admin1@car360.com` | `Admin123` | Admin |
| `dealer1@car360.com` | `Dealer123` | Dealer |

---

## ✅ Success Checklist

- [ ] Server running on port 5000
- [ ] Test script runs without errors
- [ ] Payment URL received
- [ ] Payment URL opens in browser
- [ ] Can complete test payment

---

**Ready?** Just run:
```bash
npm run dev
# Then in another terminal:
node test-phonepe-api.js customer1@gmail.com Customer123 100
```
