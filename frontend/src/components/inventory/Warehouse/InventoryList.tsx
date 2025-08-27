import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { ActivityIndicator } from 'react-native';
import FastImage from 'react-native-fast-image';

import { COLORS } from '../../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../../constants/spacing';
import { TYPOGRAPHY } from '../../../constants/typography';
import Feather from 'react-native-vector-icons/Feather';
import { inventoryApiService } from '../../../api/inventoryApi';
import { Stock, Product } from '../../../types/inventory';

interface InventoryItem {
  id: string;
  name: string;
  stockCount: number;
  image: string;
  lowStock?: boolean;
  category?: string;
  product_id?: string;
  warehouse_id?: string;
}

// Helper function to convert API Stock to UI InventoryItem
const mapStockToInventoryItem = (stock: Stock, products: Map<string, Product>): InventoryItem => {
  const product = products.get(stock.product_id);
  const stockCount = typeof stock.quantity === 'string' ? parseInt(stock.quantity) : stock.quantity || 0;
  // Determine if stock is low (less than 20% of typical stock level or less than 10 units)
  const reorderPoint = product?.reorder_point ? (typeof product.reorder_point === 'string' ? parseInt(product.reorder_point) : product.reorder_point) : 0;
  const lowStock = stockCount < 10 || (reorderPoint > 0 && stockCount <= reorderPoint);
  
  return {
    id: stock.id,
    product_id: stock.product_id,
    warehouse_id: stock.warehouse_id,
    name: product?.name || 'Unknown Product',
    stockCount,
    image: 'https://via.placeholder.com/100',
    lowStock: lowStock || false,
    category: product?.category_name || undefined
  };
};

interface InventoryListProps {
  
  items?: InventoryItem[];
  onItemPress?: (item: InventoryItem) => void;
  warehouseId?: string;
  lowStockOnly?: boolean;
  limit?: number;
}

const InventoryList: React.FC<InventoryListProps> = ({ 
  items: propItems,
  onItemPress,
  warehouseId,
  lowStockOnly = false,
  limit = 10
}) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(propItems ? false : true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propItems && propItems.length > 0) {
      // Use provided items if available
      setItems(propItems);
    } else {
      // Otherwise fetch from API
      fetchInventoryItems();
    }
  }, [propItems, warehouseId, lowStockOnly]);

  const fetchInventoryItems = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch stocks with optional warehouse filter
      const params: { warehouse_id?: string; low_stock?: boolean } = {};
      if (warehouseId) params.warehouse_id = warehouseId;
      if (lowStockOnly) params.low_stock = true;
      
      const stocksResponse = await inventoryApiService.getStocks(params);
      
      // We need product details to display names and images
      const productsResponse = await inventoryApiService.getProducts();
      
      // Create a map of products for quick lookup
      const productsMap = new Map();
      productsResponse.data.forEach((product: Product) => {
        productsMap.set(product.id, product);
      });
      
      // Map stocks to inventory items
      const mappedItems = stocksResponse.data
        .map((stock: Stock) => mapStockToInventoryItem(stock, productsMap))
        .slice(0, limit);
      
      setItems(mappedItems);
    } catch (err) {
      console.error('Error fetching inventory items:', err);
      setError('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading inventory...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchInventoryItems}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{lowStockOnly ? 'No low stock items' : 'No inventory items'}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {items.map((item) => (
        <TouchableOpacity 
          key={item.id} 
          style={styles.cardContainer}
          onPress={() => onItemPress && onItemPress(item)}
          activeOpacity={0.8}
        >
          <View
            style={styles.blurCard}
          >
            <View style={styles.cardContent}>
              <View style={styles.imageContainer}>
                <FastImage
                  source={{ uri: item.image }}
                  style={styles.image}
                  resizeMode={FastImage.resizeMode.cover}
                />
                {item.lowStock && (
                  <View style={styles.lowStockBadge}>
                    <Feather name="alert-triangle" size={10} color={COLORS.status.warning} />
                  </View>
                )}
              </View>
              
              <View style={styles.textContainer}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                {item.category && (
                  <Text style={styles.categoryText} numberOfLines={1}>{item.category}</Text>
                )}
                <View style={styles.stockContainer}>
                  <Feather name="box" size={12} color={COLORS.text.secondary} style={styles.stockIcon} />
                  <Text style={[
                    styles.stockCount, 
                    item.lowStock ? { color: COLORS.status.warning } : null
                  ]}>
                    {item.stockCount.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  cardContainer: {
    width: 160,
    height: 180,
    marginRight: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  blurCard: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  cardContent: {
    flex: 1,
    padding: SPACING.sm,
  },
  imageContainer: {
    height: 90,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  lowStockBadge: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: BORDER_RADIUS.round,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    color: COLORS.text.primary,
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  categoryText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockIcon: {
    marginRight: 4,
  },
  stockCount: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '500',
    color: COLORS.text.primary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  loadingContainer: {
    width: 160,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.sm,
  },
  loadingText: {
    marginTop: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  errorContainer: {
    width: 160,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.sm,
    padding: SPACING.sm,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.status.error,
    marginBottom: SPACING.sm,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  retryButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  retryButtonText: {
    color: COLORS.text.light,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  emptyContainer: {
    width: 160,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.sm,
    padding: SPACING.sm,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
});

export default InventoryList;
