import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { COLORS } from '../../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../../constants/spacing';
import { TYPOGRAPHY } from '../../../constants/typography';

interface HorizontalListProps {
  /**
   * The title displayed at the top of the horizontal list
   */
  title: string;
  
  /**
   * Optional subtitle displayed below the title
   */
  subtitle?: string;
  
  /**
   * Optional function called when the "View All" button is pressed
   */
  onViewAll?: () => void;
  
  /**
   * Optional custom text for the view all button
   */
  viewAllText?: string;
  
  /**
   * The content to be displayed in the horizontal scrolling list
   */
  children: ReactNode;
  
  /**
   * Optional custom height for the scroll container
   */
  containerHeight?: number;
  
  /**
   * Optional flag to show/hide the View All button
   */
  showViewAll?: boolean;
}

/**
 * A reusable horizontal scrolling list component with a title and optional "View All" button
 */
const HorizontalList: React.FC<HorizontalListProps> = ({ 
  title, 
  subtitle,
  onViewAll, 
  children,
  viewAllText = "View All",
  containerHeight,
  showViewAll = true
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {showViewAll && onViewAll && (
          <TouchableOpacity 
            onPress={onViewAll}
            style={styles.viewAllButton}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>{viewAllText}</Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={[styles.scrollView, containerHeight ? { height: containerHeight } : null]}
      >
        {children}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    color: COLORS.text.primary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  viewAllButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.xxl,
    backgroundColor: COLORS.primary,
  },
  viewAllText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  scrollView: {
    overflow: 'visible',
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
});

export default HorizontalList;
