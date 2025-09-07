import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  ImageBackground,
  Dimensions,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import FastImage from 'react-native-fast-image';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/spacing';
import { Product, Stock } from '../../types/inventory';
import inventoryApiService from '../../api/inventoryApi';
import DeleteModal from '../../components/DeleteModal';

interface ProductScreenProps {
  navigation: any;
  route: {
    params: {
      product: Product;
    };
  };
}

const ProductScreen: React.FC<ProductScreenProps> = ({ navigation, route }) => {
  const { product } = route.params;
  const [stock, setStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadProductStock();
  }, []);

  const loadProductStock = async () => {
    try {
      setLoading(true);
      const stocksResponse = await inventoryApiService.getStocks();
      const productStock = stocksResponse.data.find(s => s.product_id === product.id);
      setStock(productStock || null);
    } catch (error) {
      Alert.alert('Error', 'Failed to load product stock');
    } finally {
      setLoading(false);
    }
  };

  const getProductImage = (product: Product) => {
    const name = product.name.toLowerCase();
    const category = product.category_name.toLowerCase();
    
    // Mobile phones
    if (name.includes('iphone') || name.includes('apple')) {
      return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop';
    }
    if (name.includes('samsung') || name.includes('galaxy')) {
      return 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&h=600&fit=crop';
    }
    if (name.includes('mobile') || name.includes('phone')) {
      return 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop';
    }
    
    // Laptops
    if (name.includes('laptop') || name.includes('macbook') || name.includes('computer')) {
      return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop';
    }
    
    // Accessories
    if (name.includes('headphone') || name.includes('earphone') || name.includes('accessory')) {
      return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop';
    }
    
    // Construction materials
    if (category.includes('cement') || category.includes('material') || name.includes('cement')) {
      return 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop';
    }
    
    // Tools
    if (category.includes('tools') || name.includes('tool')) {
      return 'https://images.unsplash.com/photo-1581147033415-58a7cd9d6b0b?w=800&h=600&fit=crop';
    }
    
    // Default
    return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop';
  };

  const getStockStatus = () => {
    if (!stock) return { text: 'N/A', color: '#999' };
    
    const quantity = parseInt(stock.quantity.toString());
    const minStockLevel = parseInt(product.min_stock_level.toString());
    
    if (quantity <= minStockLevel) {
      return { text: 'Low Stock', color: '#FB7504' };
    }
    if (quantity === 0) {
      return { text: 'Out of Stock', color: '#FF3B30' };
    }
    return { text: `In Stock: ${quantity}`, color: '#34C759' };
  };

  const handleEditProduct = () => {
    navigation.navigate('AddProduct', { product });
  };

  const handleDeleteProduct = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await inventoryApiService.deleteProduct(product.id);
      // Success will be handled by the modal's success stage
    } catch (error) {
      Alert.alert('Error', 'Failed to delete product');
      setIsDeleting(false);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const stockStatus = getStockStatus();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header with Image */}
      <View style={styles.header}>
        <ImageBackground
          source={{ uri: getProductImage(product) }}
          style={styles.headerImage}
          imageStyle={styles.headerImageStyle}
        >
          <View style={styles.headerOverlay}>
            {/* Back Button */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={24} color={COLORS.text.light} />
            </TouchableOpacity>
            
            {/* Favorite Button */}
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={toggleFavorite}
            >
              <Icon 
                name={isFavorite ? "heart" : "heart"} 
                size={24} 
                color={isFavorite ? "#FB7504" : COLORS.text.light} 
                solid={isFavorite}
              />
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
      
      {/* Product Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Product Name and Price */}
        <View style={styles.productHeader}>
          <View style={styles.nameAndRating}>
            <Text style={styles.productName}>
              {product.name}
            </Text>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color="#FB7504" />
              <Text style={styles.ratingText}>4.9</Text>
              <Text style={styles.reviewCount}>(124 reviews)</Text>
            </View>
          </View>
          
          {/* Stock Status Badge */}
          <View style={[styles.stockBadge, { backgroundColor: stockStatus.color }]}>
            <Text style={styles.stockText}>
              {stockStatus.text}
            </Text>
          </View>
        </View>
        
        {/* Price Section */}
        <View style={styles.priceSection}>
          <Text style={styles.sellingPrice}>
            ${parseFloat(product.selling_price.toString()).toFixed(2)}
          </Text>
          <Text style={styles.costPrice}>
            Cost: ${parseFloat(product.cost_price.toString()).toFixed(2)}
          </Text>
        </View>
        
        {/* Description */}
        <View style={styles.descriptionCard}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {product.description || 'No description available for this product. The product description typically includes details about features, benefits, and usage instructions.'}
          </Text>
        </View>
        
        {/* Product Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Product Details</Text>
          
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Icon name="package" size={20} color={COLORS.primary} />
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailValue}>{product.category_name}</Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="hash" size={20} color={COLORS.primary} />
              <Text style={styles.detailLabel}>SKU</Text>
              <Text style={styles.detailValue}>{product.sku}</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Icon name="box" size={20} color={COLORS.primary} />
              <Text style={styles.detailLabel}>Unit</Text>
              <Text style={styles.detailValue}>{product.unit}</Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="code" size={20} color={COLORS.primary} />
              <Text style={styles.detailLabel}>Barcode</Text>
              <Text style={styles.detailValue}>{product.barcode || 'N/A'}</Text>
            </View>
          </View>
        </View>
        
        {/* Stock Information */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Stock Information</Text>
          
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Icon name="database" size={20} color={COLORS.primary} />
              <Text style={styles.detailLabel}>Current Stock</Text>
              <Text style={styles.detailValue}>{stock?.quantity || '0'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="alert-triangle" size={20} color={COLORS.primary} />
              <Text style={styles.detailLabel}>Min Stock</Text>
              <Text style={styles.detailValue}>{product.min_stock_level}</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Icon name="refresh-cw" size={20} color={COLORS.primary} />
              <Text style={styles.detailLabel}>Reorder Point</Text>
              <Text style={styles.detailValue}>{product.reorder_point}</Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="maximize" size={20} color={COLORS.primary} />
              <Text style={styles.detailLabel}>Max Stock</Text>
              <Text style={styles.detailValue}>{product.max_stock_level}</Text>
            </View>
          </View>
        </View>
        
        {/* Additional Information */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Icon name="calendar" size={20} color={COLORS.primary} />
              <Text style={styles.detailLabel}>Created</Text>
              <Text style={styles.detailValue}>
                {new Date(product.created_at).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="clock" size={20} color={COLORS.primary} />
              <Text style={styles.detailLabel}>Updated</Text>
              <Text style={styles.detailValue}>
                {new Date(product.updated_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Icon name="weight" size={20} color={COLORS.primary} />
              <Text style={styles.detailLabel}>Weight</Text>
              <Text style={styles.detailValue}>{product.weight || 'N/A'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="maximize-2" size={20} color={COLORS.primary} />
              <Text style={styles.detailLabel}>Dimensions</Text>
              <Text style={styles.detailValue}>{product.dimensions || 'N/A'}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Bottom Action Buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={handleEditProduct}
        >
          <Icon name="edit-2" size={20} color={COLORS.text.light} />
          <Text style={styles.actionButtonText}>Edit Product</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDeleteProduct}
        >
          <Icon name="trash-2" size={20} color={COLORS.text.light} />
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        visible={showDeleteModal}
        isDeleting={isDeleting}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        itemName={product.name}
        onClose={() => {
          setShowDeleteModal(false);
          setIsDeleting(false);
          navigation.goBack();
        }}
        onConfirm={handleConfirmDelete}
      />
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 300,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  headerImageStyle: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? SPACING.lg : SPACING.xxxl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingBottom: 100, // Space for bottom buttons
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  nameAndRating: {
    flex: 1,
    marginRight: SPACING.md,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginLeft: SPACING.xs,
  },
  reviewCount: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
  },
  stockBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.sm,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.light,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sellingPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: SPACING.md,
  },
  costPrice: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.secondary,
  },
  descriptionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.text.secondary,
  },
  detailsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  detailItem: {
    flex: 1,
    alignItems: 'flex-start',
    marginRight: SPACING.md,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.xs,
    ...SHADOWS.md,
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: COLORS.text.light,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
});

export default ProductScreen;