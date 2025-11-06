# API Documentation - Car360 Credit System

## Authentication

All API routes require Firebase Auth token in the Authorization header:
```
Authorization: Bearer <firebase-id-token>
```

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
