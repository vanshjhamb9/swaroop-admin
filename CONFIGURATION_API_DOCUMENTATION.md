# Configuration & Image Processing API Documentation

**Last Updated:** 2025-01-16

This document details the new Configuration API and Image Processing endpoints.

---

## Configuration APIs

### 1. Get App Configuration
**GET** `/api/config/app`

Get dynamic configuration values including credit rates, app update information, and feature flags.

**Headers:**
```
Authorization: Bearer <firebase-id-token>
```

**Query Parameters:**
- `appVersion` (required): Current app version (e.g., "1.2.3")
- `platform` (required): "ios" or "android"

**Example Request:**
```http
GET /api/config/app?appVersion=1.2.3&platform=android
Authorization: Bearer <firebase-token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "version": "1.0",
    "timestamp": "2025-01-16T10:30:00.000Z",
    "appUpdate": {
      "isUpdateRequired": false,
      "minimumVersion": "1.2.0",
      "latestVersion": "1.2.5",
      "forceUpdate": false,
      "updateMessage": "New features available! Update now."
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
      }
    },
    "features": {
      "singleImageEnabled": true,
      "multipleImagesEnabled": true,
      "maxUploadSizeMB": 10
    },
    "payments": {
      "rechargeOptions": [
        {
          "credits": 100,
          "price": 99,
          "currency": "INR"
        },
        {
          "credits": 500,
          "price": 449,
          "currency": "INR",
          "savings": 50
        }
      ]
    }
  }
}
```

**Error Responses:**
- `400`: Missing or invalid query parameters
- `401`: Missing or invalid authorization header
- `500`: Configuration not found

**Cache:** Response is cached for 5 minutes.

---

### 2. Get Configuration (Admin)
**GET** `/api/config/manage`

Get current configuration for admin panel editing. **Requires admin authentication.**

**Headers:**
```
Authorization: Bearer <admin-firebase-token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "version": "1.0",
    "timestamp": "2025-01-16T10:30:00.000Z",
    "appUpdate": { ... },
    "creditRates": { ... },
    "features": { ... },
    "payments": { ... }
  }
}
```

---

### 3. Update Configuration (Admin)
**PUT** `/api/config/manage`

Update app configuration. **Requires admin authentication.**

**Headers:**
```
Authorization: Bearer <admin-firebase-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "version": "1.0",
  "appUpdate": {
    "minimumVersion": "1.2.0",
    "latestVersion": "1.2.5",
    "forceUpdate": false,
    "updateMessage": "New features available! Update now."
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
    }
  },
  "features": {
    "singleImageEnabled": true,
    "multipleImagesEnabled": true,
    "maxUploadSizeMB": 10
  },
  "payments": {
    "rechargeOptions": [
      {
        "credits": 100,
        "price": 99,
        "currency": "INR"
      },
      {
        "credits": 500,
        "price": 449,
        "currency": "INR",
        "savings": 50
      }
    ]
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Configuration updated successfully",
  "data": { ... }
}
```

**Error Responses:**
- `400`: Missing or invalid fields
- `401`: Missing or invalid authorization header
- `403`: Admin access required
- `500`: Failed to update configuration

---

## Image Processing APIs

### 4. Estimate Processing Credits
**GET** `/api/image/process/estimate`

Estimate credits required for image processing without deducting credits.

**Headers:**
```
Authorization: Bearer <firebase-id-token>
```

**Query Parameters:**
- `imageCount` (required): Number of images (integer)
- `processingType` (required): "singleImage" or "multipleImages"

**Example Request:**
```http
GET /api/image/process/estimate?imageCount=15&processingType=multipleImages
Authorization: Bearer <firebase-token>
```

**Response (200):**
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
      "minimumImages": 8,
      "maximumImages": 24,
      "bulkDiscount": {
        "enabled": true,
        "threshold": 12,
        "discountedRate": 7
      }
    }
  }
}
```

**Error Responses:**
- `400`: Missing or invalid query parameters, or validation error
- `401`: Missing or invalid authorization header
- `500`: Configuration not found or calculation error

**Example Scenarios:**

1. **Single Image (10 credits):**
   ```json
   {
     "imageCount": 1,
     "processingType": "singleImage",
     "credits": 10,
     "discountApplied": false
   }
   ```

2. **Multiple Images - No Discount (10 images × 8 = 80 credits):**
   ```json
   {
     "imageCount": 10,
     "processingType": "multipleImages",
     "credits": 80,
     "discountApplied": false
   }
   ```

3. **Multiple Images - With Discount (15 images × 7 = 105 credits):**
   ```json
   {
     "imageCount": 15,
     "processingType": "multipleImages",
     "credits": 105,
     "originalCredits": 120,
     "discountApplied": true,
     "savings": 15
   }
   ```

---

### 5. Process Images
**POST** `/api/image/process`

Process images with automatic credit deduction based on configuration.

**Headers:**
```
Authorization: Bearer <firebase-id-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "imageCount": 15,
  "processingType": "multipleImages",
  "imageUrls": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg",
    "..."
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "jobId": "job-abc123",
    "creditsDeducted": 105,
    "newBalance": 395,
    "discountApplied": true,
    "savings": 15,
    "transaction": {
      "id": "txn-abc123",
      "type": "debit",
      "amount": 105,
      "description": "Image processing: multipleImages (15 images)",
      "timestamp": "2025-01-16T10:30:00.000Z",
      "balanceAfter": 395,
      "metadata": {
        "processingType": "multipleImages",
        "imageCount": 15,
        "discountApplied": true,
        "savings": 15,
        "originalCredits": 120
      }
    },
    "message": "Images queued for processing"
  }
}
```

**Error Responses:**
- `400`: Missing or invalid fields, insufficient credits, or validation error
- `401`: Missing or invalid authorization header
- `403`: Feature disabled
- `404`: User not found
- `500`: Processing error

**Validation Rules:**
- `imageCount` must match `imageUrls.length`
- `processingType` must be "singleImage" or "multipleImages"
- For "singleImage": must be exactly 1 image
- For "multipleImages": must be between minimumImages and maximumImages
- User must have sufficient credits (for prepaid users)

---

### 6. Get Processing Job Status
**GET** `/api/image/process/status`

Get status of an image processing job.

**Headers:**
```
Authorization: Bearer <firebase-id-token>
```

**Query Parameters:**
- `jobId` (required): Processing job ID

**Example Request:**
```http
GET /api/image/process/status?jobId=job-abc123
Authorization: Bearer <firebase-token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "job-abc123",
    "userId": "user123",
    "processingType": "multipleImages",
    "imageUrls": ["..."],
    "imageCount": 15,
    "status": "pending",
    "creditsDeducted": 105,
    "createdAt": "2025-01-16T10:30:00.000Z",
    "updatedAt": "2025-01-16T10:30:00.000Z"
  }
}
```

**Job Status Values:**
- `pending`: Job is queued for processing
- `processing`: Job is currently being processed
- `completed`: Job completed successfully
- `failed`: Job failed to process

**Error Responses:**
- `400`: Missing jobId parameter
- `401`: Missing or invalid authorization header
- `403`: Unauthorized to access this job
- `404`: Processing job not found

---

## Credit Calculation Logic

### Single Image Processing
```
Credits = creditRates.singleImage.credits
Example: 10 credits per image
```

### Multiple Images Processing
```
If imageCount < bulkDiscount.threshold:
  Credits = imageCount × creditsPerImage
  Example: 10 images × 8 = 80 credits

If imageCount >= bulkDiscount.threshold AND bulkDiscount.enabled:
  Credits = imageCount × discountedRate
  Savings = (imageCount × creditsPerImage) - Credits
  Example: 15 images × 7 = 105 credits (saved 15 credits)
```

---

## Mobile App Integration Flow

### Step 1: On App Launch
```typescript
// Fetch configuration
const configResponse = await fetch(
  `${API_BASE_URL}/api/config/app?appVersion=1.2.3&platform=android`,
  {
    headers: {
      'Authorization': `Bearer ${idToken}`
    }
  }
);
const { data: config } = await configResponse.json();

// Check for app updates
if (config.appUpdate.isUpdateRequired) {
  if (config.appUpdate.forceUpdate) {
    // Block app and show update screen
    showForceUpdateScreen(config.appUpdate.updateMessage);
  } else {
    // Show optional update prompt
    showUpdatePrompt(config.appUpdate.updateMessage);
  }
}

// Cache configuration locally
localStorage.setItem('appConfig', JSON.stringify(config));
localStorage.setItem('configTimestamp', Date.now().toString());
```

### Step 2: Before Uploading Images
```typescript
// Get estimate
const estimateResponse = await fetch(
  `${API_BASE_URL}/api/image/process/estimate?imageCount=${imageCount}&processingType=${processingType}`,
  {
    headers: {
      'Authorization': `Bearer ${idToken}`
    }
  }
);
const { data: estimate } = await estimateResponse.json();

// Display to user
displayCost(estimate.credits, estimate.discountApplied, estimate.savings);

// Check balance
if (userBalance < estimate.credits) {
  showInsufficientCreditsMessage();
  return;
}
```

### Step 3: Process Images
```typescript
// Upload images first (get URLs)
const imageUrls = await uploadImages(images);

// Process images
const processResponse = await fetch(
  `${API_BASE_URL}/api/image/process`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      imageCount: imageUrls.length,
      processingType: 'multipleImages',
      imageUrls: imageUrls
    })
  }
);

const { data } = await processResponse.json();

// Update local balance
updateUserBalance(data.newBalance);

// Poll for job status
pollJobStatus(data.jobId);
```

### Step 4: Poll Job Status
```typescript
async function pollJobStatus(jobId: string) {
  const interval = setInterval(async () => {
    const statusResponse = await fetch(
      `${API_BASE_URL}/api/image/process/status?jobId=${jobId}`,
      {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      }
    );
    
    const { data: job } = await statusResponse.json();
    
    if (job.status === 'completed') {
      clearInterval(interval);
      showProcessedImages(job.processedImages);
    } else if (job.status === 'failed') {
      clearInterval(interval);
      showErrorMessage(job.error);
    }
  }, 2000); // Poll every 2 seconds
}
```

---

## Initial Setup

### 1. Seed Configuration

Run the seed script to create initial configuration:

```bash
npm run seed-config
```

Or manually create the configuration in Firestore:
- Collection: `appConfig`
- Document ID: `current`
- Data: (see default configuration in `scripts/seed-config.ts`)

### 2. Firestore Structure

```
appConfig/
  ├── current/          (Current active configuration)
  └── history_*/        (Configuration change history)
```

### 3. Processing Jobs Structure

```
processingJobs/
  └── {jobId}/          (Processing job documents)
      - id
      - userId
      - processingType
      - imageUrls
      - imageCount
      - status
      - creditsDeducted
      - createdAt
      - updatedAt
```

---

## Testing

### Test Configuration API
```bash
curl -X GET "http://localhost:5000/api/config/app?appVersion=1.2.3&platform=android" \
  -H "Authorization: Bearer <token>"
```

### Test Estimate
```bash
curl -X GET "http://localhost:5000/api/image/process/estimate?imageCount=15&processingType=multipleImages" \
  -H "Authorization: Bearer <token>"
```

### Test Processing
```bash
curl -X POST "http://localhost:5000/api/image/process" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "imageCount": 15,
    "processingType": "multipleImages",
    "imageUrls": ["https://example.com/image1.jpg"]
  }'
```

---

## Notes

1. **Credit Calculation:** Credits are calculated on the backend using the same configuration values shown to users, ensuring consistency.

2. **Bulk Discounts:** Discounts are automatically applied when the threshold is met. The calculation happens both in the estimate and actual processing.

3. **Feature Flags:** If a feature is disabled via configuration, the processing endpoint will reject the request with a 403 error.

4. **Version Management:** The configuration API compares the user's app version with minimum and latest versions to determine if updates are required.

5. **Configuration History:** All configuration changes are saved to history for auditing purposes.

6. **Job Status:** Processing jobs can be tracked using the status endpoint. The actual image processing logic (background removal, 360° view generation) should be implemented separately.

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-16





