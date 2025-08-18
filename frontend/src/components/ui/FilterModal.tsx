import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Modal,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';
import { TYPOGRAPHY, TEXT_STYLES } from '../../constants/typography';
import { TransferStatus, Warehouse } from '../../types/inventory';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: () => void;
  onClear: () => void;
  filterStatus: TransferStatus | 'all';
  setFilterStatus: (status: TransferStatus | 'all') => void;
  selectedWarehouse: string;
  setSelectedWarehouse: (warehouse: string) => void;
  dateRange: { start: string; end: string };
  setDateRange: (range: { start: string; end: string }) => void;
  warehouses: Warehouse[];
  getWarehouseName: (id: string) => string;
  filteredTransfersCount: number;
  getActiveFilterCount: () => number;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  onClear,
  filterStatus,
  setFilterStatus,
  selectedWarehouse,
  setSelectedWarehouse,
  dateRange,
  setDateRange,
  warehouses,
  getWarehouseName,
  filteredTransfersCount,
  getActiveFilterCount,
}) => {
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showWarehousePicker, setShowWarehousePicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      const newDateRange = { ...dateRange, start: selectedDate.toISOString().split('T')[0] };
      setDateRange(newDateRange);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
      const newDateRange = { ...dateRange, end: selectedDate.toISOString().split('T')[0] };
      setDateRange(newDateRange);
    }
  };

  const handleQuickDateFilter = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    setDateRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    });
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>Filter Transfers</Text>
                {activeFilterCount > 0 && (
                  <View style={styles.activeFilterBadge}>
                    <Text style={styles.activeFilterBadgeText}>{activeFilterCount}</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                <Icon name="x" size={20} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Status Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Status</Text>
                <View style={styles.filterChipsContainer}>
                  {['all', 'pending', 'in_transit', 'completed', 'cancelled'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[styles.filterChip, filterStatus === status && styles.filterChipActive]}
                      onPress={() => setFilterStatus(status as TransferStatus | 'all')}
                    >
                      <Text style={[styles.filterChipText, filterStatus === status && styles.filterChipTextActive]}>
                        {status === 'all' ? 'All' : status.replace('_', ' ').toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Warehouse Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Warehouse</Text>
                <View style={styles.dropdownContainer}>
                  <TouchableOpacity
                    style={[styles.dropdownButton, selectedWarehouse !== 'all' && styles.dropdownButtonActive]}
                    onPress={() => setShowWarehousePicker(true)}
                  >
                    <Text style={[styles.dropdownButtonText, selectedWarehouse !== 'all' && styles.dropdownButtonTextActive]}>
                      {selectedWarehouse === 'all' ? 'All Warehouses' : getWarehouseName(selectedWarehouse)}
                    </Text>
                    <Icon name="chevron-down" size={16} color={selectedWarehouse !== 'all' ? COLORS.primary : COLORS.text.secondary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Quick Date Filters */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Quick Filters</Text>
                <View style={styles.filterChipsContainer}>
                  {[
                    { label: '7 Days', days: 7 },
                    { label: '30 Days', days: 30 },
                    { label: '7 Months', days: 210 }
                  ].map((filter) => (
                    <TouchableOpacity
                      key={filter.label}
                      style={styles.quickFilterChip}
                      onPress={() => handleQuickDateFilter(filter.days)}
                    >
                      <Text style={styles.quickFilterChipText}>{filter.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Date Range Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Custom Date Range</Text>
                <View style={styles.dateRangeContainer}>
                  <TouchableOpacity
                    style={[styles.dateInput, dateRange.start && styles.dateInputActive]}
                    onPress={() => {
                      setStartDate(new Date());
                      setShowStartDatePicker(true);
                    }}
                  >
                    <Text style={[styles.dateInputText, dateRange.start && styles.dateInputTextActive]}>
                      {dateRange.start ? formatDateForDisplay(new Date(dateRange.start)) : 'Start Date'}
                    </Text>
                    <Icon name="calendar" size={14} color={dateRange.start ? COLORS.primary : COLORS.text.secondary} />
                  </TouchableOpacity>
                  <Text style={styles.dateRangeSeparator}>to</Text>
                  <TouchableOpacity
                    style={[styles.dateInput, dateRange.end && styles.dateInputActive]}
                    onPress={() => {
                      setEndDate(new Date());
                      setShowEndDatePicker(true);
                    }}
                  >
                    <Text style={[styles.dateInputText, dateRange.end && styles.dateInputTextActive]}>
                      {dateRange.end ? formatDateForDisplay(new Date(dateRange.end)) : 'End Date'}
                    </Text>
                    <Icon name="calendar" size={14} color={dateRange.end ? COLORS.primary : COLORS.text.secondary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Filter Summary */}
              {activeFilterCount > 0 && (
                <View style={styles.filterSummary}>
                  <Text style={styles.filterSummaryTitle}>Active Filters:</Text>
                  <View style={styles.filterSummaryItems}>
                    {filterStatus !== 'all' && (
                      <View style={styles.filterSummaryItem}>
                        <Text style={styles.filterSummaryText}>Status: {filterStatus.replace('_', ' ').toUpperCase()}</Text>
                        <TouchableOpacity onPress={() => setFilterStatus('all')}>
                          <Icon name="x" size={12} color={COLORS.text.secondary} />
                        </TouchableOpacity>
                      </View>
                    )}
                    {selectedWarehouse !== 'all' && (
                      <View style={styles.filterSummaryItem}>
                        <Text style={styles.filterSummaryText}>Warehouse: {getWarehouseName(selectedWarehouse)}</Text>
                        <TouchableOpacity onPress={() => setSelectedWarehouse('all')}>
                          <Icon name="x" size={12} color={COLORS.text.secondary} />
                        </TouchableOpacity>
                      </View>
                    )}
                    {(dateRange.start || dateRange.end) && (
                      <View style={styles.filterSummaryItem}>
                        <Text style={styles.filterSummaryText}>
                          Date: {dateRange.start ? formatDateForDisplay(new Date(dateRange.start)) : 'Any'} to {dateRange.end ? formatDateForDisplay(new Date(dateRange.end)) : 'Any'}
                        </Text>
                        <TouchableOpacity onPress={() => setDateRange({ start: '', end: '' })}>
                          <Icon name="x" size={12} color={COLORS.text.secondary} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={onClear} style={styles.modalButtonSecondary}>
                <Text style={styles.modalButtonSecondaryText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onApply} style={styles.modalButtonPrimary}>
                <Text style={styles.modalButtonPrimaryText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Warehouse Picker Modal */}
      <Modal
        visible={showWarehousePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowWarehousePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Warehouse</Text>
              <TouchableOpacity onPress={() => setShowWarehousePicker(false)} style={styles.modalCloseButton}>
                <Icon name="x" size={20} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.warehouseOption, selectedWarehouse === 'all' && styles.warehouseOptionActive]}
                onPress={() => {
                  setSelectedWarehouse('all');
                  setShowWarehousePicker(false);
                }}
              >
                <View style={styles.warehouseOptionIcon}>
                  <Icon name="grid" size={18} color={selectedWarehouse === 'all' ? '#FFFFFF' : COLORS.primary} />
                </View>
                <View style={styles.warehouseOptionContent}>
                  <Text style={[styles.warehouseOptionTitle, selectedWarehouse === 'all' && styles.warehouseOptionTitleActive]}>
                    All Warehouses
                  </Text>
                  <Text style={[styles.warehouseOptionSubtitle, selectedWarehouse === 'all' && styles.warehouseOptionSubtitleActive]}>
                    Show transfers from all warehouses
                  </Text>
                </View>
              </TouchableOpacity>

              {warehouses.map((warehouse) => (
                <TouchableOpacity
                  key={warehouse.id}
                  style={[styles.warehouseOption, selectedWarehouse === warehouse.id && styles.warehouseOptionActive]}
                  onPress={() => {
                    setSelectedWarehouse(warehouse.id);
                    setShowWarehousePicker(false);
                  }}
                >
                  <View style={styles.warehouseOptionIcon}>
                    <Icon name="home" size={18} color={selectedWarehouse === warehouse.id ? '#FFFFFF' : COLORS.primary} />
                  </View>
                  <View style={styles.warehouseOptionContent}>
                    <Text style={[styles.warehouseOptionTitle, selectedWarehouse === warehouse.id && styles.warehouseOptionTitleActive]}>
                      {warehouse.name}
                    </Text>
                    <Text style={[styles.warehouseOptionSubtitle, selectedWarehouse === warehouse.id && styles.warehouseOptionSubtitleActive]}>
                      {warehouse.address.split(',')[0]}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={handleStartDateChange}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={handleEndDateChange}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%', // Reduced from 80%
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.sm, // Reduced from md
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text.primary,
    fontSize: 16, // Reduced font size
  },
  activeFilterBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 8, // Reduced from 10
    paddingHorizontal: 4, // Reduced from 6
    paddingVertical: 1, // Reduced from 2
    marginLeft: 6, // Reduced from 8
  },
  activeFilterBadgeText: {
    ...TEXT_STYLES.caption,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 9, // Reduced from 10
  },
  modalCloseButton: {
    padding: 2, // Reduced from 4
  },
  modalBody: {
    padding: SPACING.sm, // Reduced from md
    paddingBottom: 0,
  },
  filterSection: {
    marginBottom: SPACING.sm, // Reduced from md
  },
  filterSectionTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    fontSize: 12, // Reduced from 13
  },
  filterChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  filterChip: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: '#FFFFFF',
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text.secondary,
    fontSize: 9, // Reduced from 10
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  quickFilterChip: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    backgroundColor: COLORS.primary + '10',
  },
  quickFilterChipText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontSize: 9, // Reduced from 10
    fontWeight: '500',
  },
  dropdownContainer: {
    marginTop: SPACING.xs,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: '#FFFFFF',
  },
  dropdownButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  dropdownButtonText: {
    ...TEXT_STYLES.body,
    color: COLORS.text.secondary,
    fontSize: 11, // Reduced from 12
  },
  dropdownButtonTextActive: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: '#FFFFFF',
  },
  dateInputActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  dateInputText: {
    ...TEXT_STYLES.body,
    color: COLORS.text.secondary,
    fontSize: 11, // Reduced from 12
  },
  dateInputTextActive: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  dateRangeSeparator: {
    ...TEXT_STYLES.body,
    color: COLORS.text.secondary,
    fontSize: 11, // Reduced from 12
  },
  filterSummary: {
    marginTop: SPACING.sm,
    padding: SPACING.xs,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderRadius: BORDER_RADIUS.sm,
  },
  filterSummaryTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    fontSize: 11, // Reduced from 12
  },
  filterSummaryItems: {
    gap: SPACING.xs,
  },
  filterSummaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  filterSummaryText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text.secondary,
    fontSize: 9, // Reduced from 10
  },
  modalFooter: {
    flexDirection: 'row',
    gap: SPACING.xs,
    padding: SPACING.sm, // Reduced from md
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalButtonSecondary: {
    flex: 1,
    padding: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    ...TEXT_STYLES.button,
    color: COLORS.text.secondary,
    fontSize: 11, // Reduced from 12
  },
  modalButtonPrimary: {
    flex: 2,
    padding: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  modalButtonPrimaryText: {
    ...TEXT_STYLES.button,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 11, // Reduced from 12
  },
  warehouseOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.xs, // Reduced from sm
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.xs,
  },
  warehouseOptionActive: {
    backgroundColor: COLORS.primary,
  },
  warehouseOptionIcon: {
    width: 32, // Reduced from 36
    height: 32, // Reduced from 36
    borderRadius: 16, // Reduced from 18
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.xs, // Reduced from sm
  },
  warehouseOptionContent: {
    flex: 1,
  },
  warehouseOptionTitle: {
    ...TEXT_STYLES.body,
    color: COLORS.text.primary,
    fontWeight: '500',
    fontSize: 12, // Reduced from 13
  },
  warehouseOptionTitleActive: {
    color: '#FFFFFF',
  },
  warehouseOptionSubtitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.text.secondary,
    marginTop: 2,
    fontSize: 10, // Reduced from 11
  },
  warehouseOptionSubtitleActive: {
    color: '#FFFFFF',
    opacity: 0.8,
  },
});

export default FilterModal;
