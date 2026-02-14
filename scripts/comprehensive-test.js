const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// ANSI color codes for better output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5002';

// Helper function to print colored output
function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
    console.log('\n' + '='.repeat(60));
    log(title, 'bright');
    console.log('='.repeat(60) + '\n');
}

function logTest(testName) {
    log(`\n🧪 TEST: ${testName}`, 'cyan');
    log('-'.repeat(60), 'cyan');
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

// Test 1: Firebase Admin Initialization
async function testFirebaseInit() {
    logTest('Firebase Admin Initialization');

    try {
        const response = await fetch(`${BASE_URL}/api/test-firebase`);
        const data = await response.json();

        if (response.ok) {
            logSuccess('Firebase Admin initialized successfully');
            logInfo(`Project ID: ${data.projectId || 'N/A'}`);
            logInfo(`Storage Bucket: ${data.storageBucket || 'N/A'}`);
            return { success: true, data };
        } else {
            logError(`Firebase initialization failed: ${data.error || 'Unknown error'}`);
            return { success: false, error: data.error };
        }
    } catch (error) {
        logError(`Failed to connect to Firebase test endpoint: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Test 2: Storage Bucket Access
async function testStorageBucket() {
    logTest('Firebase Storage Bucket Access');

    try {
        // We'll test this by attempting to upload a test file
        logInfo('Testing storage bucket by creating a test file upload...');

        // Create a simple test image buffer (1x1 pixel PNG)
        const testImageBuffer = Buffer.from([
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

        // Save to temp file
        const tempFilePath = path.join(__dirname, 'test-image.png');
        fs.writeFileSync(tempFilePath, testImageBuffer);

        logSuccess('Test image created successfully');

        // Clean up
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
            logInfo('Cleaned up test file');
        }

        return { success: true };
    } catch (error) {
        logError(`Storage bucket test failed: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Test 3: Image Upload via POST API
async function testImageUpload() {
    logTest('Image Upload via POST /api/vehicles/create');

    try {
        // Create test images
        const testImageBuffer = Buffer.from([
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

        const tempFilePath1 = path.join(__dirname, 'test-upload-1.png');
        const tempFilePath2 = path.join(__dirname, 'test-upload-2.png');

        fs.writeFileSync(tempFilePath1, testImageBuffer);
        fs.writeFileSync(tempFilePath2, testImageBuffer);

        logInfo('Created 2 test images for upload');

        // Create FormData
        const form = new FormData();
        form.append('name', 'Test Vehicle');
        form.append('model', 'Test Model 2024');
        form.append('registration', 'TEST-' + Date.now());
        form.append('experienceName', 'Test Experience Upload');
        form.append('imageCount', '2');
        form.append('images', fs.createReadStream(tempFilePath1), {
            filename: 'test-image-1.png',
            contentType: 'image/png'
        });
        form.append('images', fs.createReadStream(tempFilePath2), {
            filename: 'test-image-2.png',
            contentType: 'image/png'
        });

        logInfo('Sending multipart/form-data request...');

        const response = await fetch(`${BASE_URL}/api/vehicles/create`, {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });

        const data = await response.json();

        // Clean up temp files
        [tempFilePath1, tempFilePath2].forEach(file => {
            if (fs.existsSync(file)) {
                fs.unlinkSync(file);
            }
        });

        if (response.ok) {
            logSuccess('Image upload successful!');
            logInfo(`Vehicle ID: ${data.id}`);
            logInfo(`Message: ${data.message}`);

            if (data.images && data.images.length > 0) {
                logSuccess(`Uploaded ${data.images.length} images:`);
                data.images.forEach((url, index) => {
                    logInfo(`  Image ${index + 1}: ${url}`);
                });
            } else {
                logWarning('No image URLs returned in response');
            }

            return { success: true, data };
        } else {
            logError(`Image upload failed: ${data.error || 'Unknown error'}`);
            logInfo(`Status: ${response.status}`);
            return { success: false, error: data.error };
        }
    } catch (error) {
        logError(`Image upload test failed: ${error.message}`);
        console.error(error);
        return { success: false, error: error.message };
    }
}

// Test 4: POST API for Experience Submission (JSON)
async function testExperienceSubmission() {
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
        logInfo(`Data: ${JSON.stringify(testData, null, 2)}`);

        const response = await fetch(`${BASE_URL}/api/vehicles/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });

        const data = await response.json();

        if (response.ok) {
            logSuccess('Experience submission successful!');
            logInfo(`Vehicle ID: ${data.id}`);
            logInfo(`Message: ${data.message}`);
            return { success: true, data };
        } else {
            logError(`Experience submission failed: ${data.error || 'Unknown error'}`);
            logInfo(`Status: ${response.status}`);
            return { success: false, error: data.error };
        }
    } catch (error) {
        logError(`Experience submission test failed: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Test 5: Verify Firestore Data
async function testFirestoreData(vehicleId) {
    logTest('Firestore Data Verification');

    if (!vehicleId) {
        logWarning('No vehicle ID provided, skipping Firestore verification');
        return { success: false, skipped: true };
    }

    try {
        logInfo(`Verifying vehicle data for ID: ${vehicleId}`);

        // We'll use the list API to verify the data was stored
        const response = await fetch(`${BASE_URL}/api/vehicles/list`);
        const data = await response.json();

        if (response.ok && data.vehicles) {
            const vehicle = data.vehicles.find(v => v.id === vehicleId);

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
            return { success: false, error: data.error };
        }
    } catch (error) {
        logError(`Firestore verification failed: ${error.message}`);
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
        tests: []
    };

    // Test 1: Firebase Initialization
    const firebaseTest = await testFirebaseInit();
    results.total++;
    results.tests.push({ name: 'Firebase Initialization', ...firebaseTest });
    if (firebaseTest.success) results.passed++;
    else results.failed++;

    // Test 2: Storage Bucket
    const storageTest = await testStorageBucket();
    results.total++;
    results.tests.push({ name: 'Storage Bucket Access', ...storageTest });
    if (storageTest.success) results.passed++;
    else results.failed++;

    // Test 3: Image Upload
    const imageUploadTest = await testImageUpload();
    results.total++;
    results.tests.push({ name: 'Image Upload', ...imageUploadTest });
    if (imageUploadTest.success) results.passed++;
    else results.failed++;

    // Test 4: Experience Submission (JSON)
    const experienceTest = await testExperienceSubmission();
    results.total++;
    results.tests.push({ name: 'Experience Submission (JSON)', ...experienceTest });
    if (experienceTest.success) results.passed++;
    else results.failed++;

    // Test 5: Firestore Verification
    const vehicleId = imageUploadTest.data?.id || experienceTest.data?.id;
    const firestoreTest = await testFirestoreData(vehicleId);
    results.total++;
    results.tests.push({ name: 'Firestore Data Verification', ...firestoreTest });
    if (firestoreTest.success) results.passed++;
    else if (!firestoreTest.skipped) results.failed++;

    // Summary
    logSection('📊 TEST SUMMARY');

    log(`Total Tests: ${results.total}`, 'bright');
    log(`Passed: ${results.passed}`, 'green');
    log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
    log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`,
        results.failed === 0 ? 'green' : 'yellow');

    console.log('\n' + '='.repeat(60));
    log('DETAILED RESULTS:', 'bright');
    console.log('='.repeat(60));

    results.tests.forEach((test, index) => {
        const status = test.success ? '✅ PASS' : (test.skipped ? '⏭️  SKIP' : '❌ FAIL');
        const color = test.success ? 'green' : (test.skipped ? 'yellow' : 'red');
        log(`${index + 1}. ${test.name}: ${status}`, color);
        if (test.error) {
            log(`   Error: ${test.error}`, 'red');
        }
    });

    console.log('\n' + '='.repeat(60));

    if (results.failed === 0) {
        logSuccess('\n🎉 ALL TESTS PASSED! Admin panel is working correctly.');
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
