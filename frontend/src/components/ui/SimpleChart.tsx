import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';
import BarChart, { BarChartData } from './BarChart';

interface SimpleChartProps {
  data: number[];
  labels?: string[];
  color?: string;
  title?: string;
}

const SimpleChart: React.FC<SimpleChartProps> = ({
  data,
  labels,
  color = COLORS.primary,
  title = 'Chart',
}) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.noData}>No data available</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data);
  const chartHeight = 150;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartContainer}>
        {data.map((value, index) => {
          const height = (value / maxValue) * chartHeight;
          const label = labels?.[index] || `Item ${index + 1}`;
          
          return (
            <View key={index} style={styles.barContainer}>
              <View style={[styles.bar, { height, backgroundColor: color + '80' }]} />
              <Text style={styles.barLabel}>{label}</Text>
              <Text style={styles.barValue}>{value}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginVertical: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    fontFamily: 'System',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 200,
    paddingHorizontal: SPACING.sm,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 30,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.xs,
  },
  barLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontFamily: 'System',
  },
  barValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: SPACING.xs,
    fontFamily: 'System',
  },
  noData: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontFamily: 'System',
  },
});

export default SimpleChart;
