import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';


interface ActivityItem {
  id: string;
  type: 'message' | 'save' | 'review' | 'like' | 'comment' | 'follow' | 'project' | 'certification' | 'meeting' | 'purchase' | 'booking' | 'payment';
  title: string;
  subtitle?: string;
  timestamp: string;
  icon: string;
}

interface ActivityTabProps {
  activities: ActivityItem[];
  userAvatar?: string;
  userName?: string;
}

export const ActivityTab: React.FC<ActivityTabProps> = ({ activities, userAvatar, userName }) => {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'message':
        return 'message';
      case 'save':
        return 'bookmark';
      case 'review':
        return 'star';
      case 'like':
        return 'favorite';
      case 'comment':
        return 'comment';
      case 'follow':
        return 'person-add';
      case 'project':
        return 'business';
      case 'certification':
        return 'verified';
      case 'meeting':
        return 'event';
      case 'purchase':
        return 'shopping-cart';
      case 'booking':
        return 'calendar-today';
      case 'payment':
        return 'payment';
      default:
        return 'info';
    }
  };

  const renderActivityItem = (activity: ActivityItem) => (
    <View key={activity.id} style={styles.activityItem}>
      <View style={styles.activityIcon}>
        {userAvatar ? (
          <FastImage
            source={{ uri: userAvatar }}
            style={styles.activityAvatar}
            resizeMode={FastImage.resizeMode.cover}
          />
        ) : (
          <Icon 
            name={getActivityIcon(activity.type)} 
            size={20} 
            color={COLORS.primary} 
          />
        )}
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{activity.title}</Text>
        {activity.subtitle && (
          <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
        )}
        <Text style={styles.activityTimestamp}>{activity.timestamp}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {activities.length > 0 ? (
            activities.map(renderActivityItem)
          ) : (
            <View style={styles.emptyState}>
              <Icon name="notifications-none" size={48} color={COLORS.text.secondary} />
              <Text style={styles.emptyStateText}>No recent activity</Text>
              <Text style={styles.emptyStateSubtext}>Your activity will appear here</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  section: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    overflow: 'hidden',
  },
  activityAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  activityTimestamp: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.lg,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});