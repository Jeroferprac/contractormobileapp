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
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { TEXT_STYLES } from '../../constants/typography';
import { PriceList, mockPriceLists } from '../../data/mockData';
import { PriceListCard } from '../../components/home';
import { SectionHeader } from '../../components/layout';

interface PriceListsScreenProps {
  navigation: any;
}

const PriceListsScreen: React.FC<PriceListsScreenProps> = ({ navigation }) => {
  const [priceLists, setPriceLists] = useState<PriceList[]>(mockPriceLists);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPriceLists();
  }, []);

  const loadPriceLists = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPriceLists(mockPriceLists);
    } catch (error) {
      console.error('Error loading price lists:', error);
      Alert.alert('Error', 'Failed to load price lists');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPriceLists();
    setRefreshing(false);
  };

  const handlePriceListPress = (priceList: PriceList) => {
    Alert.alert(
      'Price List Options',
      `What would you like to do with "${priceList.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Details', onPress: () => handleViewDetails(priceList) },
        { text: 'Edit', onPress: () => handleEditPriceList(priceList) },
        { text: 'View Products', onPress: () => handleViewProducts(priceList) },
      ]
    );
  };

  const handleViewDetails = (priceList: PriceList) => {
    console.log('View details for:', priceList.name);
    // Navigate to price list details screen
  };

  const handleEditPriceList = (priceList: PriceList) => {
    console.log('Edit price list:', priceList.name);
    // Navigate to edit price list screen
  };

  const handleViewProducts = (priceList: PriceList) => {
    console.log('View products for:', priceList.name);
    // Navigate to price list products screen
  };

  const handleCreatePriceList = () => {
    Alert.alert(
      'Create Price List',
      'Would you like to create a new price list?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Create', 
          onPress: () => {
            console.log('Create new price list');
            // Navigate to create price list screen
          }
        },
      ]
    );
  };

  const handleAddProduct = (priceList: PriceList) => {
    Alert.alert(
      'Add Product',
      `Add a product to "${priceList.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Add', 
          onPress: () => {
            console.log('Add product to:', priceList.name);
            // Navigate to add product screen
          }
        },
      ]
    );
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
    return priceLists.reduce((sum, list) => sum + list.total_value, 0);
  };

  const getActiveCount = () => {
    return priceLists.filter(list => list.is_active).length;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Price Lists</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreatePriceList}
        >
          <Icon name="plus" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icon name="list" size={24} color={COLORS.primary} />
            <Text style={styles.statNumber}>{priceLists.length}</Text>
            <Text style={styles.statLabel}>Total Lists</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="check-circle" size={24} color={COLORS.status.success} />
            <Text style={styles.statNumber}>{getActiveCount()}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="dollar-sign" size={24} color={COLORS.secondary} />
            <Text style={styles.statNumber}>{formatCurrency(getTotalValue())}</Text>
            <Text style={styles.statLabel}>Total Value</Text>
          </View>
        </View>

        {/* Price Lists Section */}
        <View style={styles.section}>
          <SectionHeader
            title="All Price Lists"
            subtitle="Manage your pricing strategies and customer segments"
            onViewAllPress={() => console.log('View all')}
          />
          
          <View style={styles.priceListsGrid}>
            {priceLists.map((priceList) => (
              <View key={priceList.id} style={styles.priceListWrapper}>
                <PriceListCard
                  priceList={priceList}
                  onPress={() => handlePriceListPress(priceList)}
                />
                <TouchableOpacity
                  style={styles.addProductButton}
                  onPress={() => handleAddProduct(priceList)}
                >
                  <Icon name="plus" size={16} color={COLORS.primary} />
                  <Text style={styles.addProductText}>Add Product</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <SectionHeader title="Quick Actions" showViewAll={false} />
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={handleCreatePriceList}
            >
              <Icon name="plus-circle" size={24} color={COLORS.primary} />
              <Text style={styles.quickActionText}>Create New List</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => console.log('Import price list')}
            >
              <Icon name="download" size={24} color={COLORS.secondary} />
              <Text style={styles.quickActionText}>Import List</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => console.log('Export price list')}
            >
              <Icon name="upload" size={24} color={COLORS.status.warning} />
              <Text style={styles.quickActionText}>Export List</Text>
            </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  createButton: {
    padding: SPACING.sm,
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  priceListsGrid: {
    paddingHorizontal: SPACING.lg,
  },
  priceListWrapper: {
    marginBottom: SPACING.md,
  },
  addProductButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  addProductText: {
    fontSize: 12,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
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

