# Car360 Admin Application

## Overview

Car360 is a multi-tenant vehicle inspection and management platform built with Next.js 15, Firebase, and Material-UI. The application serves three distinct user roles: Super Admins, Dealer Admins, and Customers. It enables dealers to upload and manage vehicle inventories with 360-degree image views, while admins oversee dealer accounts and system operations.

The platform features a serverless architecture using Next.js API routes for backend operations, Firebase Authentication for role-based access control, and Firestore for data persistence. The application supports interactive 360-degree vehicle visualization and is designed for deployment on Vercel.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: Next.js 15 with App Router
- Uses the modern App Router pattern with route groups for role-based layouts
- Three distinct route groups: `(adminPanel)`, `(dealerSide)`, and `(customer)`
- Server and client components separated appropriately
- TypeScript for type safety across the application

**UI Framework**: Material-UI v6 with Emotion
- Custom theming system with multiple theme variants (light, dark, grassy, default)
- Theme state managed globally via Zustand
- Responsive design with mobile-first approach using Material-UI breakpoints
- Custom components for reusable UI elements

**State Management**: Zustand
- Lightweight state management for theme preferences
- Separate stores for admin info, dealer info, and vehicle data
- Local storage persistence for vehicle data to maintain state across navigation

**3D/360° Visualization**: 
- Custom 360-degree viewer implementation
- Supports image sequence-based rotation
- Integration with Three.js, A-Frame, and Panolens libraries for future enhancements
- Client-side image processing and watermarking capabilities

### Backend Architecture

**Serverless API**: Next.js API Routes

*Authentication & User Management:*
- `/api/auth/register` - Register new customer accounts (admin-only)
- `/api/auth/login` - Authenticate users with password verification
- `/api/user/profile` - Get authenticated user profile
- `/api/users` - List all users with pagination (admin-only)
- `/api/createAdmin` - Creates admin accounts with custom claims
- `/api/createDealerAdmin` - Creates dealer admin accounts
- `/api/verifyAdmin` - Verifies admin privileges

*Credit System:*
- `/api/credit/balance` - Get user credit balance
- `/api/credit/transactions` - Get transaction history with pagination
- `/api/credit/add` - Add credits manually (admin or self)
- `/api/credit/deduct` - Deduct credits from account

*Payment Integration:*
- `/api/payment/phonepe/initiate` - Initiate PhonePe payment
- `/api/payment/phonepe/webhook` - Handle PhonePe payment callbacks

*Invoice Generation:*
- `/api/invoice/zoho/generate` - Generate and send Zoho invoices

*Analytics:*
- `/api/analytics/stats` - Get system analytics (admin-only)

All routes implement token-based authentication using Firebase Admin SDK

**Authentication & Authorization**:
- Firebase Authentication for user management
- Custom claims for role-based access control (admin, dealeradmin)
- Super Admin UID hardcoded for initial setup: `bpzPUAg2wLZz4eljAwGFyZ0f6yF2`
- Token verification on all protected API routes
- Client-side auth state monitoring with `onAuthStateChanged`

**Data Models**:

1. **Admins Collection** (`/admins/{uid}`):
   - name, email, createdAt timestamp

2. **Dealers Collection** (`/dealers/{uid}`):
   - name, email, contactDetails, createdAt timestamp
   - Subcollection: `vehicles/{vehicleId}` with vehicle metadata and image URLs

3. **Vehicle Document Structure**:
   - name, model, registration, images array, id

### Data Storage Solutions

**Primary Database**: Firebase Firestore
- NoSQL document-based structure
- Real-time synchronization capabilities
- Hierarchical data organization (dealers → vehicles)
- Server-side timestamps for audit trails

**File Storage**: Firebase Storage
- Vehicle images stored in dealer-specific folders: `/dealers/{uid}/vehicles/{vehicleId}/`
- Images numbered sequentially for 360-degree view ordering
- Public URL generation with download tokens

**Backup/Alternative Storage**: AWS S3 (configured but not actively used)
- SDK initialized in `aws-sdk.js`
- Configuration via environment variables
- Can be integrated for future scaling or backup purposes

### Authentication & Authorization

**Role Hierarchy**:
1. **Super Admin** - Full system access, can create other admins
2. **Admin** - Can create and manage dealer accounts
3. **Dealer Admin** - Can manage their own vehicle inventory
4. **Customer** - View-only access (future implementation)

**Security Implementation**:
- Firebase Custom Claims for role assignment
- Server-side token verification on all API routes
- Client-side route protection via layout components
- Unauthorized users redirected to authentication pages

**Authentication Flow**:
- Email/password authentication via Firebase Auth
- Post-login token retrieval for API authorization
- Layout components verify claims before rendering protected content
- Automatic sign-out on authorization failure

### External Dependencies

**Firebase Services**:
- **Firebase Authentication**: User authentication and custom claims
- **Firebase Firestore**: Primary database for all application data
- **Firebase Storage**: Image and file storage for vehicle media
- **Firebase Admin SDK**: Server-side operations for user management and custom claims

**Third-Party Libraries**:
- **Material-UI (@mui/material)**: UI component library with theming
- **Zustand**: Lightweight state management
- **TanStack Query**: Server state management and caching for vehicle data
- **React Toastify**: User notifications and feedback
- **Three.js / A-Frame / Panolens**: 3D visualization libraries for 360° views
- **UUID**: Unique identifier generation

**Development Tools**:
- **TypeScript**: Type safety and developer experience
- **Tailwind CSS**: Utility-first styling (configured but minimal usage)
- **ESLint**: Code quality and Next.js best practices

**Cloud Services**:
- **Vercel**: Recommended deployment platform (optimized for Next.js)
- **AWS S3**: Configured as alternative storage (credentials via environment variables)

**Integrated Features**:
- **Credit System**: Prepaid/Postpaid plan management with transaction tracking
- **PhonePe Payment Gateway**: Live payment processing with webhook validation
- **Zoho Invoicing**: Automated invoice generation and email delivery
- **Analytics Dashboard**: Real-time reporting and metrics visualization

**Environment Variables Required**:
- Firebase Admin SDK credentials (service account JSON fields)
- PhonePe payment gateway credentials (merchant ID, salt key)
- Zoho Books API credentials (client ID, secret, refresh token)

## Recent Changes (November 17, 2025)

### New Authentication & User Management APIs
Added comprehensive authentication system:
- **Register API** (`POST /api/auth/register`) - Admin-controlled customer registration with plan type selection
- **Login API** (`POST /api/auth/login`) - Secure password verification using Firebase REST API, returns custom and ID tokens
- **User Profile API** (`GET /api/user/profile`) - Retrieve authenticated user's complete profile
- **Get All Users API** (`GET /api/users`) - Admin endpoint for paginated user listing

**Security Enhancements:**
- Implemented `lib/auth-helper.ts` middleware for consistent token verification across routes
- Login endpoint properly validates passwords before issuing tokens (uses Firebase signInWithPassword REST API)
- All new endpoints follow existing authentication patterns with proper error handling

**Environment Configuration:**
- Added `.env.example` with all required environment variables
- Configured dummy/test values for PhonePe (sandbox) and Zoho integrations
- Added `FIREBASE_API_KEY` for password verification in login endpoint

**Documentation:**
- Updated `API_DOCUMENTATION.md` with detailed specs for all new endpoints
- Included request/response examples, error codes, and authentication requirements
- Added environment setup section with configuration instructions

## Previous Changes (November 2025)

### Credit System Implementation
Added comprehensive credit management system with:
- User credit balance tracking (prepaid/postpaid plans)
- Transaction history with pagination
- Credit addition and deduction APIs
- Firestore subcollections for transactions

**New API Routes**:
- `GET /api/credit/balance` - Fetch user credit balance
- `GET /api/credit/transactions` - Get transaction history
- `POST /api/credit/add` - Add credits to user account
- `POST /api/credit/deduct` - Deduct credits from balance

### PhonePe Payment Integration
Integrated PhonePe payment gateway with:
- HMAC-based signature generation for security
- Payment initiation flow with redirect URLs
- Webhook handler for payment status updates
- Automatic credit addition on successful payments
- Payment logging in Firestore

**New API Routes**:
- `POST /api/payment/phonepe/initiate` - Start payment process
- `POST /api/payment/phonepe/webhook` - Handle payment callbacks

### Zoho Books Integration
Automated invoice generation system with:
- Customer creation/lookup in Zoho Books
- Invoice generation for credit purchases
- Automatic invoice email delivery
- OAuth token refresh handling

**New API Routes**:
- `POST /api/invoice/zoho/generate` - Generate and send invoices

### Analytics Dashboard
Admin analytics dashboard with:
- Total users, dealers, revenue metrics
- Revenue tracking by date
- Top 10 active users ranking
- Real-time data from Firestore

**New API Routes**:
- `GET /api/analytics/stats` - Fetch analytics data

**New UI Pages**:
- `/analytics` - Admin analytics dashboard with charts and metrics

### Firestore Collections

**users/{userId}**:
```
{
  userId, name, email, role,
  planType: 'prepaid' | 'postpaid',
  creditBalance: number,
  createdAt, updatedAt
}
```

**users/{userId}/transactions/{txnId}**:
```
{
  id, type, amount, description,
  timestamp, balanceAfter, metadata
}
```

**payments/{paymentId}**:
```
{
  id, userId, amount, status,
  paymentMethod, phonePeTransactionId,
  zohoInvoiceId, timestamp, webhookData
}
```