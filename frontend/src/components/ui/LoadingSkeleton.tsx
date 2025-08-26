import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
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
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
        toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, []);

  const translateX = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View style={[styles.container, { width, height, borderRadius }, style]}>
    <Animated.View
      style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0)',
            'rgba(255, 255, 255, 0.3)',
            'rgba(255, 255, 255, 0)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
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
  container: {
    backgroundColor: COLORS.border.light,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
    flex: 1,
    width: 200,
  },
});

export default LoadingSkeleton; 