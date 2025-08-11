import { Platform } from 'react-native';
import { isConnected, getBaseURL } from './network';
import { API_CONFIG } from '../config/env';

/**
 * Network status and health check utilities
 */
export class NetworkStatus {
  private static instance: NetworkStatus;
  private isOnline: boolean = true;
  private lastHealthCheck: Date | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  static getInstance(): NetworkStatus {
    if (!NetworkStatus.instance) {
      NetworkStatus.instance = new NetworkStatus();
    }
    return NetworkStatus.instance;
  }

  /**
   * Check if device is online
   */
  async checkConnectivity(): Promise<boolean> {
    try {
      this.isOnline = await isConnected();
      return this.isOnline;
    } catch (error) {
      console.error('Connectivity check failed:', error);
      this.isOnline = false;
      return false;
    }
  }

  /**
   * Check API health
   */
  async checkApiHealth(): Promise<{ isHealthy: boolean; responseTime?: number; error?: string }> {
    const startTime = Date.now();
    
    try {
      const baseURL = getBaseURL();
      const healthEndpoint = `${baseURL}/health`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(healthEndpoint, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        this.lastHealthCheck = new Date();
        return { isHealthy: true, responseTime };
      } else {
        return { 
          isHealthy: false, 
          responseTime, 
          error: `API returned status ${response.status}` 
        };
      }
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      return { 
        isHealthy: false, 
        responseTime, 
        error: error.message || 'API health check failed' 
      };
    }
  }

  /**
   * Start periodic health checks
   */
  startHealthChecks(intervalMs: number = 60000): void { // Default: 1 minute
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      await this.checkApiHealth();
    }, intervalMs);
  }

  /**
   * Stop periodic health checks
   */
  stopHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Get current network status
   */
  getStatus(): {
    isOnline: boolean;
    lastHealthCheck: Date | null;
    platform: string;
    baseURL: string;
    isDev: boolean;
  } {
    return {
      isOnline: this.isOnline,
      lastHealthCheck: this.lastHealthCheck,
      platform: Platform.OS,
      baseURL: getBaseURL(),
      isDev: __DEV__,
    };
  }

  /**
   * Get network diagnostics information
   */
  async getDiagnostics(): Promise<{
    connectivity: boolean;
    apiHealth: { isHealthy: boolean; responseTime?: number; error?: string };
    configuration: any;
    platform: string;
    timestamp: string;
  }> {
    const connectivity = await this.checkConnectivity();
    const apiHealth = await this.checkApiHealth();
    
    return {
      connectivity,
      apiHealth,
      configuration: {
        baseURL: getBaseURL(),
        timeout: API_CONFIG.TIMEOUT,
        retryAttempts: API_CONFIG.RETRY_ATTEMPTS,
      },
      platform: Platform.OS,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Test network configuration
   */
  async testConfiguration(): Promise<{
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Test base URL format
      const baseURL = getBaseURL();
      if (!baseURL.startsWith('http://') && !baseURL.startsWith('https://')) {
        issues.push('Base URL does not have a valid protocol');
      }

      // Test URL accessibility
      const urlTest = new URL(baseURL);
      if (urlTest.hostname === 'localhost' && !__DEV__) {
        issues.push('Using localhost in production environment');
        recommendations.push('Configure a production API URL');
      }

      // Test connectivity
      const isConnected = await this.checkConnectivity();
      if (!isConnected) {
        issues.push('No internet connectivity');
        recommendations.push('Check your internet connection');
      }

      // Test API health
      const healthCheck = await this.checkApiHealth();
      if (!healthCheck.isHealthy) {
        issues.push(`API health check failed: ${healthCheck.error}`);
        recommendations.push('Check if the API server is running and accessible');
      }

      // Check timeout configuration
      if (API_CONFIG.TIMEOUT < 5000) {
        recommendations.push('Consider increasing timeout for better reliability');
      }

      return {
        isValid: issues.length === 0,
        issues,
        recommendations,
      };
    } catch (error: any) {
      issues.push(`Configuration test failed: ${error.message}`);
      return {
        isValid: false,
        issues,
        recommendations,
      };
    }
  }
}

export default NetworkStatus;
