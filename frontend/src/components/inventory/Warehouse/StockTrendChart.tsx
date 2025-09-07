import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../../constants/spacing';
import { TYPOGRAPHY } from '../../../constants/typography';
import { inventoryApiService } from '../../../api/inventoryApi';
import { Stock } from '../../../types/inventory';

interface StockTrendData {
  date: string;
  totalStock: number;
  availableStock: number;
}

const { width: screenWidth } = Dimensions.get('window');

// --- Reusable Internal Components ---

const Tooltip = ({ date, value }: { date: string; value: number }) => (
  <View style={styles.tooltipContainer}>
    <Text style={styles.tooltipDate}>{date}</Text>
    <Text style={styles.tooltipValue}>{value.toLocaleString()} units</Text>
  </View>
);

const TimeframePicker = () => (
  <TouchableOpacity style={styles.pickerContainer}>
    <Text style={styles.pickerText}>This Month</Text>
    <Icon name="chevron-down" size={16} color="#333" />
  </TouchableOpacity>
);

// Helper function to aggregate data for longer time ranges
const aggregateData = (data: StockTrendData[], targetPoints: number): StockTrendData[] => {
  if (data.length <= targetPoints) return data;

  const aggregated: StockTrendData[] = [];
  const step = Math.ceil(data.length / targetPoints);

  for (let i = 0; i < data.length; i += step) {
    const chunk = data.slice(i, i + step);
    const aggregatedItem = {
      date: chunk[0].date,
      totalStock: Math.round(chunk.reduce((sum, item) => sum + item.totalStock, 0) / chunk.length),
      availableStock: Math.round(chunk.reduce((sum, item) => sum + item.availableStock, 0) / chunk.length)
    };
    aggregated.push(aggregatedItem);
  }

  return aggregated;
};

// Fill missing dates in the range
const fillMissingDates = (
  data: StockTrendData[],
  startDate: Date,
  endDate: Date
) => {
  const filledData: StockTrendData[] = [];
  const dateMap = new Map(data.map(d => [d.date, d]));

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    if (dateMap.has(dateStr)) {
      filledData.push(dateMap.get(dateStr)!);
    } else {
      filledData.push({
        date: dateStr,
        totalStock: 0,
        availableStock: 0
      });
    }
  }

  return filledData;
};

const StockTrendChart = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '1m' | '3m'>('7d');
  const [stockData, setStockData] = useState<StockTrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStockTrendData();
  }, [timeRange]);

  const fetchStockTrendData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryApiService.getCurrentStockLevels();
      const stockLevels = response.data;
      
      // Process data to get stock trends
      const trendData = processStockTrendData(stockLevels);
      setStockData(trendData);
    } catch (err) {
      console.error('Error fetching stock trend data:', err);
      setError('Failed to load stock trend data');
    } finally {
      setLoading(false);
    }
  };

  const processStockTrendData = (stockLevels: Stock[]): StockTrendData[] => {
    if (!stockLevels.length) {
      return generateFallbackData();
    }

    // Get date range based on selected timeRange
    const today = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(today.getDate() - 7);
        break;
      case '1m':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case '3m':
        startDate.setMonth(today.getMonth() - 3);
        break;
      default:
        startDate.setDate(today.getDate() - 7);
    }

    // Group stock by date
    const stockByDate = stockLevels.reduce((acc, stock) => {
      const date = new Date(stock.updated_at || stock.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { totalStock: 0, availableStock: 0 };
      }
      acc[date].totalStock += Number(stock.quantity);
      acc[date].availableStock += Number(stock.available_quantity || stock.quantity);
      return acc;
    }, {} as Record<string, { totalStock: number; availableStock: number }>);

    // Convert to array and fill missing dates
    const dates = Object.keys(stockByDate).sort();
    if (dates.length === 0) {
      return generateFallbackData();
    }

    let processedData = dates.map(date => ({
      date,
      totalStock: stockByDate[date].totalStock,
      availableStock: stockByDate[date].availableStock
    }));

    // Fill missing dates
    processedData = fillMissingDates(processedData, startDate, today);

    // Aggregate data for longer time ranges
    if (timeRange === '1m' && processedData.length > 15) {
      processedData = aggregateData(processedData, 15);
    } else if (timeRange === '3m' && processedData.length > 20) {
      processedData = aggregateData(processedData, 20);
    }

    return processedData;
  };

  // Generate fallback data when no API data is available
  const generateFallbackData = (): StockTrendData[] => {
    const data: StockTrendData[] = [];
    const today = new Date();
    
    let days = 7;
    let dataPoints = 7;
    
    if (timeRange === '1m') {
      days = 30;
      dataPoints = 15;
    }
    if (timeRange === '3m') {
      days = 90;
      dataPoints = 20;
    }

    for (let i = 0; i < dataPoints; i++) {
      const date = new Date(today);
      const dayOffset = Math.floor((days - 1) * (i / (dataPoints - 1)));
      date.setDate(date.getDate() - dayOffset);
      const dateStr = date.toISOString().split('T')[0];
      
      data.push({
        date: dateStr,
        totalStock: Math.floor(Math.random() * 1000) + 500,
        availableStock: Math.floor(Math.random() * 800) + 400,
      });
    }
    
    return data.reverse();
  };

  const totalStock = stockData.reduce((sum, item) => sum + item.totalStock, 0);
  const maxValueItem = stockData.length > 0 ? stockData.reduce((prev, current) =>
    prev.totalStock > current.totalStock ? prev : current
  ) : { date: '', totalStock: 0, availableStock: 0 };

  const lineData = stockData.map((item, index) => ({
    value: item.totalStock,
    label: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    date: new Date(item.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long' }),
    dataPointText: item.totalStock.toString(),
    topLabelComponent: item.date === maxValueItem.date 
      ? () => <Tooltip date={new Date(item.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long' })} value={item.totalStock} />
      : undefined
  }));

  if (loading) {
    return (
      <View style={styles.card}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading stock trend data...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.card}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchStockTrendData}>
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
          <Text style={styles.emptyText}>No stock trend data available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Stock Trends (This Month)</Text>
        <TimeframePicker />
      </View>
      <View style={styles.chartContainer}>
        <LineChart
          data={lineData}
          areaChart
          curved
          height={200}
          width={screenWidth - 90}
          noOfSections={4}
          spacing={40}
          color={COLORS.primary}
          thickness={3}
          startFillColor={COLORS.primary}
          endFillColor={COLORS.accent}
          startOpacity={0.4}
          endOpacity={0.1}
          initialSpacing={20}
          yAxisTextStyle={{ color: '#A0A0A0', fontSize: 12 }}
          xAxisColor="#E5E7EB"
          yAxisColor="#E5E7EB"
          rulesType="dashed"
          rulesColor="#E5E7EB"
          isAnimated
          animationDuration={1200}
          dataPointsColor={COLORS.primary}
          dataPointsRadius={5}
          hideDataPoints={false}
        />
      </View>
      <View style={styles.summaryContainer}>
        <View style={styles.summaryDot} />
        <Text style={styles.summaryText}>
          <Text style={styles.summaryValue}>{totalStock.toLocaleString()}</Text> Total Stock Units This Month
        </Text>
      </View>
      <Text style={styles.summarySubtitle}>
        Monthly stock level trends over the last 30 days.
      </Text>
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
  tooltipContainer: {
    backgroundColor: '#3D3D3D',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginBottom: 4,
    minWidth: 100,
  },
  tooltipDate: {
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
  summarySubtitle: {
    fontSize: 12,
    color: '#A0A0A0',
    marginTop: 8,
    paddingHorizontal: 10,
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
    borderRadius: BORDER_RADIUS.pill,
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

export default StockTrendChart;