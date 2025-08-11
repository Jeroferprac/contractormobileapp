// Chart.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import Icon from 'react-native-vector-icons/Feather';
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

  const chartData = useMemo(
    () =>
      data.map((item, index) => ({
        ...item,
        frontColor: index % 2 === 0 ? '#FF6B35' : '#FF8C42',
        gradientColor: index % 2 === 0 ? '#FF8C42' : '#FF6B35',
        barBorderRadius: BORDER_RADIUS.md,
      })),
    [data]
  );

  const handleDataPointPress = (_: any, index: number) => {
    setSelectedDataPoint((prev) => (prev === index ? null : index));
  };

  return (
    <FadeSlideInView delay={200}>
      <View style={styles.container}>
        <FadeSlideInView delay={300}>
          <View style={styles.titleContainer}>
            <Icon name="bar-chart-2" size={20} color={COLORS.primary} style={styles.titleIcon} />
            <Text style={styles.title}>{title}</Text>
          </View>
        </FadeSlideInView>

        {loading ? (
          <ChartSkeleton />
        ) : data.length === 0 ? (
          <FadeSlideInView delay={400}>
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No data available</Text>
            </View>
          </FadeSlideInView>
        ) : (
          <>
            <FadeSlideInView delay={400}>
              <View style={styles.chartContainer}>
                <BarChart
                  data={chartData}
                  height={height}
                  width={chartWidth}
                  barWidth={32}
                  initialSpacing={20}
                  spacing={30}
                  barBorderRadius={BORDER_RADIUS.md}
                  hideRules
                  yAxisThickness={0}
                  xAxisThickness={0}
                  showGradient
                  isAnimated
                  animationDuration={1200}
                  showVerticalLines
                  verticalLinesColor={COLORS.border}
                  xAxisLabelTextStyle={{
                    color: COLORS.text.secondary,
                    fontSize: TYPOGRAPHY.sizes.sm,
                    fontWeight: '500',
                  }}
                  yAxisTextStyle={{
                    color: COLORS.text.secondary,
                    fontSize: TYPOGRAPHY.sizes.sm,
                    fontWeight: '500',
                  }}
                  onPress={handleDataPointPress}
                />
              </View>
            </FadeSlideInView>

            {showLegend && (
              <FadeSlideInView delay={500}>
                <View style={styles.legendContainer}>
                  <TouchableOpacity style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#FF6B35' }]} />
                    <Text style={styles.legendText}>Stock In</Text>
                    <Text style={styles.legendValue}>+15%</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#FF8C42' }]} />
                    <Text style={styles.legendText}>Stock Out</Text>
                    <Text style={styles.legendValue}>-8%</Text>
                  </TouchableOpacity>
                </View>
              </FadeSlideInView>
            )}

            {selectedDataPoint !== null && data[selectedDataPoint] && (
              <FadeSlideInView delay={100}>
                <View style={styles.selectedInfo}>
                  <Text style={styles.selectedLabel}>
                    {data[selectedDataPoint]?.label}: {data[selectedDataPoint]?.dataPointText}
                  </Text>
                </View>
              </FadeSlideInView>
            )}
          </>
        )}
      </View>
    </FadeSlideInView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginVertical: SPACING.md,
    ...SHADOWS.lg,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  titleIcon: {
    marginRight: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.xs,
  },
  legendText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginRight: SPACING.xs,
  },
  legendValue: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  selectedInfo: {
    backgroundColor: COLORS.primary,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  selectedLabel: {
    color: COLORS.text.light,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
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
