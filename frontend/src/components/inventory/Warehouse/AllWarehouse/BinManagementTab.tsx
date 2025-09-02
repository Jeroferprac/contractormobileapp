import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../../../constants/spacing';
import { TYPOGRAPHY } from '../../../../constants/typography';
import { Stock, Warehouse, Product } from '../../../../types/inventory';
import inventoryApiService from '../../../../api/inventoryApi';
import LinearGradient from 'react-native-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface BinData {
  id: string;
  code: string;
  location: string;
  capacity: number;
  currentStock: number;
  status: 'empty' | 'low' | 'medium' | 'full';
  row: number;
  column: number;
  warehouseId: string;
  products?: Array<{
    id: string;
    name: string;
    quantity: number;
    image?: string;
  }>;
  // Professional UI fields
  name: string;
  address: string;
  description: string;
  lastUpdated: string;
  image?: string;
  profileImage?: string;
  rating?: number;
  distance?: string;
  eta?: string;
  price?: string;
}

interface BinManagementTabProps {
  totalBins: number;
  activeBins: number;
  warehouseId?: string;
  activeTab?: 'list' | 'map';
  onTabChange?: (tab: 'list' | 'map') => void;
}

const BinManagementTab: React.FC<BinManagementTabProps> = ({
  totalBins,
  activeBins,
  warehouseId,
}) => {
  const [binData, setBinData] = useState<BinData[]>([]);
  const [selectedBin, setSelectedBin] = useState<BinData | null>(null);
  const [showExpandedCard, setShowExpandedCard] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchRealData();
  }, [warehouseId]);

  const fetchRealData = async () => {
    try {
      setLoading(true);
      
      // Fetch real data from APIs
      const [warehousesResponse, stocksResponse, productsResponse] = await Promise.all([
        inventoryApiService.getWarehouses(),
        inventoryApiService.getWarehouseStocks({ warehouse_id: warehouseId }),
        inventoryApiService.getProducts()
      ]);

      setWarehouses(warehousesResponse.data);
      setStocks(stocksResponse.data);
      setProducts(productsResponse.data);

      // Generate bin data from real stock information
      generateBinDataFromRealStocks(stocksResponse.data, productsResponse.data);
      
    } catch (error) {
      console.error('Error fetching real data:', error);
      Alert.alert('Error', 'Failed to load warehouse data');
    } finally {
      setLoading(false);
    }
  };

  const generateBinDataFromRealStocks = (stockData: Stock[], productData: Product[]) => {
    const bins: BinData[] = [];
    
    // Create a map of products for quick lookup
    const productMap = new Map(productData.map(product => [product.id, product]));
    
    // Group stocks by bin location to create bin data
    const binGroups = new Map<string, Stock[]>();
    
    stockData.forEach(stock => {
      const binLocation = stock.bin_location || 'Default';
      if (!binGroups.has(binLocation)) {
        binGroups.set(binLocation, []);
      }
      binGroups.get(binLocation)!.push(stock);
    });

    // Generate bin data from real stock information
    let binIndex = 0;
    binGroups.forEach((stocksInBin, binLocation) => {
      const totalCapacity = stocksInBin.reduce((sum, stock) => {
        const product = productMap.get(stock.product_id);
        return sum + (product?.max_stock_level ? Number(product.max_stock_level) : 100);
      }, 0);
      
      const currentStock = stocksInBin.reduce((sum, stock) => sum + Number(stock.quantity), 0);
      const utilization = totalCapacity > 0 ? (currentStock / totalCapacity) * 100 : 0;
      
      let status: 'empty' | 'low' | 'medium' | 'full';
      if (currentStock === 0) status = 'empty';
      else if (utilization < 20) status = 'low';
      else if (utilization > 80) status = 'full';
      else status = 'medium';

      const row = Math.floor(binIndex / 12);
      const col = binIndex % 12;
      
      // Get product information for this bin
      const binProducts = stocksInBin.map(stock => {
        const product = productMap.get(stock.product_id);
        return {
          id: stock.product_id,
          name: product?.name || 'Unknown Product',
          quantity: Number(stock.quantity),
          image: `https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=100&h=100&fit=crop&random=${Math.floor(Math.random() * 1000)}`
        };
      }).filter(product => product.quantity > 0);

      const profileImages = [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      ];

      // Professional UI data
      const warehouse = warehouses.find(w => w.id === warehouseId);
      const distance = `${(Math.random() * 10 + 1).toFixed(1)} km`;
      const eta = `${Math.floor(Math.random() * 30) + 10} minutes`;
      const price = `$${Math.floor(Math.random() * 200) + 50}`;

      bins.push({
        id: binLocation,
        code: binLocation,
        location: `Bin ${binLocation}`,
        capacity: totalCapacity,
        currentStock,
        status,
        row,
        column: col,
        warehouseId: warehouseId || '',
        name: `${warehouse?.name || 'Warehouse'} Bin ${binLocation}`,
        address: `${warehouse?.address || 'Warehouse Address'}, Bin ${binLocation}`,
        description: `${binProducts.length} products stored with ${currentStock} total units`,
        lastUpdated: `${Math.floor(Math.random() * 60) + 1} min ago`,
        image: `https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=200&fit=crop&random=${Math.floor(Math.random() * 1000)}`,
        profileImage: profileImages[binIndex % profileImages.length],
        rating: Math.floor(Math.random() * 2) + 4,
        products: binProducts,
        distance,
        eta,
        price
      });

      binIndex++;
    });

    // If no real bin data, create some default bins based on warehouse
    if (bins.length === 0) {
      const defaultBins = generateDefaultBins();
      setBinData(defaultBins);
    } else {
      setBinData(bins);
    }
  };

  const generateDefaultBins = (): BinData[] => {
    const bins: BinData[] = [];
    const rows = 8;
    const columns = 12;
    
    const profileImages = [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    ];
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const binId = `${String.fromCharCode(65 + row)}${col + 1}`;
        const capacity = Math.floor(Math.random() * 200) + 50;
        const currentStock = Math.floor(Math.random() * capacity);
        const status = currentStock === 0 ? 'empty' : 
                      currentStock < capacity * 0.2 ? 'low' :
                      currentStock > capacity * 0.8 ? 'full' : 'medium';
        
        const warehouse = warehouses.find(w => w.id === warehouseId);
        const distance = `${(Math.random() * 10 + 1).toFixed(1)} km`;
        const eta = `${Math.floor(Math.random() * 30) + 10} minutes`;
        const price = `$${Math.floor(Math.random() * 200) + 50}`;
        
        bins.push({
          id: binId,
          code: binId,
          location: `Row ${String.fromCharCode(65 + row)}, Column ${col + 1}`,
          capacity,
          currentStock,
          status,
          row,
          column: col,
          warehouseId: warehouseId || '',
          name: `${warehouse?.name || 'Warehouse'} Bin ${binId}`,
          address: `${warehouse?.address || 'Warehouse Address'}, Bin ${binId}`,
          description: `Storage area for warehouse operations and inventory management`,
          lastUpdated: `${Math.floor(Math.random() * 60) + 1} min ago`,
          image: `https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=200&fit=crop&random=${Math.floor(Math.random() * 1000)}`,
          profileImage: profileImages[Math.floor(Math.random() * profileImages.length)],
          rating: Math.floor(Math.random() * 2) + 4,
          products: currentStock > 0 ? [
            {
              id: `product-${binId}`,
              name: `Product ${Math.floor(Math.random() * 100) + 1}`,
              quantity: currentStock,
              image: `https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=100&h=100&fit=crop&random=${Math.floor(Math.random() * 1000)}`
            }
          ] : [],
          distance,
          eta,
          price
        });
      }
    }
    
    return bins;
  };

  const handleBinPress = (bin: BinData) => {
    setSelectedBin(bin);
    setShowExpandedCard(true);
    
    // Reset animation values first
    slideAnim.setValue(screenHeight);
    
    // Professional slide up animation
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseExpandedCard = () => {
    // Professional slide down animation
    Animated.timing(slideAnim, {
      toValue: screenHeight,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowExpandedCard(false);
      setSelectedBin(null);
    });
  };

  const renderBinCard = ({ item }: { item: BinData }) => (
    <TouchableOpacity
      style={styles.binCard}
      onPress={() => handleBinPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.binCardHeader}>
        <View style={styles.binCardImageContainer}>
          <View style={styles.binCardProfileImage}>
            <Icon name="user" size={20} color={COLORS.primary} />
          </View>
        </View>
        <View style={styles.binCardInfo}>
          <Text style={styles.binCardName}>{item.name}</Text>
          <Text style={styles.binCardTime}>{item.lastUpdated}</Text>
        </View>
        <View style={styles.binCardActions}>
          <Icon name="chevron-right" size={16} color={COLORS.text.secondary} />
        </View>
      </View>
      
      <Text style={styles.binCardDescription} numberOfLines={2}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading bin data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Professional Search Bar Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <Icon name="map-pin" size={20} color={COLORS.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search health facilities & doctors"
            placeholderTextColor={COLORS.text.secondary}
            value={searchText}
            onChangeText={setSearchText}
          />
          <View style={styles.searchFilter}>
            <Text style={styles.searchFilterText}>20 km</Text>
            <Icon name="chevron-down" size={16} color={COLORS.text.secondary} />
          </View>
        </View>
      </View>

      {/* Full Height Map View */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          {/* Professional Map Background */}
          <View style={styles.mapBackground}>
            {/* Map Roads */}
            <View style={styles.mapRoads}>
              <View style={styles.mapRoad} />
              <View style={styles.mapRoad} />
              <View style={styles.mapRoad} />
            </View>
            
            {/* Street Names */}
            <Text style={styles.mapStreetName}>Jl. Raya Suto</Text>
            <Text style={styles.mapStreetName2}>Jl. Raya ITS</Text>
            <Text style={styles.mapStreetName3}>Jl. Raya Kertajaya Indah</Text>
            <Text style={styles.mapStreetName4}>Jl. Dr. Ir. H. Soekarno</Text>
            <Text style={styles.mapStreetName5}>Jl. Medokan Keputih</Text>
            
            {/* Map Points of Interest */}
            <View style={styles.mapPOI}>
              <View style={styles.poiItem}>
                <View style={styles.poiIcon}>
                  <Icon name="shopping-bag" size={12} color="#FFFFFF" />
                </View>
                <Text style={styles.poiText}>Shopping Mall Surabaya</Text>
              </View>
              <View style={styles.poiItem}>
                <View style={styles.poiIcon}>
                  <Icon name="building" size={12} color="#FFFFFF" />
                </View>
                <Text style={styles.poiText}>Institut Teknologi Sepuluh Nopember</Text>
              </View>
              <View style={styles.poiItem}>
                <View style={styles.poiIcon}>
                  <Icon name="tree" size={12} color="#FFFFFF" />
                </View>
                <Text style={styles.poiText}>Hutan Bambu</Text>
              </View>
            </View>
          </View>
          
          {/* Interactive Bin Markers */}
          <View style={styles.binMarkersOverlay}>
            {binData.slice(0, 6).map((bin, index) => {
              const markerColors = ['#4169E1', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
              const markerIcons = ['shopping-bag', 'coffee', 'mountain', 'user', 'tool', 'target'];
              
              return (
                <TouchableOpacity
                  key={bin.id}
                  style={[
                    styles.binMarker,
                    {
                      backgroundColor: markerColors[index % markerColors.length],
                      left: `${15 + (index * 12)}%`,
                      top: `${25 + (index * 10)}%`,
                    }
                  ]}
                  onPress={() => handleBinPress(bin)}
                >
                  <Icon name={markerIcons[index % markerIcons.length]} size={16} color="#FFFFFF" />
                  
                  {/* Distance Label */}
                  <View style={styles.markerLabel}>
                    <Text style={styles.markerLabelText}>{bin.distance}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* Bottom Content Area */}
      <View style={styles.bottomContent}>
        <View style={styles.bottomContentHeader}>
          <View style={styles.bottomContentCard}>
            <View style={styles.bottomContentIcon}>
              <Icon name="shopping-bag" size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.bottomContentText}>City Pr Bibit Wono</Text>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Icon name="filter" size={16} color={COLORS.text.secondary} />
            <Text style={styles.filterButtonText}>Filter</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Horizontal Scrollable Cards */}
      <View style={styles.cardsContainer}>
        <FlatList
          data={binData.slice(0, 10)}
          renderItem={renderBinCard}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsList}
        />
      </View>

      {/* Professional Expanded Card Modal */}
      <Modal
        visible={showExpandedCard}
        transparent
        animationType="none"
        onRequestClose={handleCloseExpandedCard}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={handleCloseExpandedCard}
          />
          
          <Animated.View
            style={[
              styles.expandedCard,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {selectedBin && (
              <View style={styles.expandedCardContent}>
                {/* Professional Header */}
                <View style={styles.expandedCardHeader}>
                  <View style={styles.expandedCardIconContainer}>
                    <Icon name="shopping-bag" size={24} color={COLORS.primary} />
                  </View>
                  <View style={styles.expandedCardTitleContainer}>
                    <Text style={styles.expandedCardTitle}>{selectedBin.name}</Text>
                    <Text style={styles.expandedCardRating}>⭐ {selectedBin.rating} - ETA: {selectedBin.eta}</Text>
                  </View>
                </View>
                
                {/* Address Section */}
                <View style={styles.expandedCardAddress}>
                  <Icon name="map-pin" size={16} color={COLORS.text.secondary} />
                  <Text style={styles.expandedCardAddressText}>{selectedBin.address}</Text>
                </View>
                
                {/* Action Buttons */}
                <View style={styles.expandedCardActions}>
                  <TouchableOpacity style={styles.expandedCardBookButton}>
                    <LinearGradient
                      colors={COLORS.gradient.primary}
                      style={styles.expandedCardBookButtonGradient}
                    >
                      <Text style={styles.expandedCardBookButtonText}>BOOK</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.expandedCardCancelButton}>
                    <Text style={styles.expandedCardCancelButtonText}>CANCEL</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Footer */}
                <View style={styles.expandedCardFooter}>
                  <TouchableOpacity>
                    <Text style={styles.expandedCardViewDetails}>View Details</Text>
                  </TouchableOpacity>
                  <Text style={styles.expandedCardPrice}>Start from: {selectedBin.price}</Text>
                </View>
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.secondary,
  },
  searchHeader: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    ...SHADOWS.md,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  searchFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    marginLeft: SPACING.sm,
  },
  searchFilterText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginRight: SPACING.xs,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#E3F2FD',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#E3F2FD',
    position: 'relative',
  },
  mapBackground: {
    flex: 1,
    position: 'relative',
  },
  mapRoads: {
    position: 'absolute',
    top: '30%',
    left: '10%',
    right: '10%',
  },
  mapRoad: {
    height: 2,
    backgroundColor: '#FFFFFF',
    marginVertical: 20,
    borderRadius: 1,
  },
  mapStreetName: {
    position: 'absolute',
    top: '20%',
    left: '15%',
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#9E9E9E',
    fontWeight: '500',
  },
  mapStreetName2: {
    position: 'absolute',
    top: '40%',
    left: '20%',
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#9E9E9E',
    fontWeight: '500',
  },
  mapStreetName3: {
    position: 'absolute',
    top: '60%',
    left: '25%',
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#9E9E9E',
    fontWeight: '500',
  },
  mapStreetName4: {
    position: 'absolute',
    top: '80%',
    left: '30%',
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#9E9E9E',
    fontWeight: '500',
  },
  mapStreetName5: {
    position: 'absolute',
    top: '90%',
    left: '35%',
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#9E9E9E',
    fontWeight: '500',
  },
  mapPOI: {
    position: 'absolute',
    top: '10%',
    right: '10%',
  },
  poiItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  poiIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4169E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.xs,
  },
  poiText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#9E9E9E',
    fontWeight: '500',
  },
  binMarkersOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  binMarker: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  markerLabel: {
    position: 'absolute',
    top: -25,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    ...SHADOWS.sm,
  },
  markerLabelText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  bottomContent: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    ...SHADOWS.lg,
  },
  bottomContentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomContentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  bottomContentIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4169E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  bottomContentText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  filterButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
  },
  cardsContainer: {
    backgroundColor: COLORS.background,
    paddingVertical: SPACING.md,
  },
  cardsList: {
    paddingHorizontal: SPACING.lg,
  },
  binCard: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginRight: SPACING.md,
    width: 280,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    ...SHADOWS.sm,
  },
  binCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  binCardImageContainer: {
    marginRight: SPACING.sm,
  },
  binCardProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  binCardProfileImageStyle: {
    borderRadius: 20,
  },
  binCardInfo: {
    flex: 1,
  },
  binCardName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  binCardTime: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  binCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  binCardDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  expandedCard: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: screenHeight * 0.85,
    ...SHADOWS.lg,
  },
  expandedCardContent: {
    padding: SPACING.lg,
  },
  expandedCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  expandedCardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    ...SHADOWS.sm,
  },
  expandedCardTitleContainer: {
    flex: 1,
  },
  expandedCardTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  expandedCardRating: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
  expandedCardAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  expandedCardAddressText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  expandedCardActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  expandedCardBookButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  expandedCardBookButtonGradient: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  expandedCardBookButtonText: {
    color: COLORS.text.light,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
  },
  expandedCardCancelButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  expandedCardCancelButtonText: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
  },
  expandedCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expandedCardViewDetails: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '500',
  },
  expandedCardPrice: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '500',
  },
});

export default BinManagementTab;
