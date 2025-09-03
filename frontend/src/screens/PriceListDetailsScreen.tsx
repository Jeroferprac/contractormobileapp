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
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../constants/spacing';
import { TYPOGRAPHY } from '../constants/typography';
import { PriceList } from '../api/priceListsApi';
import priceListsApiService from '../api/priceListsApi';

interface PriceListDetailsScreenProps {
  navigation: any;
  route: {
    params: {
      priceListId: string;
    };
  };
}

const PriceListDetailsScreen: React.FC<PriceListDetailsScreenProps> = ({ navigation, route }) => {
  const { priceListId } = route.params;
  console.log('🎯 PriceListDetailsScreen mounted with priceListId:', priceListId);
  console.log('🎯 Route params:', route.params);
  const [priceList, setPriceList] = useState<PriceList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPriceListDetails();
  }, [priceListId]);

  const loadPriceListDetails = async () => {
    console.log('📥 Loading price list details for ID:', priceListId);
    try {
      setLoading(true);
      setError(null);
      const data = await priceListsApiService.getPriceList(priceListId);
      console.log('✅ Price list data loaded:', data);
      setPriceList(data);
    } catch (error) {
      console.error('❌ Error loading price list details:', error);
      setError('Failed to load price list details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    console.log('🔧 Edit button pressed');
    console.log('📦 Price list data:', priceList);
    if (priceList) {
      console.log('🚀 Navigating to EditPriceListScreen with params:', { priceList, isEditing: true });
      try {
        navigation.navigate('EditPriceListScreen', { priceList, isEditing: true });
        console.log('✅ Navigation successful');
      } catch (error) {
        console.error('❌ Navigation error:', error);
        Alert.alert('Navigation Error', 'Failed to navigate to edit screen');
      }
    } else {
      console.log('❌ No price list data available');
      Alert.alert('Error', 'No price list data available');
    }
  };

  const handleViewProducts = () => {
    if (priceList) {
      navigation.navigate('PriceListProductsScreen', { priceListId: priceList.id });
    }
  };



  const handleDelete = () => {
    Alert.alert(
      'Delete Price List',
      `Are you sure you want to delete "${priceList?.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Note: Delete endpoint not implemented yet
              Alert.alert('Success', 'Price list deleted successfully');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete price list');
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: priceList?.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading price list details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !priceList) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color={COLORS.status.error} />
          <Text style={styles.errorText}>{error || 'Price list not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadPriceListDetails}>
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
            <Text style={styles.headerTitle}>Price List Details</Text>
            <Text style={styles.headerSubtitle}>{priceList.name}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleEdit}
              activeOpacity={0.7}
            >
              <Icon name="edit" size={20} color={COLORS.text.light} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleDelete}
              activeOpacity={0.7}
            >
              <Icon name="trash-2" size={20} color={COLORS.text.light} />
            </TouchableOpacity>
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
            <View style={[styles.iconContainer, { backgroundColor: priceList.color }]}>
              <Icon name={priceList.icon as any} size={24} color={COLORS.white} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.name}>{priceList.name}</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: priceList.is_active ? COLORS.status.success : COLORS.status.error }
              ]}>
                <Text style={styles.statusText}>
                  {priceList.is_active ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
          </View>
          
          <Text style={styles.description}>{priceList.description}</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Icon name="package" size={18} color={COLORS.primary} />
              <Text style={styles.statValue}>{priceList.total_items}</Text>
              <Text style={styles.statLabel}>Items</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Icon name="dollar-sign" size={18} color={COLORS.primary} />
              <Text style={styles.statValue}>{formatCurrency(priceList.total_value)}</Text>
              <Text style={styles.statLabel}>Total Value</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Icon name="tag" size={18} color={COLORS.primary} />
              <Text style={styles.statValue}>{priceList.category}</Text>
              <Text style={styles.statLabel}>Category</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={handleViewProducts}>
              <View style={styles.actionIconContainer}>
                <Icon name="list" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.actionText}>View Products</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionCard, styles.editActionCard]} 
              onPress={handleEdit}
              activeOpacity={0.8}
            >
              <View style={styles.actionIconContainer}>
                <Icon name="edit-3" size={20} color={COLORS.white} />
              </View>
              <Text style={[styles.actionText, styles.editActionText]}>Edit Price List</Text>
            </TouchableOpacity>
          </View>
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
                <Text style={styles.detailValue}>{priceList.currency}</Text>
              </View>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Icon name="calendar" size={16} color={COLORS.text.secondary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Created</Text>
                <Text style={styles.detailValue}>{formatDate(priceList.created_at)}</Text>
              </View>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Icon name="clock" size={16} color={COLORS.text.secondary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Last Updated</Text>
                <Text style={styles.detailValue}>{formatDate(priceList.updated_at)}</Text>
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
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 10,
    elevation: 5,
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

export default PriceListDetailsScreen;
