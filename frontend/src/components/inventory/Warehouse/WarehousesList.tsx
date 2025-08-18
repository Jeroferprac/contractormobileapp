import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { ActivityIndicator } from 'react-native';

import { COLORS } from '../../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../../constants/spacing';
import { TYPOGRAPHY } from '../../../constants/typography';
import Feather from 'react-native-vector-icons/Feather';
import { inventoryApiService } from '../../../api/inventoryApi';
import { Warehouse as WarehouseType } from '../../../types/inventory';

// Extended warehouse interface with UI-specific properties
interface WarehouseWithCapacity extends WarehouseType {
  capacity?: number;
  used?: number;
  location?: string;
}

interface WarehousesListProps {
  /**
   * Optional array of warehouse data to display
   */
  warehouses?: WarehouseWithCapacity[];
  
  /**
   * Optional function called when a warehouse card is pressed
   */
  onWarehousePress?: (warehouse: WarehouseWithCapacity) => void;
}

/**
 * A horizontal scrolling list of warehouses with glassmorphism card design
 */
const WarehousesList: React.FC<WarehousesListProps> = ({ warehouses: propWarehouses, onWarehousePress }) => {
  const [warehouses, setWarehouses] = useState<WarehouseWithCapacity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propWarehouses && propWarehouses.length > 0) {
      // Use provided warehouses if available
      setWarehouses(propWarehouses);
      setLoading(false);
    } else {
      // Otherwise fetch from API
      fetchWarehouses();
    }
  }, [propWarehouses]);

  const fetchWarehouses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryApiService.getWarehouses();
      
      // Transform API data to include UI-specific properties
      const enhancedWarehouses = response.data.map(warehouse => ({
        ...warehouse,
        location: warehouse.address,
        // Generate mock capacity data for UI display
        capacity: Math.floor(Math.random() * 15000) + 5000,
        used: Math.floor(Math.random() * 10000) + 1000
      }));
      
      setWarehouses(enhancedWarehouses);
    } catch (err) {
      console.error('Error fetching warehouses:', err);
      setError('Failed to load warehouse data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate usage percentage for each warehouse
  const getUsagePercentage = (used: number, capacity: number) => {
    return Math.round((used / capacity) * 100);
  };

  // Determine color based on usage percentage
  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return COLORS.status.error;
    if (percentage >= 70) return COLORS.status.warning;
    return COLORS.status.success;
  };

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading warehouses...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchWarehouses}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : warehouses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No warehouses available</Text>
        </View>
      ) : (
        warehouses.map((warehouse) => {
        const usagePercentage = getUsagePercentage(warehouse.used, warehouse.capacity);
        const usageColor = getUsageColor(usagePercentage);
        
        return (
          <TouchableOpacity 
            key={warehouse.id} 
            style={styles.cardContainer}
            onPress={() => onWarehousePress && onWarehousePress(warehouse)}
            activeOpacity={0.8}
          >
            <View
              style={styles.blurCard}
            >
              <View style={styles.cardContent}>
                <View style={styles.headerContainer}>
                  <Feather name="home" size={16} color={COLORS.primary} style={styles.warehouseIcon} />
                  <Text style={styles.warehouseName} numberOfLines={1}>{warehouse.name}</Text>
                </View>
                
                <Text style={styles.locationText} numberOfLines={1}>
                  <Feather name="map-pin" size={12} color={COLORS.text.secondary} /> {warehouse.location}
                </Text>
                
                <View style={styles.capacityContainer}>
                  <View style={styles.capacityLabelContainer}>
                    <Text style={styles.capacityLabel}>Capacity</Text>
                    <Text style={styles.capacityValue}>
                      {warehouse.used.toLocaleString()} / {warehouse.capacity.toLocaleString()}
                    </Text>
                  </View>
                  
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBackground}>
                      <View 
                        style={[
                          styles.progressBarFill, 
                          { 
                            width: `${usagePercentage}%`,
                            backgroundColor: usageColor
                          }
                        ]} 
                      />
                    </View>
                    <Text style={[styles.percentageText, { color: usageColor }]}>{usagePercentage}%</Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        );
      }))
      }
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: SPACING.sm,
  },
  cardContainer: {
    width: 200,
    height: 160,
    marginRight: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  blurCard: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  cardContent: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  warehouseIcon: {
    marginRight: SPACING.xs,
  },
  warehouseName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    color: COLORS.text.primary,
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  locationText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  capacityContainer: {
    marginTop: SPACING.xs,
  },
  capacityLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  capacityLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  capacityValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '500',
    color: COLORS.text.primary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: COLORS.border.light,
    borderRadius: BORDER_RADIUS.round,
    flex: 1,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.xxl,
  },
  percentageText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    marginLeft: SPACING.xs,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  loadingContainer: {
    width: 200,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.sm,
  },
  loadingText: {
    marginTop: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  errorContainer: {
    width: 200,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.sm,
    padding: SPACING.sm,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.status.error,
    marginBottom: SPACING.sm,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  retryButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  retryButtonText: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  emptyContainer: {
    width: 200,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.sm,
    padding: SPACING.sm,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
});

export default WarehousesList;
