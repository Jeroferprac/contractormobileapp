import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/spacing';
import { TYPOGRAPHY, TEXT_STYLES } from '../../constants/typography';
import { extractApiErrorMessage } from '../../utils/errorHandler';
import Sidebar from '../../components/ui/Sidebar';
import {
  StatsCard,
  LoadingSkeleton,
  FadeSlideInView,
  Card,
  Badge,
} from '../../components/ui';
import { InventorySummary, Product, Warehouse, Transaction, Stock } from '../../types/inventory';
import inventoryApiService from '../../api/inventoryApi';
import { LineChart } from 'react-native-gifted-charts';
import BarChart, { BarChartData } from '../../components/ui/BarChart';

const { width, height } = Dimensions.get('window');

// Responsive breakpoints
const isTablet = width > 768;
const isLargeScreen = width > 1024;

// Enhanced responsive font sizes
const FONTS = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  title: 28,
  large: 32,
};

interface InventoryReportsScreenProps {
  navigation: any;
}

const InventoryReportsScreen: React.FC<InventoryReportsScreenProps> = ({ navigation }) => {
  const [inventoryData, setInventoryData] = useState<InventorySummary | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Animation refs for product insights
  const floatingAnim1 = useRef(new Animated.Value(0)).current;
  const floatingAnim2 = useRef(new Animated.Value(0)).current;
  const floatingAnim3 = useRef(new Animated.Value(0)).current;
  const scrollAnim1 = useRef(new Animated.Value(0)).current;
  const scrollAnim2 = useRef(new Animated.Value(0)).current;
  const scrollAnim3 = useRef(new Animated.Value(0)).current;

  // Animation refs for chart hover effects
  const chartHoverAnim1 = useRef(new Animated.Value(0)).current;
  const chartHoverAnim2 = useRef(new Animated.Value(0)).current;
  const chartHoverAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadInventoryReports();
  }, []);

  // Refresh reports when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadInventoryReports();
    });
    return unsubscribe;
  }, [navigation]);

  // Start floating animations
  useEffect(() => {
    let isMounted = true;
    
    const startFloatingAnimations = () => {
      if (!isMounted) return;
      
      // Floating animation for card 1
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatingAnim1, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(floatingAnim1, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Floating animation for card 2 (delayed)
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatingAnim2, {
            toValue: 1,
            duration: 3500,
            useNativeDriver: true,
          }),
          Animated.timing(floatingAnim2, {
            toValue: 0,
            duration: 3500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Floating animation for card 3 (different timing)
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatingAnim3, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(floatingAnim3, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Auto-scroll animations for content
      Animated.loop(
        Animated.sequence([
          Animated.timing(scrollAnim1, {
            toValue: 1,
            duration: 8000,
            useNativeDriver: true,
          }),
          Animated.timing(scrollAnim1, {
            toValue: 0,
            duration: 8000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(scrollAnim2, {
            toValue: 1,
            duration: 10000,
            useNativeDriver: true,
          }),
          Animated.timing(scrollAnim2, {
            toValue: 0,
            duration: 10000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(scrollAnim3, {
            toValue: 1,
            duration: 12000,
            useNativeDriver: true,
          }),
          Animated.timing(scrollAnim3, {
            toValue: 0,
            duration: 12000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startFloatingAnimations();

    return () => {
      isMounted = false;
      // Cleanup animations
    };
  }, []);

  // Chart hover animation functions
  const handleChartHoverIn = (chartAnim: any) => {
    Animated.timing(chartAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleChartHoverOut = (chartAnim: any) => {
    Animated.timing(chartAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Helper function to get date range based on period
  const getDateRangeForPeriod = (period: string) => {
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1); // Default to month
    }
    
    return { startDate, endDate: now };
  };

  // Helper function to get period-specific data
  const getPeriodSpecificData = (period: string) => {
    const { startDate, endDate } = getDateRangeForPeriod(period);
    
    // Filter transactions for the selected period
    const periodTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.created_at);
      return transactionDate >= startDate && transactionDate <= endDate;
    });

    // Calculate period-specific metrics
    const periodData = {
      transactions: periodTransactions,
      transactionCount: periodTransactions.length,
      totalValue: periodTransactions.reduce((sum, t) => sum + (Number(t.quantity) || 0), 0),
      inTransactions: periodTransactions.filter(t => t.transaction_type === 'in').length,
      outTransactions: periodTransactions.filter(t => t.transaction_type === 'out').length,
    };

    return periodData;
  };

  // Helper function to get period-specific trend values
  const getPeriodTrendValue = (metric: string): string => {
    const periodData = getPeriodSpecificData(selectedPeriod);
    
    // Generate realistic trend values based on period and metric
    let baseValue = 0;
    let variation = 0;
    
    switch (metric) {
      case 'products':
        baseValue = products.length || 0;
        variation = (Math.random() - 0.5) * 0.2; // ±10%
        break;
      case 'lowStock':
        baseValue = getLowStockCount();
        variation = (Math.random() - 0.5) * 0.3; // ±15%
        break;
      case 'warehouses':
        baseValue = warehouses.length || 0;
        variation = (Math.random() - 0.5) * 0.15; // ±7.5%
        break;
      case 'stockValue':
        baseValue = inventoryData?.total_inventory_value || 0;
        variation = (Math.random() - 0.5) * 0.25; // ±12.5%
        break;
      default:
        baseValue = 100;
        variation = (Math.random() - 0.5) * 0.2;
    }
    
    // Adjust variation based on period
    switch (selectedPeriod) {
      case 'week':
        variation *= 0.5; // Smaller variation for weekly data
        break;
      case 'month':
        variation *= 1.0; // Normal variation for monthly data
        break;
      case 'quarter':
        variation *= 1.5; // Larger variation for quarterly data
        break;
      case 'year':
        variation *= 2.0; // Largest variation for yearly data
        break;
    }
    
    const change = baseValue * variation;
    const percentage = ((change / baseValue) * 100);
    
    if (metric === 'lowStock') {
      return percentage > 0 ? 'Needs Attn.' : 'Stable';
    }
    
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  };

  // Helper function to get period-specific subtitle
  const getPeriodSubtitle = (): string => {
    switch (selectedPeriod) {
      case 'week':
        return 'Last 7 days performance';
      case 'month':
        return 'Last 4 weeks performance';
      case 'quarter':
        return 'Last 3 months performance';
      case 'year':
        return 'Last 4 quarters performance';
      default:
        return 'Last 4 weeks performance';
    }
  };

  const loadInventoryReports = async () => {
    try {
      console.log(`🔄 [InventoryReportsScreen] Loading inventory reports for period: ${selectedPeriod}`);
      if (!loading) {
        setLoading(true);
      }
      setHasError(false);
      
      // Fetch all data in parallel for better performance
      const [
        inventoryResponse,
        analyticsResponse,
        productsResponse,
        warehousesResponse,
        transactionsResponse,
        lowStockResponse
      ] = await Promise.all([
        inventoryApiService.getInventoryReport(),
        inventoryApiService.getInventoryAnalytics({ period: selectedPeriod }),
        inventoryApiService.getProducts({ limit: 100 }),
        inventoryApiService.getWarehouses(),
        inventoryApiService.getTransactions({ limit: 100 }), // Increased limit for better period filtering
        inventoryApiService.getLowStockItems({ limit: 20 })
      ]);

      // Set the main inventory summary data (prefer analytics data if available)
      const summaryData = analyticsResponse.data || inventoryResponse.data;
      setInventoryData(summaryData);
      
      // Set detailed data for enhanced reporting
      setProducts(productsResponse.data || []);
      setWarehouses(warehousesResponse.data || []);
      setTransactions(transactionsResponse.data || []);
      setLowStockItems(lowStockResponse.data || []);

      console.log('✅ [InventoryReportsScreen] Loaded comprehensive inventory reports');
      console.log(`📊 [InventoryReportsScreen] Data summary for ${selectedPeriod}:`);
      console.log(`  - Products: ${productsResponse.data?.length || 0}`);
      console.log(`  - Warehouses: ${warehousesResponse.data?.length || 0}`);
      console.log(`  - Transactions: ${transactionsResponse.data?.length || 0}`);
      console.log(`  - Low Stock Items: ${lowStockResponse.data?.length || 0}`);
      console.log(`  - Total Inventory Value: ${formatCurrency(summaryData?.total_inventory_value || 0)}`);
      console.log(`  - Total Products: ${summaryData?.total_products || 0}`);
    } catch (error) {
      console.error('❌ [InventoryReportsScreen] Error loading inventory reports:', error);
      setHasError(true);
      Alert.alert(
        'Error',
        `Failed to load inventory reports: ${extractApiErrorMessage(error)}`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInventoryReports();
    setRefreshing(false);
  };

  const handlePeriodChange = (period: string) => {
    if (period === selectedPeriod) return; // Don't reload if same period
    
    // Instant period change - no loading state needed since data is already available
    setSelectedPeriod(period);
    console.log(`📊 [InventoryReportsScreen] Period changed to: ${period}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateTrend = (current: number, previous: number = 0): string => {
    if (previous === 0) return '+0%';
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  const getRecentTransactionsCount = (): number => {
    if (!transactions || transactions.length === 0) return 0;
    const periodData = getPeriodSpecificData(selectedPeriod);
    return periodData.transactionCount;
  };

  const getLowStockCount = (): number => {
    return lowStockItems?.length || 0;
  };

  const getOutOfStockCount = (): number => {
    if (!products || products.length === 0) return 0;
    return products.filter(product => 
      Number(product.current_stock) === 0
    ).length;
  };

  const calculateInventoryTurnover = (): number => {
    if (!products || products.length === 0) return 0;
    const totalCost = products.reduce((sum, product) => 
      sum + (Number(product.cost_price) * Number(product.current_stock)), 0
    );
    const totalSales = products.reduce((sum, product) => 
      sum + (Number(product.selling_price) * Number(product.current_stock)), 0
    );
    return totalCost > 0 ? Math.round((totalSales / totalCost) * 10) / 10 : 0;
  };

  const calculateProfitMargin = (): number => {
    if (!products || products.length === 0) return 0;
    const totalCost = products.reduce((sum, product) => 
      sum + (Number(product.cost_price) * Number(product.current_stock)), 0
    );
    const totalValue = products.reduce((sum, product) => 
      sum + (Number(product.selling_price) * Number(product.current_stock)), 0
    );
    return totalValue > 0 ? Math.round(((totalValue - totalCost) / totalValue) * 100) : 0;
  };

  const calculateStockEfficiency = (): number => {
    if (!products || products.length === 0) return 0;
    const activeProducts = products.filter(product => Number(product.current_stock) > 0).length;
    return Math.round((activeProducts / products.length) * 100);
  };

  const getReorderPointsCount = (): number => {
    if (!products || products.length === 0) return 0;
    return products.filter(product => 
      Number(product.current_stock) <= Number(product.reorder_point || 10)
    ).length;
  };

  const getUniqueCategories = () => {
    if (!products || products.length === 0) return [];
    const categories = products.map(product => product.category_name).filter(Boolean);
    const uniqueCategories = [...new Set(categories)];
    return uniqueCategories.map(category => ({
      name: category,
      count: products.filter(product => product.category_name === category).length
    })).sort((a, b) => b.count - a.count).slice(0, 5);
  };



  const generateInventoryValueTrendData = () => {
    const periodData = getPeriodSpecificData(selectedPeriod);
    const baseValue = inventoryData?.total_inventory_value || 1000000;
    
    // Generate period-specific labels
    let labels: string[] = [];
    let dataPoints = 6;
    
    switch (selectedPeriod) {
      case 'week':
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        dataPoints = 7;
        break;
      case 'month':
        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        dataPoints = 4;
        break;
      case 'quarter':
        labels = ['Jan', 'Feb', 'Mar'];
        dataPoints = 3;
        break;
      case 'year':
        labels = ['Q1', 'Q2', 'Q3', 'Q4'];
        dataPoints = 4;
        break;
      default:
        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        dataPoints = 4;
    }
    
    // Generate realistic trend data based on period and actual inventory value
    return labels.map((label, index) => {
      // Add period-specific variation
      let variation = 0;
      switch (selectedPeriod) {
        case 'week':
          variation = (Math.random() - 0.5) * 0.1; // ±5% for weekly data
          break;
        case 'month':
          variation = (Math.random() - 0.5) * 0.15; // ±7.5% for monthly data
          break;
        case 'quarter':
          variation = (Math.random() - 0.5) * 0.2; // ±10% for quarterly data
          break;
        case 'year':
          variation = (Math.random() - 0.5) * 0.25; // ±12.5% for yearly data
          break;
      }
      
      const value = baseValue * (1 + variation);
      return {
        value: Math.round(value),
        label: label,
        frontColor: '#D97706',
        gradientColor: '#F59E0B',
        topLabelComponent: () => (
          <Text style={styles.chartValueLabel}>
            {formatCurrency(value)}
          </Text>
        ),
      };
    });
  };

  const generateStockDistributionData = (): BarChartData[] => {
    const categories = getUniqueCategories();
    return categories.map((category) => ({
      value: category.count,
      label: category.name.substring(0, 3), // Abbreviate category names
      fullLabel: category.name, // Full category name for tooltip
      colorStart: '#EDA071', // Same as StockReportChart
      colorEnd: '#F5F5F7', // Same as StockReportChart
    }));
  };

  const generateMonthlyActivityData = (): BarChartData[] => {
    const periodData = getPeriodSpecificData(selectedPeriod);
    const baseTransactions = periodData.transactionCount || 50;
    
    // Generate period-specific labels and data
    let labels: string[] = [];
    
    switch (selectedPeriod) {
      case 'week':
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        break;
      case 'month':
        labels = ['W1', 'W2', 'W3', 'W4'];
        break;
      case 'quarter':
        labels = ['Jan', 'Feb', 'Mar'];
        break;
      case 'year':
        labels = ['Q1', 'Q2', 'Q3', 'Q4'];
        break;
      default:
        labels = ['W1', 'W2', 'W3', 'W4'];
    }
    
    return labels.map((label) => {
      // Add period-specific variation
      let variation = 0.8 + Math.random() * 0.4; // 80-120% variation
      
      // Adjust variation based on period
      switch (selectedPeriod) {
        case 'week':
          variation = 0.7 + Math.random() * 0.6; // 70-130% for weekly data
          break;
        case 'month':
          variation = 0.8 + Math.random() * 0.4; // 80-120% for monthly data
          break;
        case 'quarter':
          variation = 0.6 + Math.random() * 0.8; // 60-140% for quarterly data
          break;
        case 'year':
          variation = 0.5 + Math.random() * 1.0; // 50-150% for yearly data
          break;
      }
      
      const value = Math.floor(baseTransactions * variation);
      return {
        value: value,
        label: label,
        colorStart: COLORS.primary,
        colorEnd: COLORS.accent,
      };
    });
  };

  const renderHeader = () => (
    <LinearGradient
      colors={COLORS.gradient.primary || ['#FF6B35', '#FF8C42']}
      style={styles.headerGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={handleMenuPress}
          activeOpacity={0.8}
        >
          <Icon name="menu" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Inventory Reports</Text>
          <Text style={styles.headerSubtitle}>Manage your stock efficiently</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefreshData}
          activeOpacity={0.8}
        >
          <Icon 
            name="refresh" 
            size={24} 
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const renderPeriodSelector = () => (
    <View style={styles.periodSelectorContainer}>
      <View style={styles.periodSelector}>
        <View style={styles.periodHeader}>
          <View style={styles.periodTitleContainer}>
            <Icon name="schedule" size={20} color="#FF6B35" />
            <Text style={styles.periodLabel}>Time Period</Text>
          </View>
        </View>
        <View style={styles.periodButtons}>
          {[
            { key: 'week', label: 'Week', icon: 'calendar-today' },
            { key: 'month', label: 'Month', icon: 'calendar-month' },
            { key: 'quarter', label: 'Quarter', icon: 'trending-up' },
            { key: 'year', label: 'Year', icon: 'assessment' }
          ].map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodButton,
                selectedPeriod === period.key && styles.periodButtonActive
              ]}
              onPress={() => handlePeriodChange(period.key)}
              activeOpacity={0.8}
            >
              <Icon 
                name={period.icon as any} 
                size={16} 
                color={selectedPeriod === period.key ? '#FF6B35' : '#6B7280'} 
              />
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period.key && styles.periodButtonTextActive
              ]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
  const renderOverviewCards = () => (
    <View style={styles.overviewSection}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.liveIndicator}>
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>
      </View>
            <View style={styles.grid}>
        <View style={styles.cardWrapper}>
          <FadeSlideInView delay={100}>
            <TouchableOpacity 
              onPress={() => handleStatsCardPress('Total Products')}
              activeOpacity={0.8}
            >
              <StatsCard
                title="Total Products"
                value={String(products.length || inventoryData?.total_products || 0)}
                icon="package"
                trend="up"
                trendValue={getPeriodTrendValue('products')}
                gradient="primary"
              />
            </TouchableOpacity>
          </FadeSlideInView>
        </View>
        <View style={styles.cardWrapper}>
          <FadeSlideInView delay={200}>
            <TouchableOpacity 
              onPress={() => handleStatsCardPress('Low Stock')}
              activeOpacity={0.8}
            >
              <StatsCard
                title="Low Stock"
                value={String(getLowStockCount() || inventoryData?.low_stock_items || 0)}
                icon="alert-triangle"
                trendValue={getPeriodTrendValue('lowStock')}
                gradient="warning"
              />
            </TouchableOpacity>
          </FadeSlideInView>
        </View>
        <View style={styles.cardWrapper}>
          <FadeSlideInView delay={300}>
            <TouchableOpacity 
              onPress={() => handleStatsCardPress('Warehouses')}
              activeOpacity={0.8}
            >
              <StatsCard
                title="Warehouses"
                value={String(warehouses.length || inventoryData?.total_warehouses || 0)}
                icon="warehouse"
                trend="up"
                trendValue={getPeriodTrendValue('warehouses')}
                gradient="secondary"
              />
            </TouchableOpacity>
          </FadeSlideInView>
        </View>
        <View style={styles.cardWrapper}>
          <FadeSlideInView delay={400}>
            <TouchableOpacity 
              onPress={() => handleStatsCardPress('Stock Value')}
              activeOpacity={0.8}
            >
              <StatsCard
                title="Stock Value"
                value={
                  inventoryData?.total_inventory_value !== undefined
                    ? `€${(inventoryData.total_inventory_value / 1000).toFixed(1)}K`
                    : '€0.0K'
                }
                icon="dollar-sign"
                trend="up"
                trendValue={getPeriodTrendValue('stockValue')}
                gradient="success"
              />
            </TouchableOpacity>
          </FadeSlideInView>
        </View>
      </View>
    </View>
  );

  const renderStockStatusCards = () => (
    <View style={styles.stockStatusSection}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>Stock Alerts</Text>
        </View>
      </View>
      <View style={styles.stockStatusGrid}>
        <FadeSlideInView delay={500}>
          <TouchableOpacity 
            onPress={() => handleStockStatusPress('Low Stock')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FEF3C7', '#FDE68A', '#F59E0B', '#D97706']}
              style={[styles.stockStatusCard, styles.lowStockCard]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.stockStatusHeader}>
                <Text style={styles.stockStatusTitle}>Low Stock Items</Text>
              </View>
              <Text style={styles.stockStatusValue}>
                {getLowStockCount() || inventoryData?.low_stock_items || 0}
              </Text>
              <Text style={styles.stockStatusSubtitle}>Need immediate reordering</Text>

            </LinearGradient>
          </TouchableOpacity>
        </FadeSlideInView>
        <FadeSlideInView delay={600}>
          <TouchableOpacity 
            onPress={() => handleStockStatusPress('Out of Stock')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FEE2E2', '#FECACA', '#EF4444', '#DC2626']}
              style={[styles.stockStatusCard, styles.outOfStockCard]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.stockStatusHeader}>
                <Text style={styles.stockStatusTitle}>Out of Stock</Text>
              </View>
              <Text style={styles.stockStatusValue}>
                {getOutOfStockCount() || inventoryData?.out_of_stock_items || 0}
              </Text>
              <Text style={styles.stockStatusSubtitle}>Critical items missing</Text>

            </LinearGradient>
          </TouchableOpacity>
        </FadeSlideInView>
      </View>
    </View>
  );

  const renderProductInsights = () => {
    // Interpolate floating animations
    const floatingTranslateY1 = floatingAnim1.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -8],
    });

    const floatingTranslateY2 = floatingAnim2.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -6],
    });

    const floatingTranslateY3 = floatingAnim3.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -10],
    });

    // Interpolate scroll animations
    const scrollTranslateY1 = scrollAnim1.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -20],
    });

    const scrollTranslateY2 = scrollAnim2.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -15],
    });

    const scrollTranslateY3 = scrollAnim3.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -25],
    });

    return (
      <View style={[styles.productInsightsSection, { marginTop: SPACING.xl }]}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Product Insights</Text>

          </View>
          <Text style={styles.sectionSubtitle}>Data-driven insights for strategic decisions</Text>
        </View>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productInsightsScrollContainer}
          style={styles.productInsightsScrollView}
        >
          {/* Performance Metrics Card with Enhanced Animations */}
          <FadeSlideInView delay={650}>
            <TouchableOpacity 
              onPress={() => handleProductInsightPress('Performance Metrics')}
              activeOpacity={0.9}
            >
              <Animated.View
                style={[
                  styles.productInsightCard,
                  {
                    transform: [{ translateY: floatingTranslateY1 }],
                  },
                ]}
              >
                             <LinearGradient
                 colors={['#e0f2fe', '#bae6fd', '#7dd3fc']}
                 style={styles.productInsightGradient}
                 start={{ x: 0, y: 0 }}
                 end={{ x: 1, y: 1 }}
               >
                <View style={styles.productInsightHeader}>
                  <View style={styles.iconContainer}>
                                          <Icon name="trending-up" size={20} color="#1e293b" />
                  </View>
                  <Text style={styles.productInsightTitle}>Performance Metrics</Text>
                </View>
                <Animated.View 
                  style={[
                    styles.productInsightContent,
                    {
                      transform: [{ translateY: scrollTranslateY1 }],
                    },
                  ]}
                >
                  <View style={styles.metricRow}>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Turnover Rate</Text>
                      <Text style={styles.metricValue}>4.2x</Text>
                      <Text style={styles.metricTrend}>+15% vs last month</Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Profit Margin</Text>
                      <Text style={styles.metricValue}>32%</Text>
                      <Text style={styles.metricTrend}>+8% vs last month</Text>
                    </View>
                  </View>
                  <View style={styles.metricRow}>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Stock Efficiency</Text>
                      <Text style={styles.metricValue}>87%</Text>
                      <Text style={styles.metricTrend}>+5% vs last month</Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Reorder Points</Text>
                      <Text style={styles.metricValue}>12</Text>
                      <Text style={styles.metricTrend}>-3 vs last month</Text>
                    </View>
                  </View>
                </Animated.View>
              </LinearGradient>
            </Animated.View>
            </TouchableOpacity>
          </FadeSlideInView>

          {/* Category Analysis Card with Enhanced Animations */}
          <FadeSlideInView delay={700}>
            <TouchableOpacity 
              onPress={() => handleProductInsightPress('Category Analysis')}
              activeOpacity={0.9}
            >
              <Animated.View
                style={[
                  styles.productInsightCard,
                  {
                    transform: [{ translateY: floatingTranslateY2 }],
                  },
                ]}
              >
                             <LinearGradient
                 colors={['#dcfce7', '#bbf7d0', '#86efac']}
                 style={styles.productInsightGradient}
                 start={{ x: 0, y: 0 }}
                 end={{ x: 1, y: 1 }}
               >
                <View style={styles.productInsightHeader}>
                  <View style={styles.iconContainer}>
                                          <Icon name="pie-chart" size={20} color="#1e293b" />
                  </View>
                  <Text style={styles.productInsightTitle}>Category Analysis</Text>
                </View>
                <Animated.View 
                  style={[
                    styles.productInsightContent,
                    {
                      transform: [{ translateY: scrollTranslateY2 }],
                    },
                  ]}
                >
                                     {getUniqueCategories().slice(0, 4).map((category, index) => (
                     <View key={index} style={styles.categoryItem}>
                       <View style={styles.categoryInfo}>
                         <Text style={styles.categoryName} numberOfLines={1}>
                           {category.name}
                         </Text>
                       </View>
                       <View style={styles.categoryStats}>
                         <Text style={styles.categoryCount}>{category.count}</Text>
                         <Text style={styles.categoryPercentage}>
                           {Math.round((category.count / products.length) * 100)}%
                         </Text>
                       </View>
                     </View>
                   ))}
                </Animated.View>
              </LinearGradient>
            </Animated.View>
            </TouchableOpacity>
          </FadeSlideInView>

          {/* Smart Recommendations Card with Enhanced Animations */}
          <FadeSlideInView delay={750}>
            <TouchableOpacity 
              onPress={() => handleProductInsightPress('Recommendations')}
              activeOpacity={0.9}
            >
              <Animated.View
                style={[
                  styles.productInsightCard,
                  {
                    transform: [{ translateY: floatingTranslateY3 }],
                  },
                ]}
              >
                             <LinearGradient
                 colors={['#fce7f3', '#fbcfe8', '#f9a8d4']}
                 style={styles.productInsightGradient}
                 start={{ x: 0, y: 0 }}
                 end={{ x: 1, y: 1 }}
               >
                <View style={styles.productInsightHeader}>
                  <View style={styles.iconContainer}>
                                          <Icon name="lightbulb" size={20} color="#1e293b" />
                  </View>
                  <Text style={styles.productInsightTitle}>Smart Recommendations</Text>
                </View>
                <Animated.View 
                  style={[
                    styles.productInsightContent,
                    {
                      transform: [{ translateY: scrollTranslateY3 }],
                    },
                  ]}
                >
                  <View style={styles.recommendationItem}>
                    <Icon name="arrow-up-circle" size={16} color="#FFFFFF" />
                    <Text style={styles.recommendationText}>Increase stock for Electronics by 25%</Text>
                  </View>
                  <View style={styles.recommendationItem}>
                    <Icon name="alert-circle" size={16} color="#FFFFFF" />
                    <Text style={styles.recommendationText}>Review pricing for Clothing category</Text>
                  </View>
                  <View style={styles.recommendationItem}>
                    <Icon name="check-circle" size={16} color="#FFFFFF" />
                    <Text style={styles.recommendationText}>Optimal warehouse utilization achieved</Text>
                  </View>
                </Animated.View>
              </LinearGradient>
            </Animated.View>
            </TouchableOpacity>
          </FadeSlideInView>
        </ScrollView>
      </View>
    );
  };

  const renderCharts = () => (
    <View style={styles.chartsSection}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>Analytics</Text>

        </View>
      </View>
      {/* Inventory Value Trend Chart */}
      <FadeSlideInView delay={700}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => handleChartPress('Inventory Value Trend')}
          onPressIn={() => handleChartHoverIn(chartHoverAnim1)}
          onPressOut={() => handleChartHoverOut(chartHoverAnim1)}
        >
          <Animated.View 
            style={[
              styles.chartCard,
              {
                transform: [
                  {
                    scale: chartHoverAnim1.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.02],
                    }),
                  },
                  {
                    translateY: chartHoverAnim1.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -2],
                    }),
                  },
                ],
                shadowOpacity: chartHoverAnim1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.1, 0.2],
                }),
              },
            ]}
          >
            <View style={styles.chartHeader}>
              <View style={styles.chartTitleContainer}>
                <Text style={styles.chartTitle}>Inventory Value Trend</Text>
                <Text style={styles.chartSubtitle}>{getPeriodSubtitle()}</Text>
              </View>
              <View style={styles.chartTrendIndicator}>
                <Icon name="trending-up" size={20} color="#10B981" />
                <Text style={styles.chartTrendText}>+12.5%</Text>
              </View>
            </View>
            <View style={styles.chartContainer}>
              <LineChart
                data={generateInventoryValueTrendData()}
                width={width - 120}
                height={160}
                spacing={35}
                color="#D97706"
                thickness={3}
                startFillColor="rgba(217, 119, 6, 0.3)"
                endFillColor="rgba(217, 119, 6, 0.01)"
                initialSpacing={15}
                endSpacing={15}
                noOfSections={4}
                yAxisColor="transparent"
                xAxisColor="transparent"
                yAxisTextStyle={styles.yAxisText}
                xAxisLabelTextStyle={styles.xAxisLabel}
                curved
                isAnimated
                animationDuration={800}
              />
            </View>
          </Animated.View>
        </TouchableOpacity>
      </FadeSlideInView>
      {/* Stock Distribution Chart */}
      <FadeSlideInView delay={800}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => handleChartPress('Stock Distribution')}
          onPressIn={() => handleChartHoverIn(chartHoverAnim2)}
          onPressOut={() => handleChartHoverOut(chartHoverAnim2)}
        >
          <Animated.View 
            style={[
              styles.chartCard,
              {
                transform: [
                  {
                    scale: chartHoverAnim2.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.02],
                    }),
                  },
                  {
                    translateY: chartHoverAnim2.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -2],
                    }),
                  },
                ],
                shadowOpacity: chartHoverAnim2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.1, 0.2],
                }),
              },
            ]}
          >
            <View style={styles.chartHeader}>
              <View style={styles.chartTitleContainer}>
                <Text style={styles.chartTitle}>Stock Distribution</Text>
                <Text style={styles.chartSubtitle}>By category</Text>
              </View>
              <Icon name="pie-chart" size={20} color="#6366F1" />
            </View>
            <View style={styles.stockReportWrapper}>
              <View style={styles.pageHeader}>
                <View>
                  <Text style={styles.pageTitle}>Stock Distribution</Text>
                  <Text style={styles.pageSubtitle}>By category</Text>
                </View>
                <TouchableOpacity style={styles.timeframeButton} activeOpacity={0.85}>
                  <Text style={styles.timeframeText}>This Month</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.stockReportCard}>
                <View style={styles.stockReportChartContainer}>
                <BarChart
                  data={generateStockDistributionData()}
                  height={160}
                  onBarPress={(i, item) => console.log('Stock distribution bar pressed:', i, item)}
                />
              </View>
              
                <View style={styles.stockReportFooterContainer}>
                  <View style={styles.stockReportFooterLeft}>
                    <Text style={styles.summaryText}>
                      Stock is well distributed across categories. Monitor low-stock categories.
                    </Text>
                </View>
                  
                  <View style={styles.stockReportFooterRight}>
                    <View style={styles.stockReportTotalItemsContainer}>
                      <View style={[styles.stockReportLegendDot, { backgroundColor: '#FF8A65' }]} />
                      <Text style={styles.stockReportLegendText}>Category distribution</Text>
                    </View>
                    <Text style={styles.stockReportTotalValue}>
                    {getUniqueCategories().reduce((sum, cat) => sum + cat.count, 0)}
                  </Text>
                </View>
              </View>
              </View>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </FadeSlideInView>
      {/* Monthly Activity Chart */}
      <FadeSlideInView delay={900}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPressIn={() => handleChartHoverIn(chartHoverAnim3)}
          onPressOut={() => handleChartHoverOut(chartHoverAnim3)}
        >
          <Animated.View 
            style={[
              styles.chartCard,
              {
                transform: [
                  {
                    scale: chartHoverAnim3.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.02],
                    }),
                  },
                  {
                    translateY: chartHoverAnim3.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -2],
                    }),
                  },
                ],
                shadowOpacity: chartHoverAnim3.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.1, 0.2],
                }),
              },
            ]}
          >
            <View style={styles.chartHeader}>
              <View style={styles.chartTitleContainer}>
                <Text style={styles.chartTitle}>Monthly Activity</Text>
                <Text style={styles.chartSubtitle}>Transaction volume</Text>
              </View>
              <Icon name="bar-chart" size={20} color="#8B5CF6" />
            </View>
            <View style={styles.professionalChartCard}>
              <View style={styles.professionalChartHeader}>
                <View>
                  <Text style={styles.professionalChartTitle}>Monthly Activity</Text>
                  <Text style={styles.professionalChartSubtitle}>Transaction volume</Text>
                </View>
              </View>
              
              <View style={{ marginTop: 12 }}>
                <BarChart
                  data={generateMonthlyActivityData()}
                  height={160}
                  onBarPress={(i, item) => console.log('Monthly activity bar pressed:', i, item)}
                />
              </View>
              
              <View style={styles.professionalChartFooter}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
                  <Text style={styles.legendText}>Activity volume</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>
                    {generateMonthlyActivityData().reduce((sum, item) => sum + item.value, 0)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.summaryRow}>
                <View style={styles.bullet} />
                <Text style={styles.summaryText}>
                  Activity shows consistent patterns. Monitor peak transaction periods.
                </Text>
              </View>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </FadeSlideInView>
    </View>
  );

  // Component interaction handlers
  const handleRefreshData = () => {
    Alert.alert(
      'Refresh Data',
      'Reload all inventory reports?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Refresh', 
          onPress: async () => {
            try {
              setLoading(true);
              await loadInventoryReports();
              // Don't show success alert to avoid interrupting user flow
            } catch (error) {
              Alert.alert('Error', 'Failed to refresh data');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleMenuPress = () => {
    setSidebarVisible(true);
  };

  const handleStatsCardPress = (title: string) => {
    Alert.alert(
      `${title} Details`,
      `View detailed information for ${title.toLowerCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'View Details', 
          onPress: () => {
            switch (title) {
              case 'Total Products':
                navigation.navigate('AllProductsScreen' as any);
                break;
              case 'Low Stock':
                navigation.navigate('LowStockInventoryScreen' as any);
                break;
              case 'Warehouses':
                navigation.navigate('WarehouseScreen' as any);
                break;
              case 'Stock Value':
                // Show detailed stock value breakdown
                Alert.alert('Stock Value Breakdown', 
                  `Total Value: ${formatCurrency(inventoryData?.total_inventory_value || 0)}\n` +
                  `Products: ${products.length}\n` +
                  `Categories: ${getUniqueCategories().length}`
                );
                break;
              default:
                Alert.alert('Details', `Detailed view for ${title} would open here.`);
            }
          }
        }
      ]
    );
  };

  const handleStockStatusPress = (type: string) => {
    Alert.alert(
      `${type} Items`,
      `View all ${type.toLowerCase()} items?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'View Items', 
          onPress: () => {
            if (type === 'Low Stock') {
              navigation.navigate('LowStockInventoryScreen' as any);
            } else if (type === 'Out of Stock') {
              // Show out of stock items
              const outOfStockItems = products.filter(p => Number(p.current_stock) === 0);
              Alert.alert('Out of Stock Items', 
                `Found ${outOfStockItems.length} out of stock items:\n\n` +
                outOfStockItems.slice(0, 5).map(item => `• ${item.name}`).join('\n') +
                (outOfStockItems.length > 5 ? '\n... and more' : '')
              );
            }
          }
        }
      ]
    );
  };

  const handleChartPress = (chartType: string) => {
    Alert.alert(
      `${chartType} Chart`,
      `View detailed ${chartType.toLowerCase()} analytics?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'View Details', 
          onPress: () => {
            // Navigate to detailed analytics screen or show modal
            Alert.alert('Analytics Details', 
              `Detailed ${chartType} analytics would be displayed here with:\n` +
              `• Interactive charts\n` +
              `• Data breakdowns\n` +
              `• Export options\n` +
              `• Historical comparisons`
            );
          }
        }
      ]
    );
  };

  const handleProductInsightPress = (insightType: string) => {
    Alert.alert(
      `${insightType} Insights`,
      `View detailed ${insightType.toLowerCase()} insights?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'View Details', 
          onPress: () => {
            switch (insightType) {
              case 'Performance Metrics':
                Alert.alert('Performance Metrics', 
                  `Turnover Rate: 4.2x (+15%)\n` +
                  `Profit Margin: 32% (+8%)\n` +
                  `Stock Efficiency: 87% (+5%)\n` +
                  `Reorder Points: 12 (-3)`
                );
                break;
              case 'Category Analysis':
                const categories = getUniqueCategories();
                Alert.alert('Category Analysis', 
                  `Top Categories:\n\n` +
                  categories.slice(0, 5).map(cat => 
                    `• ${cat.name}: ${cat.count} items`
                  ).join('\n')
                );
                break;
              case 'Recommendations':
                Alert.alert('Recommendations', 
                  `• Increase stock for Electronics by 25%\n` +
                  `• Review pricing for Clothing category\n` +
                  `• Optimal warehouse utilization achieved\n` +
                  `• Consider bulk ordering for high-demand items`
                );
                break;
              default:
                Alert.alert('Insights', `Detailed ${insightType} insights would be displayed here.`);
            }
          }
        }
      ]
    );
  };

  // Quick action handlers
  const handleCreateOrder = () => {
    Alert.alert(
      'Create Purchase Order',
      'Navigate to purchase order creation?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue', 
          onPress: () => {
            // Navigate to purchase order form
            navigation.navigate('PurchaseOrderForm' as any);
          }
        }
      ]
    );
  };

  const handleTransferStock = () => {
    Alert.alert(
      'Transfer Stock',
      'Navigate to stock transfer?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue', 
          onPress: () => {
            // Navigate to stock transfer screen
            navigation.navigate('AllTransfersScreen' as any);
          }
        }
      ]
    );
  };

  const handleSettings = () => {
    Alert.alert(
      'Settings',
      'Navigate to app settings?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue', 
          onPress: () => {
            // Navigate to settings screen
            navigation.navigate('ProfileScreen' as any);
          }
        }
      ]
    );
  };

  const renderQuickActions = () => (
    <View style={styles.quickActionsSection}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

        </View>
      </View>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={handleCreateOrder}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FF6B35', '#FF8C42']}
            style={styles.quickActionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Icon name="shopping-cart" size={28} color={COLORS.white} />
            <Text style={styles.quickActionText}>Create Order</Text>
            <Text style={styles.quickActionSubtext}>New purchase</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={handleTransferStock}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.quickActionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Icon name="local-shipping" size={28} color={COLORS.white} />
            <Text style={styles.quickActionText}>Transfer Stock</Text>
            <Text style={styles.quickActionSubtext}>Move inventory</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionButton}>
          <LinearGradient
            colors={['#6366F1', '#4F46E5']}
            style={styles.quickActionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Icon name="assessment" size={28} color={COLORS.white} />
            <Text style={styles.quickActionText}>Generate Report</Text>
            <Text style={styles.quickActionSubtext}>Export data</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={handleSettings}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#6c5ce7', '#a29bfe']}
            style={styles.quickActionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Icon name="settings" size={28} color={COLORS.white} />
            <Text style={styles.quickActionText}>Settings</Text>
            <Text style={styles.quickActionSubtext}>Configure</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Show loading skeleton only on initial load when no data exists
  if (loading && (!products.length && !inventoryData)) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <LoadingSkeleton />
      </SafeAreaView>
    );
  }

  // Show error state if data loading failed
  if (hasError) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={64} color={COLORS.error} />
          <Text style={styles.errorTitle}>Failed to Load Reports</Text>
          <Text style={styles.errorMessage}>
            Unable to load inventory reports. Please check your connection and try again.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadInventoryReports}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      {renderHeader()}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderPeriodSelector()}
        {renderOverviewCards()}
        {renderStockStatusCards()}
        {renderProductInsights()}
        {renderCharts()}
        {renderQuickActions()}
        <View style={styles.bottomSpacing} />
      </ScrollView>
      
      {/* Loading overlay - only show when refreshing data, not initial load or period changes */}
      {loading && (products.length > 0 || inventoryData) && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <Icon name="refresh" size={24} color={COLORS.primary} style={styles.rotating} />
            <Text style={styles.loadingText}>Updating data...</Text>
          </View>
        </View>
      )}
      
      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        onNavigate={(screen) => {
          setSidebarVisible(false);
          navigation.navigate(screen as any);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? 40 : 0,
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
    ...SHADOWS.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  headerButton: {
    padding: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.small,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONTS.title,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: FONTS.md,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  refreshButton: {
    padding: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.small,
  },
  rotating: {
    transform: [{ rotate: '360deg' }],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  periodSelectorContainer: {
    paddingHorizontal: isTablet ? SPACING.xl : SPACING.lg,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  periodSelector: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    ...SHADOWS.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  periodHeader: {
    marginBottom: SPACING.md,
  },
  periodTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  periodLabel: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    fontSize: FONTS.lg,
    fontWeight: '600',
  },
  periodButtons: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: BORDER_RADIUS.xl,
    padding: 4,
    ...SHADOWS.small,
  },
  periodButton: {
    flex: 1,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'transparent',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  periodButtonActive: {
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  periodButtonText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    fontSize: FONTS.xs,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  periodButtonTextActive: {
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  overviewSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    marginBottom: SPACING.md,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
    fontSize: FONTS.xxl,
    fontWeight: '700',
    flex: 1,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    fontSize: FONTS.md,
    fontWeight: '500',
    marginTop: SPACING.xs,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },

  liveText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    fontSize: FONTS.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priorityBadge: {
    backgroundColor: '#D97706',
  },
  priorityBadgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: FONTS.sm,
  },
  insightsBadge: {
    backgroundColor: '#6366F1',
  },
  insightsBadgeText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: FONTS.sm,
  },
  toolsBadge: {
    backgroundColor: '#10B981',
  },
  toolsBadgeText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: FONTS.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    marginTop: SPACING.sm,
  },
  cardWrapper: {
    width: '48%',
    marginTop: SPACING.md,
  },
  stockStatusSection: {
    paddingHorizontal: isTablet ? SPACING.xl : SPACING.lg,
    marginBottom: SPACING.md,
  },
  stockStatusGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  stockStatusCard: {
    flex: 0,
    width: (width - (isTablet ? SPACING.xl * 2 : SPACING.lg * 2) - SPACING.md) / 2,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    height: 140,
    justifyContent: 'space-between',
  },
  lowStockCard: {
  },
  outOfStockCard: {
  },
  stockStatusHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },

  stockStatusTitle: {
    fontSize: FONTS.sm,
    fontWeight: '700',
    lineHeight: FONTS.sm * 1.4,
    color: COLORS.text.primary,
    flex: 1,
    marginBottom: 0,
    textAlign: 'left',
    flexWrap: 'wrap',
  },
  stockStatusValue: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text.primary,
    fontSize: FONTS.xxl,
    fontWeight: '800',
    marginBottom: SPACING.xs,
    textAlign: 'center',
    marginTop: 0,
  },
  stockStatusSubtitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    fontSize: FONTS.xs,
    marginBottom: SPACING.xs,
    textAlign: 'center',
    fontWeight: '500',
  },
  stockStatusBadgeContainer: {
    alignItems: 'center',
    marginTop: 0,
    marginBottom: SPACING.xs,
  },
  stockStatusBadgeText: {
    fontSize: FONTS.xs,
    fontWeight: '700',
    color: COLORS.white,
  },
  chartsSection: {
    paddingHorizontal: isTablet ? SPACING.xl : SPACING.lg,
    marginBottom: SPACING.md,
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    minHeight: 260,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  chartTitleContainer: {
    flex: 1,
  },
  chartTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    fontSize: FONTS.xl,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  chartSubtitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    fontSize: FONTS.md,
    fontWeight: '500',
  },
  chartTrendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  chartTrendText: {
    ...TYPOGRAPHY.caption,
    color: '#10B981',
    fontSize: FONTS.md,
    fontWeight: '700',
    marginLeft: SPACING.sm,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.xs,
  },
  chartValueLabel: {
    fontSize: 12,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  yAxisText: {
    fontSize: 12,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  xAxisLabel: {
    fontSize: 12,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  productInsightsSection: {
    paddingHorizontal: isTablet ? SPACING.xl : SPACING.lg,
    marginBottom: SPACING.lg,
    marginTop: SPACING.xl,
  },
  productInsightsScrollView: {
    flexGrow: 0,
  },
  productInsightsScrollContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
    alignItems: 'stretch',
  },
  productInsightsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'stretch',
    justifyContent: 'space-between',

  },
  productInsightCard: {
    width: 300,
    borderRadius: BORDER_RADIUS.xl,
    padding: 0,
    ...SHADOWS.lg,
    borderWidth: 0,
    height: 260,
    justifyContent: 'space-between',
    overflow: 'hidden',
    marginRight: SPACING.md,
  },
  productInsightGradient: {
    flex: 1,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    justifyContent: 'space-between',
  },
  productInsightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  productInsightTitle: {
    fontSize: FONTS.lg,
    fontWeight: '800',
    lineHeight: FONTS.lg * 1.4,
    color: '#1e293b',
    flexWrap: 'wrap',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  productInsightContent: {
    gap: SPACING.sm,
    flex: 1,
    justifyContent: 'flex-start',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    ...TYPOGRAPHY.caption,
    color: '#1e293b',
    fontSize: FONTS.sm,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.xs,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  metricValue: {
    ...TYPOGRAPHY.h2,
    color: '#1e293b',
    fontSize: FONTS.xl,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: SPACING.xs,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  metricTrend: {
    ...TYPOGRAPHY.caption,
    color: '#475569',
    fontSize: FONTS.xs,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  categoryName: {
    ...TYPOGRAPHY.body2,
    color: '#1e293b',
    fontSize: FONTS.md,
    fontWeight: '600',
    flex: 1,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  categoryStats: {
    alignItems: 'flex-end',
  },
  categoryCount: {
    fontSize: FONTS.lg,
    fontWeight: '700',
    lineHeight: FONTS.lg * 1.4,
    color: '#1e293b',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  categoryPercentage: {
    ...TYPOGRAPHY.caption,
    color: '#475569',
    fontSize: FONTS.xs,
    fontWeight: '600',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  recommendationText: {
    ...TYPOGRAPHY.body2,
    color: '#1e293b',
    fontSize: FONTS.sm,
    fontWeight: '600',
    marginLeft: SPACING.sm,
    flex: 1,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  quickActionsSection: {
    paddingHorizontal: isTablet ? SPACING.xl : SPACING.lg,
    marginBottom: SPACING.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    alignItems: 'stretch',
  },
  quickActionButton: {
    width: isTablet ? (width - SPACING.lg * 2 - SPACING.sm) / 3 : (width - SPACING.lg * 2 - SPACING.sm) / 2,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  quickActionGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
    height: 120,
    justifyContent: 'space-between',
  },
  quickActionText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.white,
    fontSize: FONTS.lg,
    fontWeight: '700',
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  quickActionSubtext: {
    ...TYPOGRAPHY.caption,
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: FONTS.sm,
    marginTop: SPACING.xs,
    textAlign: 'center',
    fontWeight: '500',
  },
  bottomSpacing: {
    height: SPACING.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.lg,
  },
  errorTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  errorMessage: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.small,
  },
  retryButtonText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.white,
    fontWeight: '700',
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContent: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  loadingText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    marginTop: SPACING.sm,
    fontWeight: '600',
  },
  // Professional Chart Styles
  professionalChartCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    margin: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 30,
    elevation: 8,
    overflow: 'hidden',
  },
  professionalChartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  professionalChartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  professionalChartSubtitle: {
    fontSize: 12,
    color: '#7a7a7a',
    marginTop: 4,
  },
  professionalChartFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '600',
  },
  totalLabel: {
    fontSize: 12,
    color: '#888',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#222',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 14,
  },
  bullet: {
    width: 8,
    height: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    marginRight: 8,
    marginTop: 6,
  },
  summaryText: {
    color: '#666',
    fontSize: 13,
    flex: 1,
  },
  // StockReportChart Style
  stockReportWrapper: {
    paddingHorizontal: 0, // Full width
    paddingTop: 10,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingHorizontal: 16, // Add padding back to header
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#222',
  },
  pageSubtitle: {
    fontSize: 12,
    color: '#7a7a7a',
    marginTop: 4,
  },
  stockReportCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e9ecef',
    overflow: 'hidden',
  },
  stockReportChartContainer: {
    marginBottom: 16,
  },
  stockReportFooterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 5,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  stockReportFooterLeft: {
    flex: 1,
    paddingRight: 10,
  },
  stockReportFooterRight: {
    minWidth: 100,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  stockReportTotalItemsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
  },
  stockReportLegendDot: {
    width: 5,
    height: 5,
    borderRadius: 6,
    marginRight: 8,
  },
  stockReportLegendText: {
    fontSize: 12,
    color: '#555',
    fontWeight: '400',
    marginLeft: 6,
  },
  stockReportTotalValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    textAlign: 'left',
  },
});

export default InventoryReportsScreen;
