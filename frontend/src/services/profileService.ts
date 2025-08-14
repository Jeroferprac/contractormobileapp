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
    const response = await apiService.getUserProfile();
    return response.data;
  }

  async updateUserProfile(profileData: ProfileUpdateData): Promise<User> {
    const response = await apiService.updateUserProfile(profileData);
    return response.data;
  }

  async uploadAvatar(imageData: FormData): Promise<{ avatar_url: string }> {
    const response = await apiService.uploadAvatar(imageData);
    return response.data;
  }

  async deleteAvatar(): Promise<void> {
    await apiService.deleteAvatar();
  }
}

export const profileService = new ProfileService();
export default profileService;
