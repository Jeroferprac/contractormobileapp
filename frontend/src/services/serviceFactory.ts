import { shouldUseMockServices } from '../config/services';
import companyService from './companyService';
import mockCompanyService from './mockCompanyService';

// Service Factory
// This factory automatically provides the appropriate service implementation
// based on the configuration (real API vs mock)

export class ServiceFactory {
  private static instance: ServiceFactory;
  
  private constructor() {}
  
  public static getInstance(): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory();
    }
    return ServiceFactory.instance;
  }

  // Get the appropriate company service
  getCompanyService() {
    if (shouldUseMockServices()) {
      console.log('🔧 [ServiceFactory] Using Mock Company Service');
      return mockCompanyService;
    } else {
      console.log('🌐 [ServiceFactory] Using Real Company Service');
      return companyService;
    }
  }

  // Get service info for debugging
  getServiceInfo() {
    return {
      useMockServices: shouldUseMockServices(),
      companyService: shouldUseMockServices() ? 'Mock' : 'Real',
      timestamp: new Date().toISOString(),
    };
  }

  // Switch between services dynamically (useful for testing)
  switchToMockServices() {
    console.log('🔄 [ServiceFactory] Switching to Mock Services');
    // This would require updating the config dynamically
    // For now, you need to manually change the config file
  }

  switchToRealServices() {
    console.log('🔄 [ServiceFactory] Switching to Real Services');
    // This would require updating the config dynamically
    // For now, you need to manually change the config file
  }
}

// Export singleton instance
export const serviceFactory = ServiceFactory.getInstance();

// Convenience exports
export const getCompanyService = () => serviceFactory.getCompanyService();
export const getServiceInfo = () => serviceFactory.getServiceInfo();
