// Mock API service for testing without backend
export const mockApiService = {
  // Simulate API delay
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  // Mock login
  async login(email: string, password: string) {
    await this.delay(1500); // Simulate network delay
    
    // Mock validation
    if (email === 'test@example.com' && password === 'password') {
      return {
        data: {
          success: true,
          user: {
            id: '1',
            firstName: 'John',
            email: 'test@example.com',
            phone: '+1234567890',
          },
          token: 'mock-jwt-token-12345',
          message: 'Login successful',
        },
      };
    } else {
      throw new Error('Invalid email or password');
    }
  },

  // Mock signup
  async signup(userData: { firstName: string; email: string; password: string; phone?: string }) {
    await this.delay(2000); // Simulate network delay
    
    // Mock validation
    if (userData.email === 'existing@example.com') {
      throw new Error('Email already exists');
    }
    
    return {
      data: {
        success: true,
        user: {
          id: '2',
          firstName: userData.firstName,
          email: userData.email,
          phone: userData.phone,
        },
        token: 'mock-jwt-token-signup-67890',
        message: 'Account created successfully',
      },
    };
  },

  // Mock health check
  async testConnection() {
    await this.delay(500);
    return {
      data: {
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
      },
    };
  },

  // Mock services
  async getServices() {
    await this.delay(1000);
    return {
      data: {
        success: true,
        services: [
          {
            id: '1',
            name: 'Plumbing',
            description: 'Professional plumbing services',
            price: '$50-150',
            icon: '🔧',
          },
          {
            id: '2',
            name: 'Electrical',
            description: 'Expert electrical work',
            price: '$75-200',
            icon: '⚡',
          },
          {
            id: '3',
            name: 'HVAC',
            description: 'Heating and cooling services',
            price: '$100-300',
            icon: '❄️',
          },
        ],
      },
    };
  },

  // Mock bookings
  async getBookings() {
    await this.delay(800);
    return {
      data: {
        success: true,
        bookings: [
          {
            id: '1',
            service: 'Plumbing Repair',
            status: 'Completed',
            date: '2024-01-15',
            time: '10:00 AM',
            price: '$120',
          },
          {
            id: '2',
            service: 'Electrical Installation',
            status: 'Scheduled',
            date: '2024-01-20',
            time: '2:00 PM',
            price: '$180',
          },
        ],
      },
    };
  },
}; 