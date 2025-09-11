import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';
import { Batch } from '../../api/batchesApi';

interface BatchCardProps {
  batch: Batch;
  onPress: () => void;
  onLongPress?: () => void;
  style?: any;
}

const BatchCard: React.FC<BatchCardProps> = ({ batch, onPress, onLongPress, style }) => {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: batch.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: batch.color || COLORS.primary }]}>
          <Icon name={batch.icon as any || 'package'} size={20} color={COLORS.white} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.name} numberOfLines={1}>{batch.name || 'Unnamed Batch'}</Text>
          <Text style={styles.batchNumber}>{batch.batch_number || 'No Batch Number'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(batch.status) }]}>
          <Text style={styles.statusText}>{getStatusText(batch.status)}</Text>
        </View>
      </View>

      {/* Description */}
      <Text style={styles.description} numberOfLines={2}>
        {batch.description || 'No description available'}
      </Text>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Icon name="package" size={14} color={COLORS.text.secondary} />
          <Text style={styles.statValue}>{batch.total_items || 0}</Text>
          <Text style={styles.statLabel}>Items</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Icon name="dollar-sign" size={14} color={COLORS.text.secondary} />
          <Text style={styles.statValue}>{formatCurrency(batch.total_value || 0)}</Text>
          <Text style={styles.statLabel}>Value</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Icon name="tag" size={14} color={COLORS.text.secondary} />
          <Text style={styles.statValue}>{batch.category || 'Uncategorized'}</Text>
          <Text style={styles.statLabel}>Category</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.dateText}>Updated: {batch.updated_at ? formatDate(batch.updated_at) : 'Unknown'}</Text>
        <Icon name="chevron-right" size={16} color={COLORS.text.secondary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  batchNumber: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.white,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    lineHeight: 16,
    marginBottom: SPACING.sm,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border.light,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginTop: 2,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  dateText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
  },
});

export default BatchCard;
