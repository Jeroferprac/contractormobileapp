import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import { Sale, SaleFilters } from '../../types/inventory';
import { inventoryApiService } from '../../api/inventoryApi';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

const { width: screenWidth } = Dimensions.get('window');

interface AllSalesScreenProps {
  navigation: any;
}

// Sales Card Skeleton Component
const SalesCardSkeleton: React.FC = () => {
  return (
    <View style={styles.saleCard}>
      <View style={styles.cardContent}>
        {/* Header Image Skeleton */}
        <View style={styles.imageContainer}>
          <LoadingSkeleton 
            width="100%" 
            height={180} 
            borderRadius={16}
          />
          
          {/* Status Badge Skeleton */}
          <View style={styles.statusBadge}>
            <LoadingSkeleton width={60} height={24} borderRadius={12} />
          </View>

          {/* Customer Pill Skeleton */}
          <View style={styles.customerPill}>
            <LoadingSkeleton width={100} height={32} borderRadius={16} />
          </View>

          {/* Pricing Pill Skeleton */}
          <View style={styles.pricingPill}>
            <LoadingSkeleton width={80} height={32} borderRadius={16} />
          </View>
        </View>

        {/* Content Area Skeleton */}
        <View style={styles.cardBody}>
          <LoadingSkeleton width="80%" height={16} style={styles.titleSkeleton} />
          <LoadingSkeleton width="60%" height={13} style={styles.detailsSkeleton} />
          <View style={styles.paymentRow}>
            <LoadingSkeleton width={50} height={12} />
            <LoadingSkeleton width={40} height={12} />
          </View>
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
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <View key={`filter-skeleton-${item}`} style={styles.categoryTab}>
            <LoadingSkeleton width={60} height={32} borderRadius={20} />
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
      <LoadingSkeleton width="100%" height={48} borderRadius={12} />
    </View>
  );
};

const AllSalesScreen: React.FC<AllSalesScreenProps> = ({ navigation }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;

  const categories = ['All', 'Completed', 'Pending', 'Overdue', 'Paid', 'Unpaid'];

  // Filter sales based on selected category and search query
  const filterSales = (salesList: Sale[], category: string, search: string) => {
    let filtered = salesList;

    // Apply category filter
    if (category !== 'All') {
      switch (category) {
        case 'Completed':
          filtered = filtered.filter(sale => sale.status.toLowerCase() === 'completed');
          break;
        case 'Pending':
          filtered = filtered.filter(sale => sale.status.toLowerCase() === 'pending');
          break;
        case 'Overdue':
          filtered = filtered.filter(sale => sale.status.toLowerCase() === 'overdue');
          break;
        case 'Paid':
          filtered = filtered.filter(sale => sale.payment_status.toLowerCase() === 'paid');
          break;
        case 'Unpaid':
          filtered = filtered.filter(sale => sale.payment_status.toLowerCase() === 'unpaid');
          break;
        default:
          break;
      }
    }

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(sale => 
        sale.customer_name.toLowerCase().includes(searchLower) ||
        sale.sale_number.toLowerCase().includes(searchLower) ||
        sale.total_amount.includes(search) ||
        sale.status.toLowerCase().includes(searchLower) ||
        sale.payment_status.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  };

  // Update filtered sales when sales, category, or search changes
  useEffect(() => {
    const filtered = filterSales(sales, selectedCategory, searchQuery);
    setFilteredSales(filtered);
  }, [sales, selectedCategory, searchQuery]);

  useEffect(() => {
    fetchSales();
  }, [currentPage]);

  const fetchSales = async (isRefresh = false) => {
    try {
      console.log('🔄 AllSalesScreen: Starting API call...');
      
      if (isRefresh) {
        setRefreshing(true);
        setCurrentPage(1);
      }

      const filters: SaleFilters = {
        page: isRefresh ? 1 : currentPage,
        limit: 50,
      };

      console.log('📡 AllSalesScreen: API filters:', filters);
      const response = await inventoryApiService.getSales(filters);
      console.log('✅ AllSalesScreen: API response:', response.data);
      
      const newSales = Array.isArray(response.data) ? response.data : [];
      console.log('📊 AllSalesScreen: Sales count:', newSales.length);

      if (isRefresh) {
        setSales(newSales);
      } else {
        // Prevent duplicates by checking if sale already exists
        setSales(prev => {
          const existingIds = new Set(prev.map(sale => sale.id));
          const uniqueNewSales = newSales.filter(sale => !existingIds.has(sale.id));
          return [...prev, ...uniqueNewSales];
        });
      }

      setHasMore(newSales.length === 10);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching sales:', error);
      
      // Show empty state instead of dummy data
      if (isRefresh) {
        setSales([]);
      }
      
      setHasMore(false);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchSales(true);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#4CAF50';
      case 'pending':
        return '#FB7504';
      case 'cancelled':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return '#4CAF50';
      case 'partial':
        return '#FB7504';
      case 'unpaid':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const formatCurrency = (amount: string) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCustomerAvatar = (customerName: string) => {
    const hash = customerName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const imageId = Math.abs(hash) % 1000;
    return `https://picsum.photos/200/200?random=${imageId}`;
  };

  const getProductImage = (productName: string) => {
    const hash = productName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const imageId = Math.abs(hash) % 1000;
    return `https://picsum.photos/400/300?random=${imageId}`;
  };

  const getCustomerType = (index: number) => {
    const types = [
      'Premium Customer',
      'VIP Client',
      'Gold Member',
      'Enterprise Client',
      'Loyal Customer',
    ];
    return types[index % types.length];
  };

  const renderSaleCard = ({ item, index }: { item: Sale; index: number }) => {
    const cardScale = scrollY.interpolate({
      inputRange: [-1, 0, 100 * index, 100 * (index + 1)],
      outputRange: [1, 1, 1, 0.95],
      extrapolate: 'clamp',
    });

    const cardOpacity = scrollY.interpolate({
      inputRange: [-1, 0, 100 * index, 100 * (index + 1)],
      outputRange: [1, 1, 1, 0.8],
      extrapolate: 'clamp',
    });

    const originalPrice = parseFloat(item.subtotal);
    const discountedPrice = parseFloat(item.total_amount);
    const discountAmount = parseFloat(item.discount_amount);
    const hasDiscount = discountAmount > 0;

    return (
      <Animated.View
        style={[
          styles.saleCard,
          {
            transform: [{ scale: cardScale }],
            opacity: cardOpacity,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => navigation.navigate('SalesDetails', { saleId: item.id })}
          activeOpacity={0.9}
        >
          {/* Header Image with Margin - Like Reference Image */}
          <View style={styles.imageContainer}>
            <FastImage
              source={{ uri: getProductImage(item.customer_name) }}
              style={styles.productImage}
              resizeMode={FastImage.resizeMode.cover}
            />
            
            {/* Status Badge Overlay - Top Right */}
            <View style={styles.statusBadge}>
                  <Icon 
                    name={item.status === 'completed' ? 'check-circle' : 
                          item.status === 'pending' ? 'schedule' : 
                          item.status === 'overdue' ? 'warning' : 'info'} 
                    size={14} 
                color="#FFFFFF" 
              />
              <Text style={styles.statusBadgeText}>{item.status}</Text>
            </View>

            {/* Customer Info Pill - Bottom Left (Overlapping) */}
            <View style={styles.customerPill}>
              <FastImage
                source={{ uri: getCustomerAvatar(item.customer_name) }}
                style={styles.customerPillAvatar}
                resizeMode={FastImage.resizeMode.cover}
              />
              <Text style={styles.customerPillName}>{item.customer_name}</Text>
            </View>

            {/* Pricing Pill - Bottom Right (Overlapping) */}
            <View style={styles.pricingPill}>
              {hasDiscount ? (
                <>
                  <Text style={styles.originalPricePill}>{formatCurrency(item.subtotal)}</Text>
                  <Text style={styles.discountedPricePill}>{formatCurrency(item.total_amount)}</Text>
                </>
              ) : (
                <Text style={styles.finalPricePill}>{formatCurrency(item.total_amount)}</Text>
              )}
            </View>
          </View>

          {/* Content Area - White Background */}
          <View style={styles.cardBody}>
            {/* Sale Title */}
            <Text style={styles.saleTitle}>{item.sale_number}</Text>
            
            {/* Sale Details */}
            <View style={styles.saleDetails}>
              <Icon name="inventory" size={14} color={COLORS.text.secondary} style={styles.saleDetailsIcon} />
              <Text style={styles.saleDetailsText}>
                Sale • {formatDate(item.sale_date)}
              </Text>
            </View>

            {/* Payment Status Row */}
            <View style={styles.paymentRow}>
              <View style={styles.paymentStatus}>
                  <Icon 
                    name={item.payment_status === 'paid' ? 'payment' : 
                          item.payment_status === 'unpaid' ? 'credit-card-off' : 'account-balance-wallet'} 
                  size={16} 
                    color={getPaymentStatusColor(item.payment_status)} 
                  />
                  <Text style={[styles.paymentText, { color: getPaymentStatusColor(item.payment_status) }]}>
                    {item.payment_status}
                  </Text>
                </View>
              
              {hasDiscount && (
                <View style={styles.discountBadge}>
                  <Icon name="local-offer" size={14} color="#FB7504" />
                  <Text style={styles.discountText}>-{formatCurrency(item.discount_amount)}</Text>
              </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderCategoryTab = (category: string) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryTab,
        selectedCategory === category && styles.activeCategoryTab,
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === category && styles.activeCategoryText,
        ]}
      >
        {category}
      </Text>
    </TouchableOpacity>
  );

  // Loading State
  if (loading) {
    return (
      <View style={styles.container}>
        {/* Header Skeleton */}
        <View style={styles.header}>
          <LoadingSkeleton width={80} height={24} />
          <LoadingSkeleton width={40} height={40} borderRadius={20} />
        </View>

        {/* Welcome Section Skeleton */}
        <View style={styles.welcomeSection}>
          <LoadingSkeleton width="60%" height={24} />
        </View>

        {/* Search Bar Skeleton */}
        <SearchBarSkeleton />

        {/* Filter Tabs Skeleton */}
        <FilterTabsSkeleton />

        {/* Sales List Skeleton */}
        <View style={styles.salesSection}>
          <View style={styles.sectionHeader}>
            <LoadingSkeleton width="40%" height={20} />
            <LoadingSkeleton width="20%" height={16} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.salesList}
          >
            {[1, 2, 3, 4].map((item) => (
              <SalesCardSkeleton key={`sales-skeleton-${item}`} />
            ))}
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.text.primary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.profileButton}>
            <FastImage
              source={{ uri: 'https://picsum.photos/200/200?random=1' }}
              style={styles.profileImage}
              resizeMode={FastImage.resizeMode.cover}
            />
            <View style={styles.onlineIndicator} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Welcome back, Admin 👋</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color={COLORS.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search sales..."
            placeholderTextColor={COLORS.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map(renderCategoryTab)}
        </ScrollView>
      </View>

      {/* Sales List */}
      <View style={styles.salesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Sales</Text>
          <Text style={styles.salesCount}>
            {selectedCategory === 'All' ? `${sales.length} Sales` : `${filteredSales.length} ${selectedCategory} Sales`}
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.salesList}
        >
          {filteredSales.length > 0 ? (
            filteredSales.map((item, index) => (
              <View key={`sale-${item.id}-${index}-${Date.now()}`}>
                {renderSaleCard({ item, index })}
              </View>
            ))
          ) : (
            !loading && (
              <View style={styles.emptyState}>
                <Icon name="receipt" size={64} color={COLORS.text.secondary} />
                <Text style={styles.emptyTitle}>
                  {searchQuery || selectedCategory !== 'All' ? 'No Sales Found' : 'No Sales Available'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery 
                    ? 'Try adjusting your search terms'
                    : selectedCategory !== 'All'
                    ? `No ${selectedCategory.toLowerCase()} sales found`
                    : 'No sales data available. Please check your connection or try again later.'
                  }
                </Text>
              </View>
            )
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginLeft: SPACING.xs,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButton: {
    position: 'relative',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  welcomeSection: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  searchBar: {
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
    color: COLORS.text,
  },
  categoryContainer: {
    paddingBottom: SPACING.md,
  },
  categoryScroll: {
    paddingHorizontal: SPACING.lg,
  },
  categoryTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: SPACING.sm,
  },
  activeCategoryTab: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeCategoryText: {
    color: '#FFFFFF',
  },
  salesSection: {
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
    color: COLORS.text,
  },
  salesCount: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  salesList: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  saleCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.text.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
    minHeight: 280, // Reduced card height
  },
  cardContent: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 180, // Reduced image height to match reference
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  statusBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  customerPill: {
    position: 'absolute',
    bottom: SPACING.sm, // Moved up - less overlap
    left: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16, // Smaller border radius
    paddingHorizontal: SPACING.md, // Reduced padding
    paddingVertical: SPACING.sm, // Reduced padding
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  customerPillAvatar: {
    width: 24, // Smaller avatar
    height: 24,
    borderRadius: 12,
  },
  customerPillName: {
    fontSize: 13, // Smaller font
    fontWeight: '600',
    color: '#212529',
  },
  pricingPill: {
    position: 'absolute',
    bottom: SPACING.sm, // Moved up - less overlap
    right: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16, // Smaller border radius
    paddingHorizontal: SPACING.md, // Reduced padding
    paddingVertical: SPACING.sm, // Reduced padding
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  originalPricePill: {
    fontSize: 11, // Smaller font
    color: '#6C757D',
    textDecorationLine: 'line-through',
    marginBottom: 1,
  },
  discountedPricePill: {
    fontSize: 14, // Smaller font
    fontWeight: '700',
    color: '#FB7504',
  },
  finalPricePill: {
    fontSize: 14, // Smaller font
    fontWeight: '700',
    color: '#212529',
  },
  cardBody: {
    padding: SPACING.md, // Reduced padding
    backgroundColor: 'transparent', // Removed background
    marginHorizontal: SPACING.md,
    borderRadius: 20,
    marginTop: -SPACING.sm, // Less overlap
    zIndex: 5,
    minHeight: 80, // Much smaller height
  },
  saleTitle: {
    fontSize: 16, // Smaller title
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs, // Reduced margin
  },
  saleDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  saleDetailsIcon: {
    marginRight: SPACING.xs,
    alignSelf: 'center',
  },
  saleDetailsText: {
    fontSize: 13,
    color: COLORS.text.secondary,
    flex: 1,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  paymentText: {
    fontSize: 12, // Smaller font
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderRadius: 12,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    gap: 4,
  },
  discountText: {
    fontSize: 11, // Smaller font
    fontWeight: '600',
    color: '#FB7504',
  },
  // Skeleton Styles
  titleSkeleton: {
    marginBottom: SPACING.sm,
  },
  detailsSkeleton: {
    marginBottom: SPACING.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
});

export default AllSalesScreen;
