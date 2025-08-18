import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../../../constants/spacing';
import { TYPOGRAPHY } from '../../../../constants/typography';

interface ReportHeaderProps {
  title: string;
  subtitle?: string;
  icon: string;
  onSearch?: (text: string) => void;
  onFilter?: () => void;
  onExport?: () => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
  showFilter?: boolean;
  showExport?: boolean;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({
  title,
  subtitle,
  icon,
  onSearch,
  onFilter,
  onExport,
  searchPlaceholder = 'Search...',
  showSearch = true,
  showFilter = true,
  showExport = true,
}) => {
  return (
    <View style={styles.container}>
      {/* Header Content */}
      <View style={styles.headerContent}>
        <View style={styles.titleSection}>
          <View style={styles.iconContainer}>
            <Icon name={icon as any} size={24} color={COLORS.primary} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {showSearch && (
            <TouchableOpacity style={styles.actionButton} onPress={() => onSearch?.('')}>
              <Icon name="search" size={20} color={COLORS.text.secondary} />
            </TouchableOpacity>
          )}
          {showFilter && (
            <TouchableOpacity style={styles.actionButton} onPress={onFilter}>
              <Icon name="filter" size={20} color={COLORS.text.secondary} />
            </TouchableOpacity>
          )}
          {showExport && (
            <TouchableOpacity style={styles.exportButton} onPress={onExport}>
              <Icon name="download" size={20} color={COLORS.text.light} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Icon name="search" size={16} color={COLORS.text.secondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={searchPlaceholder}
              placeholderTextColor={COLORS.text.secondary}
              onChangeText={onSearch}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
    fontFamily: 'System',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  exportButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    marginTop: SPACING.sm,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.primary,
    fontFamily: 'System',
  },
});

export default ReportHeader;
