import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';

interface Filter {
  id: string;
  label: string;
  icon?: string;
}

interface FilterChipsProps {
  filters: Filter[];
  onRemoveFilter: (filterId: string) => void;
  style?: any;
}

const FilterChips: React.FC<FilterChipsProps> = ({
  filters,
  onRemoveFilter,
  style,
}) => {
  if (filters.length === 0) return null;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.chipsContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={styles.chip}
            onPress={() => onRemoveFilter(filter.id)}
          >
            <Text style={styles.chipText}>{filter.label}</Text>
            <Icon name="x" size={12} color={COLORS.text.light} style={styles.removeIcon} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.sm,
  },
  chipsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
  },
  chipText: {
    color: COLORS.text.light,
    fontSize: 12,
    fontWeight: '500',
  },
  removeIcon: {
    marginLeft: SPACING.xs,
  },
});

export default FilterChips; 