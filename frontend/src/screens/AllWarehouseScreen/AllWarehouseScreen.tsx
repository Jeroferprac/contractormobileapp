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
  ScrollView,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path, Rect, Line } from 'react-native-svg';

import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';

import { Warehouse, WarehouseStats, Stock, WarehouseFilterOptions } from '../../types/inventory';
import inventoryApiService from '../../api/inventoryApi';
import stockNotificationService from '../../utils/stockNotifications';
import searchHistoryService from '../../utils/searchHistory';

// Import modular components
import HeaderSection from '../../components/inventory/Warehouse/AllWarehouse/HeaderSection';
import WarehouseCard from '../../components/inventory/Warehouse/AllWarehouse/WarehouseCard';
import WarehouseDetails from '../../components/inventory/Warehouse/AllWarehouse/DetailsCard';
import BinManagementTab from '../../components/inventory/Warehouse/AllWarehouse/BinManagementTab';
import WarehouseFilterModal from '../../components/ui/WarehouseFilterModal';
import { SearchModal } from '../../components/ui';

// Import warehouse forms
import { WarehouseForm, StockForm } from '../../components/inventory/Warehouse/WarehouseForms';


const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// SVG Components
const VerifiedIcon: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <Svg width={size} height={size} viewBox="0 0 15 14" fill="none">
    <Path d="M13.5931 5.42601C13.3574 5.17976 13.1137 4.92601 13.0218 4.70288C12.9368 4.49851 12.9318 4.15976 12.9268 3.83163C12.9174 3.22163 12.9074 2.53038 12.4268 2.04976C11.9462 1.56913 11.2549 1.55913 10.6449 1.54976C10.3168 1.54476 9.97806 1.53976 9.77368 1.45476C9.55118 1.36288 9.29681 1.11913 9.05056 0.883506C8.61931 0.469131 8.12931 -0.000244141 7.47681 -0.000244141C6.82431 -0.000244141 6.33493 0.469131 5.90306 0.883506C5.65681 1.11913 5.40306 1.36288 5.17993 1.45476C4.97681 1.53976 4.63681 1.54476 4.30868 1.54976C3.69868 1.55913 3.00743 1.56913 2.52681 2.04976C2.04618 2.53038 2.03931 3.22163 2.02681 3.83163C2.02181 4.15976 2.01681 4.49851 1.93181 4.70288C1.83993 4.92538 1.59618 5.17976 1.36056 5.42601C0.946182 5.85726 0.476807 6.34726 0.476807 6.99976C0.476807 7.65226 0.946182 8.14163 1.36056 8.57351C1.59618 8.81976 1.83993 9.07351 1.93181 9.29663C2.01681 9.50101 2.02181 9.83976 2.02681 10.1679C2.03618 10.7779 2.04618 11.4691 2.52681 11.9498C3.00743 12.4304 3.69868 12.4404 4.30868 12.4498C4.63681 12.4548 4.97556 12.4598 5.17993 12.5448C5.40243 12.6366 5.65681 12.8804 5.90306 13.116C6.33431 13.5304 6.82431 13.9998 7.47681 13.9998C8.12931 13.9998 8.61868 13.5304 9.05056 13.116C9.29681 12.8804 9.55056 12.6366 9.77368 12.5448C9.97806 12.4598 10.3168 12.4548 10.6449 12.4498C11.2549 12.4404 11.9462 12.4304 12.4268 11.9498C12.9074 11.4691 12.9174 10.7779 12.9268 10.1679C12.9318 9.83976 12.9368 9.50101 13.0218 9.29663C13.1137 9.07413 13.3574 8.81976 13.5931 8.57351C14.0074 8.14226 14.4768 7.65226 14.4768 6.99976C14.4768 6.34726 14.0074 5.85788 13.5931 5.42601ZM10.3306 5.85351L6.83056 9.35351C6.78412 9.39999 6.72898 9.43687 6.66828 9.46204C6.60758 9.4872 6.54251 9.50015 6.47681 9.50015C6.4111 9.50015 6.34604 9.4872 6.28534 9.46204C6.22464 9.43687 6.16949 9.39999 6.12306 9.35351L4.62306 7.85351C4.52924 7.75969 4.47653 7.63244 4.47653 7.49976C4.47653 7.36707 4.52924 7.23983 4.62306 7.14601C4.71688 7.05219 4.84412 6.99948 4.97681 6.99948C5.10949 6.99948 5.23674 7.05219 5.33056 7.14601L6.47681 8.29288L9.62306 5.14601C9.66951 5.09955 9.72466 5.0627 9.78536 5.03756C9.84606 5.01242 9.91111 4.99948 9.97681 4.99948C10.0425 4.99948 10.1076 5.01242 10.1683 5.03756C10.229 5.0627 10.2841 5.09955 10.3306 5.14601C10.377 5.19246 10.4139 5.24761 10.439 5.30831C10.4641 5.369 10.4771 5.43406 10.4771 5.49976C10.4771 5.56545 10.4641 5.63051 10.439 5.6912C10.4139 5.7519 10.377 5.80705 10.3306 5.85351Z" fill="#00AAFF"/>
  </Svg>
);

const WarehouseAvatar: React.FC<{ size?: number }> = ({ size = 42 }) => (
  <Svg width={size} height={size} viewBox="0 0 42 42" fill="none">
    <Rect x="1" y="1" width="40" height="40" rx="20" fill="#E7600E"/>
    <Rect x="1" y="1" width="40" height="40" rx="20" stroke="white" strokeWidth="2"/>
    <Path d="M12 18.3659V11.3416H30V29.3416H23.8537" stroke="white" strokeWidth="2.63415"/>
    <Line x1="20.7806" y1="30.6587" x2="20.7806" y2="17.488" stroke="white" strokeWidth="2.63415"/>
    <Line x1="16.3902" y1="28.9026" x2="16.3902" y2="15.7319" stroke="white" strokeWidth="2.63415"/>
    <Line x1="12.0001" y1="30.6587" x2="12.0001" y2="20.1221" stroke="white" strokeWidth="2.63415"/>
  </Svg>
);

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
  route?: {
    params?: {
      selectedWarehouse?: WarehouseWithDetails;
    };
  };
}

const AllWarehouseScreen: React.FC<AllWarehouseScreenProps> = ({ navigation, route }) => {
  const [warehouses, setWarehouses] = useState<WarehouseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseWithDetails | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'warehouse' | 'binmanagement'>('warehouse');

  // Form state management
  const [showWarehouseForm, setShowWarehouseForm] = useState(false);
  const [showStockForm, setShowStockForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'update'>('create');
  const [selectedWarehouseForAction, setSelectedWarehouseForAction] = useState<Warehouse | null>(null);
  const [selectedStockForAction, setSelectedStockForAction] = useState<Stock | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [selectedWarehouseForMenu, setSelectedWarehouseForMenu] = useState<WarehouseWithDetails | null>(null);
  const [filterOptions, setFilterOptions] = useState<WarehouseFilterOptions>({
    status: 'all',
    location: [],
    contactInfo: 'all',
    sortBy: 'name',
    sortOrder: 'asc',
    searchText: '',
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
      
      // Handle selected warehouse from route params
      if (route?.params?.selectedWarehouse) {
        const selectedWarehouseFromRoute = route.params.selectedWarehouse;
        console.log('🎯 Received selected warehouse from route:', selectedWarehouseFromRoute.name);
        const foundWarehouse = enhancedWarehouses.find(w => w.id === selectedWarehouseFromRoute.id);
        if (foundWarehouse) {
          console.log('✅ Found warehouse in list, setting as selected:', foundWarehouse.name);
          setSelectedWarehouse(foundWarehouse);
          const warehouseIndex = enhancedWarehouses.findIndex(w => w.id === foundWarehouse.id);
          setCurrentIndex(warehouseIndex);
        } else {
          console.log('⚠️ Warehouse not found in list, using first warehouse');
          setSelectedWarehouse(enhancedWarehouses[0]);
        }
      } else if (enhancedWarehouses.length > 0) {
        console.log('📋 No selected warehouse from route, using first warehouse');
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

  // Load recent searches
  useEffect(() => {
    const loadRecentSearches = async () => {
      try {
        await searchHistoryService.initialize();
        const searches = searchHistoryService.getRecentSearches('warehouse');
        setRecentSearches(searches);
      } catch (error) {
        console.error('Failed to load recent searches:', error);
      }
    };
    loadRecentSearches();
  }, []);

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
      const currentScrollX = scrollX.value;
      detectCenterCard(currentScrollX);
    };

    // Check scroll position every 100ms
    const intervalId = setInterval(checkScrollPosition, 100);

    return () => {
      clearInterval(intervalId);
    };
  }, [currentIndex]);

  // Card dimensions for snap-to-center functionality
  const CARD_WIDTH = screenWidth * 0.8;
  const CARD_SPACING = SPACING.lg;
  const SIDE_SPACING = (screenWidth - CARD_WIDTH) / 2;

  // Filter and sort warehouses based on comprehensive filter options
  const filteredWarehouses = warehouses
    .filter(warehouse => {
      // Search filter
      const searchQuery = filterOptions.searchText.toLowerCase();
      const matchesSearch = searchQuery === '' || 
        warehouse.name.toLowerCase().includes(searchQuery) ||
        warehouse.code.toLowerCase().includes(searchQuery) ||
        warehouse.address.toLowerCase().includes(searchQuery);
      
      // Status filter
      const matchesStatus = filterOptions.status === 'all' || 
        (filterOptions.status === 'active' && warehouse.is_active) ||
        (filterOptions.status === 'inactive' && !warehouse.is_active);
      
      // Location filter
      const warehouseLocation = warehouse.address.split(',')[0].trim();
      const matchesLocation = filterOptions.location.length === 0 || 
        filterOptions.location.includes(warehouseLocation);
      
      // Contact info filter
      let matchesContactInfo = true;
      if (filterOptions.contactInfo !== 'all') {
        switch (filterOptions.contactInfo) {
          case 'has_contact':
            matchesContactInfo = !!(warehouse.contact_person || warehouse.phone || warehouse.email);
            break;
          case 'complete':
            matchesContactInfo = !!(warehouse.contact_person && warehouse.phone && warehouse.email);
            break;
        }
      }
      
      return matchesSearch && matchesStatus && matchesLocation && matchesContactInfo;
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
    console.log('🔙 Back button pressed in AllWarehouseScreen');
    if (navigation?.canGoBack()) {
      console.log('✅ Can go back, navigating to previous screen');
      navigation.goBack();
    } else {
      console.log('⚠️ Cannot go back, navigating to Home');
      // Fallback to home if no previous screen
      navigation?.navigate('Home');
    }
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
      console.log('Submitting stock data:', stockData);
      
      if (selectedStockForAction) {
        // Update existing stock
        const response = await inventoryApiService.updateStock(selectedStockForAction.id, stockData);
        console.log('Stock updated successfully:', response.data);
        Alert.alert('Success', 'Stock updated successfully!');
        
        // Trigger stock notification check after update
        await triggerStockNotificationCheck(stockData);
      } else {
        // Create new stock
        const response = await inventoryApiService.createStock(stockData);
        console.log('Stock created successfully:', response.data);
        Alert.alert('Success', 'Stock created successfully!');
        
        // Trigger stock notification check after creation
        await triggerStockNotificationCheck(stockData);
      }
      setShowStockForm(false);
      setSelectedStockForAction(null);
      fetchWarehouses(); // Refresh the list
    } catch (error: any) {
      console.error('Stock form error:', error);
      
      // Enhanced error handling
      let errorMessage = 'Failed to save stock. Please try again.';
      
      if (error.response) {
        // Server responded with error
        const errorData = error.response.data;
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message) {
        // Other error
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  const handleStockFormCancel = () => {
    setShowStockForm(false);
    setSelectedStockForAction(null);
  };

  // Handle menu press for dropdown
  const handleMenuPress = (warehouse: WarehouseWithDetails) => {
    setSelectedWarehouseForMenu(warehouse);
    setShowMenuDropdown(true);
  };

  // Handle menu dropdown actions
  const handleMenuAction = (action: 'edit' | 'add_stock') => {
    if (!selectedWarehouseForMenu) return;
    
    setShowMenuDropdown(false);
    
    if (action === 'edit') {
      handleEditWarehouse(selectedWarehouseForMenu);
    } else if (action === 'add_stock') {
      handleAddStock(selectedWarehouseForMenu);
    }
    
    setSelectedWarehouseForMenu(null);
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
  const handleFilterApply = (newFilterOptions: WarehouseFilterOptions) => {
    setFilterOptions(newFilterOptions);
    setSearchText(newFilterOptions.searchText);
    setShowFilterModal(false);
  };

  const handleFilterReset = () => {
    const defaultFilters: WarehouseFilterOptions = {
      status: 'all',
      location: [],
      contactInfo: 'all',
      sortBy: 'name',
      sortOrder: 'asc',
      searchText: '',
    };
    setFilterOptions(defaultFilters);
    setSearchText('');
  };

  // Search modal handlers
  const handleSearchSubmit = (searchText: string) => {
    setFilterOptions(prev => ({ ...prev, searchText }));
    setSearchText(searchText);
  };

  const handleSearchResultSelect = (result: any) => {
    // Handle warehouse selection from search results
    const warehouse = warehouses.find(w => w.id === result.id);
    if (warehouse) {
      const index = filteredWarehouses.findIndex(w => w.id === warehouse.id);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  };

  const handleRecentSearchPress = (search: string) => {
    setFilterOptions(prev => ({ ...prev, searchText: search }));
    setSearchText(search);
  };

  // Convert warehouses to search results
  const getSearchResults = () => {
    if (!filterOptions.searchText) return [];
    
    return warehouses
      .filter(warehouse => {
        const searchQuery = filterOptions.searchText.toLowerCase();
        return warehouse.name.toLowerCase().includes(searchQuery) ||
               warehouse.code.toLowerCase().includes(searchQuery) ||
               warehouse.address.toLowerCase().includes(searchQuery) ||
               warehouse.contact_person?.toLowerCase().includes(searchQuery);
      });
  };

  // Render warehouse card for search results
  const renderWarehouseCard = (warehouse: WarehouseWithDetails, index: number) => {
    return (
      <WarehouseCard
        key={warehouse.id}
        warehouse={warehouse}
        index={index}
        scrollX={scrollX}
        onPress={() => handleSearchResultSelect(warehouse)}
        onEdit={() => handleEditWarehouse(warehouse)}
      />
    );
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

  // Simple loading state - no skeleton, just show content immediately
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading warehouses...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient colors={COLORS.gradient.primary} style={styles.headerGradient}>
        {/* Header Card - Like Inventory Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
                style={styles.headerMenuButton} 
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>All Warehouses</Text>
              <Text style={styles.headerSubtitle}>Manage your warehouse inventory</Text>
            </View>
            
            <TouchableOpacity 
                style={styles.settingsButton}
              onPress={handleAddPress}
            >
              <Icon name="plus" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

            {/* Search Bar - Like Inventory Header */}
          <TouchableOpacity style={styles.searchBar} onPress={() => setShowSearchModal(true)}>
            <Icon name="search" size={20} color="#9CA3AF" />
            <Text style={styles.searchPlaceholder}>
              {filterOptions.searchText || "Search warehouses..."}
            </Text>
              <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterModal(true)}>
                <Icon name="filter" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
        
        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={16} color={COLORS.status.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

      {/* Content based on active tab */}
      {activeTab === 'warehouse' ? (
        <>
          {/* Warehouses Section Title */}
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Warehouses</Text>
            <Text style={styles.resultsCount}>
              {filteredWarehouses.length} result{filteredWarehouses.length !== 1 ? 's' : ''} found
            </Text>
          </View>

          {/* Vertical Warehouse Cards */}
          <Animated.View style={[styles.cardsContainer, { opacity: fadeAnim }]}>
            <FlatList
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.cardsScrollContainer}
              data={filteredWarehouses}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <TouchableOpacity 
                  style={styles.warehouseCard}
                  onPress={() => handleWarehousePress(item)}
                  activeOpacity={0.8}
                >
                  {/* Hero Image with Margins */}
                  <View style={styles.cardImageContainer}>
                    <View style={styles.imageWrapper}>
                    <FastImage
                      source={{ uri: item.imageUrl }}
                      style={styles.cardImage}
                      resizeMode={FastImage.resizeMode.cover}
                    />
                    </View>
                    <TouchableOpacity 
                      style={styles.menuButton}
                      onPress={() => handleMenuPress(item)}
                    >
                      <Icon name="more-vertical" size={20} color="#374151" />
                    </TouchableOpacity>
                  </View>

                  {/* Company Information */}
                  <View style={styles.cardContent}>
                    <View style={styles.companyHeader}>
                      <View style={styles.companyLogo}>
                        <WarehouseAvatar size={42} />
                      </View>
                      <View style={styles.companyInfo}>
                        <View style={styles.companyNameRow}>
                          <Text style={styles.companyName}>{item.name}</Text>
                          <View style={styles.verificationBadge}>
                            <VerifiedIcon size={15} />
                          </View>
                        </View>
                        <View style={styles.ratingRow}>
                          <Icon name="star" size={16} color="#FCD34D" />
                          <Text style={styles.ratingText}>4.9 ({(item.stats?.total_bins || 0).toString()}+)</Text>
                        </View>
                      </View>
                    </View>

                    {/* Key Details - 2x2 Grid */}
                    <View style={styles.detailsGrid}>
                      <View style={styles.detailRow}>
                      <View style={styles.detailItem}>
                        <Icon name="award" size={16} color="#FB7504" />
                          <Text style={styles.detailText}>{(item.stats?.active_bins || 0).toString()}+ Active Bins</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Icon name="map-pin" size={16} color="#FB7504" />
                        <Text style={styles.detailText}>{item.address}</Text>
                      </View>
                      </View>
                      <View style={styles.detailRow}>
                      <View style={styles.detailItem}>
                        <Icon name="package" size={16} color="#FB7504" />
                          <Text style={styles.detailText}>{(item.stats?.total_stock || 0).toString()} Items</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Icon name="activity" size={16} color="#FB7504" />
                          <Text style={styles.detailText}>Utilization: {(item.utilization || 0).toString()}%</Text>
                        </View>
                      </View>
                    </View>

                    {/* Specialization Tags */}
                    <View style={styles.specializationSection}>
                      <Text style={styles.specializationTitle}>Specialization</Text>
                      <View style={styles.tagsContainer}>
                        <View style={styles.tag}>
                          <Icon name="archive" size={14} color="#6B7280" />
                          <Text style={styles.tagText}>Storage</Text>
                        </View>
                        <View style={styles.tag}>
                          <Icon name="package" size={14} color="#6B7280" />
                          <Text style={styles.tagText}>Inventory</Text>
                        </View>
                        <View style={styles.tag}>
                          <Icon name="truck" size={14} color="#6B7280" />
                          <Text style={styles.tagText}>Logistics</Text>
                        </View>
                      </View>
                    </View>

                  </View>
                </TouchableOpacity>
              )}
              onScroll={(event) => {
                const offsetX = event.nativeEvent.contentOffset.x;
                scrollX.setValue(offsetX);
                detectCenterCard(offsetX);
              }}
              scrollEventThrottle={16}
            />
          </Animated.View>
        </>
      ) : (
        /* Bin Management Tab Content */
        <View style={styles.binManagementContainer}>
          <BinManagementTab
            totalBins={selectedWarehouse?.binCount || 96}
            activeBins={selectedWarehouse?.activeBins || 72}
            warehouseId={selectedWarehouse?.id}
          />
        </View>
      )}

      {/* Bottom Tab Navigation */}
      <View style={styles.bottomTabContainer}>
        <TouchableOpacity
          style={[styles.bottomTab, activeTab === 'warehouse' && styles.activeBottomTab]}
          onPress={() => setActiveTab('warehouse')}
        >
          <Icon 
            name="home" 
            size={16} 
            color={activeTab === 'warehouse' ? COLORS.primary : COLORS.text.secondary} 
          />
          <Text style={[styles.bottomTabText, activeTab === 'warehouse' && styles.activeBottomTabText]}>
            Warehouse
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.bottomTab, activeTab === 'binmanagement' && styles.activeBottomTab]}
          onPress={() => setActiveTab('binmanagement')}
        >
          <Icon 
            name="grid" 
            size={16} 
            color={activeTab === 'binmanagement' ? COLORS.primary : COLORS.text.secondary} 
          />
          <Text style={[styles.bottomTabText, activeTab === 'binmanagement' && styles.activeBottomTabText]}>
            Bin Management
          </Text>
        </TouchableOpacity>
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

      {/* Search Modal */}
      <SearchModal
        visible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onResultSelect={handleSearchResultSelect}
        onSearchSubmit={handleSearchSubmit}
        searchResults={getSearchResults()}
        placeholder="Search warehouses..."
        title="Search Warehouses"
        category="warehouse"
        popularSearches={['Main Warehouse', 'Storage Unit', 'Distribution Center', 'Cold Storage']}
        showRecentSearches={true}
        showPopularSearches={true}
        renderResultItem={renderWarehouseCard}
      />

      {/* Filter Modal */}
          <WarehouseFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleFilterApply}
        onClear={handleFilterReset}
        warehouses={warehouses}
            currentFilters={filterOptions}
          />

          {/* Menu Dropdown Modal */}
          <Modal
            visible={showMenuDropdown}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowMenuDropdown(false)}
          >
            <TouchableOpacity 
              style={styles.dropdownOverlay}
              activeOpacity={1}
              onPress={() => setShowMenuDropdown(false)}
            >
              <View style={styles.dropdownContainer}>
                <TouchableOpacity 
                  style={styles.dropdownItem}
                  onPress={() => handleMenuAction('edit')}
                >
                  <Icon name="edit-2" size={20} color="#374151" />
                  <Text style={styles.dropdownItemText}>Edit Warehouse</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.dropdownItem}
                  onPress={() => handleMenuAction('add_stock')}
                >
                  <Icon name="plus" size={20} color="#374151" />
                  <Text style={styles.dropdownItemText}>Add Stock</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerGradient: {
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xs,
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
    ...SHADOWS.lg,
  },
  headerContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: '#FB7504',
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 48,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
    marginRight: 12,
    paddingVertical: 0,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: '#9CA3AF',
    marginLeft: 12,
    marginRight: 12,
  },
  searchResultCard: {
    marginBottom: SPACING.md,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
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
  sectionTitleContainer: {
    paddingHorizontal: 15,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  resultsCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  cardsContainer: {
    flex: 1,
  },
  cardsScrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  warehouseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  cardImageContainer: {
    position: 'relative',
    height: 150,
    padding: 12, // Add margin around image
  },
  imageWrapper: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  menuButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    padding: 15,
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  companyLogo: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  companyInfo: {
    flex: 1,
  },
  companyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginRight: 8,
  },
  verificationBadge: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#111827',
    marginLeft: 4,
    fontWeight: '500',
  },
  detailsGrid: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
    flex: 1,
  },
  specializationSection: {
    marginBottom: 16,
  },
  specializationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: '30%',
  },
  tagText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: 'transparent',
  },
  editButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
  addStockButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  addStockButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 6,
  },
  bottomCardsContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: 80, // Add space for the bottom navigation
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
    paddingBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '500',
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
  },
  activeTabText: {
    color: COLORS.text.light,
  },
  binManagementContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: 80, // Add space for the bottom navigation
  },
  bottomTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 20,
    marginHorizontal: 20,
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  bottomTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  activeBottomTab: {
    backgroundColor: '#fff',
  },
  bottomTabText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
    flexShrink: 0,
  },
  activeBottomTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  headerMenuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsButton: {
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
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
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

  // Overlay Card Styles - Like Sales Screen
  overlayContainer: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
    right: SPACING.sm,
    height: 80,
  },
  glassmorphismOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  overlayContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  overlayActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    minWidth: 100,
    justifyContent: 'center',
  },
  actionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(251, 117, 4, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  overlayActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },

  // Dropdown Menu Styles
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    fontWeight: '500',
  },

});

export default AllWarehouseScreen;
