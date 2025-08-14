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
      console.log('💾 [Storage] Storing auth token...');
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      console.log('✅ [Storage] Auth token stored successfully');
    } catch (error) {
      console.error('❌ [Storage] Failed to store auth token:', error);
      throw error;
    }
  }

  /**
   * Get authentication token
   */
  async getAuthToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      console.log('🔍 [Storage] Retrieved auth token:', !!token);
      return token;
    } catch (error) {
      console.error('❌ [Storage] Failed to get auth token:', error);
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
      console.log('💾 [Storage] Storing user data...');
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      console.log('✅ [Storage] User data stored successfully:', userData.email);
    } catch (error) {
      console.error('❌ [Storage] Failed to store user data:', error);
      throw error;
    }
  }

  /**
   * Get user data
   */
  async getUserData(): Promise<any | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      const parsed = userData ? JSON.parse(userData) : null;
      console.log('🔍 [Storage] Retrieved user data:', !!parsed, parsed?.email);
      return parsed;
    } catch (error) {
      console.error('❌ [Storage] Failed to get user data:', error);
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