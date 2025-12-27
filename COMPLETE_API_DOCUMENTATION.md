# Complete API Documentation - Swaroop Admin Panel

**Base URL:** `http://localhost:5000` (Development) or [your production URL](https://www.urbanuplink.ai/)

**Last Updated:** 2025-01-16

---

## Table of Contents

1. [Authentication](#authentication)
2. [Environment Setup](#environment-setup)
3. [Authentication & User Management](#authentication--user-management)
4. [Credit System APIs](#credit-system-apis)
5. [Payment APIs](#payment-apis)
6. [Vehicle Management APIs](#vehicle-management-apis)
7. [Dealer Management APIs](#dealer-management-apis)
8. [Invoice APIs](#invoice-apis)
9. [Analytics APIs](#analytics-apis)
10. [Admin APIs](#admin-apis)

---

## Authentication

Most API endpoints require authentication using Firebase Auth tokens. Include the token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

**Exceptions:** 
- `/api/auth/login` - Public endpoint
- `/api/test-firebase` - Public endpoint (for testing)

---

## Environment Setup

### Required Environment Variables

Create a `.env` file in the root directory:

```bash
# Firebase Admin SDK
FIREBASE_ADMIN_TYPE=service_account
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL=your-client-email
FIREBASE_ADMIN_CLIENT_ID=your-client-id
FIREBASE_ADMIN_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_ADMIN_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_ADMIN_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_ADMIN_CLIENT_CERT_URL=your-client-cert-url
FIREBASE_ADMIN_UNIVERSE_DOMAIN=googleapis.com

# PhonePe Payment Gateway (Sandbox for testing)
PHONEPE_MERCHANT_ID=MERCHANTUAT
PHONEPE_SALT_KEY=099eb0cd-02cf-4e2a-8aca-3e6c6aff0399
PHONEPE_SALT_INDEX=1
PHONEPE_API_URL=https://api-preprod.phonepe.com/apis/pg-sandbox

# Zoho Books Integration
ZOHO_CLIENT_ID=your-zoho-client-id
ZOHO_CLIENT_SECRET=your-zoho-client-secret
ZOHO_REFRESH_TOKEN=your-zoho-refresh-token
ZOHO_ORGANIZATION_ID=your-zoho-organization-id

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:5000
```

---

## Authentication & User Management

### 1. Login
**POST** `/api/auth/login`

Authenticate user and get Firebase tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "userPassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "customToken": "firebase-custom-token-here",
    "idToken": "firebase-id-token-here",
    "refreshToken": "firebase-refresh-token-here",
    "user": {
      "uid": "user123",
      "email": "user@example.com",
      "name": "John Doe",
      "phone": "+911234567890",
      "role": "customer",
      "planType": "prepaid",
      "creditBalance": 500
    }
  }
}
```

**Error Responses:**
- `400`: Missing email or password
- `401`: Invalid credentials
- `500`: Server error

---

### 2. Register User
**POST** `/api/auth/register`

Register a new customer account. **Requires admin authentication.**

**Headers:**
```
Authorization: Bearer <admin-firebase-token>
```

**Request Body:**
```json
{
  "email": "customer@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "phone": "+911234567890",
  "planType": "prepaid"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "uid": "user123",
    "email": "customer@example.com",
    "name": "John Doe",
    "role": "customer",
    "planType": "prepaid"
  }
}
```

**Error Responses:**
- `400`: Missing required fields
- `401`: Missing or invalid authorization header
- `403`: Admin access required
- `409`: User with email already exists

---

### 3. Get User Profile
**GET** `/api/user/profile`

Get authenticated user's profile information.

**Headers:**
```
Authorization: Bearer <firebase-id-token>
```

**Response (200):**
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
    "creditBalance": 500,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-15T12:30:00.000Z"
  }
}
```

---

### 4. Get All Users
**GET** `/api/users?limit=50&startAfter=user123&includeTotal=true`

Get paginated list of all users. **Requires admin authentication.**

**Query Parameters:**
- `limit` (optional): Number of users to return (default: 50, max: 100)
- `startAfter` (optional): User ID to start after for pagination
- `includeTotal` (optional): Include total count in response (default: false, expensive operation)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "userId": "user123",
        "name": "John Doe",
        "email": "user@example.com",
        "phone": "+911234567890",
        "role": "customer",
        "planType": "prepaid",
        "creditBalance": 500,
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-15T12:30:00.000Z"
      }
    ],
    "limit": 50,
    "hasMore": true,
    "total": 150
  }
}
```

**Note:** `total` is only included if `includeTotal=true` query parameter is provided.

---

### 5. Create Admin
**POST** `/api/createAdmin`

Create a new admin account. **Requires super admin authentication.**

**Headers:**
```
Authorization: Bearer <super-admin-firebase-token>
```

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "securePassword123",
  "name": "Admin Name",
  "isAdmin": true
}
```

**Response (200):**
```json
{
  "message": "Admin created successfully",
  "uid": "admin123"
}
```

**Error Responses:**
- `400`: Missing required fields or validation error
- `403`: Unauthorized (not super admin)
- `409`: Email already exists

---

### 6. Create Dealer Admin
**POST** `/api/createDealerAdmin`

Create a new dealer account. **Requires super admin authentication.**

**Headers:**
```
Authorization: Bearer <super-admin-firebase-token>
```

**Request Body:**
```json
{
  "email": "dealer@example.com",
  "password": "securePassword123",
  "name": "Dealer Name",
  "contactDetails": {
    "phone": "+911234567890",
    "address": "Dealer Address"
  }
}
```

**Response (200):**
```json
{
  "message": "Dealer account created successfully",
  "uid": "dealer123"
}
```

---

### 7. Verify Admin
**GET** `/api/verifyAdmin`

Verify if authenticated user is an admin.

**Headers:**
```
Authorization: Bearer <firebase-id-token>
```

**Response (200):**
```json
{
  "isAdmin": true,
  "uid": "admin123"
}
```

---

## Credit System APIs

### 8. Get Credit Balance
**GET** `/api/credit/balance`

Returns the current credit balance and plan type for the authenticated user.

**Headers:**
```
Authorization: Bearer <firebase-id-token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "user123",
    "planType": "prepaid",
    "creditBalance": 500,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Cache:** Response is cached for 30 seconds.

---

### 9. Get Transaction History
**GET** `/api/credit/transactions?limit=10&offset=0`

Returns paginated transaction history for the authenticated user.

**Query Parameters:**
- `limit` (optional): Number of transactions to return (default: 10)
- `offset` (optional): Offset for pagination (default: 0)

**Response (200):**
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
        "balanceAfter": 500,
        "metadata": {
          "paymentId": "payment123"
        }
      }
    ],
    "total": 25,
    "limit": 10,
    "offset": 0
  }
}
```

---

### 10. Add Credits
**POST** `/api/credit/add`

Adds credits to a user account. Requires admin access or self-modification.

**Request Body:**
```json
{
  "userId": "user123",
  "amount": 200,
  "description": "Credit purchase",
  "paymentId": "payment123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "transactionId": "txn123",
    "newBalance": 700,
    "transaction": {
      "id": "txn123",
      "type": "credit",
      "amount": 200,
      "description": "Credit purchase",
      "timestamp": "2025-01-01T00:00:00.000Z",
      "balanceAfter": 700
    }
  }
}
```

**Error Responses:**
- `400`: Invalid userId or amount
- `403`: Unauthorized to add credits
- `404`: User not found

---

### 11. Deduct Credits
**POST** `/api/credit/deduct`

Deducts credits from a user account. For prepaid users, prevents negative balance.

**Request Body:**
```json
{
  "userId": "user123",
  "amount": 50,
  "description": "Feature usage"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "transactionId": "txn124",
    "newBalance": 650,
    "transaction": {
      "id": "txn124",
      "type": "debit",
      "amount": 50,
      "description": "Feature usage",
      "timestamp": "2025-01-01T00:00:00.000Z",
      "balanceAfter": 650
    },
    "warning": null
  }
}
```

**Error Responses:**
- `400`: Invalid userId, amount, or insufficient credits
- `403`: Unauthorized to deduct credits
- `404`: User not found

**Note:** For postpaid users, negative balances are allowed and a warning is returned.

---

## Payment APIs

### 12. Initiate PhonePe Payment
**POST** `/api/payment/phonepe/initiate`

Initiates a PhonePe payment transaction.

**Request Body:**
```json
{
  "amount": 500
}
```

**Response (200):**
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

**Error Responses:**
- `400`: Invalid amount
- `401`: Unauthorized
- `500`: Payment initiation failed

---

### 13. PhonePe Webhook
**POST** `/api/payment/phonepe/webhook`

Handles PhonePe payment callbacks. Called by PhonePe servers automatically.

**Note:** This endpoint should not be called directly from the client. It's handled automatically by PhonePe.

---

## Vehicle Management APIs

### 14. List Vehicles
**GET** `/api/vehicles/list`

Get list of vehicles for authenticated dealer.

**Headers:**
```
Authorization: Bearer <dealer-firebase-token>
```

**Response (200):**
```json
{
  "vehicles": [
    {
      "id": "vehicle123",
      "name": "Honda City",
      "model": "2023",
      "registration": "DL-01-AB-1234",
      "images": [],
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 15. Create Vehicle
**POST** `/api/vehicles/create`

Create a new vehicle. **Requires dealer authentication.**

**Request Body:**
```json
{
  "name": "Honda City",
  "model": "2023",
  "registration": "DL-01-AB-1234"
}
```

**Response (200):**
```json
{
  "id": "vehicle123",
  "message": "Vehicle created successfully"
}
```

**Error Responses:**
- `400`: Missing required fields
- `401`: Unauthorized

---

### 16. Update Vehicle
**PUT** `/api/vehicles/update`

Update vehicle information. **Requires dealer authentication.**

**Request Body:**
```json
{
  "vehicleId": "vehicle123",
  "name": "Honda City",
  "model": "2024",
  "registration": "DL-01-AB-1234"
}
```

**Response (200):**
```json
{
  "message": "Vehicle updated successfully"
}
```

---

### 17. Delete Vehicle
**DELETE** `/api/vehicles/delete`

Delete a vehicle. **Requires dealer authentication.**

**Request Body:**
```json
{
  "vehicleId": "vehicle123"
}
```

**Response (200):**
```json
{
  "message": "Vehicle deleted successfully"
}
```

---

## Dealer Management APIs

### 18. Get All Dealers
**GET** `/api/dealers?limit=50&startAfter=dealer123&orderBy=createdAt&orderDirection=desc`

Get paginated list of all dealers. **Requires authentication.**

**Query Parameters:**
- `limit` (optional): Number of dealers to return (default: 50, max: 100)
- `startAfter` (optional): Dealer ID to start after for pagination
- `orderBy` (optional): Field to order by (default: createdAt)
- `orderDirection` (optional): Order direction - 'asc' or 'desc' (default: desc)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "dealers": [
      {
        "id": "dealer123",
        "name": "Dealer Name",
        "email": "dealer@example.com",
        "contactDetails": {
          "phone": "+911234567890",
          "address": "Dealer Address"
        },
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "total": 25,
    "limit": 50,
    "hasMore": false
  }
}
```

**Cache:** Response is cached for 60 seconds.

---

### 19. Get Dealer Info
**GET** `/api/dealer/info`

Get dealer information for authenticated dealer.

**Headers:**
```
Authorization: Bearer <dealer-firebase-token>
```

**Response (200):**
```json
{
  "uid": "dealer123",
  "email": "dealer@example.com",
  "name": "Dealer Name",
  "contactDetails": "Contact details",
  "vehicles": []
}
```

---

### 20. Get Dealer Profile
**GET** `/api/dealer/profile`

Get dealer profile for authenticated dealer.

**Headers:**
```
Authorization: Bearer <dealer-firebase-token>
```

**Response (200):**
```json
{
  "uid": "dealer123",
  "email": "dealer@example.com",
  "name": "Dealer Name",
  "contactDetails": "Contact details",
  "vehicles": []
}
```

---

## Invoice APIs

### 21. Generate Refrens Invoice
**POST** `/api/invoice/refrens/generate`

Generate an invoice using Refrens. **Requires authentication.**

**Request Body:**
```json
{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+911234567890",
  "customerAddress": {
    "street": "123 Main St",
    "city": "Mumbai",
    "pincode": "400001",
    "country": "IN",
    "gstin": "07AAAAA0000A1Z5",
    "gstState": "07"
  },
  "invoiceTitle": "Tax Invoice",
  "items": [
    {
      "name": "Product 1",
      "rate": 1000,
      "quantity": 2,
      "gstRate": 18
    }
  ],
  "sendEmail": true,
  "currency": "INR"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "invoiceId": "inv123",
    "invoiceNumber": "INV-2025-001",
    "status": "generated"
  }
}
```

**Error Responses:**
- `400`: Missing required fields or invalid GSTIN
- `401`: Unauthorized

---

### 22. List Refrens Invoices
**GET** `/api/invoice/refrens/list?limit=50&skip=0&sortBy=createdAt&sortOrder=-1`

Get list of Refrens invoices. **Requires admin authentication.**

**Query Parameters:**
- `limit` (optional): Number of invoices (default: 50)
- `skip` (optional): Number to skip (default: 0)
- `sortBy` (optional): Field to sort by - 'createdAt', 'invoiceNumber', 'invoiceDate' (default: createdAt)
- `sortOrder` (optional): 1 for ascending, -1 for descending (default: -1)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "invoices": [...],
    "total": 100,
    "limit": 50,
    "skip": 0,
    "analytics": {
      "totalAmount": 50000,
      "invoiceCount": 100
    }
  }
}
```

---

### 23. Get Refrens Invoice
**GET** `/api/invoice/refrens/get?invoiceId=inv123`

Get a specific Refrens invoice by ID. **Requires admin authentication.**

**Query Parameters:**
- `invoiceId` (required): Invoice ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "invoiceId": "inv123",
    "invoiceNumber": "INV-2025-001",
    "amount": 1000,
    "status": "paid"
  }
}
```

---

### 24. Cancel Refrens Invoice
**POST** `/api/invoice/refrens/cancel`

Cancel a Refrens invoice. **Requires admin authentication.**

**Request Body:**
```json
{
  "invoiceId": "inv123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Invoice cancelled successfully"
}
```

---

### 25. Refrens Invoice Analytics
**GET** `/api/invoice/refrens/analytics`

Get analytics for Refrens invoices. **Requires admin authentication.**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalInvoices": 100,
    "totalAmount": 50000,
    "paidAmount": 45000,
    "pendingAmount": 5000
  }
}
```

---

### 26. Generate Zoho Invoice
**POST** `/api/invoice/zoho/generate`

Generates and sends a Zoho invoice for a payment.

**Request Body:**
```json
{
  "userId": "user123",
  "amount": 500,
  "paymentId": "payment123",
  "transactionId": "phonepe_txn_123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "invoiceId": "zoho_inv_123",
    "customerId": "zoho_cust_456"
  }
}
```

**Error Responses:**
- `400`: Missing required fields
- `404`: User not found
- `500`: Invoice generation failed

---

## Analytics APIs

### 27. Get Analytics Stats
**GET** `/api/analytics/stats`

Returns analytics data. **Requires admin authentication.**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 150,
      "totalDealers": 25,
      "totalRevenue": 50000,
      "transactionCount": 300
    },
    "revenueByDate": [
      {
        "date": "2025-01-15",
        "amount": 1500
      },
      {
        "date": "2025-01-14",
        "amount": 2000
      }
    ],
    "topUsers": [
      {
        "userId": "user123",
        "name": "John Doe",
        "email": "john@example.com",
        "totalSpent": 5000,
        "transactionCount": 25
      }
    ]
  }
}
```

**Cache:** Response is cached for 5 minutes.

**Performance Note:** This endpoint has been optimized to eliminate N+1 queries and uses efficient aggregation methods.

---

## Admin APIs

### 28. Admin Dashboard
**GET** `/api/admin/dashboard`

Get admin dashboard statistics. **Requires admin authentication.**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalAdmins": 5,
    "totalDealers": 25,
    "totalVehicles": 150
  }
}
```

**Cache:** Response is cached for 5 minutes.

---

### 29. Test Firebase
**GET** `/api/test-firebase`

Test Firebase connection (public endpoint for testing).

**Response (200):**
```json
{
  "success": true,
  "message": "Firebase connection successful"
}
```

---

### 30. Seed Database
**POST** `/api/seed`

Seed database with test data. **Requires admin authentication.**

**Note:** This endpoint may vary in implementation. Check the route file for specific requirements.

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message",
  "details": "Additional details if available"
}
```

### Common HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (invalid parameters)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (e.g., email already exists)
- `500`: Internal Server Error

---

## Performance Optimizations

The following optimizations have been implemented:

1. **Query Optimization:**
   - Use `count()` queries instead of fetching all documents where possible
   - Eliminated N+1 queries in analytics and dashboard endpoints
   - Added pagination to list endpoints

2. **Caching:**
   - Credit balance: 30 seconds cache
   - Analytics stats: 5 minutes cache
   - Admin dashboard: 5 minutes cache
   - Dealers list: 60 seconds cache

3. **Database Optimization:**
   - Batch queries where possible
   - Limit query results to prevent large data transfers
   - Use Firestore transactions for critical operations

4. **Response Optimization:**
   - Added Cache-Control headers
   - Removed excessive console.logs
   - Optimized Firebase Admin initialization

---

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use, especially for:
- Authentication endpoints
- Payment endpoints
- Analytics endpoints

---

## Integration Guide for Mobile App

### Step 1: Authentication Flow

```typescript
// 1. Login
const response = await fetch('https://your-api.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { data } = await response.json();
const { idToken } = data;

// 2. Use idToken for subsequent requests
const apiResponse = await fetch('https://your-api.com/api/user/profile', {
  headers: {
    'Authorization': `Bearer ${idToken}`,
    'Content-Type': 'application/json'
  }
});
```

### Step 2: Credit Management

```typescript
// Get balance
const balance = await fetch('/api/credit/balance', {
  headers: { 'Authorization': `Bearer ${idToken}` }
});

// Add credits (after payment)
await fetch('/api/credit/add', {
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

### Step 3: Payment Flow

```typescript
// 1. Initiate payment
const paymentResponse = await fetch('/api/payment/phonepe/initiate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${idToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ amount: 500 })
});

const { data } = await paymentResponse.json();
const { paymentUrl, merchantTransactionId } = data;

// 2. Redirect user to paymentUrl
// 3. After payment, PhonePe will call webhook automatically
// 4. Poll or listen for payment status update
```

---

## Support

For issues or questions:
1. Check error responses for detailed error messages
2. Verify authentication tokens are valid and not expired
3. Ensure all required environment variables are set
4. Check Firebase console for database structure

---

**Document Version:** 1.0  
**Generated:** 2025-01-16

