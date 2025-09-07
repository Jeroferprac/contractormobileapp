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
import { Notification } from '../context/NotificationContext';
import { getBaseURL } from '../utils/network';
import { API_CONFIG } from '../config/env';
import storageService from '../utils/storage';

class ApiService {
  private api: AxiosInstance;
  private useMock: boolean = false; 

  constructor() {
    this.api = axios.create({
      baseURL: getBaseURL(),
      timeout: API_CONFIG.TIMEOUT || 30000, // 30 seconds default
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
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor removed - let components handle success/failure directly
  }



  private async getAuthToken(): Promise<string | null> {
    return await storageService.getAuthToken();
  }

  private async clearAuthToken(): Promise<void> {
    await storageService.clearAuthData();
  }

  // ===== AUTHENTICATION ENDPOINTS =====

  async testConnection(): Promise<AxiosResponse<User>> {
    try {
      const response = await this.api.get('/auth/me');
      return response;
    } catch (error) {
      console.error('API Connection Test Failed:', error);
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<AxiosResponse<AuthResponse>> {
    const response = await this.api.post('/auth/register', userData);
    
    // DO NOT store tokens immediately - let the SuccessModal handle authentication
    // This prevents the race condition where checkAuthStatus runs before SuccessModal shows
    
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

  async logout(): Promise<AxiosResponse<any>> {
    try {
      // Get the current session token
      const sessionToken = await this.getAuthToken();
      
      if (!sessionToken) {
        console.log('No session token found, skipping logout API call');
        return { data: 'No session token', status: 200 } as AxiosResponse;
      }
      
      // Call logout API with session_token as query parameter
      const response = await this.api.post(`/auth/logout?session_token=${sessionToken}`);
      
      // Clear auth data after successful logout
      await this.clearAuthToken();
      
      return response;
    } catch (error) {
      console.error('Logout API error:', error);
      // Even if API call fails, clear local auth data
      await this.clearAuthToken();
      throw error;
    }
  }

  async getCurrentUser(): Promise<AxiosResponse<User>> {
    return this.api.get('/auth/me');
  }

  async getRoles(): Promise<AxiosResponse<Role[]>> {
    return this.api.get('/auth/roles');
  }

  async oauthLogin(provider: string): Promise<AxiosResponse<{ url: string }>> {
    return this.api.get(`/auth/oauth/${provider}`);
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

  // ===== USER ENDPOINTS =====

  async updateUserProfile(profileData: Partial<User>): Promise<AxiosResponse<User>> {
    return this.api.put('/auth/me', profileData);
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

  // ===== NOTIFICATION ENDPOINTS =====

  async getNotifications(includeRead: boolean = false): Promise<AxiosResponse<Notification[]>> {
    return this.api.get(`/notifications/?include_read=${includeRead}`);
  }

  async markNotificationAsRead(notificationId: string, isRead: boolean = true): Promise<AxiosResponse<Notification>> {
    return this.api.put(`/notifications/${notificationId}`, { is_read: isRead });
  }
}

export const apiService = new ApiService();
export default apiService; 