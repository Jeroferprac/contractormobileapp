import apiService, { PRICE_LISTS_API } from './api';
import { mockPriceLists } from '../data/mockData';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PriceList {
  id: string;
  name: string;
  description: string;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  total_items: number;
  total_value: number;
  category: string;
  icon: string;
  color: string;
}

export interface CreatePriceListRequest {
  name: string;
  description: string;
  currency: string;
  category: string;
  is_active?: boolean;
}

export interface UpdatePriceListRequest {
  name?: string;
  description?: string;
  currency?: string;
  category?: string;
  is_active?: boolean;
}

export interface PriceListItem {
  id: string;
  product_id: string;
  price_list_id: string;
  price: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface AddPriceListItemRequest {
  product_id: string;
  price: number;
  currency: string;
}

class PriceListsApiService {
  private cacheKey = 'price_lists_cache';
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes
  private useMockData = false; // Backend is ready - use real API

  // Cache helper methods
  private async getCachedData(): Promise<PriceList[] | null> {
    try {
      const cached = await AsyncStorage.getItem(this.cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();
        if (now - timestamp < this.cacheExpiry) {
          return data;
        }
      }
    } catch (error) {
      console.error('❌ [PriceListsAPI] Cache read error:', error);
    }
    return null;
  }

  private async setCachedData(data: PriceList[]): Promise<void> {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('❌ [PriceListsAPI] Cache write error:', error);
    }
  }

  private async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.cacheKey);
    } catch (error) {
      console.error('❌ [PriceListsAPI] Cache clear error:', error);
    }
  }

  // Get all price lists with caching and real-time updates
  async getPriceLists(forceRefresh = false): Promise<PriceList[]> {
    try {
      console.log('🔄 [PriceListsAPI] Fetching price lists...');
      
      // If using mock data, return mock data directly
      if (this.useMockData) {
        console.log('📦 [PriceListsAPI] Using mock data (API disabled)');
        await this.setCachedData(mockPriceLists);
        return mockPriceLists;
      }
      
      // Check cache first if not forcing refresh
      if (!forceRefresh) {
        const cachedData = await this.getCachedData();
        if (cachedData) {
          console.log('✅ [PriceListsAPI] Using cached data');
          return cachedData;
        }
      }

      // Fetch from API
      console.log('📡 [PriceListsAPI] Making API request to:', PRICE_LISTS_API.GET_PRICE_LISTS);
      const response = await apiService.get(PRICE_LISTS_API.GET_PRICE_LISTS);
      const data = response.data || [];
      
      // Cache the data
      await this.setCachedData(data);
      
      console.log('✅ [PriceListsAPI] Successfully fetched', data.length, 'price lists');
      return data;
    } catch (error: any) {
      console.error('❌ [PriceListsAPI] API error:', error.message || error);
      console.error('❌ [PriceListsAPI] Error details:', {
        code: error.code,
        status: error.response?.status,
        url: error.config?.url
      });
      
      // Try to return cached data if available
      const cachedData = await this.getCachedData();
      if (cachedData) {
        console.log('📦 [PriceListsAPI] Using cached data as fallback');
        return cachedData;
      }
      
      // Use mock data as last resort
      console.log('📦 [PriceListsAPI] Using mock data as fallback');
      await this.setCachedData(mockPriceLists);
      return mockPriceLists;
    }
  }

  // Get price list by ID with caching
  async getPriceList(id: string): Promise<PriceList> {
    try {
      console.log('🔄 [PriceListsAPI] Fetching price list:', id);
      const response = await apiService.get(PRICE_LISTS_API.GET_PRICE_LIST(id));
      console.log('✅ [PriceListsAPI] Successfully fetched price list:', id);
      return response.data;
    } catch (error: any) {
      console.error('❌ [PriceListsAPI] Error fetching price list:', id, error.message);
      
      // Try to find in cached data
      const cachedData = await this.getCachedData();
      if (cachedData) {
        const cachedItem = cachedData.find(item => item.id === id);
        if (cachedItem) {
          console.log('📦 [PriceListsAPI] Using cached price list:', id);
          return cachedItem;
        }
      }
      
      // Use mock data as fallback
      console.log('📦 [PriceListsAPI] Using mock price list:', id);
      const mockPriceList = mockPriceLists.find(item => item.id === id);
      if (mockPriceList) {
        return mockPriceList;
      }
      throw new Error('Price list not found');
    }
  }

  // Create new price list
  async createPriceList(data: CreatePriceListRequest): Promise<PriceList> {
    try {
      console.log('🔄 [PriceListsAPI] Creating price list:', data.name);
      const response = await apiService.post(PRICE_LISTS_API.CREATE_PRICE_LIST, data);
      
      // Clear cache to force refresh on next fetch
      await this.clearCache();
      
      console.log('✅ [PriceListsAPI] Successfully created price list:', response.data.id);
      return response.data;
    } catch (error: any) {
      console.error('❌ [PriceListsAPI] Error creating price list:', error.message);
      
      // Use mock response for any network or API errors
      const newPriceList: PriceList = {
        id: Date.now().toString(),
        ...data,
        is_active: data.is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        total_items: 0,
        total_value: 0,
        icon: 'tag',
        color: '#3B82F6',
      };
      
      // Clear cache even for mock response to ensure consistency
      await this.clearCache();
      
      return newPriceList;
    }
  }

  // Update price list
  async updatePriceList(id: string, data: UpdatePriceListRequest): Promise<PriceList> {
    try {
      console.log('🔄 [PriceListsAPI] Updating price list:', id);
      const response = await apiService.put(PRICE_LISTS_API.UPDATE_PRICE_LIST(id), data);
      
      // Clear cache to force refresh on next fetch
      await this.clearCache();
      
      console.log('✅ [PriceListsAPI] Successfully updated price list:', id);
      return response.data;
    } catch (error: any) {
      console.error('❌ [PriceListsAPI] Error updating price list:', id, error.message);
      
      // Use mock response for any network or API errors
      const mockPriceList = mockPriceLists.find(item => item.id === id);
      if (mockPriceList) {
        const updatedPriceList = {
          ...mockPriceList,
          ...data,
          updated_at: new Date().toISOString(),
        };
        
        // Clear cache even for mock response to ensure consistency
        await this.clearCache();
        
        return updatedPriceList;
      }
      throw new Error('Price list not found');
    }
  }

  // Get price list products
  async getPriceListProducts(id: string): Promise<PriceListItem[]> {
    try {
      console.log('🔄 [PriceListsAPI] Fetching price list products:', id);
      const response = await apiService.get(PRICE_LISTS_API.GET_PRICE_LIST_PRODUCTS(id));
      console.log('✅ [PriceListsAPI] Successfully fetched price list products:', id);
      return response.data || [];
    } catch (error: any) {
      console.error('❌ [PriceListsAPI] Error fetching price list products:', id, error.message);
      // Use mock response for any network or API errors
      return [];
    }
  }

  // Add product to price list
  async addPriceListItem(id: string, data: AddPriceListItemRequest): Promise<PriceListItem> {
    try {
      console.log('🔄 [PriceListsAPI] Adding product to price list:', id);
      const response = await apiService.post(PRICE_LISTS_API.ADD_PRICE_LIST_ITEM(id), data);
      
      // Clear cache to force refresh on next fetch
      await this.clearCache();
      
      console.log('✅ [PriceListsAPI] Successfully added product to price list:', id);
      return response.data;
    } catch (error: any) {
      console.error('❌ [PriceListsAPI] Error adding product to price list:', id, error.message);
      
      // Use mock response for any network or API errors
      const newItem: PriceListItem = {
        id: Date.now().toString(),
        ...data,
        price_list_id: id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Clear cache even for mock response to ensure consistency
      await this.clearCache();
      
      return newItem;
    }
  }

  // Force refresh data from API
  async refreshPriceLists(): Promise<PriceList[]> {
    console.log('🔄 [PriceListsAPI] Force refreshing price lists...');
    return this.getPriceLists(true);
  }

  // Check if API is available
  async checkApiHealth(): Promise<boolean> {
    try {
      console.log('🔍 [PriceListsAPI] Checking API health...');
      const response = await apiService.get(PRICE_LISTS_API.GET_PRICE_LISTS);
      console.log('✅ [PriceListsAPI] API is healthy');
      return true;
    } catch (error: any) {
      console.log('❌ [PriceListsAPI] API health check failed:', error.message || error);
      return false;
    }
  }
}

export const priceListsApiService = new PriceListsApiService();
export default priceListsApiService;
