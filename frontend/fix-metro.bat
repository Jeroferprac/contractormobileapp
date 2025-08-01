@echo off
echo 🔧 Fixing Metro Bundler and Android Connection Issues...

echo 📱 Step 1: Killing existing Metro processes...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo 🧹 Step 2: Clearing Metro cache...
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache" 2>nul
if exist ".bundle" rmdir /s /q ".bundle" 2>nul

echo 🧹 Step 3: Clearing React Native cache...
npx react-native start --reset-cache --port 8081

echo ⏳ Step 4: Waiting for Metro to start...
timeout /t 10 /nobreak >nul

echo 🧹 Step 5: Clearing Android build cache...
if exist "android\app\build" rmdir /s /q "android\app\build" 2>nul
if exist "android\.gradle" rmdir /s /q "android\.gradle" 2>nul

echo 📱 Step 6: Building and running Android app...
echo This will take a few minutes...
npx react-native run-android --port 8081

echo ✅ Setup complete! Your Android app should now connect to Metro Bundler.
echo 📝 If you still see the red screen:
echo    1. Shake your device/emulator and select 'Reload'
echo    2. Or press 'r' in the Metro terminal to reload
echo    3. Or press 'd' to open developer menu
pause 