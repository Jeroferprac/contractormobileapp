import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';
import Sidebar from '../../components/ui/Sidebar';

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

import {
  SearchBar,
  LoadingSkeleton,
  FadeSlideInView,
} from '../../components/ui';
import { Button } from '../../components/Button';

import { PurchaseOrder } from '../../types/inventory';
import { SuppliersScreenNavigationProp } from '../../types/navigation';
import { inventoryApiService } from '../../api/inventoryApi';

interface PurchaseOrdersScreenProps {
  navigation: SuppliersScreenNavigationProp;
}

const PurchaseOrdersScreen: React.FC<PurchaseOrdersScreenProps> = ({ navigation }) => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [filteredPurchaseOrders, setFilteredPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);

  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    loadPurchaseOrders(false);
  }, []);

  // Refresh data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadPurchaseOrders(false);
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    filterPurchaseOrders();
  }, [searchText, purchaseOrders]);

  const loadPurchaseOrders = async (isRefreshing = false) => {
    try {
      console.log('🔄 [PurchaseOrdersScreen] Loading purchase orders...');
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const response = await inventoryApiService.getPurchaseOrders();
      setPurchaseOrders(response.data || []);
      console.log('✅ [PurchaseOrdersScreen] Loaded purchase orders:', response.data?.length || 0);
    } catch (error) {
      console.error('❌ [PurchaseOrdersScreen] Error loading purchase orders:', error);
      setHasError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterPurchaseOrders = () => {
    if (!searchText.trim()) {
      setFilteredPurchaseOrders(purchaseOrders);
      return;
    }

    const filtered = purchaseOrders.filter(order =>
      order.po_number.toLowerCase().includes(searchText.toLowerCase()) ||
      order.supplier_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      order.status.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredPurchaseOrders(filtered);
  };

  const handlePurchaseOrderPress = (order: PurchaseOrder) => {
            navigation.navigate('PurchaseOrderDetailsScreen', { orderId: order.id });
  };

  const handleEditPurchaseOrder = (order: PurchaseOrder) => {
            navigation.navigate('PurchaseOrderFormScreen', { order, isEditing: true });
  };

  const handleAddPurchaseOrder = () => {
            navigation.navigate('PurchaseOrderFormScreen', { isEditing: false });
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

  const getPurchaseOrderCardColors = (index: number) => {
    const colorSchemes = [
      [COLORS.card || '#FFFFFF', COLORS.surface || '#F8F9FA', '#F8F9FA'],
      [COLORS.card || '#FFFFFF', '#FFF8E1', '#FFF3E0'],
      [COLORS.card || '#FFFFFF', '#E8F5E8', '#E0F2E0'],
      [COLORS.card || '#FFFFFF', '#FFF3E0', '#FFE0B2'],
      [COLORS.card || '#FFFFFF', '#E3F2FD', '#BBDEFB'],
      [COLORS.card || '#FFFFFF', '#F3E5F5', '#E1BEE7'],
    ];
    return colorSchemes[index % colorSchemes.length];
  };

  const renderPurchaseOrderItem = ({ item, index }: { item: PurchaseOrder; index: number }) => (
    <FadeSlideInView delay={index * 100}>
      <TouchableOpacity
        style={styles.orderItem}
        activeOpacity={0.9}
        onPress={() => handlePurchaseOrderPress(item)}
      >
        <LinearGradient
          colors={(() => {
            try {
              const colors = getPurchaseOrderCardColors(index);
              return Array.isArray(colors) && colors.length > 0 ? colors : ['#FFFFFF', '#F8FAFC'];
            } catch (error) {
              return ['#FFFFFF', '#F8FAFC'];
            }
          })()}
          style={styles.itemCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {item.status.toUpperCase()}
              </Text>
            </View>
            <View style={styles.iconContainer}>
              <Icon name="receipt" size={24} color="#6366F1" />
            </View>
          </View>

          {/* PO Number with Enhanced Styling */}
          <View style={styles.poNumberContainer}>
          <Text style={styles.poNumber}>{item.po_number}</Text>
            <View style={styles.poBadge}>
              <Icon name="verified" size={16} color="#10B981" />
              <Text style={styles.poBadgeText}>Active</Text>
            </View>
          </View>

          {/* Supplier Info Grid */}
          <View style={styles.supplierGrid}>
            <View style={styles.supplierItem}>
              <View style={styles.iconWrapper}>
                <Icon name="business" size={18} color="#8B5CF6" />
              </View>
              <View style={styles.supplierTextContainer}>
                <Text style={styles.supplierLabel}>Supplier</Text>
                <Text style={styles.supplierText} numberOfLines={1}>
                  {item.supplier_name || 'Unknown Supplier'}
                </Text>
                {item.supplier_id && (
                  <Text style={styles.supplierIdText} numberOfLines={1}>
                    ID: {item.supplier_id}
                  </Text>
                )}
              </View>
          </View>

            <View style={styles.supplierItem}>
              <View style={styles.iconWrapper}>
                <Icon name="attach-money" size={18} color="#10B981" />
              </View>
              <View style={styles.supplierTextContainer}>
                <Text style={styles.supplierLabel}>Total Amount</Text>
                <Text style={styles.supplierText}>
                  ${(() => {
                    try {
                      const total = item.total_amount;
                      return typeof total === 'number' ? total.toFixed(2) : '0.00';
                    } catch (error) {
                      return '0.00';
                    }
                  })()}
              </Text>
            </View>
            </View>

            <View style={styles.supplierItem}>
              <View style={styles.iconWrapper}>
                <Icon name="inventory" size={18} color="#06B6D4" />
              </View>
              <View style={styles.supplierTextContainer}>
                <Text style={styles.supplierLabel}>Items</Text>
                <Text style={styles.supplierText}>
                {item.items?.length || 0} items
              </Text>
            </View>
            </View>

            <View style={styles.supplierItem}>
              <View style={styles.iconWrapper}>
                <Icon name="event" size={18} color="#F59E0B" />
              </View>
              <View style={styles.supplierTextContainer}>
                <Text style={styles.supplierLabel}>Order Date</Text>
                <Text style={styles.supplierText}>
                {new Date(item.order_date).toLocaleDateString()}
              </Text>
              </View>
            </View>
          </View>

          {/* Additional Info Row */}
          <View style={styles.additionalInfoRow}>
            <View style={styles.infoChip}>
              <Icon name="schedule" size={14} color="#6366F1" />
              <Text style={styles.infoChipText}>Purchase Order</Text>
            </View>
            {item.expected_delivery_date && (
              <View style={styles.infoChip}>
                <Icon name="local-shipping" size={14} color="#10B981" />
                <Text style={styles.infoChipText}>
                  {new Date(item.expected_delivery_date).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>

          {/* Card Footer with Action Hint */}
          <View style={styles.cardFooter}>
            <View style={styles.actionHint}>
              <Icon name="touch-app" size={16} color="#6B7280" />
              <Text style={styles.actionHintText}>Tap to view • Long press for options</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </FadeSlideInView>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={['#F8FAFC', '#E2E8F0']}
        style={styles.emptyCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.emptyIconContainer}>
          <Icon name="receipt" size={80} color="#94A3B8" />
        </View>
      <Text style={styles.emptyTitle}>No Purchase Orders</Text>
      <Text style={styles.emptySubtitle}>
          {searchText ? 'Try adjusting your search criteria' : 'Get started by creating your first purchase order'}
      </Text>
        {!searchText && (
          <TouchableOpacity style={styles.emptyActionButton} onPress={handleAddPurchaseOrder}>
            <Icon name="add" size={20} color="#FFFFFF" />
            <Text style={styles.emptyActionText}>Create Purchase Order</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </View>
  );

  const renderErrorState = () => (
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
        <Text style={styles.emptyTitle}>Failed to Load Purchase Orders</Text>
        <Text style={styles.emptySubtitle}>
          There was an error connecting to the server. Please check your connection and try again.
      </Text>
        <TouchableOpacity style={styles.emptyActionButton} onPress={() => loadPurchaseOrders(false)}>
          <Icon name="refresh" size={20} color="#FFFFFF" />
          <Text style={styles.emptyActionText}>Retry</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  if (hasError) {
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
              style={styles.headerButton}
              onPress={() => setSidebarVisible(true)}
            >
              <Icon name="menu" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Purchase Orders</Text>
              <Text style={styles.headerSubtitle}>Manage your procurement process</Text>
            </View>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddPurchaseOrder}
            >
              <Icon name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
        </View>
        </LinearGradient>
        {renderErrorState()}
      </SafeAreaView>
    );
  }

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
            style={styles.headerButton}
            onPress={() => setSidebarVisible(true)}
          >
            <Icon name="menu" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitle}>Purchase Orders</Text>
            <Text style={styles.headerSubtitle}>Manage your procurement process</Text>
          </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddPurchaseOrder}
        >
          <Icon name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
        <View style={styles.searchWrapper}>
        <SearchBar
          placeholder="Search purchase orders..."
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
        data={filteredPurchaseOrders}
        renderItem={renderPurchaseOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={() => loadPurchaseOrders(true)}
        ListEmptyComponent={renderEmptyState}
        />
      )}

      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        onNavigate={(screen) => navigation.navigate(screen as any)}
      />
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
  headerButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },


  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    minHeight: 40,
    minWidth: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
  orderItem: {
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  itemCard: {
    padding: SPACING.md,
    minHeight: 140,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
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
    fontSize: FONTS.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#374151',
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
  poNumberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  poNumber: {
    fontSize: FONTS.xxxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#1F2937',
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.05)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  poBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  poBadgeText: {
    fontSize: FONTS.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#10B981',
  },
  supplierGrid: {
    gap: SPACING.xs,
  },
  supplierItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    ...SHADOWS.md,
  },
  supplierTextContainer: {
    flex: 1,
  },
  supplierLabel: {
    fontSize: FONTS.sm,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginBottom: 1,
  },
  supplierText: {
    fontSize: FONTS.md,
    color: COLORS.text.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  supplierIdText: {
    fontSize: FONTS.sm,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginTop: 1,
    fontStyle: 'italic',
  },
  additionalInfoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    gap: SPACING.xs,
  },
  infoChipText: {
    fontSize: FONTS.sm,
    color: COLORS.text.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  cardFooter: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  actionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionHintText: {
    fontSize: FONTS.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
    fontStyle: 'italic',
  },
  skeletonItem: {
    marginBottom: SPACING.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
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
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONTS.title,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FONTS.lg,
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
    fontSize: FONTS.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
});

export default PurchaseOrdersScreen;
