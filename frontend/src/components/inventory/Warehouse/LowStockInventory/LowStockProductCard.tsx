import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../../../constants/spacing';
import { TYPOGRAPHY } from '../../../../constants/typography';

interface LowStockItem {
  id: string;
  product: any;
  stock: any;
  warehouse?: any;
  stockLevel: 'critical' | 'low' | 'medium';
  imageUrl: string;
}

interface LowStockProductCardProps {
  item: LowStockItem;
  onPress: () => void;
}

const LowStockProductCard: React.FC<LowStockProductCardProps> = ({ item, onPress }) => {
  const getStockLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return '#FF4444';
      case 'low':
        return '#FF9500';
      case 'medium':
        return '#FFCC00';
      default:
        return '#FF9500';
    }
  };

  const getStockLevelText = (level: string) => {
    switch (level) {
      case 'critical':
        return 'Critical';
      case 'low':
        return 'Low Stock';
      case 'medium':
        return 'Medium';
      default:
        return 'Low Stock';
    }
  };

  const getStockLevelIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return 'alert-triangle';
      case 'low':
        return 'alert-circle';
      case 'medium':
        return 'info';
      default:
        return 'alert-circle';
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.card}>
        {/* Tags/Chips */}
        <View style={styles.tagsContainer}>
          <View style={styles.tag}>
            <View style={styles.tagDot} />
            <Text style={styles.tagText}>{item.product.category_name}</Text>
          </View>
          <View style={styles.tag}>
            <Icon name="map-pin" size={10} color={COLORS.text.secondary} />
            <Text style={styles.tagText}>
              {item.warehouse?.name || 'Unknown'}
            </Text>
          </View>
        </View>

        {/* Product Image */}
        <View style={styles.imageContainer}>
          <FastImage
            source={{ uri: item.imageUrl }}
            style={styles.productImage}
            resizeMode={FastImage.resizeMode.cover}
          />
          
          {/* Stock Level Badge */}
          <View style={[
            styles.stockBadge,
            { backgroundColor: getStockLevelColor(item.stockLevel) }
          ]}>
            <Icon 
              name={getStockLevelIcon(item.stockLevel)} 
              size={12} 
              color="#FFFFFF" 
            />
            <Text style={styles.stockBadgeText}>
              {getStockLevelText(item.stockLevel)}
            </Text>
          </View>
        </View>

        {/* Product Information */}
        <View style={styles.productInfo}>
          <View style={styles.stockCountContainer}>
            <Text style={styles.stockCount}>{item.stock.quantity} Items</Text>
          </View>
          
          <Text style={styles.productName} numberOfLines={2}>
            {item.product.name}
          </Text>
          
          <View style={styles.productDetails}>
            <Text style={styles.productDetail}>
              SKU: {item.product.sku}
            </Text>
            <Text style={styles.productDetail}>
              Reorder: {item.product.reorder_point}
            </Text>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.actionButton} onPress={onPress}>
          <Icon name="plus" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.md,
    position: 'relative',
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  tagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.text.secondary,
    marginRight: SPACING.xs,
  },
  tagText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  productImage: {
    width: '100%',
    height: 200,
    borderRadius: BORDER_RADIUS.md,
  },
  stockBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    ...SHADOWS.sm,
  },
  stockBadgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  productInfo: {
    flex: 1,
  },
  stockCountContainer: {
    marginBottom: SPACING.xs,
  },
  stockCount: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  productName: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    lineHeight: 22,
  },
  productDetails: {
    marginBottom: SPACING.sm,
  },
  productDetail: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  actionButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.light,
    ...SHADOWS.sm,
  },
});

export default LowStockProductCard;
