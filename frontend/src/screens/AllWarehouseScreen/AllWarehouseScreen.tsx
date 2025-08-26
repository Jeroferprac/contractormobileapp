import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Animated,
  TextInput,
  Platform,
  Alert,
  FlatList,
  Modal,
} from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';
import { Warehouse, WarehouseStats, Stock } from '../../types/inventory';
import inventoryApiService from '../../api/inventoryApi';
import stockNotificationService from '../../utils/stockNotifications';

// Import modular components
import HeaderSection from '../../components/inventory/Warehouse/AllWarehouse/HeaderSection';
import WarehouseCard from '../../components/inventory/Warehouse/AllWarehouse/WarehouseCard';
import WarehouseDetails from '../../components/inventory/Warehouse/AllWarehouse/DetailsCard';
import FilterModal from '../../components/ui/FilterModal';

// Import warehouse forms
import { WarehouseForm, StockForm } from '../../components/inventory/Warehouse/WarehouseForms';


const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Unsplash warehouse images for variety
const WAREHOUSE_IMAGES = [
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1553413077-190dd305871c?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1586528116493-6c8b5b3b3b3b?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1553413077-190dd305871c?w=400&h=300&fit=crop&sig=2',
  'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=300&fit=crop&sig=3',
];

// Enhanced warehouse interface with API data
interface WarehouseWithDetails extends Warehouse {
  imageUrl?: string;
  stockLevel?: number;
  capacity?: number;
  utilization?: number;
  binCount?: number;
  activeBins?: number;
  stats?: WarehouseStats;
  warehouseStocks?: Stock[];
}

interface AllWarehouseScreenProps {
  navigation?: any;
}

const AllWarehouseScreen: React.FC<AllWarehouseScreenProps> = ({ navigation }) => {
  const [warehouses, setWarehouses] = useState<WarehouseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
    const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseWithDetails | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Form state management
  const [showWarehouseForm, setShowWarehouseForm] = useState(false);
  const [showStockForm, setShowStockForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'update'>('create');
  const [selectedWarehouseForAction, setSelectedWarehouseForAction] = useState<Warehouse | null>(null);
  const [selectedStockForAction, setSelectedStockForAction] = useState<Stock | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    status: 'all',
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const scrollX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<any>(null);
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch warehouses from API
  const fetchWarehouses = useCallback(async () => {
    try {
      setError(null);
      const response = await inventoryApiService.getWarehouses();
      const warehouseData = response.data;
      
      // Enhance warehouse data with images and calculated stats
      const enhancedWarehouses: WarehouseWithDetails[] = await Promise.all(
        warehouseData.map(async (warehouse: Warehouse, index: number) => {
          // Fetch warehouse stocks
          let warehouseStocks: Stock[] = [];
          try {
            const stocksResponse = await inventoryApiService.getWarehouseStocks({ warehouse_id: warehouse.id });
            warehouseStocks = stocksResponse.data;
          } catch (stocksError) {
            console.warn(`Failed to fetch stocks for warehouse ${warehouse.id}:`, stocksError);
          }
          
          // Calculate stats from warehouse stocks data (parse strings to numbers)
          const totalQuantity = warehouseStocks.reduce((sum, stock) => {
            const quantity = typeof stock.quantity === 'string' ? parseFloat(stock.quantity || '0') : (stock.quantity || 0);
            return sum + (isNaN(quantity) ? 0 : quantity);
          }, 0);
          const totalReserved = warehouseStocks.reduce((sum, stock) => {
            const reserved = typeof stock.reserved_quantity === 'string' ? parseFloat(stock.reserved_quantity || '0') : (stock.reserved_quantity || 0);
            return sum + (isNaN(reserved) ? 0 : reserved);
          }, 0);
          const totalAvailable = warehouseStocks.reduce((sum, stock) => {
            const available = typeof stock.available_quantity === 'string' ? parseFloat(stock.available_quantity || '0') : (stock.available_quantity || 0);
            return sum + (isNaN(available) ? 0 : available);
          }, 0);
          
          // Estimate bins based on stock entries (each stock entry represents a bin)
          const estimatedBins = warehouseStocks.length || 1; // Use actual stock entries as bins
          const activeBins = warehouseStocks.filter(stock => {
            const quantity = typeof stock.quantity === 'string' ? parseFloat(stock.quantity || '0') : (stock.quantity || 0);
            return !isNaN(quantity) && quantity > 0;
          }).length;
          const utilizationPercentage = estimatedBins > 0 ? Math.round((activeBins / estimatedBins) * 100) : 0;
          
          const stats: WarehouseStats = {
            total_stock: totalQuantity,
            total_bins: estimatedBins,
            active_bins: activeBins,
            utilization_percentage: utilizationPercentage,
            low_stock_items: warehouseStocks.filter(stock => {
              const quantity = typeof stock.quantity === 'string' ? parseFloat(stock.quantity || '0') : (stock.quantity || 0);
              return !isNaN(quantity) && quantity < 10;
            }).length,
            out_of_stock_items: warehouseStocks.filter(stock => {
              const quantity = typeof stock.quantity === 'string' ? parseFloat(stock.quantity || '0') : (stock.quantity || 0);
              return !isNaN(quantity) && quantity === 0;
            }).length,
            total_value: totalQuantity * 100, // Estimate value
          };
          
          return {
            ...warehouse,
            imageUrl: WAREHOUSE_IMAGES[index % WAREHOUSE_IMAGES.length],
            stockLevel: totalQuantity,
            capacity: estimatedBins * 100, // Estimate capacity
            utilization: utilizationPercentage,
            binCount: estimatedBins,
            activeBins: activeBins,
            stats,
            warehouseStocks,
          };
        })
      );
      
      setWarehouses(enhancedWarehouses);
      if (enhancedWarehouses.length > 0) {
        setSelectedWarehouse(enhancedWarehouses[0]);
      }
      setLoading(false);
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    } catch (error: any) {
      console.error('Failed to fetch warehouses:', error);
      setError(error.response?.data?.detail || 'Failed to load warehouses');
      setLoading(false);
    }
  }, []);

  // Refresh warehouses
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchWarehouses();
    setRefreshing(false);
  }, [fetchWarehouses]);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, []);

  // Timer-based scroll detection for auto-centering
  useEffect(() => {
    const checkScrollPosition = () => {
      // Simulate scroll position detection
      // Since we can't get scroll events, we'll use a different approach
      const currentScrollX = scrollX._value;
      detectCenterCard(currentScrollX);
    };

    // Check scroll position every 100ms
    const intervalId = setInterval(checkScrollPosition, 100);

    return () => {
      clearInterval(intervalId);
    };
  }, [currentIndex, filteredWarehouses]);

  // Card dimensions for snap-to-center functionality
  const CARD_WIDTH = screenWidth * 0.8;
  const CARD_SPACING = SPACING.lg;
  const SIDE_SPACING = (screenWidth - CARD_WIDTH) / 2;

  // Filter and sort warehouses based on search text and filter options
  const filteredWarehouses = warehouses
    .filter(warehouse => {
      // Search filter
      const matchesSearch = warehouse.name.toLowerCase().includes(searchText.toLowerCase()) ||
        warehouse.code.toLowerCase().includes(searchText.toLowerCase()) ||
        warehouse.address.toLowerCase().includes(searchText.toLowerCase());
      
      // Status filter
      const matchesStatus = filterOptions.status === 'all' || 
        (filterOptions.status === 'active' && warehouse.is_active) ||
        (filterOptions.status === 'inactive' && !warehouse.is_active);
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filterOptions.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'code':
          aValue = a.code.toLowerCase();
          bValue = b.code.toLowerCase();
          break;
        case 'created_at':
          aValue = new Date(a.created_at || '').getTime();
          bValue = new Date(b.created_at || '').getTime();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (filterOptions.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  // Get card style based on current index for 3D effect
  const getCardStyle = (index: number) => {
    const isCenter = index === currentIndex;
    
    return {
      opacity: isCenter ? 1 : 0.6,
      transform: [{ scale: isCenter ? 1 : 0.88 }],
    };
  };

  const handleBackPress = () => {
    navigation?.goBack();
  };

  // Form action handlers
  const handleAddWarehouse = () => {
    setFormMode('create');
    setSelectedWarehouseForAction(null);
    setShowWarehouseForm(true);
  };

  const handleEditWarehouse = (warehouse: Warehouse) => {
    setFormMode('update');
    setSelectedWarehouseForAction(warehouse);
    setShowWarehouseForm(true);
  };



  const handleAddStock = (warehouse: Warehouse) => {
    setSelectedWarehouseForAction(warehouse);
    setSelectedStockForAction(null);
    setShowStockForm(true);
  };

  const handleEditStock = (stock: Stock) => {
    setSelectedStockForAction(stock);
    setShowStockForm(true);
  };

  const handleWarehouseFormSubmit = async (warehouseData: any) => {
    try {
      if (formMode === 'create') {
        await inventoryApiService.createWarehouse(warehouseData);
        Alert.alert('Success', 'Warehouse created successfully!');
      } else {
        if (selectedWarehouseForAction) {
          await inventoryApiService.updateWarehouse(selectedWarehouseForAction.id, warehouseData);
          Alert.alert('Success', 'Warehouse updated successfully!');
        }
      }
      setShowWarehouseForm(false);
      fetchWarehouses(); // Refresh the list
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to save warehouse');
    }
  };

  const handleWarehouseFormCancel = () => {
    setShowWarehouseForm(false);
    setSelectedWarehouseForAction(null);
  };



  const handleStockFormSubmit = async (stockData: any) => {
    try {
      if (selectedStockForAction) {
        // Update existing stock
        await inventoryApiService.updateStock(selectedStockForAction.id, stockData);
        Alert.alert('Success', 'Stock updated successfully!');
        
        // Trigger stock notification check after update
        await triggerStockNotificationCheck(stockData);
      } else {
        // Create new stock
        await inventoryApiService.createStock(stockData);
        Alert.alert('Success', 'Stock created successfully!');
        
        // Trigger stock notification check after creation
        await triggerStockNotificationCheck(stockData);
      }
      setShowStockForm(false);
      setSelectedStockForAction(null);
      fetchWarehouses(); // Refresh the list
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to save stock');
    }
  };

  const handleStockFormCancel = () => {
    setShowStockForm(false);
    setSelectedStockForAction(null);
  };

  // Function to trigger stock notification check after stock operations
  const triggerStockNotificationCheck = async (stockData: any) => {
    try {
      // Get the updated stock information
      const currentStock = stockData.quantity || 0;
      const minStockLevel = stockData.min_stock_level || 0;
      
      // Check if this stock level should trigger a notification
      if (currentStock <= minStockLevel) {
        // Get product and warehouse details for the notification
        let productName = 'Unknown Product';
        let warehouseName = 'Unknown Warehouse';
        
        try {
          // Get product details
          if (stockData.product_id) {
            const productResponse = await inventoryApiService.getProductById(stockData.product_id);
            productName = productResponse.data.name || 'Unknown Product';
          }
          
          // Get warehouse details
          if (stockData.warehouse_id) {
            const warehouseResponse = await inventoryApiService.getWarehouseById(stockData.warehouse_id);
            warehouseName = warehouseResponse.data.name || 'Unknown Warehouse';
          }
        } catch (error) {
          // Could not fetch product/warehouse details for notification
        }
        
        // Create notification data
        const notificationData = {
          id: `stock_${stockData.product_id}_${stockData.warehouse_id}_${Date.now()}`,
          type: (currentStock === 0 ? 'out_of_stock' : 'low_stock') as 'out_of_stock' | 'low_stock',
          title: currentStock === 0 ? 'Out of Stock Alert' : 'Low Stock Alert',
          message: currentStock === 0 
            ? `${productName} is completely out of stock in ${warehouseName}`
            : `${productName} is running low (${currentStock}/${minStockLevel}) in ${warehouseName}`,
          productId: stockData.product_id,
          productName,
          warehouseId: stockData.warehouse_id,
          warehouseName,
          currentStock,
          minStockLevel,
          timestamp: new Date(),
          priority: (currentStock === 0 ? 'critical' : 'high') as 'critical' | 'high',
          data: { stockData }
        };
        
        // Send the notification
        await stockNotificationService['sendStockNotification'](notificationData);
      }
    } catch (error) {
      // Error triggering stock notification check
    }
  };

  // Filter handlers
  const handleFilterApply = (newFilterOptions: any) => {
    setFilterOptions(newFilterOptions);
    setShowFilterModal(false);
  };

  const handleFilterReset = () => {
    setFilterOptions({
      status: 'all',
      sortBy: 'name',
      sortOrder: 'asc',
    });
    setSearchText('');
  };

  const handleAddPress = () => {
    handleAddWarehouse();
  };

  const handleWarehousePress = (warehouse: WarehouseWithDetails) => {
    const warehouseIndex = filteredWarehouses.findIndex(w => w.id === warehouse.id);
    if (warehouseIndex !== -1) {
      setCurrentIndex(warehouseIndex);
      setSelectedWarehouse(warehouse);
      
      // Scroll to the selected warehouse
      const cardWidth = screenWidth * 0.8;
      const cardSpacing = SPACING.lg;
      const totalCardWidth = cardWidth + cardSpacing;
      const targetOffset = warehouseIndex * totalCardWidth;
      
      scrollViewRef.current?.scrollTo({
        x: targetOffset,
        animated: true,
      });
    }

  };

  // Update selected warehouse when current index changes
  useEffect(() => {
    if (currentIndex >= 0 && currentIndex < filteredWarehouses.length) {
      const newSelectedWarehouse = filteredWarehouses[currentIndex];

      setSelectedWarehouse(newSelectedWarehouse);
    }
  }, [currentIndex, filteredWarehouses]);

  // Remove auto-cycling - details should only change based on actual scroll position

  // Function to handle card selection with smooth animation
  const selectWarehouseCard = (index: number) => {
    if (index >= 0 && index < filteredWarehouses.length && index !== currentIndex) {
      setCurrentIndex(index);
      setSelectedWarehouse(filteredWarehouses[index]);
      
      // Animate scroll position to center the selected card
      const cardWidth = screenWidth * 0.8;
      const cardSpacing = SPACING.lg;
      const totalCardWidth = cardWidth + cardSpacing;
      const targetOffset = index * totalCardWidth;
      
      // Update scroll position smoothly
      Animated.timing(scrollX, {
        toValue: targetOffset,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  // Function to detect which card is 60% visible in center during scroll
  const detectCenterCard = (scrollOffset: number) => {
    const cardWidth = 320;
    const cardSpacing = SPACING.lg;
    const totalCardWidth = cardWidth + cardSpacing;
    
    // Calculate center position of screen
    const screenCenter = screenWidth / 2;
    const centerPosition = scrollOffset + screenCenter;
    
    // Find which card is at the center
    const cardIndex = Math.floor(centerPosition / totalCardWidth);
    
    // Calculate how much of the card is visible in the center
    const cardStart = cardIndex * totalCardWidth;
    const cardCenter = cardStart + (cardWidth / 2);
    const distanceFromCenter = Math.abs(centerPosition - cardCenter);
    const visibilityRatio = 1 - (distanceFromCenter / (cardWidth / 2));
    
    // If card is 60% visible and different from current, auto-select it
    if (visibilityRatio >= 0.6 && cardIndex !== currentIndex && cardIndex >= 0 && cardIndex < filteredWarehouses.length) {

      setCurrentIndex(cardIndex);
      setSelectedWarehouse(filteredWarehouses[cardIndex]);
    }
  };

  // Function to handle scroll with auto-centering
  const handleScrollWithAutoCenter = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    scrollX.setValue(offsetX);
    
    // Clear existing timer
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
    }
    
    // Set a timer to detect center card after scroll stops
    scrollTimerRef.current = setTimeout(() => {
      detectCenterCard(offsetX);
    }, 150); // Wait 150ms after scroll stops
  };





  // Calculate statistics
  const totalStock = warehouses.reduce((sum, w) => sum + (w.stockLevel || 0), 0);
  const avgStock = warehouses.length > 0 ? Math.round(totalStock / warehouses.length) : 0;
  const activeWarehouses = warehouses.filter(w => w.is_active).length;
  const totalBins = warehouses.reduce((sum, w) => sum + (w.binCount || 0), 0);
  const activeBins = warehouses.reduce((sum, w) => sum + (w.activeBins || 0), 0);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <View style={styles.loadingSkeleton} />
            <View style={styles.loadingSkeleton} />
            <View style={styles.loadingSkeleton} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header Card */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={handleBackPress}
            >
              <Icon name="arrow-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>All Warehouses</Text>
              <Text style={styles.headerSubtitle}>Manage your warehouse inventory</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddPress}
            >
              <Icon name="plus" size={20} color="#FFFFFF" />
            </TouchableOpacity>
      </View>

          {/* Search Bar */}
        <View style={styles.searchBar}>
            <Icon name="search" size={18} color={COLORS.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search warehouses..."
              placeholderTextColor={COLORS.text.secondary}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchText('')}>
                <Icon name="x" size={18} color={COLORS.text.secondary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowFilterModal(true)}
            >
                <Icon name="sliders" size={18} color={COLORS.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
        </View>
        
        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={16} color={COLORS.status.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>

      {/* Horizontal Warehouse Cards */}
      <Animated.View style={[styles.cardsContainer, { opacity: fadeAnim }]}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsScrollContainer}
          data={filteredWarehouses}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View style={styles.cardWrapper}>
              <WarehouseCard
                warehouse={item}
                index={index}
                scrollX={scrollX}
                onEdit={handleEditWarehouse}
            />
          </View>
          )}
          onScroll={(event) => {
            const offsetX = event.nativeEvent.contentOffset.x;
            scrollX.setValue(offsetX);
            detectCenterCard(offsetX);
          }}
          scrollEventThrottle={16}
        />
      </Animated.View>

      {/* Warehouse Details */}
      <View style={styles.bottomCardsContainer}>
        {selectedWarehouse && (
          <WarehouseDetails 
            key={selectedWarehouse.id} 
            warehouse={selectedWarehouse}
              onEdit={handleEditWarehouse}
              onAddStock={handleAddStock}
          />
        )}
      </View>

      {/* Warehouse Form Modal */}
      <Modal
        visible={showWarehouseForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowWarehouseForm(false);
          setSelectedWarehouseForAction(null);
        }}
      >
        <WarehouseForm
          warehouse={selectedWarehouseForAction}
          mode={formMode}
          onSuccess={() => {
            setShowWarehouseForm(false);
            setSelectedWarehouseForAction(null);
            fetchWarehouses();
          }}
          onCancel={() => {
            setShowWarehouseForm(false);
            setSelectedWarehouseForAction(null);
          }}
        />
      </Modal>



      {/* Stock Form Modal */}
      <Modal
        visible={showStockForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowStockForm(false);
          setSelectedStockForAction(null);
        }}
      >
        <StockForm
          stock={selectedStockForAction}
          mode={formMode}
          onSuccess={() => {
            setShowStockForm(false);
            setSelectedStockForAction(null);
            fetchWarehouses();
          }}
          onCancel={() => {
            setShowStockForm(false);
            setSelectedStockForAction(null);
          }}
        />
      </Modal>

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleFilterApply}
        onClear={handleFilterReset}
        filterStatus={filterOptions.status}
        setFilterStatus={(status) => setFilterOptions(prev => ({ ...prev, status }))}
        selectedWarehouse="all"
        setSelectedWarehouse={() => {}}
        dateRange={{ start: '', end: '' }}
        setDateRange={() => {}}
        warehouses={warehouses}
        getWarehouseName={(id) => warehouses.find(w => w.id === id)?.name || 'Unknown'}
        filteredTransfersCount={filteredWarehouses.length}
        getActiveFilterCount={() => {
          let count = 0;
          if (filterOptions.status !== 'all') count++;
          if (filterOptions.sortBy !== 'name') count++;
          if (filterOptions.sortOrder !== 'asc') count++;
          return count;
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 0 : 24,
    backgroundColor: '#FF6B35',
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
    ...SHADOWS.lg,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: '#FF6B35',
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    height: 44,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
    color: '#000000',
    marginLeft: SPACING.sm,
    marginRight: SPACING.sm,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  filterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeFilter: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.status.error + '10',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.status.error,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  cardsContainer: {
    marginVertical: SPACING.xs,
  },
  cardsScrollContainer: {
    paddingHorizontal: (screenWidth - 320) / 2,
    paddingVertical: SPACING.xs,
    overflow: 'visible',
  },
  cardWrapper: {
    width: 320,
    marginRight: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
  },
  bottomCardsContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  binContentContainer: {
    flex: 1,
    marginTop: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  loadingCard: {
    width: '100%',
    maxWidth: 400,
  },
  loadingSkeleton: {
    height: 80,
    backgroundColor: COLORS.border.light,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  // New dynamic card styles
  stockLevelCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    ...SHADOWS.sm,
  },
  stockLevelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  stockLevelTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  stockLevelContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circularProgressContainer: {
    alignItems: 'center',
  },
  circularProgress: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.border.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 40,
  },
  progressText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
    zIndex: 1,
  },
  stockDetails: {
    alignItems: 'flex-end',
  },
  stockValue: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  stockLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  stockTarget: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.tertiary,
  },
  warehouseDetailsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    ...SHADOWS.sm,
  },
  warehouseDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  warehouseDetailsTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  warehouseDetailsContent: {
    gap: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.sm,
  },
  detailsButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  detailsButtonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
  binManagementCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    ...SHADOWS.sm,
  },
  binManagementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  binManagementTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  binManagementContent: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  binCard: {
    flex: 1,
    backgroundColor: COLORS.border.light,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  binCardTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  binCardSubtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  headerContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AllWarehouseScreen;
