import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import Icon from 'react-native-vector-icons/Feather';
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
  data: StockData[];
  title: string;
}

const { width: screenWidth } = Dimensions.get('window');

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

  // Get gradient colors based on stock level
  const getGradientColors = (quantity: number, index: number) => {
    const maxQuantity = Math.max(...stockData.map(item => item.quantity));
    const percentage = quantity / maxQuantity;
    
    // If stock is low (less than 30% of max), show red gradient
    if (percentage < 0.3) {
      return {
        frontColor: '#EF4444',
        gradientColor: '#DC2626'
      };
    }
    
    // Otherwise use pink, blue, red, rose gradient based on index
    const colors = [
      { frontColor: '#EC4899', gradientColor: '#DB2777' }, // Pink
      { frontColor: '#3B82F6', gradientColor: '#1D4ED8' }, // Blue
      { frontColor: '#EF4444', gradientColor: '#DC2626' }, // Red
      { frontColor: '#F43F5E', gradientColor: '#E11D48' }, // Rose
      { frontColor: '#8B5CF6', gradientColor: '#7C3AED' }  // Purple
    ];
    
    return colors[index % colors.length];
  };
  
  // Format data for the chart
  const barData = stockData.map((item, index) => {
    const colors = getGradientColors(item.quantity, index);
    return {
    value: item.quantity,
      label: `Warehouse ${index + 1}`,
      frontColor: colors.frontColor,
    topLabelComponent: () => (
      <Text style={styles.barLabel}>{item.quantity.toLocaleString()}</Text>
    ),
    labelTextStyle: styles.xAxisLabel,
    spacing: 20,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
      gradientColor: colors.gradientColor,
    };
  });

  return (
    <View style={styles.container}>
      {/* Title outside chart at top right */}
      <View style={styles.titleContainer}>
        <View style={styles.titleContent}>
          <View style={styles.iconContainer}>
            <Icon name="package" size={20} color="#EC4899" />
          </View>
          <Text style={styles.title}>Stock by Warehouse</Text>
        </View>
          </View>
          
      {/* Chart Card */}
      <View style={styles.card}>
        <View style={styles.chartContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#EC4899" />
              <Text style={styles.loadingText}>Loading warehouse data...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchStockByWarehouseData}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : stockData.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No warehouse stock data available</Text>
            </View>
          ) : (
              <BarChart
                data={barData}
                barWidth={40}
                spacing={40}
                roundedTop
                roundedBottom
                hideRules
              xAxisThickness={0}
              xAxisColor="transparent"
                yAxisThickness={0}
                yAxisTextStyle={styles.yAxisText}
                noOfSections={4}
                maxValue={Math.max(...stockData.map(item => item.quantity)) * 1.2 || 100}
                renderTooltip={(item: any) => (
                  <View style={styles.tooltipContainer}>
                    <Text style={styles.tooltipTitle}>{item.label}</Text>
                    <View style={styles.tooltipRow}>
                      <Text style={styles.tooltipLabel}>Stock:</Text>
                      <Text style={styles.tooltipValue}>{item.value.toLocaleString()}</Text>
                    </View>
                  </View>
                )}
                barBorderRadius={6}
                isAnimated
                animationDuration={800}
              width={screenWidth - 80}
                height={220}
              initialSpacing={20}
              endSpacing={20}
                disableScroll
                hideYAxisText
                yAxisLabelWidth={0}
              showGradient
              />
          )}
            </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  titleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.2)',
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    color: COLORS.text.primary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  loadingContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  errorContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.status.error,
    marginBottom: SPACING.sm,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  emptyContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  retryButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: '#EC4899',
    borderRadius: BORDER_RADIUS.md,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  barLabel: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '500',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  xAxisLabel: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '400',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  yAxisText: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  tooltipContainer: {
    backgroundColor: 'white',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tooltipTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    marginBottom: SPACING.xs,
    color: COLORS.text.primary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  tooltipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  tooltipLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginRight: SPACING.xs,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  tooltipValue: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '500',
    color: COLORS.text.primary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
});

export default StockByWarehouseChart;
