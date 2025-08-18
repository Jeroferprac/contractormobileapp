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
  ImageBackground,
  Dimensions,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import FastImage from 'react-native-fast-image';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/spacing';
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
  const [showFilterModal, setShowFilterModal] = useState(false);

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
    
    const quantity = parseInt(stock.quantity.toString());
    const minStockLevel = parseInt(product.min_stock_level.toString());
    
    if (quantity <= minStockLevel) {
      return { text: 'Low Stock', color: '#FF9500' };
    }
    if (quantity === 0) {
      return { text: 'Out of Stock', color: '#FF3B30' };
    }
    return { text: `Stock: ${quantity}`, color: '#34C759' };
  };

  const handleBarcodeScan = () => {
    setShowBarcodeScanner(true);
  };

  const handleFilterPress = () => {
    setShowFilterModal(true);
  };

  const handleProductAction = (product: Product) => {
    navigation.navigate('Product', { product });
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           product.category_name.toLowerCase().includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Header Background with Camera Overflow */}
      <View style={styles.headerBackground} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={COLORS.text.light} />
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
            placeholder="Search BUO"
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity onPress={handleBarcodeScan} style={styles.iconButton}>
            <Icon name="mic" size={20} color={COLORS.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleFilterPress} style={styles.filterButton}>
            <Icon name="sliders" size={20} color={COLORS.text.light} />
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
          <View style={styles.productsGrid}>
            {filteredProducts.map((product) => (
              <TouchableOpacity key={product.id} style={styles.foodCard} onPress={() => handleProductAction(product)}>
                <View style={styles.foodImageContainer}>
                  <FastImage
                    source={{ uri: getProductImage(product) }}
                    style={styles.foodImage}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                  
                  {/* Stock Badge */}
                  <View style={styles.stockBadge}>
                    <Icon name="box" size={12} color={COLORS.text.light} />
                    <Text style={styles.stockBadgeText}>{stocks.find(s => s.product_id === product.id)?.quantity || 0}</Text>
                  </View>
                  
                  {/* Image Gradient Overlay */}
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.imageGradient}
                  />
                  
                  {/* Favorite Icon */}
                  <TouchableOpacity style={styles.favoriteButton}>
                    <Icon 
                      name={Math.random() > 0.5 ? "heart" : "heart"} 
                      size={16} 
                      color={Math.random() > 0.5 ? "#FF6B35" : "#FFF"} 
                    />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.foodInfo}>
                  <View style={styles.nameContainer}>
                    <Icon name="shopping-bag" size={16} color={COLORS.primary} style={styles.nameIcon} />
                    <Text style={styles.foodName} numberOfLines={2}>
                      {product.name}
                    </Text>
                  </View>
                  
                  <View style={styles.foodDetails}>
                    <Text style={styles.foodPrice}>
                      ${parseFloat(product.selling_price.toString()).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
      
      {/* Add Product Floating Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('AddProduct', {})}
      >
        <Icon name="plus" size={24} color={COLORS.text.light} />
      </TouchableOpacity>
      
      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Icon name="x" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filter Products</Text>
            <TouchableOpacity>
              <Text style={styles.resetButton}>Reset</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.filterOptions}>
            {filterOptions.map((option) => (
              <TouchableOpacity key={option.id} style={styles.filterOption}>
                <Icon name={option.icon} size={20} color={COLORS.text.secondary} />
                <Text style={styles.filterOptionText}>{option.label}</Text>
                <Icon name="check" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');
const cardWidth = (width - (SPACING.lg * 3)) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    position: 'relative',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160, // Further reduced height for better camera overflow
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: BORDER_RADIUS.lg,
    borderBottomRightRadius: BORDER_RADIUS.lg,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: 'transparent',
    zIndex: 10,
    paddingTop: Platform.OS === 'android' ? 40 : 0, 
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: '700',
    textTransform:"uppercase",
    color: COLORS.text.light,
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xs, // Adjusted to overlap with header background
    zIndex: 10,
    paddingBottom:SPACING.xs
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    height: 50,
    marginTop: 0,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: 16,
    color: COLORS.text.primary,
  },
  iconButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  filterButton: {
    padding: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    marginLeft: SPACING.sm,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productsList: {
    padding: SPACING.lg,
    paddingBottom: 100, // Space for bottom navigation
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  foodCard: {
    width: cardWidth,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  foodImageContainer: {
    height: cardWidth,
    position: 'relative',
  },
  foodImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    borderBottomLeftRadius: BORDER_RADIUS.md,
    borderBottomRightRadius: BORDER_RADIUS.md,
  },
  stockBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  stockBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text.light,
    marginLeft: 4,
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
    borderBottomLeftRadius: BORDER_RADIUS.md,
    borderBottomRightRadius: BORDER_RADIUS.md,
  },
  favoriteButton: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: SPACING.sm,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockIndicator: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
  },
  foodInfo: {
    padding: SPACING.md,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.sm,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    height: 40,
  },
  nameIcon: {
    marginRight: SPACING.xs,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginBottom: 0,
    flex: 1,
    letterSpacing: 0.3,
  },
  foodDetails: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 2,
  },
  foodPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginTop: SPACING.md,
  },
  addButton: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: 80, // Above bottom navigation
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 100,
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
  filterOptions: { 
    paddingVertical: SPACING.sm 
  },
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
});

export default AllProductsScreen;