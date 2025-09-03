import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';
import { StatusBar } from '../../components/StatusBar';
import { BestOfBinyaanService } from '../../components/BestOfBinyaanService';
import { ProfileTabs, ProfileTabType } from '../../components/ProfileTabs';
import {
  PostsTab,
  AboutTab,
  ProjectsTab,
} from '../../components/ProfileContent';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';
import { useAuth } from '../../context/AuthContext';
import profileService from '../../services/profileService';
import storageService from '../../utils/storage';
import { User } from '../../types/api';
import { showImagePickerOptions, createFormDataForAvatar, validateImageSize, validateImageType } from '../../utils/imagePicker';

import { getBaseURL } from '../../utils/network';
import {
  mockPosts,
} from '../../data/mockData';

interface ProfileScreenProps {
  navigation?: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<ProfileTabType>('about');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  
  const { isAuthenticated, user: authUser } = useAuth();
  const user = profileUser || authUser;

  // Load user profile data
  useEffect(() => {
    if (isAuthenticated) {
      loadUserProfile();
    }
  }, [isAuthenticated]);

  // Monitor profile user changes
  useEffect(() => {

  }, [profileUser]);

  // Refresh profile when returning from edit screen
  useEffect(() => {
    const unsubscribe = navigation?.addListener('focus', () => {
      if (isAuthenticated) {
        loadUserProfile();
      }
    });

    return unsubscribe;
  }, [navigation, isAuthenticated]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      
      
      const userData = await profileService.getUserProfile();

      setProfileUser(userData);
    } catch (err: any) {
      console.error('❌ [ProfileScreen] Failed to load user profile:', err);
      console.error('❌ [ProfileScreen] Error details:', {
        name: err.name,
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url,
      });
      
      // If it's a network error, show a more user-friendly message
      if (err.name === 'NetworkError' || err.message?.includes('Network error')) {
        setError('Unable to connect to server. Please check your internet connection and try again.');
      } else if (err.response?.status === 404) {
        setError('Profile endpoint not found. Please check if the API endpoint is correct.');
      } else if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError('Failed to load profile. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserProfile();
    setRefreshing(false);
  };

  const handleEditProfile = () => {
    navigation?.navigate('EditProfile');
  };

  const handleShare = () => {
    Alert.alert('Share Profile', 'Share functionality coming soon!');
  };

  const handleAvatarPress = () => {
    showImagePickerOptions({
      onImageSelected: async (uri, fileName, type) => {
        try {
          setAvatarLoading(true);
          
          // Validate image
          const sizeValid = await validateImageSize(uri);
          if (!sizeValid) {
            Alert.alert('Image Too Large', 'Please select an image smaller than 5MB');
            return;
          }

          const typeValid = validateImageType(type);
          if (!typeValid) {
            Alert.alert('Invalid Image Type', 'Please select a JPEG or PNG image');
            return;
          }

          // Create form data
          const formData = await createFormDataForAvatar(uri, fileName, type);
          
          // Update avatar
          await profileService.updateAvatar(formData);
          
          // Refresh profile
          await loadUserProfile();
          
          Alert.alert('Success', 'Profile picture updated successfully!');
        } catch (error: any) {
          console.error('Failed to update avatar:', error);
          Alert.alert('Error', 'Failed to update profile picture. Please try again.');
        } finally {
          setAvatarLoading(false);
        }
      },
      onCancel: () => {
        console.log('Image picker cancelled');
      },
    });
  };

  const handleCreatePost = () => {
    navigation?.navigate('CreatePost');
  };

  const handleContactPress = () => {
    Alert.alert('Contact', 'Contact functionality coming soon!');
  };

  const handleLoginRedirect = () => {
    navigation?.navigate('Login');
  };

  const handleEditBestOfBinyaan = () => {
    // TODO: Implement edit functionality for Best Of Binyaan Service
    Alert.alert('Edit Best Of Binyaan Service', 'Edit functionality coming soon!');
  };

  const transformUserForHeader = (apiUser: User | null) => {
    if (!apiUser) {
      return {
        name: 'User Name',
        company: 'Company Name',
        description: 'No description available',
        followers: 0,
        following: 0,
        avatar_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=400&fit=crop',
      };
    }

    return {
      name: apiUser.full_name || 'User Name',
      company: apiUser.company || 'Company Name',
      description: apiUser.bio || 'No description available',
      followers: 100, // Default value since API doesn't provide this
      following: 50,  // Default value since API doesn't provide this
      avatar_url: apiUser.avatar_url || 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=400&fit=crop',
    };
  };

  const transformUserForAbout = (apiUser: User | null) => {
    if (!apiUser) {
      return {
        description: 'No description available',
        email: '',
        phone: '',
        address: '',
        website: '',
        socialMedia: {},
        joinedDate: 'Recently'
      };
    }

    return {
      description: apiUser.bio || 'No description available',
      email: apiUser.email || '',
      phone: apiUser.phone || 'No phone available',
      address: apiUser.location || 'No address available',
      website: apiUser.website || 'No website available',
      socialMedia: apiUser.social_media || {},
      joinedDate: apiUser.created_at ? new Date(apiUser.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      }) : 'Recently'
    };
  };

  const renderContent = () => {
    // Get user avatar from profile data
    const userAvatar = user?.avatar_url || user?.avatar_data ? 
      (user.avatar_data && user.avatar_mimetype ? 
        `data:${user.avatar_mimetype};base64,${user.avatar_data}` : 
        user.avatar_url) : 
      undefined;

    switch (activeTab) {
      case 'business-card':
        return (
          <View style={styles.businessCardContainer}>
            <Text style={styles.businessCardText}>Business Card Content</Text>
            <Text style={styles.businessCardSubtext}>Your business information will appear here</Text>
          </View>
        );
      case 'posts':
        return (
          <PostsTab
            posts={mockPosts}
            userAvatar={userAvatar}
            userName={user?.full_name || 'User'}
            onCreatePost={handleCreatePost}
          />
        );
      case 'about':
        return (
          <AboutTab
            user={transformUserForAbout(user)}
            onContactPress={handleContactPress}
          />
        );
      case 'projects':
        return <ProjectsTab />;
      default:
        return (
          <AboutTab
            user={transformUserForAbout(user)}
            onContactPress={handleContactPress}
          />
        );
    }
  };

  // Show loading state
  if (loading && !profileUser) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error && !profileUser) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error Loading Profile</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadUserProfile}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Show offline mode indicator if using fallback data
  const isOfflineMode = profileUser && !profileUser.id && authUser?.id;

  // Show authentication required state
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar />
        <View style={styles.authContainer}>
          <Text style={styles.authTitle}>Authentication Required</Text>
          <Text style={styles.authMessage}>
            Please log in to view your profile
          </Text>
          <TouchableOpacity style={styles.loginButton} onPress={handleLoginRedirect}>
            <Text style={styles.loginButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {isOfflineMode && (
          <View style={styles.offlineIndicator}>
            <Text style={styles.offlineText}>📱 Offline Mode - Using cached data</Text>
          </View>
        )}

        {/* Hero Image Section */}
        <View style={styles.heroContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=400&fit=crop' }}
            style={styles.heroImage}
          />
          
          {/* Top Right Icons */}
          <View style={styles.topRightIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.iconText}>🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.iconText}>⚙️</Text>
            </TouchableOpacity>
          </View>
          
          {/* Bottom Left Profile Picture */}
          <View style={styles.profilePictureContainer}>
            {user?.avatar_url ? (
              <Image 
                source={{ uri: user.avatar_url }}
                style={styles.profilePicture}
              />
            ) : (
              <View style={styles.profilePicture}>
                <Text style={styles.profileInitial}>{user?.full_name?.charAt(0)?.toUpperCase() || 'U'}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          
          {/* Right Side Edit Icon */}
          <TouchableOpacity style={styles.editIcon}>
            <Text style={styles.editIconText}>✏️</Text>
          </TouchableOpacity>
        </View>

        {/* Company Profile Section */}
        <View style={styles.companyProfileContainer}>
          <View style={styles.companyHeader}>
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>{user?.full_name || 'User Name'}</Text>
              <Text style={styles.verificationBadge}>✓</Text>
            </View>
            <View style={styles.followingFollowers}>
              <View style={styles.followBox}>
                <Text style={styles.followNumber}>50</Text>
                <Text style={styles.followLabel}>Following</Text>
              </View>
              <View style={styles.followBox}>
                <Text style={styles.followNumber}>100</Text>
                <Text style={styles.followLabel}>Followers</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.ratingSection}>
            <Text style={styles.starIcon}>⭐</Text>
            <Text style={styles.rating}>4.7</Text>
            <Text style={styles.reviews}>93 reviews</Text>
          </View>
          
          <View style={styles.gradeSection}>
            <Text style={styles.gradeIcon}>🏆</Text>
            <Text style={styles.grade}>Grade: 1</Text>
            <Text style={styles.gradeSubtext}>(Excellent)</Text>
          </View>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Text style={styles.infoIcon}>👑</Text>
              </View>
              <Text style={styles.infoText}>12 Year of experince</Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Text style={styles.infoIcon}>✓</Text>
              </View>
              <Text style={styles.infoText}>64 (Projects)</Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Text style={styles.infoIcon}>💰</Text>
              </View>
              <Text style={styles.infoText}>Contact for Pricing</Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Text style={styles.infoIcon}>📍</Text>
              </View>
              <Text style={styles.infoText}>{user?.location || 'Location'}</Text>
            </View>
          </View>
        </View>

        {/* Best Of Binyaan Service Section */}
        <BestOfBinyaanService
          onEditPress={handleEditBestOfBinyaan}
        />

        {/* Highlights Section */}
        <View style={styles.highlightsContainer}>
          <View style={styles.highlightsHeader}>
            <Text style={styles.highlightsTitle}>Highlights</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.highlightsScroll}>
            <View style={styles.highlightItem}>
              <View style={styles.highlightIcon}>
                <Text style={styles.highlightIconText}>M</Text>
                <TouchableOpacity style={styles.highlightAddButton}>
                  <Text style={styles.highlightAddButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.highlightLabel}>Add Highlights</Text>
            </View>
            <View style={styles.highlightItem}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' }}
                style={styles.highlightImage}
              />
              <Text style={styles.highlightLabel}>Team</Text>
            </View>
            <View style={styles.highlightItem}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' }}
                style={styles.highlightImage}
              />
              <Text style={styles.highlightLabel}>New project</Text>
            </View>
            <View style={styles.highlightItem}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' }}
                style={styles.highlightImage}
              />
              <Text style={styles.highlightLabel}>Site Visit</Text>
            </View>
          </ScrollView>
        </View>

        {/* Profile Tabs */}
        <ProfileTabs
          activeTab={activeTab}
          onTabPress={setActiveTab}
        />
        
        {/* Tab Content */}
        <View style={styles.content}>
          {renderContent()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.md,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  authMessage: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.md,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
  offlineIndicator: {
    backgroundColor: COLORS.warning,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  offlineText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  // Hero Image Section
  heroContainer: {
    position: 'relative',
    height: 200,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  topRightIcons: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  iconText: {
    fontSize: 18,
  },
  profilePictureContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#666666',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileInitial: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addButton: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  editIcon: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  // Company Profile Section
  companyProfileContainer: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.lg,
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderBottomWidth: 0,
  },
  companyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginRight: 8,
  },
  verificationBadge: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  followingFollowers: {
    alignItems: 'flex-end',
  },
  followBox: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
    minWidth: 60,
  },
  followNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  followLabel: {
    fontSize: 12,
    color: '#666666',
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  starIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  rating: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginRight: 8,
  },
  reviews: {
    fontSize: 14,
    color: '#666666',
    textDecorationLine: 'underline',
  },
  gradeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  gradeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  grade: {
    fontSize: 16,
    color: '#000000',
    fontWeight: 'bold',
    marginRight: 4,
  },
  gradeSubtext: {
    fontSize: 14,
    color: '#666666',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: SPACING.sm,
  },
  infoIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  infoIcon: {
    fontSize: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#000000',
    flex: 1,
  },
  // Highlights Section
  highlightsContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  highlightsHeader: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  highlightsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  highlightsScroll: {
    paddingHorizontal: SPACING.lg,
  },
  highlightItem: {
    alignItems: 'center',
    marginRight: SPACING.lg,
    minWidth: 80,
  },
  highlightIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#666666',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B35',
    marginBottom: 8,
    position: 'relative',
  },
  highlightIconText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  highlightAddButton: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  highlightAddButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  highlightImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#FF6B35',
    marginBottom: 8,
  },
  highlightLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  // Business Card Container
  businessCardContainer: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.lg,
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  businessCardText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  businessCardSubtext: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
}); 