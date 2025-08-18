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
      const [
        summaryRes,
        topSellingRes,
        transactionsRes,
        warehouseRes,
        monthlySalesRes,
      ] = await Promise.all([
        inventoryApiService.getSummary(),
        inventoryApiService.getSalesByProduct(),
        inventoryApiService.getTransactions({ limit: 3 }),
        inventoryApiService.getWarehouses(),
        inventoryApiService.getMonthlySalesSummary(),
      ]);

      setSummary(summaryRes.data);
      setProducts(topSellingRes.data);
      setTransactions(transactionsRes.data);

      // Attach image URL to each warehouse
      const updatedWarehouses = warehouseRes.data.slice(0, 10).map((wh, idx) => ({
        ...wh,
        imageUrl: `${UNSPLASH_IMAGES[idx % UNSPLASH_IMAGES.length]}&sig=${idx}`,
      }));
      setWarehouses(updatedWarehouses);

      const formattedChartData = Array.isArray(monthlySalesRes.data) ? monthlySalesRes.data.map((item) => ({
        value: item.total_sales,
        label: `${getMonthName(item.month)} ${item.year}`,
        dataPointText: `${item.total_sales} units`,
      })) : [];

      setChartData(formattedChartData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const getTopSellingProducts = () => products.slice(0, 4);
  const getRecentActivity = () => transactions.slice(0, 3);

  const handleProductPress = (product: Product) => {
    Alert.alert('Product Details', `Selected: ${product.name}`);
  };

  if (loading) {
    // Skeleton loading UI
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
          <TopSellingList
            products={getTopSellingProducts()}
            onPressProduct={handleProductPress}
            onViewAll={() => navigation.navigate('AllProducts')}
          />
        </View>

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
});
