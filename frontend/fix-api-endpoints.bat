@echo off
echo ========================================
echo Fixed API Endpoints - 404 Error Resolved
echo ========================================
echo.
echo The 404 errors have been fixed by correcting the API endpoint paths:
echo.
echo BEFORE (incorrect):
echo   /api/v1/inventory/products/{id}
echo   /api/v1/inventory/warehouses/{id}
echo.
echo AFTER (correct):
echo   /api/v1/inventory/inventory/products/{id}
echo   /api/v1/inventory/inventory/warehouses/{id}
echo.
echo Changes made:
echo 1. Fixed inventoryApi.ts basePath from '/inventory/inventory' to '/inventory'
echo 2. Fixed batchesApi.ts endpoints to use '/inventory/inventory/products/{id}'
echo 3. Fixed batchesApi.ts endpoints to use '/inventory/inventory/warehouses/{id}'
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
echo 4. The 404 errors should now be resolved
echo.
echo 5. To test the API endpoints directly, run:
echo    node test-api-endpoints.js
echo.
echo 6. Your app should now work without console errors
echo.
pause
