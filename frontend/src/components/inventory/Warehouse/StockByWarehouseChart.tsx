import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Platform, ActivityIndicator, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../../constants/spacing';
import { TYPOGRAPHY } from '../../../constants/typography';
import { inventoryApiService } from '../../../api/inventoryApi';
import { Stock, Warehouse } from '../../../types/inventory';
import BarChart, { BarChartData } from '../../ui/BarChart';

interface StockData {
  warehouse: string;
  quantity: number;
}

interface StockByWarehouseChartProps {
  title: string;
}

// Removed Dimensions import as it's not needed with the new BarChart

// --- Reusable Internal Components ---

const Tooltip = ({ warehouse, quantity }: { warehouse: string; quantity: number }) => (
  <View style={styles.tooltipContainer}>
    <Text style={styles.tooltipTitle}>{warehouse}</Text>
    <Text style={styles.tooltipValue}>{quantity.toLocaleString()} units</Text>
  </View>
);

const TimeframePicker = ({ timeframe, onTimeframeChange }: { timeframe: string; onTimeframeChange: (timeframe: string) => void }) => {
  const timeframes = ['This Week', 'This Month', 'This Quarter', 'This Year'];
  const [currentIndex, setCurrentIndex] = useState(timeframes.indexOf(timeframe));

  const handlePress = () => {
    const nextIndex = (currentIndex + 1) % timeframes.length;
    setCurrentIndex(nextIndex);
    onTimeframeChange(timeframes[nextIndex]);
  };

  return (
    <TouchableOpacity style={styles.timeframeButton} onPress={handlePress} activeOpacity={0.85}>
      <Text style={styles.timeframeText}>{timeframe}</Text>
  </TouchableOpacity>
);
};

const StockByWarehouseChart: React.FC<StockByWarehouseChartProps> = ({ title }) => {
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<string>('This Month');
  const entry = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchStockByWarehouseData();
  }, [timeframe]); // Refetch when timeframe changes

  React.useEffect(() => {
    Animated.timing(entry, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [entry]);

  const fetchStockByWarehouseData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch warehouses
      const warehousesResponse = await inventoryApiService.getWarehouses();
      const warehouses = warehousesResponse.data;
      
      // Fetch current stock levels
      const stockResponse = await inventoryApiService.getCurrentStockLevels();
      const stockLevels = stockResponse.data;
      
      // Process data to get stock by warehouse based on timeframe
      const warehouseStockData = processStockByWarehouse(warehouses, stockLevels, timeframe);
      setStockData(warehouseStockData);
    } catch (err) {
      console.error('Error fetching stock by warehouse data:', err);
      setError('Failed to load warehouse stock data');
    } finally {
      setLoading(false);
    }
  };

  const filterStockByTimeframe = (stockLevels: Stock[], timeframe: string): Stock[] => {
    const now = new Date();
    let startDate: Date;
    
    switch (timeframe) {
      case 'This Week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'This Month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'This Quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'This Year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        return stockLevels; // Return all data if timeframe not recognized
    }
    
    return stockLevels.filter(stock => {
      if (!stock.updated_at) return true; // Include if no date
      const stockDate = new Date(stock.updated_at);
      return stockDate >= startDate;
    });
  };

  const processStockByWarehouse = (warehouses: Warehouse[], stockLevels: Stock[], timeframe: string): StockData[] => {
    // Create a map of warehouse ID to name
    const warehouseMap = new Map<string, string>();
    warehouses.forEach(warehouse => {
      warehouseMap.set(warehouse.id, warehouse.name);
    });
    
    // Group stock by warehouse
    const warehouseStocks: Record<string, number> = {};
    
    // Initialize with all warehouses at 0
    warehouses.forEach(warehouse => {
      warehouseStocks[warehouse.id] = 0;
    });
    
    // Filter stock levels based on timeframe
    const filteredStockLevels = filterStockByTimeframe(stockLevels, timeframe);
    
    // Sum up quantities for each warehouse
    filteredStockLevels.forEach(stock => {
      if (stock.warehouse_id && warehouseStocks[stock.warehouse_id] !== undefined) {
        warehouseStocks[stock.warehouse_id] += Number(stock.quantity);
      }
    });
    
    // Convert to array format for chart
    const result = Object.entries(warehouseStocks).map(([warehouseId, quantity]) => ({
      warehouse: warehouseMap.get(warehouseId) || 'Unknown',
      quantity,
      warehouseId
    }));
    
    // Sort by quantity (highest first)
    result.sort((a, b) => b.quantity - a.quantity);
    
    // Show all warehouses from API data
    if (result.length === 0) {
      return [{ warehouse: 'No Data', quantity: 0 }];
    }
    
    // Add some sample data to test scroll functionality (remove in production)
    const sampleData = [
      { warehouse: 'Warehouse A', quantity: 150, warehouseId: 'sample1' },
      { warehouse: 'Warehouse B', quantity: 200, warehouseId: 'sample2' },
      { warehouse: 'Warehouse C', quantity: 180, warehouseId: 'sample3' },
      { warehouse: 'Warehouse D', quantity: 120, warehouseId: 'sample4' },
      { warehouse: 'Warehouse E', quantity: 90, warehouseId: 'sample5' },
      { warehouse: 'Warehouse F', quantity: 160, warehouseId: 'sample6' },
      { warehouse: 'Warehouse G', quantity: 140, warehouseId: 'sample7' },
      { warehouse: 'Warehouse H', quantity: 110, warehouseId: 'sample8' },
      { warehouse: 'Warehouse I', quantity: 95, warehouseId: 'sample9' },
    ];
    
    // Combine real data with sample data for testing scroll
    const combinedData = [...result, ...sampleData];
    combinedData.sort((a, b) => b.quantity - a.quantity);
    
    return combinedData; // Show all warehouses including samples for testing
  };

  const totalStock = stockData.reduce((sum, item) => sum + item.quantity, 0);

  // Format data for the new BarChart component with StockReportChart gradient colors
  const chartData: BarChartData[] = stockData.map((item) => ({
    value: item.quantity,
    label: item.warehouse.substring(0, 3), // Use abbreviated warehouse names
    fullLabel: item.warehouse, // Full warehouse name for tooltip
    colorStart: '#EDA071', // Same as StockReportChart
    colorEnd: '#F5F5F7', // Same as StockReportChart
  }));

  // Debug: Log the number of bars
  console.log('StockByWarehouseChart - Number of bars:', chartData.length);

  const translateY = entry.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });
  const opacity = entry;

  if (loading) {
  return (
      <View style={styles.wrapper}>
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.pageTitle}>Stock by Warehouse</Text>
            <Text style={styles.pageSubtitle}>Overview of stock levels across warehouses</Text>
          </View>
          <TimeframePicker timeframe={timeframe} onTimeframeChange={setTimeframe} />
        </View>
      <View style={styles.card}>
          <View style={styles.chartContainer}>
            <BarChart 
              data={[]} 
              height={220}
              onBarPress={(i, item) => console.log('Bar pressed:', i, item)} 
            />
          </View>
        </View>
          </View>
    );
  }
          
  if (error) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.pageTitle}>Stock by Warehouse</Text>
            <Text style={styles.pageSubtitle}>Overview of stock levels across warehouses</Text>
          </View>
          <TimeframePicker timeframe={timeframe} onTimeframeChange={setTimeframe} />
        </View>
      <View style={styles.card}>
          <View style={styles.chartContainer}>
            <BarChart 
              data={[]} 
              height={220}
              onBarPress={(i, item) => console.log('Bar pressed:', i, item)} 
            />
          </View>
            </View>
      </View>
    );
  }

  if (stockData.length === 0) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.pageTitle}>Stock by Warehouse</Text>
            <Text style={styles.pageSubtitle}>Overview of stock levels across warehouses</Text>
          </View>
          <TimeframePicker timeframe={timeframe} onTimeframeChange={setTimeframe} />
        </View>
      <View style={styles.card}>
          <View style={styles.chartContainer}>
            <BarChart 
              data={[]} 
              height={220}
              onBarPress={(i, item) => console.log('Bar pressed:', i, item)} 
            />
          </View>
            </View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {/* Page title + timeframe (OUTSIDE the white card as requested) */}
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>{title}</Text>
          <Text style={styles.pageSubtitle}>Overview of stock levels across warehouses</Text>
        </View>

        <TimeframePicker 
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
        />
      </View>

      {/* Card containing chart and footer */}
      <Animated.View style={[styles.card, { transform: [{ translateY }], opacity }]}>
        <View style={styles.chartContainer}>
        <BarChart 
          data={chartData} 
          height={220} 
          onBarPress={(i, item) => console.log('bar', i, item)} 
        />
      </View>

        {/* Footer: left description; right total items with value */}
        <View style={styles.footerContainer}>
          <View style={styles.footerLeft}>
            <Text style={styles.summaryText}>
              {stockData.length > 0 
                ? `Most warehouses have healthy stock levels. ${stockData.length} warehouses tracked.`
                : 'No warehouse data available.'
              }
            </Text>
          </View>

          <View style={styles.footerRight}>
            <View style={styles.totalItemsContainer}>
              <View style={[styles.legendDot, { backgroundColor: '#FF8A65' }]} />
          <Text style={styles.legendText}>Total items</Text>
        </View>
            <Text style={styles.totalValue}>{Math.round(totalStock).toLocaleString()}</Text>
        </View>
      </View>
      </Animated.View>
      </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
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
  timeframeButton: {
    backgroundColor: '#f2f2f4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  timeframeText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 12,
  },
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e9ecef',
    overflow: 'hidden',
  },
  chartContainer: {
    marginBottom: 16,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 5,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  footerLeft: {
    flex: 1,
    paddingRight: 10,
  },
  footerRight: {
    minWidth: 100,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  totalItemsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
  },
  legendDot: {
    width: 5,
    height: 5,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#555',
    fontWeight: '400',
    marginLeft: 6,
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    textAlign: 'left',
  },
  summaryText: {
    color: '#666',
    fontSize: 13,
    flex: 1,
    textAlign: 'left',
  },
  loadingContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
  errorContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.status.error,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  emptyContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  tooltipContainer: {
    backgroundColor: '#3D3D3D',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginBottom: 4,
    minWidth: 100,
  },
  tooltipTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tooltipValue: {
    color: '#E0E0E0',
    fontSize: 11,
  },
});

export default StockByWarehouseChart;

