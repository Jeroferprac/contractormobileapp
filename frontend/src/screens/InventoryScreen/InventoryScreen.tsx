import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/spacing';

import {
  SearchBar,
  Chart,
  Sidebar,
  BarcodeScanner,
  FadeSlideInView,
  LoadingSkeleton,
  StatsCardSkeleton,
  ChartSkeleton,
  ProductCardSkeleton,
  ListItemSkeleton,
} from '../../components/ui';

import {
  InventoryHeader,
  InventoryStats,
  TopSellingList,
  RecentActivityCard,
  WarehouseList,
  SupplierList,
  PriceListSection
} from '../../components/inventory';
import { SectionHeader } from '../../components/layout';

import {
  Product,
  InventorySummary,
  Transaction,
  Warehouse,
  Supplier,
} from '../../types/inventory';

import { InventoryScreenNavigationProp } from '../../types/navigation';
import inventoryApiService from '../../api/inventoryApi';

// Fallback Unsplash images for warehouses
const UNSPLASH_IMAGES = [
  'https://source.unsplash.com/800x600/?warehouse,storage',
  'https://source.unsplash.com/800x600/?logistics',
  'https://source.unsplash.com/800x600/?industrial',
  'https://source.unsplash.com/800x600/?factory',
  'https://source.unsplash.com/800x600/?cargo',
];

interface InventoryScreenProps {
  navigation: InventoryScreenNavigationProp;
}

const InventoryScreen: React.FC<InventoryScreenProps> = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [chartData, setChartData] = useState<
    { value: number; label: string; dataPointText: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  

  const [barcodeScannerVisible, setBarcodeScannerVisible] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    try {
      loadInventoryData();
    } catch (error) {
      console.error('Error in useEffect:', error);
      setHasError(true);
      setLoading(false);
    }
  }, []);

  // Debug sidebar state changes
  useEffect(() => {
    console.log('🔧 [DEBUG] SidebarVisible state changed to:', sidebarVisible);
  }, [sidebarVisible]);

  // Refresh data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadInventoryData();
    });

    return unsubscribe;
  }, [navigation]);

  const getMonthName = (monthNumber: number): string =>
    new Date(2000, monthNumber - 1).toLocaleString('default', { month: 'short' });

  const loadInventoryData = async () => {
    try {
      console.log('🔄 [InventoryScreen] Starting to load inventory data...');
      console.log('🌐 [InventoryScreen] API Base URL:', inventoryApiService['api'].defaults.baseURL);
      setLoading(true);
      
      // Add individual error handling for each API call
      const [
        summaryRes,
        topSellingRes,
        transactionsRes,
        suppliersRes,
        warehouseRes,
      ] = await Promise.all([
        inventoryApiService.getSummary().catch((error) => {
          console.error('❌ [InventoryScreen] Summary API error:', error);
          return { data: null };
        }),
        inventoryApiService.getSalesByProduct().catch((error) => {
          console.error('❌ [InventoryScreen] Products API error:', error);
          return { data: [] };
        }),
        inventoryApiService.getTransactions({ limit: 3 }).catch((error) => {
          console.error('❌ [InventoryScreen] Transactions API error:', error);
          return { data: [] };
        }),
        inventoryApiService.getSuppliers().catch((error) => {
          console.error('❌ [InventoryScreen] Suppliers API error:', error);
          return { data: [] };
        }),
        inventoryApiService.getWarehouses().catch((error) => {
          console.error('❌ [InventoryScreen] Warehouses API error:', error);
          return { data: [] };
        }),
      ]);

      setSummary(summaryRes.data);
      setProducts(topSellingRes.data || []);
      setTransactions(transactionsRes.data || []);
      setSuppliers(suppliersRes.data || []);
      
      console.log('📊 [InventoryScreen] Suppliers loaded:', suppliersRes.data?.length || 0);

      // Attach image URL to each warehouse
      const warehouseData = Array.isArray(warehouseRes.data) ? warehouseRes.data : [];
      const updatedWarehouses = warehouseData.map((wh, idx) => ({
        ...wh,
        imageUrl: `${UNSPLASH_IMAGES[idx % UNSPLASH_IMAGES.length]}&sig=${idx}`,
      }));
      setWarehouses(updatedWarehouses);
      
      const formattedChartData = []; // Chart data not available from current API calls
      setChartData(formattedChartData);
    } catch (error) {
      console.error('Error loading inventory data:', error);
      // Don't show alert, just set empty data
      setSummary(null);
      setProducts([]);
      setTransactions([]);
      setSuppliers([]);
      setWarehouses([]);
      setChartData([]);
      console.log('❌ [InventoryScreen] Error loading data, all data reset to empty');
    } finally {
      setLoading(false);
      console.log('🏁 [InventoryScreen] Finished loading inventory data');
    }
  };

  const getTopSellingProducts = () => products.slice(0, 4);
  const getRecentActivity = () => transactions.slice(0, 3);
  const getTopSuppliers = () => suppliers.slice(0, 4);

  const handleProductPress = (product: Product) => {
    Alert.alert('Product Details', `Selected: ${product.name}`);
  };

  const handleSupplierPress = (supplier: Supplier) => {
            navigation.navigate('SupplierDetailsScreen', { supplierId: supplier.id });
  };

  if (hasError) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <LinearGradient colors={COLORS.gradient.primary || ['#FF6B35', '#FF8C42']} style={styles.headerGradient}>
          <View style={styles.errorHeader}>
            <Text style={styles.errorTitle}>Inventory</Text>
          </View>
        </LinearGradient>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setHasError(false);
              setLoading(true);
              loadInventoryData();
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    // Skeleton loading UI
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <LinearGradient colors={COLORS.gradient.primary || ['#FF6B35', '#FF8C42']} style={styles.headerGradient}>
          <InventoryHeader
            onSidebarPress={() => setSidebarVisible(true)}
            onSettingsPress={() => Alert.alert('Settings', 'Coming soon')}
            onScanPress={() => setBarcodeScannerVisible(true)}
          />
          <View style={styles.searchWrapper}>
            <SearchBar
              placeholder="Search inventory..."
              value={searchText}
              onChangeText={setSearchText}
              onFilterPress={() => {}}
            />
          </View>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
          <View style={styles.section}><StatsCardSkeleton /></View>
          <View style={styles.section}><ChartSkeleton /></View>

          <SectionHeader title="Top Selling Products" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productsScrollContainer}>
            {[...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)}
          </ScrollView>

          <SectionHeader title="Warehouses" />
          <View style={styles.warehousesContainer}>
            {[...Array(3)].map((_, i) => (
              <LoadingSkeleton
                key={i}
                height={130}
                borderRadius={BORDER_RADIUS.lg}
                style={{ marginBottom: SPACING.sm }}
              />
            ))}
          </View>

          <SectionHeader title="Suppliers" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productsScrollContainer}>
            {[...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)}
          </ScrollView>

          <SectionHeader title="Recent Activity" />
          <View style={styles.activityContainer}>
            {[...Array(3)].map((_, i) => <ListItemSkeleton key={i} />)}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient colors={COLORS.gradient.primary || ['#FF6B35', '#FF8C42']} style={styles.headerGradient}>
        <InventoryHeader
          onSidebarPress={() => {
            console.log('🔧 [DEBUG] Sidebar button pressed, setting visible to true');
            console.log('🔧 [DEBUG] Current sidebarVisible state:', sidebarVisible);
            setSidebarVisible(true);
            console.log('🔧 [DEBUG] SidebarVisible set to true');
          }}
          onSettingsPress={() => Alert.alert('Settings', 'Coming soon')}
          onScanPress={() => setBarcodeScannerVisible(true)}
        />
        <View style={styles.searchWrapper}>
          <SearchBar
            placeholder="Search inventory..."
            value={searchText}
            onChangeText={setSearchText}
            onFilterPress={() => {}}
          />
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={styles.section}>
          {summary && <InventoryStats />}
        </View>

        <View style={styles.section}>
          <Chart title="Stock Report" data={chartData} height={200} showLegend />
        </View>

        <View style={styles.section}>
          <TopSellingList />
        </View>

      <SectionHeader
        title={`Warehouses (${warehouses.length})`}
        onViewAllPress={() => navigation.navigate('AllWarehouses')}
      />
      <WarehouseList 
        warehouses={warehouses} 
        loading={loading}
        onWarehousePress={(warehouse) => Alert.alert('Warehouse', `Selected: ${warehouse.name}`)}
        onViewAll={() => navigation.navigate('AllWarehouses')}
      />

      <SectionHeader
        title={`Suppliers (${suppliers.length})`}
        onViewAllPress={() => navigation.navigate('SuppliersScreen')}
      />
      <SupplierList 
        suppliers={suppliers} 
        loading={loading}
        onPressSupplier={handleSupplierPress}
        onViewAll={() => navigation.navigate('SuppliersScreen')}
      />

        <SectionHeader title="Recent Activity" />
        <View style={styles.activityContainer}>
          {getRecentActivity().map((transaction, index) => (
            <FadeSlideInView key={transaction.id} delay={index * 100}>
              <RecentActivityCard transaction={transaction} />
            </FadeSlideInView>
          ))}
        </View>
      </ScrollView>

      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        currentScreen="MainTabs"
        onNavigate={(screen) => {
          console.log('🔧 [DEBUG] InventoryScreen: Sidebar requesting navigation to:', screen);
          try {
            // Close sidebar first
            setSidebarVisible(false);
            // Navigate to the requested screen
            navigation.navigate(screen as any);
            console.log('✅ [DEBUG] InventoryScreen: Navigation successful to:', screen);
          } catch (error) {
            console.error('❌ [DEBUG] InventoryScreen: Navigation failed to:', screen, error);
            // Show error alert to user
            Alert.alert('Navigation Error', `Unable to navigate to ${screen}. Please try again.`);
          }
        }}
      />

      <BarcodeScanner
        visible={barcodeScannerVisible}
        onClose={() => setBarcodeScannerVisible(false)}
        onScan={(barcode) => Alert.alert('Scanned', barcode)}
      />
    </SafeAreaView>
  );
};

export default InventoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerGradient: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
    ...SHADOWS.lg,
  },
  searchWrapper: {
    paddingHorizontal: SPACING.lg,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  productsScrollContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  activityContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  warehousesContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  errorHeader: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.light,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.text.secondary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  retryButtonText: {
    color: COLORS.text.light,
    fontSize: 16,
    fontWeight: '600',
  },
});
