import AsyncStorage from '@react-native-async-storage/async-storage';

const SEARCH_HISTORY_KEY = 'warehouse_search_history';
const MAX_HISTORY_ITEMS = 10;

export interface SearchHistoryItem {
  query: string;
  timestamp: string;
  type: 'warehouse' | 'product' | 'supplier';
}

class SearchHistoryService {
  private searchHistory: SearchHistoryItem[] = [];

  async initialize(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) {
        this.searchHistory = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
      this.searchHistory = [];
    }
  }

  async addSearch(query: string, type: 'warehouse' | 'product' | 'supplier' = 'warehouse'): Promise<void> {
    if (!query.trim()) return;

    const trimmedQuery = query.trim();
    
    // Remove existing entry if it exists
    this.searchHistory = this.searchHistory.filter(item => item.query !== trimmedQuery);
    
    // Add new entry at the beginning
    const newItem: SearchHistoryItem = {
      query: trimmedQuery,
      timestamp: new Date().toISOString(),
      type,
    };
    
    this.searchHistory.unshift(newItem);
    
    // Keep only the most recent items
    this.searchHistory = this.searchHistory.slice(0, MAX_HISTORY_ITEMS);
    
    // Save to storage
    try {
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(this.searchHistory));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  }

  getRecentSearches(type?: 'warehouse' | 'product' | 'supplier'): string[] {
    const filtered = type 
      ? this.searchHistory.filter(item => item.type === type)
      : this.searchHistory;
    
    return filtered.map(item => item.query);
  }

  async clearHistory(): Promise<void> {
    this.searchHistory = [];
    try {
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  }

  async removeSearch(query: string): Promise<void> {
    this.searchHistory = this.searchHistory.filter(item => item.query !== query);
    try {
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(this.searchHistory));
    } catch (error) {
      console.error('Failed to remove search from history:', error);
    }
  }

  getSearchHistory(): SearchHistoryItem[] {
    return [...this.searchHistory];
  }
}

export const searchHistoryService = new SearchHistoryService();
export default searchHistoryService;
