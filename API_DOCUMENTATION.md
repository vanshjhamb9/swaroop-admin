# API Documentation - Car360 Credit System

## Environment Setup

### Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
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

For production, update these values with your actual credentials from PhonePe and Zoho dashboards.

## Authentication

All API routes (except login and register) require Firebase Auth token in the Authorization header:
```
Authorization: Bearer <firebase-id-token>
```

## Authentication & User Management APIs

### 1. Register User
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

### 2. Login
**POST** `/api/auth/login`

Authenticate user credentials and get Firebase tokens. This endpoint verifies the password using Firebase Authentication REST API and returns tokens for client-side authentication.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "userPassword123"
}
```

**Response:**
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
- `401`: Invalid credentials (wrong email or password)
- `500`: Server error

**Note:** This endpoint properly verifies the password using Firebase Authentication. Use the returned `idToken` for immediate authentication or `customToken` with Firebase's `signInWithCustomToken()` on the client side.

---

### 3. Get User Profile
**GET** `/api/user/profile`

Get authenticated user's profile information.

**Headers:**
```
Authorization: Bearer <firebase-id-token>
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
    "creditBalance": 500,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-15T12:30:00.000Z"
  }
}
```

**Error Responses:**
- `401`: Missing or invalid authorization header
- `500`: Server error

---

### 4. Get All Users (Admin Only)
**GET** `/api/users?limit=50&startAfter=user123`

Get paginated list of all users. **Requires admin authentication.**

**Headers:**
```
Authorization: Bearer <admin-firebase-token>
```

**Query Parameters:**
- `limit` (optional): Number of users to return (default: 50)
- `startAfter` (optional): User ID to start after for pagination

**Response:**
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
    "total": 150,
    "limit": 50,
    "hasMore": true
  }
}
```

**Error Responses:**
- `401`: Missing or invalid authorization header
- `403`: Admin access required

---

## Credit System APIs

### 1. Get Credit Balance
**GET** `/api/credit/balance`

Returns the current credit balance and plan type for the authenticated user.

**Response:**
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

### 2. Get Transaction History
**GET** `/api/credit/transactions?limit=10&offset=0`

Returns paginated transaction history for the authenticated user.

**Query Parameters:**
- `limit` (optional): Number of transactions to return (default: 10)
- `offset` (optional): Offset for pagination (default: 0)

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

### 3. Add Credits
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

### 4. Deduct Credits
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

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "txn124",
    "newBalance": 650,
    "transaction": { ... },
    "warning": null
  }
}
```

## Payment APIs

### 5. Initiate PhonePe Payment
**POST** `/api/payment/phonepe/initiate`

Initiates a PhonePe payment transaction.

**Request Body:**
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
    "paymentUrl": "https://phonepe.com/...",
    "merchantTransactionId": "TXN_abc123",
    "amount": 500
  }
}
```

### 6. PhonePe Webhook (Internal)
**POST** `/api/payment/phonepe/webhook`

Handles PhonePe payment callbacks. Called by PhonePe servers.

## Invoice APIs

### 7. Generate Zoho Invoice
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

**Response:**
```json
{
  "success": true,
  "data": {
    "invoiceId": "zoho_inv_123",
    "customerId": "zoho_cust_456"
  }
}
```

## Analytics APIs

### 8. Get Analytics Stats
**GET** `/api/analytics/stats`

Returns analytics data. Requires admin access.

**Response:**
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
      { "date": "2025-01-01", "amount": 1500 }
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

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message",
  "details": "Additional details if available"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error
