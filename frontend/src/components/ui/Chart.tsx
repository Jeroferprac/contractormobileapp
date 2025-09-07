import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import FadeSlideInView from './FadeSlideInView';
import { ChartSkeleton } from './LoadingSkeleton';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';

interface ChartDataPoint {
  value: number;
  label: string;
  dataPointText: string;
}

interface ChartProps {
  title: string;
  data: ChartDataPoint[];
  height?: number;
  showLegend?: boolean;
  loading?: boolean;
}

// --- Reusable Internal Components ---

const Tooltip = ({ time }: { time: string }) => (
  <View style={styles.tooltipContainer}>
    <Text style={styles.tooltipTitle}>Most Active</Text>
    <Text style={styles.tooltipTime}>Time - {time}</Text>
  </View>
);

const TimeframePicker = () => (
  <TouchableOpacity style={styles.pickerContainer}>
    <Text style={styles.pickerText}>In week</Text>
    <Icon name="chevron-down" size={16} color="#333" />
  </TouchableOpacity>
);

const Chart: React.FC<ChartProps> = ({
  title,
  data,
  height = 220,
  showLegend = true,
  loading = false,
}) => {
  const [selectedDataPoint, setSelectedDataPoint] = useState<number | null>(null);
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - SPACING.lg * 2;

  const maxValueItem = data.length > 0 ? data.reduce((prev, current) =>
    prev.value > current.value ? prev : current
  ) : { value: 0, label: '', dataPointText: '' };

  const chartData = useMemo(
    () =>
      data.map((item, index) => ({
        ...item,
        topLabelComponent: item.label === maxValueItem.label
          ? () => <Tooltip time={`${item.value}:09`} />
          : undefined
      })),
    [data, maxValueItem]
  );

  const handleDataPointPress = (_: any, index: number) => {
    setSelectedDataPoint((prev) => (prev === index ? null : index));
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TimeframePicker />
      </View>
      <View style={styles.chartContainer}>
        {loading ? (
          <ChartSkeleton />
        ) : data.length === 0 ? (
          <FadeSlideInView delay={400}>
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No data available</Text>
            </View>
          </FadeSlideInView>
        ) : (
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
            maxValue={1440}
            yAxisLabelTexts={['00:00', '06:00', '12:00', '18:00', '24:00']}
            isAnimated
            animationDuration={800}
            showGradient
            gradientColor={COLORS.gradient.primary[1]}
            frontColor={COLORS.gradient.primary[0]}
          />
        )}
      </View>
      <View style={styles.summaryContainer}>
        <View style={styles.summaryDot} />
        <Text style={styles.summaryText}>
          <Text style={styles.summaryValue}>Most Active Time Slots: </Text>
          12:00 to 21:30 (Mon-Fri), with the busiest day on Wednesday
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
  tooltipTime: {
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
  noDataContainer: {
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});

export default Chart;