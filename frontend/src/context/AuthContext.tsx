import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import apiService from '../api/api';
import oauthService from '../services/OAuthService';
import githubOAuthService from '../services/GitHubOAuthService';
import storageService from '../utils/storage';
import { User, LoginRequest, RegisterRequest } from '../types/api';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  token: string | null;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  startOAuth: (provider: string) => Promise<void>;
  clearError: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    token: null,
  });
  const [error, setError] = useState<string | null>(null);

  // Check for existing token on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const [token, userData] = await Promise.all([
        storageService.getAuthToken(),
        storageService.getUserData(),
      ]);

      if (token && userData) {
        setState({
          isAuthenticated: true,
          user: userData,
          token,
          isLoading: false,
        });
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      setError(null);

      const response = await apiService.login(credentials);
      const { access_token, user } = response.data;
      
      setState({
        isAuthenticated: true,
        user,
        token: access_token,
        isLoading: false,
      });
      
      console.log('Login successful:', user.email);
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Login failed';
      setError(errorMessage);
      setState(prev => ({ ...prev, isLoading: false }));
      
      Alert.alert('Login Failed', errorMessage);
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      setError(null);

      const response = await apiService.register(userData);
      const { access_token, user } = response.data;
      
      setState({
        isAuthenticated: true,
        user,
        token: access_token,
        isLoading: false,
      });
      
      Alert.alert('Success', 'Account created successfully!');
      console.log('Registration successful:', user.email);
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Registration failed';
      setError(errorMessage);
      setState(prev => ({ ...prev, isLoading: false }));
      
      Alert.alert('Registration Failed', errorMessage);
    }
  };

  const logout = async () => {
    console.log('🔄 Starting logout process...');
    
    try {
      // First clear storage
      console.log('🧹 Clearing local auth data...');
      await storageService.clearAuthData();
      console.log('✅ Local auth data cleared');
      
      // Then update state
      console.log('🔄 Updating auth state...');
      setState({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
      });
      setError(null);
      console.log('✅ Auth state updated');
      
      // Finally call API in background
      try {
        console.log('📡 Calling logout API...');
        await apiService.logout();
        console.log('✅ Logout API call successful');
      } catch (error) {
        console.error('❌ Logout API error:', error);
      }
      
      console.log('✅ Logout process completed');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Force state update even if storage clearing fails
      setState({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
      });
      setError(null);
    }
  };

  const getCurrentUser = async () => {
    try {
      const response = await apiService.getCurrentUser();
      const user = response.data;
      setState(prev => ({ ...prev, user }));
    } catch (error) {
      console.error('Get current user error:', error);
      setState(prev => ({ ...prev, isAuthenticated: false, user: null }));
    }
  };

  const startOAuth = async (provider: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      setError(null);

      if (provider === 'github') {
        await githubOAuthService.startGitHubOAuth();
        // If successful, the user will be automatically logged in
        // Check auth status after OAuth completion
        await checkAuthStatus();
      } else {
        Alert.alert('Coming Soon', `${provider} OAuth will be available soon!`);
      }
    } catch (error: any) {
      console.error('OAuth error:', error);
      const errorMessage = error.message || 'OAuth failed';
      setError(errorMessage);
      Alert.alert('OAuth Failed', errorMessage);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleOAuthCallback = async (result: any) => {
    if (result.success) {
      const { access_token, user } = result;
      
      setState({
        isAuthenticated: true,
        user,
        token: access_token,
        isLoading: false,
      });
      
      console.log('OAuth login successful:', user.email);
    } else {
      setError(result.error || 'OAuth failed');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    getCurrentUser,
    startOAuth,
    clearError,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 