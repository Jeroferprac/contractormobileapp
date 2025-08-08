import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { TEXT_STYLES } from '../../constants/typography';

interface TabItem {
  id: string;
  label: string;
  icon: string;
  activeIcon?: string;
}

interface BottomNavigationProps {
  activeTab: string;
  onTabPress: (tabId: string) => void;
}

const tabs: TabItem[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'Inventory', label: 'Listings', icon: 'grid' },
  { id: 'projects', label: 'Projects', icon: 'message-circle' },
  { id: 'profile', label: 'Profile', icon: 'user' },
];

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabPress,
}) => {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
                      <TouchableOpacity
              key={tab.id}
              style={styles.tab}
              onPress={() => onTabPress(tab.id)}
            >
            <Icon
              name={tab.icon as any}
              size={20}
              color={isActive ? COLORS.primary : COLORS.text.secondary}
            />
            <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
    paddingBottom: SPACING.sm,
    paddingTop: SPACING.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
  },
  tabLabel: {
    fontSize: TEXT_STYLES.caption.fontSize,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  activeTabLabel: {
    color: COLORS.primary,
    fontWeight: TEXT_STYLES.caption.fontWeight,
  },
});

export default BottomNavigation; 