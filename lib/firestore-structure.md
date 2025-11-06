# Firestore Database Structure

## Collections Overview

### 1. users/{userId}
Main user documents with credit system data.

```typescript
{
  userId: string;
  name: string;
  email: string;
  role: 'admin' | 'dealeradmin' | 'customer';
  planType: 'prepaid' | 'postpaid';
  creditBalance: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 2. users/{userId}/transactions/{transactionId}
Subcollection storing all credit transactions for a user.

```typescript
{
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  timestamp: Timestamp;
  balanceAfter: number;
  metadata?: {
    paymentId?: string;
    invoiceId?: string;
    source?: string;
  }
}
```

### 3. payments/{paymentId}
Global collection for all payment transactions.

```typescript
{
  id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  paymentMethod: 'phonepe' | 'manual';
  phonePeTransactionId?: string;
  phonePeMerchantTransactionId?: string;
  zohoInvoiceId?: string;
  timestamp: Timestamp;
  webhookData?: any;
}
```

### 4. admins/{uid}
Admin user documents (existing structure maintained).

```typescript
{
  name: string;
  email: string;
  createdAt: Timestamp;
}
```

### 5. dealers/{uid}
Dealer documents (existing structure maintained).

```typescript
{
  name: string;
  email: string;
  contactDetails: string;
  createdAt: Timestamp;
}
```

## Indexes Required

1. **users collection**:
   - userId (automatic)
   - creditBalance (for analytics)
   - planType (for filtering)

2. **transactions subcollection**:
   - timestamp (descending) - for recent transactions query
   - type (for filtering)

3. **payments collection**:
   - userId (for user payment history)
   - status (for filtering)
   - timestamp (descending)

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can read their own data
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth.token.admin == true || request.auth.token.dealeradmin == true;
      
      // Transactions subcollection
      match /transactions/{transactionId} {
        allow read: if request.auth != null && request.auth.uid == userId;
        allow write: if request.auth.token.admin == true;
      }
    }
    
    // Payments - admin only
    match /payments/{paymentId} {
      allow read: if request.auth.token.admin == true;
      allow write: if request.auth.token.admin == true;
    }
    
    // Admins - admin only
    match /admins/{uid} {
      allow read, write: if request.auth.token.admin == true;
    }
    
    // Dealers - admin only
    match /dealers/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.admin == true;
    }
  }
}
```
