# Binyan - Contractor Mobile App

A professional React Native mobile application for contractors and customers with complete authentication system, GitHub OAuth integration, and modern UI design.

## 🚀 Features

### Authentication System
- **Email/Password Login & Registration**
- **GitHub OAuth Integration** using `react-native-app-auth`
- **Password Reset Flow** with OTP verification
- **Professional UI/UX** matching Figma design
- **Secure Token Management** with AsyncStorage
- **Automatic User Session Management**

### UI/UX Design
- **Exact Figma Implementation** with proper styling
- **Linear Gradient Buttons** and modern design
- **Vector Icons** using `react-native-vector-icons`
- **Responsive Layout** with proper keyboard handling
- **Professional Success Modals** with animations
- **Consistent Color Scheme** (#FF6B35 to #FF8E53)

### Technical Features
- **TypeScript** for type safety
- **React Navigation** for seamless navigation
- **Axios** for API communication
- **Environment Variables** management
- **Professional Error Handling**
- **Loading States** and user feedback

## 📱 Screens

### Authentication Flow
1. **Splash Screen** - App initialization
2. **Onboarding** - App introduction
3. **Login Screen** - Email/password + social login
4. **Signup Screen** - User registration
5. **Forgot Password** - Password reset with OTP
6. **Success Modals** - Registration confirmation

### Main App
- **Home Screen** - Dashboard with services
- **Tab Navigation** - Home, Services, Bookings, Profile

## 🛠 Setup Instructions

### Prerequisites
- Node.js (v18+)
- React Native CLI
- Android Studio / Xcode
- Backend server running on `http://192.168.31.45:8000`

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Configuration
Create `.env` file in the frontend directory:
```env
GITHUB_CLIENT_ID=Ov23liUkvPd0zQtnSC55
GITHUB_CLIENT_SECRET=1feba2fd580afb952c0f7d724c8aadffb498cf42
API_URL=http://192.168.31.45:8000
NEXTAUTH_SECRET=h10jPavso9K+M4cnMz67mwun/x3o3/zABjGMeTSMTjc=
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
APP_NAME=Binyan
APP_ENV=development
```

### 3. Vector Icons Setup
```bash
# Copy fonts to Android assets
npm run copy-fonts

# Clean and rebuild
cd android && ./gradlew clean
cd .. && npx react-native run-android
```

### 4. Run the App
```bash
# Start Metro bundler
npx react-native start

# Run on Android
npx react-native run-android

# Run on iOS
npx react-native run-ios
```

## 🔧 API Integration

### Backend Endpoints
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/oauth/github/callback` - GitHub OAuth callback

### Authentication Flow
1. **Login/Register** → Backend validation → Token storage
2. **GitHub OAuth** → GitHub API → Backend registration/login
3. **Token Management** → Automatic refresh and storage
4. **Session Persistence** → App restart maintains login

## 🎨 UI Components

### Design System
- **Colors**: Primary gradient (#FF6B35 to #FF8E53)
- **Typography**: Consistent font sizes and weights
- **Spacing**: 20px horizontal padding, consistent margins
- **Borders**: 2px border radius, subtle borders
- **Icons**: Feather and MaterialIcons from react-native-vector-icons

### Key Components
- **LinearGradient Buttons** - Professional gradient buttons
- **Input Fields** - Consistent styling with icons
- **Success Modal** - Animated success confirmation
- **Social Login Buttons** - GitHub, Apple, Facebook integration
- **OTP Input** - 5-digit verification code input

## 🔐 Security Features

### OAuth Security
- **State Verification** - Prevents CSRF attacks
- **Secure Token Storage** - Encrypted AsyncStorage
- **Token Refresh** - Automatic token renewal
- **Secure API Calls** - Bearer token authentication

### Data Protection
- **Input Validation** - Client-side form validation
- **Error Handling** - User-friendly error messages
- **Loading States** - Prevents double submissions
- **Session Management** - Automatic logout on token expiry

## 📱 Platform Support

### Android
- **Network Security** - Allows HTTP for local development
- **Deep Linking** - OAuth callback handling
- **Vector Icons** - Proper font bundling
- **Permissions** - Internet access for API calls

### iOS
- **URL Schemes** - OAuth callback configuration
- **Vector Icons** - Automatic font linking
- **Network Security** - ATS configuration for local development

## 🚀 Development

### Project Structure
```
src/
├── api/           # API service layer
├── components/    # Reusable UI components
├── config/        # Environment configuration
├── constants/     # Design system constants
├── context/       # React Context providers
├── navigation/    # Navigation configuration
├── screens/       # Screen components
├── services/      # Business logic services
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

### Key Files
- `src/config/env.ts` - Environment variables
- `src/services/GitHubOAuthService.ts` - GitHub OAuth integration
- `src/context/AuthContext.tsx` - Authentication state management
- `src/screens/LoginScreen.tsx` - Login UI implementation
- `src/screens/SignupScreen.tsx` - Registration UI implementation

## 🐛 Troubleshooting

### Common Issues

1. **Vector Icons Not Showing**
   ```bash
   npm run copy-fonts
   cd android && ./gradlew clean
   npx react-native run-android
   ```

2. **Network Security Error**
   - Ensure `network_security_config.xml` is properly configured
   - Check that backend is running on correct IP

3. **OAuth Callback Issues**
   - Verify GitHub OAuth app configuration
   - Check redirect URI matches `binyan://oauth/github/callback`

4. **Build Errors**
   ```bash
   npm run clean
   npm install
   npx react-native start --reset-cache
   ```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions, please contact the development team.
