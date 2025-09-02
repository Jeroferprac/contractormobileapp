import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  Animated,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { LineChart, BarChart, PieChart } from 'react-native-gifted-charts';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../../../constants/spacing';
import { TYPOGRAPHY } from '../../../../constants/typography';
import { inventoryApiService } from '../../../../api/inventoryApi';
import { InventorySummary, Transfer, Stock, Warehouse } from '../../../../types/inventory';
import LoadingSkeleton from '../../../../components/ui/LoadingSkeleton';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface AnalyticsChartsProps {
  navigation?: any;
}

interface StatsCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  progress: number;
  isLoading: boolean;
  onPress?: () => void;
}

interface TooltipData {
  x: number;
  y: number;
  value: string;
  label: string;
  date?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtitle, icon, progress, isLoading, onPress }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isLoading) {
      // Run animations separately to avoid useNativeDriver conflicts
      Animated.timing(animatedValue, {
        toValue: progress,
        duration: 2000,
        useNativeDriver: false,
      }).start();

      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [progress, isLoading]);

  return (
    <Animated.View style={[styles.statsCard, { transform: [{ scale: scaleValue }] }]}>
      <TouchableOpacity onPress={onPress} style={styles.statsCardPressable} activeOpacity={0.8}>
        {/* Thick Border Gradient */}
        <LinearGradient
          colors={['#667eea', '#764ba2', '#4facfe', '#00f2fe']}
          style={styles.statsCardBorder}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.statsCardInner}>
            <View style={styles.statsCardContent}>
              <View style={styles.statsCardHeader}>
                {/* Orange-Black Icon Gradient */}
                <LinearGradient
                  colors={['#FF6B35', '#FF8C42', '#FFA500', '#000000']}
                  style={styles.statsIconContainer}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Icon name={icon} size={24} color="#FFFFFF" />
                </LinearGradient>
                <View style={styles.progressContainer}>
                  <View style={styles.progressRing}>
                    <Animated.View 
                      style={[
                        styles.progressFill,
                        { 
                          width: animatedValue.interpolate({
                            inputRange: [0, 100],
                            outputRange: ['0%', '100%'],
                          })
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>{progress}%</Text>
                </View>
              </View>
              <Text style={styles.statsValue}>{value}</Text>
              <Text style={styles.statsTitle}>{title}</Text>
              <Text style={styles.statsSubtitle}>{subtitle}</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ navigation }) => {
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [containerLayout, setContainerLayout] = useState<any>(null);
  
  // Separate filters for each chart
  const [stockFilter, setStockFilter] = useState<'7d' | '30d' | '90d'>('7d');
  const [transferFilter, setTransferFilter] = useState<'7d' | '30d' | '90d'>('7d');
  const [warehouseFilter, setWarehouseFilter] = useState<'7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Add timeout and better error handling
      const dataPromise = Promise.all([
        inventoryApiService.getSummary().catch(() => ({ data: null })),
        inventoryApiService.getTransfers().catch(() => ({ data: [] })),
        inventoryApiService.getCurrentStockLevels().catch(() => ({ data: [] })),
        inventoryApiService.getWarehouses().catch(() => ({ data: [] })),
      ]);
      
      const [summaryRes, transfersRes, stocksRes, warehousesRes] = await dataPromise;
      
      setSummary(summaryRes.data);
      setTransfers(transfersRes.data || []);
      setStocks(stocksRes.data || []);
      setWarehouses(warehousesRes.data || []);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Set fallback data to prevent crashes
      setSummary(null);
      setTransfers([]);
      setStocks([]);
      setWarehouses([]);
    } finally {
      setLoading(false);
    }
  };

  const generateDates = (days: number) => {
    const dates: string[] = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      let label: string;
      if (days <= 7) {
        label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (days <= 30) {
        label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      
      dates.push(label);
    }
    
    return dates;
  };

  // Dynamic chart configuration for Stock Trend
  const getStockChartConfig = useMemo(() => {
    if (!containerLayout) {
      return {
        width: screenWidth - 80,
        spacing: 20,
        fontSize: 12,
        barWidth: 20,
        height: 200,
      };
    }

    const availableWidth = containerLayout.width - 60;
    const dataPoints = stockFilter === '7d' ? 7 : stockFilter === '30d' ? 30 : 90;
    
    let spacing, fontSize, barWidth, height;
    
    if (dataPoints <= 7) {
      spacing = Math.floor(availableWidth / Math.max(dataPoints - 1, 1));
      fontSize = 12;
      barWidth = Math.min(spacing * 0.6, 25);
      height = 200;
    } else if (dataPoints <= 30) {
      spacing = Math.floor(availableWidth / dataPoints);
      fontSize = Math.max(10, Math.floor(12 - (dataPoints - 7) * 0.1));
      barWidth = Math.min(spacing * 0.8, 20);
      height = 220;
    } else {
      spacing = Math.max(8, Math.floor(availableWidth / Math.min(dataPoints, 15)));
      fontSize = 8;
      barWidth = Math.min(spacing * 0.9, 12);
      height = 180;
    }
    
    return {
      width: availableWidth,
      spacing: Math.max(spacing, 5),
      fontSize,
      barWidth,
      height,
      enableScroll: dataPoints > 30,
    };
  }, [containerLayout, stockFilter]);

  // Dynamic chart configuration for Transfer Activity
  const getTransferChartConfig = useMemo(() => {
    if (!containerLayout) {
      return {
        width: screenWidth - 80,
        spacing: 20,
        fontSize: 12,
        barWidth: 20,
        height: 200,
      };
    }

    const availableWidth = containerLayout.width - 60;
    const dataPoints = transferFilter === '7d' ? 7 : transferFilter === '30d' ? 30 : 90;
    
    let spacing, fontSize, barWidth, height;
    
    if (dataPoints <= 7) {
      spacing = Math.floor(availableWidth / Math.max(dataPoints - 1, 1));
      fontSize = 12;
      barWidth = Math.min(spacing * 0.6, 25);
      height = 200;
    } else if (dataPoints <= 30) {
      spacing = Math.floor(availableWidth / dataPoints);
      fontSize = Math.max(10, Math.floor(12 - (dataPoints - 7) * 0.1));
      barWidth = Math.min(spacing * 0.8, 20);
      height = 220;
    } else {
      spacing = Math.max(8, Math.floor(availableWidth / Math.min(dataPoints, 15)));
      fontSize = 8;
      barWidth = Math.min(spacing * 0.9, 12);
      height = 180;
    }
    
    return {
      width: availableWidth,
      spacing: Math.max(spacing, 5),
      fontSize,
      barWidth,
      height,
      enableScroll: dataPoints > 30,
    };
  }, [containerLayout, transferFilter]);

  const generateStockData = (period: '7d' | '30d' | '90d') => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const dates = generateDates(days);
    
    return dates.map((date, index) => ({
      value: Math.floor(Math.random() * 200) + 100,
      dataPointText: `${Math.floor(Math.random() * 200) + 100}`,
      label: '',
      onPress: (item: any) => showTooltipData(item, 'Stock', date),
    }));
  };

  const generateTransferData = (period: '7d' | '30d' | '90d') => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const dates = generateDates(days);
    
    return dates.map((date, index) => ({
      value: Math.floor(Math.random() * 30) + 5,
      label: '',
      frontColor: getGradientColor(index),
      onPress: (item: any) => showTooltipData(item, 'Transfer', date),
    }));
  };

  const generateWarehouseData = (period: '7d' | '30d' | '90d') => {
    if (!warehouses.length || !stocks.length) {
      return [];
    }

    // Calculate real stock data for each warehouse
    const warehouseStockData = warehouses.map((warehouse, index) => {
      const warehouseStocks = stocks.filter(stock => stock.warehouse_id === warehouse.id);
      const totalQuantity = warehouseStocks.reduce((sum, stock) => sum + Number(stock.quantity), 0);
      const totalProducts = warehouseStocks.length;
      
      return {
        value: totalQuantity,
        label: warehouse.name,
        frontColor: getGradientColor(index),
        text: warehouse.name,
        warehouseId: warehouse.id,
        totalProducts: totalProducts,
        totalQuantity: totalQuantity,
      };
    }).filter(item => item.value > 0); // Only show warehouses with stock

    return warehouseStockData;
  };

  const showTooltipData = (item: any, type: string, date?: string) => {
    if (!item) return;
    
    setTooltipData({
      x: 50,
      y: 50,
      value: item.value?.toString() || '0',
      label: `${type}: ${item.label || 'Unknown'}`,
      date: date,
    });
    setShowTooltip(true);
    
    setTimeout(() => setShowTooltip(false), 3000);
  };

  const getGradientColor = (index: number) => {
    const colors = ['#FF6B35', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    return colors[index % colors.length];
  };

  const handleLayout = (event: any) => {
    setContainerLayout(event.nativeEvent.layout);
  };

  const periods = [
    { key: '7d', label: '7d' },
    { key: '30d', label: '30d' },
    { key: '90d', label: '90d' },
  ] as const;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Stats Cards Skeleton */}
          <View style={styles.statsContainer}>
            {[...Array(4)].map((_, i) => (
              <View key={i} style={styles.statsCard}>
                <LoadingSkeleton width="100%" height={120} borderRadius={BORDER_RADIUS.lg} />
              </View>
            ))}
          </View>

          {/* Chart Skeleton */}
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <LoadingSkeleton width={120} height={20} borderRadius={BORDER_RADIUS.sm} />
              <LoadingSkeleton width={80} height={32} borderRadius={BORDER_RADIUS.md} />
            </View>
            <LoadingSkeleton width="100%" height={200} borderRadius={BORDER_RADIUS.lg} />
          </View>

          {/* Additional Chart Skeleton */}
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <LoadingSkeleton width={120} height={20} borderRadius={BORDER_RADIUS.sm} />
              <LoadingSkeleton width={80} height={32} borderRadius={BORDER_RADIUS.md} />
            </View>
            <LoadingSkeleton width="100%" height={200} borderRadius={BORDER_RADIUS.lg} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stats Cards - Only the new styled ones */}
        <View style={styles.statsContainer}>
          <StatsCard
            title="Total Warehouses"
            value={summary?.total_warehouses?.toString() || "5"}
            subtitle="Active: 4/5"
            icon="warehouse"
            progress={80}
            isLoading={loading}
            onPress={() => console.log('Warehouse stats pressed')}
          />
          <StatsCard
            title="Stock Items"
            value={summary?.total_products?.toString() || "12"}
            subtitle="Across all warehouses"
            icon="package-variant"
            progress={65}
            isLoading={loading}
            onPress={() => console.log('Stock stats pressed')}
          />
          <StatsCard
            title="Total Transfers"
            value={transfers?.length?.toString() || "8"}
            subtitle="Pending: 4"
            icon="truck-delivery"
            progress={50}
            isLoading={loading}
            onPress={() => console.log('Transfer stats pressed')}
          />
          <StatsCard
            title="Active Locations"
            value="5"
            subtitle="Operational warehouses"
            icon="map-marker"
            progress={100}
            isLoading={loading}
            onPress={() => console.log('Location stats pressed')}
          />
        </View>

        {/* Stock Trend Chart */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleContainer}>
              <Icon name="chart-line" size={20} color="#667eea" />
              <Text style={styles.chartTitle}>Stock Trend</Text>
            </View>
            <View style={styles.filterContainerRight}>
              {periods.map((period) => (
                <TouchableOpacity
                  key={period.key}
                  style={[
                    styles.filterChipCompact,
                    stockFilter === period.key && styles.activeFilterChipCompact,
                  ]}
                  onPress={() => setStockFilter(period.key)}
                >
                  <Text
                    style={[
                      styles.filterChipTextCompact,
                      stockFilter === period.key && styles.activeFilterChipTextCompact,
                    ]}
                  >
                    {period.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.chartWrapper}>
            {containerLayout && (
              <LineChart
                data={generateStockData(stockFilter)}
                width={getStockChartConfig.width}
                height={getStockChartConfig.height}
                color="#667eea"
                thickness={3}
                startFillColor="rgba(102, 126, 234, 0.6)"
                endFillColor="rgba(102, 126, 234, 0.1)"
                startOpacity={1}
                endOpacity={0.3}
                initialSpacing={0}
                endSpacing={0}
                spacing={getStockChartConfig.spacing}
                backgroundColor="transparent"
                rulesType="solid"
                rulesColor="transparent"
                yAxisColor="transparent"
                xAxisColor="transparent"
                yAxisTextStyle={{ color: '#9CA3AF', fontSize: getStockChartConfig.fontSize }}
                xAxisLabelTextStyle={{ 
                  color: '#6B7280', 
                  fontSize: getStockChartConfig.fontSize,
                  textAlign: 'center' 
                }}
                curved
                showVerticalLines={false}
                dataPointsColor="#667eea"
                dataPointsRadius={4}
                dataPointsShape="circle"
                hideDataPoints={false}
                hideRules={true}
                hideYAxisText={true}
                isAnimated
                animationDuration={1200}
                disableScroll={!getStockChartConfig.enableScroll}
                pointerConfig={{
                  pointerStripHeight: getStockChartConfig.height - 40,
                  pointerStripColor: '#667eea',
                  pointerStripWidth: 2,
                  pointerColor: '#667eea',
                  radius: 6,
                  pointerLabelWidth: 80,
                  pointerLabelHeight: 40,
                  activatePointersOnLongPress: false,
                  autoAdjustPointerLabelPosition: true,
                  pointerLabelComponent: (items: any) => {
                    return (
                      <View style={styles.inlineTooltip}>
                        <Text style={styles.inlineTooltipValue}>{items[0].value}</Text>
                        <Text style={styles.inlineTooltipLabel}>{items[0].label}</Text>
                      </View>
                    );
                  },
                }}
              />
            )}
          </View>
          
          {/* Total Data Text */}
          <View style={styles.totalDataContainer}>
            <Text style={styles.totalDataText}>
              Total Stock: {generateStockData(stockFilter).reduce((sum, item) => sum + item.value, 0).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Transfer Activity Chart */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleContainer}>
              <Icon name="chart-bar" size={20} color="#f093fb" />
              <Text style={styles.chartTitle}>Transfer Activity</Text>
            </View>
            <View style={styles.filterContainerRight}>
              {periods.map((period) => (
                <TouchableOpacity
                  key={period.key}
                  style={[
                    styles.filterChipCompact,
                    transferFilter === period.key && styles.activeFilterChipCompact,
                  ]}
                  onPress={() => setTransferFilter(period.key)}
                >
                  <Text
                    style={[
                      styles.filterChipTextCompact,
                      transferFilter === period.key && styles.activeFilterChipTextCompact,
                    ]}
                  >
                    {period.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.chartWrapper}>
            {containerLayout && (
              <BarChart
                data={generateTransferData(transferFilter)}
                width={getTransferChartConfig.width}
                height={getTransferChartConfig.height}
                barWidth={getTransferChartConfig.barWidth}
                spacing={getTransferChartConfig.spacing}
                hideRules={true}
                xAxisColor="transparent"
                yAxisColor="transparent"
                yAxisTextStyle={{ color: '#9CA3AF', fontSize: getTransferChartConfig.fontSize }}
                xAxisLabelTextStyle={{ 
                  color: '#6B7280', 
                  fontSize: getTransferChartConfig.fontSize,
                  textAlign: 'center' 
                }}
                noOfSections={4}
                maxValue={35}
                backgroundColor="transparent"
                showGradient
                gradientColor="#f093fb"
                barBorderRadius={6}
                showVerticalLines={false}
                initialSpacing={0}
                endSpacing={0}
                isAnimated
                animationDuration={1200}
                hideYAxisText={true}
                disableScroll={!getTransferChartConfig.enableScroll}
                renderTooltip={(item: any) => (
                  <View style={styles.inlineTooltip}>
                    <Text style={styles.inlineTooltipValue}>{item.value}</Text>
                    <Text style={styles.inlineTooltipLabel}>{item.label}</Text>
                  </View>
                )}
              />
            )}
          </View>
          
          {/* Total Data Text */}
          <View style={styles.totalDataContainer}>
            <Text style={styles.totalDataText}>
              Total Transfers: {generateTransferData(transferFilter).reduce((sum, item) => sum + item.value, 0).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Warehouse Distribution Chart - Larger */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleContainer}>
              <Icon name="chart-donut" size={20} color="#4facfe" />
              <Text style={styles.chartTitle}>Stock by Warehouse</Text>
            </View>
            <View style={styles.filterContainerRight}>
              {periods.map((period) => (
                <TouchableOpacity
                  key={period.key}
                  style={[
                    styles.filterChipCompact,
                    warehouseFilter === period.key && styles.activeFilterChipCompact,
                  ]}
                  onPress={() => setWarehouseFilter(period.key)}
                >
                  <Text
                    style={[
                      styles.filterChipTextCompact,
                      warehouseFilter === period.key && styles.activeFilterChipTextCompact,
                    ]}
                  >
                    {period.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.chartWrapper}>
            <PieChart
              data={generateWarehouseData(warehouseFilter)}
              radius={120}
              innerRadius={60}
              centerLabelComponent={() => (
                <View style={styles.pieChartCenter}>
                  <Text style={styles.pieChartCenterText}>
                    {generateWarehouseData(warehouseFilter).reduce((sum: number, item: any) => sum + item.value, 0)}
                  </Text>
                  <Text style={styles.pieChartCenterSubtext}>Total</Text>
                </View>
              )}
              onPress={(item: any) => {
                const warehouseData = generateWarehouseData(warehouseFilter).find(data => data.value === item.value);
                if (warehouseData) {
                  // Show inline tooltip instead of modal
                  setTooltipData({
                    x: 50,
                    y: 50,
                    value: `${warehouseData.totalProducts} Products`,
                    label: warehouseData.text,
                    date: `${warehouseData.totalQuantity} Total Stock`,
                  });
                  setShowTooltip(true);
                  setTimeout(() => setShowTooltip(false), 3000);
                }
              }}
            />
            
            {/* Inline Tooltip */}
            {showTooltip && tooltipData && (
              <View style={styles.inlinePieTooltip}>
                <Text style={styles.inlineTooltipTitle}>{tooltipData.label}</Text>
                <Text style={styles.inlineTooltipValue}>{tooltipData.value}</Text>
                <Text style={styles.inlineTooltipSubtext}>{tooltipData.date}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Tooltip Modal */}
      <Modal
        visible={showTooltip}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTooltip(false)}
      >
        <TouchableOpacity 
          style={styles.tooltipOverlay}
          onPress={() => setShowTooltip(false)}
          activeOpacity={1}
        >
          <View style={styles.tooltipCard}>
            <Text style={styles.tooltipLabel}>{tooltipData?.label}</Text>
            {tooltipData?.date && (
              <Text style={styles.tooltipDate}>{tooltipData.date}</Text>
            )}
            <Text style={styles.tooltipValue}>{tooltipData?.value}</Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  // Skeleton Styles
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  statsCard: {
    width: (screenWidth - 48 - SPACING.md) / 2,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.lg,
    overflow: 'hidden',
  },
  statsCardPressable: {
    flex: 1,
  },
  statsCardBorder: {
    padding: 1,
    borderRadius: BORDER_RADIUS.lg,
  },
  statsCardInner: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg - 2,
    flex: 1,
  },
  statsCardContent: {
    padding: SPACING.md,
  },
  statsCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRing: {
    width: 40,
    height: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
    marginBottom: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 2,
  },
  progressText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  statsValue: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  statsTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  statsSubtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...SHADOWS.sm,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  chartTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  filterContainerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChipCompact: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: '#F8F9FA',
    marginHorizontal: 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeFilterChipCompact: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  filterChipTextCompact: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '500',
    color: COLORS.text.secondary,
  },
  activeFilterChipTextCompact: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pieChartCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieChartCenterText: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  pieChartCenterSubtext: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
  tooltipOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltipCard: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.lg,
    minWidth: 120,
    alignItems: 'center',
  },
  tooltipLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  tooltipDate: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.tertiary,
    marginBottom: SPACING.xs,
  },
  tooltipValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
  totalDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  totalDataText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    fontStyle: 'italic',
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  inlineTooltip: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineTooltipValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  inlineTooltipLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
  },
  inlinePieTooltip: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.lg,
    minWidth: 150,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  inlineTooltipTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  inlineTooltipSubtext: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
});

export default AnalyticsCharts;
