import Config from 'react-native-config';

// Environment variables interface
interface Environment {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  API_URL: string;
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;
  NEXT_PUBLIC_API_BASE_URL: string;
  APP_NAME: string;
  APP_ENV: string;
}

// Get environment variables with fallbacks
export const env: Environment = {
  GITHUB_CLIENT_ID: Config.GITHUB_CLIENT_ID || 'Ov23liUkvPd0zQtnSC55',
  GITHUB_CLIENT_SECRET: Config.GITHUB_CLIENT_SECRET || '1feba2fd580afb952c0f7d724c8aadffb498cf42',
  API_URL: Config.API_URL || 'http://192.168.1.4:8000',
  NEXTAUTH_SECRET: Config.NEXTAUTH_SECRET || 'h10jPavso9K+M4cnMz67mwun/x3o3/zABjGMeTSMTjc=',
  NEXTAUTH_URL: Config.NEXTAUTH_URL || 'http://localhost:3000',
  NEXT_PUBLIC_API_BASE_URL: Config.NEXT_PUBLIC_API_BASE_URL || 'http://192.168.1.4:8000',

  APP_NAME: Config.APP_NAME || 'Binyan',
  APP_ENV: Config.APP_ENV || 'development',
};

// API configuration
export const API_CONFIG = {
  BASE_URL: env.API_URL || env.NEXT_PUBLIC_API_BASE_URL,
  TIMEOUT: 15000,
  RETRY_ATTEMPTS: 3,
};

// OAuth configuration
export const OAUTH_CONFIG = {
  GITHUB: {
    CLIENT_ID: env.GITHUB_CLIENT_ID,
    CLIENT_SECRET: env.GITHUB_CLIENT_SECRET,
    REDIRECT_URI: 'binyan://oauth/github/callback',
    SCOPE: 'read:user user:email',
  },
};

// Development configuration
export const DEV_CONFIG = {
  USE_MOCK_API: env.APP_ENV === 'development',
  LOG_LEVEL: 'debug',
  ENABLE_DEBUG_MENU: env.APP_ENV === 'development',
};

// Debug environment variables (only in development)
if (__DEV__) {
  console.log('Environment Variables:', {
    GITHUB_CLIENT_ID: env.GITHUB_CLIENT_ID,
    API_URL: env.API_URL,
    APP_ENV: env.APP_ENV,
  });
} 