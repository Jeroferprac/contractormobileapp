import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';

interface FilterChip {
  id: string;
  label: string;
  icon?: string;
}

interface FilterChipsProps {
  filters: FilterChip[];
  selectedFilters: string[];
  onFilterChange: (filterId: string) => void;
  multiSelect?: boolean;
}

const FilterChips: React.FC<FilterChipsProps> = ({
  filters,
  selectedFilters = [],
  onFilterChange,
  multiSelect = false,
}) => {
  const handleFilterPress = (filterId: string) => {
    if (multiSelect) {
      onFilterChange(filterId);
    } else {
      // Single select - replace current selection
      if (selectedFilters && selectedFilters.includes(filterId)) {
        onFilterChange(filterId);
      } else {
        onFilterChange(filterId);
      }
    }
  };

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {filters && filters.map((filter) => {
        if (!filter || !filter.id) return null;
        
        const isSelected = selectedFilters && selectedFilters.includes(filter.id);
        
        return (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.chip,
              isSelected && styles.selectedChip
            ]}
            onPress={() => handleFilterPress(filter.id)}
            activeOpacity={0.7}
          >
            {filter.icon && (
              <Icon 
                name={filter.icon as any} 
                size={14} 
                color={isSelected ? COLORS.text.light : COLORS.text.secondary} 
                style={styles.icon}
              />
            )}
            <Text style={[
              styles.chipText,
              isSelected && styles.selectedChipText
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  icon: {
    marginRight: SPACING.xs,
  },
  chipText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    fontFamily: 'System',
    fontWeight: '500',
  },
  selectedChipText: {
    color: COLORS.text.light,
    fontWeight: '600',
  },
});

export default FilterChips; 