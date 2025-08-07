import { authorize, refresh, revoke } from 'react-native-app-auth';
import { env } from '../config/env';
import apiService from '../api/api';
import storageService from '../utils/storage';

interface GitHubOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUrl: string;
  scopes: string[];
  serviceConfiguration: {
    authorizationEndpoint: string;
    tokenEndpoint: string;
    revocationEndpoint: string;
  };
}

const githubConfig: GitHubOAuthConfig = {
  clientId: env.GITHUB_CLIENT_ID,
  clientSecret: env.GITHUB_CLIENT_SECRET,
  redirectUrl: 'binyan://oauth/github/callback',
  scopes: ['user:email', 'read:user'],
  serviceConfiguration: {
    authorizationEndpoint: 'https://github.com/login/oauth/authorize',
    tokenEndpoint: 'https://github.com/login/oauth/access_token',
    revocationEndpoint: 'https://github.com/settings/connections/applications',
  },
};

class GitHubOAuthService {
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  async startGitHubOAuth(): Promise<void> {
    try {
      const state = this.generateState();
      
      // Store state for verification
      await storageService.setOAuthState(state);

      // Use react-native-app-auth for professional OAuth flow
      const authState = await authorize(githubConfig);
      
      if (authState.authorizationCode) {
        await this.handleOAuthCallback(authState.authorizationCode, state);
      } else {
        throw new Error('No authorization code received');
      }
    } catch (error: any) {
      console.error('GitHub OAuth error:', error);
      throw new Error(error.message || 'GitHub OAuth failed');
    }
  }

  async handleOAuthCallback(code: string, state: string): Promise<void> {
    try {
      // Verify state
      const storedState = await storageService.getOAuthState();
      if (state !== storedState) {
        throw new Error('Invalid OAuth state');
      }

      // Use your backend's OAuth callback endpoint
      const response = await apiService.oauthCallback('github', code);
      
      // Store tokens if OAuth callback is successful
      if (response.data.access_token) {
        await storageService.setAuthToken(response.data.access_token);
        if (response.data.refresh_token) {
          await storageService.setRefreshToken(response.data.refresh_token);
        }
        if (response.data.user) {
          await storageService.setUserData(response.data.user);
        }
      }
      
      // Clear OAuth state
      await storageService.clearAuthData();
      
      console.log('GitHub OAuth completed successfully');
      
    } catch (error: any) {
      console.error('OAuth callback error:', error);
      throw new Error(error.message || 'OAuth callback failed');
    }
  }

  async refreshGitHubToken(refreshToken: string): Promise<string> {
    try {
      const response = await refresh(githubConfig, {
        refreshToken: refreshToken,
      });
      return response.accessToken;
    } catch (error: any) {
      console.error('GitHub token refresh error:', error);
      throw new Error('Failed to refresh GitHub token');
    }
  }

  async revokeGitHubToken(accessToken: string): Promise<void> {
    try {
      await revoke(githubConfig, {
        tokenToRevoke: accessToken,
      });
    } catch (error: any) {
      console.error('GitHub token revocation error:', error);
      throw new Error('Failed to revoke GitHub token');
    }
  }
}

export const githubOAuthService = new GitHubOAuthService();
export default githubOAuthService; 