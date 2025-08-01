# Fix Metro Bundler and Android Connection Issues
Write-Host "🔧 Fixing Metro Bundler and Android Connection Issues..." -ForegroundColor Green

# Step 1: Kill any existing Metro processes
Write-Host "📱 Step 1: Killing existing Metro processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Step 2: Clear Metro cache
Write-Host "🧹 Step 2: Clearing Metro cache..." -ForegroundColor Yellow
if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force "node_modules\.cache" -ErrorAction SilentlyContinue
}
if (Test-Path ".bundle") {
    Remove-Item -Recurse -Force ".bundle" -ErrorAction SilentlyContinue
}

# Step 3: Clear React Native cache
Write-Host "🧹 Step 3: Clearing React Native cache..." -ForegroundColor Yellow
npx react-native start --reset-cache --port 8081

# Step 4: Wait for Metro to start
Write-Host "⏳ Step 4: Waiting for Metro to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Step 5: Check if Metro is running
Write-Host "🔍 Step 5: Checking Metro status..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8081/status" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Metro Bundler is running successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Metro Bundler is not responding. Starting it manually..." -ForegroundColor Red
    Write-Host "🚀 Starting Metro Bundler..." -ForegroundColor Yellow
    Start-Process -FilePath "npx" -ArgumentList "react-native", "start", "--port", "8081" -WindowStyle Hidden
    Start-Sleep -Seconds 15
}

# Step 6: Clear Android build cache
Write-Host "🧹 Step 6: Clearing Android build cache..." -ForegroundColor Yellow
if (Test-Path "android\app\build") {
    Remove-Item -Recurse -Force "android\app\build" -ErrorAction SilentlyContinue
}
if (Test-Path "android\.gradle") {
    Remove-Item -Recurse -Force "android\.gradle" -ErrorAction SilentlyContinue
}

# Step 7: Build and run Android app
Write-Host "📱 Step 7: Building and running Android app..." -ForegroundColor Yellow
Write-Host "This will take a few minutes..." -ForegroundColor Cyan

# Check if Android emulator is running
$emulatorRunning = Get-Process -Name "emulator" -ErrorAction SilentlyContinue
if (-not $emulatorRunning) {
    Write-Host "⚠️  No Android emulator detected. Please start your emulator first." -ForegroundColor Yellow
    Write-Host "You can start it with: emulator -avd <your_avd_name>" -ForegroundColor Cyan
}

# Run the Android app
Write-Host "🚀 Running Android app..." -ForegroundColor Yellow
npx react-native run-android --port 8081

Write-Host "✅ Setup complete! Your Android app should now connect to Metro Bundler." -ForegroundColor Green
Write-Host "📝 If you still see the red screen:" -ForegroundColor Cyan
Write-Host "   1. Shake your device/emulator and select 'Reload'" -ForegroundColor Cyan
Write-Host "   2. Or press 'r' in the Metro terminal to reload" -ForegroundColor Cyan
Write-Host "   3. Or press 'd' to open developer menu" -ForegroundColor Cyan 