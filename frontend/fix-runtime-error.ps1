Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fixing React Native Runtime Error" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "1. Stopping Metro bundler..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host ""
Write-Host "2. Clearing React Native cache..." -ForegroundColor Yellow
Set-Location $PSScriptRoot
npx react-native start --reset-cache

Write-Host ""
Write-Host "3. In a new terminal, run: npx react-native run-android" -ForegroundColor Green
Write-Host ""
Write-Host "4. If the error persists, try:" -ForegroundColor Yellow
Write-Host "   - npm run clean" -ForegroundColor White
Write-Host "   - npm install" -ForegroundColor White
Write-Host "   - npx react-native start --reset-cache" -ForegroundColor White
Write-Host "   - npx react-native run-android" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to continue"
