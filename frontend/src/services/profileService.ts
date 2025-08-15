import apiService from '../api/api';
import { User } from '../types/api';

export interface ProfileUpdateData {
  full_name?: string;
  bio?: string;
  phone?: string;
  location?: string;
  website?: string;
  company?: string;
  job_title?: string;
  social_media?: {
    linkedin?: string;
    instagram?: string;
    facebook?: string;
  };
}

class ProfileService {
  async getUserProfile(): Promise<User> {
    console.log('🔍 [ProfileService] Calling getUserProfile...');
    try {
      const response = await apiService.getUserProfile();
      console.log('✅ [ProfileService] getUserProfile response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [ProfileService] getUserProfile error:', error);
      throw error;
    }
  }

  async updateUserProfile(profileData: ProfileUpdateData): Promise<User> {
    console.log('🔍 [ProfileService] Calling updateUserProfile...');
    try {
      const response = await apiService.updateUserProfile(profileData);
      console.log('✅ [ProfileService] Profile updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [ProfileService] Profile update failed:', error);
      throw error;
    }
  }

  async uploadAvatar(imageData: FormData): Promise<{ avatar_url: string }> {
    console.log('🔍 [ProfileService] Calling uploadAvatar...');
    console.log('🔍 [ProfileService] Received imageData:', imageData);
    console.log('🔍 [ProfileService] Type of received imageData:', typeof imageData);
    console.log('🔍 [ProfileService] Received imageData has append method:', typeof imageData.append === 'function');
    
    // Defensive check for valid FormData
    if (!imageData || typeof imageData !== 'object') {
      console.error('❌ [ProfileService] Invalid imageData received. It is not a FormData object or is undefined/null.');
      throw new Error('Invalid image data provided for upload. Please try again.');
    }
    
    try {
      const response = await apiService.uploadAvatar(imageData);
      console.log('✅ [ProfileService] Avatar uploaded successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [ProfileService] Avatar upload failed:', error);
      throw error;
    }
  }

  async deleteAvatar(): Promise<void> {
    console.log('🔍 [ProfileService] Calling deleteAvatar...');
    try {
      await apiService.deleteAvatar();
      console.log('✅ [ProfileService] Avatar deleted successfully');
    } catch (error) {
      console.error('❌ [ProfileService] Avatar deletion failed:', error);
      throw error;
    }
  }
}

export const profileService = new ProfileService();
export default profileService;
