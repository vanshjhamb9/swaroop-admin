# Comprehensive Admin Panel Test Script for PowerShell (Fixed Version)
# Tests Firebase, Storage Bucket, Image Upload, and POST API

$BASE_URL = "http://localhost:5002"

# Color output functions
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Error-Custom { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Warning-Custom { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }
function Write-Test { param($Message) Write-Host "`n🧪 TEST: $Message" -ForegroundColor Cyan; Write-Host ("-" * 70) -ForegroundColor Cyan }
function Write-Section { param($Title) Write-Host ("`n" + ("=" * 70)) -ForegroundColor White; Write-Host $Title -ForegroundColor White; Write-Host ("=" * 70 + "`n") -ForegroundColor White }

# Test results tracking
$results = @{
    Total = 0
    Passed = 0
    Failed = 0
    Tests = @()
}

function Add-TestResult {
    param($Name, $Success, $Error = $null, $Data = $null)
    $results.Total++
    if ($Success) {
        $results.Passed++
    } else {
        $results.Failed++
    }
    $results.Tests += @{
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

# Test 2: Experience Submission (JSON)
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
        $response = Invoke-RestMethod -Uri "$BASE_URL/api/vehicles/create" -Method Post -Body $testData -ContentType "application/json" -ErrorAction Stop
        Write-Success "Experience submission successful!"
        Write-Info "Vehicle ID: $($response.id)"
        Add-TestResult -Name "Experience Submission (JSON)" -Success $true -Data $response
        return $response
    } catch {
        Write-Error-Custom "Experience submission failed: $_"
        Add-TestResult -Name "Experience Submission (JSON)" -Success $false -Error $_.Exception.Message
        return $null
    }
}

# Test 3: Image Upload (Multipart)
function Test-ImageUploadMultipart {
    Write-Test "Image Upload via POST /api/vehicles/create (Multipart)"
    try {
        # Create a 1x1 pixel PNG
        $pngBytes = [byte[]]@(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82)
        
        $boundary = "----TestBoundary$(Get-Date -Format 'yyyyMMddHHmmss')"
        $LF = "`r`n"
        $encoding = [System.Text.Encoding]::GetEncoding("iso-8859-1")
        
        # Build multipart body
        $body = ""
        
        # Fields
        $fields = @{
            "name" = "Test Vehicle Multipart"
            "model" = "Multipart Model 2024"
            "registration" = "MULTI-$(Get-Date -Format 'yyyyMMddHHmmss')"
            "experienceName" = "Test Experience Multipart"
            "imageCount" = "1"
        }
        
        foreach ($key in $fields.Keys) {
            $body += "--$boundary$LF"
            $body += "Content-Disposition: form-data; name=`"$key`"$LF$LF"
            $body += "$($fields[$key])$LF"
        }
        
        # Image
        $body += "--$boundary$LF"
        $body += "Content-Disposition: form-data; name=`"images`"; filename=`"test.png`"$LF"
        $body += "Content-Type: image/png$LF$LF"
        $body += $encoding.GetString($pngBytes)
        $body += "$LF--$boundary--$LF"
        
        $postData = $encoding.GetBytes($body)
        
        Write-Info "Sending multipart/form-data request..."
        $response = Invoke-RestMethod -Uri "$BASE_URL/api/vehicles/create" -Method Post -Body $postData -ContentType "multipart/form-data; boundary=$boundary" -ErrorAction Stop
        
        Write-Success "Image upload successful!"
        Write-Info "Vehicle ID: $($response.id)"
        if ($response.images) {
            Write-Success "Uploaded Images: $($response.images -join ', ')"
        }
        
        Add-TestResult -Name "Image Upload (Multipart)" -Success $true -Data $response
        return $response
    } catch {
        Write-Error-Custom "Image upload failed: $_"
        Add-TestResult -Name "Image Upload (Multipart)" -Success $false -Error $_.Exception.Message
        return $null
    }
}

# Run tests
Write-Section "🚀 ADMIN PANEL VERIFICATION"
$firebaseData = Test-FirebaseInit
$jsonResult = Test-ExperienceSubmissionJSON
$multipartResult = Test-ImageUploadMultipart

# Final Summary
Write-Section "📊 SUMMARY"
Write-Host "Total: $($results.Total) | Passed: $($results.Passed) | Failed: $($results.Failed)" -ForegroundColor White
foreach ($test in $results.Tests) {
    $status = if ($test.Success) { "✅" } else { "❌" }
    Write-Host "$status $($test.Name)" -ForegroundColor $(if ($test.Success) { "Green" } else { "Red" })
}

if ($results.Failed -eq 0) {
    Write-Success "`nAll systems operational."
} else {
    Write-Error-Custom "`nSome tests failed."
}

# Return exit code based on failure
if ($results.Failed -gt 0) { exit 1 } else { exit 0 }
