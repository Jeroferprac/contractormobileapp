# Clear Metro Bundler Cache Script
Write-Host "🧹 Clearing Metro Bundler cache..." -ForegroundColor Yellow

# Stop any running Metro processes
Write-Host "🛑 Stopping Metro processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -eq "node" } | Stop-Process -Force -ErrorAction SilentlyContinue

# Clear Metro cache directories
Write-Host "🗑️ Clearing cache directories..." -ForegroundColor Yellow
if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force "node_modules\.cache" -ErrorAction SilentlyContinue
    Write-Host "✅ Cleared node_modules\.cache" -ForegroundColor Green
}

if (Test-Path ".bundle") {
    Remove-Item -Recurse -Force ".bundle" -ErrorAction SilentlyContinue
    Write-Host "✅ Cleared .bundle" -ForegroundColor Green
}

if (Test-Path "android\app\build") {
    Remove-Item -Recurse -Force "android\app\build" -ErrorAction SilentlyContinue
    Write-Host "✅ Cleared android\app\build" -ForegroundColor Green
}

# Clear React Native cache
Write-Host "🧹 Clearing React Native cache..." -ForegroundColor Yellow
npx react-native start --reset-cache --port 8081

Write-Host "✅ Cache cleared and Metro bundler restarted!" -ForegroundColor Green
Write-Host "📱 You can now reload your app to see the changes." -ForegroundColor Cyan
