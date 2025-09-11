import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';
import { Transaction } from '../../types/inventory';
import { inventoryApiService } from '../../api/inventoryApi';

interface RecentActivityItem {
  id: string;
  name: string;
  avatar: string;
  projectType: string;
  status: string;
  timeAgo: string;
  isVerified: boolean;
}

// Fallback data for when no real data is available
const FALLBACK_ACTIVITIES: RecentActivityItem[] = [
  {
    id: '1',
    name: 'Wade Warren',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    projectType: 'House Renovation',
    status: 'has send quote',
    timeAgo: '6 days ago',
    isVerified: true,
  },
  {
    id: '2',
    name: 'Jacob Jones',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    projectType: 'House Renovation',
    status: 'has send quote',
    timeAgo: '2 days ago',
    isVerified: true,
  },
  {
    id: '3',
    name: 'Jane Cooper',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    projectType: 'House Renovation',
    status: 'has send quote',
    timeAgo: '2 days ago',
    isVerified: true,
  },
];

// Unsplash fallback images for different user types
const FALLBACK_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face',
];

const RecentActivityList: React.FC = () => {
  const [activities, setActivities] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        setLoading(true);
        // Try to fetch real transactions with proper filtering
        const response = await inventoryApiService.getTransactions({ 
          limit: 3,
          sort: 'created_at:desc' // Get most recent first
        });
        
        if (response.data && response.data.length > 0) {
          // Convert real transactions to activity format
          const realActivities: RecentActivityItem[] = response.data.map((transaction, index) => {
            const transactionType = transaction.transaction_type;
            const projectType = getProjectTypeFromTransaction(transactionType);
            const status = getStatusFromTransaction(transactionType);
            
            return {
              id: transaction.id || `real-${index}`,
              name: getUserNameFromTransaction(transaction, index),
              avatar: getUserAvatarFromTransaction(transaction, index),
              projectType,
              status,
              timeAgo: formatTimeAgo(transaction.created_at),
              isVerified: true,
            };
          });
          setActivities(realActivities);
        } else {
          // Use fallback data if no real data
          setActivities(FALLBACK_ACTIVITIES);
        }
      } catch (error) {
        console.error('Error fetching recent activity:', error);
        // Use fallback data on error
        setActivities(FALLBACK_ACTIVITIES);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivity();
  }, []);

  // Helper functions for transaction mapping
  const getProjectTypeFromTransaction = (transactionType: string): string => {
    switch (transactionType) {
      case 'in':
        return 'Stock In';
      case 'out':
        return 'Stock Out';
      case 'adjustment':
        return 'Stock Adjustment';
      default:
        return 'Inventory Update';
    }
  };

  const getStatusFromTransaction = (transactionType: string): string => {
    switch (transactionType) {
      case 'in':
        return 'has restocked';
      case 'out':
        return 'has sold';
      case 'adjustment':
        return 'has adjusted';
      default:
        return 'has updated';
    }
  };

  const getUserNameFromTransaction = (transaction: Transaction, index: number): string => {
    // In a real app, you'd fetch user data based on transaction.created_by or similar
    // For now, use fallback names with some variation
    const names = ['Wade Warren', 'Jacob Jones', 'Jane Cooper', 'Mike Johnson', 'Sarah Wilson', 'David Brown'];
    return names[index % names.length];
  };

  const getUserAvatarFromTransaction = (transaction: Transaction, index: number): string => {
    // In a real app, you'd fetch user avatar from user profile
    // For now, use fallback avatars
    return FALLBACK_AVATARS[index % FALLBACK_AVATARS.length];
  };

  const formatTimeAgo = (timestamp?: string) => {
    if (!timestamp) return 'Unknown time';

    const created = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - created.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (isNaN(diffInHours)) return 'Invalid date';
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Recent Activity</Text>
        </View>
        <View style={styles.card}>
          {[...Array(3)].map((_, index) => (
            <View key={index} style={styles.skeletonItem}>
              <View style={styles.avatarContainer}>
                <View style={styles.skeletonAvatar} />
              </View>
              <View style={styles.skeletonContent}>
                <View style={styles.skeletonName} />
                <View style={styles.skeletonProject} />
                <View style={styles.skeletonStatus} />
              </View>
              <View style={styles.skeletonArrow} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Custom header to match card alignment */}
      <View style={styles.header}>
        <Text style={styles.title}>Recent Activity ({activities.length.toString()})</Text>
      </View>
      <View style={styles.card}>
        {activities.map((activity, index) => (
          <TouchableOpacity 
            key={activity.id} 
            style={[
              styles.activityItem,
              index < activities.length - 1 && styles.activityItemWithBorder
            ]}
          >
            <View style={styles.avatarContainer}>
              <FastImage 
                source={{ 
                  uri: activity.avatar,
                  priority: FastImage.priority.normal,
                }} 
                style={styles.avatar}
                resizeMode={FastImage.resizeMode.cover}
                fallback
              />
            </View>
            <View style={styles.content}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{activity.name}</Text>
                {activity.isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Icon name="check" size={10} color="#FFFFFF" />
                  </View>
                )}
              </View>
              <View style={styles.projectRow}>
                <Icon name="tool" size={12} color="#FF6B35" />
                <Text style={styles.projectType}>{activity.projectType}</Text>
              </View>
              <View style={styles.statusContainer}>
                <Text style={styles.statusText}>
                  {activity.name} {activity.status} <Text style={styles.timeText}>{activity.timeAgo}</Text>
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.arrowButton}>
              <Icon name="arrow-up-right" size={16} color="#6C757D" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  activityItemWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SPACING.md,
    backgroundColor: '#F3F4F6', // Background color for avatar
    overflow: 'hidden',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  content: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#1A1A1A',
    marginRight: SPACING.xs,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  projectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  projectType: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#FF6B35',
    marginLeft: 4,
  },
  statusContainer: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#6C757D',
  },
  timeText: {
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Skeleton styles
  skeletonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  skeletonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  skeletonContent: {
    flex: 1,
  },
  skeletonName: {
    height: 16,
    width: 120,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 4,
  },
  skeletonProject: {
    height: 12,
    width: 100,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 4,
  },
  skeletonStatus: {
    height: 12,
    width: 80,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  skeletonArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
  },
});

export default RecentActivityList;
