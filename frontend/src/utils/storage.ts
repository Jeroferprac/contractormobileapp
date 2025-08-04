import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  AUTH_STATE: 'auth_state',
  OAUTH_STATE: 'oauth_state',
} as const;

// Storage interface
interface StorageData {
  authToken?: string;
  refreshToken?: string;
  userData?: any;
  authState?: string;
  oauthState?: string;
}

class StorageService {
  /**
   * Store authentication token
   */
  async setAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Error storing auth token:', error);
    }
  }

  /**
   * Get authentication token
   */
  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  /**
   * Store refresh token
   */
  async setRefreshToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
    } catch (error) {
      console.error('Error storing refresh token:', error);
    }
  }

  /**
   * Get refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  /**
   * Store user data
   */
  async setUserData(userData: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  }

  /**
   * Get user data
   */
  async getUserData(): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  /**
   * Store OAuth state
   */
  async setOAuthState(state: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.OAUTH_STATE, state);
    } catch (error) {
      console.error('Error storing OAuth state:', error);
    }
  }

  /**
   * Get OAuth state
   */
  async getOAuthState(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.OAUTH_STATE);
    } catch (error) {
      console.error('Error getting OAuth state:', error);
      return null;
    }
  }

  /**
   * Clear all authentication data
   */
  async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.OAUTH_STATE,
      ]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }

  /**
   * Get all stored data
   */
  async getAllData(): Promise<StorageData> {
    try {
      const [authToken, refreshToken, userData, authState, oauthState] = await Promise.all([
        this.getAuthToken(),
        this.getRefreshToken(),
        this.getUserData(),
        AsyncStorage.getItem(STORAGE_KEYS.AUTH_STATE),
        this.getOAuthState(),
      ]);

      return {
        authToken: authToken || undefined,
        refreshToken: refreshToken || undefined,
        userData,
        authState: authState || undefined,
        oauthState: oauthState || undefined,
      };
    } catch (error) {
      console.error('Error getting all data:', error);
      return {};
    }
  }
}

export const storageService = new StorageService();
export default storageService; 