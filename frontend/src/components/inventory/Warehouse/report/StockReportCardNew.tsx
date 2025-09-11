import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../../../constants/spacing';
import { TYPOGRAPHY } from '../../../../constants/typography';
import { Stock, Product, Warehouse } from '../../../../types/inventory';
import SparklineChart from '../../../ui/SparklineChart';

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

  const handlePress = () => {
    onPress?.(stock);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const getStockLevelStatus = (quantity: number, minStock: number) => {
    if (quantity <= 0) return { status: 'Out of Stock', color: COLORS.status.error, bgColor: COLORS.status.error + '20' };
    if (quantity <= minStock) return { status: 'Low Stock', color: COLORS.status.warning, bgColor: COLORS.status.warning + '20' };
    return { status: 'In Stock', color: COLORS.status.success, bgColor: COLORS.status.success + '20' };
  };

  const stockStatus = getStockLevelStatus(
    Number(stock.quantity),
    product ? Number(product.min_stock_level) : 0
  );

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.9}
        style={styles.cardTouchable}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleSection}>
            <View style={styles.iconContainer}>
              <Icon name="package" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{product?.name || 'Unknown Product'}</Text>
              <Text style={styles.sku}>{product?.sku || 'No SKU'}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.statusBadge, { backgroundColor: stockStatus.bgColor }]}>
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
          <View style={styles.infoRow}>
            <Icon name="warehouse" size={16} color={COLORS.text.secondary} />
            <Text style={styles.infoText}>
              {warehouse?.name || 'Unknown Warehouse'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="bar-chart-2" size={16} color={COLORS.text.secondary} />
            <Text style={styles.infoText}>
              Quantity: {Number(stock.quantity).toLocaleString()} {product?.unit || 'units'}
            </Text>
          </View>

          {/* Sparkline Chart */}
          <View style={styles.chartSection}>
            <SparklineChart
              data={[30, 45, 35, 50, 40, 60, 55, Number(stock.quantity)]}
              width={120}
              height={30}
              color={stockStatus.color}
            />
            <Text style={styles.chartLabel}>Stock Trend</Text>
          </View>

          {stock.bin_location && (
            <View style={styles.infoRow}>
              <Icon name="map-pin" size={16} color={COLORS.text.secondary} />
              <Text style={styles.infoText}>
                Bin: {stock.bin_location}
              </Text>
            </View>
          )}
        </View>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Icon name="trending-up" size={20} color={COLORS.status.success} />
                <Text style={styles.statValue}>{Number(stock.quantity).toLocaleString().toString()}</Text>
                <Text style={styles.statLabel}>Current Stock</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="alert-triangle" size={20} color={COLORS.status.warning} />
                <Text style={styles.statValue}>{product ? Number(product.min_stock_level).toString() : '0'}</Text>
                <Text style={styles.statLabel}>Min Level</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="lock" size={20} color={COLORS.status.error} />
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Reserved</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="package" size={20} color={COLORS.primary} />
                <Text style={styles.statValue}>{product?.unit || 'units'}</Text>
                <Text style={styles.statLabel}>Unit</Text>
              </View>
            </View>
            
            <View style={styles.detailsSection}>
              <Text style={styles.detailsTitle}>Stock Details</Text>
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Category</Text>
                  <Text style={styles.detailValue}>{product?.category_name || 'N/A'}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Last Updated</Text>
                  <Text style={styles.detailValue}>2 hours ago</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <Text style={styles.detailValue}>{stockStatus.status}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailValue}>{stock.bin_location || 'N/A'}</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    shadowColor: COLORS.text.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  cardTouchable: {
    padding: SPACING.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    fontFamily: 'System',
  },
  sku: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    fontFamily: 'System',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  statusText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    fontFamily: 'System',
  },
  expandButton: {
    padding: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.primary + '10',
  },
  cardContent: {
    gap: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    flex: 1,
    fontFamily: 'System',
  },
  chartSection: {
    marginTop: SPACING.sm,
    alignItems: 'center',
  },
  chartLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
    fontFamily: 'System',
  },
  expandedContent: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: SPACING.xs,
    fontFamily: 'System',
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
    fontFamily: 'System',
  },
  detailsSection: {
    marginTop: SPACING.md,
  },
  detailsTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
    fontFamily: 'System',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  detailItem: {
    flex: 1,
    minWidth: '45%',
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
    fontFamily: 'System',
  },
  detailValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    fontFamily: 'System',
  },
});

export default StockReportCard;
