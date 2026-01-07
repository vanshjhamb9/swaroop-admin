/**
 * Seed script to create initial app configuration
 * Run with: tsx -r dotenv/config scripts/seed-config.ts
 */

import { adminFirestore } from '../app/api/firebaseadmin';
import { AppConfig } from '../lib/config-helper';

const defaultConfig: AppConfig = {
  version: '1.0',
  timestamp: new Date().toISOString(),
  appUpdate: {
    isUpdateRequired: false,
    minimumVersion: '1.0.0',
    latestVersion: '1.0.0',
    forceUpdate: false,
    updateMessage: 'New features available! Update now.',
  },
  creditRates: {
    singleImage: {
      credits: 10,
      description: 'Background removal + AI background',
    },
    multipleImages: {
      creditsPerImage: 8,
      minimumImages: 8,
      maximumImages: 24,
      bulkDiscount: {
        enabled: true,
        threshold: 12,
        discountedRate: 7,
      },
    },
    video: {
      credits: 50,
      description: 'Video processing',
    },
  },
  features: {
    singleImageEnabled: true,
    multipleImagesEnabled: true,
    maxUploadSizeMB: 10,
  },
  payments: {
    rechargeOptions: [
      {
        credits: 100,
        price: 99,
        currency: 'INR',
      },
      {
        credits: 500,
        price: 449,
        currency: 'INR',
        savings: 50,
      },
      {
        credits: 1000,
        price: 849,
        currency: 'INR',
        savings: 150,
      },
    ],
  },
};

async function seedConfig() {
  try {
    console.log('🌱 Seeding app configuration...');

    const configRef = adminFirestore.collection('appConfig').doc('current');
    await configRef.set(defaultConfig);

    console.log('✅ App configuration seeded successfully!');
    console.log('\n📋 Configuration:');
    console.log(JSON.stringify(defaultConfig, null, 2));
  } catch (error) {
    console.error('❌ Error seeding config:', error);
    process.exit(1);
  }
}

seedConfig();





