import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';
import { Supplier } from '../../types/inventory';

interface SupplierCardProps {
  supplier: Supplier;
  onPress: (supplier: Supplier) => void;
}

const SupplierCard: React.FC<SupplierCardProps> = ({ supplier, onPress }) => {
  const getStatusColor = (isActive: boolean) => {
    return isActive ? COLORS.status.success : COLORS.status.error;
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Active' : 'Inactive';
  };

  const getSupplierCardColors = () => {
    const colorSchemes = [
      [COLORS.card, COLORS.surface, '#F8F9FA'],
      [COLORS.card, '#FFF8E1', '#FFF3E0'],
      [COLORS.card, '#E8F5E8', '#E0F2E0'],
      [COLORS.card, '#FFF3E0', '#FFE0B2'],
      [COLORS.card, '#E3F2FD', '#BBDEFB'],
      [COLORS.card, '#F3E5F5', '#E1BEE7'],
    ];
    // Use supplier ID to get consistent colors for each supplier
    const index = parseInt(supplier.id) % colorSchemes.length;
    return colorSchemes[index];
  };

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.9}
      onPress={() => onPress(supplier)}
    >
      <LinearGradient
        colors={getSupplierCardColors()}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Card Header with Status and Actions */}
        <View style={styles.header}>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(supplier.is_active) }
              ]}
            />
            <Text style={styles.statusText}>
              {getStatusText(supplier.is_active)}
            </Text>
          </View>
                     <View style={styles.iconContainer}>
             <Icon name="business" size={20} color={COLORS.primary} />
           </View>
        </View>

        {/* Supplier Name with Enhanced Styling */}
        <View style={styles.supplierNameContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {supplier.name}
          </Text>
                     <View style={styles.supplierBadge}>
             <Icon name="verified" size={12} color={COLORS.status.verified} />
             <Text style={styles.supplierBadgeText}>Verified</Text>
           </View>
        </View>

        {/* Contact Information Grid */}
        <View style={styles.contactGrid}>
          <View style={styles.contactItem}>
                         <View style={styles.iconWrapper}>
               <Icon name="person" size={14} color={COLORS.primary} />
             </View>
            <View style={styles.contactTextContainer}>
              <Text style={styles.contactLabel}>Contact</Text>
              <Text style={styles.contactText} numberOfLines={1}>{supplier.contact_person}</Text>
            </View>
          </View>

          <View style={styles.contactItem}>
                         <View style={styles.iconWrapper}>
               <Icon name="email" size={14} color={COLORS.status.info} />
             </View>
            <View style={styles.contactTextContainer}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactText} numberOfLines={1}>{supplier.email}</Text>
            </View>
          </View>

          <View style={styles.contactItem}>
                         <View style={styles.iconWrapper}>
               <Icon name="phone" size={14} color={COLORS.status.success} />
             </View>
            <View style={styles.contactTextContainer}>
              <Text style={styles.contactLabel}>Phone</Text>
              <Text style={styles.contactText} numberOfLines={1}>{supplier.phone}</Text>
            </View>
          </View>
        </View>

        {/* Additional Info Row */}
        <View style={styles.additionalInfoRow}>
          {supplier.tax_number && (
                         <View style={styles.infoChip}>
               <Icon name="receipt" size={12} color={COLORS.status.warning} />
               <Text style={styles.infoChipText}>Tax: {supplier.tax_number}</Text>
             </View>
          )}
          {supplier.credit_limit && (
                         <View style={styles.infoChip}>
               <Icon name="account-balance-wallet" size={12} color={COLORS.status.success} />
               <Text style={styles.infoChipText}>€{supplier.credit_limit.toLocaleString()}</Text>
             </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    marginRight: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  card: {
    padding: SPACING.md,
    height: 220,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  statusText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#374151',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  supplierNameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  name: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#1F2937',
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.05)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  supplierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    gap: 2,
  },
  supplierBadgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.status.verified,
  },
  contactGrid: {
    gap: SPACING.xs,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  iconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    ...SHADOWS.sm,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#6B7280',
    fontWeight: TYPOGRAPHY.weights.medium,
    marginBottom: 1,
  },
  contactText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#1F2937',
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  additionalInfoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    gap: 2,
  },
  infoChipText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#374151',
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});

export default SupplierCard;
