import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { LinearGradient } from 'react-native-linear-gradient';
import { COLORS } from '../../../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../../../constants/spacing';
import { TYPOGRAPHY } from '../../../../constants/typography';
import { Stock, Product, Warehouse } from '../../../../types/inventory';
import SparklineChart from '../../../ui/SparklineChart';
import AnimatedCounter from '../../../ui/AnimatedCounter';
import ProgressRing from '../../../ui/ProgressRing';

interface StockReportCardProps {
  stock: Stock;
  product?: Product;
  warehouse?: Warehouse;
  onPress?: (stock: Stock) => void;
}

const StockReportCard: React.FC<StockReportCardProps> = ({
  stock,
  product,
  warehouse,
  onPress,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [scaleValue] = useState(new Animated.Value(1));

  const handlePress = () => {
    // 3D transform animation
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onPress?.(stock);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const getStockLevelStatus = (quantity: number, minStock: number) => {
    if (quantity <= 0) return { status: 'Out of Stock', color: COLORS.status.error, bgColor: COLORS.status.error + '15', icon: 'alert-circle' };
    if (quantity <= minStock) return { status: 'Low Stock', color: COLORS.status.warning, bgColor: COLORS.status.warning + '15', icon: 'alert-triangle' };
    return { status: 'In Stock', color: COLORS.status.success, bgColor: COLORS.status.success + '15', icon: 'check-circle' };
  };

  const stockStatus = getStockLevelStatus(
    Number(stock.quantity), 
    product ? Number(product.min_stock_level) : 0
  );

  const getProductIcon = (categoryName: string) => {
    const category = categoryName.toLowerCase();
    if (category.includes('phone') || category.includes('mobile')) return 'smartphone';
    if (category.includes('laptop') || category.includes('computer')) return 'monitor';
    if (category.includes('tablet')) return 'tablet';
    if (category.includes('accessory')) return 'headphones';
    return 'package';
  };

  const stockUtilization = product && product.max_stock_level 
    ? (Number(stock.quantity) / Number(product.max_stock_level)) * 100 
    : 0;

  return (
    <Animated.View style={[styles.cardContainer, { transform: [{ scale: scaleValue }] }]}>
      <TouchableOpacity 
        onPress={handlePress}
        activeOpacity={1}
        style={styles.cardTouchable}
      >
        <LinearGradient
          colors={['#FFFFFF', '#F8F9FA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <View style={styles.titleSection}>
              <View style={styles.iconContainer}>
                <Icon name={getProductIcon(product?.category_name || '')} size={20} color={COLORS.primary} />
              </View>
              <View style={styles.titleContainer}>
                <Text style={styles.title} numberOfLines={1}>{product?.name || 'Unknown Product'}</Text>
                <Text style={styles.sku}>{product?.sku || 'No SKU'}</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <View style={[styles.statusBadge, { backgroundColor: stockStatus.bgColor }]}>
                <Icon name={stockStatus.icon} size={12} color={stockStatus.color} style={styles.statusIcon} />
                <Text style={[styles.statusText, { color: stockStatus.color }]}>
                  {stockStatus.status}
                </Text>
              </View>
              <TouchableOpacity onPress={toggleExpand} style={styles.expandButton}>
                <Icon 
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.stockInfoRow}>
              <View style={styles.stockInfoItem}>
                <Icon name="package" size={16} color={COLORS.text.secondary} />
                <Text style={styles.stockInfoLabel}>Current Stock</Text>
                <AnimatedCounter 
                  value={Number(stock.quantity)} 
                  style={styles.stockInfoValue}
                  duration={1000}
                />
              </View>
              
              <View style={styles.stockInfoItem}>
                <Icon name="map-pin" size={16} color={COLORS.text.secondary} />
                <Text style={styles.stockInfoLabel}>Warehouse</Text>
                <Text style={styles.stockInfoValue} numberOfLines={1}>
                  {warehouse?.name || 'Unknown'}
                </Text>
              </View>
            </View>

            <View style={styles.stockInfoRow}>
              <View style={styles.stockInfoItem}>
                <Icon name="trending-up" size={16} color={COLORS.text.secondary} />
                <Text style={styles.stockInfoLabel}>Min Level</Text>
                <Text style={styles.stockInfoValue}>
                  {product?.min_stock_level || 0}
                </Text>
              </View>
              
              <View style={styles.stockInfoItem}>
                <Icon name="lock" size={16} color={COLORS.text.secondary} />
                <Text style={styles.stockInfoLabel}>Reserved</Text>
                <Text style={styles.stockInfoValue}>
                  {stock.reserved_quantity || 0}
                </Text>
              </View>
            </View>
          </View>

          {isExpanded && (
            <View style={styles.expandedContent}>
              <View style={styles.expandedHeader}>
                <Text style={styles.expandedTitle}>Detailed Stock Information</Text>
              </View>
              
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <ProgressRing
                    size={60}
                    strokeWidth={6}
                    progress={Math.min(stockUtilization, 100)}
                    color={stockStatus.color}
                    backgroundColor={COLORS.border.light}
                  />
                  <Text style={styles.statValue}>{Math.round(stockUtilization)}%</Text>
                  <Text style={styles.statLabel}>Utilization</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Icon name="trending-up" size={24} color={COLORS.primary} />
                  <Text style={styles.statValue}>{stock.available_quantity || 0}</Text>
                  <Text style={styles.statLabel}>Available</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Icon name="calendar" size={24} color={COLORS.status.warning} />
                  <Text style={styles.statValue}>
                    {new Date(stock.updated_at).toLocaleDateString()}
                  </Text>
                  <Text style={styles.statLabel}>Last Updated</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Icon name="tag" size={24} color={COLORS.status.info} />
                  <Text style={styles.statValue}>{product?.category_name || 'N/A'}</Text>
                  <Text style={styles.statLabel}>Category</Text>
                </View>
              </View>

              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Icon name="hash" size={16} color={COLORS.text.secondary} />
                  <Text style={styles.detailLabel}>SKU</Text>
                  <Text style={styles.detailValue}>{product?.sku || 'N/A'}</Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Icon name="box" size={16} color={COLORS.text.secondary} />
                  <Text style={styles.detailLabel}>Unit</Text>
                  <Text style={styles.detailValue}>{product?.unit || 'N/A'}</Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Icon name="dollar-sign" size={16} color={COLORS.text.secondary} />
                  <Text style={styles.detailLabel}>Cost Price</Text>
                  <Text style={styles.detailValue}>${product?.cost_price || 0}</Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Icon name="tag" size={16} color={COLORS.text.secondary} />
                  <Text style={styles.detailLabel}>Selling Price</Text>
                  <Text style={styles.detailValue}>${product?.selling_price || 0}</Text>
                </View>
              </View>

              {product?.description && (
                <View style={styles.descriptionSection}>
                  <Text style={styles.descriptionLabel}>Description</Text>
                  <Text style={styles.descriptionText} numberOfLines={3}>
                    {product.description}
                  </Text>
                </View>
              )}
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: COLORS.text.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  cardTouchable: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  cardGradient: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    backgroundColor: COLORS.surface,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.primary + '30',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  sku: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    fontFamily: 'monospace',
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statusIcon: {
    marginRight: 6,
  },
  statusText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  expandButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary + '15',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  cardContent: {
    padding: SPACING.lg,
    backgroundColor: '#FFFFFF',
  },
  stockInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  stockInfoItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  stockInfoLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  stockInfoValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginTop: 4,
    textAlign: 'center',
  },
  expandedContent: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
    backgroundColor: COLORS.surface,
  },
  expandedHeader: {
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  expandedTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    shadowColor: COLORS.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginTop: SPACING.sm,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '600',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  detailItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginLeft: SPACING.sm,
    flex: 1,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  descriptionSection: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  descriptionLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  descriptionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
});

export default StockReportCard;
