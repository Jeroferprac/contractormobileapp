import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';
import { PriceList } from '../../api/priceListsApi';

const { width: screenWidth } = Dimensions.get('window');

interface PriceListCardProps {
  priceList: PriceList;
  onPress: () => void;
  onLongPress?: () => void;
  style?: any;
}

const PriceListCard: React.FC<PriceListCardProps> = ({
  priceList,
  onPress,
  onLongPress,
  style,
}) => {
  const formatCurrency = (amount: number) => {
    // Handle NaN, null, undefined, or invalid amounts
    if (!amount || isNaN(amount) || amount === null || amount === undefined) {
      return '$0';
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: priceList.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) {
      return 'No date';
    }
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Helper function to get appropriate icon based on category and name
  const getCardIcon = (priceList: PriceList) => {
    const category = priceList.category?.toLowerCase();
    const name = priceList.name?.toLowerCase();
    
    // Category-based icons
    if (category?.includes('premium') || name?.includes('premium')) {
      return 'star';
    }
    if (category?.includes('wholesale') || name?.includes('wholesale')) {
      return 'package';
    }
    if (category?.includes('contractor') || name?.includes('contractor')) {
      return 'tool';
    }
    if (category?.includes('seasonal') || name?.includes('seasonal')) {
      return 'calendar';
    }
    if (category?.includes('discount') || name?.includes('discount')) {
      return 'percent';
    }
    if (category?.includes('bulk') || name?.includes('bulk')) {
      return 'box';
    }
    if (category?.includes('retail') || name?.includes('retail')) {
      return 'shopping-bag';
    }
    if (category?.includes('online') || name?.includes('online')) {
      return 'globe';
    }
    
    // Default icons based on common patterns
    if (name?.includes('standard') || name?.includes('default')) {
      return 'tag';
    }
    if (name?.includes('special') || name?.includes('custom')) {
      return 'settings';
    }
    if (name?.includes('sale') || name?.includes('offer')) {
      return 'trending-up';
    }
    
    // Fallback to the original icon or default
    return priceList.icon || 'tag';
  };

  // Helper function to get icon background color
  const getIconBackgroundColor = (priceList: PriceList) => {
    if (priceList.color) {
      return priceList.color;
    }
    
    // Light colors based on category
    const category = priceList.category?.toLowerCase();
    if (category?.includes('premium')) {
      return '#FCD34D'; // Light Amber
    }
    if (category?.includes('wholesale')) {
      return '#C4B5FD'; // Light Purple
    }
    if (category?.includes('contractor')) {
      return '#86EFAC'; // Light Green
    }
    if (category?.includes('seasonal')) {
      return '#FCA5A5'; // Light Red
    }
    if (category?.includes('discount')) {
      return '#FDBA74'; // Light Orange
    }
    if (category?.includes('retail')) {
      return '#A5B4FC'; // Light Blue
    }
    if (category?.includes('online')) {
      return '#99F6E4'; // Light Teal
    }
    
    // Default light colors
    return '#FBBF24'; // Light Yellow
  };

    return (
    <TouchableOpacity
      style={[styles.container, style]} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Background Gradient */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.98)', 'rgba(248, 250, 252, 0.95)']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconWrapper}>
          <LinearGradient
            colors={[getIconBackgroundColor(priceList), getIconBackgroundColor(priceList) + 'CC']}
            style={styles.iconContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Icon name={getCardIcon(priceList) as any} size={16} color={COLORS.white} />
          </LinearGradient>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.name} numberOfLines={1}>{priceList.name}</Text>
          <View style={styles.categoryContainer}>
            <View style={styles.categoryBadge}>
              <Icon name="folder" size={8} color="#6B7280" style={styles.categoryIcon} />
              <Text style={styles.categoryText}>{priceList.category}</Text>
            </View>
          </View>
        </View>
        <View style={styles.statusWrapper}>
          <LinearGradient
            colors={priceList.is_active 
              ? ['#86EFAC', '#4ADE80'] 
              : ['#FCA5A5', '#F87171']
            }
            style={styles.statusBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.statusText}>
              {priceList.is_active ? 'Active' : 'Inactive'}
            </Text>
          </LinearGradient>
        </View>
      </View>

      {/* Description */}
      <Text style={styles.description} numberOfLines={2}>
        {priceList.description}
      </Text>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <View style={styles.statIconWrapper}>
            <LinearGradient
              colors={['#FEF3C7', '#FDE68A']}
              style={styles.statIconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon name="package" size={10} color="#D97706" />
            </LinearGradient>
          </View>
          <Text style={styles.statValue}>{priceList.total_items || 0}</Text>
          <Text style={styles.statLabel}>Items</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <View style={styles.statIconWrapper}>
            <LinearGradient
              colors={['#D1FAE5', '#A7F3D0']}
              style={styles.statIconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon name="dollar-sign" size={10} color="#059669" />
            </LinearGradient>
          </View>
          <Text style={styles.statValue}>{formatCurrency(priceList.total_value)}</Text>
          <Text style={styles.statLabel}>Value</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <View style={styles.statIconWrapper}>
            <LinearGradient
              colors={['#DBEAFE', '#BFDBFE']}
              style={styles.statIconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon name="tag" size={10} color="#2563EB" />
            </LinearGradient>
          </View>
          <Text style={styles.statValue}>{priceList.currency || 'USD'}</Text>
          <Text style={styles.statLabel}>Currency</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <View style={styles.dateContainer}>
            <Icon name="clock" size={10} color={COLORS.text.secondary} style={styles.footerIcon} />
            <Text style={styles.dateText}>Updated: {formatDate(priceList.updated_at)}</Text>
          </View>
        </View>
        <View style={styles.arrowContainer}>
          <Icon name="chevron-right" size={14} color="#6B7280" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...SHADOWS.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BORDER_RADIUS.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  iconWrapper: {
    marginRight: SPACING.xs,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: 1,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
  categoryIcon: {
    marginRight: 3,
  },
  categoryText: {
    fontSize: 9,
    color: '#6B7280',
    fontWeight: '500',
  },
  statusWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  description: {
    fontSize: 11,
    color: COLORS.text.secondary,
    lineHeight: 14,
    marginBottom: SPACING.xs,
    fontWeight: '400',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: SPACING.xs,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconWrapper: {
    marginBottom: 2,
  },
  statIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E5E7EB',
    opacity: 0.6,
  },
  statValue: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginTop: 1,
  },
  statLabel: {
    fontSize: 9,
    color: COLORS.text.secondary,
    marginTop: 1,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  footerIcon: {
    marginRight: 3,
  },
  dateText: {
    fontSize: 9,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  arrowContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PriceListCard;

