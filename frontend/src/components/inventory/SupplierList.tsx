import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';
import { Supplier } from '../../types/inventory';
import SupplierCard from './SupplierCard';
import ViewAllCard from './ViewAllCard';

interface SupplierListProps {
  suppliers: Supplier[];
  onPressSupplier: (supplier: Supplier) => void;
  onViewAll: () => void;
  loading?: boolean;
}

const SupplierList: React.FC<SupplierListProps> = ({
  suppliers,
  onPressSupplier,
  onViewAll,
  loading = false,
}) => {
  if (loading) {
    return (
      <View style={styles.container}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {[...Array(4)].map((_, index) => (
            <View key={index} style={styles.skeletonCard}>
              <View style={styles.skeletonHeader} />
              <View style={styles.skeletonContent} />
              <View style={styles.skeletonFooter} />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  if (!suppliers || suppliers.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="business" size={48} color={COLORS.text.tertiary} />
        <Text style={styles.emptyTitle}>No Suppliers</Text>
        <Text style={styles.emptySubtitle}>
          Add your first supplier to get started
        </Text>
        <TouchableOpacity style={styles.addButton} onPress={onViewAll}>
          <Icon name="add" size={20} color={COLORS.text.light} />
          <Text style={styles.addButtonText}>Add Supplier</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {suppliers.slice(0, 4).map((supplier) => (
          <SupplierCard
            key={supplier.id}
            supplier={supplier}
            onPress={onPressSupplier}
          />
        ))}
        
        {suppliers.length > 4 && (
          <ViewAllCard onPress={onViewAll} />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.sm,
  },
  scrollContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  skeletonCard: {
    width: 280,
    height: 200,
    marginRight: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  skeletonHeader: {
    height: 20,
    backgroundColor: COLORS.border.light,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  skeletonContent: {
    flex: 1,
    backgroundColor: COLORS.border.light,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  skeletonFooter: {
    height: 30,
    backgroundColor: COLORS.border.light,
    borderRadius: BORDER_RADIUS.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  addButtonText: {
    color: COLORS.text.light,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginLeft: SPACING.xs,
  },
});

export default SupplierList;
