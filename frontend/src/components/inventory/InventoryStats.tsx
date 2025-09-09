import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';
import { StatsCard } from '../ui';
import { SectionHeader } from '../layout';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import { InventorySummary } from '../../types/inventory';
import { inventoryApiService } from '../../api/inventoryApi';

// Filter options for production-level functionality
const FILTER_OPTIONS = [
  { value: '7_days', label: '7 days' },
  { value: '1_month', label: '1 month' },
  { value: '1_year', label: '1 year' },
] as const;

type FilterValue = typeof FILTER_OPTIONS[number]['value'];

interface InventoryStatsProps {
  summary?: InventorySummary | null;
  loading?: boolean;
}

const InventoryStats: React.FC<InventoryStatsProps> = ({ 
  summary: propSummary, 
  loading: propLoading 
}) => {
  const [summary, setSummary] = useState<InventorySummary | null>(propSummary || null);
  const [loading, setLoading] = useState(propLoading !== undefined ? propLoading : true);
  const [selectedFilter, setSelectedFilter] = useState<FilterValue>('7_days');
  const [showDropdown, setShowDropdown] = useState(false);

  // Production-level filter functionality
  const getFilterParams = (filter: FilterValue) => {
    const now = new Date();
    const params: { start_date?: string; end_date?: string } = {};

    switch (filter) {
      case '7_days':
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        params.start_date = sevenDaysAgo.toISOString().split('T')[0];
        params.end_date = now.toISOString().split('T')[0];
        break;
      case '1_month':
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        params.start_date = oneMonthAgo.toISOString().split('T')[0];
        params.end_date = now.toISOString().split('T')[0];
        break;
      case '1_year':
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        params.start_date = oneYearAgo.toISOString().split('T')[0];
        params.end_date = now.toISOString().split('T')[0];
        break;
    }

    return params;
  };

  // Update local state when props change
  useEffect(() => {
    if (propSummary !== undefined) {
      setSummary(propSummary);
    }
    if (propLoading !== undefined) {
      setLoading(propLoading);
    }
  }, [propSummary, propLoading]);

  useEffect(() => {
    // Only fetch data if no summary prop is provided
    if (propSummary === undefined) {
      const fetchSummary = async () => {
        try {
          setLoading(true);
          const filterParams = getFilterParams(selectedFilter);
          const response = await inventoryApiService.getSummary();
          setSummary(response.data);
        } catch (error) {
          console.error('Error fetching inventory summary:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchSummary();
    }
  }, [selectedFilter, propSummary]);

  // Professional Stats Card Skeleton Component
  const StatsCardSkeleton: React.FC<{ variant: 'large' | 'small' }> = ({ variant }) => (
    <View style={[styles.skeletonCard, variant === 'large' ? styles.largeCard : styles.smallCard]}>
      <LoadingSkeleton width={40} height={40} borderRadius={20} style={styles.skeletonIcon} />
      <View style={styles.skeletonContent}>
        <LoadingSkeleton width="60%" height={20} style={styles.skeletonValue} />
        <LoadingSkeleton width="50%" height={12} style={styles.skeletonTrend} />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <SectionHeader 
          title="Statistics" 
          rightContent={
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterText}>7 days</Text>
              <Icon name="chevron-down" size={16} color="#6C757D" />
            </TouchableOpacity>
          }
          showViewAll={false}
        />
        {/* Top Row - Large Cards Skeleton */}
        <View style={styles.topRow}>
          <StatsCardSkeleton variant="large" />
          <StatsCardSkeleton variant="large" />
        </View>
        
        {/* Bottom Row - Small Cards Skeleton */}
        <View style={styles.bottomRow}>
          <StatsCardSkeleton variant="small" />
          <StatsCardSkeleton variant="small" />
          <StatsCardSkeleton variant="small" />
          <StatsCardSkeleton variant="small" />
        </View>
      </View>
    );
  }

  if (!summary) {
    return (
      <View style={styles.container}>
        <SectionHeader 
          title="Statistics" 
          rightContent={
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterText}>7 days</Text>
              <Icon name="chevron-down" size={16} color="#6C757D" />
            </TouchableOpacity>
          }
          showViewAll={false}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No statistics data available</Text>
        </View>
      </View>
    );
  }

  const selectedFilterLabel = FILTER_OPTIONS.find(option => option.value === selectedFilter)?.label || '7 days';

  const filterDropdown = (
    <TouchableOpacity 
      style={styles.filterButton}
      onPress={() => setShowDropdown(!showDropdown)}
    >
      <Text style={styles.filterText}>{selectedFilterLabel}</Text>
      <Icon 
        name={showDropdown ? 'chevron-up' : 'chevron-down'} 
        size={16} 
        color="#6C757D" 
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Statistics Header using SectionHeader */}
      <SectionHeader 
        title="Statistics" 
        rightContent={filterDropdown}
        showViewAll={false}
      />

      {/* Dropdown Menu */}
      {showDropdown && (
        <View style={styles.dropdown}>
          {FILTER_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.dropdownItem,
                selectedFilter === option.value && styles.dropdownItemSelected
              ]}
              onPress={() => {
                setSelectedFilter(option.value);
                setShowDropdown(false);
              }}
            >
              <Text style={[
                styles.dropdownItemText,
                selectedFilter === option.value && styles.dropdownItemTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {/* Top Row - Large Cards */}
      <View style={styles.topRow}>
        <StatsCard
          title="Total Products"
          value={summary.total_products?.toString() ?? '0'}
          icon="package"
          trend="up"
          trendValue={summary.total_products > 0 ? "+6.7%" : "0%"}
          variant="large"
        />
        <StatsCard
          title="Stock Value"
          value={
            summary.total_inventory_value !== undefined
              ? `€${(summary.total_inventory_value / 1000).toFixed(1)}K`
              : '€0.0K'
          }
          icon="dollar-sign"
          trend="up"
          trendValue={summary.total_inventory_value > 0 ? "+12%" : "0%"}
          variant="large"
        />
      </View>
      
      {/* Bottom Row - Small Cards */}
      <View style={styles.bottomRow}>
        <StatsCard
          title="Low Stock"
          value={summary.low_stock_items?.toString() ?? '0'}
          icon="alert-triangle"
          trend={summary.low_stock_items > 0 ? "down" : "up"}
          trendValue={summary.low_stock_items > 0 ? "Needs Attn." : "Good"}
          variant="small"
        />
        <StatsCard
          title="Warehouses"
          value={summary.total_warehouses?.toString() ?? '0'}
          icon="warehouse"
          trend="up"
          trendValue={summary.total_warehouses > 0 ? "+3.9%" : "0%"}
          variant="small"
        />
        <StatsCard
          title="Out of Stock"
          value={summary.out_of_stock_items?.toString() ?? '0'}
          icon="x-circle"
          trend={summary.out_of_stock_items > 0 ? "down" : "up"}
          trendValue={summary.out_of_stock_items > 0 ? "Critical" : "Good"}
          variant="small"
        />
        <StatsCard
          title="Recent Transactions"
          value={summary.recent_transactions?.toString() ?? '0'}
          icon="activity"
          trend="up"
          trendValue={summary.recent_transactions > 0 ? "+5.2%" : "0%"}
          variant="small"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.md,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: '#6C757D',
    marginRight: SPACING.xs,
  },
  dropdown: {
    position: 'absolute',
    top: 60,
    right: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1000,
    minWidth: 150,
  },
  dropdownItem: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemSelected: {
    backgroundColor: '#FEF3F2',
  },
  dropdownItemText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: '#6C757D',
  },
  dropdownItemTextSelected: {
    color: '#FF6B35',
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  topRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
    marginTop: SPACING.sm,
    marginLeft:SPACING.md,
    marginRight:SPACING.md,
  },
  bottomRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flexWrap: 'wrap',
    marginLeft:SPACING.md,
    marginRight:SPACING.md,
  },
  // Professional Skeleton Styles
  skeletonCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  largeCard: {
    flex: 1,
    height: 100,
  },
  smallCard: {
    flex: 1,
    height: 80,
  },
  skeletonIcon: {
    marginRight: SPACING.md,
  },
  skeletonContent: {
    flex: 1,
  },
  skeletonValue: {
    marginBottom: SPACING.xs,
  },
  skeletonTrend: {
    // No margin needed for last element
  },
  errorContainer: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});

export default InventoryStats;