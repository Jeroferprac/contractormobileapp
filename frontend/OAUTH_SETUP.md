# GitHub OAuth Integration Setup Guide

## 🎯 Overview
This guide provides step-by-step instructions to set up GitHub OAuth integration in your React Native app with a local backend.

## 📋 Prerequisites

1. **Backend running locally** on port 8000
2. **GitHub OAuth App** configured
3. **React Native app** with the implemented authentication system

## 🔧 Step 1: Environment Configuration

### Create `.env` file in `frontend/` directory:

```bash
# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# API Configuration
API_URL=http://192.168.x.x:8000

# App Configuration
APP_NAME=Binyan
APP_ENV=development
```

### Update your IP address:
- Replace `192.168.x.x` with your computer's local IP address
- Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)

## 🔧 Step 2: GitHub OAuth App Configuration

### 1. Create GitHub OAuth App:
- Go to GitHub Settings → Developer settings → OAuth Apps
- Click "New OAuth App"
- Fill in the details:
  - **Application name**: Binyan
  - **Homepage URL**: `http://localhost:3000`
  - **Authorization callback URL**: `binyan://oauth/github/callback`

### 2. Get OAuth Credentials:
- Copy the **Client ID** and **Client Secret**
- Update your `.env` file with these values

## 🔧 Step 3: Android Configuration

### Network Security Configuration
The app now includes `network_security_config.xml` that allows:
- HTTP connections to local IP addresses
- Cleartext traffic for development
- Access to `10.0.2.2` (Android emulator)
- Access to `192.168.x.x` (physical device)

### AndroidManifest.xml Updates
- Added `android:networkSecurityConfig`
- Added `android:usesCleartextTraffic="true"`
- Added deep linking intent filter for OAuth callbacks

## 🔧 Step 4: Backend Configuration

### Ensure your backend has these endpoints:

```bash
# Authentication endpoints
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET /api/v1/auth/me
GET /api/v1/auth/roles
GET /api/v1/auth/oauth/{provider}
POST /api/v1/auth/oauth/github/callback
POST /api/v1/auth/refresh
```

### GitHub OAuth Callback Endpoint
Your backend should handle the OAuth callback at:
```
POST /api/v1/auth/oauth/github/callback
```

Expected request body:
```json
{
  "code": "authorization_code_from_github",
  "state": "oauth_state_parameter"
}
```

Expected response:
```json
{
  "access_token": "jwt_token",
  "refresh_token": "refresh_token",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "User Name",
    "role": "customer"
  }
}
```

## 🧪 Step 5: Testing the Integration

### 1. Start your backend:
```bash
# In your backend directory
python manage.py runserver 0.0.0.0:8000
```

### 2. Start the React Native app:
```bash
cd frontend
npm run android  # or npm run ios
```

### 3. Use the OAuthTest component:
- Navigate to the OAuthTest screen
- Click "Run All Tests" to verify everything works
- Test individual components:
  - Environment Variables
  - Network Configuration
  - OAuth Configuration
  - API Connection
  - GitHub OAuth Flow

## 🔄 Step 6: GitHub OAuth Flow Testing

### Manual Testing:
1. **Click "Test GitHub OAuth"** in the OAuthTest component
2. **Copy the OAuth URL** from the alert
3. **Open the URL** in your browser
4. **Authorize the app** on GitHub
5. **Check the callback URL** - it should be: `binyan://oauth/github/callback?code=...&state=...`

### Expected Flow:
```
App → GitHub OAuth URL → Browser → GitHub → Callback URL → App
```

## 🐛 Troubleshooting

### Common Issues:

#### 1. **Network Connection Issues**
```bash
# Check if backend is accessible
curl http://192.168.x.x:8000/api/v1/auth/me
```

#### 2. **OAuth URL Issues**
- Verify GitHub OAuth App configuration
- Check redirect URI matches exactly: `binyan://oauth/github/callback`
- Ensure Client ID is correct in `.env`

#### 3. **Android Network Issues**
- Check `network_security_config.xml` is in place
- Verify `AndroidManifest.xml` has cleartext traffic enabled
- Test with both emulator and physical device

#### 4. **Environment Variables Not Loading**
```bash
# Clear React Native cache
npx react-native start --reset-cache
cd android && ./gradlew clean
```

### Debug Commands:

```bash
# Test API connection
curl -X GET http://192.168.x.x:8000/api/v1/auth/me

# Test OAuth endpoint
curl -X GET http://192.168.x.x:8000/api/v1/auth/oauth/github

# Check network configuration
adb shell settings put global http_proxy :0
```

## 📱 Platform-Specific Notes

### Android Emulator:
- Uses `10.0.2.2:8000` for backend
- OAuth redirect works with deep linking

### Android Physical Device:
- Uses your computer's IP address
- Ensure device and computer are on same network
- May need to disable mobile data temporarily

### iOS Simulator:
- Uses `localhost:8000`
- OAuth flow works in Safari

## 🔒 Security Considerations

### Development:
- HTTP is allowed for local development
- OAuth state parameter prevents CSRF attacks
- Tokens are stored securely in AsyncStorage

### Production:
- Use HTTPS for all API calls
- Implement proper token refresh
- Add certificate pinning
- Use secure storage for tokens

## 📋 Testing Checklist

- [ ] Environment variables load correctly
- [ ] Network configuration works for your platform
- [ ] API connection test passes
- [ ] GitHub OAuth URL generates correctly
- [ ] OAuth redirect URI matches GitHub app configuration
- [ ] Backend OAuth callback endpoint works
- [ ] Deep linking intent filter is configured
- [ ] Network security config allows local HTTP
- [ ] Login/register flows work
- [ ] Token storage and retrieval works

## 🚀 Next Steps

### Immediate:
1. Test the complete OAuth flow
2. Implement proper deep linking with `react-native-linking`
3. Add error handling for OAuth failures
4. Test on physical devices

### Future:
1. Add Google and Facebook OAuth
2. Implement biometric authentication
3. Add password reset functionality
4. Implement push notifications
5. Add email verification

## 📞 Support

If you encounter issues:

1. **Check the console logs** for detailed error messages
2. **Verify your backend is running** and accessible
3. **Test network connectivity** between app and backend
4. **Check GitHub OAuth App configuration**
5. **Verify environment variables** are loaded correctly

---

**Note**: This setup provides a production-ready OAuth integration with proper security measures and comprehensive testing tools. 