import { adminFirestore } from '../app/api/firebaseadmin';

export interface AppConfig {
  version: string;
  timestamp: string;
  appUpdate: {
    isUpdateRequired: boolean;
    minimumVersion: string;
    latestVersion: string;
    forceUpdate: boolean;
    updateMessage: string;
  };
  creditRates: {
    singleImage: {
      credits: number;
      description: string;
    };
    multipleImages: {
      creditsPerImage: number;
      minimumImages: number;
      maximumImages: number;
      bulkDiscount: {
        enabled: boolean;
        threshold: number;
        discountedRate: number;
      };
    };
    video?: {
      credits: number;
      description: string;
    };
  };
  features: {
    singleImageEnabled: boolean;
    multipleImagesEnabled: boolean;
    maxUploadSizeMB: number;
  };
  payments: {
    rechargeOptions: Array<{
      credits: number;
      price: number;
      currency: string;
      savings?: number;
    }>;
  };
}

/**
 * Get current app configuration from Firestore
 */
export async function getAppConfig(): Promise<AppConfig | null> {
  try {
    const configDoc = await adminFirestore
      .collection('appConfig')
      .doc('current')
      .get();

    if (!configDoc.exists) {
      return null;
    }

    return configDoc.data() as AppConfig;
  } catch (error) {
    console.error('Error fetching app config:', error);
    return null;
  }
}

/**
 * Compare version strings (e.g., "1.2.3")
 * Returns: positive if v1 > v2, negative if v1 < v2, 0 if equal
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;
    
    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }
  
  return 0;
}

/**
 * Check if app version update is required
 */
export function checkAppUpdate(
  currentVersion: string,
  minimumVersion: string,
  latestVersion: string,
  forceUpdate: boolean
): {
  isUpdateRequired: boolean;
  forceUpdate: boolean;
} {
  const isBelowMinimum = compareVersions(currentVersion, minimumVersion) < 0;
  const isBelowLatest = compareVersions(currentVersion, latestVersion) < 0;

  return {
    isUpdateRequired: isBelowMinimum || isBelowLatest,
    forceUpdate: isBelowMinimum && forceUpdate,
  };
}

/**
 * Calculate credits required for image processing
 */
export function calculateImageProcessingCredits(
  config: AppConfig,
  imageCount: number,
  processingType: 'singleImage' | 'multipleImages'
): {
  credits: number;
  originalCredits?: number;
  discountApplied: boolean;
  savings?: number;
} {
  if (processingType === 'singleImage') {
    if (imageCount !== 1) {
      throw new Error('Single image processing requires exactly 1 image');
    }
    
    const credits = config.creditRates.singleImage.credits;
    return {
      credits,
      discountApplied: false,
    };
  }

  // Multiple images processing
  if (imageCount < config.creditRates.multipleImages.minimumImages) {
    throw new Error(
      `Minimum ${config.creditRates.multipleImages.minimumImages} images required for 360° view`
    );
  }

  if (imageCount > config.creditRates.multipleImages.maximumImages) {
    throw new Error(
      `Maximum ${config.creditRates.multipleImages.maximumImages} images allowed`
    );
  }

  const standardRate = config.creditRates.multipleImages.creditsPerImage;
  const bulkDiscount = config.creditRates.multipleImages.bulkDiscount;

  let credits = imageCount * standardRate;
  let discountApplied = false;
  let savings = 0;

  // Apply bulk discount if enabled and threshold is met
  if (
    bulkDiscount.enabled &&
    imageCount >= bulkDiscount.threshold
  ) {
    const discountedCredits = imageCount * bulkDiscount.discountedRate;
    savings = credits - discountedCredits;
    credits = discountedCredits;
    discountApplied = true;
  }

  return {
    credits,
    originalCredits: discountApplied ? imageCount * standardRate : undefined,
    discountApplied,
    savings: discountApplied ? savings : undefined,
  };
}





