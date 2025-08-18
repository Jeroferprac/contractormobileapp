import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { LinearGradient } from 'react-native-linear-gradient';
import { COLORS } from '../../../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../../../constants/spacing';
import { TYPOGRAPHY } from '../../../../constants/typography';
import { Transfer, Warehouse } from '../../../../types/inventory';

interface TransferReportCardProps {
  transfer: Transfer;
  warehouses: Warehouse[];
  onPress?: (transfer: Transfer) => void;
}

const TransferReportCard: React.FC<TransferReportCardProps> = ({
  transfer,
  warehouses,
  onPress,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [scaleValue] = useState(new Animated.Value(1));

  const handlePress = () => {
    // 3D transform animation
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onPress?.(transfer);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Get warehouse names by ID
  const getWarehouseName = (warehouseId: string) => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    return warehouse?.name || 'Unknown Warehouse';
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { 
          icon: 'clock', 
          color: COLORS.status.warning, 
          bgColor: COLORS.status.warning + '15',
          text: 'Pending'
        };
      case 'in_transit':
        return { 
          icon: 'truck', 
          color: COLORS.primary, 
          bgColor: COLORS.primary + '15',
          text: 'In Transit'
        };
      case 'completed':
        return { 
          icon: 'check-circle', 
          color: COLORS.status.success, 
          bgColor: COLORS.status.success + '15',
          text: 'Completed'
        };
      case 'cancelled':
        return { 
          icon: 'x-circle', 
          color: COLORS.status.error, 
          bgColor: COLORS.status.error + '15',
          text: 'Cancelled'
        };
      default:
        return { 
          icon: 'help-circle', 
          color: COLORS.text.secondary, 
          bgColor: COLORS.surface,
          text: status
        };
    }
  };

  const statusConfig = getStatusConfig(transfer.status);
  const totalItems = transfer.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const fromWarehouseName = getWarehouseName(transfer.from_warehouse_id);
  const toWarehouseName = getWarehouseName(transfer.to_warehouse_id);

  return (
    <Animated.View style={[styles.cardContainer, { transform: [{ scale: scaleValue }] }]}>
      <TouchableOpacity 
        onPress={handlePress}
        activeOpacity={1}
        style={styles.cardTouchable}
      >
        <LinearGradient
          colors={['#FFFFFF', '#F8F9FA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <View style={styles.titleSection}>
              <View style={styles.iconContainer}>
                <Icon name="truck" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>Transfer #{transfer.id.slice(0, 8)}</Text>
                <Text style={styles.subtitle}>
                  {fromWarehouseName} → {toWarehouseName}
                </Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                <Icon name={statusConfig.icon} size={12} color={statusConfig.color} style={styles.statusIcon} />
                <Text style={[styles.statusText, { color: statusConfig.color }]}>
                  {statusConfig.text}
                </Text>
              </View>
              <TouchableOpacity onPress={toggleExpand} style={styles.expandButton}>
                <Icon 
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.transferInfoRow}>
              <View style={styles.transferInfoItem}>
                <Icon name="package" size={16} color={COLORS.text.secondary} />
                <Text style={styles.transferInfoLabel}>Total Items</Text>
                <Text style={styles.transferInfoValue}>{totalItems}</Text>
              </View>
              
              <View style={styles.transferInfoItem}>
                <Icon name="calendar" size={16} color={COLORS.text.secondary} />
                <Text style={styles.transferInfoLabel}>Created</Text>
                <Text style={styles.transferInfoValue}>
                  {new Date(transfer.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>

            <View style={styles.transferInfoRow}>
              <View style={styles.transferInfoItem}>
                <Icon name="map-pin" size={16} color={COLORS.text.secondary} />
                <Text style={styles.transferInfoLabel}>From</Text>
                <Text style={styles.transferInfoValue} numberOfLines={1}>
                  {fromWarehouseName}
                </Text>
              </View>
              
              <View style={styles.transferInfoItem}>
                <Icon name="map-pin" size={16} color={COLORS.text.secondary} />
                <Text style={styles.transferInfoLabel}>To</Text>
                <Text style={styles.transferInfoValue} numberOfLines={1}>
                  {toWarehouseName}
                </Text>
              </View>
            </View>
          </View>

          {isExpanded && (
            <View style={styles.expandedContent}>
              <View style={styles.expandedHeader}>
                <Text style={styles.expandedTitle}>Transfer Details</Text>
              </View>
              
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Icon name="package" size={24} color={COLORS.primary} />
                  <Text style={styles.statValue}>{transfer.items?.length || 0}</Text>
                  <Text style={styles.statLabel}>Item Types</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Icon name="clock" size={24} color={COLORS.status.warning} />
                  <Text style={styles.statValue}>
                    {transfer.completed_at ? new Date(transfer.completed_at).toLocaleDateString() : 'Pending'}
                  </Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Icon name="user" size={24} color={COLORS.status.info} />
                  <Text style={styles.statValue}>{transfer.created_by || 'System'}</Text>
                  <Text style={styles.statLabel}>Created By</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Icon name="edit" size={24} color={COLORS.text.secondary} />
                  <Text style={styles.statValue}>
                    {new Date(transfer.updated_at).toLocaleDateString()}
                  </Text>
                  <Text style={styles.statLabel}>Last Updated</Text>
                </View>
              </View>

              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Icon name="hash" size={16} color={COLORS.text.secondary} />
                  <Text style={styles.detailLabel}>Transfer ID</Text>
                  <Text style={styles.detailValue}>{transfer.id}</Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Icon name="tag" size={16} color={COLORS.text.secondary} />
                  <Text style={styles.detailLabel}>Status</Text>
                  <Text style={styles.detailValue}>{transfer.status}</Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Icon name="package" size={16} color={COLORS.text.secondary} />
                  <Text style={styles.detailLabel}>Total Quantity</Text>
                  <Text style={styles.detailValue}>{totalItems}</Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Icon name="calendar" size={16} color={COLORS.text.secondary} />
                  <Text style={styles.detailLabel}>Created Date</Text>
                  <Text style={styles.detailValue}>
                    {new Date(transfer.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <View style={styles.warehouseDetails}>
                <View style={styles.detailItem}>
                  <Icon name="map-pin" size={16} color={COLORS.text.secondary} />
                  <Text style={styles.detailLabel}>From Warehouse</Text>
                  <Text style={styles.detailValue}>{fromWarehouseName}</Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Icon name="map-pin" size={16} color={COLORS.text.secondary} />
                  <Text style={styles.detailLabel}>To Warehouse</Text>
                  <Text style={styles.detailValue}>{toWarehouseName}</Text>
                </View>
              </View>

              {transfer.notes && (
                <View style={styles.notesSection}>
                  <Text style={styles.notesLabel}>Notes</Text>
                  <Text style={styles.notesText} numberOfLines={3}>
                    {transfer.notes}
                  </Text>
                </View>
              )}
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: COLORS.text.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  cardTouchable: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  cardGradient: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    backgroundColor: COLORS.surface,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.primary + '30',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statusIcon: {
    marginRight: 6,
  },
  statusText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  expandButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary + '15',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  cardContent: {
    padding: SPACING.lg,
    backgroundColor: '#FFFFFF',
  },
  transferInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  transferInfoItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  transferInfoLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  transferInfoValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginTop: 4,
    textAlign: 'center',
  },
  expandedContent: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
    backgroundColor: COLORS.surface,
  },
  expandedHeader: {
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  expandedTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    shadowColor: COLORS.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginTop: SPACING.sm,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '600',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  detailItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginLeft: SPACING.sm,
    flex: 1,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  warehouseDetails: {
    marginBottom: SPACING.lg,
  },
  notesSection: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  notesLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  notesText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
});

export default TransferReportCard;
