import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  User, 
  AuthResponse, 
  Role, 
  LoginRequest, 
  RegisterRequest,
  Service,
  Booking,
  ApiError 
} from '../types/api';

import { getBaseURL } from '../utils/network';
import { API_CONFIG } from '../config/env';
import storageService from '../utils/storage';

class ApiService {
  private api: AxiosInstance;
  private useMock: boolean = false; 

  constructor() {
    const baseURL = getBaseURL();
    console.log('🔧 [API Service] Initializing with base URL:', baseURL);
    
    this.api = axios.create({
      baseURL: baseURL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for auth tokens
    this.api.interceptors.request.use(
      async (config) => {
        const token = await this.getAuthToken();
        console.log('🔍 [API Interceptor] Request URL:', config.url);
        console.log('🔍 [API Interceptor] Base URL:', this.api.defaults.baseURL);
        console.log('🔍 [API Interceptor] Token available:', !!token);
        console.log('🔍 [API Interceptor] Content-Type:', config.headers['Content-Type']);
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('🔑 [API Interceptor] Authorization header set');
        } else {
          console.log('⚠️ [API Interceptor] No token available for request');
        }
        
        // Don't override Content-Type for FormData requests
        if (config.data instanceof FormData) {
          console.log('📁 [API Interceptor] FormData detected, preserving multipart/form-data');
          delete config.headers['Content-Type']; // Let browser set the correct boundary
        }
        
        return config;
      },
      (error) => {
        console.error('❌ [API Interceptor] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log('✅ [API Interceptor] Response success:', response.status, response.config.url);
        return response;
      },
      async (error) => {
        console.log('❌ [API Interceptor] Response error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          code: error.code,
          url: error.config?.url
        });
        
        // Handle network errors
        if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED' || !error.response) {
          console.error('🌐 [API Interceptor] Network error detected');
          const networkError = new Error('Network error - please check your internet connection and try again');
          networkError.name = 'NetworkError';
          return Promise.reject(networkError);
        }
        
        if (error.response?.status === 401) {
          console.log('🔒 [API Interceptor] Unauthorized - attempting token refresh...');
          try {
            // Try to refresh the token
            const refreshResponse = await this.refreshToken();
            if (refreshResponse.data.access_token) {
              console.log('✅ [API Interceptor] Token refreshed successfully');
              // Retry the original request with new token
              const originalRequest = error.config;
              originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.access_token}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            console.log('❌ [API Interceptor] Token refresh failed, clearing auth data');
            await this.clearAuthToken();
          }
        } else if (error.response?.status === 403) {
          console.log('🚫 [API Interceptor] Forbidden - user may not have permission or token is invalid');
          // For 403 errors, we should also clear the token as it might be invalid
          await this.clearAuthToken();
        }
        return Promise.reject(error);
      }
    );
  }

  private async getAuthToken(): Promise<string | null> {
    return await storageService.getAuthToken();
  }

  private async clearAuthToken(): Promise<void> {
    await storageService.clearAuthData();
  }

  /**
   * Check if user is authenticated by verifying token exists
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAuthToken();
    return !!token;
  }

  /**
   * Validate current authentication status
   */
  async validateAuth(): Promise<boolean> {
    try {
      const token = await this.getAuthToken();
      return !!token;
    } catch (error: any) {
      console.log('🔒 [API] Authentication validation failed:', error);
      return false;
    }
  }

  // ===== AUTHENTICATION ENDPOINTS =====

  async testConnection(): Promise<AxiosResponse<{ message: string }>> {
    try {
      const response = await this.api.get('/health');
      return response;
    } catch (error) {
      console.error('API Connection Test Failed:', error);
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<AxiosResponse<AuthResponse>> {
    const response = await this.api.post('/auth/register', userData);
    
    // Store tokens if registration is successful
    if (response.data.access_token) {
      await storageService.setAuthToken(response.data.access_token);
      if (response.data.refresh_token) {
        await storageService.setRefreshToken(response.data.refresh_token);
      }
      if (response.data.user) {
        await storageService.setUserData(response.data.user);
      }
    }
    
    return response;
  }

  async login(credentials: LoginRequest): Promise<AxiosResponse<AuthResponse>> {
    const response = await this.api.post('/auth/login', credentials);
    
    // Store tokens if login is successful
    if (response.data.access_token) {
      await storageService.setAuthToken(response.data.access_token);
      if (response.data.refresh_token) {
        await storageService.setRefreshToken(response.data.refresh_token);
      }
      if (response.data.user) {
        await storageService.setUserData(response.data.user);
      }
    }
    
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } catch (error) {
      console.log('Logout API call failed, but clearing local data anyway');
    } finally {
      await storageService.clearAuthData();
    }
  }

  async getRoles(): Promise<AxiosResponse<Role[]>> {
    return this.api.get('/auth/roles');
  }

  async forgotPassword(email: string): Promise<AxiosResponse<{ message: string }>> {
    return this.api.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<AxiosResponse<{ message: string }>> {
    return this.api.post('/auth/reset-password', { token, new_password: newPassword });
  }

  async oauthLogin(provider: string): Promise<AxiosResponse<{ auth_url: string }>> {
    return this.api.get(`/auth/oauth/${provider}/login`);
  }

  async oauthCallback(provider: string, code: string): Promise<AxiosResponse<AuthResponse>> {
    const response = await this.api.post(`/auth/oauth/${provider}/callback`, { code });
    
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
    
    return response;
  }

  async refreshToken(): Promise<AxiosResponse<{ access_token: string; token_type: string }>> {
    const refreshToken = await storageService.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await this.api.post('/auth/refresh', { refresh_token: refreshToken });
    
    // Update stored tokens
    if (response.data.access_token) {
      await storageService.setAuthToken(response.data.access_token);
    }
    
    return response;
  }



  // ===== USER PROFILE ENDPOINTS =====

  async getUserProfile(): Promise<AxiosResponse<User>> {
    return this.api.get('/users/profile');
  }

  async updateUserProfile(profileData: Partial<User>): Promise<AxiosResponse<User>> {
    return this.api.put('/users/profile', profileData);
  }

  async uploadAvatar(imageData: FormData): Promise<AxiosResponse<{ avatar_url: string }>> {
    return this.api.post('/users/upload-avatar', imageData);
  }

  async deleteAvatar(): Promise<AxiosResponse<void>> {
    return this.api.delete('/users/avatar');
  }

  // ===== SERVICE ENDPOINTS =====

  async getServices(): Promise<AxiosResponse<Service[]>> {
    return this.api.get('/services');
  }

  async getServiceById(id: string): Promise<AxiosResponse<Service>> {
    return this.api.get(`/services/${id}`);
  }

  async createService(serviceData: Partial<Service>): Promise<AxiosResponse<Service>> {
    return this.api.post('/services', serviceData);
  }

  async updateService(id: string, serviceData: Partial<Service>): Promise<AxiosResponse<Service>> {
    return this.api.put(`/services/${id}`, serviceData);
  }

  async deleteService(id: string): Promise<AxiosResponse<void>> {
    return this.api.delete(`/services/${id}`);
  }

  // ===== BOOKING ENDPOINTS =====

  async getBookings(): Promise<AxiosResponse<Booking[]>> {
    return this.api.get('/bookings');
  }

  async createBooking(bookingData: Partial<Booking>): Promise<AxiosResponse<Booking>> {
    return this.api.post('/bookings', bookingData);
  }

  async updateBooking(id: string, bookingData: Partial<Booking>): Promise<AxiosResponse<Booking>> {
    return this.api.put(`/bookings/${id}`, bookingData);
  }
}

export const apiService = new ApiService();
export default apiService; 