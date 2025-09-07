import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  Alert,
  Share,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GroupedSalesSummary } from '../../../types/inventory';
import { SPACING, BORDER_RADIUS } from '../../../constants/spacing';
import Svg, { Path, Line, Circle } from 'react-native-svg';

interface SalesChartProps {
  data: GroupedSalesSummary[];
  timeframe: 'daily' | 'weekly' | 'monthly';
  onTimeframeChange: (timeframe: 'daily' | 'weekly' | 'monthly') => void;
  showTitleInside?: boolean;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onShare?: () => void;
}

export interface SalesChartHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  share: () => void;
}

const { width } = Dimensions.get('window');

interface TooltipData {
  x: number;
  y: number;
  currentValue: number;
  pastValue: number;
  label: string;
  period: string;
}

const SalesChart = forwardRef<SalesChartHandle, SalesChartProps>(({ data, timeframe, onTimeframeChange, showTitleInside = true, onZoomIn, onZoomOut, onShare }, ref) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('Week');
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const tooltipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useImperativeHandle(ref, () => ({
    zoomIn: () => handleZoomIn(),
    zoomOut: () => handleZoomOut(),
    share: () => handleShareChart(),
  }));

  const getChartData = (timeframe: string) => {
    
    if (!data || data.length === 0) {
      return [];
    }

    const currentData = data.map((item, index) => {
      let currentLabel = item.label;
      let previousLabel = '';
      
      // Generate appropriate comparison labels
      switch (timeframe) {
        case 'Week':
          currentLabel = `Week ${index + 1}`;
          previousLabel = `Week ${index + 1}`;
          break;
        case 'Month':
          // Convert month numbers to names
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const currentMonth = parseInt(item.label.split('-')[1]) - 1;
          const previousMonth = currentMonth > 0 ? currentMonth - 1 : 11;
          currentLabel = monthNames[currentMonth];
          previousLabel = monthNames[previousMonth];
          break;
        case 'Year':
          const currentYear = item.label.split('-')[0];
          const previousYear = parseInt(currentYear) - 1;
          currentLabel = currentYear;
          previousLabel = previousYear.toString();
          break;
        default:
          currentLabel = item.label;
          previousLabel = item.label;
      }

      return {
        day: currentLabel,
        previousLabel: previousLabel,
        value: item.total_revenue || 0,
        value2023: (item.total_revenue || 0) * 0.85, // Simulate previous period data (85% of current)
        period: timeframe,
      };
    });

    return currentData;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handlePointPress = (index: number, x: number, y: number, currentValue: number, pastValue: number, label: string) => {
    setSelectedPoint(index);
    setTooltipData({
      x,
      y,
      currentValue,
      pastValue,
      label,
      period: selectedTimeframe,
    });
    
    // Animate tooltip
    Animated.timing(tooltipAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    
    setTooltipVisible(true);
  };

  const handleChartPress = () => {
    if (tooltipVisible) {
      Animated.timing(tooltipAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start(() => {
        setTooltipVisible(false);
        setSelectedPoint(null);
      });
    }
  };

  const handleZoomIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 1.2,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleZoomOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleShareChart = async () => {
    try {
      const chartData = getChartData(selectedTimeframe);
      const summary = chartData.reduce((acc, item) => acc + item.value, 0);
      
      await Share.share({
        message: `Sales Performance Report\n\nPeriod: ${selectedTimeframe}\nTotal Revenue: ${formatCurrency(summary)}\nGenerated on: ${new Date().toLocaleDateString()}`,
        title: 'Sales Performance Chart',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share chart data');
    }
  };

  // Expose external triggers if provided (not used directly, but preserved for API compatibility)
  useEffect(() => {}, [onZoomIn, onZoomOut, onShare]);

  const renderChart = () => {
    const chartData = getChartData(selectedTimeframe);
    if (chartData.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Icon name="bar-chart" size={48} color="#6C757D" />
          <Text style={styles.emptyText}>No data available</Text>
          <Text style={styles.emptySubtext}>Try selecting a different timeframe</Text>
        </View>
      );
    }

    const maxValue = Math.max(...chartData.map(d => Math.max(d.value, d.value2023)));
    const chartWidth = width - 80;
    const chartHeight = 120;
    const barWidth = chartWidth / chartData.length - 8;
    const spacing = 8;

    return (
      <TouchableOpacity 
        style={styles.chartContainer} 
        onPress={handleChartPress}
        activeOpacity={1}
      >
        <Svg width={chartWidth} height={chartHeight}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
            <Line
              key={`grid-${index}`}
              x1={0}
              y1={ratio * chartHeight}
              x2={chartWidth}
              y2={ratio * chartHeight}
              stroke="#E9ECEF"
              strokeWidth={1}
            />
          ))}

          {/* Past period line (grey) */}
          <Path
            d={chartData.map((item, index) => {
              const x = index * (barWidth + spacing) + barWidth / 2;
              const y = chartHeight - (item.value2023 / maxValue) * chartHeight;
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            stroke="#6C757D"
            strokeWidth={2}
            fill="none"
            opacity={0.6}
          />

          {/* Current period line (theme color) */}
          <Path
            d={chartData.map((item, index) => {
              const x = index * (barWidth + spacing) + barWidth / 2;
              const y = chartHeight - (item.value / maxValue) * chartHeight;
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            stroke="#FB7504"
            strokeWidth={3}
            fill="none"
          />

          {/* Interactive data points for current period */}
          {chartData.map((item, index) => {
            const x = index * (barWidth + spacing) + barWidth / 2;
            const y = chartHeight - (item.value / maxValue) * chartHeight;
            return (
              <TouchableOpacity
                key={`point-${index}`}
                onPress={() => handlePointPress(index, x, y, item.value, item.value2023, item.day)}
                style={[
                  styles.pointTouchArea,
                  {
                    left: x - 15,
                    top: y - 15,
                  }
                ]}
              >
                <Circle
                  cx={x}
                  cy={y}
                  r={selectedPoint === index ? 6 : 4}
                  fill={selectedPoint === index ? "#C2252C" : "#FB7504"}
                  stroke={selectedPoint === index ? "#FFFFFF" : "none"}
                  strokeWidth={2}
                />
              </TouchableOpacity>
            );
          })}

          {/* Interactive data points for past period */}
          {chartData.map((item, index) => {
            const x = index * (barWidth + spacing) + barWidth / 2;
            const y = chartHeight - (item.value2023 / maxValue) * chartHeight;
            return (
              <TouchableOpacity
                key={`point-past-${index}`}
                onPress={() => handlePointPress(index, x, y, item.value, item.value2023, item.day)}
                style={[
                  styles.pointTouchArea,
                  {
                    left: x - 15,
                    top: y - 15,
                  }
                ]}
              >
                <Circle
                  cx={x}
                  cy={y}
                  r={selectedPoint === index ? 5 : 3}
                  fill={selectedPoint === index ? "#495057" : "#6C757D"}
                  opacity={0.6}
                  stroke={selectedPoint === index ? "#FFFFFF" : "none"}
                  strokeWidth={2}
                />
              </TouchableOpacity>
            );
          })}
        </Svg>

        {/* X-axis labels */}
        <View style={styles.chartLabels}>
          {chartData.map((item, index) => (
            <Text key={index} style={styles.chartLabel}>
              {item.day}
            </Text>
          ))}
        </View>

        {/* Tooltip */}
        {tooltipVisible && tooltipData && (
          <Animated.View 
            style={[
              styles.tooltip,
              {
                left: tooltipData.x - 80,
                top: tooltipData.y - 100,
                opacity: tooltipAnim,
                transform: [{
                  scale: tooltipAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  })
                }]
              }
            ]}
          >
            <View style={styles.tooltipContent}>
              <Text style={styles.tooltipTitle}>{tooltipData.label}</Text>
              
              {/* Current Period */}
              <View style={styles.tooltipSection}>
                <Text style={styles.tooltipSectionTitle}>
                  {selectedTimeframe === 'Week' ? `Week ${tooltipData.period}` : 
                   selectedTimeframe === 'Month' ? tooltipData.label :
                   selectedTimeframe === 'Year' ? tooltipData.label : 'Current Period'}
                </Text>
                <Text style={styles.tooltipValue}>{formatCurrency(tooltipData.currentValue)}</Text>
              </View>

              {/* Previous Period */}
              <View style={styles.tooltipSection}>
                <Text style={styles.tooltipSectionTitle}>
                  {selectedTimeframe === 'Week' ? `Week ${parseInt(tooltipData.period) - 1}` : 
                   selectedTimeframe === 'Month' ? tooltipData.label :
                   selectedTimeframe === 'Year' ? (parseInt(tooltipData.label) - 1).toString() : 'Previous Period'}
                </Text>
                <Text style={styles.tooltipValue}>{formatCurrency(tooltipData.pastValue)}</Text>
              </View>

              {/* Change Analysis */}
              <View style={styles.tooltipChangeSection}>
                {(() => {
                  const change = tooltipData.currentValue - tooltipData.pastValue;
                  const changePercent = tooltipData.pastValue > 0 ? (change / tooltipData.pastValue) * 100 : 0;
                  const isPositive = change >= 0;
                  
                  return (
                    <>
                      <View style={styles.tooltipRow}>
                        <Icon 
                          name={isPositive ? "trending-up" : "trending-down"} 
                          size={14} 
                          color={isPositive ? "#FB7504" : "#F44336"} 
                        />
                        <Text style={[
                          styles.tooltipChange,
                          { color: isPositive ? "#FB7504" : "#F44336" }
                        ]}>
                          {isPositive ? '+' : ''}{formatCurrency(change)}
                        </Text>
                      </View>
                      <Text style={[
                        styles.tooltipChangePercent,
                        { color: isPositive ? "#FB7504" : "#F44336" }
                      ]}>
                        {isPositive ? '+' : ''}{changePercent.toFixed(1)}%
                      </Text>
                    </>
                  );
                })()}
              </View>

              <View style={styles.tooltipArrow} />
            </View>
          </Animated.View>
        )}
      </TouchableOpacity>
    );
  };

  const handleTimeframeChangeLocal = (timeframe: string) => {
    setSelectedTimeframe(timeframe);
    // Hide tooltip when timeframe changes
    if (tooltipVisible) {
      setTooltipVisible(false);
      setSelectedPoint(null);
    }
  };

  const getComparisonText = () => {
    const chartData = getChartData(selectedTimeframe);
    if (chartData.length === 0) return 'No data available';

    switch (selectedTimeframe) {
      case 'Week':
        return `Week ${chartData.length} vs Week ${chartData.length - 1}`;
      case 'Month':
        const currentMonth = chartData[chartData.length - 1]?.day || 'Current';
        const previousMonth = chartData[chartData.length - 1]?.previousLabel || 'Previous';
        return `${currentMonth} vs ${previousMonth}`;
      case 'Year':
        const currentYear = chartData[chartData.length - 1]?.day || '2025';
        const previousYear = chartData[chartData.length - 1]?.previousLabel || '2024';
        return `${currentYear} vs ${previousYear}`;
      default:
        return 'Current vs Previous Period';
    }
  };

  const getTooltipContent = (tooltipData: TooltipData) => {
    const currentPeriod = selectedTimeframe === 'Week' ? `Week ${tooltipData.period}` : 
                         selectedTimeframe === 'Month' ? tooltipData.label :
                         selectedTimeframe === 'Year' ? tooltipData.label : 'Current';
    
    const previousPeriod = selectedTimeframe === 'Week' ? `Week ${parseInt(tooltipData.period) - 1}` :
                          selectedTimeframe === 'Month' ? tooltipData.label :
                          selectedTimeframe === 'Year' ? (parseInt(tooltipData.label) - 1).toString() : 'Previous';

    const change = tooltipData.currentValue - tooltipData.pastValue;
    const changePercent = tooltipData.pastValue > 0 ? (change / tooltipData.pastValue) * 100 : 0;
    const isPositive = change >= 0;

    return {
      currentPeriod,
      previousPeriod,
      change,
      changePercent,
      isPositive
    };
  };

  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Sales Performance</Text>
          <TouchableOpacity style={styles.dropdown}>
            <Text style={styles.dropdownText}>In week</Text>
            <Text style={styles.dropdownArrow}>▾</Text>
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 10 }}>
          {renderChart()}
        </View>

        <View style={styles.footer}>
          <View style={styles.footerIndicator}></View>
          <View>
            <Text style={styles.footerTitle}>Most Active Time Slots:</Text>
            <Text style={styles.footerSubtitle}>12:00 to 21:30 (Mon-Fri), with the busiest day on Wednesday</Text>
          </View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#f9f9f9',
    padding: 16,
  },
  container: {
    backgroundColor: 'white',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f6f6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  dropdownText: {
    color: '#555',
    fontWeight: '500',
    fontSize: 13,
    marginRight: 6,
  },
  dropdownArrow: {
    fontSize: 13,
    color: '#555',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 24,
    paddingHorizontal: 8,
  },
  footerIndicator: {
    width: 10,
    height: 10,
    backgroundColor: '#E7600E',
    borderRadius: 5,
    marginRight: 12,
    marginTop: 4,
  },
  footerTitle: {
    fontWeight: '600',
    color: '#333',
    fontSize: 14,
  },
  footerSubtitle: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
    lineHeight: 18,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: SPACING.sm,
  },
  chartLabel: {
    fontSize: 10,
    color: '#6C757D',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 120,
  },
  emptyText: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: SPACING.sm,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#ADB5BD',
    marginTop: SPACING.xs,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    padding: SPACING.sm,
    borderRadius: 12,
    backgroundColor: '#E9ECEF',
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 14,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 10,
    minWidth: 160,
  },
  tooltipContent: {
    alignItems: 'center',
  },
  tooltipTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#212529',
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  tooltipSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    width: '100%',
  },
  tooltipSectionTitle: {
    fontSize: 11,
    color: '#6C757D',
    fontWeight: '500',
    flex: 1,
  },
  tooltipValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212529',
    textAlign: 'right',
  },
  tooltipChangeSection: {
    marginTop: SPACING.xs,
    marginBottom: 2,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    width: '100%',
  },
  tooltipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  tooltipChange: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  tooltipChangePercent: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  tooltipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FB7504',
    marginRight: SPACING.xs,
  },
  tooltipLabel: {
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '500',
    marginRight: SPACING.xs,
  },
  tooltipArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFFFFF',
    marginTop: SPACING.xs,
  },
  pointTouchArea: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SalesChart;
