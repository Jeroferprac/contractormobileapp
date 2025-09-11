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
} from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';
import { StatusBar } from '../../components/StatusBar';
import { ProfileHeader } from '../../components/ProfileHeader';
import { ProfileTabs, ProfileTabType } from '../../components/ProfileTabs';
import {
  PostsTab,
  ActivityTab,
  SavedTab,
  AffiliateTab,
  AboutTab,
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
  mockActivities,
  mockSavedItems,
  mockAffiliateCompanies,
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
      } else if (err.response?.status === 403) {
        setError('Access denied. You may not have permission to access this resource.');
      } else {
        setError(err.message || 'Failed to load profile');
      }
      
      // Fallback to auth user data if API fails
      if (authUser) {
  
        setProfileUser(authUser);
        setError(null); // Clear error since we have fallback data
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserProfile();
    setRefreshing(false);
  };

  const onRefresh = async () => {
    await handleRefresh();
  };

  const handleLoginRedirect = () => {
    navigation?.navigate('Login');
  };

  const handleEditProfile = () => {
    navigation?.navigate('ProfileEdit', { user });
  };

  const handleShare = () => {
    Alert.alert('Share Profile', 'Share profile functionality would be implemented here');
  };

  const handleCreatePost = () => {
    Alert.alert('Create Post', 'Create post functionality would be implemented here');
  };

  const handleContactPress = (type: string, value: string) => {
    switch (type) {
      case 'email':
        Alert.alert('Email', `Send email to: ${value}`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Email App', onPress: () => console.log('Open email app') },
        ]);
        break;
      case 'phone':
        Alert.alert('Phone', `Call: ${value}`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Call', onPress: () => console.log('Make phone call') },
        ]);
        break;
      default:
        Alert.alert(`${type}`, `Value: ${value}`);
    }
  };

  const handleSavedItemPress = (item: any) => {
    Alert.alert('Saved Item', `Opening saved item: ${item.title}`);
  };

  const handleAffiliateJoinNow = () => {
    Alert.alert('Join Affiliate Program', 'Affiliate program registration would be implemented here');
  };

  const handleAffiliateCompanyPress = (company: any) => {
    Alert.alert('Company Details', `Viewing details for ${company.name}`);
  };







  const handleAvatarPress = async () => {
    // Show options for avatar management
    Alert.alert(
      'Profile Picture',
      'What would you like to do?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove Picture',
          style: 'destructive',
          onPress: handleDeleteAvatar,
        },
        {
          text: 'Change Picture',
          onPress: handleUploadAvatar,
        },
      ]
    );
  };

  const handleUploadAvatar = async () => {
    try {
      setAvatarLoading(true);

      
      const imageResult = await showImagePickerOptions();
      
      
      if (!imageResult) {
        
        setAvatarLoading(false);
        return;
      }



      // Validate image
      if (!validateImageType(imageResult.type)) {

        Alert.alert(
          'Invalid Image Type',
          'Please select a JPEG, PNG, or WebP image.',
          [{ text: 'OK' }]
        );
        setAvatarLoading(false);
        return;
      }

      if (!validateImageSize(imageResult.size, 5)) {

        Alert.alert(
          'Image Too Large',
          'Please select an image smaller than 5MB.',
          [{ text: 'OK' }]
        );
        setAvatarLoading(false);
        return;
      }

      // Create form data and upload
      let formData;
      try {
        formData = createFormDataForAvatar(imageResult);
        
        // Simple validation - just check if it's an object
        if (!formData || typeof formData !== 'object') {
          throw new Error('FormData creation failed - invalid object');
        }
      } catch (formDataError) {
        console.error('❌ [ProfileScreen] FormData creation failed:', formDataError);
        throw new Error('Failed to create form data for image upload. Please try again.');
      }
      
      // Use direct fetch instead of profileService
      const token = await storageService.getAuthToken();
      const baseURL = getBaseURL();
      

      
      const uploadResponse = await fetch(`${baseURL}/users/upload-avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData
        },
        body: formData
      });
      
      if (uploadResponse.ok) {
        await uploadResponse.json();

        
        // Since the backend only returns a success message, we need to refresh the profile
        // to get the updated avatar URL

        

        
        Alert.alert('Success', 'Profile picture updated successfully! Refreshing profile data...');
        
        // Force an immediate refresh of the profile data to get the new avatar URL

        
        // Small delay to ensure backend has processed the upload
        setTimeout(async () => {
          try {
            await loadUserProfile();

          } catch (refreshError) {
            console.error('🔄 [ProfileScreen] Profile refresh failed:', refreshError);
            Alert.alert('Warning', 'Avatar uploaded but profile refresh failed. Please refresh manually.');
          }
        }, 1000);
      } else {
        const errorText = await uploadResponse.text();
        console.error('❌ [ProfileScreen] Avatar upload failed:', uploadResponse.status, errorText);
        throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
      }
    } catch (err: any) {
      console.error('Failed to upload avatar:', err);
      Alert.alert('Error', err.message || 'Failed to upload profile picture');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      // Show confirmation dialog
      Alert.alert(
        'Remove Profile Picture',
        'Are you sure you want to remove your profile picture?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              try {
                setAvatarLoading(true);
                await profileService.deleteAvatar();
                
                // Update the profile user by removing avatar URL
                setProfileUser(prev => prev ? { ...prev, avatar_url: undefined } : null);
                
                // Force re-render by updating the avatar key
        
                
                Alert.alert('Success', 'Profile picture removed successfully!');
              } catch (err: any) {
                console.error('Failed to delete avatar:', err);
                Alert.alert('Error', err.message || 'Failed to remove profile picture');
              } finally {
                setAvatarLoading(false);
              }
            },
          },
        ]
      );
    } catch (err: any) {
      console.error('Failed to delete avatar:', err);
      Alert.alert('Error', err.message || 'Failed to remove profile picture');
    }
  };

  // Transform auth user data to ProfileHeader props
  const transformUserForHeader = (apiUser: any) => {
    if (!apiUser) {
      return {
        name: 'User',
        company: 'Company',
        description: '',
        posts: 0,
        followers: 0,
        profileImage: undefined,
        headerImage: undefined
      };
    }

    // Check for avatar URL or create data URL from base64 data
    let profileImage: string | undefined;
    
    if (apiUser.avatar_url) {
      // If there's a direct URL, use it
      profileImage = apiUser.avatar_url;
    } else if (apiUser.avatar_data && apiUser.avatar_mimetype) {
      // If there's base64 data, create a data URL
      profileImage = `data:${apiUser.avatar_mimetype};base64,${apiUser.avatar_data}`;

    } else {
      // Check for other possible avatar field names
      profileImage = apiUser.avatar || apiUser.image_url || 
                    apiUser.profile_image || apiUser.picture || apiUser.photo;
    }
    
    const transformedUser = {
      name: apiUser.full_name || 'User',
      company: apiUser.company || apiUser.job_title || 'Professional',
      description: apiUser.bio || '',
      posts: 0,
      followers: 0,
      profileImage: profileImage,
      headerImage: undefined
    };



    return transformedUser;
  };

  // Transform auth user data to AboutTab props
  const transformUserForAbout = (apiUser: any) => {
    if (!apiUser) {
      return {
        description: '',
        email: '',
        phone: '',
        address: '',
        website: '',
        socialMedia: {},
        joinedDate: 'January 2023'
      };
    }

    return {
      description: apiUser.bio || '',
      email: apiUser.email || '',
      phone: apiUser.phone || 'No phone available',
      address: apiUser.location || 'No address available',
      website: apiUser.website || 'No website available',
      socialMedia: apiUser.social_media || {},
      joinedDate: apiUser.created_at ? new Date(apiUser.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      }) : 'January 2023'
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
      case 'posts':
        return (
          <PostsTab
            posts={mockPosts}
            userAvatar={userAvatar}
            userName={user?.full_name || 'User'}
            onCreatePost={handleCreatePost}
          />
        );
      case 'activity':
        return (
          <ActivityTab
            activities={mockActivities}
            userAvatar={userAvatar}
            userName={user?.full_name || 'User'}
          />
        );
      case 'saved':
        return (
          <SavedTab
            savedItems={mockSavedItems}
            onItemPress={handleSavedItemPress}
          />
        );
      case 'affiliate':
        return (
          <AffiliateTab
            companies={mockAffiliateCompanies}
            onJoinNow={handleAffiliateJoinNow}
            onCompanyPress={handleAffiliateCompanyPress}
          />
        );
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
          

          
          <ProfileHeader
            key={`profile-header-${user?.avatar_url || 'no-avatar'}`}
            user={transformUserForHeader(user)}
            onEditProfile={handleEditProfile}
            onShare={handleShare}
            onAvatarPress={avatarLoading ? undefined : handleAvatarPress}
            avatarLoading={avatarLoading}
          />
          

        
        <ProfileTabs
          activeTab={activeTab}
          onTabPress={setActiveTab}
        />
        
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
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
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
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  offlineIndicator: {
    backgroundColor: '#FFC107',
    padding: SPACING.sm,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  offlineText: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
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
    textAlign: 'center',
  },
  authMessage: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
}); 