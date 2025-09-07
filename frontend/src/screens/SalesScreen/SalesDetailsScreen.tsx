import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import { Animated as RNAnimated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'react-native-linear-gradient';

import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/spacing';
import { inventoryApiService } from '../../api/inventoryApi';
import { SaleDetails, Customer } from '../../types/inventory';
import SuccessModal from '../../components/SuccessModal';
import FailureModal from '../../components/FailureModal';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';


const { width: screenWidth } = Dimensions.get('window');

interface SalesDetailsScreenProps {
  navigation: any;
  route: any;
}

const SalesDetailsScreen: React.FC<SalesDetailsScreenProps> = ({ navigation, route }) => {
  const { saleId } = route.params;

  const [saleDetails, setSaleDetails] = useState<SaleDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [failureMessage, setFailureMessage] = useState('');
  const [successScale] = useState(new RNAnimated.Value(0));
  const [failureScale] = useState(new RNAnimated.Value(0));
  


  useEffect(() => {
    fetchSaleDetails();
  }, [saleId]);

  // Modal animation effects
  useEffect(() => {
    if (showSuccessModal) {
      RNAnimated.timing(successScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      successScale.setValue(0);
    }
  }, [showSuccessModal]);

  useEffect(() => {
    if (showFailureModal) {
      RNAnimated.timing(failureScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      failureScale.setValue(0);
    }
  }, [showFailureModal]);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessModal(true);
  };

  const showFailure = (message: string) => {
    setFailureMessage(message);
    setShowFailureModal(true);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
  };

  const handleFailureClose = () => {
    setShowFailureModal(false);
  };

  const fetchSaleDetails = async () => {
    try {
      setLoading(true);
      const [saleResponse, itemsResponse] = await Promise.allSettled([
        inventoryApiService.getSaleById(saleId),
        inventoryApiService.getSaleItems(saleId),
      ]);
      
      if (saleResponse.status === 'rejected' || !saleResponse.value.data) {
        showFailure('No sale data received from server');
        return;
      }
      
      const saleData = saleResponse.value.data;
      const itemsData = itemsResponse.status === 'fulfilled' ? itemsResponse.value.data : [];
      
      // Merge sale data with items
      const completeSaleData = {
        ...saleData,
        items: Array.isArray(itemsData) ? itemsData : (saleData.items || [])
      };
      
      console.log('🔍 Complete Sale Data:', JSON.stringify(completeSaleData, null, 2));
      setSaleDetails(completeSaleData);
    } catch (error: any) {
      console.error('Error fetching sale details:', error);
      showFailure('Failed to load sale details');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSale = async () => {
    try {
      setActionLoading(true);
      await inventoryApiService.confirmSale(saleId);
      showSuccess('Sale confirmed successfully');
      fetchSaleDetails();
    } catch (error) {
      console.error('Error confirming sale:', error);
      showFailure('Failed to confirm sale. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const getSaleItems = () => {
    if (!saleDetails) return [];
    return (saleDetails as any).items || (saleDetails as any).sale_items || (saleDetails as any).line_items || [];
  };

  const handleShipSale = async () => {
    try {
      setActionLoading(true);
      
      const items = getSaleItems();
      
      // Check if sale has items
      if (!Array.isArray(items) || items.length === 0) {
        showFailure('Cannot ship sale: No items found in this sale.');
        return;
      }
      
      // Check stock availability before shipping
      const stockCheckPromises = items.map(async (item: any) => {
        try {
          const stockResponse = await inventoryApiService.getStockByProduct(item.product_id);
          const availableStock = stockResponse.data?.available_quantity || 0;
          
          const requiredQty = typeof item.quantity === 'string' ? parseFloat(item.quantity) : Number(item.quantity);
          const stockAvailable = Number(availableStock);
          return {
            productId: item.product_id,
            productName: item.product?.name || 'Unknown Product',
            required: requiredQty,
            available: stockAvailable,
            hasStock: stockAvailable >= requiredQty
          };
        } catch (error) {
          // If stock check fails, assume no stock
          return {
            productId: item.product_id,
            productName: item.product?.name || 'Unknown Product',
            required: item.quantity,
            available: 0,
            hasStock: false,
            error: 'No stock record found'
          };
        }
      });

      const stockResults = await Promise.all(stockCheckPromises);
      const insufficientStock = stockResults.filter(result => !result.hasStock);

      if (insufficientStock.length > 0) {
        const productNames = insufficientStock.map(p => p.productName).join(', ');
        const errorMessage = insufficientStock.some(p => p.error) 
          ? `Cannot ship: No stock records found for products: ${productNames}. Please add stock first.`
          : `Cannot ship: Insufficient stock for products: ${productNames}. Please add stock first.`;
        
        showFailure(errorMessage);
        return;
      }

      // Proceed with shipping
      await inventoryApiService.shipSale(saleId);
      showSuccess('Sale shipped successfully');
      fetchSaleDetails();
    } catch (error: any) {
      console.error('Error shipping sale:', error);
      let errorMessage = 'Failed to ship sale. Please try again.';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      showFailure(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleGetInvoice = async () => {
    try {
      setActionLoading(true);
      const response = await inventoryApiService.getSaleInvoice(saleId);
      showSuccess('Invoice generated successfully');
    } catch (error) {
      console.error('Error getting invoice:', error);
      showFailure('Failed to get invoice. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSale = () => {
    if (!saleDetails) return;
    
    navigation.navigate('CreateSale', {
      mode: 'edit',
      saleId: saleId,
      saleData: {
        customer_id: saleDetails.customer_id,
        warehouse_id: saleDetails.warehouse_id || '',
        sale_date: saleDetails.sale_date,
        due_date: saleDetails.due_date,
        shipping_address: saleDetails.shipping_address,
        notes: saleDetails.notes || '',
        status: saleDetails.status,
        payment_status: saleDetails.payment_status,
        subtotal: parseFloat(saleDetails.subtotal),
        tax_amount: parseFloat(saleDetails.tax_amount),
        discount_amount: parseFloat(saleDetails.discount_amount),
        total_amount: parseFloat(saleDetails.total_amount),
        paid_amount: parseFloat(saleDetails.paid_amount),
        items: saleDetails.items || [],
      }
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'shipped':
        return <Icon name="check-circle" size={16} color="#28a745" />;
      case 'pending':
        return <Icon name="schedule" size={16} color="#ffc107" />;
      case 'cancelled':
        return <Icon name="cancel" size={16} color="#dc3545" />;
      default:
        return <Icon name="info" size={16} color="#6c757d" />;
    }
  };

  const getPaymentStatusIcon = (paymentStatus: string) => {
    switch (paymentStatus.toLowerCase()) {
      case 'paid':
        return <Icon name="payment" size={16} color="#28a745" />;
      case 'partial':
        return <Icon name="payment" size={16} color="#ffc107" />;
      case 'pending':
        return <Icon name="schedule" size={16} color="#dc3545" />;
      default:
        return <Icon name="payment" size={16} color="#6c757d" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: string | number) => {
    return `$${parseFloat(amount.toString()).toFixed(2)}`;
  };

  const getProductImage = (productName: string) => {
    const hash = productName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const imageId = Math.abs(hash) % 1000;
    return `https://picsum.photos/400/300?random=${imageId}`;
  };

  const getActionButtonText = () => {
    switch (saleDetails?.status) {
      case 'pending':
        return 'Confirm Sale';
      case 'confirmed':
        return 'Ship Sale';
      case 'shipped':
        return 'Sale Complete';
      default:
        return 'Sale Complete';
    }
  };

  const handleActionButton = async () => {
    if (!saleDetails) return;
    
    switch (saleDetails.status) {
      case 'pending':
        await handleConfirmSale();
        break;
      case 'confirmed':
        await handleShipSale();
        break;
      case 'shipped':
        showSuccess('Sale is already completed');
        break;
      default:
        showSuccess('Sale is already completed');
        break;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
      <View style={styles.loadingContainer}>
          <LoadingSkeleton height={200} borderRadius={16} />
          <View style={styles.skeletonGrid}>
            <LoadingSkeleton height={120} borderRadius={12} />
            <LoadingSkeleton height={120} borderRadius={12} />
          </View>
          <LoadingSkeleton height={150} borderRadius={12} />
          <LoadingSkeleton height={100} borderRadius={12} />
      </View>
      </SafeAreaView>
    );
  }

  if (!saleDetails) {
    return (
      <SafeAreaView style={styles.container}>
      <View style={styles.errorContainer}>
          <Icon name="error" size={48} color={COLORS.text.secondary} />
          <Text style={styles.errorText}>Sale not found</Text>
      </View>
      </SafeAreaView>
    );
  }

  const customer = saleDetails.customer;
  const saleItems = getSaleItems();
  
  console.log('🔍 Sale Items Debug:', {
    hasItems: Array.isArray(saleItems),
    itemsLength: saleItems.length,
    saleItems: saleItems,
    saleDetailsKeys: Object.keys(saleDetails)
  });
  const customerName = customer?.name || saleDetails.customer_name || 'Unknown Customer';

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Hero Section */}
      <View style={styles.heroContainer}>
        <FastImage
          source={{ uri: getProductImage(customerName) }}
          style={styles.heroImage}
          resizeMode={FastImage.resizeMode.cover}
        />
        
        {/* Back Button - Top Left */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={20} color="#000" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        {/* Edit Button - Top Right */}
        <TouchableOpacity style={styles.editButton} onPress={handleEditSale}>
          <Icon name="edit" size={20} color="#000" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>

        {/* Customer Pill - Center of Hero */}
        <View style={styles.customerPill}>
          <View style={styles.customerAvatar}>
            <Icon name="person" size={20} color="#666" />
          </View>
          <Text style={styles.customerName}>{customerName}</Text>
        </View>
      </View>

      {/* Scrollable Content Section */}
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Content Section - No Background Card */}
        <View style={styles.contentCard}>
          {/* Sale Title */}
          <Text style={styles.saleTitle}>{saleDetails.sale_number}</Text>
          <Text style={styles.saleSubtitle}>
            {Array.isArray(saleItems) ? saleItems.length : 0} Items • {formatDate(saleDetails.sale_date)}
          </Text>

          {/* Status Row */}
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              {getStatusIcon(saleDetails.status)}
              <Text style={styles.statusText}>{saleDetails.status}</Text>
            </View>
            <View style={styles.statusItem}>
              {getPaymentStatusIcon(saleDetails.payment_status)}
              <Text style={styles.statusText}>{saleDetails.payment_status}</Text>
            </View>
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About This Sale</Text>
            <Text style={styles.sectionDescription}>
              This sale was created on {formatDate(saleDetails.sale_date)} and is currently in {saleDetails.status} status. 
              The customer {customerName} has a total order value of {formatCurrency(saleDetails.total_amount)} 
              with payment status marked as {saleDetails.payment_status}.
              {parseFloat(saleDetails.discount_amount) > 0 && (
                <>
                  {'\n\n'}Discount Applied: {formatCurrency(saleDetails.discount_amount)}
                </>
              )}
            </Text>
          </View>

          {/* Customer Details Section */}
          {customer && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Customer Details</Text>
              <View style={styles.customerDetails}>
                <View style={styles.detailRow}>
                  <Icon name="person" size={16} color="#666" />
                  <Text style={styles.detailText}>{customer.name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="email" size={16} color="#666" />
                  <Text style={styles.detailText}>{customer.email}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="phone" size={16} color="#666" />
                  <Text style={styles.detailText}>{customer.phone}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="location-on" size={16} color="#666" />
                  <Text style={styles.detailText}>{customer.address}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Shipping Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping Details</Text>
            <View style={styles.customerDetails}>
              <View style={styles.detailRow}>
                <Icon name="local-shipping" size={16} color="#666" />
                <Text style={styles.detailText}>
                  {saleDetails.shipping_address || 'No shipping address provided'}
                </Text>
              </View>
              {saleDetails.status === 'shipped' && (
                <View style={styles.detailRow}>
                  <Icon name="check-circle" size={16} color="#28a745" />
                  <Text style={styles.detailText}>Order has been shipped</Text>
                </View>
              )}
              {saleDetails.status === 'confirmed' && (
                <View style={styles.detailRow}>
                  <Icon name="schedule" size={16} color="#ffc107" />
                  <Text style={styles.detailText}>Ready for shipping</Text>
                </View>
              )}
            </View>
          </View>

          {/* Sale Items Section */}
          {Array.isArray(saleItems) && saleItems.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Sale Items</Text>
                <Text style={styles.viewAllText}>View All</Text>
              </View>
              <View style={styles.itemsContainer}>
                {saleItems.slice(0, 3).map((item: any, index: number) => (
                  <View key={index} style={styles.itemCard}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.product?.name || item.product_name || `Item ${index + 1}`}</Text>
                      <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                    </View>
                    <Text style={styles.itemPrice}>{formatCurrency(item.total_price)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Timeline Event Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sale Timeline</Text>
              <Text style={styles.viewAllText}>View All</Text>
            </View>
            <View style={styles.timelineCard}>
              <Icon name="schedule" size={16} color="#666" />
              <Text style={styles.timelineText}>
                {saleDetails.status === 'shipped' ? 'Sale Shipped' : 'Sale Created'} • {formatDate(saleDetails.sale_date)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        {/* Left: Invoice */}
        <TouchableOpacity 
          style={styles.leftButton}
          onPress={handleGetInvoice}
        >
          <Icon name="description" size={20} color="#666" />
        </TouchableOpacity>
        
        {/* Center: Confirm/Ship */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={actionLoading ? undefined : handleActionButton}
        >
          <LinearGradient
            colors={['#FB7504', '#C2252C']}
            style={styles.actionButtonGradient}
          >
            <Text style={styles.actionButtonText}>
              {actionLoading 
                ? 'Processing...' 
                : getActionButtonText()
              }
            </Text>
            <Icon name="arrow-forward" size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Right: Stock Info */}
        <TouchableOpacity 
          style={styles.leftButton}
          onPress={() => {
            if (Array.isArray(saleItems) && saleItems.length > 0) {
              const stockInfo = saleItems.map(item => 
                `${item.product?.name || item.product_name || 'Unknown'}: Qty ${item.quantity}`
              ).join('\n');
              showSuccess(`Stock Check:\n${stockInfo}\n\nNote: To add inventory, go to Warehouse → Stock Management`);
            } else {
              showFailure('No items found in this sale to check stock.');
            }
          }}
        >
          <Icon name="inventory" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        title="Success!"
        message={successMessage}
        onClose={handleSuccessClose}
        onAction={handleSuccessClose}
        actionText="OK"
      />

      {/* Failure Modal */}
      <FailureModal
        visible={showFailureModal}
        title="Error!"
        message={failureMessage}
        onClose={handleFailureClose}
        onAction={handleFailureClose}
        actionText="OK"
      />


    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
    marginTop: 20,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  fadeOverlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 20,
    zIndex: 1,
  },
  fadeOverlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
    zIndex: 1,
  },
  loadingContainer: {
    flex: 1,
    padding: SPACING.lg,
  },
  skeletonGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginVertical: SPACING.lg,
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: COLORS.primary,
    borderTopColor: 'transparent',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: SPACING.md,
    fontSize: 18,
    color: COLORS.text.secondary,
  },
  heroContainer: {
    position: 'relative',
    height: 320,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    ...SHADOWS.md,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  backButton: {
    position: 'absolute',
    top: SPACING.lg,
    left: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  backButtonText: {
    marginLeft: SPACING.xs,
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  editButton: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  editButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  customerPill: {
    position: 'absolute',
    bottom: -20,
    left: '50%',
    transform: [{ translateX: -90 }],
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  customerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  pricingPill: {
    position: 'absolute',
    bottom: -20,
    right: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  datePill: {
    position: 'absolute',
    bottom: -20,
    left: screenWidth / 2 - 40,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  dateText: {
    marginLeft: SPACING.xs,
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  contentCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  saleTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: SPACING.xs,
  },
  saleSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: SPACING.lg,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
    paddingHorizontal: 0,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: SPACING.xs,
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  viewAllText: {
    fontSize: 14,
    color: '#666',
  },
  sectionDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  customerDetails: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailText: {
    marginLeft: SPACING.sm,
    fontSize: 14,
    color: '#666',
  },
  itemsContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: SPACING.md,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  timelineCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineText: {
    marginLeft: SPACING.sm,
    fontSize: 14,
    color: '#666',
  },
  bottomBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  leftButton: {
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    width: 48,
    height: 48,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    flex: 1,
    marginLeft: SPACING.md,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: SPACING.sm,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: SPACING.lg,
    alignItems: 'center',
    width: '80%',
    ...SHADOWS.lg,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  modalMessage: {
    fontSize: 18,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
    width: '100%',
  },
  modalButtonText: {
    color: COLORS.text.light,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  lottieAnimation: {
    width: 100,
    height: 100,
    marginBottom: SPACING.md,
  },
  errorIconContainer: {
    marginBottom: SPACING.md,
  },
});

export default SalesDetailsScreen;
