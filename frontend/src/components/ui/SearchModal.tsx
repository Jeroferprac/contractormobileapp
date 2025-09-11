import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';
import searchHistoryService from '../../utils/searchHistory';

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  onResultSelect: (result: any) => void;
  onSearchSubmit: (searchText: string) => void;
  searchResults: any[];
  placeholder?: string;
  title?: string;
  category?: 'warehouse' | 'product' | 'supplier';
  popularSearches?: string[];
  showRecentSearches?: boolean;
  showPopularSearches?: boolean;
  // Card component to render for results
  CardComponent?: React.ComponentType<any>;
  // Function to render custom result item
  renderResultItem?: (item: any, index: number) => React.ReactNode;
}

const SearchModal: React.FC<SearchModalProps> = ({
  visible,
  onClose,
  onResultSelect,
  onSearchSubmit,
  searchResults,
  placeholder = "Search...",
  title = "Search",
  category = "warehouse",
  popularSearches = [],
  showRecentSearches = true,
  showPopularSearches = true,
  CardComponent,
  renderResultItem,
}) => {
  const [searchText, setSearchText] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (visible) {
      loadRecentSearches();
    }
  }, [visible, category]);

  useEffect(() => {
    if (searchText.length > 0) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [searchText, searchResults]);

  const loadRecentSearches = async () => {
    try {
      await searchHistoryService.initialize();
      const searches = searchHistoryService.getRecentSearches((category || 'warehouse') as 'warehouse' | 'product' | 'supplier');
      setRecentSearches(searches);
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  };

  const handleSearchSubmit = () => {
    if (searchText.trim()) {
      onSearchSubmit(searchText.trim());
      // Save to recent searches
      searchHistoryService.addSearch(searchText.trim(), (category || 'warehouse') as 'warehouse' | 'product' | 'supplier');
      onClose();
    }
  };

  const handleResultSelect = (result: any) => {
    onResultSelect(result);
    onClose();
  };

  const handleRecentSearchPress = (search: string) => {
    setSearchText(search);
    onSearchSubmit(search);
  };

  const handlePopularSearchPress = (search: string) => {
    setSearchText(search);
    onSearchSubmit(search);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        
        {/* Header - Figma Style */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="x" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Search Input - Figma Style */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Icon name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={placeholder}
              placeholderTextColor="#9CA3AF"
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Icon name="x" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Search Results */}
          {showResults && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {searchResults.length > 0 ? `${searchResults.length} result${searchResults.length > 1 ? 's' : ''} found` : 'No Results Found'}
              </Text>
              {searchResults.map((result, index) => {
                // Use custom render function if provided
                if (renderResultItem) {
                  return (
                    <TouchableOpacity
                      key={result.id || index}
                      onPress={() => handleResultSelect(result)}
                    >
                      {renderResultItem(result, index)}
                    </TouchableOpacity>
                  );
                }
                
                // Use CardComponent if provided
                if (CardComponent) {
                  return (
                    <TouchableOpacity
                      key={result.id || index}
                      onPress={() => handleResultSelect(result)}
                    >
                      <CardComponent {...result} />
                    </TouchableOpacity>
                  );
                }
                
                // Default fallback rendering
                return (
                  <TouchableOpacity
                    key={result.id || index}
                    style={styles.resultItem}
                    onPress={() => handleResultSelect(result)}
                  >
                    <View style={styles.resultContent}>
                      <Text style={styles.resultTitle}>{result.title || result.name}</Text>
                      {result.subtitle && (
                        <Text style={styles.resultSubtitle}>{result.subtitle}</Text>
                      )}
                      {result.description && (
                        <Text style={styles.resultDescription} numberOfLines={2}>
                          {result.description}
                        </Text>
                      )}
                      {result.type && (
                        <View style={styles.typeBadge}>
                          <Text style={styles.typeText}>{result.type}</Text>
                        </View>
                      )}
                    </View>
                    <Icon name="chevron-right" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Recent Searches - Exact Figma Design */}
          {!showResults && showRecentSearches && recentSearches.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Searches</Text>
              {recentSearches.map((search, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recentSearchItem}
                  onPress={() => handleRecentSearchPress(search)}
                >
                  <Icon name="clock" size={16} color="#9CA3AF" />
                  <Text style={styles.recentSearchText}>{search}</Text>
                  <Icon name="arrow-up-left" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Popular Searches */}
          {!showResults && showPopularSearches && popularSearches.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Popular Searches</Text>
              {popularSearches.map((search, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.popularSearchItem}
                  onPress={() => handlePopularSearchPress(search)}
                >
                  <Icon name="trending-up" size={16} color="#9CA3AF" />
                  <Text style={styles.popularSearchText}>{search}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Empty State */}
          {!showResults && searchText.length === 0 && recentSearches.length === 0 && popularSearches.length === 0 && (
            <View style={styles.emptyState}>
              <Icon name="search" size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateTitle}>Start searching</Text>
              <Text style={styles.emptyStateSubtitle}>
                Type in the search bar above to find what you're looking for
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: SPACING.xs,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: 16,
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    backgroundColor: '#F9FAFB',
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.xs,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  resultDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  typeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    marginBottom: SPACING.sm,
  },
  recentSearchText: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: 16,
    color: '#374151',
    fontWeight: '400',
  },
  popularSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    backgroundColor: '#F9FAFB',
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.xs,
  },
  popularSearchText: {
    marginLeft: SPACING.sm,
    fontSize: 14,
    color: '#374151',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SearchModal;
