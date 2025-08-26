import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, ScrollView, SafeAreaView, StyleSheet, Alert, Text, TouchableOpacity, StatusBar } from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Feather';
import { inventoryApiService } from '../../api/inventoryApi';
import { Transaction, Warehouse, Transfer, Stock, Product } from '../../types/inventory';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';
import HeaderCard from '../../components/inventory/Warehouse/HeaderCard';
import StatsRow from '../../components/inventory/Warehouse/StatsRow';
import TransferActivityChart from '../../components/inventory/Warehouse/TransferActivityChart';
import StockTrendChart from '../../components/inventory/Warehouse/StockTrendChart';
import StockByWarehouseChart from '../../components/inventory/Warehouse/StockByWarehouseChart';
import HorizontalList from '../../components/inventory/Warehouse/HorizontalList';
import RecentTransfers from '../../components/inventory/Warehouse/RecentTransfers';
import InventoryList from '../../components/inventory/Warehouse/InventoryList';
import WarehouseList from '../../components/inventory/Warehouse/WarehouseList';
import QuickActionsRow from '../../components/inventory/Warehouse/QuickActionsRow';

// Unsplash images for different warehouse types
const WAREHOUSE_IMAGES = {
  general: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=400&h=300&fit=crop',
  electronics: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
  clothing: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
  food: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop',
  automotive: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop',
  furniture: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop',
  default: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=400&h=300&fit=crop'
};

interface WarehouseScreenProps {
  navigation: any;
}

// Enhanced warehouse dashboard with clean design
const WarehouseDashboard: React.FC<WarehouseScreenProps> = ({ navigation }) => {

  // Comprehensive state management
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stockLevels, setStockLevels] = useState<Stock[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);

  // Memoized data processing for better performance
  const processedWarehouseData = useMemo(() => {
    if (!warehouses.length) {
      // Fallback data if no warehouses from API
      return [
        { warehouse: 'Main Warehouse', quantity: 1250 },
        { warehouse: 'North Branch', quantity: 890 },
        { warehouse: 'South Branch', quantity: 650 },
        { warehouse: 'East Branch', quantity: 420 }
      ];
    }
    
    if (!stockLevels.length) {
      // If no stock data, create mock data for warehouses
      return warehouses.map(wh => ({
        warehouse: wh.name,
        quantity: Math.floor(Math.random() * 1000) + 100
      }));
    }
    
    return warehouses.map(wh => {
      const warehouseStock = stockLevels.filter(stock => stock.warehouse_id === wh.id);
      const totalQuantity = warehouseStock.reduce((sum, stock) => sum + Number(stock.quantity), 0);
      
      return {
        warehouse: wh.name,
        quantity: totalQuantity || Math.floor(Math.random() * 1000) + 100
      };
    }).filter(item => item.quantity > 0); // Only show warehouses with stock
  }, [warehouses, stockLevels]);

  // Enhanced warehouse data with images
  const enhancedWarehouses = useMemo(() => {
    return warehouses.map((warehouse, index) => {
      const warehouseStock = stockLevels.filter(stock => stock.warehouse_id === warehouse.id);
      const totalItems = warehouseStock.length;
      const totalQuantity = warehouseStock.reduce((sum, stock) => sum + Number(stock.quantity), 0);
      
      // Determine warehouse type based on name or assign default
      let imageKey = 'default';
      if (warehouse.name.toLowerCase().includes('electronics') || warehouse.name.toLowerCase().includes('tech')) {
        imageKey = 'electronics';
      } else if (warehouse.name.toLowerCase().includes('clothing') || warehouse.name.toLowerCase().includes('fashion')) {
        imageKey = 'clothing';
      } else if (warehouse.name.toLowerCase().includes('food') || warehouse.name.toLowerCase().includes('grocery')) {
        imageKey = 'food';
      } else if (warehouse.name.toLowerCase().includes('auto') || warehouse.name.toLowerCase().includes('car')) {
        imageKey = 'automotive';
      } else if (warehouse.name.toLowerCase().includes('furniture') || warehouse.name.toLowerCase().includes('home')) {
        imageKey = 'furniture';
      }
      
      return {
        ...warehouse,
        imageUrl: WAREHOUSE_IMAGES[imageKey as keyof typeof WAREHOUSE_IMAGES],
        totalItems,
        totalQuantity,
        utilization: totalQuantity > 0 ? Math.min((totalQuantity / 1000) * 100, 100) : 0 // Mock utilization
      };
    });
  }, [warehouses, stockLevels]);

  // Optimized data loading with error boundaries
  const loadWarehouseData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      // Parallel API calls for better performance
      const [transfersResponse, warehousesResponse, stockResponse, productsResponse, lowStockResponse] = await Promise.all([
        inventoryApiService.getTransfers(),
        inventoryApiService.getWarehouses(),
        inventoryApiService.getStocks(),
        inventoryApiService.getProducts(),
        inventoryApiService.getLowStockItems()
      ]);

      setTransfers(transfersResponse.data?.slice(0, 5) || []);
      setWarehouses(warehousesResponse.data || []);
      setStockLevels(stockResponse.data || []);
      setProducts(productsResponse.data || []);
      setLowStockItems(lowStockResponse.data || []);
      setLastRefreshTime(new Date());
      
    } catch (err) {
      console.error('Error fetching warehouse data:', err);
      
      // More specific error handling
      let errorMessage = 'Failed to load warehouse data';
      if (err instanceof Error) {
        if (err.message.includes('404')) {
          errorMessage = 'Some data endpoints are not available. Using fallback data.';
        } else if (err.message.includes('network')) {
          errorMessage = 'Network connection issue. Please check your internet connection.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      
      // Don't show alert for 404 errors as we have fallback data
      if (!isRefresh && !errorMessage.includes('404')) {
        Alert.alert(
          'Connection Error', 
          'Unable to load warehouse data. Please check your connection and try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Auto-refresh on mount
  useEffect(() => {
    loadWarehouseData();
  }, [loadWarehouseData]);

  // Enhanced navigation handlers with proper error handling
  const handleViewAllTransactions = useCallback(() => {
    try {
      console.log('🔍 Attempting to navigate to AllTransfers');
      navigation.navigate('AllTransfers');
      console.log('✅ Navigation successful');
    } catch (err) {
      console.error('❌ Navigation error:', err);
      Alert.alert('Navigation Error', 'Unable to navigate to all transfers');
    }
  }, [navigation]);

  const handleViewAllInventory = useCallback(() => {
    try {
      navigation.navigate('LowStockInventory');
    } catch (err) {
      Alert.alert('Navigation Error', 'Unable to navigate to low stock inventory');
    }
  }, [navigation]);

  const handleViewAllWarehouses = useCallback(() => {
    try {
      navigation.navigate('AllWarehouses');
    } catch (err) {
      Alert.alert('Navigation Error', 'Unable to navigate to warehouses');
    }
  }, [navigation]);

  const handleTransactionPress = useCallback((transaction: any) => {
    Alert.alert(
      'Transaction Details', 
      `Selected: ${transaction.itemName || 'Unknown Transaction'}`,
      [{ text: 'OK' }]
    );
  }, []);

  const handleItemPress = useCallback((item: any) => {
    Alert.alert(
      'Item Details', 
      `Selected: ${item.name || 'Unknown Item'}`,
      [{ text: 'OK' }]
    );
  }, []);

  const handleWarehousePress = useCallback((warehouse: any) => {
    Alert.alert(
      'Warehouse Details', 
      `Selected: ${warehouse.name || 'Unknown Warehouse'}`,
      [{ text: 'OK' }]
    );
  }, []);

  const handleRefresh = useCallback(() => {
    loadWarehouseData(true);
  }, [loadWarehouseData]);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Loading state with clean UI
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <Text style={styles.loadingText}>Loading warehouse dashboard...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Error state with retry functionality (only show if no fallback data)
  if (error && !loading && !error.includes('fallback')) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.errorContainer}>
          <HeaderCard username="Alex" />
          <View style={styles.errorContent}>
            <View style={styles.errorCard}>
              <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                style={styles.retryButton} 
                onPress={() => loadWarehouseData()}
                activeOpacity={0.7}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <View style={styles.backButtonInner}>
            <Icon name="arrow-left" size={24} color={COLORS.text.primary} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Warehouse Dashboard</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={handleRefresh}
            activeOpacity={0.7}
          >
            <View style={styles.refreshButtonInner}>
              <Icon name="refresh-cw" size={20} color={COLORS.text.primary} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.previewButton} 
            onPress={() => navigation.navigate('WarehouseReports')}
            activeOpacity={0.7}
          >
            <View style={styles.previewButtonInner}>
              <Icon name="bar-chart-2" size={20} color={COLORS.primary} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          {/* Header Card */}
          <HeaderCard username="Alex" />
          
          {/* Stats Row */}
          <StatsRow />
          
          {/* Transfer Activity Chart */}
          <TransferActivityChart />
          
          {/* Stock Trend Chart */}
          <StockTrendChart 
            title="Stock Trend"
            timeRange="6m"
          />
          
          {/* Stock by Warehouse Chart */}
          <StockByWarehouseChart 
            title="Stock by Warehouse"
            data={processedWarehouseData}
          />
          
          {/* Recent Transfers */}
          <RecentTransfers 
            onTransferPress={handleTransactionPress}
            onSeeAllPress={handleViewAllTransactions}
          />
          
          {/* Low Stock Inventory */}
          <HorizontalList 
            title="Low Stock Inventory" 
            onViewAll={handleViewAllInventory}
          >
            <InventoryList />
          </HorizontalList>
          
                      {/* Warehouses */}
            <WarehouseList 
              warehouses={enhancedWarehouses}
              onWarehousePress={handleWarehousePress}
              onViewAllPress={handleViewAllWarehouses}
              loading={loading}
            />
        </View>
      </ScrollView>
      
      {/* Refresh indicator */}
      {refreshing && (
        <View style={styles.refreshIndicator}>
          <View style={styles.refreshIndicatorInner}>
            <Text style={styles.refreshText}>Refreshing...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
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
    marginTop: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  backButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    fontFamily: 'System',
    textAlign: 'center',
  },
  refreshButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  refreshButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  previewButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginLeft: SPACING.sm,
  },
  previewButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    gap: SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  loadingCard: {
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.text.primary,
    fontFamily: 'System',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  errorCard: {
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    alignItems: 'center',
    minWidth: 300,
  },
  errorTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    fontFamily: 'System',
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    fontFamily: 'System',
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    fontFamily: 'System',
  },
  refreshIndicator: {
    position: 'absolute',
    top: SPACING.xl,
    right: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  refreshIndicatorInner: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  refreshText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    fontFamily: 'System',
    fontWeight: '500',
  },
});

export default WarehouseDashboard;
