import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';

export type ProfileTabType = 'business-card' | 'posts' | 'about' | 'projects';

interface ProfileTabsProps {
  activeTab: ProfileTabType;
  onTabPress: (tab: ProfileTabType) => void;
}

const tabs: { key: ProfileTabType; label: string }[] = [
  { key: 'business-card', label: 'Business Card' },
  { key: 'posts', label: 'Posts' },
  { key: 'about', label: 'About' },
  { key: 'projects', label: 'Projects' },
];

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
  activeTab,
  onTabPress,
}) => {
  const scrollViewRef = useRef<any>(null);

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
        contentContainerStyle={styles.tabsContainer}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.activeTab,
            ]}
            onPress={() => handleTabPress(tab.key)}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab.key && styles.activeTabText,
            ]}>
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
    backgroundColor: '#FFFFFF',
    paddingVertical: SPACING.md,
    borderBottomWidth: 0,
  },
  tabsContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 22,
    backgroundColor: '#F8F9FA',
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activeTab: {
    backgroundColor: '#FB7504',
    borderWidth: 0,   
    borderColor: '#FF6B35',
    shadowColor: '#E55A2B',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666666',
    letterSpacing: 0.2,
  },
  activeTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});