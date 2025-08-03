import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';

interface ProfileScreenProps {
  navigation?: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'activity' | 'saved'>('posts');

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.profileInfo}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Icon name="person" size={40} color={COLORS.textSecondary} />
          </View>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>John Doe</Text>
          <Text style={styles.userEmail}>john.doe@example.com</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Projects</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>4.8</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.editButton}>
        <Icon name="edit" size={20} color={COLORS.primary} />
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
        onPress={() => setActiveTab('posts')}
      >
        <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
          Posts
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'activity' && styles.activeTab]}
        onPress={() => setActiveTab('activity')}
      >
        <Text style={[styles.tabText, activeTab === 'activity' && styles.activeTabText]}>
          Activity
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'saved' && styles.activeTab]}
        onPress={() => setActiveTab('saved')}
      >
        <Text style={[styles.tabText, activeTab === 'saved' && styles.activeTabText]}>
          Saved
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderPostsContent = () => (
    <View style={styles.contentContainer}>
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <View style={styles.postAvatar}>
            <Icon name="person" size={24} color={COLORS.textSecondary} />
          </View>
          <View style={styles.postInfo}>
            <Text style={styles.postTitle}>Major Renovation Project</Text>
            <Text style={styles.postDate}>2 days ago</Text>
          </View>
        </View>
        <Text style={styles.postContent}>
          Just completed a major renovation project for a beautiful Victorian home. 
          The transformation included kitchen remodeling, bathroom updates, and 
          exterior painting. The client was thrilled with the results!
        </Text>
        <View style={styles.postActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="favorite-border" size={20} color={COLORS.textSecondary} />
            <Text style={styles.actionText}>24</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="chat-bubble-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.actionText}>8</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="share" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderActivityContent = () => (
    <View style={styles.contentContainer}>
      <View style={styles.activityItem}>
        <View style={styles.activityIcon}>
          <Icon name="message" size={20} color={COLORS.primary} />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityText}>
            <Text style={styles.activityBold}>Ahmed from Premier Construction</Text> sent you a message
          </Text>
          <Text style={styles.activityTime}>1 hour ago</Text>
        </View>
      </View>
      
      <View style={styles.activityItem}>
        <View style={styles.activityIcon}>
          <Icon name="favorite" size={20} color={COLORS.primary} />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityText}>
            You saved <Text style={styles.activityBold}>Modern Pendant Light Fixture</Text> to favorite
          </Text>
          <Text style={styles.activityTime}>3 hours ago</Text>
        </View>
      </View>

      <View style={styles.activityItem}>
        <View style={styles.activityIcon}>
          <Icon name="star" size={20} color={COLORS.primary} />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityText}>
            You received a 5-star review from <Text style={styles.activityBold}>Sarah Johnson</Text>
          </Text>
          <Text style={styles.activityTime}>1 day ago</Text>
        </View>
      </View>
    </View>
  );

  const renderSavedContent = () => (
    <View style={styles.contentContainer}>
      <View style={styles.savedItem}>
        <View style={styles.savedImage}>
          <Icon name="image" size={40} color={COLORS.textSecondary} />
        </View>
        <View style={styles.savedInfo}>
          <Text style={styles.savedTitle}>Modern Kitchen Design</Text>
          <Text style={styles.savedCompany}>Cornerstone Builders</Text>
          <Text style={styles.savedPrice}>$15,000 - $25,000</Text>
        </View>
        <TouchableOpacity style={styles.savedAction}>
          <Icon name="more-vert" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.savedItem}>
        <View style={styles.savedImage}>
          <Icon name="image" size={40} color={COLORS.textSecondary} />
        </View>
        <View style={styles.savedInfo}>
          <Text style={styles.savedTitle}>Bathroom Remodeling</Text>
          <Text style={styles.savedCompany}>Cornerstone Builders</Text>
          <Text style={styles.savedPrice}>$8,000 - $12,000</Text>
        </View>
        <TouchableOpacity style={styles.savedAction}>
          <Icon name="more-vert" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.savedItem}>
        <View style={styles.savedImage}>
          <Icon name="image" size={40} color={COLORS.textSecondary} />
        </View>
        <View style={styles.savedInfo}>
          <Text style={styles.savedTitle}>Exterior Painting</Text>
          <Text style={styles.savedCompany}>Cornerstone Builders</Text>
          <Text style={styles.savedPrice}>$3,000 - $5,000</Text>
        </View>
        <TouchableOpacity style={styles.savedAction}>
          <Icon name="more-vert" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'posts':
        return renderPostsContent();
      case 'activity':
        return renderActivityContent();
      case 'saved':
        return renderSavedContent();
      default:
        return renderPostsContent();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderProfileHeader()}
        {renderTabBar()}
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarContainer: {
    marginRight: SPACING.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.border,
    marginRight: SPACING.md,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'transparent',
  },
  editButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  contentContainer: {
    padding: SPACING.md,
  },
  postCard: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  postInfo: {
    flex: 1,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  postDate: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  postContent: {
    fontSize: 16,
    color: COLORS.textPrimary,
    lineHeight: 24,
    marginBottom: SPACING.md,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  actionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
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
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  activityBold: {
    fontWeight: '600',
  },
  activityTime: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  savedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  savedImage: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  savedInfo: {
    flex: 1,
  },
  savedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  savedCompany: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  savedPrice: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  savedAction: {
    padding: SPACING.xs,
  },
}); 