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
  Modal,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import FastImage from 'react-native-fast-image';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { AllProductsScreenNavigationProp } from '../../types/navigation';
import { Product, Stock } from '../../types/inventory';
import inventoryApiService from '../../api/inventoryApi';

interface AllProductsScreenProps {
  navigation: AllProductsScreenNavigationProp;
}

const AllProductsScreen: React.FC<AllProductsScreenProps> = ({ navigation }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showActionMenu, setShowActionMenu] = useState(false);

  const categories = [
    { id: 'all', label: 'All Products', icon: 'package' },
    { id: 'mobile', label: 'Mobile Phones', icon: 'smartphone' },
    { id: 'laptop', label: 'Laptops', icon: 'monitor' },
    { id: 'accessory', label: 'Accessories', icon: 'headphones' },
    { id: 'cement', label: 'Construction', icon: 'tool' },
    { id: 'tools', label: 'Tools', icon: 'wrench' },
  ];

  const filterOptions = [
    { id: 'price-low', label: 'Price: Low to High', icon: 'arrow-up' },
    { id: 'price-high', label: 'Price: High to Low', icon: 'arrow-down' },
    { id: 'name-a-z', label: 'Name: A to Z', icon: 'sort-asc' },
    { id: 'name-z-a', label: 'Name: Z to A', icon: 'sort-desc' },
    { id: 'stock-high', label: 'Stock: High to Low', icon: 'trending-up' },
    { id: 'stock-low', label: 'Stock: Low to High', icon: 'trending-down' },
    { id: 'newest', label: 'Newest First', icon: 'clock' },
    { id: 'oldest', label: 'Oldest First', icon: 'calendar' },
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsResponse = await inventoryApiService.getProducts();
      const stocksResponse = await inventoryApiService.getStocks();
      
      setProducts(productsResponse.data);
      setStocks(stocksResponse.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const getProductImage = (product: Product) => {
    const name = product.name.toLowerCase();
    const category = product.category_name.toLowerCase();
    
    // Mobile phones
    if (name.includes('iphone') || name.includes('apple')) {
      return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop';
    }
    if (name.includes('samsung') || name.includes('galaxy')) {
      return 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=300&fit=crop';
    }
    if (name.includes('mobile') || name.includes('phone')) {
      return 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop';
    }
    
    // Laptops
    if (name.includes('laptop') || name.includes('macbook') || name.includes('computer')) {
      return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop';
    }
    
    // Accessories
    if (name.includes('headphone') || name.includes('earphone') || name.includes('accessory')) {
      return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop';
    }
    
    // Construction materials
    if (category.includes('cement') || category.includes('material') || name.includes('cement')) {
      return 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop';
    }
    
    // Tools
    if (category.includes('tools') || name.includes('tool')) {
      return 'https://images.unsplash.com/photo-1581147033415-58a7cd9d6b0b?w=400&h=300&fit=crop';
    }
    
    // Default
    return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop';
  };

  const getStockStatus = (product: Product) => {
    const stock = stocks.find(s => s.product_id === product.id);
    if (!stock) return { text: 'N/A', color: '#999' };
    
    const quantity = parseInt(stock.quantity);
    const minStockLevel = parseInt(product.min_stock_level);
    
    if (quantity <= minStockLevel) {
      return { text: 'Low Stock', color: '#FF9500' };
    }
    if (quantity === 0) {
      return { text: 'Out of Stock', color: '#FF3B30' };
    }
    return { text: `Stock: ${quantity}`, color: '#34C759' };
  };

  const handleAddProduct = () => {
    setShowAddModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowAddModal(true);
    setShowActionMenu(false);
  };

  const handleDeleteProduct = (product: Product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await inventoryApiService.deleteProduct(product.id);
              loadProducts();
              Alert.alert('Success', 'Product deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ]
    );
    setShowActionMenu(false);
  };

  const handleBarcodeScan = () => {
    setShowBarcodeScanner(true);
  };

  const handleFilterPress = () => {
    setShowFilterModal(true);
  };

  const handleProductAction = (product: Product) => {
    setSelectedProduct(product);
    setShowActionMenu(true);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           product.category_name.toLowerCase().includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const renderProductCard = ({ item: product }: { item: Product }) => {
    const stockStatus = getStockStatus(product);
    
    return (
      <TouchableOpacity style={styles.productCard} onPress={() => handleProductAction(product)}>
        <View style={styles.productImageContainer}>
          <FastImage
            source={{ uri: getProductImage(product) }}
            style={styles.productImage}
            resizeMode={FastImage.resizeMode.cover}
          />
          
          {/* Bookmark Icon */}
          <TouchableOpacity style={styles.bookmarkButton}>
            <Icon name="bookmark" size={16} color={COLORS.text.light} />
          </TouchableOpacity>
          
          {/* Stock Status Badge */}
          <View style={[styles.stockBadge, { backgroundColor: stockStatus.color === '#34C759' ? 'rgba(52, 199, 89, 0.9)' : stockStatus.color + '90' }]}>
            <Text style={[styles.stockText, { color: stockStatus.color === '#34C759' ? COLORS.text.light : stockStatus.color }]}>
              {stockStatus.text}
            </Text>
          </View>

          {/* Three Dot Menu */}
          <TouchableOpacity 
            style={styles.actionMenuButton}
            onPress={() => handleProductAction(product)}
          >
            <Icon name="more-horizontal" size={20} color={COLORS.text.light} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <View style={styles.brandContainer}>
              <View style={styles.brandLogo}>
                <Text style={styles.brandLogoText}>{product.brand?.charAt(0) || 'P'}</Text>
              </View>
              <View style={styles.brandInfo}>
                <Text style={styles.brandName}>
                  {product.brand || 'Product Brand'}
                </Text>
                <View style={styles.verifiedBadge}>
                  <Icon name="check-circle" size={12} color={COLORS.status.verified} />
                </View>
              </View>
            </View>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={12} color="#FFD700" />
              <Text style={styles.ratingText}>4.9 (100+)</Text>
            </View>
          </View>
          
          <Text style={styles.productName}>
            {product.name}
          </Text>
          
          <View style={styles.productDetails}>
            <View style={styles.detailItem}>
              <Icon name="tag" size={12} color={COLORS.text.secondary} />
              <Text style={styles.detailText}>${product.selling_price}</Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="package" size={12} color={COLORS.text.secondary} />
              <Text style={styles.detailText}>{product.category_name}</Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="hash" size={12} color={COLORS.text.secondary} />
              <Text style={styles.detailText}>SKU: {product.id}</Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="calendar" size={12} color={COLORS.text.secondary} />
              <Text style={styles.detailText}>Added: {new Date().toLocaleDateString()}</Text>
            </View>
          </View>
          
          <View style={styles.productTags}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Premium</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Featured</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Best Seller</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Products</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search and Actions */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color={COLORS.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity onPress={handleBarcodeScan} style={styles.barcodeButton}>
            <Icon name="camera" size={20} color={COLORS.text.light} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleFilterPress} style={styles.filterButton}>
            <Icon name="filter" size={20} color={COLORS.text.light} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Products List */}
      <ScrollView
        contentContainerStyle={styles.productsList}
        showsVerticalScrollIndicator={false}
      >
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="package" size={48} color={COLORS.text.secondary} />
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        ) : (
          filteredProducts.map((product) => (
            <TouchableOpacity key={product.id} style={styles.productCard} onPress={() => handleProductAction(product)}>
              <View style={styles.productImageContainer}>
                <FastImage
                  source={{ uri: getProductImage(product) }}
                  style={styles.productImage}
                  resizeMode={FastImage.resizeMode.cover}
                />
                
                {/* Bookmark Icon */}
                <TouchableOpacity style={styles.bookmarkButton}>
                  <Icon name="bookmark" size={16} color={COLORS.text.light} />
                </TouchableOpacity>
                
                {/* Stock Status Badge */}
                <View style={[styles.stockBadge, { backgroundColor: getStockStatus(product).color === '#34C759' ? 'rgba(52, 199, 89, 0.9)' : getStockStatus(product).color + '90' }]}>
                  <Text style={[styles.stockText, { color: getStockStatus(product).color === '#34C759' ? COLORS.text.light : getStockStatus(product).color }]}>
                    {getStockStatus(product).text}
                  </Text>
                </View>

                {/* Three Dot Menu */}
                <TouchableOpacity 
                  style={styles.actionMenuButton}
                  onPress={() => handleProductAction(product)}
                >
                  <Icon name="more-horizontal" size={20} color={COLORS.text.light} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.productInfo}>
                <View style={styles.productHeader}>
                  <View style={styles.brandContainer}>
                    <View style={styles.brandLogo}>
                      <Text style={styles.brandLogoText}>{product.brand?.charAt(0) || 'P'}</Text>
                    </View>
                    <View style={styles.brandInfo}>
                      <Text style={styles.brandName}>
                        {product.brand || 'Product Brand'}
                      </Text>
                      <View style={styles.verifiedBadge}>
                        <Icon name="check-circle" size={12} color={COLORS.status.verified} />
                      </View>
                    </View>
                  </View>
                  <View style={styles.ratingContainer}>
                    <Icon name="star" size={12} color="#FFD700" />
                    <Text style={styles.ratingText}>4.9 (100+)</Text>
                  </View>
                </View>
                
                <Text style={styles.productName}>
                  {product.name}
                </Text>
                
                <View style={styles.productDetails}>
                  <View style={styles.detailItem}>
                    <Icon name="tag" size={12} color={COLORS.text.secondary} />
                    <Text style={styles.detailText}>${product.selling_price}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Icon name="package" size={12} color={COLORS.text.secondary} />
                    <Text style={styles.detailText}>{product.category_name}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Icon name="hash" size={12} color={COLORS.text.secondary} />
                    <Text style={styles.detailText}>SKU: {product.id}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Icon name="calendar" size={12} color={COLORS.text.secondary} />
                    <Text style={styles.detailText}>Added: {new Date().toLocaleDateString()}</Text>
                  </View>
                </View>
                
                <View style={styles.productTags}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>Premium</Text>
                  </View>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>Featured</Text>
                  </View>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>Best Seller</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddProduct}>
        <Icon name="plus" size={24} color={COLORS.text.light} />
      </TouchableOpacity>

      {/* Action Menu Modal */}
      <Modal
        visible={showActionMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActionMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          onPress={() => setShowActionMenu(false)}
        >
          <View style={styles.actionMenu}>
            <TouchableOpacity 
              style={styles.actionMenuItem}
              onPress={() => selectedProduct && handleEditProduct(selectedProduct)}
            >
              <Icon name="edit-2" size={20} color={COLORS.primary} />
              <Text style={styles.actionMenuText}>Edit Product</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionMenuItem}
              onPress={() => selectedProduct && handleDeleteProduct(selectedProduct)}
            >
              <Icon name="trash-2" size={20} color="#FF3B30" />
              <Text style={[styles.actionMenuText, { color: '#FF3B30' }]}>Delete Product</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter & Sort</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Text style={styles.resetButton}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Icon name="x" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView style={styles.filterOptions}>
            {filterOptions.map((filter) => (
              <TouchableOpacity key={filter.id} style={styles.filterOption}>
                <Icon name={filter.icon as any} size={20} color={COLORS.text.secondary} />
                <Text style={styles.filterOptionText}>{filter.label}</Text>
                <Icon name="chevron-right" size={16} color={COLORS.text.secondary} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Add/Edit Product Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Icon name="x" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalPlaceholder}>
            Product form will be implemented here
          </Text>
        </View>
      </Modal>

      {/* Barcode Scanner Modal */}
      <Modal
        visible={showBarcodeScanner}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Scan Barcode</Text>
            <TouchableOpacity onPress={() => setShowBarcodeScanner(false)}>
              <Icon name="x" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalPlaceholder}>
            Barcode scanner will be implemented here
          </Text>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  backButton: { padding: SPACING.sm },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: { width: 48 },

  // Search bar
  searchContainer: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 30,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  searchInput: { flex: 1, fontSize: 16, color: COLORS.text.primary },
  barcodeButton: {
    width: 40,
    height: 40,
    marginLeft: SPACING.md,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButton: {
    width: 40,
    height: 40,
    marginLeft: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Category chips (rounded pills)
  categoryContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  categoryChip: {
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.text.primary,
  },
  categoryTextActive: {
    color: COLORS.text.light,
    fontWeight: '600',
  },

  // Product list
  productsList: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },

  // Product card
  productCard: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: COLORS.card,
    marginBottom: SPACING.lg,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  productImageContainer: {
    width: '100%',
    height: 220,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },

  // Bookmark & More buttons on image
  bookmarkButton: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionMenuButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Product info section
  productInfo: {
    padding: SPACING.xl,
    backgroundColor: COLORS.card,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  brandContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  brandLogo: {
    width: 32,
    height: 32,
    backgroundColor: COLORS.primary + '15',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  brandLogoText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  brandInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  brandName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
  },
  verifiedBadge: {
    marginLeft: SPACING.sm,
    backgroundColor: COLORS.status.verified + '15',
    borderRadius: 8,
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  ratingText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },

  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    lineHeight: 24,
  },

  productDetails: { marginBottom: SPACING.md },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginLeft: SPACING.sm,
    fontWeight: '500',
  },

  // Tags (badges)
  productTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },

  // Empty list fallback
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.text.secondary,
    marginTop: SPACING.sm,
  },

  // Floating Action Button
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },

  // Modals & overlays
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionMenu: {
    backgroundColor: COLORS.card,
    borderRadius: SPACING.sm,
    width: '80%',
    alignSelf: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  actionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  actionMenuText: {
    fontSize: 16,
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },

  modalContainer: {
    flex: 1,
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  resetButton: {
    fontSize: 16,
    color: COLORS.primary,
    marginRight: SPACING.sm,
  },
  filterOptions: { paddingVertical: SPACING.sm },

  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  filterOptionText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },

  modalPlaceholder: {
    fontSize: 18,
    color: COLORS.text.secondary,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
});

export default AllProductsScreen; 