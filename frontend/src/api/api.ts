import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Platform } from 'react-native';
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

// Dynamic IP configuration based on platform
const getBaseURL = (): string => {
  const localIP = '192.168.31.45'; // Your backend IP address
  const port = '8000'; // Your backend port
  
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${port}/api/v1/`;
  } else if (Platform.OS === 'ios') {
    return `http://localhost:${port}/api/v1/`;
  } else {
    return `http://${localIP}:${port}/api/v1/`;
  }
};

class ApiService {
  private api: AxiosInstance;
  private useMock: boolean = true; // Using mock data for development

  constructor() {
    this.api = axios.create({
      baseURL: getBaseURL(),
      timeout: 15000,
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
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
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
      (error) => {
        console.error('API Response Error:', error?.response?.status || 'No status', error?.response?.data || error?.message || 'Unknown error');
        if (error?.response?.status === 401) {
          this.clearAuthToken();
        }
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    // TODO: Implement token storage with AsyncStorage
    return null;
  }

  private clearAuthToken(): void {
    // TODO: Implement token clearing
  }

  // ===== AUTHENTICATION ENDPOINTS =====

  async testConnection(): Promise<AxiosResponse<User>> {
    if (this.useMock) {
      // Return mock data
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
      return {
        data: {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          role: 'user',
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      } as AxiosResponse<User>;
    }
    
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
    return this.api.post('/auth/register', userData);
  }

  async login(credentials: LoginRequest): Promise<AxiosResponse<AuthResponse>> {
    if (this.useMock) {
      // Return mock data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      return {
        data: {
          access_token: 'mock-jwt-token-12345',
          token_type: 'bearer',
          user: {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            email: credentials.email,
            phone: '+1234567890',
            role: 'user',
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      } as AxiosResponse<AuthResponse>;
    }
    
    return this.api.post('/auth/login', credentials);
  }

  async logout(): Promise<AxiosResponse<void>> {
    return this.api.post('/auth/logout');
  }

  async getCurrentUser(): Promise<AxiosResponse<User>> {
    if (this.useMock) {
      // Return mock data
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
      return {
        data: {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          role: 'user',
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      } as AxiosResponse<User>;
    }
    
    return this.api.get('/auth/me');
  }

  async getRoles(): Promise<AxiosResponse<Role[]>> {
    return this.api.get('/auth/roles');
  }

  async oauthLogin(provider: string): Promise<AxiosResponse<{ url: string }>> {
    return this.api.get(`/auth/oauth/${provider}`);
  }

  async oauthCallback(provider: string, code: string): Promise<AxiosResponse<AuthResponse>> {
    return this.api.post(`/auth/oauth/${provider}/callback`, { code });
  }

  async refreshToken(): Promise<AxiosResponse<{ access_token: string; token_type: string }>> {
    return this.api.post('/auth/refresh');
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