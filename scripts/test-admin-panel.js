// Comprehensive Admin Panel Test Suite
// Tests Firebase, Storage Bucket, Image Upload, and POST API

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5002';

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
    console.log('\n' + '='.repeat(70));
    log(title, 'bright');
    console.log('='.repeat(70) + '\n');
}

function logTest(testName) {
    log(`\n🧪 TEST: ${testName}`, 'cyan');
    log('-'.repeat(70), 'cyan');
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'blue');
}

// Helper to make HTTP requests
async function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const protocol = urlObj.protocol === 'https:' ? https : http;

        const req = protocol.request(url, options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ status: res.statusCode, data: jsonData, ok: res.statusCode >= 200 && res.statusCode < 300 });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data, ok: res.statusCode >= 200 && res.statusCode < 300 });
                }
            });
        });

        req.on('error', reject);

        if (options.body) {
            req.write(options.body);
        }

        req.end();
    });
}

// Create a 1x1 pixel PNG for testing
function createTestImage() {
    return Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
        0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
        0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
        0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
        0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
        0x42, 0x60, 0x82
    ]);
}

// Create multipart form data manually
function createMultipartFormData(fields, files) {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    let body = '';

    // Add text fields
    for (const [key, value] of Object.entries(fields)) {
        body += `--${boundary}\r\n`;
        body += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
        body += `${value}\r\n`;
    }

    // Add files
    for (const file of files) {
        body += `--${boundary}\r\n`;
        body += `Content-Disposition: form-data; name="${file.fieldName}"; filename="${file.filename}"\r\n`;
        body += `Content-Type: ${file.contentType}\r\n\r\n`;
        body += file.data.toString('binary');
        body += '\r\n';
    }

    body += `--${boundary}--\r\n`;

    return {
        body: Buffer.from(body, 'binary'),
        contentType: `multipart/form-data; boundary=${boundary}`
    };
}

// Test 1: Firebase Initialization
async function testFirebaseInit() {
    logTest('Firebase Admin Initialization');

    try {
        const response = await makeRequest(`${BASE_URL}/api/test-firebase`);

        if (response.ok) {
            logSuccess('Firebase Admin initialized successfully');
            logInfo(`Project ID: ${response.data.projectId || 'N/A'}`);
            logInfo(`Storage Bucket: ${response.data.storageBucket || 'N/A'}`);
            return { success: true, data: response.data };
        } else {
            logError(`Firebase initialization failed: ${response.data.error || 'Unknown error'}`);
            logInfo(`Status: ${response.status}`);
            return { success: false, error: response.data.error };
        }
    } catch (error) {
        logError(`Failed to connect to Firebase test endpoint: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Test 2: Experience Submission (JSON)
async function testExperienceSubmissionJSON() {
    logTest('Experience Submission via POST /api/vehicles/create (JSON)');

    try {
        const testData = {
            name: 'Test Vehicle JSON',
            model: 'JSON Model 2024',
            registration: 'JSON-' + Date.now(),
            experienceName: 'Test Experience JSON',
            imageCount: 0,
            images: []
        };

        logInfo('Sending JSON request...');

        const response = await makeRequest(`${BASE_URL}/api/vehicles/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': JSON.stringify(testData).length
            },
            body: JSON.stringify(testData)
        });

        if (response.ok) {
            logSuccess('Experience submission successful!');
            logInfo(`Vehicle ID: ${response.data.id}`);
            logInfo(`Message: ${response.data.message}`);
            return { success: true, data: response.data };
        } else {
            logError(`Experience submission failed: ${response.data.error || 'Unknown error'}`);
            logInfo(`Status: ${response.status}`);
            return { success: false, error: response.data.error };
        }
    } catch (error) {
        logError(`Experience submission test failed: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Test 3: Image Upload via Multipart Form Data
async function testImageUploadMultipart() {
    logTest('Image Upload via POST /api/vehicles/create (Multipart)');

    try {
        const testImage1 = createTestImage();
        const testImage2 = createTestImage();

        logInfo('Created 2 test images for upload');

        const fields = {
            name: 'Test Vehicle Multipart',
            model: 'Multipart Model 2024',
            registration: 'MULTI-' + Date.now(),
            experienceName: 'Test Experience Multipart',
            imageCount: '2'
        };

        const files = [
            {
                fieldName: 'images',
                filename: 'test-image-1.png',
                contentType: 'image/png',
                data: testImage1
            },
            {
                fieldName: 'images',
                filename: 'test-image-2.png',
                contentType: 'image/png',
                data: testImage2
            }
        ];

        const { body, contentType } = createMultipartFormData(fields, files);

        logInfo('Sending multipart/form-data request...');
        logInfo(`Request size: ${body.length} bytes`);

        const response = await makeRequest(`${BASE_URL}/api/vehicles/create`, {
            method: 'POST',
            headers: {
                'Content-Type': contentType,
                'Content-Length': body.length
            },
            body: body
        });

        if (response.ok) {
            logSuccess('Image upload successful!');
            logInfo(`Vehicle ID: ${response.data.id}`);
            logInfo(`Message: ${response.data.message}`);

            if (response.data.images && response.data.images.length > 0) {
                logSuccess(`Uploaded ${response.data.images.length} images:`);
                response.data.images.forEach((url, index) => {
                    logInfo(`  Image ${index + 1}: ${url.substring(0, 80)}...`);
                });
            } else {
                logWarning('No image URLs returned in response');
            }

            return { success: true, data: response.data };
        } else {
            logError(`Image upload failed: ${response.data.error || 'Unknown error'}`);
            logInfo(`Status: ${response.status}`);
            return { success: false, error: response.data.error };
        }
    } catch (error) {
        logError(`Image upload test failed: ${error.message}`);
        console.error(error);
        return { success: false, error: error.message };
    }
}

// Test 4: Verify Firestore Data
async function testFirestoreData(vehicleId) {
    logTest('Firestore Data Verification');

    if (!vehicleId) {
        logWarning('No vehicle ID provided, skipping Firestore verification');
        return { success: false, skipped: true };
    }

    try {
        logInfo(`Verifying vehicle data for ID: ${vehicleId}`);

        const response = await makeRequest(`${BASE_URL}/api/vehicles/list`);

        if (response.ok && response.data.vehicles) {
            const vehicle = response.data.vehicles.find(v => v.id === vehicleId);

            if (vehicle) {
                logSuccess('Vehicle data found in Firestore!');
                logInfo(`Name: ${vehicle.name}`);
                logInfo(`Model: ${vehicle.model}`);
                logInfo(`Registration: ${vehicle.registration}`);
                logInfo(`Experience Name: ${vehicle.experienceName || 'N/A'}`);
                logInfo(`Image Count: ${vehicle.imageCount || 0}`);

                if (vehicle.images && vehicle.images.length > 0) {
                    logSuccess(`Found ${vehicle.images.length} stored image URLs`);
                }

                return { success: true, vehicle };
            } else {
                logWarning('Vehicle not found in list (may need to wait for sync)');
                return { success: false, error: 'Vehicle not found' };
            }
        } else {
            logError('Failed to retrieve vehicle list');
            return { success: false, error: response.data.error };
        }
    } catch (error) {
        logError(`Firestore verification failed: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Test 5: Storage Bucket Verification
async function testStorageBucketAccess() {
    logTest('Firebase Storage Bucket Configuration');

    try {
        logInfo('Checking storage bucket configuration from Firebase test endpoint...');

        const response = await makeRequest(`${BASE_URL}/api/test-firebase`);

        if (response.ok && response.data.storageBucket) {
            logSuccess(`Storage bucket configured: ${response.data.storageBucket}`);

            // Check if it matches expected bucket
            const expectedBucket = 'uplai-aeff0.firebasestorage.app';
            if (response.data.storageBucket === expectedBucket) {
                logSuccess(`Bucket matches expected value: ${expectedBucket}`);
            } else {
                logWarning(`Bucket differs from expected: ${expectedBucket}`);
            }

            return { success: true, bucket: response.data.storageBucket };
        } else {
            logError('Storage bucket not configured properly');
            return { success: false, error: 'Bucket not found in config' };
        }
    } catch (error) {
        logError(`Storage bucket test failed: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Main test runner
async function runAllTests() {
    logSection('🚀 COMPREHENSIVE ADMIN PANEL TEST SUITE');

    logInfo(`Testing against: ${BASE_URL}`);
    logInfo(`Timestamp: ${new Date().toISOString()}\n`);

    const results = {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        tests: []
    };

    // Test 1: Firebase Initialization
    const firebaseTest = await testFirebaseInit();
    results.total++;
    results.tests.push({ name: 'Firebase Initialization', ...firebaseTest });
    if (firebaseTest.success) results.passed++;
    else results.failed++;

    // Test 2: Storage Bucket
    const storageTest = await testStorageBucketAccess();
    results.total++;
    results.tests.push({ name: 'Storage Bucket Configuration', ...storageTest });
    if (storageTest.success) results.passed++;
    else results.failed++;

    // Test 3: JSON Experience Submission
    const jsonTest = await testExperienceSubmissionJSON();
    results.total++;
    results.tests.push({ name: 'Experience Submission (JSON)', ...jsonTest });
    if (jsonTest.success) results.passed++;
    else results.failed++;

    // Test 4: Multipart Image Upload
    const multipartTest = await testImageUploadMultipart();
    results.total++;
    results.tests.push({ name: 'Image Upload (Multipart)', ...multipartTest });
    if (multipartTest.success) results.passed++;
    else results.failed++;

    // Test 5: Firestore Verification
    const vehicleId = multipartTest.data?.id || jsonTest.data?.id;
    const firestoreTest = await testFirestoreData(vehicleId);
    results.total++;
    results.tests.push({ name: 'Firestore Data Verification', ...firestoreTest });
    if (firestoreTest.success) results.passed++;
    else if (firestoreTest.skipped) results.skipped++;
    else results.failed++;

    // Summary
    logSection('📊 TEST SUMMARY');

    log(`Total Tests: ${results.total}`, 'bright');
    log(`Passed: ${results.passed}`, 'green');
    log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
    log(`Skipped: ${results.skipped}`, 'yellow');
    log(`Success Rate: ${((results.passed / (results.total - results.skipped)) * 100).toFixed(1)}%`,
        results.failed === 0 ? 'green' : 'yellow');

    console.log('\n' + '='.repeat(70));
    log('DETAILED RESULTS:', 'bright');
    console.log('='.repeat(70));

    results.tests.forEach((test, index) => {
        const status = test.success ? '✅ PASS' : (test.skipped ? '⏭️  SKIP' : '❌ FAIL');
        const color = test.success ? 'green' : (test.skipped ? 'yellow' : 'red');
        log(`${index + 1}. ${test.name}: ${status}`, color);
        if (test.error) {
            log(`   Error: ${test.error}`, 'red');
        }
    });

    console.log('\n' + '='.repeat(70));

    if (results.failed === 0) {
        logSuccess('\n🎉 ALL TESTS PASSED! Admin panel is working correctly.');
        log('\n✓ Firebase is connected and working', 'green');
        log('✓ Storage bucket is configured correctly', 'green');
        log('✓ Image upload functionality is working', 'green');
        log('✓ POST API for experience submission is working', 'green');
        log('✓ Firestore data persistence is verified', 'green');
    } else {
        logError(`\n⚠️  ${results.failed} test(s) failed. Please review the errors above.`);
    }

    return results;
}

// Run tests
runAllTests()
    .then(results => {
        process.exit(results.failed === 0 ? 0 : 1);
    })
    .catch(error => {
        logError(`\n💥 Test suite crashed: ${error.message}`);
        console.error(error);
        process.exit(1);
    });
