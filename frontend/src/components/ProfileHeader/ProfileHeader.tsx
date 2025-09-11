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
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';

const { width: screenWidth } = Dimensions.get('window');

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
  onAvatarPress?: () => void;
  avatarLoading?: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  onEditProfile,
  onShare,
  onAvatarPress,
  avatarLoading = false,
}) => {
  return (
    <View style={styles.container}>
      {/* Header Background Image */}
      <View style={styles.headerImageContainer}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop' }}
          style={styles.headerImage}
          resizeMode="cover"
        />
        
        {/* Profile Picture */}
        <TouchableOpacity 
          style={styles.profilePicture}
          onPress={onAvatarPress}
          disabled={avatarLoading}
        >
          {user.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profilePlaceholder}>
              <Icon name="business" size={32} color="#FFFFFF" />
            </View>
          )}
          
          {/* Orange Add Button */}
          <View style={styles.addIcon}>
            <Icon name="add" size={16} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* Header Action Buttons */}
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerActionIcon}>
            <Icon name="notifications" size={20} color="#1A1A1A" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionIcon}>
            <Icon name="settings" size={20} color="#1A1A1A" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Information Card */}
      <View style={styles.profileCard}>
        {/* Company Name and Verification */}
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{user.name}</Text>
          <View style={styles.verificationBadge}>
            <Icon name="verified" size={16} color="#007BFF" />
          </View>
        </View>

        {/* Rating Section */}
        <View style={styles.ratingSection}>
          <View style={styles.ratingItem}>
            <Icon name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>4.7</Text>
            <Text style={styles.ratingSubtext}>93 reviews</Text>
          </View>
          <View style={styles.ratingItem}>
            <Icon name="eco" size={16} color="#28A745" />
            <Text style={styles.ratingText}>Grade: 1</Text>
            <Text style={styles.ratingSubtext}>(Excellent!)</Text>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statsColumn}>
            <View style={styles.statItem}>
              <Icon name="handshake" size={16} color="#666666" />
              <Text style={styles.statText}>12 Year of experience</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="attach-money" size={16} color="#666666" />
              <Text style={styles.statText}>Contact for Pricing</Text>
            </View>
          </View>
          <View style={styles.statsColumn}>
            <View style={styles.statItem}>
              <Icon name="check-circle" size={16} color="#666666" />
              <Text style={styles.statText}>64 (Projects)</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="location-on" size={16} color="#666666" />
              <Text style={styles.statText}>Abu Dhabi</Text>
            </View>
          </View>
        </View>

        {/* Edit Button */}
        <TouchableOpacity style={styles.editButton} onPress={onEditProfile}>
          <Icon name="edit" size={16} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Followers/Following Stats */}
        <View style={styles.followStats}>
          <View style={styles.followItem}>
            <Text style={styles.followNumber}>50</Text>
            <Text style={styles.followLabel}>Following</Text>
          </View>
          <View style={styles.followItem}>
            <Text style={styles.followNumber}>100</Text>
            <Text style={styles.followLabel}>Followers</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },
  headerImageContainer: {
    height: 200,
    width: '100%',
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  profilePicture: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#666666',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 37,
  },
  profilePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 37,
    backgroundColor: '#666666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    position: 'absolute',
    top: 20,
    right: 20,
    gap: 10,
  },
  headerActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    position: 'relative',
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginRight: SPACING.xs,
  },
  verificationBadge: {
    marginLeft: SPACING.xs,
  },
  ratingSection: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    gap: SPACING.lg,
  },
  ratingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  ratingSubtext: {
    fontSize: 14,
    color: '#666666',
  },
  statsSection: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    gap: SPACING.xl,
  },
  statsColumn: {
    flex: 1,
    gap: SPACING.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statText: {
    fontSize: 14,
    color: '#666666',
  },
  editButton: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  followStats: {
    flexDirection: 'row',
    gap: SPACING.xl,
  },
  followItem: {
    alignItems: 'center',
  },
  followNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  followLabel: {
    fontSize: 14,
    color: '#666666',
  },
});