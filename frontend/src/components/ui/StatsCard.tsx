import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';

interface StatsCardProps {
  title: string;
  value: string;
  icon: string;
  trend?: 'up' | 'down';
  trendValue?: string;
  onPress?: () => void;
  gradient?: 'primary' | 'secondary' | 'warning' | 'success';
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendValue,
  onPress,
  gradient = 'primary'
}) => {

  const getGradientColors = () => {
    switch (gradient) {
      case 'primary':
        return COLORS.gradient.primary;
      case 'secondary':
        return COLORS.gradient.secondary;
      case 'warning':
        return ['#FF9500', '#FFB74D'];
      case 'success':
        return ['#28A745', '#4CAF50'];
      default:
        return COLORS.gradient.primary;
    }
  };

  return (
    <TouchableOpacity
      style={styles.wrapper}
      activeOpacity={0.9}
      onPress={onPress}
    >
      {/* Card Background with Enhanced Gradient */}
      <LinearGradient
        colors={['#FFFFFF', '#FAFAFA', '#F5F5F5']}
        style={styles.container}
      >
        {/* Icon Circle with Enhanced Gradient Glow */}
        <LinearGradient
          colors={getGradientColors()}
          style={styles.iconContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Icon name={icon as any} size={16} color={COLORS.text.light} />
        </LinearGradient>

        {/* Text Content */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          <Text style={styles.value} numberOfLines={1}>{value}</Text>

          {trend && trendValue && (
            <View style={styles.trendContainer}>
              <Icon
                name={trend === 'up' ? 'trending-up' : 'trending-down'}
                size={14}
                color={trend === 'up' ? COLORS.status.success : COLORS.status.error}
              />
              <Text
                style={[
                  styles.trendText,
                  { color: trend === 'up' ? COLORS.status.success : COLORS.status.error }
                ]}
                numberOfLines={1}
              >
                {trendValue}
              </Text>
            </View>
          )}
        </View>

        {/* Subtle Overlay for Depth */}
        <View style={styles.overlay} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    height: 100,
    flex: 1,
    ...SHADOWS.md,
  },
  container: {
    padding: SPACING.sm,
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    justifyContent: 'space-between',
    position: 'relative',
    width: '100%',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    ...SHADOWS.sm,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.secondary,
    marginBottom: 4,
    textAlign: 'center',
    lineHeight: 16,
  },
  value: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: 2,
    textAlign: 'center',
    lineHeight: 20,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginLeft: 4,
    textAlign: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.lg,
  },
});

export default StatsCard;
