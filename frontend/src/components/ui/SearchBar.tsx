import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';
import { TEXT_STYLES } from '../../constants/typography';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSearch?: () => void;
  onFilterPress?: () => void;
  style?: any;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'What do you need help with today?',
  value,
  onChangeText,
  onSearch,
  onFilterPress,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={COLORS.text.secondary} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.text.tertiary}
          value={value}
          onChangeText={onChangeText}
        />
        <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
          <Icon name="sliders" size={16} color={COLORS.text.light} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: TEXT_STYLES.body.fontSize,
    color: COLORS.text.primary,
    paddingVertical: SPACING.xs,
  },
  filterButton: {
    padding: SPACING.xs,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.round,
    width: 32,
    height: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default SearchBar; 