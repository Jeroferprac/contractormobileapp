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
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        console.error('🌐 [ApiService] Request failed:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          message: error.message,
          code: error.code
        });
        
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
      const response = await this.api.post('/auth/logout');
      return response;
    } catch (error) {
      // Handle logout error silently
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

  // ===== PROFILE & COMPANY ENDPOINTS =====

  async getCompanyProfile(): Promise<AxiosResponse<any>> {
    return this.api.get('/company/profile');
  }

  async updateCompanyProfile(companyData: any): Promise<AxiosResponse<any>> {
    return this.api.put('/company/profile', companyData);
  }

  async getCompanyProjects(): Promise<AxiosResponse<any[]>> {
    return this.api.get('/company/projects');
  }

  async createCompanyProject(projectData: any): Promise<AxiosResponse<any>> {
    return this.api.post('/company/projects', projectData);
  }

  async updateCompanyProject(projectId: string, projectData: any): Promise<AxiosResponse<any>> {
    return this.api.put(`/company/projects/${projectId}`, projectData);
  }

  async deleteCompanyProject(projectId: string): Promise<AxiosResponse<void>> {
    return this.api.delete(`/company/projects/${projectId}`);
  }

  async getCompanyReviews(): Promise<AxiosResponse<any[]>> {
    return this.api.get('/company/reviews');
  }

  async replyToReview(reviewId: string, replyData: any): Promise<AxiosResponse<any>> {
    return this.api.post(`/company/reviews/${reviewId}/reply`, replyData);
  }

  async getCompanyCredentials(): Promise<AxiosResponse<any[]>> {
    return this.api.get('/company/credentials');
  }

  async addCompanyCredential(credentialData: any): Promise<AxiosResponse<any>> {
    return this.api.post('/company/credentials', credentialData);
  }

  async updateCompanyCredential(credentialId: string, credentialData: any): Promise<AxiosResponse<any>> {
    return this.api.put(`/company/credentials/${credentialId}`, credentialData);
  }

  async deleteCompanyCredential(credentialId: string): Promise<AxiosResponse<void>> {
    return this.api.delete(`/company/credentials/${credentialId}`);
  }

  async getCompanyStats(): Promise<AxiosResponse<any>> {
    return this.api.get('/company/stats');
  }

  async getCompanyAwards(): Promise<AxiosResponse<any[]>> {
    return this.api.get('/company/awards');
  }

  async addCompanyAward(awardData: any): Promise<AxiosResponse<any>> {
    return this.api.post('/company/awards', awardData);
  }

  async updateCompanyAward(awardId: string, awardData: any): Promise<AxiosResponse<any>> {
    return this.api.put(`/company/awards/${awardId}`, awardData);
  }

  async deleteCompanyAward(awardId: string): Promise<AxiosResponse<void>> {
    return this.api.delete(`/company/awards/${awardId}`);
  }

  // ===== GENERIC HTTP METHODS =====

  async get<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return this.api.get(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.api.post(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.api.put(url, data, config);
  }

  async delete<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return this.api.delete(url, config);
  }

  async patch<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.api.patch(url, data, config);
  }
}

export const apiService = new ApiService();
export default apiService; 

// Price Lists API endpoints
export const PRICE_LISTS_API = {
  // Create Price List
  CREATE_PRICE_LIST: '/price-lists/',
  
  // List Price Lists
  GET_PRICE_LISTS: '/price-lists/',
  
  // Get Price List by ID
  GET_PRICE_LIST: (id: string) => `/price-lists/${id}`,
  
  // Update Price List
  UPDATE_PRICE_LIST: (id: string) => `/price-lists/${id}`,
  
  // Get Price List Items
  GET_PRICE_LIST_PRODUCTS: (id: string) => `/price-lists/${id}/products`,
  
  // Add Price List Item
  ADD_PRICE_LIST_ITEM: (id: string) => `/price-lists/${id}/products`,
}; 