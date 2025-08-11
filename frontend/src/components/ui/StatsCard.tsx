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
          start={{ x: 2, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Icon name={icon as any} size={22} color={COLORS.text.light} />
        </LinearGradient>

        {/* Text Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.value}>{value}</Text>

          {trend && trendValue && (
            <View style={styles.trendContainer}>
              <Icon
                name={trend === 'up' ? 'trending-up' : 'trending-down'}
                size={12}
                color={trend === 'up' ? COLORS.status.success : COLORS.status.error}
              />
              <Text
                style={[
                  styles.trendText,
                  { color: trend === 'up' ? COLORS.status.success : COLORS.status.error }
                ]}
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
    height: 120,
    flex: 1,
    ...SHADOWS.lg,
  },
  container: {
    padding: SPACING.md,
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    justifyContent: 'space-between',
    position: 'relative',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    width: '100%',
    alignItems:'center',
    paddingTop: SPACING.xs,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  value: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    textAlign: 'left',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    justifyContent: 'flex-start',
  },
  trendText: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginLeft: SPACING.xs,
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
