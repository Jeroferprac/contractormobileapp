import { Alert } from 'react-native';
import apiService from '../api/api';
import { OAUTH_CONFIG } from '../config/env';
import { parseURLParams } from '../utils/network';
import { getOAuthRedirectURL } from '../utils/deepLinking';
import storageService from '../utils/storage';

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
      // Generate OAuth state for security
      const state = this.generateOAuthState();
      await storageService.setOAuthState(state);
      
      // Build GitHub OAuth URL
      const redirectUri = getOAuthRedirectURL('github');
      const scope = OAUTH_CONFIG.GITHUB.SCOPE;
      const clientId = OAUTH_CONFIG.GITHUB.CLIENT_ID;
      
      const oauthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;
      
      console.log('GitHub OAuth URL:', oauthUrl);
      console.log('Redirect URI:', redirectUri);
      console.log('Client ID:', clientId);
      
      // Try to open the URL in browser
      try {
        const supported = await this.canOpenURL(oauthUrl);
        if (supported) {
          await this.openURL(oauthUrl);
        } else {
          // Fallback to alert with URL
          Alert.alert(
            'GitHub OAuth', 
            `OAuth URL: ${oauthUrl}\n\nPlease copy this URL and open it in your browser.`,
            [
              { text: 'Copy URL', onPress: () => this.copyToClipboard(oauthUrl) },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
        }
      } catch (error) {
        console.error('Error opening URL:', error);
        Alert.alert(
          'GitHub OAuth', 
          `OAuth URL: ${oauthUrl}\n\nPlease copy this URL and open it in your browser.`,
          [
            { text: 'Copy URL', onPress: () => this.copyToClipboard(oauthUrl) },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      }
    } catch (error) {
      console.error('GitHub OAuth Error:', error);
      Alert.alert('Error', 'Failed to start GitHub OAuth');
    }
  }

  /**
   * Check if URL can be opened
   */
  private async canOpenURL(url: string): Promise<boolean> {
    try {
      // For now, we'll assume it can be opened
      // In a real implementation, you'd use Linking.canOpenURL
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Open URL
   */
  private async openURL(url: string): Promise<void> {
    try {
      // For now, we'll just log the URL
      // In a real implementation, you'd use Linking.openURL
      console.log('Opening URL:', url);
      Alert.alert('Opening Browser', 'Please complete the OAuth flow in your browser and return to the app.');
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  }

  /**
   * Generate OAuth state for security
   */
  private generateOAuthState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Copy text to clipboard (placeholder)
   */
  private copyToClipboard(text: string): void {
    // TODO: Implement clipboard functionality
    console.log('Copy to clipboard:', text);
  }

  /**
   * Handle OAuth callback with authorization code
   */
  async handleOAuthCallback(provider: string, code: string, state?: string): Promise<any> {
    try {
      console.log(`${provider} OAuth callback with code:`, code);
      
      // Verify OAuth state for security
      if (state) {
        const storedState = await storageService.getOAuthState();
        if (state !== storedState) {
          throw new Error('Invalid OAuth state');
        }
      }
      
      // Exchange code for token
      const response = await apiService.oauthCallback(provider, code);
      const { access_token, user } = response.data;
      
      console.log(`${provider} OAuth successful:`, user.email);
      
      // Clear OAuth state
      await storageService.setOAuthState('');
      
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
      
      // Parse URL parameters
      const params = parseURLParams(url);
      const code = params.code;
      const state = params.state;
      const provider = 'github'; // Default to GitHub for now
      
      if (code) {
        return await this.handleOAuthCallback(provider, code, state);
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