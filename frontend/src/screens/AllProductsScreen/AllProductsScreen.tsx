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
  Dimensions,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import FastImage from 'react-native-fast-image';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/spacing';
import { AllProductsScreenNavigationProp } from '../../types/navigation';
import { Product, Stock, Category } from '../../types/inventory';
import inventoryApiService from '../../api/inventoryApi';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import BarcodeScanner from '../../components/ui/BarcodeScanner';
import ProductSearchModal from '../../components/ui/ProductSearchModal';
import ProductFilterModal from '../../components/ui/ProductFilterModal';

interface AllProductsScreenProps {
  navigation: AllProductsScreenNavigationProp;
}

// Product Card Skeleton Component
const ProductCardSkeleton: React.FC = () => {
  return (
    <View style={styles.productCard}>
      <View style={styles.cardContent}>
        {/* Image Container Skeleton with exact overlays */}
        <View style={styles.imageContainer}>
          <LoadingSkeleton 
            width="100%" 
            height={130} 
            borderRadius={16}
          />
          

          {/* Price Overlay Skeleton positioned exactly like real overlay - WHITE/GREY */}
          <View style={[styles.priceOverlay, { position: 'absolute', bottom: SPACING.sm, right: SPACING.sm }]}>
            <LoadingSkeleton 
              width={60} 
              height={24} 
              borderRadius={12} 
            />
          </View>
        </View>

        {/* Content Area Skeleton */}
        <View style={styles.cardBody}>
          <LoadingSkeleton 
            width="85%" 
            height={16} 
            style={styles.titleSkeleton}
          />
        </View>
      </View>
    </View>
  );
};

// Filter Tabs Skeleton Component
const FilterTabsSkeleton: React.FC = () => {
  return (
    <View style={styles.categoryContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {[1, 2, 3, 4, 5, 6].map((item, index) => (
          <View key={`filter-skeleton-${index}`} style={styles.categoryTab}>
            <LoadingSkeleton 
              width={80} 
              height={32} 
              borderRadius={20}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

// Search Bar Skeleton Component
const SearchBarSkeleton: React.FC = () => {
  return (
    <View style={styles.searchContainer}>
      <LoadingSkeleton 
        width="100%" 
        height={48} 
        borderRadius={12}
      />
    </View>
  );
};

const AllProductsScreen: React.FC<AllProductsScreenProps> = ({ navigation }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSortBy, setSelectedSortBy] = useState('name-a-z');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [selectedStockStatus, setSelectedStockStatus] = useState('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<any>({});

  const categoryTabs = [
    { id: 'all', label: 'All Products', icon: 'package' },
    { id: 'mobile', label: 'Mobile Phones', icon: 'smartphone' },
    { id: 'laptop', label: 'Laptops', icon: 'monitor' },
    { id: 'accessory', label: 'Accessories', icon: 'headphones' },
    { id: 'cement', label: 'Construction', icon: 'tool' },
    { id: 'tools', label: 'Tools', icon: 'settings' },
  ];

  // Dynamic filter options from API data
  const sortOptions = [
    { id: 'name-a-z', label: 'Name: A to Z', icon: 'sort-asc' },
    { id: 'name-z-a', label: 'Name: Z to A', icon: 'sort-desc' },
    { id: 'price-low', label: 'Price: Low to High', icon: 'arrow-up' },
    { id: 'price-high', label: 'Price: High to Low', icon: 'arrow-down' },
    { id: 'stock-high', label: 'Stock: High to Low', icon: 'trending-up' },
    { id: 'stock-low', label: 'Stock: Low to High', icon: 'trending-down' },
    { id: 'newest', label: 'Newest First', icon: 'clock' },
    { id: 'oldest', label: 'Oldest First', icon: 'calendar' },
  ];

  // Get unique brands from products
  const brandOptions = [
    { id: 'all', label: 'All Brands', icon: 'tag' },
    ...Array.from(new Set(products.map(p => p.brand).filter(Boolean))).map(brand => ({
      id: brand,
      label: brand,
      icon: 'tag'
    }))
  ];

  // Price range options
  const priceRangeOptions = [
    { id: 'all', label: 'All Prices', icon: 'dollar-sign' },
    { id: '0-1000', label: 'Under $1,000', icon: 'dollar-sign' },
    { id: '1000-5000', label: '$1,000 - $5,000', icon: 'dollar-sign' },
    { id: '5000-10000', label: '$5,000 - $10,000', icon: 'dollar-sign' },
    { id: '10000+', label: 'Over $10,000', icon: 'dollar-sign' },
  ];

  // Stock status options
  const stockStatusOptions = [
    { id: 'all', label: 'All Stock', icon: 'package' },
    { id: 'in-stock', label: 'In Stock', icon: 'check-circle' },
    { id: 'low-stock', label: 'Low Stock', icon: 'alert-triangle' },
    { id: 'out-of-stock', label: 'Out of Stock', icon: 'x-circle' },
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  // Reload products when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadProducts(true);
    });

    return unsubscribe;
  }, [navigation]);

  const loadProducts = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const [productsResponse, stocksResponse, categoriesResponse, warehousesResponse] = await Promise.all([
        inventoryApiService.getProducts(),
        inventoryApiService.getStocks(),
        inventoryApiService.getCategories(),
        inventoryApiService.getWarehouses()
      ]);
      
      setProducts(productsResponse.data || []);
      setStocks(stocksResponse.data || []);
      setCategories(categoriesResponse.data || []);
      setWarehouses(warehousesResponse.data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'Failed to load products');
      setProducts([]);
      setStocks([]);
      setCategories([]);
      setWarehouses([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
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
      return { text: 'Low Stock', color: '#FB7504' };
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

  const handleSearchPress = () => {
    setShowSearchModal(true);
  };

  const handleFilterReset = () => {
    setSelectedSortBy('name-a-z');
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSelectedPriceRange('all');
    setSelectedStockStatus('all');
    setAppliedFilters({});
  };

  const handleFilterApply = (filters: any) => {
    setAppliedFilters(filters);
    setShowFilterModal(false);
  };

  const handleSearchSubmit = (search: string) => {
    setSearchText(search);
    // Add to recent searches
    const newRecentSearches = [search, ...recentSearches.filter(s => s !== search)].slice(0, 5);
    setRecentSearches(newRecentSearches);
  };

  const handleRecentSearchPress = (search: string) => {
    setSearchText(search);
  };

  const handleProductSelect = (product: Product) => {
    navigation.navigate('Product', { product });
  };

  const handleProductAction = (product: Product) => {
    navigation.navigate('Product', { product });
  };

  const onRefresh = () => {
    loadProducts(true);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           product.category_name.toLowerCase().includes(selectedCategory);
    const matchesBrand = selectedBrand === 'all' || product.brand === selectedBrand;
    
    // Price range filter
    const productPrice = parseFloat(product.selling_price.toString());
    let matchesPriceRange = true;
    if (selectedPriceRange !== 'all') {
      switch (selectedPriceRange) {
        case '0-1000':
          matchesPriceRange = productPrice < 1000;
          break;
        case '1000-5000':
          matchesPriceRange = productPrice >= 1000 && productPrice < 5000;
          break;
        case '5000-10000':
          matchesPriceRange = productPrice >= 5000 && productPrice < 10000;
          break;
        case '10000+':
          matchesPriceRange = productPrice >= 10000;
          break;
      }
    }
    
    // Stock status filter
    const stock = stocks.find(s => s.product_id === product.id);
    const stockQuantity = parseInt(stock?.quantity?.toString() || '0');
    let matchesStockStatus = true;
    if (selectedStockStatus !== 'all') {
      switch (selectedStockStatus) {
        case 'in-stock':
          matchesStockStatus = stockQuantity > 10;
          break;
        case 'low-stock':
          matchesStockStatus = stockQuantity > 0 && stockQuantity <= 10;
          break;
        case 'out-of-stock':
          matchesStockStatus = stockQuantity === 0;
          break;
      }
    }
    
    return matchesSearch && matchesCategory && matchesBrand && matchesPriceRange && matchesStockStatus;
  }).sort((a, b) => {
    // Apply sorting
    switch (selectedSortBy) {
      case 'name-a-z':
        return a.name.localeCompare(b.name);
      case 'name-z-a':
        return b.name.localeCompare(a.name);
      case 'price-low':
        return parseFloat(a.selling_price.toString()) - parseFloat(b.selling_price.toString());
      case 'price-high':
        return parseFloat(b.selling_price.toString()) - parseFloat(a.selling_price.toString());
      case 'stock-high':
        const stockA = parseInt(stocks.find(s => s.product_id === a.id)?.quantity?.toString() || '0');
        const stockB = parseInt(stocks.find(s => s.product_id === b.id)?.quantity?.toString() || '0');
        return stockB - stockA;
      case 'stock-low':
        const stockA2 = parseInt(stocks.find(s => s.product_id === a.id)?.quantity?.toString() || '0');
        const stockB2 = parseInt(stocks.find(s => s.product_id === b.id)?.quantity?.toString() || '0');
        return stockA2 - stockB2;
      case 'newest':
        return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
      case 'oldest':
        return new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime();
      default:
        return 0;
    }
  });

  const renderProductCard = ({ item: product }: { item: Product }) => {
    const stock = stocks.find(s => s.product_id === product.id);
    const stockQuantity = stock?.quantity || 0;

    return (
      <TouchableOpacity 
        style={styles.productCard} 
        onPress={() => handleProductAction(product)}
        activeOpacity={0.9}
      >
        <View style={styles.cardContent}>
          {/* Product Image */}
          <View style={styles.imageContainer}>
            <FastImage
              source={{ uri: getProductImage(product) }}
              style={styles.productImage}
              resizeMode={FastImage.resizeMode.cover}
            />
          </View>

          {/* Product Details */}
          <View style={styles.cardBody}>
            {/* Product Name and Engagement Metrics */}
            <View style={styles.productHeader}>
              <Text style={styles.productName} numberOfLines={1}>
                {product.name}
              </Text>
              <View style={styles.engagementMetrics}>
                <View style={styles.engagementItem}>
                  <Icon name="bookmark" size={14} color={COLORS.text.secondary} />
                  <Text style={styles.engagementText}>20</Text>
                </View>
                <View style={styles.engagementItem}>
                  <Icon name="heart" size={14} color={COLORS.text.secondary} />
                  <Text style={styles.engagementText}>50</Text>
                </View>
              </View>
            </View>

            {/* Product Description */}
            <Text style={styles.productDescription} numberOfLines={2}>
              Eco-friendly insulation with excellent quality and durability for construction projects.
            </Text>

            {/* Price */}
            <Text style={styles.productPrice}>
              ${Math.round(parseFloat(product.selling_price.toString()))}/bag
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategoryTab = (category: { id: string; label: string; icon: string }) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryTab,
        selectedCategory === category.id && styles.activeCategoryTab,
      ]}
      onPress={() => setSelectedCategory(category.id)}
    >
      <Icon 
        name={category.icon} 
        size={16} 
        color={selectedCategory === category.id ? COLORS.text.light : COLORS.text.secondary} 
      />
      <Text
        style={[
          styles.categoryText,
          selectedCategory === category.id && styles.activeCategoryText,
        ]}
      >
        {category.label}
      </Text>
    </TouchableOpacity>
  );

  // Loading State
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        
        {/* Header Background */}
        <View style={styles.headerBackground} />
        
        {/* Header - No skeleton, show actual header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color={COLORS.text.light} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ALL PRODUCTS</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Search Bar - Show actual search bar during loading */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Icon name="search" size={20} color={COLORS.text.secondary} />
            <Text style={styles.searchPlaceholder}>Search products...</Text>
            <TouchableOpacity style={styles.scanButton}>
              <Icon name="camera" size={20} color={COLORS.text.light} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Icon name="sliders" size={20} color={COLORS.text.light} />
          </TouchableOpacity>
        </View>

        {/* Filter Tabs Skeleton */}
        <FilterTabsSkeleton />

        {/* Products Grid Skeleton */}
        <ScrollView contentContainerStyle={styles.productsList}>
          <View style={styles.productsGrid}>
            {[1, 2, 3, 4, 5, 6].map((item, index) => (
              <ProductCardSkeleton key={`product-skeleton-${index}`} />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

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
        <TouchableOpacity style={styles.searchBar} onPress={handleSearchPress}>
          <Icon name="search" size={20} color={COLORS.text.secondary} />
          <Text style={styles.searchPlaceholder}>
            {searchText || 'Search products...'}
          </Text>
          <TouchableOpacity onPress={handleBarcodeScan} style={styles.scanButton}>
            <Icon name="camera" size={20} color={COLORS.text.light} />
          </TouchableOpacity>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleFilterPress} style={styles.filterButton}>
          <Icon name="sliders" size={20} color={COLORS.text.light} />
        </TouchableOpacity>
      </View>



      {/* Category Tabs */}
      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categoryTabs.map(renderCategoryTab)}
        </ScrollView>
      </View>

      {/* Products List */}
      <View style={styles.productsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Products</Text>
          <Text style={styles.productsCount}>
            {selectedCategory === 'all' ? `${products.length} Products` : `${filteredProducts.length} ${categoryTabs.find(c => c.id === selectedCategory)?.label}`}
          </Text>
        </View>

        {filteredProducts.length > 0 ? (
          <ScrollView 
            contentContainerStyle={styles.productsList}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.productsGrid}>
              {filteredProducts.map((product) => 
                <View key={product.id}>
                  {renderProductCard({ item: product })}
                </View>
              )}
            </View>
          </ScrollView>
        ) : (
          !loading && (
            <View style={styles.emptyState}>
              <Icon name="package" size={64} color={COLORS.text.secondary} />
              <Text style={styles.emptyTitle}>
                {searchText || selectedCategory !== 'all' ? 'No Products Found' : 'No Products Available'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchText 
                  ? 'Try adjusting your search terms'
                  : selectedCategory !== 'all'
                  ? `No products found in ${categoryTabs.find(c => c.id === selectedCategory)?.label}`
                  : 'No products data available. Please check your connection or try again later.'
                }
              </Text>
            </View>
          )
        )}
      </View>
      
      {/* Add Product Floating Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('AddProduct', {})}
      >
        <Icon name="plus" size={24} color={COLORS.text.light} />
      </TouchableOpacity>

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        visible={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onScan={(barcode, product) => {
          if (product) {
            // Navigate to product details or show product info
            console.log('Scanned product:', product);
            setShowBarcodeScanner(false);
          }
        }}
        showProductDetails={true}
      />

      {/* Product Search Modal */}
      <ProductSearchModal
        visible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onProductSelect={handleProductSelect}
        products={products}
        recentSearches={recentSearches}
        onRecentSearchPress={handleRecentSearchPress}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* Product Filter Modal 
      <ProductFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleFilterApply}
        onReset={handleFilterReset}
        products={products}
        categories={categories}
        brands={brandOptions.map(b => b.label).filter((label): label is string => Boolean(label))}
        warehouses={warehouses}
      />*/}
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
    height: 160,
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
    textTransform: "uppercase",
    color: COLORS.text.light,
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
    zIndex: 11,

  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: 16,
    color: COLORS.text.primary,
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  scanButton: {
    padding: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    marginLeft: SPACING.sm,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButton: {
    padding: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryContainer: {
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.lg,
  },
  categoryScroll: {
    paddingHorizontal: SPACING.lg,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 25,
    backgroundColor: COLORS.surface,
    marginRight: SPACING.sm,
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  activeCategoryTab: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  activeCategoryText: {
    color: COLORS.text.light,
  },
  productsSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  productsCount: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  productsList: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  productsRow: {
    justifyContent: 'space-between',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: cardWidth,
    backgroundColor: COLORS.text.light,
    borderRadius: 16,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
  },
  imageContainer: {
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  cardBody: {
    padding: SPACING.md,
    backgroundColor: COLORS.text.light,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
    flex: 1,
  },
  engagementMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  engagementText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  productDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  addButton: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: 80,
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
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    backgroundColor: COLORS.surface,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.border.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  resetButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.border.light,
    borderRadius: 12,
  },
  resetButtonText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  filterContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  filterSection: {
    marginVertical: SPACING.lg,
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  filterOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  filterOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    marginBottom: SPACING.sm,
    minWidth: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterOptionCardSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterOptionText: {
    fontSize: 14,
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
    fontWeight: '500',
  },
  filterOptionTextSelected: {
    color: COLORS.text.light,
    fontWeight: '600',
  },
  modalFooter: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
    backgroundColor: COLORS.surface,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  applyButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.light,
    marginRight: SPACING.sm,
  },
  // Skeleton Styles
  titleSkeleton: {
    marginBottom: SPACING.sm,
  },
  detailsSkeleton: {
    marginBottom: SPACING.md,
  },
});

export default AllProductsScreen;