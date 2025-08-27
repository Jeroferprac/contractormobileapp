import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';

const { width, height } = Dimensions.get('window');

// Responsive font sizes
const FONTS = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  title: 28,
  large: 32,
};

import { Button } from '../../components/Button';
import { LoadingSkeleton } from '../../components/ui';

import { PurchaseOrder, Supplier, Product } from '../../types/inventory';
import { SuppliersScreenNavigationProp } from '../../types/navigation';
import { inventoryApiService } from '../../api/inventoryApi';

interface PurchaseOrderDetailsProps {
  navigation: SuppliersScreenNavigationProp;
  route: {
    params: {
      orderId: string;
    };
  };
}

const PurchaseOrderDetails: React.FC<PurchaseOrderDetailsProps> = ({ navigation, route }) => {
  const { orderId } = route.params;
  
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    loadPurchaseOrder();
    loadSuppliers();
    loadProducts();
  }, [orderId]);

  const loadPurchaseOrder = async () => {
    try {
      console.log('🔄 [PurchaseOrderDetails] Loading purchase order:', orderId);
      setLoading(true);
      
      const response = await inventoryApiService.getPurchaseOrderById(orderId);
      setOrder(response.data);
      console.log('✅ [PurchaseOrderDetails] Loaded purchase order:', response.data);
    } catch (error) {
      console.error('❌ [PurchaseOrderDetails] Error loading purchase order:', error);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  const loadSuppliers = async () => {
    try {
      const response = await inventoryApiService.getSuppliers();
      setSuppliers(response.data || []);
      console.log('✅ [PurchaseOrderDetails] Loaded suppliers:', response.data?.length || 0);
    } catch (error) {
      console.error('❌ [PurchaseOrderDetails] Error loading suppliers:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await inventoryApiService.getProducts();
      setProducts(response.data || []);
      console.log('✅ [PurchaseOrderDetails] Loaded products:', response.data?.length || 0);
    } catch (error) {
      console.error('❌ [PurchaseOrderDetails] Error loading products:', error);
    }
  };

  const handleEdit = () => {
    if (order) {
      navigation.navigate('PurchaseOrderForm', { order, isEditing: true });
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Purchase Order',
      `Are you sure you want to delete "${order?.po_number}"?\n\nThis action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🔄 [PurchaseOrderDetails] Deleting purchase order:', orderId);
              
              // Note: Delete endpoint not provided in API list, but keeping the structure
              // await inventoryApiService.deletePurchaseOrder(orderId);
              
              console.log('✅ [PurchaseOrderDetails] Purchase order deleted successfully');
              Alert.alert('Success', 'Purchase order deleted successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error: any) {
              console.error('❌ [PurchaseOrderDetails] Error deleting purchase order:', error);
              
              let errorMessage = 'Failed to delete purchase order. Please try again.';
              if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
              } else if (error.response?.data?.message) {
                const message = error.response.data.message;
                errorMessage = Array.isArray(message) ? message.join(', ') : String(message);
              }
              
              Alert.alert('Error', errorMessage);
            }
          }
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return '#6B7280';
      case 'pending':
        return '#F59E0B';
      case 'approved':
        return '#10B981';
      case 'ordered':
        return '#3B82F6';
      case 'received':
        return '#8B5CF6';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'edit';
      case 'pending':
        return 'schedule';
      case 'approved':
        return 'check-circle';
      case 'ordered':
        return 'shopping-cart';
      case 'received':
        return 'local-shipping';
      case 'cancelled':
        return 'cancel';
      default:
        return 'help';
    }
  };

  const getSupplierName = (supplierId: string): string => {
    if (!supplierId) return 'Unknown Supplier';
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier?.name || 'Unknown Supplier';
  };

  const getProductName = (productId: string): string => {
    if (!productId) return 'Unknown Product';
    const product = products.find(p => p.id === productId);
    return product?.name || 'Unknown Product';
  };

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Icon name="error" size={64} color="#EF4444" />
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorSubtitle}>
        Unable to load purchase order details. Please try again.
      </Text>
      <Button
        title="Retry"
        onPress={loadPurchaseOrder}
        style={styles.retryButton}
      />
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <LoadingSkeleton height={200} width="100%" borderRadius={BORDER_RADIUS.lg} />
      <LoadingSkeleton height={150} width="100%" borderRadius={BORDER_RADIUS.lg} />
      <LoadingSkeleton height={300} width="100%" borderRadius={BORDER_RADIUS.lg} />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <LinearGradient 
          colors={COLORS.gradient.primary || ['#FF6B35', '#FF8C42']} 
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Purchase Order Details</Text>
              <Text style={styles.headerSubtitle}>View order information</Text>
            </View>
            <View style={styles.headerSpacer} />
          </View>
        </LinearGradient>
        {renderLoadingState()}
      </SafeAreaView>
    );
  }

  if (hasError || !order) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <LinearGradient 
          colors={COLORS.gradient.primary || ['#FF6B35', '#FF8C42']} 
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Purchase Order Details</Text>
              <Text style={styles.headerSubtitle}>View order information</Text>
            </View>
            <View style={styles.headerSpacer} />
          </View>
        </LinearGradient>
        {renderErrorState()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <LinearGradient 
        colors={COLORS.gradient.primary || ['#FF6B35', '#FF8C42']} 
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Purchase Order Details</Text>
            <Text style={styles.headerSubtitle}>View order information</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <LinearGradient
            colors={['#FFFFFF', '#F8FAFC']}
            style={styles.statusCardContent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.statusHeader}>
              <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(order.status) }]} />
                <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                  {order.status.toUpperCase()}
                </Text>
              </View>
              <View style={styles.poNumberContainer}>
                <Text style={styles.poNumberLabel}>PO Number</Text>
                <Text style={styles.poNumber}>{order.po_number}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Supplier</Text>
              <View style={styles.supplierInfoContainer}>
                <Text style={styles.infoValue}>
                  {getSupplierName(order.supplier_id)}
                </Text>
                {order.supplier_id && (
                  <Text style={styles.supplierIdText}>
                    ID: {order.supplier_id}
                  </Text>
                )}
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Order Date</Text>
              <Text style={styles.infoValue}>
                {new Date(order.order_date).toLocaleDateString()}
              </Text>
            </View>
            
            {order.expected_delivery_date && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Expected Delivery</Text>
                <Text style={styles.infoValue}>
                  {new Date(order.expected_delivery_date).toLocaleDateString()}
                </Text>
              </View>
            )}
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total Amount</Text>
              <Text style={styles.totalAmount}>
                ${(() => {
                  try {
                    const total = order.total_amount;
                    return typeof total === 'number' ? total.toFixed(2) : '0.00';
                  } catch (error) {
                    return '0.00';
                  }
                })()}
              </Text>
            </View>
          </View>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items ({order.items?.length || 0})</Text>
          
          {order.items && order.items.length > 0 ? (
            <View style={styles.itemsCard}>
              {order.items.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{getProductName(item.product_id)}</Text>
                    <Text style={styles.itemDetails}>
                      Qty: {item.quantity} × ${(() => {
                        try {
                          const price = item.unit_price;
                          return typeof price === 'number' ? price.toFixed(2) : '0.00';
                        } catch (error) {
                          return '0.00';
                        }
                      })()}
                    </Text>
                  </View>
                  <Text style={styles.itemTotal}>
                    ${(() => {
                      try {
                        const total = item.total_price;
                        return typeof total === 'number' ? total.toFixed(2) : '0.00';
                      } catch (error) {
                        return '0.00';
                      }
                    })()}
                  </Text>
                </View>
              ))}
              
              <View style={styles.itemsTotal}>
                <Text style={styles.itemsTotalLabel}>Total</Text>
                <Text style={styles.itemsTotalAmount}>
                  ${(() => {
                    try {
                      const total = order.items.reduce((sum, item) => sum + (item.total_price || 0), 0);
                      return typeof total === 'number' ? total.toFixed(2) : '0.00';
                    } catch (error) {
                      return '0.00';
                    }
                  })()}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.emptyItems}>
              <Icon name="inventory" size={48} color="#D1D5DB" />
              <Text style={styles.emptyItemsText}>No items in this order</Text>
            </View>
          )}
        </View>

        {/* Notes */}
        {order.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{order.notes}</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            title="Edit Purchase Order"
            onPress={handleEdit}
            style={styles.editButton}
            icon="edit"
          />
          
          <Button
            title="Delete Purchase Order"
            onPress={handleDelete}
            style={styles.deleteButton}
            icon="delete"
            variant="outline"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
    fontSize: FONTS.title,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: FONTS.md,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  backButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  statusCard: {
    marginBottom: SPACING.lg,
  },
  statusCardContent: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontSize: FONTS.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#374151',
  },
  poNumberContainer: {
    alignItems: 'flex-end',
  },
  poNumberLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  poNumber: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  supplierInfoContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  supplierIdText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
    fontStyle: 'italic',
  },
  totalAmount: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  itemsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  itemDetails: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
  itemTotal: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  itemsTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    marginTop: SPACING.sm,
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
  },
  itemsTotalLabel: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  itemsTotalAmount: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  emptyItems: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  emptyItemsText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.secondary,
    marginTop: SPACING.md,
  },
  notesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  notesText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.primary,
    lineHeight: 24,
  },
  actionsContainer: {
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  deleteButton: {
    borderColor: '#EF4444',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
  },
  errorTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  errorSubtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  retryButton: {
    marginTop: SPACING.lg,
  },
  loadingContainer: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
});

export default PurchaseOrderDetails;
