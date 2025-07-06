# Simple YazamutForum Test Script
Write-Host "🧪 Testing YazamutForum..." -ForegroundColor Cyan

$baseUrl = "http://localhost:3000"

# Test 1: Homepage
Write-Host "`n📄 Testing Homepage..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $baseUrl -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Homepage loads successfully" -ForegroundColor Green
        if ($response.Content -like "*YazamutForum*") {
            Write-Host "✅ YazamutForum branding found" -ForegroundColor Green
        }
        if ($response.Content -like "*Sign In*") {
            Write-Host "✅ Sign In button found" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "❌ Homepage failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Sign-in page
Write-Host "`n🔐 Testing Sign-in Page..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/signin" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Sign-in page loads successfully" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Sign-in page failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Sign-up page
Write-Host "`n📝 Testing Sign-up Page..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/signup" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Sign-up page loads successfully" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Sign-up page failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: API Endpoint
Write-Host "`n🌐 Testing API..." -ForegroundColor Yellow
try {
    $apiUrl = "$baseUrl/api/trpc/idea.getAll?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22limit%22%3A10%7D%7D%7D"
    $response = Invoke-WebRequest -Uri $apiUrl -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Ideas API endpoint working" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ API failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: User Registration
Write-Host "`n👤 Testing User Registration..." -ForegroundColor Yellow
$randomNum = Get-Random -Maximum 9999
$testEmail = "test$randomNum@example.com"
$testUsername = "testuser$randomNum"

$body = @{
    name = "Test User"
    username = $testUsername
    email = $testEmail
    password = "testpassword123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/register" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 201) {
        Write-Host "✅ User registration successful!" -ForegroundColor Green
        Write-Host "📧 Test user created: $testEmail" -ForegroundColor Cyan
        Write-Host "🔑 Test password: testpassword123" -ForegroundColor Cyan
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "⚠️ Registration validation working (duplicate user or validation error)" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎉 TESTING COMPLETE!" -ForegroundColor Green
Write-Host "🌐 Your browser should be open to: $baseUrl" -ForegroundColor Cyan
Write-Host "📋 Manual testing steps:" -ForegroundColor Cyan
Write-Host "   1. Click 'Sign In' button"
Write-Host "   2. Click 'create a new account'"
Write-Host "   3. Try registering with: $testEmail"
Write-Host "   4. After signing in, look for idea creation interface"
