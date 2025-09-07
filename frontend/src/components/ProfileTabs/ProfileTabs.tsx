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
import LinearGradient from 'react-native-linear-gradient';

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
  { key: 'affiliate', label: 'Affiliate P' },
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
               activeTab === tab.key && styles.activeTabText
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
    paddingVertical: SPACING.sm,
  },
  tabsContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  tab: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 24,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#FB7504',
    borderWidth: 0,
  },

  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5A6474',
    letterSpacing: 0.2,
  },
  activeTabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});