// Service Configuration
// This file allows you to easily switch between real API services and mock services

export const SERVICE_CONFIG = {
  // Set to true to use mock services instead of real API calls
  USE_MOCK_SERVICES: true,
  
  // API endpoints configuration
  API_ENDPOINTS: {
    COMPANY_PROFILE: '/company/profile',
    COMPANY_PROJECTS: '/company/projects',
    COMPANY_REVIEWS: '/company/reviews',
    COMPANY_CREDENTIALS: '/company/credentials',
    COMPANY_AWARDS: '/company/awards',
    COMPANY_STATS: '/company/stats',
  },
  
  // Mock data configuration
  MOCK: {
    // Simulate network delays (in milliseconds)
    NETWORK_DELAY: {
      FAST: 200,
      NORMAL: 500,
      SLOW: 1000,
    },
    
    // Enable/disable specific mock features
    FEATURES: {
      SIMULATE_ERRORS: false,
      SIMULATE_NETWORK_ISSUES: false,
      RANDOM_DELAYS: false,
    },
  },
  
  // Real API configuration
  API: {
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
  },
};

// Helper function to check if mock services should be used
export const shouldUseMockServices = (): boolean => {
  return SERVICE_CONFIG.USE_MOCK_SERVICES;
};

// Helper function to get service delay
export const getServiceDelay = (type: 'fast' | 'normal' | 'slow' = 'normal'): number => {
  switch (type) {
    case 'fast':
      return SERVICE_CONFIG.MOCK.NETWORK_DELAY.FAST;
    case 'slow':
      return SERVICE_CONFIG.MOCK.NETWORK_DELAY.SLOW;
    default:
      return SERVICE_CONFIG.MOCK.NETWORK_DELAY.NORMAL;
  }
};

// Environment-based configuration
export const getEnvironmentConfig = () => {
  const isDevelopment = __DEV__;
  const isProduction = !isDevelopment;
  
  return {
    isDevelopment,
    isProduction,
    useMockServices: isDevelopment && SERVICE_CONFIG.USE_MOCK_SERVICES,
    apiTimeout: isProduction ? SERVICE_CONFIG.API.TIMEOUT : SERVICE_CONFIG.API.TIMEOUT * 2,
  };
};
