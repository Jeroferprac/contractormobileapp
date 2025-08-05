import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { StatusBar } from '../../components/StatusBar';
import { ProfileHeader } from '../../components/ProfileHeader';
import { ProfileTabs, ProfileTabType } from '../../components/ProfileTabs';
import { BottomNavigation, BottomTabType } from '../../components/BottomNavigation';
import {
  PostsTab,
  ActivityTab,
  SavedTab,
  AboutTab,
  AffiliateTab,
} from '../../components/ProfileContent';
import { COLORS } from '../../constants/colors';
import {
  mockUser,
  mockPosts,
  mockActivities,
  mockSavedItems,
  mockAboutUser,
  mockAffiliateCompanies,
} from '../../data/mockProfileData';

interface ProfileScreenProps {
  navigation?: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<ProfileTabType>('posts');
  const [activeBottomTab, setActiveBottomTab] = useState<BottomTabType>('profile');

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Edit profile functionality would be implemented here');
  };

  const handleShare = () => {
    Alert.alert('Share Profile', 'Share profile functionality would be implemented here');
  };

  const handleCreatePost = () => {
    Alert.alert('Create Post', 'Create post functionality would be implemented here');
  };

  const handleContactPress = (type: string, value: string) => {
    Alert.alert(`${type}`, `Opening ${type}: ${value}`);
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

  const handleBottomTabPress = (tab: BottomTabType) => {
    setActiveBottomTab(tab);
    // In a real app, this would navigate to different screens
    if (tab !== 'profile') {
      Alert.alert('Navigation', `Navigate to ${tab} screen`);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'posts':
        return <PostsTab posts={mockPosts} onCreatePost={handleCreatePost} />;
      case 'activity':
        return <ActivityTab activities={mockActivities} />;
      case 'saved':
        return <SavedTab savedItems={mockSavedItems} onItemPress={handleSavedItemPress} />;
      case 'about':
        return <AboutTab user={mockAboutUser} onContactPress={handleContactPress} />;
      case 'affiliate':
        return (
          <AffiliateTab
            companies={mockAffiliateCompanies}
            onJoinNow={handleAffiliateJoinNow}
            onCompanyPress={handleAffiliateCompanyPress}
          />
        );
      default:
        return <PostsTab posts={mockPosts} onCreatePost={handleCreatePost} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      <ProfileHeader
        user={mockUser}
        onEditProfile={handleEditProfile}
        onShare={handleShare}
      />
      <ProfileTabs activeTab={activeTab} onTabPress={setActiveTab} />
      <View style={styles.content}>
        {renderContent()}
      </View>
      <BottomNavigation
        activeTab={activeBottomTab}
        onTabPress={handleBottomTabPress}
      />
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
}); 