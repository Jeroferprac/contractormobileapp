import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import Icon from 'react-native-vector-icons/Feather';
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
      const last = filledData[filledData.length - 1];
      filledData.push({
        date: dateStr,
        totalStock: last ? last.totalStock : 0,
        availableStock: last ? last.availableStock : 0
      });
    }
  }

  return filledData;
};

const StockTrendChart = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '1m' | '3m'>('7d');
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStockData();
  }, [timeRange]);

  const fetchStockData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryApiService.getWarehouseStocks();
      setStocks(response.data);
    } catch (err) {
      console.error('Error fetching stock data:', err);
      setError('Failed to load stock data');
    } finally {
      setLoading(false);
    }
  };

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
        availableStock: Math.floor(Math.random() * 800) + 300,
      });
    }

    return data.reverse();
  };

  const processStockData = (): StockTrendData[] => {
    if (!stocks.length) {
      return generateFallbackData();
    }

    const today = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(today.getDate() - 6);
        break;
      case '1m':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case '3m':
        startDate.setMonth(today.getMonth() - 3);
        break;
    }

    const filteredStocks = stocks.filter(stock => {
      const stockDate = new Date(stock.updated_at);
      return stockDate >= startDate && stockDate <= today;
    });

    const stocksByDate = filteredStocks.reduce((acc, stock) => {
      const date = new Date(stock.updated_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { totalStock: 0, availableStock: 0 };
      }
      acc[date].totalStock += Number(stock.quantity) || 0;
      acc[date].availableStock += Number(stock.available_quantity) || 0;
      return acc;
    }, {} as Record<string, { totalStock: number; availableStock: number }>);

    const dates = Object.keys(stocksByDate).sort();
    if (dates.length === 0) {
      return generateFallbackData();
    }

    let processedData = dates.map(date => ({
      date,
      totalStock: stocksByDate[date].totalStock,
      availableStock: stocksByDate[date].availableStock
    }));

    if (timeRange === '1m' && processedData.length > 15) {
      processedData = aggregateData(processedData, 15);
    } else if (timeRange === '3m' && processedData.length > 20) {
      processedData = aggregateData(processedData, 20);
    }

    return fillMissingDates(processedData, startDate, today);
  };

  const chartData = processStockData();

  const totalStockData = chartData.map(item => ({
    value: item.totalStock,
    label: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }));

  const availableStockData = chartData.map(item => ({
    value: item.availableStock,
    label: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }));

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <View style={styles.titleContent}>
          <View style={styles.iconContainer}>
            <Icon name="bar-chart-2" size={20} color="#8B5CF6" />
          </View>
          <Text style={styles.title}>Stock Trend</Text>
            </View>

            <View style={styles.buttonGroup}>
          {['7d', '1m', '3m'].map((range) => (
                <TouchableOpacity
                  key={range}
                  style={[
                    styles.button,
                timeRange === range ? styles.activeButton : styles.inactiveButton
                  ]}
              onPress={() => setTimeRange(range as '7d' | '1m' | '3m')}
                >
                  <Text
                    style={[
                      styles.buttonText,
                  timeRange === range ? styles.activeButtonText : styles.inactiveButtonText
                    ]}
                  >
                {range === '7d' ? '7 Days' : range === '1m' ? '1 Month' : '3 Months'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
      <View style={styles.card}>
        <View style={styles.chartContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8B5CF6" />
              <Text style={styles.loadingText}>Loading stock data...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchStockData}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
                  <Text style={styles.legendText}>Total Stock</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.legendText}>Available Stock</Text>
                </View>
            </View>

            <LineChart
                data={totalStockData}
                data2={availableStockData}
                height={200}
                width={screenWidth - 80}
                noOfSections={4}
                spacing={40}
                color="#8B5CF6"
                color2="#10B981"
                thickness={3}
                thickness2={3}
                startFillColor="#8B5CF6"
                endFillColor="#8B5CF6"
                startFillColor2="#10B981"
                endFillColor2="#10B981"
                startOpacity={0.4}
                endOpacity={0.05}
                startOpacity2={0.4}
                endOpacity2={0.05}
                initialSpacing={20}
                endSpacing={20}
                yAxisTextStyle={{ color: '#9CA3AF', fontSize: 10 }}
                yAxisColor="transparent"
                xAxisColor="transparent"
                rulesColor="transparent"
                hideRules
              hideYAxisText
                showVerticalLines={false}
              isAnimated
              animationDuration={1200}
                animateOnDataChange
                onDataChangeAnimationDuration={300}
                animateTogether
              curved
              hideDataPoints={false}
                lineGradient
                lineGradientStartColor="#8B5CF6"
                lineGradientEndColor="#A855F7"
                xAxisLabelTextStyle={{ color: '#6B7280', fontSize: 10 }}
              pointerConfig={{
                  pointerStripHeight: 160,
                  pointerStripColor: '#9CA3AF',
                pointerStripWidth: 1,
                  pointerColor: '#8B5CF6',
                radius: 4,
                pointerLabelWidth: 100,
                  pointerLabelHeight: 90,
                autoAdjustPointerLabelPosition: true,
                  pointerLabelComponent: (items: any) => (
                    <View style={styles.tooltipContainer}>
                      <Text style={styles.tooltipTitle}>{items[0].label}</Text>
                      <View style={styles.tooltipRow}>
                        <View style={[styles.tooltipDot, { backgroundColor: '#8B5CF6' }]} />
                        <Text style={styles.tooltipLabel}>Total Stock:</Text>
                        <Text style={styles.tooltipValue}>{items[0].value}</Text>
                      </View>
                      <View style={styles.tooltipRow}>
                        <View style={[styles.tooltipDot, { backgroundColor: '#10B981' }]} />
                        <Text style={styles.tooltipLabel}>Available:</Text>
                        <Text style={styles.tooltipValue}>{items[1]?.value || 0}</Text>
                      </View>
                    </View>
                  ),
              }}
            />
            </>
          )}
          </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: SPACING.md },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  titleContent: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    color: COLORS.text.primary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  buttonGroup: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: BORDER_RADIUS.md,
    padding: 2,
  },
  button: { paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.sm },
  activeButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  inactiveButton: { backgroundColor: 'transparent' },
  buttonText: { fontSize: TYPOGRAPHY.sizes.xs, fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif' },
  activeButtonText: { color: COLORS.text.primary, fontWeight: '500' },
  inactiveButtonText: { color: COLORS.text.secondary },
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
  chartContainer: { alignItems: 'center', justifyContent: 'center', width: '100%' },
  legendContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: SPACING.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: SPACING.md },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: SPACING.xs },
  legendText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  loadingContainer: { height: 200, justifyContent: 'center', alignItems: 'center' },
  loadingText: {
    marginTop: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  errorContainer: { height: 200, justifyContent: 'center', alignItems: 'center' },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.status.error,
    marginBottom: SPACING.sm,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  retryButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: '#8B5CF6',
    borderRadius: BORDER_RADIUS.md,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '500',
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
  tooltipRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 2 },
  tooltipDot: { width: 6, height: 6, borderRadius: 3, marginRight: SPACING.xs },
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

export default StockTrendChart;
