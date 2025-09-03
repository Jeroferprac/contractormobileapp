import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../constants/spacing';
import { TYPOGRAPHY } from '../constants/typography';
import { PriceList, PriceListItem } from '../api/priceListsApi';
import priceListsApiService from '../api/priceListsApi';
import { FadeSlideInView } from '../components/ui';

interface PriceListProductsScreenProps {
  navigation: any;
  route: {
    params: {
      priceListId: string;
    };
  };
}

const PriceListProductsScreen: React.FC<PriceListProductsScreenProps> = ({ navigation, route }) => {
  const { priceListId } = route.params;
  const [priceList, setPriceList] = useState<PriceList | null>(null);
  const [products, setProducts] = useState<PriceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [priceListId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load price list details
      const priceListData = await priceListsApiService.getPriceList(priceListId);
      setPriceList(priceListData);
      
      // Load products
      const productsData = await priceListsApiService.getPriceListProducts(priceListId);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading price list products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };



  const handleProductPress = (product: PriceListItem) => {
    Alert.alert(
      'Product Options',
      `What would you like to do with this product?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Edit Price', onPress: () => handleEditProduct(product) },
        { text: 'Remove', onPress: () => handleRemoveProduct(product), style: 'destructive' },
      ]
    );
  };

  const handleEditProduct = (product: PriceListItem) => {
    Alert.alert(
      'Edit Product Price',
      'This feature will be implemented soon.',
      [{ text: 'OK' }]
    );
  };

  const handleRemoveProduct = (product: PriceListItem) => {
    Alert.alert(
      'Remove Product',
      'Are you sure you want to remove this product from the price list?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Note: Remove endpoint not implemented yet
              setProducts(products.filter(p => p.id !== product.id));
              Alert.alert('Success', 'Product removed successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove product');
            }
          }
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: priceList?.currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderProductItem = ({ item, index }: { item: PriceListItem; index: number }) => (
    <FadeSlideInView delay={index * 100}>
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleProductPress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.productHeader}>
          <View style={styles.productIconContainer}>
            <Icon name="package" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>Product #{item.product_id}</Text>
            <Text style={styles.productId}>ID: {item.id}</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatCurrency(item.price)}</Text>
            <Text style={styles.currency}>{item.currency}</Text>
          </View>
        </View>
        
        <View style={styles.productFooter}>
          <View style={styles.dateContainer}>
            <Icon name="calendar" size={14} color={COLORS.text.secondary} />
            <Text style={styles.dateText}>Added: {formatDate(item.created_at)}</Text>
          </View>
          <Icon name="chevron-right" size={16} color={COLORS.text.secondary} />
        </View>
      </TouchableOpacity>
    </FadeSlideInView>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color={COLORS.status.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <LinearGradient colors={COLORS.gradient.primary || ['#FF6B35', '#FF8C42']} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Icon name="arrow-left" size={24} color={COLORS.text.light} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>Products Details</Text>
            <Text style={styles.headerSubtitle}>{priceList?.name}</Text>
          </View>

        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Price List Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: priceList?.color || COLORS.primary }]}>
              <Icon name={priceList?.icon as any || 'list'} size={24} color={COLORS.white} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.name}>{priceList?.name}</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: priceList?.is_active ? COLORS.status.success : COLORS.status.error }
              ]}>
                <Text style={styles.statusText}>
                  {priceList?.is_active ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
          </View>
          
          <Text style={styles.description}>{priceList?.description}</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Icon name="package" size={18} color={COLORS.primary} />
              <Text style={styles.statValue}>{products.length}</Text>
              <Text style={styles.statLabel}>Products</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Icon name="dollar-sign" size={18} color={COLORS.primary} />
              <Text style={styles.statValue}>
                {formatCurrency(products.reduce((sum, p) => sum + p.price, 0))}
              </Text>
              <Text style={styles.statLabel}>Total Value</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Icon name="tag" size={18} color={COLORS.primary} />
              <Text style={styles.statValue}>{priceList?.category}</Text>
              <Text style={styles.statLabel}>Category</Text>
            </View>
          </View>
        </View>

                 {/* Quick Actions */}
         <View style={styles.actionsSection}>
           <View style={styles.actionsGrid}>
             <TouchableOpacity 
               style={[styles.actionCard, styles.editActionCard]} 
               onPress={() => navigation.goBack()}
               activeOpacity={0.8}
               
             >
               <View style={styles.actionIconContainer}>
                 <Icon name="arrow-left" size={20} color={COLORS.white} />
               </View>
               <Text style={[styles.actionText, styles.editActionText]}>Back to Details</Text>
             </TouchableOpacity>
           </View>
         </View>

        {/* Products List */}
        <View style={styles.productsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Products in Price List</Text>
            <Text style={styles.sectionSubtitle}>{products.length} items</Text>
          </View>

          {products.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="package" size={48} color={COLORS.text.tertiary} />
              <Text style={styles.emptyTitle}>No Products</Text>
              <Text style={styles.emptySubtitle}>
                Add products to this price list to get started
              </Text>
                             <Text style={styles.emptySubtitle}>
                 No products available in this price list
               </Text>
            </View>
          ) : (
            <View style={styles.productsList}>
              {products.map((product, index) => renderProductItem({ item: product, index }))}
            </View>
          )}
        </View>

        {/* Details */}
        <View style={styles.detailsSection}>
          <View style={styles.detailsList}>
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Icon name="dollar-sign" size={16} color={COLORS.text.secondary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Currency</Text>
                <Text style={styles.detailValue}>{priceList?.currency}</Text>
              </View>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Icon name="calendar" size={16} color={COLORS.text.secondary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Created</Text>
                <Text style={styles.detailValue}>{priceList ? formatDate(priceList.created_at) : ''}</Text>
              </View>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Icon name="clock" size={16} color={COLORS.text.secondary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Last Updated</Text>
                <Text style={styles.detailValue}>{priceList ? formatDate(priceList.updated_at) : ''}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.lg,
  },
  retryButtonText: {
    color: COLORS.text.light,
    fontSize: 16,
    fontWeight: '600',
  },
  headerGradient: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
    ...SHADOWS.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SPACING.md,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.light,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },

  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.md,
    ...SHADOWS.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border.light,
    marginHorizontal: SPACING.sm,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  actionsSection: {
    marginTop: SPACING.lg,
  },
  detailsSection: {
    marginTop: SPACING.lg,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    ...SHADOWS.sm,
    zIndex: 10,
    elevation: 5,
  },
  actionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  actionText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  editActionCard: {
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  editActionText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  productsSection: {
    marginTop: SPACING.lg,
  },
  sectionHeader: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
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
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },

  productsList: {
    paddingBottom: SPACING.xl,
  },
  productCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  productIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  productId: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  currency: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
  },
  detailsList: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  detailIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  detailContent: {
    flex: 1,
  },
  detailDivider: {
    height: 1,
    backgroundColor: COLORS.border.light,
    marginVertical: SPACING.sm,
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
});

export default PriceListProductsScreen;
