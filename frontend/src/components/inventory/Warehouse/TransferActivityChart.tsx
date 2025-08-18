import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../../constants/spacing';
import { TYPOGRAPHY } from '../../../constants/typography';
import { inventoryApiService } from '../../../api/inventoryApi';
import { Transfer } from '../../../types/inventory';

interface TransferData {
  date: string;
  inbound: number;
  outbound: number;
}

const { width: screenWidth } = Dimensions.get('window');

// Helper function to aggregate data for longer time ranges
const aggregateData = (data: TransferData[], targetPoints: number): TransferData[] => {
  if (data.length <= targetPoints) return data;
  
  const aggregated: TransferData[] = [];
  const step = Math.ceil(data.length / targetPoints);
  
  for (let i = 0; i < data.length; i += step) {
    const chunk = data.slice(i, i + step);
    const aggregatedItem = {
      date: chunk[0].date,
      inbound: Math.round(chunk.reduce((sum, item) => sum + item.inbound, 0) / chunk.length),
      outbound: Math.round(chunk.reduce((sum, item) => sum + item.outbound, 0) / chunk.length)
    };
    aggregated.push(aggregatedItem);
  }
  
  return aggregated;
};

const TransferActivityChart = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '1m' | '3m'>('7d');
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransfers();
  }, [timeRange]);

  const fetchTransfers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryApiService.getTransfers();
      setTransfers(response.data);
    } catch (err) {
      console.error('Error fetching transfers:', err);
      setError('Failed to load transfer data');
    } finally {
      setLoading(false);
    }
  };

  // Generate fallback data when no API data is available
  const generateFallbackData = (): TransferData[] => {
    const data: TransferData[] = [];
    const today = new Date();
    
    let days = 7;
    let dataPoints = 7;
    
    if (timeRange === '1m') {
      days = 30;
      dataPoints = 15; // Show every 2 days for 1 month
    }
    if (timeRange === '3m') {
      days = 90;
      dataPoints = 20; // Show every 4-5 days for 3 months
    }

    for (let i = 0; i < dataPoints; i++) {
      const date = new Date(today);
      const dayOffset = Math.floor((days - 1) * (i / (dataPoints - 1)));
      date.setDate(date.getDate() - dayOffset);
      const dateStr = date.toISOString().split('T')[0];
      
      data.push({
        date: dateStr,
        inbound: Math.floor(Math.random() * 50) + 10,
        outbound: Math.floor(Math.random() * 40) + 5,
      });
    }
    
    return data.reverse();
  };

  // Process transfers data for the chart with proper filtering
  const processTransferData = (): TransferData[] => {
    if (!transfers.length) {
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

    // Filter transfers within the date range
    const filteredTransfers = transfers.filter(transfer => {
      const transferDate = new Date(transfer.created_at);
      return transferDate >= startDate && transferDate <= today;
    });

    // Group transfers by date and calculate transfer activity
    const transfersByDate = filteredTransfers.reduce((acc, transfer) => {
      const date = new Date(transfer.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { inbound: 0, outbound: 0 };
      }
      
      // Count transfers by status and direction
      if (transfer.status === 'completed') {
        // Count items in the transfer
        const itemCount = transfer.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        
        // Determine if it's inbound or outbound based on warehouse direction
        if (transfer.to_warehouse_id) {
          acc[date].inbound += itemCount;
        }
      if (transfer.from_warehouse_id) {
          acc[date].outbound += itemCount;
      }
      }
      
      return acc;
    }, {} as Record<string, { inbound: number; outbound: number }>);

    // Convert to array format for chart
    const dates = Object.keys(transfersByDate).sort();
    if (dates.length === 0) {
      return generateFallbackData();
    }

    // For longer time ranges, aggregate data to show fewer points
    let processedData = dates.map(date => ({
      date,
      inbound: transfersByDate[date].inbound,
      outbound: transfersByDate[date].outbound
    }));

    // If we have too many data points for longer ranges, aggregate them
    if (timeRange === '1m' && processedData.length > 15) {
      processedData = aggregateData(processedData, 15);
    } else if (timeRange === '3m' && processedData.length > 20) {
      processedData = aggregateData(processedData, 20);
    }

    return processedData;
  };

  const chartData = processTransferData();

  const inboundData = chartData.map(item => ({ 
    value: item.inbound, 
    label: new Date(item.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }));
  
  const outboundData = chartData.map(item => ({ 
    value: item.outbound, 
    label: new Date(item.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }));

  return (
    <View style={styles.container}>
      {/* Title outside chart at top right */}
      <View style={styles.titleContainer}>
        <View style={styles.titleContent}>
          <View style={styles.iconContainer}>
            <Icon name="trending-up" size={20} color="#FF6B35" />
          </View>
        <Text style={styles.title}>Transfer Activity</Text>
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

      {/* Chart Card */}
      <View style={styles.card}>
          <View style={styles.chartContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Loading transfer data...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchTransfers}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.legendContainer}>
                  <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
                    <Text style={styles.legendText}>Inbound</Text>
                  </View>
                  <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                    <Text style={styles.legendText}>Outbound</Text>
                  </View>
                </View>

            <LineChart
              data={inboundData}
              data2={outboundData}
                height={200}
                width={screenWidth - 80}
              noOfSections={4}
              spacing={40}
                color="#3B82F6"
                color2="#EF4444"
                thickness={3}
                thickness2={3}
                startFillColor="#3B82F6"
                startFillColor2="#EF4444"
                endFillColor="#3B82F6"
                endFillColor2="#EF4444"
                startOpacity={0.8}
                startOpacity2={0.8}
              endOpacity={0.0}
              endOpacity2={0.0}
                initialSpacing={20}
                endSpacing={20}
                yAxisTextStyle={{ color: '#9CA3AF', fontSize: 10 }}
                yAxisColor="transparent"
                xAxisColor="transparent"
                rulesColor="transparent"
                hideRules={true}
                hideYAxisText={true}
                showVerticalLines={false}
              isAnimated
              animationDuration={1200}
              animateOnDataChange
              onDataChangeAnimationDuration={300}
              animateTogether
              curved
              hideDataPoints={false}
                lineGradient
                lineGradientStartColor="#3B82F6"
                lineGradientEndColor="#1D4ED8"
                xAxisLabelTextStyle={{ color: '#6B7280', fontSize: 10 }}
              pointerConfig={{
                pointerStripHeight: 160,
                  pointerStripColor: '#9CA3AF',
                pointerStripWidth: 1,
                  pointerColor: '#3B82F6',
                radius: 4,
                pointerLabelWidth: 100,
                pointerLabelHeight: 90,
                  activatePointersOnLongPress: false,
                autoAdjustPointerLabelPosition: true,
                pointerLabelComponent: (items: any) => {
                  return (
                    <View style={styles.tooltipContainer}>
                        <Text style={styles.tooltipTitle}>{items[0].label}</Text>
                      <View style={styles.tooltipRow}>
                          <View style={[styles.tooltipDot, { backgroundColor: '#3B82F6' }]} />
                        <Text style={styles.tooltipLabel}>Inbound:</Text>
                        <Text style={styles.tooltipValue}>{items[0].value}</Text>
                      </View>
                      <View style={styles.tooltipRow}>
                          <View style={[styles.tooltipDot, { backgroundColor: '#EF4444' }]} />
                        <Text style={styles.tooltipLabel}>Outbound:</Text>
                          <Text style={styles.tooltipValue}>{items[1]?.value || 0}</Text>
                      </View>
                    </View>
                  );
                },
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
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
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
  button: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  activeButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  inactiveButton: {
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  activeButtonText: {
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  inactiveButtonText: {
    color: COLORS.text.secondary,
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
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  legendText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  loadingContainer: {
    height: 200,
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
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.status.error,
    marginBottom: SPACING.sm,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  retryButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: '#3B82F6',
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
  tooltipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  tooltipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: SPACING.xs,
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

export default TransferActivityChart;
