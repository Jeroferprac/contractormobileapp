import { Platform } from 'react-native';
import { API_CONFIG } from '../config/env';

interface NetworkConfig {
  androidEmulator: string;
  iosSimulator: string;
  physicalDevice: string;
  development: string;
}

const NETWORK_CONFIG: NetworkConfig = {
  androidEmulator: '10.72.105.204',
  iosSimulator: 'localhost',
  physicalDevice: '10.72.105.204',
  development: 'localhost',
};

export const getBaseURL = (): string => {
  const port = '8000';
  const apiPath = '/api/v1';

  if (API_CONFIG.BASE_URL && API_CONFIG.BASE_URL !== 'http://localhost:8000') {
    return `${API_CONFIG.BASE_URL}${apiPath}`;
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
    host = API_CONFIG.BASE_URL.replace(/^https?:\/\//, '').split('/')[0];
  }

  return `http://${host}:${port}${apiPath}`;
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
