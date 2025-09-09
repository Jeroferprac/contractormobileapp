import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import BarChart from '../ui/BarChart';
import { BarChartData } from '../../types/inventory';

const AnimatedView = (Animated as any).createAnimatedComponent(View);

type StockReportChartProps = {
  title?: string;
  timeframe?: string;
  data: BarChartData[];
  loading?: boolean;
  onTimeframeChange?: (timeframe: string) => void;
  onBarPress?: (index: number, item: BarChartData) => void;
};

export default function StockReportChart({
  title = 'Stock Report',
  timeframe = 'In week',
  data,
  loading = false,
  onTimeframeChange,
  onBarPress,
}: StockReportChartProps) {
  const entry = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(entry, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [entry]);

  const translateY = entry.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });
  const opacity = entry;

  const total = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data]);

  const handleTimeframeChange = (newTimeframe: string) => {
    if (onTimeframeChange) {
      // Cycle through different timeframes
      const timeframes = ['In week', 'In month', 'In year'];
      const currentIndex = timeframes.indexOf(timeframe);
      const nextIndex = (currentIndex + 1) % timeframes.length;
      onTimeframeChange(timeframes[nextIndex]);
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* Page title + timeframe (OUTSIDE the white card as requested) */}
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>{title}</Text>
          <Text style={styles.pageSubtitle}>Overview of stock levels across warehouses</Text>
        </View>

        <TouchableOpacity 
          style={styles.timeframeButton} 
          activeOpacity={0.85}
          onPress={handleTimeframeChange}
        >
          <Text style={styles.timeframeText}>{timeframe}</Text>
        </TouchableOpacity>
      </View>

      {/* Card containing chart and footer */}
      <AnimatedView style={[styles.card, { transform: [{ translateY }], opacity }]}>
        <View style={styles.chartContainer}>
          <BarChart 
            data={data} 
            height={220}
            loading={loading}
            onBarPress={(i, item) => {
              console.log('Bar pressed:', i, item);
              onBarPress && onBarPress(i, item);
            }} 
          />
        </View>

        {/* Footer: left description; right total items with value */}
        <View style={styles.footerContainer}>
          <View style={styles.footerLeft}>
            <Text style={styles.summaryText}>
              {data.length > 0 
                ? `Most warehouses have healthy stock levels. ${data.length} warehouses tracked.`
                : 'No warehouse data available.'
              }
            </Text>
          </View>

          <View style={styles.footerRight}>
            <View style={styles.totalItemsContainer}>
              <View style={[styles.legendDot, { backgroundColor: '#FF8A65' }]} />
              <Text style={styles.legendText}>Total items</Text>
            </View>
            <Text style={styles.totalValue}>{Math.round(total).toLocaleString()}</Text>
          </View>
        </View>
      </AnimatedView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    marginVertical: 8,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 0,
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
    padding: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
    overflow: 'hidden',
    marginTop: 8,
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
    justifyContent: 'center',
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
    flexShrink: 1,
    textAlign: 'left',
  },
});
