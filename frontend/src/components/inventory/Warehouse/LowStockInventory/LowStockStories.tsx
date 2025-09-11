import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../../../constants/spacing';
import { TYPOGRAPHY } from '../../../../constants/typography';

const { width: screenWidth } = Dimensions.get('window');
const STORY_SIZE = 80;
const STORY_SPACING = SPACING.md;

interface LowStockItem {
  id: string;
  product: any;
  stock: any;
  warehouse?: any;
  stockLevel: 'critical' | 'low' | 'medium';
  imageUrl: string;
}

interface LowStockStoriesProps {
  items: LowStockItem[];
  onItemPress: (item: LowStockItem) => void;
}

const LowStockStories: React.FC<LowStockStoriesProps> = ({ items, onItemPress }) => {
  const getStockLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return '#FF4444';
      case 'low':
        return '#FB7504';
      case 'medium':
        return '#FFCC00';
      default:
        return '#FB7504';
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

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No low stock items found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Critical Items</Text>
        <Text style={styles.subtitle}>Tap to add stock</Text>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}

      >
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={styles.storyContainer}
            onPress={() => onItemPress(item)}
            activeOpacity={0.8}
          >
            {/* Story Border */}
            <View style={[
              styles.storyBorder,
              { borderColor: getStockLevelColor(item.stockLevel) }
            ]}>
              {/* Product Image */}
              <FastImage
                source={{ uri: item.imageUrl }}
                style={styles.storyImage}
                resizeMode={FastImage.resizeMode.cover}
              />
              
              {/* Stock Level Indicator */}
              <View style={[
                styles.stockIndicator,
                { backgroundColor: getStockLevelColor(item.stockLevel) }
              ]}>
                <Icon 
                  name={getStockLevelIcon(item.stockLevel)} 
                  size={12} 
                  color="#FFFFFF" 
                />
              </View>
            </View>
            
            {/* Product Name */}
            <Text style={styles.productName} numberOfLines={1}>
              {item.product.name}
            </Text>
            
            {/* Stock Count */}
            <Text style={styles.stockCount}>
              {item.stock.quantity} left
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  scrollContent: {
    paddingRight: SPACING.lg,
  },
  storyContainer: {
    alignItems: 'center',
    marginRight: STORY_SPACING,
    width: STORY_SIZE,
  },
  storyBorder: {
    width: STORY_SIZE,
    height: STORY_SIZE,
    borderRadius: STORY_SIZE / 2,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    ...SHADOWS.md,
    marginBottom: SPACING.sm,
  },
  storyImage: {
    width: STORY_SIZE - 8,
    height: STORY_SIZE - 8,
    borderRadius: (STORY_SIZE - 8) / 2,
  },
  stockIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...SHADOWS.sm,
  },
  productName: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  stockCount: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.secondary,
  },
});

export default LowStockStories;
