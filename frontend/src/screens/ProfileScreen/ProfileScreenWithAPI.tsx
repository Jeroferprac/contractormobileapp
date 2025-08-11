import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { StatusBar } from '../../components/StatusBar';

import { ProfileHeader } from '../../components/ProfileHeader';
import { ProfileTabs, ProfileTabType } from '../../components/ProfileTabs';
import {
  PostsTab,
  ActivityTab,
  SavedTab,
  AboutTab,
  AffiliateTab,
} from '../../components/ProfileContent';
import { AuthTest } from '../../components';
import { COLORS } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../api/api';
import { User as ApiUser, Service, Booking } from '../../types/api';
import { Post, ActivityItem, SavedItem, AffiliateCompany } from '../../types/profile';

// Define the profile user type that combines auth user and API user data
interface ProfileUser {
  id: string;
  name: string;
  company: string;
  description: string;
  posts: number;
  followers: number;
  following: number;
  profileImage?: string;
  headerImage?: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  socialMedia: {
    linkedin?: string;
    instagram?: string;
    facebook?: string;
  };
  joinedDate: string;
  handle?: string;
  isVerified: boolean;
  isActive: boolean;
}

interface ProfileScreenWithAPIProps {
}

export const ProfileScreenWithAPI: React.FC<ProfileScreenWithAPIProps> = () => {
  const { user: authUser, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTabType>('posts');
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [affiliateCompanies, setAffiliateCompanies] = useState<AffiliateCompany[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile data and related data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // If we have auth user data, use it directly
        if (authUser && isAuthenticated) {
          // Try to get fresh data from API
          try {
            // Fetch user profile
            const userResponse = await apiService.getUserProfile();
            const apiUser: ApiUser = userResponse.data;
            
            // Fetch services and bookings for additional data
            const [servicesResponse, bookingsResponse] = await Promise.all([
              apiService.getServices(),
              apiService.getBookings()
            ]);
            
            const services: Service[] = servicesResponse.data;
            const bookings: Booking[] = bookingsResponse.data;
            
            // Transform services and bookings into posts, activities, and saved items
            const transformedPosts: Post[] = services.slice(0, 5).map((service, index) => ({
              id: service.id,
              caption: service.description,
              image: `https://images.unsplash.com/photo-${index + 1}?w=800`,
              timestamp: `Posted ${index + 1} day${index + 1 !== 1 ? 's' : ''} ago`,
              likes: Math.floor(Math.random() * 100),
              comments: Math.floor(Math.random() * 20),
              shares: Math.floor(Math.random() * 10),
            }));
            
            const transformedActivities: ActivityItem[] = bookings.slice(0, 5).map((booking, _index) => ({
              id: booking.id,
              type: 'message',
              title: `Booking for ${services.find(s => s.id === booking.service_id)?.name || 'Service'} - Status: ${booking.status}`,
              timestamp: new Date(booking.created_at).toLocaleDateString(),
              icon: 'message',
            }));
            
            const transformedSavedItems: SavedItem[] = services.slice(0, 3).map((service, index) => ({
              id: service.id,
              title: service.name,
              image: `https://images.unsplash.com/photo-${index + 1}?w=400`,
              type: index % 2 === 0 ? 'project' : 'design',
            }));
            
            // Use API data with fallback to auth data
            const combinedUser: ProfileUser = {
              id: apiUser.id,
              name: apiUser.full_name || authUser.full_name || 'User',
              company: apiUser.role || authUser.role || 'Company',
              description: `A ${apiUser.role || authUser.role || 'professional'} with expertise in construction management.`,
              posts: transformedPosts.length,
              followers: Math.floor(Math.random() * 1000),
              following: 50,
              profileImage: apiUser.avatar_data && apiUser.avatar_mimetype 
                ? `data:${apiUser.avatar_mimetype};base64,${apiUser.avatar_data}` 
                : undefined,
              headerImage: undefined,
              email: apiUser.email || authUser.email || '',
              phone: apiUser.phone || authUser.phone || '',
              address: 'Address not set',
              website: 'Website not set',
              socialMedia: {
                linkedin: undefined,
                instagram: undefined,
                facebook: undefined,
              },
              joinedDate: new Date(apiUser.created_at || authUser.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long'
              }),
              handle: `@${(apiUser.full_name || authUser.full_name || 'user').toLowerCase().replace(/\s+/g, '_')}`,
              isVerified: apiUser.is_verified || authUser.is_verified || false,
              isActive: apiUser.is_active || authUser.is_active || false,
            };
            
            // Set all data
            setProfileUser(combinedUser);
            setPosts(transformedPosts);
            setActivities(transformedActivities);
            setSavedItems(transformedSavedItems);
            
            // Create mock affiliate companies for now
            const mockAffiliateCompanies: AffiliateCompany[] = [
              {
                id: '1',
                name: 'Company A',
                logo: 'A',
                joinedDate: 'Jan 15, 2024',
                revenue: '$200',
                status: 'active',
              },
              {
                id: '2',
                name: 'Company B',
                logo: 'B',
                joinedDate: 'Feb 20, 2024',
                revenue: '$150',
                status: 'pending',
              },
              {
                id: '3',
                name: 'Company C',
                logo: 'C',
                joinedDate: 'Mar 10, 2024',
                revenue: '$0',
                status: 'inactive',
              },
            ];
            
            setAffiliateCompanies(mockAffiliateCompanies);
          } catch (apiError: any) {
            // Better error handling for API errors
            const errorMessage = apiError?.response?.data?.message || apiError?.message || apiError?.detail || 'Unknown error occurred';
            console.error('Failed to fetch data from API:', errorMessage, apiError);
            // Fallback to auth user data with mock data
            const fallbackUser: ProfileUser = {
              id: authUser.id,
              name: authUser.full_name || 'User',
              company: authUser.role || 'Company',
              description: `A ${authUser.role || 'professional'} with expertise in construction management.`,
              posts: 0,
              followers: 0,
              following: 50,
              profileImage: authUser.avatar_data && authUser.avatar_mimetype 
                ? `data:${authUser.avatar_mimetype};base64,${authUser.avatar_data}` 
                : undefined,
              headerImage: undefined,
              email: authUser.email || '',
              phone: authUser.phone || '',
              address: 'Address not set',
              website: 'Website not set',
              socialMedia: {
                linkedin: undefined,
                instagram: undefined,
                facebook: undefined,
              },
              joinedDate: new Date(authUser.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long'
              }),
              handle: `@${(authUser.full_name || 'user').toLowerCase().replace(/\s+/g, '_')}`,
              isVerified: authUser.is_verified || false,
              isActive: authUser.is_active || false,
            };
            
            setProfileUser(fallbackUser);
            
            // Set mock data for other tabs
            setPosts([
              {
                id: '1',
                caption: 'Just completed a major renovation project for a beautiful Victorian home. The transformation included kitchen remodeling, bathroom updates, and exterior painting. The client was thrilled with the results!',
                image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
                timestamp: '2 days ago',
                likes: 24,
                comments: 8,
                shares: 3,
              },
            ]);
            
            setActivities([
              {
                id: '1',
                type: 'message',
                title: 'Ahmed from Premier Construction sent you a message',
                timestamp: '2 days ago',
                icon: 'message',
              },
              {
                id: '2',
                type: 'save',
                title: 'You saved Modern Pendant Light Fixture to favorite',
                timestamp: '2 days ago',
                icon: 'bookmark',
              },
              {
                id: '3',
                type: 'review',
                title: 'You reviewed Artisan Design Studio',
                timestamp: '',
                icon: 'star',
              },
            ]);
            
            setSavedItems([
              {
                id: '1',
                title: 'Cornerstone Builders, San Francisco, CA',
                image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
                type: 'project',
              },
              {
                id: '2',
                title: 'Cornerstone Builders, San Francisco, CA',
                image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
                type: 'design',
              },
            ]);
            
            // Create mock affiliate companies
            const mockAffiliateCompanies: AffiliateCompany[] = [
              {
                id: '1',
                name: 'Company A',
                logo: 'A',
                joinedDate: 'Jan 15, 2024',
                revenue: '$200',
                status: 'active',
              },
              {
                id: '2',
                name: 'Company B',
                logo: 'B',
                joinedDate: 'Feb 20, 2024',
                revenue: '$150',
                status: 'pending',
              },
              {
                id: '3',
                name: 'Company C',
                logo: 'C',
                joinedDate: 'Mar 10, 2024',
                revenue: '$0',
                status: 'inactive',
              },
            ];
            
            setAffiliateCompanies(mockAffiliateCompanies);
          }
        } else {
          // No auth user data available
          setError('No user data available');
        }
      } catch (err: any) {
        console.error('Failed to process user profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authUser, isAuthenticated]);

  const handleEditProfile = () => {
    // Test profile update functionality
    const testProfileData = {
      full_name: 'Test User',
      email: 'test@example.com',
      phone: '123-456-7890',
      role: 'Test Role'
    };
    updateProfile(testProfileData);
  };

  const updateProfile = async (profileData: Partial<ApiUser>) => {
    try {
      setLoading(true);
      const response = await apiService.updateUserProfile(profileData);
      const updatedUser: ApiUser = response.data;
      
      // Update the profileUser state with the updated data
      if (profileUser) {
        setProfileUser({
          ...profileUser,
          name: updatedUser.full_name || profileUser.name,
          email: updatedUser.email || profileUser.email,
          phone: updatedUser.phone || profileUser.phone,
          company: updatedUser.role || profileUser.company,
        });
      }
      
      console.log('Profile updated successfully:', updatedUser);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (err) {
      console.error('Failed to update profile:', err);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  // Function to handle share action
  const handleShare = () => {
    Alert.alert('Share', 'Share functionality would be implemented here');
  };

  // Function to handle avatar upload
  const handleUploadAvatar = (_imageData: FormData) => {
    Alert.alert('Upload Avatar', 'Avatar upload functionality would be implemented here');
  };

  // Function to handle avatar deletion
  const handleDeleteAvatar = () => {
    Alert.alert('Delete Avatar', 'Avatar deletion functionality would be implemented here');
  };

  // Function to render content based on active tab
  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingIndicator} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text>{error}</Text>
        </View>
      );
    }

    switch (activeTab) {
      case 'posts':
        return <PostsTab posts={posts} onCreatePost={handleEditProfile} />;
      case 'activity':
        return <ActivityTab activities={activities} />;
      case 'saved':
        return <SavedTab savedItems={savedItems} onItemPress={() => {}} />;
      case 'about':
        return profileUser ? <AboutTab user={profileUser} onContactPress={() => {}} /> : null;
      case 'affiliate':
        return <AffiliateTab companies={affiliateCompanies} onJoinNow={() => {}} onCompanyPress={() => {}} />;
      case 'test':
        return <AuthTest />; // Render AuthTest component when test tab is active
      default:
        return <PostsTab posts={posts} onCreatePost={handleEditProfile} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      {profileUser && (
        <ProfileHeader
          user={{
            name: profileUser.name,
            company: profileUser.company,
            description: profileUser.description,
            posts: profileUser.posts,
            followers: profileUser.followers,
            following: profileUser.following,
            profileImage: profileUser.profileImage,
            headerImage: profileUser.headerImage,
            handle: profileUser.handle,
            joinedDate: profileUser.joinedDate,
          }}
          onEditProfile={handleEditProfile}
          onShare={handleShare}
          onUploadAvatar={handleUploadAvatar}
          onDeleteAvatar={handleDeleteAvatar}
        />
      )}
      <ProfileTabs activeTab={activeTab} onTabPress={setActiveTab} />
      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
  },
});