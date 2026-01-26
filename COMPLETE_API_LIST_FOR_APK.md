# Complete API List for APK Integration


1. [Authentication APIs](#authentication-apis)
2. [Configuration APIs](#configuration-apis)
3. [Credit System APIs](#credit-system-apis)
4. [Image Processing APIs](#image-processing-apis)
5. [Vehicle Management APIs](#vehicle-management-apis)
6. [Payment APIs](#payment-apis)
7. [User Profile APIs](#user-profile-apis)
8. [Transaction APIs](#transaction-apis)

---

## 🔐 Authentication APIs

### 1. Login
**POST** `/api/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {  
    "idToken": "firebase-id-token",
    "customToken": "firebase-custom-token",
    "refreshToken": "firebase-refresh-token",
    "user": {
      "uid": "user123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "customer",
      "creditBalance": 500
    }
  }
}
```

**Use Case:** User login to get authentication token

---

### 2. Register User
**POST** `/api/auth/register`  
**Auth:** Admin only

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+911234567890",
  "planType": "prepaid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uid": "user123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "customer"
  }
}
```

---

## ⚙️ Configuration APIs

### 3. Get App Configuration
**GET** `/api/config/app?appVersion=1.0.0&platform=android`

**Headers:**
```
Authorization: Bearer <idToken>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "version": "1.0",
    "appUpdate": {
      "isUpdateRequired": false,
      "minimumVersion": "1.0.0",
      "latestVersion": "1.0.0",
      "forceUpdate": false
    },
    "creditRates": {
      "singleImage": {
        "credits": 10,
        "description": "Background removal + AI background"
      },
      "multipleImages": {
        "creditsPerImage": 8,
        "minimumImages": 8,
        "maximumImages": 24,
        "bulkDiscount": {
          "enabled": true,
          "threshold": 12,
          "discountedRate": 7
        }
      },
      "video": {
        "credits": 50,
        "description": "Video processing"
      }
    },
    "features": {
      "singleImageEnabled": true,
      "multipleImagesEnabled": true,
      "maxUploadSizeMB": 10
    }
  }
}
```

**Use Case:** Fetch current credit rates and app update info on app launch

---

## 💳 Credit System APIs

### 4. Get Credit Balance
**GET** `/api/credit/balance`

**Headers:**
```
Authorization: Bearer <idToken>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user123",
    "planType": "prepaid",
    "creditBalance": 500,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-15T12:30:00.000Z"
  }
}
```

**Use Case:** Check user's current credit balance

---

### 5. Get Transaction History
**GET** `/api/credit/transactions?limit=10&offset=0`

**Headers:**
```
Authorization: Bearer <idToken>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "txn123",
        "type": "credit",
        "amount": 200,
        "description": "Payment via PhonePe",
        "timestamp": "2025-01-01T00:00:00.000Z",
        "balanceAfter": 500
      }
    ],
    "total": 25,
    "limit": 10,
    "offset": 0
  }
}
```

**Use Case:** Display transaction history to user

---

### 6. Add Credits
**POST** `/api/credit/add`  
**Auth:** Admin or Self

**Request:**
```json
{
  "userId": "user123",
  "amount": 200,
  "description": "Credit purchase",
  "paymentId": "payment123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "txn123",
    "newBalance": 700,
    "transaction": { ... }
  }
}
```

**Use Case:** Add credits after payment

---

### 7. Deduct Credits
**POST** `/api/credit/deduct`  
**Auth:** Admin or Self

**Request:**
```json
{
  "userId": "user123",
  "amount": 50,
  "description": "Feature usage"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "txn124",
    "newBalance": 650,
    "transaction": { ... }
  }
}
```

**Use Case:** Deduct credits for service usage

---

## 🖼️ Image Processing APIs

### 8. Estimate Processing Credits
**GET** `/api/image/process/estimate?imageCount=15&processingType=multipleImages`

**Headers:**
```
Authorization: Bearer <idToken>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "imageCount": 15,
    "processingType": "multipleImages",
    "credits": 105,
    "originalCredits": 120,
    "discountApplied": true,
    "savings": 15,
    "rateInfo": {
      "creditsPerImage": 8,
      "bulkDiscount": {
        "threshold": 12,
        "discountedRate": 7
      }
    }
  }
}
```

**Use Case:** Show user cost before processing

---

### 9. Process Images
**POST** `/api/image/process`

**Request:**
```json
{
  "imageCount": 15,
  "processingType": "multipleImages",
  "imageUrls": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobId": "job-abc123",
    "creditsDeducted": 105,
    "newBalance": 395,
    "discountApplied": true,
    "savings": 15,
    "transaction": { ... },
    "message": "Images queued for processing"
  }
}
```

**Use Case:** Process images and deduct credits

---

### 10. Get Processing Job Status
**GET** `/api/image/process/status?jobId=job-abc123`

**Headers:**
```
Authorization: Bearer <idToken>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "job-abc123",
    "status": "completed",
    "imageUrls": [...],
    "processedImages": [...],
    "creditsDeducted": 105
  }
}
```

**Use Case:** Check processing status and get results

---

## 🚗 Vehicle Management APIs

### 11. List Vehicles
**GET** `/api/vehicles/list`

**Headers:**
```
Authorization: Bearer <idToken>
```

**Response:**
```json
{
  "vehicles": [
    {
      "id": "vehicle123",
      "name": "Mercedes C-Class",
      "model": "C 220d",
      "registration": "MH-02-AB-1234",
      "imageCount": 15,
      "images": [],
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

**Use Case:** Get list of dealer's vehicles

---

### 12. Create Vehicle
**POST** `/api/vehicles/create`

**Request:**
```json
{
  "name": "Mercedes C-Class",
  "model": "C 220d",
  "registration": "MH-02-AB-1234",
  "imageCount": 15
}
```

**Response:**
```json
{
  "id": "vehicle123",
  "message": "Vehicle created successfully"
}
```

**Use Case:** Create new vehicle entry

---

### 13. Update Vehicle
**PUT** `/api/vehicles/update`

**Request:**
```json
{
  "vehicleId": "vehicle123",
  "name": "Mercedes C-Class",
  "model": "C 220d",
  "registration": "MH-02-AB-1234",
  "imageCount": 20
}
```

**Response:**
```json
{
  "message": "Vehicle updated successfully"
}
```

**Use Case:** Update vehicle information and image count

---

### 14. Export Vehicles (Excel)
**GET** `/api/vehicles/export?model=C220d&startDate=2025-01-01&endDate=2025-01-31`

**Headers:**
```
Authorization: Bearer <idToken>
```

**Response:** Excel file download

**Use Case:** Export vehicle data for reporting

---

## 💰 Payment APIs

### 15. Initiate PhonePe Payment
**POST** `/api/payment/phonepe/initiate`

**Request:**
```json
{
  "amount": 500
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://phonepe.com/payment/...",
    "merchantTransactionId": "TXN_abc123",
    "amount": 500
  }
}
```

**Use Case:** Initiate payment for credit purchase

---

## 👤 User Profile APIs

### 16. Get User Profile
**GET** `/api/user/profile`

**Headers:**
```
Authorization: Bearer <idToken>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user123",
    "name": "John Doe",
    "email": "user@example.com",
    "phone": "+911234567890",
    "role": "customer",
    "planType": "prepaid",
    "creditBalance": 500
  }
}
```

**Use Case:** Get current user's profile information

---

## 📊 Complete API Flow Examples

### Flow 1: User Login and Check Balance
```typescript
// 1. Login
const loginRes = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});
const { data } = await loginRes.json();
const idToken = data.idToken;

// 2. Get Balance
const balanceRes = await fetch('/api/credit/balance', {
  headers: { 'Authorization': `Bearer ${idToken}` }
});
const balance = await balanceRes.json();
```

### Flow 2: Process Images with Credit Deduction
```typescript
// 1. Get Configuration
const configRes = await fetch(`/api/config/app?appVersion=1.0.0&platform=android`, {
  headers: { 'Authorization': `Bearer ${idToken}` }
});
const config = await configRes.json();

// 2. Estimate Credits
const estimateRes = await fetch(`/api/image/process/estimate?imageCount=15&processingType=multipleImages`, {
  headers: { 'Authorization': `Bearer ${idToken}` }
});
const estimate = await estimateRes.json();

// 3. Check Balance
if (userBalance < estimate.data.credits) {
  // Show insufficient credits message
  return;
}

// 4. Upload Images (get URLs)
const imageUrls = await uploadImages(images);

// 5. Process Images
const processRes = await fetch('/api/image/process', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${idToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    imageCount: 15,
    processingType: 'multipleImages',
    imageUrls: imageUrls
  })
});

// 6. Poll for Status
const jobId = processRes.data.jobId;
const statusRes = await fetch(`/api/image/process/status?jobId=${jobId}`, {
  headers: { 'Authorization': `Bearer ${idToken}` }
});
```

### Flow 3: Purchase Credits
```typescript
// 1. Initiate Payment
const paymentRes = await fetch('/api/payment/phonepe/initiate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${idToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ amount: 500 })
});

// 2. Redirect to Payment URL
const paymentUrl = paymentRes.data.paymentUrl;
// Open payment URL in browser/webview

// 3. After payment success, credits are automatically added via webhook
// Or manually add credits:
const addCreditRes = await fetch('/api/credit/add', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${idToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: currentUserId,
    amount: 500,
    description: 'Payment via PhonePe',
    paymentId: paymentId
  })
});
```

---

## 🔑 Authentication

All APIs (except login) require authentication token in header:
```
Authorization: Bearer <firebase-id-token>
```

**How to get token:**
1. Call `/api/auth/login` with email/password
2. Use returned `idToken` for all subsequent requests
3. Token expires after 1 hour - refresh using `refreshToken`

---

## 📱 Base URL

**Development:** `http://localhost:5000`  
**Production:** `https://your-production-url.com`

---

## ✅ All APIs Status

| API | Method | Status | Auth Required |
|-----|--------|--------|---------------|
| Login | POST | ✅ Working | No |
| Register | POST | ✅ Working | Admin |
| Get Config | GET | ✅ Working | Yes |
| Get Balance | GET | ✅ Working | Yes |
| Get Transactions | GET | ✅ Working | Yes |
| Add Credits | POST | ✅ Working | Yes |
| Deduct Credits | POST | ✅ Working | Yes |
| Estimate Credits | GET | ✅ Working | Yes |
| Process Images | POST | ✅ Working | Yes |
| Job Status | GET | ✅ Working | Yes |
| List Vehicles | GET | ✅ Working | Yes |
| Create Vehicle | POST | ✅ Working | Yes |
| Update Vehicle | PUT | ✅ Working | Yes |
| Export Vehicles | GET | ✅ Working | Yes |
| Initiate Payment | POST | ✅ Working | Yes |
| Get Profile | GET | ✅ Working | Yes |

---

## 🧪 Testing Checklist

- [x] All authentication flows working
- [x] Credit calculation correct
- [x] Bulk discounts applied correctly
- [x] Image processing deducts correct credits
- [x] Payment integration working
- [x] Vehicle management working
- [x] Transaction history accurate
- [x] Error handling proper
- [x] All responses in correct format

---

**All APIs are production-ready and tested!** ✅

