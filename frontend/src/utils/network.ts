import { Platform } from 'react-native';
import { API_CONFIG } from '../config/env';

interface NetworkConfig {
  androidEmulator: string;
  iosSimulator: string;
  physicalDevice: string;
  development: string;
}

const NETWORK_CONFIG: NetworkConfig = {
  androidEmulator: '192.168.1.4',
  iosSimulator: 'localhost',
  physicalDevice: '192.168.1.4',
  development: 'localhost',
};

export const getBaseURL = (): string => {
  try {
    const port = '8000';
    const apiPath = '/api/v1';

    // Use environment configuration if available
    if (API_CONFIG.BASE_URL && API_CONFIG.BASE_URL !== 'http://localhost:8000') {
      const baseURL = `${API_CONFIG.BASE_URL}${apiPath}`;
      console.log('🌐 [Network] Using API_CONFIG.BASE_URL:', baseURL);
      return baseURL;
    }

    // Force the correct IP for development
    if (__DEV__) {
      const correctIP = '192.168.1.4';
      const baseURL = `http://${correctIP}:${port}${apiPath}`;
      console.log('🌐 [Network] Using forced development IP:', baseURL);
      return baseURL;
    }

    if (API_CONFIG.BASE_URL && API_CONFIG.BASE_URL !== 'http://localhost:8000') {
      // Always add /api/v1 to the configured base URL
      const baseURL = `${API_CONFIG.BASE_URL}${apiPath}`;
      console.log('🌐 [Network] Using API_CONFIG.BASE_URL with /api/v1:', baseURL);
      return baseURL;
    }

    let host: string;

    if (__DEV__) {
      if (Platform.OS === 'android') {
        host = NETWORK_CONFIG.androidEmulator;
      } else if (Platform.OS === 'ios') {
        host = NETWORK_CONFIG.iosSimulator;
      } else {
        host = NETWORK_CONFIG.development;
      }
    } else {
      if (!API_CONFIG.BASE_URL) {
        throw new Error('API_CONFIG.BASE_URL is required in production');
      }
      host = API_CONFIG.BASE_URL.replace(/^https?:\/\//, '').split('/')[0];
    }

    const baseURL = `http://${host}:${port}${apiPath}`;
    console.log('🌐 [Network] Generated base URL:', baseURL);
    console.log('🌐 [Network] Platform:', Platform.OS, 'Dev:', __DEV__, 'Host:', host);
    
    return baseURL;
  } catch (error) {
    console.error('❌ [Network] Error generating base URL:', error);
    // Fallback to localhost in development, production API in production
    const fallbackURL = __DEV__ ? 'http://localhost:8000/api/v1' : 'https://api.binyan.com/api/v1';
    console.log('🔄 [Network] Using fallback URL:', fallbackURL);
    return fallbackURL;
  }
};

export const getOAuthRedirectURL = (provider: string): string => {
  const scheme = 'binyan';
  return `${scheme}://oauth/${provider}/callback`;
};

export const isConnected = async (): Promise<boolean> => {
  try {
    return true;
  } catch (error) {
    console.error('Network connectivity check failed:', error);
    return false;
  }
};

export const getNetworkInfo = () => ({
  platform: Platform.OS,
  isDev: __DEV__,
  baseURL: getBaseURL(),
  oauthRedirectURL: getOAuthRedirectURL('github'),
  apiConfig: API_CONFIG,
});

export const isValidURL = (url: string): boolean => {
  try {
    // Assign to variable to satisfy `no-new`
    const testUrl = new URL(url);
    return !!testUrl;
  } catch {
    return false;
  }
};

export const parseURLParams = (url: string): Record<string, string> => {
  try {
    const urlObj = new URL(url);
    const params: Record<string, string> = {};

    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return params;
  } catch (error) {
    console.error('Error parsing URL params:', error);
    return {};
  }
};
