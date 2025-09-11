@echo off
echo ========================================
echo Fixing React Native Runtime Error
echo ========================================

echo.
echo 1. Stopping Metro bundler...
taskkill /f /im node.exe 2>nul

echo.
echo 2. Clearing React Native cache...
cd /d "%~dp0"
call npx react-native start --reset-cache

echo.
echo 3. In a new terminal, run: npx react-native run-android
echo.
echo 4. If the error persists, try:
echo    - npm run clean
echo    - npm install
echo    - npx react-native start --reset-cache
echo    - npx react-native run-android
echo.

pause
