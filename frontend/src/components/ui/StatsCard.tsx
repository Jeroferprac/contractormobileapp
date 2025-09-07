import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import Svg, { Path } from 'react-native-svg';
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
  variant?: 'large' | 'small'; // New prop for card variants
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendValue,
  onPress,
  gradient = 'primary',
  variant = 'small'
}) => {
  const getGradientColors = () => {
    switch (gradient) {
      case 'primary':
        return COLORS.gradient.primary;
      case 'secondary':
        return COLORS.gradient.secondary;
      case 'warning':
        return ['#FB7504', '#C2252C'];
      case 'success':
        return ['#28A745', '#4CAF50'];
      default:
        return COLORS.gradient.primary;
    }
  };

  // Render large variant (top row cards)
  if (variant === 'large') {
    return (
      <TouchableOpacity
        style={[styles.wrapper, styles.largeWrapper]}
        activeOpacity={0.9}
        onPress={onPress}
      >
        <View style={styles.largeContainer}>
          {/* Header with title and icon */}
          <View style={styles.largeHeader}>
            <Text style={styles.largeTitle}>{title}</Text>
            <View style={styles.largeIconContainer}>
              <Icon name={icon as any} size={22} color="#1A1A1A" />
            </View>
          </View>
          
          {/* Value and Trend Row */}
          <View style={styles.valueTrendRow}>
            <Text style={styles.largeValue}>{value}</Text>
            
            {/* Trend indicator */}
            {trend && trendValue && (
              <View style={styles.largeTrendContainer}>
                <View style={styles.trendChart}>
                  <Svg width="40" height="40" viewBox="0 0 78 20" fill="none">
                    <Path 
                      d="M1 15.4833L1.00006 20H77.0001V3.7147L74.2854 1L60.5001 14.7853L44.0001 10.3641L16.0001 17.8667L6.23915 12.5L1 15.4833Z" 
                      fill="#26B326" 
                      fillOpacity="0.1"
                    />
                    <Path 
                      d="M1 15.4833L6.10512 12.5359L16 17.8667L44 10.3641L60.5 14.7853L74.2853 1L77 3.7147" 
                      stroke="#26B326" 
                      strokeWidth="0.8"
                    />
                  </Svg>
                </View>
                <Text style={styles.largeTrendText}>{trendValue}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Render small variant (bottom row cards)
  return (
    <TouchableOpacity
      style={[styles.wrapper, styles.smallWrapper]}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <View style={styles.smallContainer}>
        {/* Orange accent bar */}
        <View style={styles.accentBar} />
        
        {/* Content */}
        <View style={styles.smallContent}>
          <Text style={styles.smallTitle}>{title}</Text>
          <Text style={styles.smallValue}>{value}</Text>

          {trend && trendValue && (
            <View style={styles.smallTrendContainer}>
              <Icon
                name={trend === 'up' ? 'arrow-up' : 'arrow-down'}
                size={10}
                color={trend === 'up' ? '#28A745' : '#D26065'}
              />
              <Text style={[
                styles.smallTrendText,
                { color: trend === 'up' ? '#28A745' : '#D26065' }
              ]}>
                {trendValue}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Base wrapper styles
  wrapper: {
    borderRadius: BORDER_RADIUS.lg,
  },
  
  // Large card styles (top row)
  largeWrapper: {
    height: 140,
    flex: 1,
  },
  largeContainer: {
    backgroundColor: '#363231', // Exact dark gray from reference
    padding: SPACING.md,
    height: '100%',
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  largeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  largeTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: '#FFFFFF', // White text for better contrast
    textAlign: 'left',
  },
  largeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FDDE76', // Exact yellow from reference
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  valueTrendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flex: 1,
  },
  largeValue: {
    fontSize: 32,
    fontWeight: '900', // Extra bold weight
    color: '#FFFFFF', // White text
    textAlign: 'left',
    flex: 1,
    marginRight: SPACING.sm,
  },
  largeTrendContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  trendChart: {
    marginRight: SPACING.xs,
    flexShrink: 0,
  },
  largeTrendText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: '#28A745', // Green text
  },
  
  // Small card styles (bottom row)
  smallWrapper: {
    height: 82,
    flex: 1,
  },
  smallContainer: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    height: '100%',
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  accentBar: {
    position: 'absolute',
    width: 5,
    height: 28,
    left: -2,
    top: 11,
    backgroundColor: '#E7600E', // Exact orange from Figma
    borderRadius: 30,
  },
  smallContent: {
    flex: 1,
    padding: 8,
    position: 'relative',
  },
  smallTitle: {
    position: 'absolute',
    width: 66,
    height: 24,
    left: 8,
    top: 8,
    fontSize: 9,
    fontWeight: '400',
    color: '#9B9898', // Exact color from Figma
    lineHeight: 12,
    flexWrap: 'wrap',
  },
  smallValue: {
    position: 'absolute',
    width: 66,
    height: 20,
    left: 8,
    top: 35,
    fontSize: 16,
    fontWeight: '700',
    color: '#363231', // Exact color from Figma
    lineHeight: 19,
  },
  smallTrendContainer: {
    position: 'absolute',
    width: 66,
    height: 16,
    left: 8,
    top: 58,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  smallTrendText: {
    fontSize: 8,
    fontWeight: '400',
    color: '#D26065', // Exact color from Figma
    lineHeight: 16,
    marginLeft: 3,
    flexShrink: 1,
  },
});

export default StatsCard;
