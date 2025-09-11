import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { Warehouse } from '../../types/inventory';
import searchHistoryService from '../../utils/searchHistory';

interface FilterOptions {
  status: 'all' | 'active' | 'inactive';
  location: string[];
  contactInfo: 'all' | 'has_contact' | 'complete';
  sortBy: 'name' | 'code' | 'created_at';
  sortOrder: 'asc' | 'desc';
  searchText: string;
}

interface WarehouseFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  onClear: () => void;
  warehouses: Warehouse[];
  currentFilters: FilterOptions;
}

const WarehouseFilterModal: React.FC<WarehouseFilterModalProps> = ({
  visible,
  onClose,
  onApply,
  onClear,
  warehouses,
  currentFilters,
}) => {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({
    search: true,
    status: false,
    location: false,
    contactInfo: false,
    sort: false,
    warehouseTypes: false,
  });

  // Recent searches state
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);

  useEffect(() => {
    setFilters(currentFilters);
    loadRecentSearches();
  }, [currentFilters]);

  const loadRecentSearches = async () => {
    try {
      await searchHistoryService.initialize();
      const searches = searchHistoryService.getRecentSearches('warehouse');
      setRecentSearches(searches);
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleStatusChange = (status: 'all' | 'active' | 'inactive') => {
    setFilters(prev => ({ ...prev, status }));
  };

  const handleLocationToggle = (location: string) => {
    setFilters(prev => ({
      ...prev,
      location: prev.location.includes(location)
        ? prev.location.filter(l => l !== location)
        : [...prev.location, location],
    }));
  };

  const handleContactInfoChange = (contactInfo: 'all' | 'has_contact' | 'complete') => {
    setFilters(prev => ({ ...prev, contactInfo }));
  };

  const handleSortChange = (sortBy: 'name' | 'code' | 'created_at', sortOrder: 'asc' | 'desc') => {
    setFilters(prev => ({ ...prev, sortBy, sortOrder }));
  };

  const handleSearchChange = (text: string) => {
    setFilters(prev => ({ ...prev, searchText: text }));
    setShowRecentSearches(text.length === 0 && recentSearches.length > 0);
  };

  const handleRecentSearchSelect = (search: string) => {
    setFilters(prev => ({ ...prev, searchText: search }));
    setShowRecentSearches(false);
  };

  const handleApply = async () => {
    if (filters.searchText.trim()) {
      try {
        await searchHistoryService.addSearch(filters.searchText, 'warehouse');
        await loadRecentSearches();
      } catch (error) {
        console.error('Failed to save search to history:', error);
      }
    }
    onApply(filters);
  };

  const handleClear = () => {
    const defaultFilters: FilterOptions = {
      status: 'all',
      location: [],
      contactInfo: 'all',
      sortBy: 'name',
      sortOrder: 'asc',
      searchText: '',
    };
    setFilters(defaultFilters);
    onClear();
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.location.length > 0) count++;
    if (filters.contactInfo !== 'all') count++;
    if (filters.sortBy !== 'name' || filters.sortOrder !== 'asc') count++;
    return count;
  };

  // Get unique locations from warehouses
  const uniqueLocations = Array.from(
    new Set(warehouses.map(w => w.address.split(',')[0].trim()))
  ).slice(0, 10);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header - Exactly like Figma */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Filter</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="x" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Search Section - Exactly like Figma Professional Category */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection('search')}
            >
              <Text style={styles.sectionTitle}>Professional Category</Text>
              <Icon
                name={expandedSections.search ? 'chevron-down' : 'chevron-right'}
                size={20}
                color="#374151"
              />
            </TouchableOpacity>
            
            {expandedSections.search && (
              <View style={styles.categoryContent}>
                <View style={styles.searchContainer}>
                  <Icon name="search" size={20} color="#9CA3AF" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search category"
                    placeholderTextColor="#9CA3AF"
                    value={filters.searchText}
                    onChangeText={handleSearchChange}
                  />
                </View>
                
                {/* Recent Searches */}
                {showRecentSearches && recentSearches.length > 0 && (
                  <View style={styles.recentSearchesContainer}>
                    <View style={styles.recentSearchesHeader}>
                      <Text style={styles.recentSearchesTitle}>Recent Searches</Text>
                      <TouchableOpacity
                        onPress={async () => {
                          try {
                            await searchHistoryService.clearHistory();
                            setRecentSearches([]);
                          } catch (error) {
                            console.error('Failed to clear search history:', error);
                          }
                        }}
                      >
                        <Text style={styles.clearHistoryText}>Clear</Text>
                      </TouchableOpacity>
                    </View>
                    {recentSearches.map((search, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.recentSearchItem}
                        onPress={() => handleRecentSearchSelect(search)}
                      >
                        <Icon name="clock" size={16} color="#9CA3AF" />
                        <Text style={styles.recentSearchText}>{search}</Text>
                        <TouchableOpacity
                          onPress={async (e) => {
                            e.stopPropagation();
                            try {
                              await searchHistoryService.removeSearch(search);
                              await loadRecentSearches();
                            } catch (error) {
                              console.error('Failed to remove search from history:', error);
                            }
                          }}
                        >
                          <Icon name="x" size={16} color="#9CA3AF" />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                
                {/* Warehouse Search Categories - Based on real data */}
                <View style={styles.tagsContainer}>
                  {['Name', 'Code', 'Address', 'Contact Person', 'Phone', 'Email'].map((field, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.tag,
                        filters.location.includes(field) && styles.tagSelected,
                      ]}
                      onPress={() => handleLocationToggle(field)}
                    >
                      <Icon 
                        name={field === 'Name' ? 'home' : field === 'Code' ? 'hash' : field === 'Address' ? 'map-pin' : field === 'Contact Person' ? 'user' : field === 'Phone' ? 'phone' : 'mail'} 
                        size={16} 
                        color={filters.location.includes(field) ? '#FFFFFF' : '#6B7280'} 
                        style={styles.tagIcon}
                      />
                      <Text
                        style={[
                          styles.tagText,
                          filters.location.includes(field) && styles.tagTextSelected,
                        ]}
                      >
                        {field}
                      </Text>
                      {filters.location.includes(field) && (
                        <Icon name="check" size={16} color="#FFFFFF" style={styles.tagCheckIcon} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Micro Services Section - Empty like Figma */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection('microServices')}
            >
              <Text style={styles.sectionTitle}>Micro Services</Text>
              <Icon
                name={expandedSections.microServices ? 'chevron-down' : 'chevron-right'}
                size={20}
                color="#374151"
              />
            </TouchableOpacity>
          </View>

          {/* Style Section - Empty like Figma */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection('style')}
            >
              <Text style={styles.sectionTitle}>Style</Text>
              <Icon
                name={expandedSections.style ? 'chevron-down' : 'chevron-right'}
                size={20}
                color="#374151"
              />
            </TouchableOpacity>
          </View>

          {/* Warehouse Status Section - Based on real data */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection('status')}
            >
              <Text style={styles.sectionTitle}>Warehouse Status</Text>
              <Icon
                name={expandedSections.status ? 'chevron-down' : 'chevron-right'}
                size={20}
                color="#374151"
              />
            </TouchableOpacity>
            
            {expandedSections.status && (
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => handleStatusChange('all')}
                >
                  <View style={styles.radioButton}>
                    {filters.status === 'all' && <View style={styles.radioSelected} />}
                  </View>
                  <Text style={styles.radioText}>All Warehouses</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => handleStatusChange('active')}
                >
                  <View style={styles.radioButton}>
                    {filters.status === 'active' && <View style={styles.radioSelected} />}
                  </View>
                  <Text style={styles.radioText}>Active Warehouses</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => handleStatusChange('inactive')}
                >
                  <View style={styles.radioButton}>
                    {filters.status === 'inactive' && <View style={styles.radioSelected} />}
                  </View>
                  <Text style={styles.radioText}>Inactive Warehouses</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Contact Information Section - Based on real data */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection('contactInfo')}
            >
              <Text style={styles.sectionTitle}>Contact Information</Text>
              <Icon
                name={expandedSections.contactInfo ? 'chevron-down' : 'chevron-right'}
                size={20}
                color="#374151"
              />
            </TouchableOpacity>
            
            {expandedSections.contactInfo && (
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => handleContactInfoChange('all')}
                >
                  <View style={styles.radioButton}>
                    {filters.contactInfo === 'all' && <View style={styles.radioSelected} />}
                  </View>
                  <Text style={styles.radioText}>All Warehouses</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => handleContactInfoChange('has_contact')}
                >
                  <View style={styles.radioButton}>
                    {filters.contactInfo === 'has_contact' && <View style={styles.radioSelected} />}
                  </View>
                  <Text style={styles.radioText}>Has Contact Info</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => handleContactInfoChange('complete')}
                >
                  <View style={styles.radioButton}>
                    {filters.contactInfo === 'complete' && <View style={styles.radioSelected} />}
                  </View>
                  <Text style={styles.radioText}>Complete Contact Info</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Sort By Section - Based on real data */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection('sort')}
            >
              <Text style={styles.sectionTitle}>Sort By</Text>
              <Icon
                name={expandedSections.sort ? 'chevron-down' : 'chevron-right'}
                size={20}
                color="#374151"
              />
            </TouchableOpacity>
            
            {expandedSections.sort && (
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => handleSortChange('name', 'asc')}
                >
                  <View style={styles.radioButton}>
                    {filters.sortBy === 'name' && filters.sortOrder === 'asc' && <View style={styles.radioSelected} />}
                  </View>
                  <Text style={styles.radioText}>Name (A-Z)</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => handleSortChange('name', 'desc')}
                >
                  <View style={styles.radioButton}>
                    {filters.sortBy === 'name' && filters.sortOrder === 'desc' && <View style={styles.radioSelected} />}
                  </View>
                  <Text style={styles.radioText}>Name (Z-A)</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => handleSortChange('code', 'asc')}
                >
                  <View style={styles.radioButton}>
                    {filters.sortBy === 'code' && filters.sortOrder === 'asc' && <View style={styles.radioSelected} />}
                  </View>
                  <Text style={styles.radioText}>Code (A-Z)</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => handleSortChange('created_at', 'desc')}
                >
                  <View style={styles.radioButton}>
                    {filters.sortBy === 'created_at' && filters.sortOrder === 'desc' && <View style={styles.radioSelected} />}
                  </View>
                  <Text style={styles.radioText}>Newest First</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Location Section - Based on real warehouse data */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection('location')}
            >
              <Text style={styles.sectionTitle}>Location</Text>
              <Icon
                name={expandedSections.location ? 'chevron-down' : 'chevron-right'}
                size={20}
                color="#374151"
              />
            </TouchableOpacity>
            
            {expandedSections.location && (
              <View style={styles.optionsContainer}>
                {uniqueLocations.map((location, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.radioOption}
                    onPress={() => handleLocationToggle(location)}
                  >
                    <View style={styles.radioButton}>
                      {filters.location.includes(location) && <View style={styles.radioSelected} />}
                    </View>
                    <Text style={styles.radioText}>{location}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Warehouse Types Section - Based on real data */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection('warehouseTypes')}
            >
              <Text style={styles.sectionTitle}>Warehouse Types</Text>
              <Icon
                name={expandedSections.warehouseTypes ? 'chevron-down' : 'chevron-right'}
                size={20}
                color="#374151"
              />
            </TouchableOpacity>
            
            {expandedSections.warehouseTypes && (
              <View style={styles.optionsContainer}>
                <TouchableOpacity style={styles.languageOption}>
                  <Icon name="home" size={16} color="#6B7280" style={styles.flagEmoji} />
                  <Text style={styles.radioText}>Distribution Center</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.languageOption}>
                  <Icon name="thermometer" size={16} color="#6B7280" style={styles.flagEmoji} />
                  <Text style={styles.radioText}>Cold Storage</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.languageOption}>
                  <Icon name="settings" size={16} color="#6B7280" style={styles.flagEmoji} />
                  <Text style={styles.radioText}>Manufacturing</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.languageOption}>
                  <Icon name="shopping-bag" size={16} color="#6B7280" style={styles.flagEmoji} />
                  <Text style={styles.radioText}>Retail Store</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Apply Button - Exactly like Figma */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>
              Apply Filter {getActiveFilterCount() > 0 && `(${getActiveFilterCount()})`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  categoryContent: {
    paddingLeft: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
  },
  recentSearchesContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  recentSearchesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentSearchesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  clearHistoryText: {
    fontSize: 12,
    color: '#FB7504',
    fontWeight: '500',
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  recentSearchText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  tagSelected: {
    backgroundColor: '#FB7504',
  },
  tagIcon: {
    marginRight: 6,
  },
  tagText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  tagTextSelected: {
    color: '#FFFFFF',
  },
  tagCheckIcon: {
    marginLeft: 6,
  },
  optionsContainer: {
    paddingLeft: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FB7504',
  },
  radioText: {
    fontSize: 16,
    color: '#374151',
  },
  priceRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 12,
  },
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flex: 1,
  },
  dollarSign: {
    fontSize: 16,
    color: '#6B7280',
    marginRight: 4,
  },
  priceTextInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  priceSeparator: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '600',
  },
  ratingOption: {
    paddingVertical: 12,
  },
  ratingText: {
    fontSize: 16,
    color: '#374151',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  flagEmoji: {
    fontSize: 16,
    marginRight: 12,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  applyButton: {
    backgroundColor: '#FB7504',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default WarehouseFilterModal;