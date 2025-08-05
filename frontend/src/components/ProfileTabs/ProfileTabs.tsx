import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';

export type ProfileTabType = 'posts' | 'activity' | 'saved' | 'about' | 'affiliate';

interface ProfileTabsProps {
  activeTab: ProfileTabType;
  onTabPress: (tab: ProfileTabType) => void;
}

const tabs: { key: ProfileTabType; label: string }[] = [
  { key: 'posts', label: 'Posts' },
  { key: 'activity', label: 'Activity' },
  { key: 'saved', label: 'Saved' },
  { key: 'about', label: 'About' },
  { key: 'affiliate', label: 'Affiliate Program' },
];

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
  activeTab,
  onTabPress,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  const handleTabPress = (tabKey: ProfileTabType) => {
    onTabPress(tabKey);
    
    // Find the index of the clicked tab
    const tabIndex = tabs.findIndex(tab => tab.key === tabKey);
    
    // Calculate scroll position to bring the next tab into view
    const tabWidth = 100; // Approximate width of each tab
    const scrollPosition = Math.max(0, (tabIndex - 1) * tabWidth);
    
    // Smooth scroll to the calculated position
    scrollViewRef.current?.scrollTo({
      x: scrollPosition,
      animated: true,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.activeTab,
            ]}
            onPress={() => handleTabPress(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
  },
  tab: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginRight: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 80,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.textLight,
    fontWeight: '600',
  },
}); 