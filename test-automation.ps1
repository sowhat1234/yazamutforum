# YazamutForum Automated Testing Script
# This script tests the core functionality of the application

Write-Host "🧪 Starting YazamutForum Testing Suite..." -ForegroundColor Cyan
Write-Host ("=" * 50)

# Test Configuration
$baseUrl = "http://localhost:3000"
$testUser = @{
    name = "Test User"
    username = "testuser$(Get-Random -Maximum 9999)"
    email = "test$(Get-Random -Maximum 9999)@example.com"
    password = "testpassword123"
}

# Function to make HTTP requests
function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Body = $null,
        [string]$Description
    )
    
    Write-Host "🔍 Testing: $Description" -ForegroundColor Yellow
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            UseBasicParsing = $true
            TimeoutSec = 10
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
            $params.Headers = @{ "Content-Type" = "application/json" }
        }
        
        $response = Invoke-WebRequest @params
        
        if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 201) {
            Write-Host "   ✅ PASS: HTTP $($response.StatusCode)" -ForegroundColor Green
            return $response
        } else {
            Write-Host "   ❌ FAIL: HTTP $($response.StatusCode)" -ForegroundColor Red
            return $null
        }
    }
    catch {
        Write-Host "   ❌ FAIL: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Test 1: Homepage Loading
Write-Host "`n📄 TEST 1: Homepage Loading" -ForegroundColor Magenta
$homepage = Test-Endpoint -Url $baseUrl -Description "Homepage loads"

if ($homepage) {
    $content = $homepage.Content
    if ($content -like "*YazamutForum*") {
        Write-Host "   ✅ YazamutForum branding found" -ForegroundColor Green
    }
    if ($content -like "*Sign In*") {
        Write-Host "   ✅ Sign In button found" -ForegroundColor Green
    }
    if ($content -like "*Idea Feed*") {
        Write-Host "   ✅ Idea Feed component found" -ForegroundColor Green
    }
}

# Test 2: Authentication Pages
Write-Host "`n🔐 TEST 2: Authentication Pages" -ForegroundColor Magenta
$signin = Test-Endpoint -Url "$baseUrl/auth/signin" -Description "Sign-in page loads"
$signup = Test-Endpoint -Url "$baseUrl/auth/signup" -Description "Sign-up page loads"

# Test 3: API Endpoints
Write-Host "`n🌐 TEST 3: API Endpoints" -ForegroundColor Magenta
$ideasApi = Test-Endpoint -Url "$baseUrl/api/trpc/idea.getAll?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22limit%22%3A10%7D%7D%7D" -Description "Ideas API endpoint"

# Test 4: User Registration
Write-Host "`n👤 TEST 4: User Registration" -ForegroundColor Magenta
Write-Host "Creating test user: $($testUser.email)" -ForegroundColor Cyan

$registrationBody = @{
    name = $testUser.name
    username = $testUser.username
    email = $testUser.email
    password = $testUser.password
}

$registration = Test-Endpoint -Url "$baseUrl/api/auth/register" -Method "POST" -Body $registrationBody -Description "User registration"

if ($registration) {
    Write-Host "   ✅ User registration successful!" -ForegroundColor Green
    $regResponse = $registration.Content | ConvertFrom-Json
    Write-Host "   📧 User ID: $($regResponse.user.id)" -ForegroundColor Cyan
} else {
    Write-Host "   ℹ️  Registration may have failed due to existing user or validation" -ForegroundColor Yellow
}

# Test 5: Database Connection
Write-Host "`n🗄️  TEST 5: Database Connection" -ForegroundColor Magenta
try {
    $seedResult = & npx prisma db seed 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Database connection and seeding successful" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Database seeding failed" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Database test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Static Assets
Write-Host "`n📁 TEST 6: Static Assets" -ForegroundColor Magenta
$favicon = Test-Endpoint -Url "$baseUrl/favicon.ico" -Description "Favicon loads"

# Summary
Write-Host "`n📊 TEST SUMMARY" -ForegroundColor Magenta
Write-Host ("=" * 50)

Write-Host "🌐 Website Status: " -NoNewline
if ($homepage) { 
    Write-Host "ONLINE ✅" -ForegroundColor Green 
} else { 
    Write-Host "OFFLINE ❌" -ForegroundColor Red 
}

Write-Host "🔐 Authentication: " -NoNewline
if ($signin -and $signup) { 
    Write-Host "READY ✅" -ForegroundColor Green 
} else { 
    Write-Host "ISSUES ❌" -ForegroundColor Red 
}

Write-Host "🌐 API: " -NoNewline
if ($ideasApi) { 
    Write-Host "FUNCTIONAL ✅" -ForegroundColor Green 
} else { 
    Write-Host "ISSUES ❌" -ForegroundColor Red 
}

Write-Host "👤 Registration: " -NoNewline
if ($registration) { 
    Write-Host "WORKING ✅" -ForegroundColor Green 
} else { 
    Write-Host "CHECK MANUALLY ⚠️" -ForegroundColor Yellow 
}

Write-Host "`n🎉 MANUAL TESTING STEPS:" -ForegroundColor Cyan
Write-Host "1. Your browser should now be open to: $baseUrl"
Write-Host "2. Click 'Sign In' to see the enhanced auth page"
Write-Host "3. Click 'create a new account' to test registration"
Write-Host "4. Try logging in with: $($testUser.email) / $($testUser.password)"
Write-Host "5. Look for the idea creation interface after signing in"

Write-Host "`n🚀 Testing complete! Check your browser for manual testing." -ForegroundColor Green
