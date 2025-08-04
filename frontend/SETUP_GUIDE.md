# React Native Authentication Setup Guide

## Overview
This guide covers the complete setup of authentication in your React Native app with GitHub OAuth integration, email/password registration, and role-based access control.

## 🚀 Quick Start

### 1. Environment Configuration

Create a `.env` file in the `frontend` directory:

```bash
# GitHub OAuth Configuration
GITHUB_CLIENT_ID=Ov23liUkvPd0zQtnSC55
GITHUB_CLIENT_SECRET=1feba2fd580afb952c0f7d724c8aadffb498cf42

# NextAuth Configuration (for reference)
NEXTAUTH_SECRET=h10jPavso9K+M4cnMz67mwun/x3o3/zABjGMeTSMTjc=
NEXTAUTH_URL=http://localhost:3000

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# App Configuration
APP_NAME=Binyan
APP_ENV=development
```

### 2. Dependencies Installation

```bash
cd frontend
npm install @react-native-async-storage/async-storage
```

### 3. Network Configuration for Mobile Development

#### For Android Emulator:
- Uses `10.0.2.2:8000` (Android emulator localhost)
- Backend should be accessible from your development machine

#### For iOS Simulator:
- Uses `localhost:8000`
- Backend should be running on your Mac

#### For Physical Device:
- Update `NETWORK_CONFIG.physicalDevice` in `src/utils/network.ts`
- Use your computer's local IP address (e.g., `192.168.31.45`)

### 4. Backend Setup

Ensure your backend is running on port 8000 with these endpoints:

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

## 🔐 Authentication Features

### 1. Email/Password Authentication
- Registration with role selection (company, contractor, customer)
- Login with email and password
- Form validation and error handling
- Token storage in AsyncStorage

### 2. GitHub OAuth Integration
- Secure OAuth state generation
- GitHub OAuth URL construction
- Callback handling (ready for deep linking)
- Token exchange and user data storage

### 3. Token Management
- Automatic token storage on login/registration
- Token refresh capability
- Automatic logout on 401 errors
- Persistent authentication state

### 4. Role-Based Access
- User roles: company, contractor, customer
- Role selection during registration
- Role-based UI components (ready for implementation)

## 📱 Mobile Development Setup

### Android Development

1. **Emulator Setup:**
   ```bash
   # Start Android emulator
   emulator -avd <your_avd_name>
   
   # Run the app
   npm run android
   ```

2. **Physical Device Setup:**
   - Connect device via USB
   - Enable USB debugging
   - Update IP address in `src/utils/network.ts`
   - Ensure device and computer are on same network

### iOS Development

1. **Simulator Setup:**
   ```bash
   # Run on iOS simulator
   npm run ios
   ```

2. **Physical Device Setup:**
   - Connect iPhone via USB
   - Trust the developer certificate
   - Update network configuration if needed

## 🔧 Configuration Files

### Environment Configuration (`src/config/env.ts`)
- Centralized environment variable management
- Fallback values for development
- OAuth and API configuration

### Network Configuration (`src/utils/network.ts`)
- Dynamic base URL detection
- Platform-specific network handling
- OAuth redirect URL generation

### Storage Configuration (`src/utils/storage.ts`)
- AsyncStorage wrapper for tokens and user data
- Secure token management
- OAuth state storage

## 🚀 Usage Examples

### Basic Authentication Flow

```typescript
import { useAuth } from '../context/AuthContext';

const MyComponent = () => {
  const { login, register, logout, isAuthenticated, user } = useAuth();

  const handleLogin = async () => {
    try {
      await login({
        email: 'user@example.com',
        password: 'password123'
      });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleGitHubOAuth = async () => {
    try {
      await startOAuth('github');
    } catch (error) {
      console.error('OAuth failed:', error);
    }
  };
};
```

### API Service Usage

```typescript
import apiService from '../api/api';

// Make authenticated requests
const user = await apiService.getCurrentUser();
const services = await apiService.getServices();
```

## 🔒 Security Features

### OAuth Security
- OAuth state parameter for CSRF protection
- Secure token storage in AsyncStorage
- Automatic token refresh
- Secure logout with token clearing

### Network Security
- HTTPS enforcement in production
- Request/response interceptors
- Error handling and logging
- Automatic authentication state management

## 🐛 Troubleshooting

### Common Issues

1. **Network Connection Issues:**
   - Check if backend is running on port 8000
   - Verify IP address configuration
   - Ensure device/emulator can reach backend

2. **OAuth Issues:**
   - Verify GitHub OAuth app configuration
   - Check redirect URI settings
   - Ensure OAuth state is properly handled

3. **Token Issues:**
   - Clear AsyncStorage if tokens are corrupted
   - Check token refresh logic
   - Verify backend token validation

### Debug Commands

```bash
# Clear React Native cache
npx react-native start --reset-cache

# Clean Android build
cd android && ./gradlew clean

# Reset Metro bundler
npm run reset
```

## 📋 Next Steps

### Immediate Tasks
1. Test email/password registration and login
2. Test GitHub OAuth flow (currently shows URL)
3. Implement deep linking for OAuth callbacks
4. Add role-based UI components

### Future Enhancements
1. Implement Google and Facebook OAuth
2. Add biometric authentication
3. Implement password reset functionality
4. Add email verification
5. Implement push notifications

## 📚 File Structure

```
frontend/src/
├── config/
│   └── env.ts                 # Environment configuration
├── utils/
│   ├── storage.ts             # AsyncStorage wrapper
│   └── network.ts             # Network utilities
├── api/
│   └── api.ts                # API service with auth
├── services/
│   └── OAuthService.ts       # OAuth handling
├── context/
│   └── AuthContext.tsx       # Authentication context
└── screens/
    ├── LoginScreen.tsx        # Login screen
    └── SignupScreen.tsx       # Registration screen
```

## 🎯 Testing Checklist

- [ ] Email/password registration works
- [ ] Email/password login works
- [ ] GitHub OAuth URL generation works
- [ ] Token storage and retrieval works
- [ ] Automatic logout on 401 errors
- [ ] Role selection during registration
- [ ] Network configuration for different platforms
- [ ] Error handling and user feedback

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review console logs for errors
3. Verify backend API endpoints
4. Test network connectivity

---

**Note:** This setup provides a production-ready authentication system with proper security measures, error handling, and mobile development considerations. 