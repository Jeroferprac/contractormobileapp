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
  SupplierList
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
      setLoading(true);
      
      // Add fallback data in case API calls fail
      const fallbackSummary: InventorySummary = {
        total_products: 0,
        low_stock_items: 0,
        total_warehouses: 0,
        total_inventory_value: 0,
        out_of_stock_items: 0,
        recent_transactions: 0
      };
      
      const fallbackProducts: Product[] = [];
      const fallbackTransactions: Transaction[] = [];
      const fallbackWarehouses: Warehouse[] = [];
      const fallbackSuppliers: Supplier[] = [];

      const fallbackChartData: { value: number; label: string; dataPointText: string }[] = [];

      try {
              const [
        summaryRes,
        topSellingRes,
        transactionsRes,
          suppliersRes,
        warehouseRes,
        monthlySalesRes,
      ] = await Promise.all([
        inventoryApiService.getSummary().catch(() => ({ data: fallbackSummary })),
        inventoryApiService.getSalesByProduct().catch(() => ({ data: fallbackProducts })),
        inventoryApiService.getTransactions({ limit: 3 }).catch(() => ({ data: fallbackTransactions })),
          inventoryApiService.getSuppliers().catch(() => ({ data: fallbackSuppliers })),
        inventoryApiService.getWarehouses().catch(() => ({ data: fallbackWarehouses })),
        inventoryApiService.getMonthlySalesSummary().catch(() => ({ data: fallbackChartData })),
      ]);

        setSummary(summaryRes.data || fallbackSummary);
        setProducts(topSellingRes.data || fallbackProducts);
        setTransactions(transactionsRes.data || fallbackTransactions);
        setSuppliers(suppliersRes.data || fallbackSuppliers);

        // Attach image URL to each warehouse
        const warehouseData = warehouseRes.data || fallbackWarehouses;
        const updatedWarehouses = warehouseData.slice(0, 10).map((wh, idx) => ({
          ...wh,
          imageUrl: `${UNSPLASH_IMAGES[idx % UNSPLASH_IMAGES.length]}&sig=${idx}`,
        }));
        setWarehouses(updatedWarehouses);

        const monthlyData = monthlySalesRes.data || fallbackChartData;
        const formattedChartData = Array.isArray(monthlyData) ? monthlyData.map((item: any) => {
          // Safely handle month data with proper null checks
          let monthLabel = 'Unknown';
          if (item.month && typeof item.month === 'string' && item.month.includes('-')) {
            const monthParts = item.month.split('-');
            if (monthParts.length >= 2) {
              monthLabel = `${getMonthName(parseInt(monthParts[1]))} ${monthParts[0]}`;
            }
          }
          
          return {
          value: item.total_sales || item.sales || 0,
            label: monthLabel,
          dataPointText: `${item.total_sales || item.sales || 0} units`,
          };
        }) : [];

        setChartData(formattedChartData);
        console.log('✅ [InventoryScreen] Successfully loaded inventory data');
      } catch (apiError) {
        console.error('❌ [InventoryScreen] API Error:', apiError);
        // Use fallback data if all API calls fail
        setSummary(fallbackSummary);
        setProducts(fallbackProducts);
        setTransactions(fallbackTransactions);
        setWarehouses(fallbackWarehouses);
        setSuppliers(fallbackSuppliers);
        setChartData(fallbackChartData);
        console.log('🔄 [InventoryScreen] Using fallback data');
      }
    } catch (error) {
      console.error('❌ [InventoryScreen] Load inventory data error:', error);
      // Don't show alert, just use fallback data
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
    navigation.navigate('SupplierDetails', { supplierId: supplier.id });
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
            setSidebarVisible(true);
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
          <TopSellingList
            products={getTopSellingProducts()}
            onPressProduct={handleProductPress}
            onViewAll={() => navigation.navigate('AllProducts')}
          />
        </View>

        <SectionHeader
          title="Suppliers"
          onViewAllPress={() => navigation.navigate('Suppliers')}
        />
        <SupplierList
          suppliers={getTopSuppliers()}
          onPressSupplier={handleSupplierPress}
          onViewAll={() => navigation.navigate('Suppliers')}
          loading={loading}
        />

        <SectionHeader
          title="Warehouses"
          onViewAllPress={() => navigation.navigate('Warehouses')}
        />
        <WarehouseList 
          warehouses={warehouses} 
          loading={loading} 
          onWarehousePress={(warehouse) => Alert.alert('Warehouse', `Selected: ${warehouse.name}`)}
          onViewAll={() => navigation.navigate('Warehouses')}
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
        onNavigate={(screen) => {
          console.log('🔧 [DEBUG] InventoryScreen: Sidebar requesting navigation to:', screen);
          try {
            navigation.navigate(screen as any);
            console.log('✅ [DEBUG] InventoryScreen: Navigation successful to:', screen);
          } catch (error) {
            console.error('❌ [DEBUG] InventoryScreen: Navigation failed to:', screen, error);
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
