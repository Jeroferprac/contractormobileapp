import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../../constants/spacing';
import { TYPOGRAPHY } from '../../../constants/typography';
import { Transfer } from '../../../types/inventory';

interface TransferCardProps {
  transfer: Transfer;
  onPress: (transfer: Transfer) => void;
  getWarehouseName: (id: string) => string;
  getProductName: (id: string) => string;
  getStatusColor: (status: string) => string;
  formatDate: (dateString: string) => string;
  getTransferTotal: (transfer: Transfer) => number;
}

const TransferCard: React.FC<TransferCardProps> = ({
  transfer,
  onPress,
  getWarehouseName,
  getProductName,
  getStatusColor,
  formatDate,
  getTransferTotal,
}) => {
  const fromWarehouse = getWarehouseName(transfer.from_warehouse_id);
  const toWarehouse = getWarehouseName(transfer.to_warehouse_id);
  const totalQuantity = getTransferTotal(transfer);

  return (
    <TouchableOpacity
      style={styles.transactionCard}
      onPress={() => onPress(transfer)}
      activeOpacity={0.7}
    >
      <View style={styles.transactionCardContent}>
        <View style={styles.transactionCardLeft}>
          <View style={[styles.transactionIcon, { backgroundColor: `${getStatusColor(transfer.status)}20` }]}>
            <Icon name="truck" size={24} color={getStatusColor(transfer.status)} />
          </View>
        </View>

        <View style={styles.transactionCardCenter}>
          <Text style={styles.transactionTitle} numberOfLines={1}>
            {fromWarehouse} → {toWarehouse}
          </Text>
          <Text style={styles.transactionSubtitle}>
            {transfer.items.length} items • {formatDate(transfer.created_at)}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(transfer.status) }]}>
            <Text style={styles.statusText}>
              {transfer.status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.transactionCardRight}>
          <Text style={styles.transactionAmount}>{totalQuantity}</Text>
          <Text style={styles.transactionAmountLabel}>units</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  transactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  transactionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionCardLeft: {
    marginRight: SPACING.md,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionCardCenter: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
  transactionSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  transactionCardRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  transactionAmountLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
  },
});

export default TransferCard;
