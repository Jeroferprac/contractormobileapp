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
import { useAuth } from '../../context/AuthContext';
import profileService from '../../services/profileService';
import { User } from '../../types/api';
import { showImagePickerOptions, createFormDataForAvatar, validateImageSize, validateImageType } from '../../utils/imagePicker';
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
      console.error('Failed to load user profile:', err);
      // If it's a network error, show a more user-friendly message
      if (err.name === 'NetworkError' || err.message?.includes('Network error')) {
        setError('Unable to connect to server. Please check your internet connection and try again.');
      } else {
        setError(err.message || 'Failed to load profile');
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
    try {
      const imageResult = await showImagePickerOptions();
      if (!imageResult) {
        return;
      }

      // Validate image
      if (!validateImageType(imageResult.type)) {
        Alert.alert(
          'Invalid Image Type',
          'Please select a JPEG, PNG, or WebP image.',
          [{ text: 'OK' }]
        );
        return;
      }

      if (!validateImageSize(imageResult.size, 5)) {
        Alert.alert(
          'Image Too Large',
          'Please select an image smaller than 5MB.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Create form data and upload
      const formData = createFormDataForAvatar(imageResult);
      const response = await profileService.uploadAvatar(formData);
      
      // Update the profile user with new avatar URL
      if (response.avatar_url) {
        setProfileUser(prev => prev ? { ...prev, avatar_url: response.avatar_url } : null);
        Alert.alert('Success', 'Profile picture updated successfully!');
      }
    } catch (err: any) {
      console.error('Failed to upload avatar:', err);
      Alert.alert('Error', err.message || 'Failed to upload profile picture');
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

    return {
      name: apiUser.full_name || 'User',
      company: apiUser.company || apiUser.job_title || 'Professional',
      description: apiUser.bio || '',
      posts: 0,
      followers: 0,
      profileImage: apiUser.avatar_url,
      headerImage: undefined
    };
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
    switch (activeTab) {
      case 'posts':
        return (
          <PostsTab
            posts={mockPosts}
            onCreatePost={handleCreatePost}
          />
        );
      case 'activity':
        return (
          <ActivityTab
            activities={mockActivities}
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
        <ProfileHeader
          user={transformUserForHeader(user)}
          onEditProfile={handleEditProfile}
          onShare={handleShare}
          onAvatarPress={handleAvatarPress}
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