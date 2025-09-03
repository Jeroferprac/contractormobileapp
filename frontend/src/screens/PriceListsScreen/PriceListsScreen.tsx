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
  Dimensions,
} from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';
import { PriceListCard } from '../../components/home';
import { SectionHeader } from '../../components/layout';
import { StatsCard, SearchBar, FadeSlideInView } from '../../components/ui';
import priceListsApiService, { PriceList } from '../../api/priceListsApi';

const { width: screenWidth } = Dimensions.get('window');

interface PriceListsScreenProps {
  navigation: any;
}

const PriceListsScreen: React.FC<PriceListsScreenProps> = ({ navigation }) => {
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPriceLists();
  }, []);

  // Preload data when screen comes into focus for faster navigation
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (priceLists.length === 0) {
        loadPriceLists();
      }
    });

    return unsubscribe;
  }, [navigation, priceLists.length]);

  const loadPriceLists = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [PriceListsScreen] Loading price lists...');
      
      // Use the improved API service with caching
      const data = await priceListsApiService.getPriceLists(forceRefresh);
      
      // Ensure no duplicates by using a Map with ID as key
      const uniquePriceLists = Array.from(
        new Map(data.map(item => [item.id, item])).values()
      );
      
      setPriceLists(uniquePriceLists);
      console.log('✅ [PriceListsScreen] Loaded', uniquePriceLists.length, 'price lists');
    } catch (error) {
      console.error('❌ [PriceListsScreen] Error loading price lists:', error);
      setError('Failed to load price lists. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPriceLists(true); // Force refresh from API
    setRefreshing(false);
  };

  const handlePriceListPress = (priceList: PriceList) => {
    console.log('🎯 Price list pressed:', priceList.name);
    handleViewDetails(priceList);
  };

  const handlePriceListLongPress = (priceList: PriceList) => {
    console.log('🔧 Long press on price list:', priceList.name);
    Alert.alert(
      'Price List Options',
      `What would you like to do with "${priceList.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Edit', onPress: () => handleEditPriceList(priceList) },
        { text: 'View Products', onPress: () => handleViewProducts(priceList) },
        { text: 'View Details', onPress: () => handleViewDetails(priceList) },
      ]
    );
  };

  const handleViewDetails = (priceList: PriceList) => {
    console.log('📋 View details for:', priceList.name);
    console.log('🚀 Navigating to PriceListDetailsScreen with ID:', priceList.id);
    try {
      navigation.navigate('PriceListDetailsScreen', { priceListId: priceList.id });
      console.log('✅ Navigation successful');
    } catch (error) {
      console.error('❌ Navigation error:', error);
      Alert.alert('Navigation Error', 'Failed to navigate to details screen');
    }
  };

  const handleEditPriceList = (priceList: PriceList) => {
    console.log('Edit price list:', priceList.name);
    navigation.navigate('EditPriceListScreen', { priceList, isEditing: true });
  };

  const handleViewProducts = (priceList: PriceList) => {
    console.log('View products for:', priceList.name);
    navigation.navigate('PriceListProductsScreen', { priceListId: priceList.id });
  };

  const handleCreatePriceList = async () => {
    console.log('🔄 [PriceListsScreen] Creating new price list...');
    try {
      // Check API health before navigating
      const isApiHealthy = await priceListsApiService.checkApiHealth();
      if (!isApiHealthy) {
    Alert.alert(
          'Offline Mode',
          'You are currently offline. The price list will be created locally and synced when connection is restored.',
          [{ text: 'OK' }]
        );
      }
      
      navigation.navigate('EditPriceListScreen', { isEditing: false });
    } catch (error) {
      console.error('❌ [PriceListsScreen] Error checking API health:', error);
      navigation.navigate('EditPriceListScreen', { isEditing: false });
    }
  };



  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalValue = () => {
    return priceLists.reduce((sum, list) => {
      const value = list.total_value;
      // Handle NaN, null, undefined, or invalid values
      if (!value || isNaN(value) || value === null || value === undefined) {
        return sum + 0;
      }
      return sum + value;
    }, 0);
  };

  const getActiveCount = () => {
    return priceLists.filter(list => list.is_active).length;
  };

  const filteredPriceLists = priceLists.filter(priceList =>
    priceList.name.toLowerCase().includes(searchText.toLowerCase()) ||
    priceList.description.toLowerCase().includes(searchText.toLowerCase())
  );

  // Show loading only if we have no data at all
  if (loading && priceLists.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
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
              <Text style={styles.headerTitle}>Price Lists</Text>
              <Text style={styles.headerSubtitle}>Loading...</Text>
            </View>
            <View style={styles.createButton}>
              <Icon name="plus" size={24} color={COLORS.text.light} />
            </View>
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading price lists...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && priceLists.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
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
              <Text style={styles.headerTitle}>Price Lists</Text>
              <Text style={styles.headerSubtitle}>Connection Error</Text>
            </View>
            <View style={styles.createButton}>
              <Icon name="plus" size={24} color={COLORS.text.light} />
            </View>
          </View>
        </LinearGradient>
        <View style={styles.errorContainer}>
          <Icon name="wifi-off" size={48} color={COLORS.status.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadPriceLists(true)}>
            <Icon name="refresh-cw" size={20} color={COLORS.text.light} />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header with Gradient */}
      <LinearGradient colors={COLORS.gradient.primary || ['#FF6B35', '#FF8C42']} style={styles.headerGradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Icon name="arrow-left" size={24} color={COLORS.text.light} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>Price Lists</Text>
            <Text style={styles.headerSubtitle}>Manage your pricing strategies</Text>
          </View>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreatePriceList}
            activeOpacity={0.8}
          >
            <Icon name="plus" size={24} color={COLORS.text.light} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <SearchBar
            placeholder="Search price lists..."
            value={searchText}
            onChangeText={setSearchText}
            onFilterPress={() => {}}
          />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Stats Cards */}
        <View style={styles.section}>
          <View style={styles.statsGrid}>
            <StatsCard
              title="Total Lists"
              value={priceLists.length.toString()}
              icon="list"
              gradient="primary"
            />
            <StatsCard
              title="Active Lists"
              value={getActiveCount().toString()}
              icon="check-circle"
              gradient="success"
            />
            <StatsCard
              title="Total Value"
              value={formatCurrency(getTotalValue())}
              icon="dollar-sign"
              gradient="secondary"
            />
          </View>
        </View>

        {/* Price Lists Section */}
        <View style={styles.section}>
          <SectionHeader
            title={`Price Lists (${filteredPriceLists.length})`}
            subtitle="Manage your pricing strategies and customer segments"
            onViewAllPress={() => console.log('View all')}
          />
          
          {filteredPriceLists.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="package" size={48} color={COLORS.text.tertiary} />
              <Text style={styles.emptyTitle}>No Price Lists Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchText ? 'Try adjusting your search terms' : 'Create your first price list to get started'}
              </Text>
            </View>
          ) : (
            <View style={styles.priceListsGrid}>
              {filteredPriceLists.map((priceList, index) => (
                <FadeSlideInView key={priceList.id} delay={index * 100}>
                  <PriceListCard
                    priceList={priceList}
                    onPress={() => handlePriceListPress(priceList)}
                    onLongPress={() => handlePriceListLongPress(priceList)}
                  />
                </FadeSlideInView>
              ))}
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <SectionHeader title="Quick Actions" showViewAll={false} />
          <View style={styles.quickActions}>
            <FadeSlideInView delay={200}>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={handleCreatePriceList}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={COLORS.gradient.primary}
                  style={styles.quickActionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Icon name="plus-circle" size={24} color={COLORS.text.light} />
                  <Text style={styles.quickActionText}>Create New List</Text>
                </LinearGradient>
              </TouchableOpacity>
            </FadeSlideInView>
            
            <FadeSlideInView delay={300}>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => console.log('Import price list')}
                activeOpacity={0.8}
              >
                <View style={styles.quickActionContent}>
                  <Icon name="download" size={24} color={COLORS.secondary} />
                  <Text style={styles.quickActionText}>Import List</Text>
                </View>
              </TouchableOpacity>
            </FadeSlideInView>
            
            <FadeSlideInView delay={400}>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => console.log('Export price list')}
                activeOpacity={0.8}
              >
                <View style={styles.quickActionContent}>
                  <Icon name="upload" size={24} color={COLORS.status.warning} />
                  <Text style={styles.quickActionText}>Export List</Text>
                </View>
              </TouchableOpacity>
            </FadeSlideInView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
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
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  createButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchWrapper: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  priceListsGrid: {
    marginTop: SPACING.md,
    gap: SPACING.md,
  },

  emptyContainer: {
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
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  quickActionButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  quickActionGradient: {
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionContent: {
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  quickActionText: {
    fontSize: 12,
    color: COLORS.text.primary,
    marginTop: SPACING.xs,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default PriceListsScreen;

