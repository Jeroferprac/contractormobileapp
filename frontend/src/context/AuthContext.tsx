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
  isRegistering: boolean;
  showRegistrationSuccess: boolean;
  registrationData: { user: User; token: string | null; needsLogin?: boolean; password?: string } | null;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest, password?: string) => Promise<{ success: boolean; user: User; token: string | null; needsLogin?: boolean }>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  startOAuth: (provider: string) => Promise<void>;
  clearError: () => void;
  authenticateFromStorage: (userData?: User, token?: string) => Promise<void>;
  clearRegistrationSuccess: () => void;
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
    isRegistering: false,
    showRegistrationSuccess: false,
    registrationData: null,
  });
  const [error, setError] = useState<string | null>(null);

  // Check for existing token on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (state.isRegistering) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }
      
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
          isRegistering: false,
          showRegistrationSuccess: false,
          registrationData: null,
        });
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
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
        isRegistering: false,
        showRegistrationSuccess: false,
        registrationData: null,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Login failed';
      setError(errorMessage);
      setState(prev => ({ ...prev, isLoading: false }));
      
      throw error; // Throw error so SignupScreen can handle it
    }
  };

  const register = async (userData: RegisterRequest, password?: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, isRegistering: true }));
      setError(null);

      const response = await apiService.register(userData);
      
      // Backend returns: { message: string, user: UserResponse }
      // Frontend expects: { access_token: string, user: UserResponse }
      const { user } = response.data;
      const message = (response.data as any).message;
      
      // Store registration data for SuccessModal
      const registrationData = { user, token: null, needsLogin: true, password };
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isRegistering: false, 
        showRegistrationSuccess: true,
        registrationData 
      }));
      
      // Check if we have the required data
      if (!user) {
        throw new Error('Registration successful but no user data received');
      }

      // For registration, we don't get a token from backend
      // We'll need to call login after registration to get the token
      const result = { success: true, user, token: null, needsLogin: true };
      return result;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Registration failed';
      setError(errorMessage);
      setState(prev => ({ ...prev, isLoading: false, isRegistering: false }));
      
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
      
      setState({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        isRegistering: false,
        showRegistrationSuccess: false,
        registrationData: null,
      });
      setError(null);
    } catch (error) {
      try {
        await storageService.clearAuthData();
      } catch (storageError) {
        // Ignore storage error
      }
      
      setState({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        isRegistering: false,
        showRegistrationSuccess: false,
        registrationData: null,
      });
      setError(null);
    }
  };

  const getCurrentUser = async () => {
    try {
      const storedUser = await storageService.getUserData();
      if (storedUser) {
        setState(prev => ({ ...prev, user: storedUser }));
      }
    } catch (error) {
      setState(prev => ({ ...prev, isAuthenticated: false, user: null }));
    }
  };

  const startOAuth = async (provider: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      setError(null);

      if (provider === 'github') {
        await githubOAuthService.startGitHubOAuth();
        await checkAuthStatus();
      } else {
        Alert.alert('Coming Soon', `${provider} OAuth will be available soon!`);
      }
    } catch (error: any) {
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
        isRegistering: false,
        showRegistrationSuccess: false,
        registrationData: null,
      });
    } else {
      setError(result.error || 'OAuth failed');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const clearError = () => {
    setError(null);
  };

  const clearRegistrationSuccess = () => {
    setState(prev => ({ ...prev, showRegistrationSuccess: false, registrationData: null }));
  };

  const authenticateFromStorage = async (userData?: User, token?: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, isRegistering: false }));
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Authentication timeout')), 10000);
      });
      
      const authPromise = async () => {
        let finalToken = token;
        let finalUserData = userData;
        
        if (!finalToken || !finalUserData) {
          const [storedToken, storedUserData] = await Promise.all([
            storageService.getAuthToken(),
            storageService.getUserData(),
          ]);
          finalToken = storedToken || undefined;
          finalUserData = storedUserData || undefined;
        }

        if (finalToken && finalUserData) {
          try {
            await storageService.setAuthToken(finalToken);
            await storageService.setUserData(finalUserData);
          } catch (storageError) {
            throw new Error('Failed to store authentication data');
          }
          
          setState({
            isAuthenticated: true,
            user: finalUserData,
            token: finalToken,
            isLoading: false,
            isRegistering: false,
            showRegistrationSuccess: false,
            registrationData: null,
          });
        } else {
          setState(prev => ({ ...prev, isLoading: false, isRegistering: false }));
        }
      };
      
      await Promise.race([authPromise(), timeoutPromise]);
      
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false, isRegistering: false }));
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    getCurrentUser,
    startOAuth,
    clearError,
    authenticateFromStorage,
    clearRegistrationSuccess,
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