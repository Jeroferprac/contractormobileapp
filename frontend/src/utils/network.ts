import { Platform } from 'react-native';
import { API_CONFIG } from '../config/env';

// Network configuration for different environments
interface NetworkConfig {
  androidEmulator: string;
  iosSimulator: string;
  physicalDevice: string;
  development: string;
}

// Default network configuration
const NETWORK_CONFIG: NetworkConfig = {
  androidEmulator: '10.72.105.204', // Use your actual local IP for Android emulator
  iosSimulator: 'localhost', // iOS simulator localhost
  physicalDevice: '10.72.105.204', // Use your actual local IP for physical devices
  development: 'localhost', // Development server
};

/**
 * Get the appropriate base URL based on platform and environment
 */
export const getBaseURL = (): string => {
  const port = '8000'; // Your backend port (update this if your backend runs on a different port)
  const apiPath = '/api/v1';
  
  // If API_URL is set in environment, use it
  if (API_CONFIG.BASE_URL && API_CONFIG.BASE_URL !== 'http://localhost:8000') {
    return `${API_CONFIG.BASE_URL}${apiPath}`;
  }
  
  let host: string;
  
  if (__DEV__) {
    // Development environment
    if (Platform.OS === 'android') {
      // Check if running on emulator or physical device
      // For now, we'll use the emulator address
      // In production, you'd want to detect this dynamically
      host = NETWORK_CONFIG.androidEmulator; // 10.0.2.2 is used by Android emulators to access host machine's localhost
    } else if (Platform.OS === 'ios') {
      host = NETWORK_CONFIG.iosSimulator;
    } else {
      host = NETWORK_CONFIG.development;
    }
  } else {
    // Production environment - use your production API URL
    host = API_CONFIG.BASE_URL.replace('http://', '').replace('https://', '').split('/')[0];
  }
  
  return `http://${host}:${port}${apiPath}`;
};

/**
 * Get the OAuth redirect URL for the current platform
 */
export const getOAuthRedirectURL = (provider: string): string => {
  const scheme = 'binyan';
  return `${scheme}://oauth/${provider}/callback`;
};

/**
 * Check if the device is connected to the internet
 */
export const isConnected = async (): Promise<boolean> => {
  try {
    // You can implement a more sophisticated network check here
    // For now, we'll assume the device is connected
    return true;
  } catch (error) {
    console.error('Network connectivity check failed:', error);
    return false;
  }
};

/**
 * Get network information for debugging
 */
export const getNetworkInfo = () => {
  return {
    platform: Platform.OS,
    isDev: __DEV__,
    baseURL: getBaseURL(),
    oauthRedirectURL: getOAuthRedirectURL('github'),
    apiConfig: API_CONFIG,
  };
};

/**
 * Validate URL format
 */
export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Parse URL parameters
 */
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