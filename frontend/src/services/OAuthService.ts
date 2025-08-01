import { Alert } from 'react-native';
import apiService from '../api/api';

export class OAuthService {
  private static instance: OAuthService;
  
  private constructor() {}
  
  static getInstance(): OAuthService {
    if (!OAuthService.instance) {
      OAuthService.instance = new OAuthService();
    }
    return OAuthService.instance;
  }

  /**
   * Start GitHub OAuth flow
   */
  async startGitHubOAuth(): Promise<void> {
    try {
      // Get OAuth URL from backend
      const response = await apiService.oauthLogin('github');
      const { url } = response.data;
      
      console.log('GitHub OAuth URL:', url);
      
      // For now, just show the URL - deep linking will be implemented later
      Alert.alert('GitHub OAuth', `OAuth URL: ${url}\n\nDeep linking will be implemented in a future update.`);
    } catch (error) {
      console.error('GitHub OAuth Error:', error);
      Alert.alert('Error', 'Failed to start GitHub OAuth');
    }
  }

  /**
   * Handle OAuth callback with authorization code
   */
  async handleOAuthCallback(provider: string, code: string): Promise<any> {
    try {
      console.log(`${provider} OAuth callback with code:`, code);
      
      // Exchange code for token
      const response = await apiService.oauthCallback(provider, code);
      const { access_token, user } = response.data;
      
      console.log(`${provider} OAuth successful:`, user.email);
      
      return {
        success: true,
        access_token,
        user,
      };
    } catch (error) {
      console.error(`${provider} OAuth callback error:`, error);
      Alert.alert('Error', `${provider} OAuth failed`);
      
               return {
           success: false,
           error: error instanceof Error ? error.message : 'Unknown error',
         };
    }
  }

  /**
   * Handle deep link callback
   * This is called when user returns from OAuth provider
   */
  async handleDeepLink(url: string): Promise<any> {
    try {
      console.log('Handling deep link:', url);
      
      // Parse URL for OAuth callback
      const urlObj = new URL(url);
      const code = urlObj.searchParams.get('code');
      const provider = urlObj.searchParams.get('provider') || 'github';
      
      if (code) {
        return await this.handleOAuthCallback(provider, code);
      } else {
        console.log('No authorization code found in URL');
        return { success: false, error: 'No authorization code' };
      }
    } catch (error) {
      console.error('Deep link handling error:', error);
             return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Setup deep link listener
   */
  setupDeepLinkListener(callback: (result: any) => void): void {
    // Deep linking will be implemented in a future update
    console.log('Deep linking not yet implemented');
  }
}

export const oauthService = OAuthService.getInstance();
export default oauthService; 