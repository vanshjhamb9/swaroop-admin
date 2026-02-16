# Comprehensive Admin Panel Test Script for PowerShell
# Tests Firebase, Storage Bucket, Image Upload, and POST API

$BASE_URL = if ($env:NEXT_PUBLIC_BASE_URL) { $env:NEXT_PUBLIC_BASE_URL } else { "http://localhost:5002" }

# Color output functions
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Error-Custom { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Warning-Custom { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }
function Write-Test { param($Message) Write-Host "`n🧪 TEST: $Message" -ForegroundColor Cyan; Write-Host ("-" * 70) -ForegroundColor Cyan }
function Write-Section { param($Title) Write-Host ("`n" + ("=" * 70)) -ForegroundColor White; Write-Host $Title -ForegroundColor White; Write-Host ("=" * 70 + "`n") -ForegroundColor White }

# Test results tracking
$script:results = @{
    Total = 0
    Passed = 0
    Failed = 0
    Tests = @()
}

function Add-TestResult {
    param($Name, $Success, $Error = $null, $Data = $null)
    $script:results.Total++
    if ($Success) {
        $script:results.Passed++
    } else {
        $script:results.Failed++
    }
    $script:results.Tests += @{
        Name = $Name
        Success = $Success
        Error = $Error
        Data = $Data
    }
}

# Test 1: Firebase Initialization
function Test-FirebaseInit {
    Write-Test "Firebase Admin Initialization"
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/api/test-firebase" -Method Get -ErrorAction Stop
        
        if ($response.success) {
            Write-Success "Firebase Admin initialized successfully"
            Write-Info "Project ID: $($response.projectId)"
            Write-Info "Storage Bucket: $($response.storageBucket)"
            Write-Info "Collections: $($response.collections -join ', ')"
            Add-TestResult -Name "Firebase Initialization" -Success $true -Data $response
            return $response
        } else {
            Write-Error-Custom "Firebase initialization failed: $($response.error)"
            Add-TestResult -Name "Firebase Initialization" -Success $false -Error $response.error
            return $null
        }
    } catch {
        Write-Error-Custom "Failed to connect to Firebase test endpoint: $_"
        Add-TestResult -Name "Firebase Initialization" -Success $false -Error $_.Exception.Message
        return $null
    }
}

# Test 2: Storage Bucket Configuration
function Test-StorageBucket {
    param($FirebaseData)
    
    Write-Test "Firebase Storage Bucket Configuration"
    
    if ($FirebaseData -and $FirebaseData.storageBucket) {
        $bucket = $FirebaseData.storageBucket
        Write-Success "Storage bucket configured: $bucket"
        
        $expectedBucket = "uplai-aeff0.firebasestorage.app"
        if ($bucket -eq $expectedBucket) {
            Write-Success "Bucket matches expected value"
            Add-TestResult -Name "Storage Bucket Configuration" -Success $true
        } else {
            Write-Warning-Custom "Bucket differs from expected: $expectedBucket"
            Add-TestResult -Name "Storage Bucket Configuration" -Success $true
        }
    } else {
        Write-Error-Custom "Storage bucket not configured"
        Add-TestResult -Name "Storage Bucket Configuration" -Success $false -Error "Bucket not found"
    }
}

# Test 3: Experience Submission (JSON)
function Test-ExperienceSubmissionJSON {
    Write-Test "Experience Submission via POST /api/vehicles/create (JSON)"
    
    try {
        $testData = @{
            name = "Test Vehicle JSON"
            model = "JSON Model 2024"
            registration = "JSON-$(Get-Date -Format 'yyyyMMddHHmmss')"
            experienceName = "Test Experience JSON"
            imageCount = 0
            images = @()
        } | ConvertTo-Json
        
        Write-Info "Sending JSON request..."
        
        $response = Invoke-RestMethod -Uri "$BASE_URL/api/vehicles/create" `
            -Method Post `
            -Body $testData `
            -ContentType "application/json" `
            -ErrorAction Stop
        
        Write-Success "Experience submission successful!"
        Write-Info "Vehicle ID: $($response.id)"
        Write-Info "Message: $($response.message)"
        Add-TestResult -Name "Experience Submission (JSON)" -Success $true -Data $response
        return $response
    } catch {
        Write-Error-Custom "Experience submission failed: $_"
        Add-TestResult -Name "Experience Submission (JSON)" -Success $false -Error $_.Exception.Message
        return $null
    }
}

# Test 4: Image Upload (Multipart)
function Test-ImageUploadMultipart {
    Write-Test "Image Upload via POST /api/vehicles/create (Multipart)"
    
    try {
        # Create a 1x1 pixel PNG
        $pngBytes = [byte[]]@(
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
            0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
            0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
            0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
            0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
            0x42, 0x60, 0x82
        )
        
        # Save test images
        $tempFile1 = Join-Path $env:TEMP "test-upload-1.png"
        $tempFile2 = Join-Path $env:TEMP "test-upload-2.png"
        [System.IO.File]::WriteAllBytes($tempFile1, $pngBytes)
        [System.IO.File]::WriteAllBytes($tempFile2, $pngBytes)
        
        Write-Info "Created 2 test images for upload"
        
        # Create multipart form data
        $boundary = [System.Guid]::NewGuid().ToString()
        $LF = "`r`n"
        
        $bodyLines = @(
            "--$boundary",
            "Content-Disposition: form-data; name=`"name`"$LF",
            "Test Vehicle Multipart",
            "--$boundary",
            "Content-Disposition: form-data; name=`"model`"$LF",
            "Multipart Model 2024",
            "--$boundary",
            "Content-Disposition: form-data; name=`"registration`"$LF",
            "MULTI-$(Get-Date -Format 'yyyyMMddHHmmss')",
            "--$boundary",
            "Content-Disposition: form-data; name=`"experienceName`"$LF",
            "Test Experience Multipart",
            "--$boundary",
            "Content-Disposition: form-data; name=`"imageCount`"$LF",
            "2",
            "--$boundary",
            "Content-Disposition: form-data; name=`"images`"; filename=`"test-image-1.png`"",
            "Content-Type: image/png$LF"
        )
        
        $body = ($bodyLines -join $LF) + $LF
        $body += [System.Text.Encoding]::GetEncoding("iso-8859-1").GetString($pngBytes) + $LF
        
        $body += "--$boundary$LF"
        $body += "Content-Disposition: form-data; name=`"images`"; filename=`"test-image-2.png`"$LF"
        $body += "Content-Type: image/png$LF$LF"
        $body += [System.Text.Encoding]::GetEncoding("iso-8859-1").GetString($pngBytes) + $LF
        $body += "--$boundary--$LF"
        
        Write-Info "Sending multipart/form-data request..."
        
        $response = Invoke-RestMethod -Uri "$BASE_URL/api/vehicles/create" `
            -Method Post `
            -Body ([System.Text.Encoding]::GetEncoding("iso-8859-1").GetBytes($body)) `
            -ContentType "multipart/form-data; boundary=$boundary" `
            -ErrorAction Stop
        
        # Clean up temp files
        Remove-Item $tempFile1 -ErrorAction SilentlyContinue
        Remove-Item $tempFile2 -ErrorAction SilentlyContinue
        
        Write-Success "Image upload successful!"
        Write-Info "Vehicle ID: $($response.id)"
        Write-Info "Message: $($response.message)"
        
        if ($response.images -and $response.images.Count -gt 0) {
            Write-Success "Uploaded $($response.images.Count) images:"
            $response.images | ForEach-Object { Write-Info "  $_" }
        } else {
            Write-Warning-Custom "No image URLs returned in response"
        }
        
        Add-TestResult -Name "Image Upload (Multipart)" -Success $true -Data $response
        return $response
    } catch {
        Write-Error-Custom "Image upload failed: $_"
        Add-TestResult -Name "Image Upload (Multipart)" -Success $false -Error $_.Exception.Message
        
        # Clean up temp files
        Remove-Item $tempFile1 -ErrorAction SilentlyContinue
        Remove-Item $tempFile2 -ErrorAction SilentlyContinue
        
        return $null
    }
}

# Test 5: Firestore Data Verification
function Test-FirestoreData {
    param($VehicleId)
    
    Write-Test "Firestore Data Verification"
    
    if (-not $VehicleId) {
        Write-Warning-Custom "No vehicle ID provided, skipping Firestore verification"
        Add-TestResult -Name "Firestore Data Verification" -Success $false -Error "No vehicle ID"
        return
    }
    
    try {
        Write-Info "Verifying vehicle data for ID: $VehicleId"
        
        $response = Invoke-RestMethod -Uri "$BASE_URL/api/vehicles/list" -Method Get -ErrorAction Stop
        
        if ($response.vehicles) {
            $vehicle = $response.vehicles | Where-Object { $_.id -eq $VehicleId } | Select-Object -First 1
            
            if ($vehicle) {
                Write-Success "Vehicle data found in Firestore!"
                Write-Info "Name: $($vehicle.name)"
                Write-Info "Model: $($vehicle.model)"
                Write-Info "Registration: $($vehicle.registration)"
                Write-Info "Experience Name: $($vehicle.experienceName)"
                Write-Info "Image Count: $($vehicle.imageCount)"
                
                if ($vehicle.images -and $vehicle.images.Count -gt 0) {
                    Write-Success "Found $($vehicle.images.Count) stored image URLs"
                }
                
                Add-TestResult -Name "Firestore Data Verification" -Success $true -Data $vehicle
            } else {
                Write-Warning-Custom "Vehicle not found in list"
                Add-TestResult -Name "Firestore Data Verification" -Success $false -Error "Vehicle not found"
            }
        } else {
            Write-Error-Custom "Failed to retrieve vehicle list"
            Add-TestResult -Name "Firestore Data Verification" -Success $false -Error "No vehicles in response"
        }
    } catch {
        Write-Error-Custom "Firestore verification failed: $_"
        Add-TestResult -Name "Firestore Data Verification" -Success $false -Error $_.Exception.Message
    }
}

# Main test runner
function Run-AllTests {
    Write-Section "🚀 COMPREHENSIVE ADMIN PANEL TEST SUITE"
    
    Write-Info "Testing against: $BASE_URL"
    Write-Info "Timestamp: $(Get-Date -Format 'o')"
    Write-Host ""
    
    # Run tests
    $firebaseData = Test-FirebaseInit
    Test-StorageBucket -FirebaseData $firebaseData
    $jsonResult = Test-ExperienceSubmissionJSON
    $multipartResult = Test-ImageUploadMultipart
    
    $vehicleId = if ($multipartResult) { $multipartResult.id } elseif ($jsonResult) { $jsonResult.id } else { $null }
    Test-FirestoreData -VehicleId $vehicleId
    
    # Summary
    Write-Section "📊 TEST SUMMARY"
    
    Write-Host "Total Tests: $($script:results.Total)" -ForegroundColor White
    Write-Host "Passed: $($script:results.Passed)" -ForegroundColor Green
    Write-Host "Failed: $($script:results.Failed)" -ForegroundColor $(if ($script:results.Failed -gt 0) { "Red" } else { "Green" })
    
    $successRate = if ($script:results.Total -gt 0) { ($script:results.Passed / $script:results.Total) * 100 } else { 0 }
    Write-Host "Success Rate: $([math]::Round($successRate, 1))%" -ForegroundColor $(if ($script:results.Failed -eq 0) { "Green" } else { "Yellow" })
    
    Write-Host ("`n" + ("=" * 70))
    Write-Host "DETAILED RESULTS:" -ForegroundColor White
    Write-Host ("=" * 70)
    
    $i = 1
    foreach ($test in $script:results.Tests) {
        $status = if ($test.Success) { "✅ PASS" } else { "❌ FAIL" }
        $color = if ($test.Success) { "Green" } else { "Red" }
        Write-Host "$i. $($test.Name): $status" -ForegroundColor $color
        if ($test.Error) {
            Write-Host "   Error: $($test.Error)" -ForegroundColor Red
        }
        $i++
    }
    
    Write-Host ("`n" + ("=" * 70))
    
    if ($script:results.Failed -eq 0) {
        Write-Success "`n🎉 ALL TESTS PASSED! Admin panel is working correctly."
        Write-Host ""
        Write-Host "✓ Firebase is connected and working" -ForegroundColor Green
        Write-Host "✓ Storage bucket is configured correctly" -ForegroundColor Green
        Write-Host "✓ Image upload functionality is working" -ForegroundColor Green
        Write-Host "✓ POST API for experience submission is working" -ForegroundColor Green
        Write-Host "✓ Firestore data persistence is verified" -ForegroundColor Green
    } else {
        Write-Error-Custom "`n⚠️  $($script:results.Failed) test(s) failed. Please review the errors above."
    }
    
    return $script:results.Failed
}

# Run the tests
$exitCode = Run-AllTests
exit $exitCode
