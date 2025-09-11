import apiService from '../api/api';

export interface CompanyProfile {
  id: string;
  name: string;
  description: string;
  logo_url?: string;
  header_image_url?: string;
  rating: number;
  review_count: number;
  grade: string;
  grade_description: string;
  experience_years: number;
  project_count: number;
  pricing_info: string;
  location: string;
  contact_email: string;
  contact_phone: string;
  website?: string;
  verified: boolean;
  following_count: number;
  followers_count: number;
}

export interface CompanyProject {
  id: string;
  title: string;
  description: string;
  image_url: string;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  completion_percentage: number;
  start_date: string;
  end_date?: string;
  client_name: string;
  project_type: string;
  budget?: number;
  location: string;
}

export interface CompanyReview {
  id: string;
  customer_name: string;
  customer_avatar_url?: string;
  rating: number;
  comment: string;
  date: string;
  project_name: string;
  project_id: string;
  reply?: string;
  reply_date?: string;
}

export interface CompanyCredential {
  id: string;
  title: string;
  issuer: string;
  issue_date: string;
  expiry_date?: string;
  status: 'active' | 'expired' | 'pending';
  type: 'license' | 'certification' | 'accreditation';
  document_url?: string;
  verification_url?: string;
}

export interface CompanyAward {
  id: string;
  title: string;
  year: string;
  description: string;
  issuer: string;
  image_url?: string;
  verification_url?: string;
}

export interface CompanyStats {
  total_projects: number;
  completed_projects: number;
  active_projects: number;
  total_revenue: number;
  average_rating: number;
  total_reviews: number;
  customer_satisfaction: number;
}

class CompanyService {
  async getCompanyProfile(): Promise<CompanyProfile> {
    try {
      const response = await apiService.getCompanyProfile();
      return response.data;
    } catch (error) {
      console.error('❌ [CompanyService] Failed to get company profile:', error);
      throw error;
    }
  }

  async updateCompanyProfile(profileData: Partial<CompanyProfile>): Promise<CompanyProfile> {
    try {
      const response = await apiService.updateCompanyProfile(profileData);
      return response.data;
    } catch (error) {
      console.error('❌ [CompanyService] Failed to update company profile:', error);
      throw error;
    }
  }

  async getCompanyProjects(): Promise<CompanyProject[]> {
    try {
      const response = await apiService.getCompanyProjects();
      return response.data;
    } catch (error) {
      console.error('❌ [CompanyService] Failed to get company projects:', error);
      throw error;
    }
  }

  async createCompanyProject(projectData: Partial<CompanyProject>): Promise<CompanyProject> {
    try {
      const response = await apiService.createCompanyProject(projectData);
      return response.data;
    } catch (error) {
      console.error('❌ [CompanyService] Failed to create company project:', error);
      throw error;
    }
  }

  async updateCompanyProject(projectId: string, projectData: Partial<CompanyProject>): Promise<CompanyProject> {
    try {
      const response = await apiService.updateCompanyProject(projectId, projectData);
      return response.data;
    } catch (error) {
      console.error('❌ [CompanyService] Failed to update company project:', error);
      throw error;
    }
  }

  async deleteCompanyProject(projectId: string): Promise<void> {
    try {
      await apiService.deleteCompanyProject(projectId);
    } catch (error) {
      console.error('❌ [CompanyService] Failed to delete company project:', error);
      throw error;
    }
  }

  async getCompanyReviews(): Promise<CompanyReview[]> {
    try {
      const response = await apiService.getCompanyReviews();
      return response.data;
    } catch (error) {
      console.error('❌ [CompanyService] Failed to get company reviews:', error);
      throw error;
    }
  }

  async replyToReview(reviewId: string, replyData: { reply: string }): Promise<CompanyReview> {
    try {
      const response = await apiService.replyToReview(reviewId, replyData);
      return response.data;
    } catch (error) {
      console.error('❌ [CompanyService] Failed to reply to review:', error);
      throw error;
    }
  }

  async getCompanyCredentials(): Promise<CompanyCredential[]> {
    try {
      const response = await apiService.getCompanyCredentials();
      return response.data;
    } catch (error) {
      console.error('❌ [CompanyService] Failed to get company credentials:', error);
      throw error;
    }
  }

  async addCompanyCredential(credentialData: Partial<CompanyCredential>): Promise<CompanyCredential> {
    try {
      const response = await apiService.addCompanyCredential(credentialData);
      return response.data;
    } catch (error) {
      console.error('❌ [CompanyService] Failed to add company credential:', error);
      throw error;
    }
  }

  async updateCompanyCredential(credentialId: string, credentialData: Partial<CompanyCredential>): Promise<CompanyCredential> {
    try {
      const response = await apiService.updateCompanyCredential(credentialId, credentialData);
      return response.data;
    } catch (error) {
      console.error('❌ [CompanyService] Failed to update company credential:', error);
      throw error;
    }
  }

  async deleteCompanyCredential(credentialId: string): Promise<void> {
    try {
      await apiService.deleteCompanyCredential(credentialId);
    } catch (error) {
      console.error('❌ [CompanyService] Failed to delete company credential:', error);
      throw error;
    }
  }

  async getCompanyStats(): Promise<CompanyStats> {
    try {
      const response = await apiService.getCompanyStats();
      return response.data;
    } catch (error) {
      console.error('❌ [CompanyService] Failed to get company stats:', error);
      throw error;
    }
  }

  async getCompanyAwards(): Promise<CompanyAward[]> {
    try {
      const response = await apiService.getCompanyAwards();
      return response.data;
    } catch (error) {
      console.error('❌ [CompanyService] Failed to get company awards:', error);
      throw error;
    }
  }

  async addCompanyAward(awardData: Partial<CompanyAward>): Promise<CompanyAward> {
    try {
      const response = await apiService.addCompanyAward(awardData);
      return response.data;
    } catch (error) {
      console.error('❌ [CompanyService] Failed to add company award:', error);
      throw error;
    }
  }

  async updateCompanyAward(awardId: string, awardData: Partial<CompanyAward>): Promise<CompanyAward> {
    try {
      const response = await apiService.updateCompanyAward(awardId, awardData);
      return response.data;
    } catch (error) {
      console.error('❌ [CompanyService] Failed to update company award:', error);
      throw error;
    }
  }

  async deleteCompanyAward(awardId: string): Promise<void> {
    try {
      await apiService.deleteCompanyAward(awardId);
    } catch (error) {
      console.error('❌ [CompanyService] Failed to delete company award:', error);
      throw error;
    }
  }
}

export const companyService = new CompanyService();
export default companyService;
