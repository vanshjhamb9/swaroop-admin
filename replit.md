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
- `/api/createAdmin` - Creates admin accounts with custom claims
- `/api/createDealerAdmin` - Creates dealer admin accounts
- `/api/verifyAdmin` - Verifies admin privileges
- All routes implement token-based authentication using Firebase Admin SDK

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

**Planned Integrations** (from attached assets):
- **PhonePe Payment Gateway**: For credit system payments
- **Zoho Invoicing**: For automated invoice generation
- **Analytics Module**: For usage tracking and reporting

**Environment Variables Required**:
- Firebase Admin SDK credentials (service account JSON fields)
- Firebase client configuration (API key, project ID, etc.)
- AWS credentials (access key, secret key, region)