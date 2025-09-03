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
import { BatchCard } from '../../components/home';
import { SectionHeader } from '../../components/layout';
import { StatsCard, SearchBar, FadeSlideInView } from '../../components/ui';
import batchesApiService, { Batch } from '../../api/batchesApi';

const { width: screenWidth } = Dimensions.get('window');

interface BatchesScreenProps {
  navigation: any;
}

const BatchesScreen: React.FC<BatchesScreenProps> = ({ navigation }) => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await batchesApiService.getBatches();
      
      // Ensure no duplicates by using a Map with ID as key
      const uniqueBatches = Array.from(
        new Map(data.map(item => [item.id, item])).values()
      );
      
      setBatches(uniqueBatches);
    } catch (error) {
      console.error('Error loading batches:', error);
      setError('Failed to load batches');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBatches();
    setRefreshing(false);
  };

  const handleBatchPress = (batch: Batch) => {
    console.log('🎯 Batch pressed:', batch.name);
    handleViewDetails(batch);
  };

  const handleBatchLongPress = (batch: Batch) => {
    console.log('🔧 Long press on batch:', batch.name);
    Alert.alert(
      'Batch Options',
      `What would you like to do with "${batch.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Edit', onPress: () => handleEditBatch(batch) },
        { text: 'Delete', onPress: () => handleDeleteBatch(batch), style: 'destructive' },
        { text: 'View Details', onPress: () => handleViewDetails(batch) },
      ]
    );
  };

  const handleViewDetails = (batch: Batch) => {
    console.log('📋 View details for:', batch.name);
    console.log('🚀 Navigating to BatchDetailsScreen with ID:', batch.id);
    try {
      navigation.navigate('BatchDetailsScreen', { batchId: batch.id });
      console.log('✅ Navigation successful');
    } catch (error) {
      console.error('❌ Navigation error:', error);
      Alert.alert('Navigation Error', 'Failed to navigate to details screen');
    }
  };

  const handleEditBatch = (batch: Batch) => {
    console.log('Edit batch:', batch.name);
    navigation.navigate('EditBatchScreen', { batch, isEditing: true });
  };

  const handleDeleteBatch = (batch: Batch) => {
    Alert.alert(
      'Delete Batch',
      `Are you sure you want to delete "${batch.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await batchesApiService.deleteBatch(batch.id);
              setBatches(prev => prev.filter(b => b.id !== batch.id));
              Alert.alert('Success', 'Batch deleted successfully');
            } catch (error) {
              console.error('Error deleting batch:', error);
              Alert.alert('Error', 'Failed to delete batch');
            }
          },
        },
      ]
    );
  };

  const handleCreateBatch = () => {
    console.log('Navigate to create batch screen');
    navigation.navigate('EditBatchScreen', { isEditing: false });
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
    return batches.reduce((sum, batch) => sum + batch.total_value, 0);
  };

  const getActiveCount = () => {
    return batches.filter(batch => batch.status === 'active').length;
  };

  const getCompletedCount = () => {
    return batches.filter(batch => batch.status === 'completed').length;
  };

  const filteredBatches = batches.filter(batch =>
    (batch.name?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
    (batch.description?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
    (batch.batch_number?.toLowerCase() || '').includes(searchText.toLowerCase())
  );

  // Removed loading screen - show main screen immediately

  if (error && batches.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color={COLORS.status.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadBatches}>
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
            <Text style={styles.headerTitle}>Batches</Text>
            <Text style={styles.headerSubtitle}>Manage your production batches</Text>
          </View>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateBatch}
            activeOpacity={0.8}
          >
            <Icon name="plus" size={24} color={COLORS.text.light} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <SearchBar
            placeholder="Search batches..."
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
              title="Total Batches"
              value={batches.length.toString()}
              icon="package"
              gradient="primary"
            />
            <StatsCard
              title="Active Batches"
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

        {/* Batches Section */}
        <View style={styles.section}>
          <SectionHeader
            title={`All Batches (${filteredBatches.length})`}
            subtitle="Manage your production batches and quality control"
            onViewAllPress={() => console.log('View all')}
          />
          
          <View style={styles.batchesGrid}>
            {filteredBatches.map((batch, index) => (
              <FadeSlideInView key={batch.id} delay={index * 100}>
                <BatchCard
                  batch={batch}
                  onPress={() => handleBatchPress(batch)}
                  onLongPress={() => handleBatchLongPress(batch)}
                />
              </FadeSlideInView>
            ))}
          </View>

          {filteredBatches.length === 0 && (
            <View style={styles.emptyContainer}>
              <Icon name="package" size={48} color={COLORS.text.tertiary} />
              <Text style={styles.emptyTitle}>No Batches Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchText ? 'Try adjusting your search terms' : 'Create your first batch to get started'}
              </Text>
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
                onPress={handleCreateBatch}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={COLORS.gradient.primary}
                  style={styles.quickActionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Icon name="plus-circle" size={24} color={COLORS.text.light} />
                  <Text style={styles.quickActionText}>Create New Batch</Text>
                </LinearGradient>
              </TouchableOpacity>
            </FadeSlideInView>
            
            <FadeSlideInView delay={300}>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => console.log('Import batch')}
                activeOpacity={0.8}
              >
                <View style={styles.quickActionContent}>
                  <Icon name="download" size={24} color={COLORS.secondary} />
                  <Text style={styles.quickActionText}>Import Batch</Text>
                </View>
              </TouchableOpacity>
            </FadeSlideInView>
            
            <FadeSlideInView delay={400}>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => console.log('Export batch')}
                activeOpacity={0.8}
              >
                <View style={styles.quickActionContent}>
                  <Icon name="upload" size={24} color={COLORS.status.warning} />
                  <Text style={styles.quickActionText}>Export Batch</Text>
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
  batchesGrid: {
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

export default BatchesScreen;
