import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../../../constants/spacing';
import { TYPOGRAPHY } from '../../../../constants/typography';

interface StatsData {
  totalItems: number;
  criticalItems: number;
  lowItems: number;
  mediumItems: number;
}

interface LowStockStatsCardProps {
  stats: StatsData;
  onPress?: () => void;
}

const LowStockStatsCard: React.FC<LowStockStatsCardProps> = ({ stats, onPress }) => {
  const criticalPercentage = stats.totalItems > 0 ? Math.round((stats.criticalItems / stats.totalItems) * 100) : 0;
  const changeText = criticalPercentage > 10 ? 'Critical items need attention' : 'Stock levels are manageable';

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={['#FF6B35', '#FF8E53']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Icon name="alert-triangle" size={16} color="#FFFFFF" style={styles.titleIcon} />
              <Text style={styles.title}>Low Stock Items</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#FFFFFF" />
          </View>

          <View style={styles.mainMetric}>
            <Text style={styles.metricValue}>{stats.totalItems}</Text>
            <Text style={styles.metricLabel}>Total Items</Text>
          </View>

          <View style={styles.changeIndicator}>
            <View style={styles.changePill}>
              <Icon 
                name={criticalPercentage > 10 ? "trending-up" : "trending-down"} 
                size={12} 
                color={criticalPercentage > 10 ? "#FF4444" : "#4CAF50"} 
              />
              <Text style={styles.changeText}>
                {criticalPercentage}% Critical
              </Text>
            </View>
            <Text style={styles.changeDescription}>{changeText}</Text>
          </View>

          {/* Chart-like element */}
          <View style={styles.chartContainer}>
            <View style={styles.chartBar}>
              <View style={[styles.chartFill, { width: `${Math.min(criticalPercentage, 100)}%` }]} />
            </View>
            <View style={styles.chartDots}>
              <View style={[styles.dot, styles.dotActive]} />
              <View style={[styles.dot, { opacity: 0.3 }]} />
              <View style={[styles.dot, { opacity: 0.3 }]} />
              <View style={[styles.dot, { opacity: 0.3 }]} />
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.lg,
  },
  gradient: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleIcon: {
    marginRight: SPACING.xs,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  mainMetric: {
    marginBottom: SPACING.md,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
  },
  metricLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  changeIndicator: {
    marginBottom: SPACING.lg,
  },
  changePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
    marginBottom: SPACING.xs,
  },
  changeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: SPACING.xs,
  },
  changeDescription: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  chartContainer: {
    marginTop: SPACING.md,
  },
  chartBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.sm,
  },
  chartFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.full,
  },
  chartDots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  dotActive: {
    opacity: 1,
  },
});

export default LowStockStatsCard;
