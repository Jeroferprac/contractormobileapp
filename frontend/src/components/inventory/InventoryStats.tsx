import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { StatsCard } from '../ui';
import { InventorySummary } from '../../types/inventory';
import { inventoryApiService } from '../../api/inventoryApi';
import LoadingSkeleton from '../ui/LoadingSkeleton';

const InventoryStats: React.FC = () => {
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await inventoryApiService.getSummary();
        setSummary(response.data);
      } catch (error) {
        console.error('Error fetching inventory summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.grid}>
          {Array.from({ length: 4 }).map((_, index) => (
            <View key={index} style={styles.cardWrapper}>
              <LoadingSkeleton height={120} borderRadius={16} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (!summary) return null;

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        <View style={styles.cardWrapper}>
          <StatsCard
            title="Total Products"
            value={summary.total_products?.toString() ?? '0'}
            icon="package"
            trend="up"
            trendValue="+6.7%"
            gradient="primary"
          />
        </View>
        <View style={styles.cardWrapper}>
          <StatsCard
            title="Low Stock"
            value={summary.low_stock_items?.toString() ?? '0'}
            icon="alert-triangle"
            trendValue="Needs Attn."
            gradient="warning"
          />
        </View>
        <View style={styles.cardWrapper}>
          <StatsCard
            title="Warehouses"
            value={summary.total_warehouses?.toString() ?? '0'}
            icon="warehouse"
            trend="up"
            trendValue="+3.9%"
            gradient="secondary"
          />
        </View>
        <View style={styles.cardWrapper}>
          <StatsCard
            title="Stock Value"
            value={
              summary.total_inventory_value !== undefined
                ? `€${(summary.total_inventory_value / 1000).toFixed(1)}K`
                : '€0.0K'
            }
            icon="dollar-sign"
            trend="up"
            trendValue="+12%"
            gradient="success"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  cardWrapper: {
    width: '45%',
    marginTop: SPACING.md,
  },
});

export default InventoryStats;
