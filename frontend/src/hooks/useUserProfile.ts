import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { User } from '../types/api';
import { apiService } from '../api/api';

interface UseUserProfileReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<boolean>;
  uploadAvatar: (imageData: FormData) => Promise<boolean>;
  deleteAvatar: () => Promise<boolean>;
}

export const useUserProfile = (): UseUserProfileReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [useUserProfile] Refreshing user profile...');
      
      const response = await apiService.getUserProfile();
      setUser(response.data);
      console.log('✅ [useUserProfile] Profile refreshed successfully');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to load profile';
      setError(errorMessage);
      console.error('❌ [useUserProfile] Failed to refresh profile:', errorMessage);
      
      // Show user-friendly error message
      Alert.alert(
        'Profile Error',
        'Unable to load your profile. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (profileData: Partial<User>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [useUserProfile] Updating user profile...');
      
      const response = await apiService.updateUserProfile(profileData);
      setUser(response.data);
      console.log('✅ [useUserProfile] Profile updated successfully');
      
      Alert.alert(
        'Success',
        'Your profile has been updated successfully!',
        [{ text: 'OK' }]
      );
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to update profile';
      setError(errorMessage);
      console.error('❌ [useUserProfile] Failed to update profile:', errorMessage);
      
      Alert.alert(
        'Update Failed',
        errorMessage,
        [{ text: 'OK' }]
      );
      
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadAvatar = useCallback(async (imageData: FormData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [useUserProfile] Uploading avatar...');
      
      const response = await apiService.uploadAvatar(imageData);
      console.log('✅ [useUserProfile] Avatar uploaded successfully');
      
      // Refresh profile to get updated avatar
      await refreshProfile();
      
      Alert.alert(
        'Success',
        'Your profile picture has been updated successfully!',
        [{ text: 'OK' }]
      );
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to upload avatar';
      setError(errorMessage);
      console.error('❌ [useUserProfile] Failed to upload avatar:', errorMessage);
      
      Alert.alert(
        'Upload Failed',
        errorMessage,
        [{ text: 'OK' }]
      );
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshProfile]);

  const deleteAvatar = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [useUserProfile] Deleting avatar...');
      
      await apiService.deleteAvatar();
      console.log('✅ [useUserProfile] Avatar deleted successfully');
      
      // Refresh profile to remove avatar
      await refreshProfile();
      
      Alert.alert(
        'Success',
        'Your profile picture has been removed successfully!',
        [{ text: 'OK' }]
      );
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to delete avatar';
      setError(errorMessage);
      console.error('❌ [useUserProfile] Failed to delete avatar:', errorMessage);
      
      Alert.alert(
        'Delete Failed',
        errorMessage,
        [{ text: 'OK' }]
      );
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshProfile]);

  // Load profile on mount
  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  return {
    user,
    loading,
    error,
    refreshProfile,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
  };
};
