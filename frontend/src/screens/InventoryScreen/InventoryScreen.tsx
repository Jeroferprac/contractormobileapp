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
} from '../../components/ui';

import {
  InventoryHeader,
  InventoryStats,
  TopSellingList,
  RecentActivityCard,
  WarehouseList
} from '../../components/inventory';
import { SectionHeader } from '../../components/layout';

import {
  Product,
  InventorySummary,
  Transaction,
  Warehouse,
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
  const [chartData, setChartData] = useState<
    { value: number; label: string; dataPointText: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [barcodeScannerVisible, setBarcodeScannerVisible] = useState(false);

  useEffect(() => {
    loadInventoryData();
  }, []);

  const getMonthName = (monthNumber: number): string =>
    new Date(2000, monthNumber - 1).toLocaleString('default', { month: 'short' });

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      
      // Add individual error handling for each API call
      const [
        summaryRes,
        topSellingRes,
        transactionsRes,
        warehouseRes,
        monthlySalesRes,
      ] = await Promise.all([
        inventoryApiService.getSummary().catch(() => ({ data: null })),
        inventoryApiService.getSalesByProduct().catch(() => ({ data: [] })),
        inventoryApiService.getTransactions({ limit: 3 }).catch(() => ({ data: [] })),
        inventoryApiService.getWarehouses().catch(() => ({ data: [] })),
        inventoryApiService.getMonthlySalesSummary().catch(() => ({ 
          data: { 
            total_sales: 0, 
            total_revenue: 0, 
            average_order_value: 0, 
            top_selling_products: [], 
            monthly_trends: [] 
          } 
        })),
      ]);

      setSummary(summaryRes.data);
      setProducts(topSellingRes.data || []);
      setTransactions(transactionsRes.data || []);

      // Attach image URL to each warehouse
      const updatedWarehouses = (warehouseRes.data || []).slice(0, 10).map((wh, idx) => ({
        ...wh,
        imageUrl: `${UNSPLASH_IMAGES[idx % UNSPLASH_IMAGES.length]}&sig=${idx}`,
      }));
      setWarehouses(updatedWarehouses);
      
      const formattedChartData = (monthlySalesRes.data?.monthly_trends || []).map((item) => ({
        value: item.sales,
        label: `${getMonthName(parseInt(item.month.split('-')[1]))} ${item.month.split('-')[0]}`,
        dataPointText: `${item.sales} units`,
      }));
      setChartData(formattedChartData);
    } catch (error) {
      console.error('Error loading inventory data:', error);
      // Don't show alert, just set empty data
      setSummary(null);
      setProducts([]);
      setTransactions([]);
      setWarehouses([]);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  const getTopSellingProducts = () => products.slice(0, 4);
  const getRecentActivity = () => transactions.slice(0, 3);

  const handleProductPress = (product: Product) => {
    Alert.alert('Product Details', `Selected: ${product.name}`);
  };

  // Loading State - Keep header elements, only skeleton main content
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <LinearGradient colors={COLORS.gradient.primary} style={styles.headerGradient}>
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
          {/* Stats Cards Skeleton */}
          <View style={styles.section}>
            <View style={styles.statsSkeletonContainer}>
              {[...Array(4)].map((_, i) => (
                <View key={i} style={styles.statsSkeletonCard}>
                  <LoadingSkeleton width="100%" height={120} borderRadius={BORDER_RADIUS.lg} />
                </View>
              ))}
            </View>
          </View>

          {/* Chart Skeleton */}
          <View style={styles.section}>
            <LoadingSkeleton width="100%" height={200} borderRadius={BORDER_RADIUS.lg} />
          </View>

          {/* Top Selling Products Skeleton */}
          <SectionHeader title="Top Selling Products" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productsScrollContainer}>
            {[...Array(4)].map((_, i) => (
              <View key={i} style={styles.productSkeletonCard}>
                <LoadingSkeleton width={140} height={160} borderRadius={BORDER_RADIUS.lg} />
              </View>
            ))}
          </ScrollView>

          {/* Warehouses Skeleton */}
          <SectionHeader title="Warehouses" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.warehousesScrollContainer}>
            {[...Array(3)].map((_, i) => (
              <View key={i} style={styles.warehouseSkeletonCard}>
                <LoadingSkeleton width={280} height={200} borderRadius={BORDER_RADIUS.lg} />
              </View>
            ))}
          </ScrollView>

          {/* Recent Activity Skeleton */}
          <SectionHeader title="Recent Activity" />
          <View style={styles.activityContainer}>
            {[...Array(3)].map((_, i) => (
              <View key={i} style={styles.activitySkeletonItem}>
                <LoadingSkeleton width={40} height={40} borderRadius={20} />
                <View style={styles.activitySkeletonContent}>
                  <LoadingSkeleton width="70%" height={16} />
                  <LoadingSkeleton width="40%" height={12} style={{ marginTop: SPACING.xs }} />
                </View>
                <LoadingSkeleton width={60} height={16} />
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient colors={COLORS.gradient.primary} style={styles.headerGradient}>
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
        title="Warehouses"
        onViewAllPress={() => {
          console.log('🏢 [InventoryScreen] Pushing to AllWarehouses via SectionHeader View All');
          navigation.push('AllWarehouses');
        }}
      />
      <WarehouseList 
        warehouses={warehouses} 
        loading={loading}
        onWarehousePress={(warehouse) => {
          console.log('🏢 [InventoryScreen] Pushing to AllWarehouses with warehouse:', warehouse.name);
          navigation.push('AllWarehouses', { selectedWarehouse: warehouse });
        }}
        onViewAll={() => {
          console.log('🏢 [InventoryScreen] Pushing to AllWarehouses via View All');
          navigation.push('AllWarehouses');
        }}
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
        onNavigate={(screen) => navigation.navigate(screen as any)}
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
  // Skeleton Styles
  statsSkeletonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statsSkeletonCard: {
    width: '48%',
    marginBottom: SPACING.sm,
  },
  productSkeletonCard: {
    marginRight: SPACING.md,
  },
  warehousesScrollContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  warehouseSkeletonCard: {
    marginRight: SPACING.md,
  },
  activitySkeletonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  activitySkeletonContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
});
