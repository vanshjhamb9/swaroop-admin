# 🚀 Swaroop Admin — Production API Reference for APK Developer

> **Base URL:** `https://www.urbanuplink.ai`  
> **⚠️ IMPORTANT:** Always use `www.urbanuplink.ai` (with `www`), NOT `urbanuplink.ai`. The non-www domain causes a redirect that strips the `Authorization` header.  
> **Generated:** 16 Feb 2026, 11:05 PM IST  
> **Status:** ✅ All APIs verified and working on production

---

## 🔐 Authentication

All protected endpoints require the `Authorization` header:
```
Authorization: Bearer <idToken>
```

The `idToken` is obtained from the login response. It is a long JWT string starting with `ey...`.

> **⚠️ COMMON ERROR:** If you see `"Decoding Firebase ID token failed"`, it means you are sending an invalid string (like `"undefined"`, `"null"`, or a malformed token). Ensure you are waiting for the login to complete and extracting the `idToken` correctly before making API calls.

It expires after **1 hour**. Use the `refreshToken` to get a new `idToken` when it expires.

---

## 1. POST `/api/auth/login`

**Description:** Authenticate a user and get tokens.  
**Auth Required:** No

### Request
```bash
curl -X POST https://www.urbanuplink.ai/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dealer1@car360.com","password":"Dealer123"}'
```

### Request Body
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

### ✅ Success Response — `200 OK`
```json
{
  "success": true,
  "data": {
    "customToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImY1MzMwMzNh...",
    "refreshToken": "AMf-vBxtHX9bPJ-Iy9XdjVnSIEPXFEV3FNZR...",
    "user": {
      "uid": "LDx6SRPn3GPiGUbfeTjUOia4bCI2",
      "email": "dealer1@car360.com",
      "name": "Elite Auto Sales",
      "role": "dealeradmin",
      "planType": "prepaid",
      "creditBalance": 0
    }
  }
}
```

### User Roles
| Role | Value | Description |
|------|-------|-------------|
| Super Admin | `"admin"` | Full system access |
| Dealer Admin | `"dealeradmin"` | Manage own vehicles |
| Customer | `"customer"` | View vehicles, manage credits |

### ❌ Error Response — `401 Unauthorized`
```json
{
  "error": "Invalid credentials"
}
```

### ❌ Error Response — `400 Bad Request`
```json
{
  "error": "Email and password are required"
}
```

---

## 2. GET `/api/vehicles/list`

**Description:** List all vehicles for the authenticated dealer.  
**Auth Required:** Yes (Dealer token)

### Request
```bash
curl -X GET https://www.urbanuplink.ai/api/vehicles/list \
  -H "Authorization: Bearer <idToken>"
```

### ✅ Success Response — `200 OK`
```json
{
  "vehicles": [
    {
      "id": "9kkdaoSW4Vu7CrqbvU7U",
      "name": "BMW 3 Series",
      "model": "320d Sport",
      "registration": "MH-02-CD-5678",
      "experienceName": "",
      "images": [],
      "imageCount": 0,
      "createdAt": {
        "_seconds": 1771260148,
        "_nanoseconds": 386000000
      }
    },
    {
      "id": "eOup9SoYYYj0VZCfwIXl",
      "name": "Audi A4",
      "model": "Premium Plus",
      "registration": "MH-02-EF-9012",
      "experienceName": "",
      "images": [],
      "imageCount": 0,
      "createdAt": {
        "_seconds": 1771260148,
        "_nanoseconds": 680000000
      }
    },
    {
      "id": "wumxdy218NRQqLzpRT5d",
      "name": "Mercedes-Benz C-Class",
      "model": "C 220d",
      "registration": "MH-02-AB-1234",
      "experienceName": "",
      "images": [],
      "imageCount": 0,
      "createdAt": {
        "_seconds": 1771260148,
        "_nanoseconds": 64000000
      }
    }
  ]
}
```

### ❌ Error Response — `401 Unauthorized`
```json
{
  "error": "Unauthorized"
}
```

---

## 3. GET `/api/experiences/list`

**Description:** List all experiences for the authenticated dealer, grouped by experience name with their vehicles.  
**Auth Required:** Yes (Dealer token)

### Request
```bash
curl -X GET https://www.urbanuplink.ai/api/experiences/list \
  -H "Authorization: Bearer <idToken>"
```

### ✅ Success Response — `200 OK`
```json
{
  "success": true,
  "data": {
    "experiences": [
      {
        "name": "Showroom Experience",
        "vehicleCount": 3,
        "totalImages": 5,
        "vehicles": [
          {
            "id": "9kkdaoSW4Vu7CrqbvU7U",
            "name": "BMW 3 Series",
            "model": "320d Sport",
            "registration": "MH-02-CD-5678",
            "images": [],
            "imageCount": 0,
            "createdAt": {
              "_seconds": 1771260148,
              "_nanoseconds": 386000000
            }
          },
          {
            "id": "eOup9SoYYYj0VZCfwIXl",
            "name": "Audi A4",
            "model": "Premium Plus",
            "registration": "MH-02-EF-9012",
            "images": [],
            "imageCount": 0,
            "createdAt": {
              "_seconds": 1771260148,
              "_nanoseconds": 680000000
            }
          }
        ],
        "createdAt": {
          "_seconds": 1771260148,
          "_nanoseconds": 64000000
        },
        "updatedAt": {
          "_seconds": 1771263247,
          "_nanoseconds": 219000000
        }
      },
      {
        "name": "360 View",
        "vehicleCount": 1,
        "totalImages": 0,
        "vehicles": [
          {
            "id": "Jz5InJwT8XEYpX9O6Epc",
            "name": "Mercedes-Benz C-Class",
            "model": "C 220d",
            "registration": "MH-02-AB-1234",
            "images": [],
            "imageCount": 0,
            "createdAt": {
              "_seconds": 1771262838,
              "_nanoseconds": 359000000
            },
            "updatedAt": {
              "_seconds": 1771262838,
              "_nanoseconds": 359000000
            }
          }
        ],
        "createdAt": {
          "_seconds": 1771262838,
          "_nanoseconds": 359000000
        },
        "updatedAt": {
          "_seconds": 1771262838,
          "_nanoseconds": 359000000
        }
      }
    ],
    "totalExperiences": 2,
    "totalVehicles": 6
  }
}
```

### ❌ Error Response — `401 Unauthorized`
```json
{
  "error": "Unauthorized"
}
```

---

## 4. POST `/api/vehicles/create`


**Description:** Create a new vehicle. Supports both JSON (no images) and Multipart (with images).  
**Auth Required:** Yes (Dealer token)

### Option A: JSON Request (No Images)
```bash
curl -X POST https://www.urbanuplink.ai/api/vehicles/create \
  -H "Authorization: Bearer <idToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Honda City",
    "model": "V CVT",
    "registration": "MH-01-XX-1234",
    "experienceName": "Showroom",
    "imageCount": 0
  }'
```

### Option B: Multipart Request (With Images)
```bash
curl -X POST https://www.urbanuplink.ai/api/vehicles/create \
  -H "Authorization: Bearer <idToken>" \
  -F 'name=Tata Nexon' \
  -F 'model=XZ Plus' \
  -F 'registration=MH-04-YY-5678' \
  -F 'experienceName=360 View' \
  -F 'imageCount=1' \
  -F 'images=@/path/to/image.png'
```

### Request Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Vehicle name |
| `model` | string | ✅ | Vehicle model |
| `registration` | string | ✅ | Registration number |
| `experienceName` | string | ❌ | Experience/showcase name |
| `imageCount` | number | ❌ | Number of images |
| `images` | file(s) | ❌ | Image files (multipart only) |

### ✅ Success Response — `200 OK`
```json
{
  "id": "R3OzchAZBExxOyLBfAz5",
  "message": "Vehicle created successfully",
  "images": []
}
```

### ✅ Success Response (with images) — `200 OK`
```json
{
  "id": "xYz123AbC",
  "message": "Vehicle created successfully",
  "images": [
    "https://storage.googleapis.com/uplai-aeff0.firebasestorage.app/dealers/<dealerId>/vehicles/<timestamp>/image.png"
  ]
}
```

### ❌ Error Response — `400 Bad Request`
```json
{
  "error": "Missing required fields"
}
```

---

## 4. POST `/api/vehicles/update`

**Description:** Update an existing vehicle.  
**Auth Required:** Yes (Dealer token)

### Request
```bash
curl -X POST https://www.urbanuplink.ai/api/vehicles/update \
  -H "Authorization: Bearer <idToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "<vehicle-doc-id>",
    "name": "Updated Name",
    "model": "Updated Model",
    "registration": "MH-01-XX-9999"
  }'
```

---

## 5. DELETE `/api/vehicles/delete`

**Description:** Delete a vehicle.  
**Auth Required:** Yes (Dealer token)  
**⚠️ HTTP Method:** `DELETE` (not POST)

### Request
```bash
curl -X DELETE https://www.urbanuplink.ai/api/vehicles/delete \
  -H "Authorization: Bearer <idToken>" \
  -H "Content-Type: application/json" \
  -d '{"vehicleId":"<vehicle-doc-id>"}'
```

### ✅ Success Response — `200 OK`
```json
{
  "message": "Vehicle deleted successfully"
}
```

---

## 6. GET `/api/vehicles/export`

**Description:** Export vehicles data.  
**Auth Required:** Yes (Dealer token)

### Request
```bash
curl -X GET https://www.urbanuplink.ai/api/vehicles/export \
  -H "Authorization: Bearer <idToken>"
```

---

## 7. GET `/api/dealer/info`

**Description:** Get dealer information.  
**Auth Required:** Yes (Dealer token)

### Request
```bash
curl -X GET https://www.urbanuplink.ai/api/dealer/info \
  -H "Authorization: Bearer <idToken>"
```

---

## 8. GET `/api/dealer/profile`

**Description:** Get dealer profile details.  
**Auth Required:** Yes (Dealer token)

### Request
```bash
curl -X GET https://www.urbanuplink.ai/api/dealer/profile \
  -H "Authorization: Bearer <idToken>"
```

---

## 9. GET `/api/credit/balance`

**Description:** Get credit balance for the authenticated user.  
**Auth Required:** Yes

### Request
```bash
curl -X GET https://www.urbanuplink.ai/api/credit/balance \
  -H "Authorization: Bearer <idToken>"
```

---

## 10. GET `/api/credit/transactions`

**Description:** Get credit transaction history.  
**Auth Required:** Yes

### Request
```bash
curl -X GET https://www.urbanuplink.ai/api/credit/transactions \
  -H "Authorization: Bearer <idToken>"
```

---

## 11. POST `/api/credit/add`

**Description:** Add credits to a user account.  
**Auth Required:** Yes (Admin token)

### Request
```bash
curl -X POST https://www.urbanuplink.ai/api/credit/add \
  -H "Authorization: Bearer <idToken>" \
  -H "Content-Type: application/json" \
  -d '{"userId": "<uid>", "amount": 1000, "reason": "Manual top-up"}'
```

---

## 12. POST `/api/credit/deduct`

**Description:** Deduct credits from a user account.  
**Auth Required:** Yes (Admin token)

### Request
```bash
curl -X POST https://www.urbanuplink.ai/api/credit/deduct \
  -H "Authorization: Bearer <idToken>" \
  -H "Content-Type: application/json" \
  -d '{"userId": "<uid>", "amount": 500, "reason": "Image processing"}'
```

---

## 13. POST `/api/image/process`

**Description:** Submit an image for processing.  
**Auth Required:** Yes

### Request
```bash
curl -X POST https://www.urbanuplink.ai/api/image/process \
  -H "Authorization: Bearer <idToken>" \
  -F 'image=@/path/to/image.jpg'
```

---

## 14. GET `/api/image/process/status`

**Description:** Check image processing status.  
**Auth Required:** Yes

### Request
```bash
curl -X GET https://www.urbanuplink.ai/api/image/process/status?jobId=<jobId> \
  -H "Authorization: Bearer <idToken>"
```

---

## 15. GET `/api/user/profile`

**Description:** Get the authenticated user's profile.  
**Auth Required:** Yes

### Request
```bash
curl -X GET https://www.urbanuplink.ai/api/user/profile \
  -H "Authorization: Bearer <idToken>"
```

---

## 16. POST `/api/payment/phonepe/initiate`

**Description:** Initiate a PhonePe payment.  
**Auth Required:** Yes

### Request
```bash
curl -X POST https://www.urbanuplink.ai/api/payment/phonepe/initiate \
  -H "Authorization: Bearer <idToken>" \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "userId": "<uid>"}'
```

---

## 17. GET `/api/payment/phonepe/status`

**Description:** Check PhonePe payment status.  
**Auth Required:** Yes

### Request
```bash
curl -X GET https://www.urbanuplink.ai/api/payment/phonepe/status?transactionId=<txnId> \
  -H "Authorization: Bearer <idToken>"
```

---

## 18. Admin-Only APIs

### GET `/api/admin/dashboard`
```bash
curl -X GET https://www.urbanuplink.ai/api/admin/dashboard \
  -H "Authorization: Bearer <adminIdToken>"
```

### GET `/api/dealers` (List all dealers)
```bash
curl -X GET https://www.urbanuplink.ai/api/dealers \
  -H "Authorization: Bearer <adminIdToken>"
```

### GET `/api/users` (List all users)
```bash
curl -X GET https://www.urbanuplink.ai/api/users \
  -H "Authorization: Bearer <adminIdToken>"
```

### POST `/api/createDealerAdmin`
```bash
curl -X POST https://www.urbanuplink.ai/api/createDealerAdmin \
  -H "Authorization: Bearer <adminIdToken>" \
  -H "Content-Type: application/json" \
  -d '{"email":"newdealer@example.com","password":"DealerPass123","name":"New Dealer","phone":"+919876543210"}'
```

### GET `/api/analytics/stats`
```bash
curl -X GET https://www.urbanuplink.ai/api/analytics/stats \
  -H "Authorization: Bearer <adminIdToken>"
```

---

## 📋 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `superadmin@car360.com` | `SuperAdmin123` |
| Admin 1 | `admin1@car360.com` | `Admin123` |
| Dealer 1 | `dealer1@car360.com` | `Dealer123` |
| Dealer 2 | `dealer2@car360.com` | `Dealer123` |
| Dealer 3 | `dealer3@car360.com` | `Dealer123` |
| Customer 1 | `customer1@gmail.com` | `Customer123` |
| Customer 2 | `customer2@gmail.com` | `Customer123` |

---

## ⚡ Quick Start for APK

### Step 1: Login and store the token
```kotlin
// Android/Kotlin example
val response = api.login("dealer1@car360.com", "Dealer123")
val idToken = response.data.idToken
val refreshToken = response.data.refreshToken
// Store both tokens securely
```

### Step 2: Use idToken for all subsequent API calls
```kotlin
// Add to all requests
headers["Authorization"] = "Bearer $idToken"
```

### Step 3: Handle token expiry
- `idToken` expires after **1 hour**
- When you get a `401` response, use the `refreshToken` to get a new `idToken`:
```bash
POST https://securetoken.googleapis.com/v1/token?key=AIzaSyCsXKA7YTGRlpyTHm7042dxSBXrOQNXMRk
Content-Type: application/json

{
  "grant_type": "refresh_token",
  "refresh_token": "<refreshToken>"
}
```

### Response:
```json
{
  "access_token": "<new idToken>",
  "expires_in": "3600",
  "token_type": "Bearer",
  "refresh_token": "<new refreshToken>"
}
```

---

## 🔑 Firebase Config (for client-side SDK if needed)

```json
{
  "apiKey": "AIzaSyCsXKA7YTGRlpyTHm7042dxSBXrOQNXMRk",
  "authDomain": "uplai-aeff0.firebaseapp.com",
  "projectId": "uplai-aeff0",
  "storageBucket": "uplai-aeff0.firebasestorage.app",
  "messagingSenderId": "936722319294",
  "appId": "1:936722319294:web:1769182224440382bfdbef",
  "measurementId": "G-HHPE50DRNV"
}
```

---

## ✅ Production Status (Verified 16 Feb 2026)

| API | Method | Status |
|-----|--------|--------|
| `/api/auth/login` | POST | ✅ Working |
| `/api/vehicles/list` | GET | ✅ Working |
| `/api/vehicles/create` (JSON) | POST | ✅ Working |
| `/api/vehicles/create` (Multipart) | POST | ✅ Working |
| `/api/vehicles/delete` | DELETE | ✅ Working |
| Auth Guard (no token) | - | ✅ Returns 401 |
| Invalid credentials | - | ✅ Returns 401 |