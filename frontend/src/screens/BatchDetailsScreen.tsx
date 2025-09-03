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
import { Batch } from '../api/batchesApi';
import batchesApiService from '../api/batchesApi';

interface BatchDetailsScreenProps {
  navigation: any;
  route: {
    params: {
      batchId: string;
    };
  };
}

const BatchDetailsScreen: React.FC<BatchDetailsScreenProps> = ({ navigation, route }) => {
  const { batchId } = route.params;
  console.log('🎯 BatchDetailsScreen mounted with batchId:', batchId);
  console.log('🎯 Route params:', route.params);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBatchDetails();
  }, [batchId]);

  const loadBatchDetails = async () => {
    console.log('📥 Loading batch details for ID:', batchId);
    try {
      setLoading(true);
      setError(null);
      const data = await batchesApiService.getBatch(batchId);
      console.log('✅ Batch data loaded:', data);
      setBatch(data);
    } catch (error) {
      console.error('❌ Error loading batch details:', error);
      setError('Failed to load batch details');
    } finally {
      setLoading(false);
    }
  };



  const handleDelete = () => {
    Alert.alert(
      'Delete Batch',
      `Are you sure you want to delete "${batch?.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await batchesApiService.deleteBatch(batchId);
              Alert.alert('Success', 'Batch deleted successfully');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete batch');
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: batch?.currency || 'USD',
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

  const getStatusColor = (status: string) => {
    if (!status) return COLORS.text.secondary;
    switch (status) {
      case 'active':
        return COLORS.status.success;
      case 'completed':
        return COLORS.status.info;
      case 'pending':
        return COLORS.status.warning;
      case 'inactive':
        return COLORS.status.error;
      default:
        return COLORS.text.secondary;
    }
  };

  const getStatusText = (status: string) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading batch details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !batch) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color={COLORS.status.error} />
          <Text style={styles.errorText}>{error || 'Batch not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadBatchDetails}>
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
            <Text style={styles.headerTitle}>Batch Details</Text>
            <Text style={styles.headerSubtitle}>{batch.name}</Text>
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
        {/* Batch Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: batch.color }]}>
              <Icon name={batch.icon as any} size={24} color={COLORS.white} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.name}>{batch.name}</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(batch.status) }
              ]}>
                <Text style={styles.statusText}>
                  {getStatusText(batch.status)}
                </Text>
              </View>
            </View>
          </View>
          
          <Text style={styles.description}>{batch.description}</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Icon name="package" size={18} color={COLORS.primary} />
              <Text style={styles.statValue}>{batch.total_items}</Text>
              <Text style={styles.statLabel}>Items</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Icon name="dollar-sign" size={18} color={COLORS.primary} />
              <Text style={styles.statValue}>{formatCurrency(batch.total_value)}</Text>
              <Text style={styles.statLabel}>Total Value</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Icon name="tag" size={18} color={COLORS.primary} />
              <Text style={styles.statValue}>{batch.category}</Text>
              <Text style={styles.statLabel}>Category</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}


        {/* Details */}
        <View style={styles.detailsSection}>
          <View style={styles.detailsList}>
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Icon name="hash" size={16} color={COLORS.text.secondary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Batch Number</Text>
                <Text style={styles.detailValue}>{batch.batch_number}</Text>
              </View>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Icon name="dollar-sign" size={16} color={COLORS.text.secondary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Currency</Text>
                <Text style={styles.detailValue}>{batch.currency}</Text>
              </View>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Icon name="calendar" size={16} color={COLORS.text.secondary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Created</Text>
                <Text style={styles.detailValue}>{formatDate(batch.created_at)}</Text>
              </View>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Icon name="clock" size={16} color={COLORS.text.secondary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Last Updated</Text>
                <Text style={styles.detailValue}>{formatDate(batch.updated_at)}</Text>
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
  detailsSection: {
    marginTop: SPACING.lg,
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

export default BatchDetailsScreen;
