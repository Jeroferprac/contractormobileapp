import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  FlatList,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/core';

const { width } = Dimensions.get('window');
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../constants/spacing';
import { TYPOGRAPHY } from '../constants/typography';

import {
  SearchBar,
  LoadingSkeleton,
  FadeSlideInView,
} from '../components/ui';
import { Button } from '../components/Button';

import { ProductSupplier } from '../types/inventory';
import { SuppliersScreenNavigationProp } from '../types/navigation';
import inventoryApiService from '../api/inventoryApi';

interface ProductSuppliersScreenProps {
  navigation: SuppliersScreenNavigationProp;
}

const ProductSuppliersScreen: React.FC<ProductSuppliersScreenProps> = ({ navigation }) => {
  const [productSuppliers, setProductSuppliers] = useState<ProductSupplier[]>([]);
  const [filteredProductSuppliers, setFilteredProductSuppliers] = useState<ProductSupplier[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [renderError, setRenderError] = useState(false);

  useEffect(() => {
    loadProductSuppliers(false);
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadProductSuppliers(false);
    }, [])
  );

  useEffect(() => {
    filterProductSuppliers();
  }, [searchText, productSuppliers]);

  const loadProductSuppliers = async (isRefreshing = false) => {
    try {
      console.log('🔄 [ProductSuppliersScreen] Loading product suppliers...');
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      // Fetch product suppliers
      const productSuppliersResponse = await inventoryApiService.getProductSuppliers();
      const productSuppliers = productSuppliersResponse.data || [];
      
             console.log('📊 [ProductSuppliersScreen] Raw product suppliers data:', JSON.stringify(productSuppliers, null, 2));
       
       // Debug individual fields for the first item
       if (productSuppliers.length > 0) {
         const firstItem = productSuppliers[0];
                 console.log('🔍 [ProductSuppliersScreen] First item details:');
        console.log('  - Supplier code:', firstItem.supplier_code, 'Type:', typeof firstItem.supplier_code);
        console.log('  - Supplier price:', firstItem.supplier_price, 'Type:', typeof firstItem.supplier_price);
        console.log('  - Lead time:', firstItem.lead_time_days, 'Type:', typeof firstItem.lead_time_days);
        console.log('  - Min order qty:', firstItem.min_order_qty, 'Type:', typeof firstItem.min_order_qty);
        console.log('  - Is preferred:', firstItem.is_preferred, 'Type:', typeof firstItem.is_preferred);
       }
      
      // If we have product suppliers, fetch related products and suppliers
      if (productSuppliers.length > 0) {
        try {
          // Fetch all products and suppliers
          const [productsResponse, suppliersResponse] = await Promise.all([
            inventoryApiService.getProducts(),
            inventoryApiService.getSuppliers(),
          ]);
          
          const products = productsResponse.data || [];
          const suppliers = suppliersResponse.data || [];
          
          console.log('📦 [ProductSuppliersScreen] Loaded products:', products.length);
          console.log('🏢 [ProductSuppliersScreen] Loaded suppliers:', suppliers.length);
          
                     // Merge the data and map API field names to frontend field names
           const enrichedProductSuppliers = productSuppliers.map(ps => {
             try {
               const enriched = {
                 ...ps,
                 // Map API field names to frontend field names
                 supplier_code: ps.supplier_code || 'N/A',
                 cost_price: ps.supplier_price || 0,
                 minimum_order_quantity: ps.min_order_qty || 0,
                 product: products.find(p => p.id === ps.product_id),
                 supplier: suppliers.find(s => s.id === ps.supplier_id),
               };
               
               // Validate the enriched data
               if (!enriched.id) {
                 console.error('❌ [ProductSuppliersScreen] Missing ID in enriched data:', enriched);
               }
               
               return enriched;
             } catch (error) {
               console.error('❌ [ProductSuppliersScreen] Error enriching product supplier:', error, ps);
               return {
                 ...ps,
                 supplier_code: 'N/A',
                 cost_price: 0,
                 minimum_order_quantity: 0,
                 product: undefined,
                 supplier: undefined,
               };
             }
           });
          
          console.log('🔗 [ProductSuppliersScreen] Enriched product suppliers:', JSON.stringify(enrichedProductSuppliers, null, 2));
          
          setProductSuppliers(enrichedProductSuppliers);
        } catch (relatedDataError) {
          console.error('❌ [ProductSuppliersScreen] Error loading related data:', relatedDataError);
          // Still set the product suppliers even if related data fails
          setProductSuppliers(productSuppliers);
        }
      } else {
        setProductSuppliers(productSuppliers);
      }
      
      setHasError(false);
      console.log('✅ [ProductSuppliersScreen] Loaded product suppliers:', productSuppliers.length);
    } catch (error) {
      console.error('❌ [ProductSuppliersScreen] Error loading product suppliers:', error);
      setHasError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadProductSuppliers(true);
  };

  const filterProductSuppliers = () => {
    if (!searchText.trim()) {
      setFilteredProductSuppliers(productSuppliers);
      return;
    }

    const filtered = productSuppliers.filter(productSupplier =>
      (productSupplier.supplier_code || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (productSupplier.product?.name || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (productSupplier.supplier?.name || '').toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredProductSuppliers(filtered);
  };

  const handleProductSupplierPress = (productSupplier: ProductSupplier) => {
    Alert.alert(
      'Product Supplier Details',
      `Product: ${productSupplier.product?.name || 'N/A'}\nSupplier: ${productSupplier.supplier?.name || 'N/A'}\nCode: ${productSupplier.supplier_code}\nCost: €${productSupplier.cost_price}`,
      [
        { text: 'Edit', onPress: () => handleEditProductSupplier(productSupplier) },
        { text: 'Delete', onPress: () => handleDeleteProductSupplier(productSupplier), style: 'destructive' },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleEditProductSupplier = (productSupplier: ProductSupplier) => {
    navigation.navigate('ProductSupplierForm', { productSupplier, isEditing: true });
  };

  const handleDeleteProductSupplier = (productSupplier: ProductSupplier) => {
    Alert.alert(
      'Delete Product Supplier',
      `Are you sure you want to delete this product supplier relationship?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await inventoryApiService.deleteProductSupplier(productSupplier.id);
              setProductSuppliers(productSuppliers.filter(ps => ps.id !== productSupplier.id));
              Alert.alert('Success', 'Product supplier deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product supplier');
            }
          }
        },
      ]
    );
  };

  const handleAddProductSupplier = () => {
    navigation.navigate('ProductSupplierForm', { isEditing: false });
  };

  const renderProductSupplierItem = ({ item, index }: { item: ProductSupplier; index: number }) => {
    try {
      // Debug logging for the first item
      if (index === 0) {
        console.log('🔍 [ProductSuppliersScreen] Rendering item:', JSON.stringify(item, null, 2));
        console.log('🔍 [ProductSuppliersScreen] Product:', item.product?.name || 'Missing product');
        console.log('🔍 [ProductSuppliersScreen] Supplier:', item.supplier?.name || 'Missing supplier');
        console.log('🔍 [ProductSuppliersScreen] Product ID:', item.product_id);
        console.log('🔍 [ProductSuppliersScreen] Supplier ID:', item.supplier_id);
      }

      // Validate item data
      if (!item) {
        console.error('❌ [ProductSuppliersScreen] Item is null or undefined');
        throw new Error('Item is null or undefined');
      }
      
      if (!item.id) {
        console.error('❌ [ProductSuppliersScreen] Item missing ID:', item);
        throw new Error('Item missing ID');
      }
      
             // Ensure all required fields have fallback values
       const safeItem = {
         ...item,
         product_id: item.product_id || 'unknown',
         supplier_id: item.supplier_id || 'unknown',
         supplier_code: item.supplier_code || 'N/A',
         cost_price: typeof item.cost_price === 'number' ? item.cost_price : 0,
         lead_time_days: typeof item.lead_time_days === 'number' ? item.lead_time_days : 0,
         minimum_order_quantity: typeof item.minimum_order_quantity === 'number' ? item.minimum_order_quantity : 0,
         is_preferred: typeof item.is_preferred === 'boolean' ? item.is_preferred : false,
         product: item.product || undefined,
         supplier: item.supplier || undefined,
       };
    
          return (
     <FadeSlideInView delay={index * 100} key={`fade-${item.id}-${index}`}>
                <TouchableOpacity
           style={styles.productSupplierItem}
           activeOpacity={0.9}
           onPress={() => {
             try {
               handleProductSupplierPress(safeItem);
             } catch (error) {
               console.error('❌ [ProductSuppliersScreen] Error handling press:', error);
             }
           }}
         >
         <LinearGradient
           colors={(() => {
             try {
               return getProductSupplierCardColors(index);
             } catch (error) {
               return ['#FFFFFF', '#F8FAFC', '#F1F5F9'];
             }
           })()}
           style={styles.itemCard}
           start={{ x: 0, y: 0 }}
           end={{ x: 1, y: 1 }}
           key={`gradient-${item.id}-${index}`}
         >
           <View style={styles.cardHeader}>
             <View style={styles.statusContainer}>
                                <View
                                   style={[
                     styles.statusDot,
                     { backgroundColor: (() => {
                       try {
                         return (item.is_preferred || false) ? (COLORS.status?.success || '#10B981') : (COLORS.status?.warning || '#F59E0B');
                       } catch (error) {
                         return '#F59E0B';
                       }
                     })() }
                   ]}
                />
                <Text style={styles.statusText}>
                  {(() => {
                    try {
                      return (item.is_preferred || false) ? 'Preferred' : 'Standard';
                    } catch (error) {
                      return 'Standard';
                    }
                  })()}
                </Text>
             </View>
                          <View style={styles.iconContainer}>
                <Icon name="link" size={24} color={COLORS.primary || '#FF6B35'} />
              </View>
           </View>

           <View style={styles.productSupplierInfo}>
             <Text style={styles.productName}>
               {(() => {
                 try {
                   return item.product?.name || `Product ID: ${item.product_id || 'Unknown'}`;
                 } catch (error) {
                   return 'Product Name Unavailable';
                 }
               })()}
             </Text>
             <Text style={styles.supplierName}>
               {(() => {
                 try {
                   return item.supplier?.name || `Supplier ID: ${item.supplier_id || 'Unknown'}`;
                 } catch (error) {
                   return 'Supplier Name Unavailable';
                 }
               })()}
             </Text>
             
             <View style={styles.infoGrid}>
               <View style={styles.infoItem}>
                                  <View style={styles.iconWrapper}>
                    <Icon name="code" size={16} color={COLORS.primary || '#FF6B35'} />
                  </View>
                                  <Text style={styles.infoText} numberOfLines={1}>Code: {(() => {
                                    try {
                                      return item.supplier_code || 'N/A';
                                    } catch (error) {
                                      return 'N/A';
                                    }
                                  })()}</Text>
               </View>

               <View style={styles.infoItem}>
                                  <View style={styles.iconWrapper}>
                    <Icon name="euro" size={16} color={COLORS.status?.success || '#10B981'} />
                  </View>
                 <Text style={styles.infoText} numberOfLines={1}>Cost: €{(() => {
                   try {
                     const cost = item.cost_price || 0;
                     return typeof cost === 'number' ? cost.toFixed(2) : '0.00';
                   } catch (error) {
                     return '0.00';
                   }
                 })()}</Text>
               </View>

               <View style={styles.infoItem}>
                                  <View style={styles.iconWrapper}>
                    <Icon name="schedule" size={16} color={COLORS.status?.info || '#3B82F6'} />
                  </View>
                 <Text style={styles.infoText} numberOfLines={1}>Lead Time: {(() => {
                   try {
                     const leadTime = item.lead_time_days || 0;
                     return typeof leadTime === 'number' ? `${leadTime} days` : '0 days';
                   } catch (error) {
                     return '0 days';
                   }
                 })()}</Text>
               </View>

               <View style={styles.infoItem}>
                                  <View style={styles.iconWrapper}>
                    <Icon name="shopping-cart" size={16} color={COLORS.status?.warning || '#F59E0B'} />
                  </View>
                 <Text style={styles.infoText} numberOfLines={1}>Min Order: {(() => {
                   try {
                     const minOrder = item.minimum_order_quantity || 0;
                     return typeof minOrder === 'number' ? minOrder.toString() : '0';
                   } catch (error) {
                     return '0';
                   }
                 })()}</Text>
               </View>
             </View>
           </View>

           <View style={styles.cardFooter}>
             <View style={styles.actionHint}>
                              <Icon name="touch-app" size={14} color={COLORS.text?.secondary || '#6B7280'} />
               <Text style={styles.actionHintText}>Tap for options</Text>
             </View>
           </View>
                  </LinearGradient>
        </TouchableOpacity>
      </FadeSlideInView>
    );
         } catch (error) {
       console.error('❌ [ProductSuppliersScreen] Error rendering item:', error);
       console.error('❌ [ProductSuppliersScreen] Item data:', JSON.stringify(item, null, 2));
       console.error('❌ [ProductSuppliersScreen] Index:', index);
       
       // Instead of showing an error card, return a simple fallback card
       return (
         <View style={styles.productSupplierItem}>
           <View style={styles.itemCard}>
             <Text style={styles.productName}>
               {item?.product?.name || `Product ID: ${item?.product_id || 'Unknown'}`}
             </Text>
             <Text style={styles.supplierName}>
               {item?.supplier?.name || `Supplier ID: ${item?.supplier_id || 'Unknown'}`}
             </Text>
             <Text style={styles.infoText}>Data temporarily unavailable</Text>
           </View>
         </View>
       );
     }
    };

  const getProductSupplierCardColors = (index: number) => {
    try {
      const colorSchemes = [
        ['#FFFFFF', '#F8FAFC', '#F1F5F9'],
        ['#FFFFFF', '#FEF7FF', '#F3E8FF'],
        ['#FFFFFF', '#F0FDF4', '#DCFCE7'],
        ['#FFFFFF', '#FEF3C7', '#FDE68A'],
        ['#FFFFFF', '#EFF6FF', '#DBEAFE'],
        ['#FFFFFF', '#FDF2F8', '#FCE7F3'],
      ];
      return colorSchemes[index % colorSchemes.length] || ['#FFFFFF', '#F8FAFC', '#F1F5F9'];
    } catch (error) {
      console.error('❌ [ProductSuppliersScreen] Error getting colors:', error);
      return ['#FFFFFF', '#F8FAFC', '#F1F5F9'];
    }
  };

  if (renderError) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <LinearGradient 
          colors={COLORS.gradient.primary || ['#FF6B35', '#FF8C42']} 
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Product Suppliers</Text>
              <Text style={styles.headerSubtitle}>Manage product-supplier relationships</Text>
            </View>
            <View style={{ width: 48 }} />
          </View>
        </LinearGradient>
        <View style={styles.errorContainer}>
          <LinearGradient
            colors={['#FEF2F2', '#FEE2E2']}
            style={styles.emptyCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.emptyIconContainer}>
              <Icon name="error" size={80} color="#EF4444" />
            </View>
            <Text style={styles.emptyTitle}>Screen Error</Text>
            <Text style={styles.emptySubtitle}>
              There was an error rendering this screen. Please try again.
            </Text>
            <TouchableOpacity style={styles.emptyActionButton} onPress={() => setRenderError(false)}>
              <Icon name="refresh" size={20} color="#FFFFFF" />
              <Text style={styles.emptyActionText}>Retry</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </SafeAreaView>
    );
  }

  if (hasError) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <LinearGradient 
          colors={COLORS.gradient.primary || ['#FF6B35', '#FF8C42']} 
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Product Suppliers</Text>
              <Text style={styles.headerSubtitle}>Manage product-supplier relationships</Text>
            </View>
            <Button
              title="Add"
              onPress={handleAddProductSupplier}
              variant="primary"
              size="small"
              style={styles.addButton}
            />
          </View>
        </LinearGradient>
        <View style={styles.errorContainer}>
          <LinearGradient
            colors={['#FEF2F2', '#FEE2E2']}
            style={styles.emptyCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.emptyIconContainer}>
              <Icon name="error" size={80} color="#EF4444" />
            </View>
            <Text style={styles.emptyTitle}>Failed to Load Product Suppliers</Text>
            <Text style={styles.emptySubtitle}>
              There was an error connecting to the server. Please check your connection and try again.
            </Text>
            <TouchableOpacity style={styles.emptyActionButton} onPress={loadProductSuppliers}>
              <Icon name="refresh" size={20} color="#FFFFFF" />
              <Text style={styles.emptyActionText}>Retry</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </SafeAreaView>
    );
  }

    try {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
                      <LinearGradient 
          colors={COLORS.gradient.primary || ['#FF6B35', '#FF8C42']} 
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Product Suppliers</Text>
              <Text style={styles.headerSubtitle}>Manage product-supplier relationships</Text>
            </View>
            <Button
              title="Add"
              onPress={handleAddProductSupplier}
              variant="primary"
              size="small"
              style={styles.addButton}
            />
          </View>
          <View style={styles.searchWrapper}>
            <SearchBar
              placeholder="Search product suppliers..."
              value={searchText}
              onChangeText={setSearchText}
              onFilterPress={() => {}}
            />
          </View>
        </LinearGradient>

        {loading ? (
          <ScrollView style={styles.content}>
            {[...Array(6)].map((_, index) => (
              <View key={index} style={styles.skeletonItem}>
                <LoadingSkeleton height={140} borderRadius={BORDER_RADIUS.lg} />
              </View>
            ))}
          </ScrollView>
        ) : (
          <FlatList
            data={filteredProductSuppliers}
            renderItem={renderProductSupplierItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="link" size={64} color={COLORS.text?.tertiary || '#9CA3AF'} />
                <Text style={styles.emptyTitle}>No Product Suppliers Found</Text>
                <Text style={styles.emptySubtitle}>
                  {searchText ? 'Try adjusting your search' : 'Add your first product supplier to get started'}
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    );
  } catch (error) {
    console.error('❌ [ProductSuppliersScreen] Render error:', error);
    setRenderError(true);
    return null;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerGradient: {
    paddingTop: SPACING.xl + 20, // Add extra padding for status bar
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
    ...SHADOWS.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  headerButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 40,
    ...SHADOWS.md,
  },
  searchWrapper: {
    paddingHorizontal: SPACING.lg,
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: SPACING.lg,
  },
  productSupplierItem: {
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  itemCard: {
    padding: SPACING.lg,
    minHeight: 160,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.xs,
  },
  statusText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  productSupplierInfo: {
    flex: 1,
  },
  productName: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.05)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  supplierName: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  infoGrid: {
    gap: SPACING.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    ...SHADOWS.sm,
  },
  infoText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.weights.medium,
    flex: 1,
  },
  skeletonItem: {
    marginBottom: SPACING.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: '#EF4444',
    textAlign: 'center',
    padding: SPACING.md,
  },
  retryButtonText: {
    color: COLORS.text.light,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  cardFooter: {
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  actionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionHintText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
    fontStyle: 'italic',
  },
  emptyCard: {
    width: width - SPACING.lg * 2,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});

export default ProductSuppliersScreen;
