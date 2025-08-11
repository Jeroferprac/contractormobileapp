import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';
import { Transaction } from '../../types/inventory';

interface RecentActivityCardProps {
  transaction: Transaction;
}

type TransactionMeta = {
  name: string;
  gradient: [string, string];
};

const getTransactionMeta = (type: string): TransactionMeta => {
  switch (type) {
    case 'stock_in':
      return { name: 'arrow-up', gradient: ['#28A745', '#5dd067'] };
    case 'stock_out':
      return { name: 'arrow-down', gradient: ['#DC3545', '#ff6b6b'] };
    case 'transfer':
      return { name: 'truck', gradient: ['#007BFF', '#5aa9ff'] };
    default:
      return { name: 'activity', gradient: ['#6C757D', '#adb5bd'] };
  }
};

// ✅ Now handles both string and number types
const getTransactionText = (type: string, quantity: string | number) => {
  const qty = quantity.toString();
  switch (type) {
    case 'stock_in':
      return `Restocked ${qty} units`;
    case 'stock_out':
      return `Sold ${qty} units`;
    case 'transfer':
      return `Transferred ${qty} units`;
    default:
      return `Updated ${qty} units`;
  }
};

const formatTimeAgo = (timestamp?: string) => {
  if (!timestamp) return 'Unknown time';

  const created = new Date(timestamp);
  const now = new Date();
  const diffInMs = now.getTime() - created.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

  if (isNaN(diffInHours)) return 'Invalid date';
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

const RecentActivityCard: React.FC<RecentActivityCardProps> = ({ transaction }) => {
  const {
    transaction_type = 'unknown',
    quantity = 0,
    created_at,
  } = transaction;

  const meta = getTransactionMeta(transaction_type);

  return (
    <View style={styles.container}>
      <LinearGradient colors={meta.gradient} style={styles.iconContainer}>
        <Icon name={meta.name} size={20} color="#fff" />
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.description}>
          {getTransactionText(transaction_type, quantity)}
        </Text>
        <Text style={styles.timestamp}>
          {formatTimeAgo(created_at)}
        </Text>
      </View>

      <View style={styles.quantityContainer}>
        <Text style={styles.quantity}>{quantity.toString()}</Text>
        <Text style={styles.quantityLabel}>units</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.md,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  timestamp: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
  quantityContainer: {
    alignItems: 'flex-end',
  },
  quantity: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  quantityLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
  },
});

export default memo(RecentActivityCard);
