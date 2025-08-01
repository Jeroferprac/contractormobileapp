# Quick Fix for "Unable to load script from assets" Error

## Option 1: Run the Automated Script (Recommended)

### PowerShell Script:
```powershell
cd frontend
.\fix-metro.ps1
```

### Batch Script:
```cmd
cd frontend
fix-metro.bat
```

## Option 2: Manual Step-by-Step Fix

### Step 1: Kill Metro Processes
```powershell
# Kill any existing Metro processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Step 2: Clear Caches
```powershell
# Clear Metro cache
Remove-Item -Recurse -Force "node_modules\.cache" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force ".bundle" -ErrorAction SilentlyContinue

# Clear Android build cache
Remove-Item -Recurse -Force "android\app\build" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "android\.gradle" -ErrorAction SilentlyContinue
```

### Step 3: Start Metro Bundler
```powershell
# Start Metro with cache reset
npx react-native start --reset-cache --port 8081
```

### Step 4: In a New Terminal, Run Android App
```powershell
# Run Android app
npx react-native run-android --port 8081
```

## Option 3: Quick Commands (if scripts don't work)

```powershell
# Navigate to frontend directory
cd frontend

# Kill Metro and clear cache
taskkill /f /im node.exe 2>nul
Remove-Item -Recurse -Force "node_modules\.cache" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force ".bundle" -ErrorAction SilentlyContinue

# Start Metro
npx react-native start --reset-cache --port 8081

# In another terminal:
npx react-native run-android --port 8081
```

## Troubleshooting Tips

1. **If Metro won't start**: Check if port 8081 is already in use
   ```powershell
   netstat -ano | findstr :8081
   ```

2. **If Android emulator isn't detected**: Start it manually
   ```powershell
   emulator -avd <your_avd_name>
   ```

3. **If still seeing red screen**: 
   - Shake your device/emulator and select "Reload"
   - Press 'r' in the Metro terminal to reload
   - Press 'd' to open developer menu

4. **Check Metro is running**: Open http://localhost:8081/status in browser

5. **If using pnpm**: Make sure you're using the correct package manager
   ```powershell
   pnpm install
   pnpm start
   ```

## Common Issues and Solutions

- **Port 8081 busy**: Kill the process using that port or use a different port
- **Android emulator not found**: Make sure Android SDK and emulator are properly installed
- **Metro not responding**: Check firewall settings and antivirus software
- **Build fails**: Make sure all dependencies are installed with `pnpm install` 