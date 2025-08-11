import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';

interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = BORDER_RADIUS.sm,
  style,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );

    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Stats Card Skeleton
export const StatsCardSkeleton: React.FC = () => {
  return (
    <View style={styles.cardContainer}>
      <LoadingSkeleton width="100%" height={120} borderRadius={BORDER_RADIUS.lg} />
    </View>
  );
};

// Chart Skeleton
export const ChartSkeleton: React.FC = () => {
            return (
    <View style={styles.chartContainer}>
      <LoadingSkeleton width="60%" height={24} style={styles.titleSkeleton} />
      <LoadingSkeleton width="100%" height={200} borderRadius={BORDER_RADIUS.lg} />
      <View style={styles.legendSkeleton}>
        <LoadingSkeleton width="40%" height={16} />
        <LoadingSkeleton width="40%" height={16} />
                </View>
              </View>
            );
};

// Product Card Skeleton
export const ProductCardSkeleton: React.FC = () => {
  return (
    <View style={styles.productCard}>
      <LoadingSkeleton width={140} height={160} borderRadius={BORDER_RADIUS.lg} />
    </View>
  );
};

// List Item Skeleton
export const ListItemSkeleton: React.FC = () => {
  return (
    <View style={styles.listItem}>
      <LoadingSkeleton width={40} height={40} borderRadius={20} />
      <View style={styles.listContent}>
        <LoadingSkeleton width="70%" height={16} />
        <LoadingSkeleton width="40%" height={12} style={styles.subtitleSkeleton} />
          </View>
      <LoadingSkeleton width={60} height={16} />
    </View>
  );
};


const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.border,
  },
  cardContainer: {
    width: '49%',
    marginBottom: SPACING.sm,
  },
  chartContainer: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginVertical: SPACING.md,
  },
  titleSkeleton: {
    marginBottom: SPACING.lg,
  },
  legendSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.md,
  },
  productCard: {
    marginRight: SPACING.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  listContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  subtitleSkeleton: {
    marginTop: SPACING.xs,
  },
});

export default LoadingSkeleton; 