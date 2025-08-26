import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: () => void;
  onClear?: () => void;
  filterStatus?: string;
  setFilterStatus?: (status: string) => void;
  selectedWarehouse?: string;
  setSelectedWarehouse?: (warehouse: string) => void;
  dateRange?: { start: string; end: string };
  setDateRange?: (range: { start: string; end: string }) => void;
  warehouses?: any[];
  getWarehouseName?: (id: string) => string;
  filteredTransfersCount?: number;
  getActiveFilterCount?: () => number;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  onClear,
  filterStatus = 'all',
  setFilterStatus,
  selectedWarehouse = 'all',
  setSelectedWarehouse,
  dateRange = { start: '', end: '' },
  setDateRange,
  warehouses = [],
  getWarehouseName,
  filteredTransfersCount = 0,
  getActiveFilterCount = () => 0,
}) => {
  const [localFilterStatus, setLocalFilterStatus] = useState(filterStatus);
  const [localSelectedWarehouse, setLocalSelectedWarehouse] = useState(selectedWarehouse);
  const [localDateRange, setLocalDateRange] = useState(dateRange);

  const handleApply = () => {
    if (setFilterStatus) setFilterStatus(localFilterStatus);
    if (setSelectedWarehouse) setSelectedWarehouse(localSelectedWarehouse);
    if (setDateRange) setDateRange(localDateRange);
    onApply();
  };

  const handleReset = () => {
    setLocalFilterStatus('all');
    setLocalSelectedWarehouse('all');
    setLocalDateRange({ start: '', end: '' });
    if (onClear) onClear();
  };

  const statusOptions = [
    { key: 'all', label: 'All Status' },
    { key: 'pending', label: 'Pending' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const renderOptionGroup = (
    title: string,
    options: Array<{ key: string; label: string }>,
    currentValue: string,
    onSelect: (value: string) => void
  ) => (
    <View style={styles.optionGroup}>
      <Text style={styles.optionGroupTitle}>{title}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.optionButton,
              currentValue === option.key && styles.optionButtonActive,
            ]}
            onPress={() => onSelect(option.key)}
          >
            <Text
              style={[
                styles.optionText,
                currentValue === option.key && styles.optionTextActive,
              ]}
            >
              {option.label}
            </Text>
            {currentValue === option.key && (
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
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <LinearGradient
            colors={[COLORS.gradient.primary[0], COLORS.gradient.primary[1]]}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon name="x" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Filter Options</Text>
              <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Filter Options */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {renderOptionGroup(
              'Status',
              statusOptions,
              localFilterStatus,
              setLocalFilterStatus
            )}

            {/* Warehouse Selection */}
            {warehouses.length > 0 && (
              <View style={styles.optionGroup}>
                <Text style={styles.optionGroupTitle}>Warehouse</Text>
                <View style={styles.optionsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      localSelectedWarehouse === 'all' && styles.optionButtonActive,
                    ]}
                    onPress={() => setLocalSelectedWarehouse('all')}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        localSelectedWarehouse === 'all' && styles.optionTextActive,
                      ]}
                    >
                      All Warehouses
                    </Text>
                    {localSelectedWarehouse === 'all' && (
                      <Icon name="check" size={16} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                  {warehouses.map((warehouse) => (
                    <TouchableOpacity
                      key={warehouse.id}
                      style={[
                        styles.optionButton,
                        localSelectedWarehouse === warehouse.id && styles.optionButtonActive,
                      ]}
                      onPress={() => setLocalSelectedWarehouse(warehouse.id)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          localSelectedWarehouse === warehouse.id && styles.optionTextActive,
                        ]}
                      >
                        {warehouse.name}
                      </Text>
                      {localSelectedWarehouse === warehouse.id && (
                        <Icon name="check" size={16} color={COLORS.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Results Count */}
            <View style={styles.resultsContainer}>
              <Text style={styles.resultsText}>
                {filteredTransfersCount} results found
              </Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay.dark,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '60%',
  },
  header: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.light,
    textAlign: 'center',
  },
  resetButton: {
    padding: 8,
  },
  resetButtonText: {
    fontSize: 16,
    color: COLORS.text.light,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  optionGroup: {
    marginBottom: 24,
  },
  optionGroupTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  optionsContainer: {
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.medium,
  },
  optionButtonActive: {
    backgroundColor: COLORS.primary + '10',
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  optionTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  resultsContainer: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
    marginTop: 16,
  },
  resultsText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.medium,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  applyButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.light,
  },
});

export default FilterModal;
