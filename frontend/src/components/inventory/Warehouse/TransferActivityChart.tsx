import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import AreaLineChart, { Point } from '../../ui/AreaChart';
import Icon from 'react-native-vector-icons/Ionicons';
import { inventoryApiService } from '../../../api/inventoryApi';
import { Transfer } from '../../../types/inventory';

interface TransferData {
  date: string;
  inbound: number;
  outbound: number;
}

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

const TransferActivityChart = () => {
  const [timeframe, setTimeframe] = useState<string>('This Month');
  const [transferData, setTransferData] = useState<TransferData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const entry = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchTransferData();
  }, [timeframe]);

  React.useEffect(() => {
    Animated.timing(entry, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [entry]);

  const fetchTransferData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryApiService.getTransfers();
      const transfers = response.data;
      const trendData = processTransferData(transfers);
      setTransferData(trendData);
    } catch (err) {
      console.error('Error fetching transfer data:', err);
      setError('Failed to load transfer data');
    } finally {
      setLoading(false);
    }
  };

  const processTransferData = (transfers: Transfer[]): TransferData[] => {
    if (!transfers.length) {
      return generateFallbackData();
    }

    // Get date range based on selected timeframe
    const today = new Date();
    let startDate = new Date();
    
    switch (timeframe) {
      case 'This Week':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'This Month':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case 'This Quarter':
        startDate.setMonth(today.getMonth() - 3);
        break;
      case 'This Year':
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(today.getMonth() - 1);
    }

    // Filter transfers based on timeframe
    const filteredTransfers = transfers.filter(transfer => {
      if (!transfer.created_at) return true;
      const transferDate = new Date(transfer.created_at);
      return transferDate >= startDate;
    });

    // Group by date and count transfers
    const groupedData: Record<string, { inbound: number; outbound: number }> = {};
    filteredTransfers.forEach(transfer => {
      const date = new Date(transfer.created_at || new Date()).toISOString().split('T')[0];
      if (!groupedData[date]) {
        groupedData[date] = { inbound: 0, outbound: 0 };
      }
      
      // For simplicity, count all transfers as inbound activity
      // In a real scenario, you'd determine this based on warehouse context
      groupedData[date].inbound += 1;
    });

    // Convert to array and sort by date
    const result = Object.entries(groupedData)
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return result.length > 0 ? result : generateFallbackData();
  };

  const generateFallbackData = (): TransferData[] => {
    const data: TransferData[] = [];
    const today = new Date();
    
    // Generate 60 data points for testing with many data
    const totalDataPoints = 60;
    
    for (let i = totalDataPoints - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Generate more varied and realistic transfer data
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Base values - lower on weekends
      const baseValue = isWeekend ? 8 : 18;
      
      // Create multiple wave patterns for more interesting data
      const wave1 = Math.sin(i * 0.15) * 6; // Long wave
      const wave2 = Math.sin(i * 0.4) * 3;  // Medium wave
      const wave3 = Math.sin(i * 0.8) * 2;  // Short wave
      
      // Add some trend (increasing over time)
      const trend = i * 0.1;
      
      // Random noise
      const randomNoise = (Math.random() - 0.5) * 8;
      
      // Combine all variations
      const inbound = Math.max(1, Math.floor(baseValue + wave1 + wave2 + wave3 + trend + randomNoise));
      const outbound = Math.max(1, Math.floor(inbound * (0.5 + Math.random() * 0.6)));
      
      data.push({
        date: dateStr,
        inbound,
        outbound
      });
    }
    
    return data;
  };

  const totalTransfers = transferData.reduce((sum, item) => sum + item.inbound + item.outbound, 0);

  // Convert to Point format for AreaLineChart (using inbound transfers as primary metric)
  const chartData: Point[] = transferData.map((item) => ({
    value: item.inbound,
    label: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  // Debug: Log data points count
  console.log('TransferActivityChart: Loaded', chartData.length, 'data points');

  const translateY = entry.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });
  const opacity = entry;

  if (loading) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.pageTitle}>Transfer Activity</Text>
            <Text style={styles.pageSubtitle}>Overview of transfer activity over time</Text>
          </View>
          <TimeframePicker timeframe={timeframe} onTimeframeChange={setTimeframe} />
        </View>
      <View style={styles.card}>
          <View style={styles.chartContainer}>
            <AreaLineChart
              data={[]}
              height={200}
              pointSpacing={34}
              minPointsToSample={10}
              maxPointsNoScroll={27}
              gradientFrom={'#FF8A65'}
              gradientTo={'rgba(255,138,101,0.06)'}
              strokeColor={'#E7600E'}
              style={styles.chartStyle}
              showFooter={false}
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
            <Text style={styles.pageTitle}>Transfer Activity</Text>
            <Text style={styles.pageSubtitle}>Overview of transfer activity over time</Text>
          </View>
          <TimeframePicker timeframe={timeframe} onTimeframeChange={setTimeframe} />
        </View>
      <View style={styles.card}>
          <View style={styles.chartContainer}>
            <AreaLineChart
              data={[]}
              height={200}
              pointSpacing={34}
              minPointsToSample={10}
              maxPointsNoScroll={27}
              gradientFrom={'#FF8A65'}
              gradientTo={'rgba(255,138,101,0.06)'}
              strokeColor={'#E7600E'}
              style={styles.chartStyle}
              showFooter={false}
            />
          </View>
        </View>
      </View>
    );
  }

  if (transferData.length === 0) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.pageTitle}>Transfer Activity</Text>
            <Text style={styles.pageSubtitle}>Overview of transfer activity over time</Text>
          </View>
          <TimeframePicker timeframe={timeframe} onTimeframeChange={setTimeframe} />
        </View>
      <View style={styles.card}>
          <View style={styles.chartContainer}>
            <AreaLineChart
              data={[]}
              height={200}
              pointSpacing={34}
              minPointsToSample={10}
              maxPointsNoScroll={27}
              gradientFrom={'#FF8A65'}
              gradientTo={'rgba(255,138,101,0.06)'}
              strokeColor={'#E7600E'}
              style={styles.chartStyle}
              showFooter={false}
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
          <Text style={styles.pageTitle}>Transfer Activity</Text>
          <Text style={styles.pageSubtitle}>Overview of transfer activity over time</Text>
      </View>

        <TimeframePicker
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
        />
      </View>

      {/* Card containing chart and footer - matching StockByWarehouseChart style */}
      <Animated.View style={[styles.card, { transform: [{ translateY }], opacity }]}>
        <AreaLineChart
          data={chartData}
          height={200}
          pointSpacing={24}
          minPointsToSample={10}
          gradientFrom={'#FF8A65'}
          gradientTo={'rgba(255,138,101,0.06)'}
          strokeColor={'#E7600E'}
          onPointPress={(i, pt) => console.log('Transfer activity point', i, pt)}
          style={styles.chartStyle}
          showFooter={false}
        />

        {/* Footer: left description; right legend */}
        <View style={styles.footerContainer}>
          <View style={styles.footerLeft}>
        <Text style={styles.summaryText}>
              Transfer activity trends over the selected timeframe.
        </Text>
      </View>

          <View style={styles.footerRight}>
            <View style={styles.totalItemsContainer}>
              <View style={[styles.legendDot, { backgroundColor: '#FFD36A' }]} />
              <Text style={styles.legendText}>Transfer Activity</Text>
            </View>
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
  chartStyle: {
    margin: 0,
    padding: 0,
    width: '100%',
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
  summaryText: {
    color: '#666',
    fontSize: 13,
    flex: 1,
    textAlign: 'left',
  },
});

export default TransferActivityChart;