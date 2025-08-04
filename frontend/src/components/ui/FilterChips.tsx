import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';
import { TEXT_STYLES } from '../../constants/typography';

interface FilterChip {
  id: string;
  label: string;
  icon?: string;
}

interface FilterChipsProps {
  filters: FilterChip[];
  onRemoveFilter: (id: string) => void;
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
      {filters.map((filter) => (
        <View key={filter.id} style={styles.chip}>
          {filter.icon && (
            <Icon name={filter.icon as any} size={14} color={COLORS.text.secondary} style={styles.chipIcon} />
          )}
          <Text style={styles.chipText}>{filter.label}</Text>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => onRemoveFilter(filter.id)}
          >
            <Icon name="x" size={12} color={COLORS.text.secondary} />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.text.light,
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  chipIcon: {
    marginRight: SPACING.xs,
  },
  chipText: {
    fontSize: TEXT_STYLES.bodySmall.fontSize,
    color: COLORS.text.secondary,
    marginRight: SPACING.xs,
  },
  removeButton: {
    padding: 2,
  },
});

export default FilterChips; 