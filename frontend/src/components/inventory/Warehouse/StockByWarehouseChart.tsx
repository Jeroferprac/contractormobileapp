import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../../constants/spacing';
import { TYPOGRAPHY } from '../../../constants/typography';
import { inventoryApiService } from '../../../api/inventoryApi';
import { Stock, Warehouse } from '../../../types/inventory';

interface StockData {
  warehouse: string;
  quantity: number;
}

interface StockByWarehouseChartProps {
  title: string;
}

const { width: screenWidth } = Dimensions.get('window');

// --- Reusable Internal Components ---

const Tooltip = ({ warehouse, quantity }: { warehouse: string; quantity: number }) => (
  <View style={styles.tooltipContainer}>
    <Text style={styles.tooltipTitle}>{warehouse}</Text>
    <Text style={styles.tooltipValue}>{quantity.toLocaleString()} units</Text>
  </View>
);

const TimeframePicker = () => (
  <TouchableOpacity style={styles.pickerContainer}>
    <Text style={styles.pickerText}>This Month</Text>
    <Icon name="chevron-down" size={16} color="#333" />
  </TouchableOpacity>
);

const StockByWarehouseChart: React.FC<StockByWarehouseChartProps> = ({ title }) => {
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStockByWarehouseData();
  }, []);

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
      
      // Process data to get stock by warehouse
      const warehouseStockData = processStockByWarehouse(warehouses, stockLevels);
      setStockData(warehouseStockData);
    } catch (err) {
      console.error('Error fetching stock by warehouse data:', err);
      setError('Failed to load warehouse stock data');
    } finally {
      setLoading(false);
    }
  };

  const processStockByWarehouse = (warehouses: Warehouse[], stockLevels: Stock[]): StockData[] => {
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
    
    // Sum up quantities for each warehouse
    stockLevels.forEach(stock => {
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
    
    // Take top 5 warehouses for better visualization
    const topWarehouses = result.slice(0, 5);
    
    // If no data, provide fallback
    if (topWarehouses.length === 0) {
      return [{ warehouse: 'No Data', quantity: 0 }];
    }
    
    return topWarehouses;
  };

  const totalStock = stockData.reduce((sum, item) => sum + item.quantity, 0);
  const maxValueItem = stockData.length > 0 ? stockData.reduce((prev, current) =>
    prev.quantity > current.quantity ? prev : current
  ) : { warehouse: '', quantity: 0 };

  // Format data for the chart
  const chartData = stockData.map((item, index) => ({
    value: item.quantity,
    label: item.warehouse.substring(0, 3), // Use abbreviated warehouse names
    warehouse: item.warehouse,
    quantity: item.quantity,
    topLabelComponent: item.warehouse === maxValueItem.warehouse 
      ? () => <Tooltip warehouse={item.warehouse} quantity={item.quantity} />
      : undefined
  }));

  if (loading) {
    return (
      <View style={styles.card}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading warehouse data...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.card}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchStockByWarehouseData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (stockData.length === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No warehouse stock data available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TimeframePicker />
      </View>
      <View style={styles.chartContainer}>
        <BarChart
          data={chartData}
          barWidth={35}
          spacing={20}
          roundedTop
          hideRules
          xAxisThickness={0}
          yAxisThickness={0}
          yAxisTextStyle={styles.axisLabel}
          xAxisLabelTextStyle={styles.axisLabel}
          noOfSections={4}
          maxValue={Math.max(...stockData.map(item => item.quantity)) * 1.2 || 100}
          isAnimated
          animationDuration={800}
          showGradient
          gradientColor={COLORS.gradient.primary[1]}
          frontColor={COLORS.gradient.primary[0]}
        />
      </View>
      <View style={styles.summaryContainer}>
        <View style={styles.summaryDot} />
        <Text style={styles.summaryText}>
          <Text style={styles.summaryValue}>Total Stock: {totalStock.toLocaleString()}</Text> units across {stockData.length} warehouses.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginVertical: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C2C2C',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  pickerText: {
    fontSize: 14,
    color: '#333',
    marginRight: 8,
    fontWeight: '500',
  },
  chartContainer: {
    height: 250,
    paddingLeft: 10,
  },
  axisLabel: {
    color: '#A0A0A0',
    fontSize: 12,
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
  summaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
    paddingHorizontal: 10,
  },
  summaryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    marginRight: 12,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    lineHeight: 20,
  },
  summaryValue: {
    fontWeight: 'bold',
    color: '#333',
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
});

export default StockByWarehouseChart;