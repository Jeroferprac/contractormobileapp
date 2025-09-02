import React from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
import { COLORS } from '../../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../../constants/spacing';
import { TYPOGRAPHY } from '../../../constants/typography';
import { Warehouse } from '../../../types/inventory';
import WarehouseCard from './WarehouseCard';

interface WarehouseListProps {
  warehouses: (Warehouse & {
    imageUrl?: string;
    totalItems?: number;
    totalQuantity?: number;
    utilization?: number;
  })[];
  onWarehousePress?: (warehouse: Warehouse) => void;
  onViewAllPress?: () => void;
  loading?: boolean;
}

const WarehouseList: React.FC<WarehouseListProps> = ({
  warehouses,
  onWarehousePress,
  onViewAllPress,
  loading = false
}) => {
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Warehouses</Text>
          {onViewAllPress && (
            <TouchableOpacity onPress={onViewAllPress} style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          )}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {[1, 2, 3].map((item) => (
            <View key={item} style={styles.loadingCard}>
              <View style={styles.loadingShimmer} />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  if (!warehouses || warehouses.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Warehouses</Text>
          {onViewAllPress && (
            <TouchableOpacity onPress={onViewAllPress} style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No warehouses available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Warehouses</Text>
        {onViewAllPress && (
          <TouchableOpacity onPress={onViewAllPress} style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {warehouses.map((warehouse, index) => (
          <WarehouseCard
            key={warehouse.id || index}
            warehouse={warehouse}
            onPress={onWarehousePress}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    color: COLORS.text.primary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  viewAllButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.xxl,
    backgroundColor: COLORS.primary,
  },
  viewAllText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  loadingCard: {
    width: 280,
    height: 180,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surface,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    overflow: 'hidden',
  },
  loadingShimmer: {
    flex: 1,
    backgroundColor: COLORS.border.light,
    opacity: 0.3,
  },
  emptyContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.secondary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
});

export default WarehouseList;
