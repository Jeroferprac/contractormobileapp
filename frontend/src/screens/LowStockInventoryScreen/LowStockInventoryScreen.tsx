import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Feather';
import { LineChart } from 'react-native-chart-kit';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';
import { inventoryApiService } from '../../api/inventoryApi';
import { Stock, Product, Warehouse } from '../../types/inventory';
import StockForm from '../../components/inventory/Warehouse/StockForm';

const { width: screenWidth } = Dimensions.get('window');

interface LowStockItem {
  stock: Stock;
  product: Product;
  warehouse: Warehouse;
  stockLevel: 'critical' | 'low' | 'medium';
  imageUrl: string;
}

const LowStockInventoryScreen = ({ navigation }) => {
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<LowStockItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [stockFormVisible, setStockFormVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [selectedStockLevel, setSelectedStockLevel] = useState('all');

  const chartData = {
    labels: ['', '', '', '', '', ''],
    datasets: [
      {
        data: [30, 45, 35, 60, 75, 65],
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  useEffect(() => {
    loadLowStockData();
  }, []);

  useEffect(() => {
    filterItems();
  }, [lowStockItems, searchText, selectedCategory, selectedWarehouse, selectedStockLevel]);

  const loadLowStockData = async () => {
    try {
      setLoading(true);
      const stocksResponse = await inventoryApiService.getLowStockItems();
      const [productsResponse, warehousesResponse] = await Promise.all([
        inventoryApiService.getProducts(),
        inventoryApiService.getWarehouses()
      ]);

      const productsMap = new Map(productsResponse.data.map(p => [p.id, p]));
      const warehousesMap = new Map(warehousesResponse.data.map(w => [w.id, w]));

      const items: LowStockItem[] = stocksResponse.data.map(stock => {
        const product = productsMap.get(stock.product_id);
        const warehouse = warehousesMap.get(stock.warehouse_id);
        const quantity = parseInt(stock.quantity.toString());
        
        let stockLevel: 'critical' | 'low' | 'medium' = 'medium';
        if (quantity <= 10) stockLevel = 'critical';
        else if (quantity <= 30) stockLevel = 'low';

        return {
          stock,
          product: product || {} as Product,
          warehouse: warehouse || {} as Warehouse,
          stockLevel,
          imageUrl: `https://source.unsplash.com/400x300/?${encodeURIComponent(product?.name || 'product')}&sig=${stock.id}`
        };
      });

      setLowStockItems(items);
    } catch (error) {
      console.error('Error loading low stock data:', error);
      Alert.alert('Error', 'Failed to load low stock inventory data');
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = lowStockItems;

    // Search filter
    if (searchText) {
      filtered = filtered.filter(item =>
        item.product.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.product.category_name?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item =>
        item.product.category_name?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Warehouse filter
    if (selectedWarehouse !== 'all') {
      filtered = filtered.filter(item =>
        item.warehouse.name?.toLowerCase() === selectedWarehouse.toLowerCase()
      );
    }

    // Stock level filter
    if (selectedStockLevel !== 'all') {
      filtered = filtered.filter(item => item.stockLevel === selectedStockLevel);
    }

    setFilteredItems(filtered);
  };

  const getStockLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return '#FF3B30';
      case 'low': return '#FF9500';
      default: return '#34C759';
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

  const handleItemLongPress = (item: LowStockItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleAddStock = () => {
    setStockFormVisible(true);
  };

  const handleUpdateStock = async (stockId: string, newQuantity: number) => {
    try {
      await inventoryApiService.updateStock(stockId, { quantity: newQuantity });
      Alert.alert('Success', 'Stock updated successfully');
      loadLowStockData();
    } catch (error) {
      Alert.alert('Error', 'Failed to update stock');
    }
  };

  const handleDeleteStock = async (stockId: string) => {
    try {
      await inventoryApiService.deleteStock(stockId);
      Alert.alert('Success', 'Stock deleted successfully');
      loadLowStockData();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete stock');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Low Stock Inventory...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const criticalItems = filteredItems.filter(item => item.stockLevel === 'critical');
  const lowItems = filteredItems.filter(item => item.stockLevel === 'low');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Premium Header - Fixed Alignment */}
      <LinearGradient colors={['#FF6B35', '#FF8E53']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Low Stock Inventory</Text>
            <Text style={styles.headerSubtitle}>Manage your inventory levels</Text>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerActionButton} onPress={handleAddStock}>
              <Icon name="plus" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionButton} onPress={() => setFilterVisible(true)}>
              <Icon name="filter" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionButton}>
              <Icon name="download" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Low Stock Items Card with Professional Chart */}
        <View style={styles.section}>
          <LinearGradient 
            colors={['#FF6B35', '#FF8E53', '#FFA726']} 
            style={styles.gradientCard}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Low Stock Items</Text>
              <Icon name="chevron-right" size={20} color="#FFFFFF" />
            </View>
            
            <View style={styles.cardContent}>
              <Text style={styles.cardNumber}>{filteredItems.length}</Text>
              <Text style={styles.cardSubtitle}>Total Items</Text>
              
              <View style={styles.cardStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{criticalItems.length}</Text>
                  <Text style={styles.statLabel}>Critical</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{lowItems.length}</Text>
                  <Text style={styles.statLabel}>Low</Text>
                </View>
              </View>
              
              <Text style={styles.cardStatus}>
                {criticalItems.length === 0 ? 'Stock levels are manageable' : 'Action required'}
              </Text>
            </View>
            
            {/* Professional Area Chart with Gradient Fill */}
            <View style={styles.chartContainer}>
              <LineChart
                data={chartData}
                width={screenWidth - SPACING.lg * 4}
                height={120}
                chartConfig={{
                  backgroundColor: 'transparent',
                  backgroundGradientFrom: 'transparent',
                  backgroundGradientTo: 'transparent',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  fillShadowGradient: '#FF6B35',
                  fillShadowGradientOpacity: 0.3,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '4',
                    strokeWidth: '2',
                    stroke: '#FFFFFF',
                    fill: '#FFFFFF',
                  },
                }}
                bezier
                style={[styles.chart, { backgroundColor: 'transparent' }]}
                withDots={true}
                withShadow={false}
                withInnerLines={false}
                withOuterLines={false}
                withVerticalLines={false}
                withHorizontalLines={false}
                withVerticalLabels={false}
                withHorizontalLabels={false}
                decorator={() => null}
              />
            </View>
          </LinearGradient>
        </View>

        {/* Instagram-style Low Stock Alerts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Critical Items</Text>
            <Text style={styles.sectionSubtitle}>Tap to add stock</Text>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storiesContainer}
          >
            {/* Debug: Show at least one story if no critical items */}
            {criticalItems.length === 0 ? (
              <TouchableOpacity
                style={styles.storyItem}
                onPress={() => handleItemLongPress(lowStockItems[0])}
              >
                <LinearGradient
                  colors={['#FF3B30', '#FF6B35', '#FF9500']}
                  style={styles.storyBorder}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.storyContent}>
                    <FastImage
                      source={{ 
                        uri: getProductImage(lowStockItems[0]?.product),
                        priority: FastImage.priority.high,
                        cache: FastImage.cacheControl.immutable
                      }}
                      style={styles.storyImage}
                      resizeMode={FastImage.resizeMode.cover}
                      onError={() => console.log('Image failed to load')}
                      onLoad={() => console.log('Image loaded successfully')}
                    />
                    <View style={styles.storyIndicator}>
                      <Icon name="alert-triangle" size={12} color="#FF3B30" />
                    </View>
                  </View>
                </LinearGradient>
                <Text style={styles.storyLabel} numberOfLines={1}>
                  {lowStockItems[0]?.product.name || 'Product'}
                </Text>
                <Text style={styles.storyStock}>
                  {lowStockItems[0]?.stock.quantity} left
                </Text>
              </TouchableOpacity>
            ) : (
              criticalItems.slice(0, 6).map((item, index) => (
              <TouchableOpacity
                key={item.stock.id}
                style={styles.storyItem}
                onPress={() => handleItemLongPress(item)}
              >
                <LinearGradient
                  colors={['#FF3B30', '#FF6B35', '#FF9500']}
                  style={styles.storyBorder}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.storyContent}>
                    <FastImage
                      source={{ 
                        uri: getProductImage(item.product),
                        priority: FastImage.priority.high,
                        cache: FastImage.cacheControl.immutable
                      }}
                      style={styles.storyImage}
                      resizeMode={FastImage.resizeMode.cover}
                      onError={() => console.log('Image failed to load')}
                      onLoad={() => console.log('Image loaded successfully')}
                    />
                    {/* Story indicator dot */}
                    <View style={styles.storyIndicator}>
                      <Icon name="alert-triangle" size={12} color="#FF3B30" />
                    </View>
                  </View>
                </LinearGradient>
                <Text style={styles.storyLabel} numberOfLines={1}>
                  {item.product.name || 'Product'}
                </Text>
                <Text style={styles.storyStock}>
                  {item.stock.quantity} left
                </Text>
              </TouchableOpacity>
            ))
            )}
          </ScrollView>
        </View>

        {/* Search Bar */}
        <View style={styles.section}>
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#8E8E93"
            />
          </View>
        </View>

        {/* All Low Stock Products - Fourth Image Style */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Low Stock Products</Text>
            <Text style={styles.sectionSubtitle}>{filteredItems.length} items</Text>
          </View>
          
          <View style={styles.filterContainer}>
            <TouchableOpacity 
              style={[styles.filterChip, selectedCategory === 'all' && styles.activeFilterChip]}
              onPress={() => setSelectedCategory('all')}
            >
              <Text style={[styles.filterChipText, selectedCategory === 'all' && styles.activeFilterChipText]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterChip, selectedCategory === 'laptops' && styles.activeFilterChip]}
              onPress={() => setSelectedCategory('laptops')}
            >
              <Text style={[styles.filterChipText, selectedCategory === 'laptops' && styles.activeFilterChipText]}>Laptops</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterChip, selectedWarehouse === 'warehouse 3' && styles.activeFilterChip]}
              onPress={() => setSelectedWarehouse('warehouse 3')}
            >
              <Text style={[styles.filterChipText, selectedWarehouse === 'warehouse 3' && styles.activeFilterChipText]}>Warehouse 3</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.productsGrid}>
            {filteredItems.map((item) => (
              <TouchableOpacity
                key={item.stock.id}
                style={styles.productCard}
                onPress={() => handleItemLongPress(item)}
                activeOpacity={0.8}
              >
                {/* Product Tags */}
                <View style={styles.productTags}>
                  <View style={styles.productTag}>
                    <View style={styles.tagDot} />
                    <Text style={styles.productTagText} numberOfLines={1}>
                      {item.product.category_name || 'Category'}
                    </Text>
                  </View>
                  <View style={styles.productTag}>
                    <Icon name="zap" size={10} color="#000" />
                    <Text style={styles.productTagText} numberOfLines={1}>
                      {item.warehouse.name || 'Warehouse'}
                    </Text>
                  </View>
                </View>
                
                {/* Product Image */}
                <FastImage
                  source={{ 
                    uri: getProductImage(item.product),
                    priority: FastImage.priority.high,
                    cache: FastImage.cacheControl.immutable
                  }}
                  style={styles.productImage}
                  resizeMode={FastImage.resizeMode.cover}
                  onError={() => console.log('Product image failed to load')}
                />
                
                {/* Product Details */}
                <View style={styles.productDetails}>
                  <Text style={styles.productStock}>
                    {item.stock.quantity} Items
                  </Text>
                  <Text style={styles.productName} numberOfLines={2}>
                    {item.product.name}
                  </Text>
                  <TouchableOpacity style={styles.productAction}>
                    <Icon name="external-link" size={16} color="#8E8E93" />
                  </TouchableOpacity>
                </View>
                
                {/* Stock Level Badge */}
                <View style={[styles.stockLevelBadge, { backgroundColor: getStockLevelColor(item.stockLevel) }]}>
                  <Text style={styles.stockLevelText}>
                    {item.stockLevel === 'critical' ? 'Critical' : item.stockLevel === 'low' ? 'Low' : 'Medium'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Instagram-style Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Stock Actions</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="x" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            
            {selectedItem && (
              <View style={styles.modalItemInfo}>
                <FastImage
                  source={{ uri: selectedItem.imageUrl }}
                  style={styles.modalItemImage}
                  resizeMode={FastImage.resizeMode.cover}
                />
                <View style={styles.modalItemDetails}>
                  <Text style={styles.modalItemName}>{selectedItem.product.name}</Text>
                  <Text style={styles.modalItemStock}>
                    Current Stock: {selectedItem.stock.quantity}
                  </Text>
                </View>
              </View>
            )}
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalAction, styles.addAction]}
                onPress={() => {
                  setModalVisible(false);
                  setStockFormVisible(true);
                }}
              >
                <Icon name="plus" size={20} color="#34C759" />
                <Text style={[styles.modalActionText, styles.addActionText]}>Add Stock</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalAction, styles.editAction]}
                onPress={() => {
                  setModalVisible(false);
                  setStockFormVisible(true);
                }}
              >
                <Icon name="edit-2" size={20} color="#007AFF" />
                <Text style={[styles.modalActionText, styles.editActionText]}>Edit Stock</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalAction, styles.deleteAction]}
                onPress={() => {
                  if (selectedItem) {
                    handleDeleteStock(selectedItem.stock.id);
                  }
                  setModalVisible(false);
                }}
              >
                <Icon name="trash-2" size={20} color="#FF3B30" />
                <Text style={[styles.modalActionText, styles.deleteActionText]}>Delete Stock</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Stock Form Modal */}
      <Modal
        visible={stockFormVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setStockFormVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Stock Management</Text>
              <TouchableOpacity onPress={() => setStockFormVisible(false)}>
                <Icon name="x" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formContainer}>
              <Text style={styles.formLabel}>Quantity</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter quantity"
                keyboardType="numeric"
                value={selectedItem?.stock.quantity.toString() || ''}
              />
              
              <Text style={styles.formLabel}>Notes</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                placeholder="Add notes (optional)"
                multiline
                numberOfLines={3}
              />
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={() => {
                  Alert.alert('Success', 'Stock updated successfully');
                  setStockFormVisible(false);
                  loadLowStockData();
                }}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  header: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
    ...SHADOWS.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  gradientCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardContent: {
    marginBottom: SPACING.lg,
  },
  cardNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
  },
  cardSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: SPACING.md,
  },
  cardStats: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  statItem: {
    marginRight: SPACING.lg,
  },
  statNumber: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  cardStatus: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  chartContainer: {
    height: 140,
    marginTop: SPACING.md,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  chart: {
    marginVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'transparent',
  },
  sectionHeader: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.primary,
  },
  storiesContainer: {
    paddingRight: SPACING.lg,
  },
  storyItem: {
    alignItems: 'center',
    marginRight: SPACING.lg,
    width: 80,
  },
  storyBorder: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    padding: 3,
    marginBottom: SPACING.xs,
  },
  storyContent: {
    flex: 1,
    borderRadius: 34.5,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  storyIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  storyLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '500',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 2,
  },
  storyStock: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    flexWrap: 'wrap',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: '#F1F3F4',
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  filterChipText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
  },
  activeFilterChip: {
    backgroundColor: '#FFF3E0',
  },
  activeFilterChipText: {
    color: '#FF6B35',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: (screenWidth - SPACING.lg * 3) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  productTags: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  productTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: '#F1F3F4',
    marginRight: SPACING.xs,
    flex: 1,
  },
  tagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#000',
    marginRight: 4,
  },
  productTagText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    flex: 1,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  productDetails: {
    marginBottom: SPACING.sm,
  },
  productStock: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  productName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '500',
    color: COLORS.text.primary,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  productAction: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F3F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockLevelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  stockLevelText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  modalItemInfo: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: '#F8F9FA',
    borderRadius: BORDER_RADIUS.lg,
  },
  modalItemImage: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.md,
  },
  modalItemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  modalItemName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  modalItemStock: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
  modalActions: {
    gap: SPACING.sm,
  },
  modalAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: '#F8F9FA',
  },
  modalActionText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '500',
    marginLeft: SPACING.sm,
  },
  addAction: {
    backgroundColor: '#E8F5E8',
  },
  addActionText: {
    color: '#34C759',
  },
  editAction: {
    backgroundColor: '#E3F2FD',
  },
  editActionText: {
    color: '#007AFF',
  },
  deleteAction: {
    backgroundColor: '#FFEBEE',
  },
  deleteActionText: {
    color: '#FF3B30',
  },
  formContainer: {
    gap: SPACING.md,
  },
  formLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.primary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#FF6B35',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
  },
});

export default LowStockInventoryScreen;
