import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { LinearGradient } from 'react-native-linear-gradient';
import { COLORS } from '../../../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../../../constants/spacing';
import { TYPOGRAPHY } from '../../../../constants/typography';
import { Warehouse } from '../../../../types/inventory';

interface WarehouseReportCardProps {
  warehouse: Warehouse;
  stockCount?: number;
  onPress?: (warehouse: Warehouse) => void;
}

const WarehouseReportCard: React.FC<WarehouseReportCardProps> = ({
  warehouse,
  stockCount = 0,
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

    onPress?.(warehouse);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

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
                <Icon name="building" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{warehouse.name}</Text>
                <Text style={styles.code}>{warehouse.code}</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <View style={[styles.statusBadge, warehouse.is_active ? styles.activeBadge : styles.inactiveBadge]}>
                <Icon 
                  name={warehouse.is_active ? "check-circle" : "x-circle"} 
                  size={12} 
                  color={warehouse.is_active ? COLORS.status.success : COLORS.status.error} 
                  style={styles.statusIcon} 
                />
                <Text style={styles.statusText}>
                  {warehouse.is_active ? 'Active' : 'Inactive'}
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
            <View style={styles.warehouseInfoRow}>
              <View style={styles.warehouseInfoItem}>
                <Icon name="map-pin" size={16} color={COLORS.text.secondary} />
                <Text style={styles.warehouseInfoLabel}>Location</Text>
                <Text style={styles.warehouseInfoValue} numberOfLines={1}>
                  {warehouse.address.split(',')[0]}
                </Text>
              </View>
              
              <View style={styles.warehouseInfoItem}>
                <Icon name="package" size={16} color={COLORS.text.secondary} />
                <Text style={styles.warehouseInfoLabel}>Stock Items</Text>
                <Text style={styles.warehouseInfoValue}>{stockCount}</Text>
              </View>
            </View>

            <View style={styles.warehouseInfoRow}>
              <View style={styles.warehouseInfoItem}>
                <Icon name="phone" size={16} color={COLORS.text.secondary} />
                <Text style={styles.warehouseInfoLabel}>Phone</Text>
                <Text style={styles.warehouseInfoValue}>
                  {warehouse.phone || 'No phone'}
                </Text>
              </View>
              
              <View style={styles.warehouseInfoItem}>
                <Icon name="mail" size={16} color={COLORS.text.secondary} />
                <Text style={styles.warehouseInfoLabel}>Email</Text>
                <Text style={styles.warehouseInfoValue} numberOfLines={1}>
                  {warehouse.email || 'No email'}
                </Text>
              </View>
            </View>
          </View>

          {isExpanded && (
            <View style={styles.expandedContent}>
              <View style={styles.expandedHeader}>
                <Text style={styles.expandedTitle}>Warehouse Details</Text>
              </View>
              
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Icon name="package" size={24} color={COLORS.primary} />
                  <Text style={styles.statValue}>{stockCount}</Text>
                  <Text style={styles.statLabel}>Stock Items</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Icon name="calendar" size={24} color={COLORS.status.warning} />
                  <Text style={styles.statValue}>
                    {new Date(warehouse.created_at).toLocaleDateString()}
                  </Text>
                  <Text style={styles.statLabel}>Created</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Icon name="user" size={24} color={COLORS.status.info} />
                  <Text style={styles.statValue}>{warehouse.contact_person}</Text>
                  <Text style={styles.statLabel}>Contact Person</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Icon name="map-pin" size={24} color={COLORS.text.secondary} />
                  <Text style={styles.statValue}>{warehouse.code}</Text>
                  <Text style={styles.statLabel}>Warehouse Code</Text>
                </View>
              </View>

              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Icon name="hash" size={16} color={COLORS.text.secondary} />
                  <Text style={styles.detailLabel}>Warehouse ID</Text>
                  <Text style={styles.detailValue}>{warehouse.id}</Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Icon name="tag" size={16} color={COLORS.text.secondary} />
                  <Text style={styles.detailLabel}>Status</Text>
                  <Text style={styles.detailValue}>{warehouse.is_active ? 'Active' : 'Inactive'}</Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Icon name="phone" size={16} color={COLORS.text.secondary} />
                  <Text style={styles.detailLabel}>Phone</Text>
                  <Text style={styles.detailValue}>{warehouse.phone || 'N/A'}</Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Icon name="mail" size={16} color={COLORS.text.secondary} />
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={styles.detailValue}>{warehouse.email || 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.addressSection}>
                <Text style={styles.addressLabel}>Full Address</Text>
                <Text style={styles.addressText}>
                  {warehouse.address}
                </Text>
              </View>
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
  code: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    fontFamily: 'monospace',
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
  activeBadge: {
    backgroundColor: COLORS.status.success + '15',
    borderColor: COLORS.status.success + '30',
  },
  inactiveBadge: {
    backgroundColor: COLORS.status.error + '15',
    borderColor: COLORS.status.error + '30',
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
  warehouseInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  warehouseInfoItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  warehouseInfoLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  warehouseInfoValue: {
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
  addressSection: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  addressLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  addressText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
});

export default WarehouseReportCard;
