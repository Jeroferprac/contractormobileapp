import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';

const { width } = Dimensions.get('window');

interface ProfileHeaderProps {
  user: {
    name: string;
    company: string;
    description: string;
    posts: number;
    followers: number;
    profileImage?: string;
    headerImage?: string;
  };
  onEditProfile: () => void;
  onShare: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  onEditProfile,
  onShare,
}) => {
  return (
    <View style={styles.container}>
      {/* Header Image */}
      <View style={styles.headerImageContainer}>
        <Image
          source={user.headerImage ? { uri: user.headerImage } : { uri: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800' }}
          style={styles.headerImage}
          resizeMode="cover"
        />
      </View>

      {/* Profile Picture Overlay */}
      <View style={styles.profilePictureContainer}>
        <View style={styles.profilePicture}>
          {user.profileImage ? (
            <Image
              source={{ uri: user.profileImage }}
              style={styles.profileImage}
              resizeMode="cover"
            />
          ) : (
            <Icon name="person" size={40} color={COLORS.textSecondary} />
          )}
          <View style={styles.verifiedBadge}>
            <Icon name="verified" size={16} color={COLORS.info} />
          </View>
          <View style={styles.addIcon}>
            <Icon name="add" size={16} color={COLORS.primary} />
          </View>
        </View>
      </View>

      {/* User Information */}
      <View style={styles.userInfoContainer}>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userHandle}>@john_builders</Text>
        <Text style={styles.userTitle}>Construction Manager</Text>
        <Text style={styles.userJoined}>Joined January 2023</Text>
        <Text style={styles.userDescription}>{user.description}</Text>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>50</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>100</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.editButton} onPress={onEditProfile}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={onShare}>
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
  },
  headerImageContainer: {
    height: 180,
    width: '100%',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  profilePictureContainer: {
    position: 'absolute',
    top: 100,
    left: SPACING.md,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.background,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 37,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 2,
  },
  addIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 2,
  },
  userInfoContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  userHandle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  userTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  userJoined: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  userDescription: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginBottom: SPACING.md,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  statNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.border,
    marginRight: SPACING.md,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  editButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  shareButton: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
}); 