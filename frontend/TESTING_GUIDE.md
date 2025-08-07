# 🧪 Testing Guide: React Native Frontend with Separate Backend

## 📋 Prerequisites

1. **Backend Running**: Your backend should be running on `http://192.168.31.45:8000`
2. **Network Access**: Both devices should be on the same network
3. **Environment Variables**: Proper `.env` file configured

## 🚀 Step-by-Step Testing Process

### Step 1: Start Your Backend
```bash
# Navigate to your backend folder
cd /path/to/your/backend

# Start your backend server
# For Python/Django:
python run.py runserver 192.168.31.45:8000

# For Python/FastAPI:
uvicorn main:app --host 192.168.31.45 --port 8000

# For Node.js/Express:
npm start
# (Make sure it's configured to listen on 192.168.31.45:8000)
```

### Step 2: Verify Backend Endpoints
Test your backend endpoints directly:

```bash
# Test basic connectivity
curl http://192.168.31.45:8000/api/v1/auth/me

# Test registration endpoint
curl -X POST http://192.168.31.45:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "+1234567890",
    "role": "customer"
  }'

# Test login endpoint
curl -X POST http://192.168.31.45:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Step 3: Start React Native App
```bash
# Navigate to frontend
cd frontend

# Install dependencies (if not already done)
npm install

# Start Metro bundler
npx react-native start

# In another terminal, run Android
npx react-native run-android
```

### Step 4: Use the OAuthTest Component

1. **Open the app** and navigate to the OAuthTest component
2. **Run "Test Environment Variables"** - Should show your `.env` values
3. **Run "Test Network Config"** - Should show correct API URL
4. **Run "Test API Connection"** - Should connect to your backend
5. **Run "Test OAuth Config"** - Should show GitHub OAuth settings

### Step 5: Test Authentication Flow

#### A. Test Registration
1. Click **"Test Register"** button
2. Check console logs for API request/response
3. Should create a new user in your backend

#### B. Test Login
1. Click **"Test Login"** button
2. Should authenticate with your backend
3. Check if user state updates in the app

#### C. Test GitHub OAuth
1. Click **"Test GitHub OAuth"** button
2. Should show OAuth URL in alert
3. Copy URL and open in browser
4. Complete GitHub OAuth flow
5. Should redirect back to app

### Step 6: Monitor Network Traffic

#### Using Chrome DevTools (for Android):
1. Open Chrome and go to `chrome://inspect`
2. Find your React Native app
3. Click "inspect" to open DevTools
4. Go to Network tab to see API calls

#### Using Flipper (Recommended):
1. Install Flipper: https://fbflipper.com/
2. Open Flipper and connect to your app
3. Use Network plugin to monitor API calls

## 🔍 Debugging Common Issues

### Issue 1: "Network Error" or "Connection Refused"
**Solution:**
- Check if backend is running on correct IP
- Verify firewall settings
- Test with curl first

### Issue 2: "CORS Error"
**Solution:**
- Backend needs to allow requests from your app
- Add CORS headers in your backend

### Issue 3: "OAuth Redirect URI Mismatch"
**Solution:**
- Check GitHub OAuth app settings
- Ensure redirect URI matches: `binyan://oauth/github/callback`

### Issue 4: "Environment Variables Not Loading"
**Solution:**
- Restart Metro bundler: `npx react-native start --reset-cache`
- Check `.env` file format
- Verify `react-native-config` installation

## 📱 Testing on Different Devices

### Android Emulator
- Backend URL: `http://10.0.2.2:8000`
- Network should work automatically

### Physical Android Device
- Backend URL: `http://192.168.31.45:8000`
- Both devices must be on same WiFi

### iOS Simulator
- Backend URL: `http://localhost:8000`
- Works if backend runs on same machine

## 🧪 Advanced Testing

### Test with Real Data
```javascript
// In OAuthTest component, add these test functions:

const testRealRegistration = async () => {
  try {
    await register({
      full_name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'securePassword123',
      phone: '+1234567890',
      role: 'contractor'
    });
    addResult('Real Registration: Success');
  } catch (error: any) {
    addResult(`Real Registration Error: ${error.message}`);
  }
};

const testRealLogin = async () => {
  try {
    await login({
      email: 'john.doe@example.com',
      password: 'securePassword123'
    });
    addResult('Real Login: Success');
  } catch (error: any) {
    addResult(`Real Login Error: ${error.message}`);
  }
};
```

### Test Error Scenarios
```javascript
const testInvalidLogin = async () => {
  try {
    await login({
      email: 'invalid@example.com',
      password: 'wrongpassword'
    });
    addResult('Invalid Login: Should have failed');
  } catch (error: any) {
    addResult(`Invalid Login: Correctly failed - ${error.message}`);
  }
};
```

## 📊 Expected Test Results

### ✅ Successful Tests Should Show:
- Environment Variables: All values loaded correctly
- Network Config: Correct API URL for your platform
- API Connection: "Success - 200" or similar
- OAuth Config: GitHub client ID and redirect URI
- Login/Register: "Success" messages
- User State: Shows authenticated user info

### ❌ Failed Tests Will Show:
- Connection errors (check backend)
- Authentication errors (check credentials)
- OAuth errors (check GitHub app settings)
- Environment errors (check `.env` file)

## 🚀 Next Steps After Testing

1. **Fix any issues** found during testing
2. **Implement proper error handling** in your app
3. **Add loading states** for better UX
4. **Test on real devices** (not just emulator)
5. **Implement proper OAuth deep linking**

## 📞 Need Help?

If you encounter issues:
1. Check the console logs in Metro bundler
2. Use the OAuthTest component to isolate problems
3. Test backend endpoints directly with curl
4. Verify network connectivity between devices

---

**Happy Testing! 🎉** 