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
  private useMock: boolean = false; // Using real API - no mock data

  constructor() {
    this.api = axios.create({
      baseURL: getBaseURL(),
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
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('🔑 Token added to request:', config.url);
        } else {
          console.log('⚠️ No token found for request:', config.url);
        }
        console.log('API Request:', config.method?.toUpperCase(), config.url);
        return config;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log('API Response:', response.status, response.config.url);
        return response;
      },
      async (error) => {
        console.error('API Response Error:', error.response?.status, error.response?.data);
        if (error.response?.status === 401) {
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

  // ===== AUTHENTICATION ENDPOINTS =====

  async testConnection(): Promise<AxiosResponse<User>> {
    try {
      const response = await this.api.get('/auth/me');
      console.log('API Connection Test:', response.data);
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

  async logout(): Promise<AxiosResponse<any>> {
    try {
      // Debug: Check if token exists before logout
      const token = await this.getAuthToken();
      console.log('🔍 Token before logout:', token ? 'Token exists' : 'No token');
      
      const response = await this.api.post('/auth/logout');
      console.log('✅ Logout API call successful');
      return response;
    } catch (error) {
      console.error('❌ Logout API call failed:', error);
      // Don't re-throw the error, just return a mock response
      // This allows local logout to succeed even if API fails
      return { 
        data: {}, 
        status: 200, 
        statusText: 'OK',
        headers: {},
        config: {} as any
      } as AxiosResponse<any>;
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
}

export const apiService = new ApiService();
export default apiService; 