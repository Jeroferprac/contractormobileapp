import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../../../constants/spacing';
import { TYPOGRAPHY } from '../../../../constants/typography';

interface FilterModalProps {
  visible: boolean;
  filters: {
    stockLevel: string;
    category: string;
    warehouse: string;
  };
  onClose: () => void;
  onApply: (filters: any) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  filters,
  onClose,
  onApply,
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const stockLevelOptions = [
    { value: 'all', label: 'All Levels' },
    { value: 'critical', label: 'Critical (< 5)' },
    { value: 'low', label: 'Low Stock' },
    { value: 'medium', label: 'Medium Stock' },
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'food', label: 'Food & Beverages' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'furniture', label: 'Furniture' },
  ];

  const warehouseOptions = [
    { value: 'all', label: 'All Warehouses' },
    { value: 'main', label: 'Main Warehouse' },
    { value: 'north', label: 'North Branch' },
    { value: 'south', label: 'South Branch' },
    { value: 'east', label: 'East Branch' },
  ];

  const handleFilterChange = (type: string, value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleApply = () => {
    onApply(localFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      stockLevel: 'all',
      category: 'all',
      warehouse: 'all',
    };
    setLocalFilters(resetFilters);
    onApply(resetFilters);
  };

  const renderFilterSection = (
    title: string,
    options: { value: string; label: string }[],
    filterType: string,
    currentValue: string
  ) => (
    <View style={styles.filterSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionButton,
              currentValue === option.value && styles.optionButtonActive,
            ]}
            onPress={() => handleFilterChange(filterType, option.value)}
          >
            <Text
              style={[
                styles.optionText,
                currentValue === option.value && styles.optionTextActive,
              ]}
            >
              {option.label}
            </Text>
            {currentValue === option.value && (
              <Icon name="check" size={16} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Filter Low Stock Items</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon name="x" size={24} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </View>

            {/* Filter Options */}
            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {renderFilterSection(
                'Stock Level',
                stockLevelOptions,
                'stockLevel',
                localFilters.stockLevel
              )}

              {renderFilterSection(
                'Category',
                categoryOptions,
                'category',
                localFilters.category
              )}

              {renderFilterSection(
                'Warehouse',
                warehouseOptions,
                'warehouse',
                localFilters.warehouse
              )}
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '85%',
    ...SHADOWS.lg,
  },
  modalContent: {
    padding: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    ...SHADOWS.sm,
  },
  scrollContent: {
    maxHeight: 500,
    paddingBottom: SPACING.lg,
  },
  filterSection: {
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    backgroundColor: COLORS.background,
    minWidth: 120,
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  optionButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    ...SHADOWS.md,
  },
  optionText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
    gap: SPACING.lg,
  },
  resetButton: {
    flex: 1,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    alignItems: 'center',
    backgroundColor: COLORS.background,
    ...SHADOWS.sm,
  },
  resetButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  applyButton: {
    flex: 1,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  applyButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default FilterModal;
