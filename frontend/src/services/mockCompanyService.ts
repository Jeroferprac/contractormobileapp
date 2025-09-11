import { 
  CompanyProfile, 
  CompanyProject, 
  CompanyReview, 
  CompanyCredential, 
  CompanyAward,
  CompanyStats 
} from './companyService';

// Mock company profile data
const mockCompanyProfile: CompanyProfile = {
  id: '1',
  name: 'Driven Builders',
  description: 'Leading construction company specializing in modern architectural designs, sustainable building practices, and innovative construction solutions. We deliver excellence in every project.',
  logo_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150',
  header_image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
  rating: 4.7,
  review_count: 93,
  grade: '1',
  grade_description: 'Excellent',
  experience_years: 12,
  project_count: 64,
  pricing_info: 'Contact for Pricing',
  location: 'Abu Dhabi, UAE',
  contact_email: 'info@drivenbuilders.ae',
  contact_phone: '+971 2 123 4567',
  website: 'https://drivenbuilders.ae',
  verified: true,
  following_count: 50,
  followers_count: 100,
};

// Mock company projects data
const mockCompanyProjects: CompanyProject[] = [
  {
    id: '1',
    title: 'Modern Villa Project',
    description: 'Contemporary 5-bedroom villa with sustainable design features',
    image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    status: 'in_progress',
    completion_percentage: 75,
    start_date: '2024-01-15',
    end_date: '2024-06-30',
    client_name: 'Ahmed Al Mansouri',
    project_type: 'Residential',
    budget: 2500000,
    location: 'Saadiyat Island, Abu Dhabi',
  },
  {
    id: '2',
    title: 'Office Complex Renovation',
    description: 'Complete renovation of 20-story office building',
    image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400',
    status: 'completed',
    completion_percentage: 100,
    start_date: '2023-08-01',
    end_date: '2024-02-28',
    client_name: 'Global Tech Solutions',
    project_type: 'Commercial',
    budget: 5000000,
    location: 'Al Maryah Island, Abu Dhabi',
  },
  {
    id: '3',
    title: 'Shopping Mall Extension',
    description: 'Extension of existing shopping mall with new wing',
    image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
    status: 'planning',
    completion_percentage: 25,
    start_date: '2024-09-01',
    end_date: '2025-12-31',
    client_name: 'Retail Development Corp',
    project_type: 'Commercial',
    budget: 8000000,
    location: 'Yas Island, Abu Dhabi',
  },
  {
    id: '4',
    title: 'Residential Tower',
    description: 'Luxury residential tower with 200 units',
    image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400',
    status: 'in_progress',
    completion_percentage: 60,
    start_date: '2023-12-01',
    end_date: '2025-03-31',
    client_name: 'Luxury Properties Ltd',
    project_type: 'Residential',
    budget: 12000000,
    location: 'Corniche, Abu Dhabi',
  },
  {
    id: '5',
    title: 'Hospital Infrastructure',
    description: 'New hospital building with modern medical facilities',
    image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
    status: 'on_hold',
    completion_percentage: 40,
    start_date: '2024-03-01',
    end_date: '2026-06-30',
    client_name: 'Healthcare Authority',
    project_type: 'Healthcare',
    budget: 15000000,
    location: 'Al Ain, Abu Dhabi',
  },
  {
    id: '6',
    title: 'Educational Campus',
    description: 'University campus with multiple academic buildings',
    image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9e1?w=400',
    status: 'planning',
    completion_percentage: 15,
    start_date: '2025-01-01',
    end_date: '2027-12-31',
    client_name: 'Education Ministry',
    project_type: 'Educational',
    budget: 20000000,
    location: 'Al Dhafra, Abu Dhabi',
  },
];

// Mock company reviews data
const mockCompanyReviews: CompanyReview[] = [
  {
    id: '1',
    customer_name: 'Ahmed Al Mansouri',
    customer_avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    rating: 5,
    comment: 'Excellent work! The team delivered our villa project on time and exceeded our expectations. The quality of craftsmanship is outstanding and the attention to detail is remarkable. Highly recommended!',
    date: '2 weeks ago',
    project_name: 'Modern Villa Project',
    project_id: '1',
    reply: 'Thank you Ahmed for your kind words! We\'re thrilled that you\'re happy with your new villa. It was a pleasure working with you.',
    reply_date: '1 week ago',
  },
  {
    id: '2',
    customer_name: 'Sarah Johnson',
    customer_avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
    rating: 5,
    comment: 'Professional service from start to finish. The office complex renovation was completed perfectly and within budget. The team was always responsive and kept us updated throughout the process.',
    date: '1 month ago',
    project_name: 'Office Complex Renovation',
    project_id: '2',
  },
  {
    id: '3',
    customer_name: 'Mohammed Al Rashid',
    customer_avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    rating: 4,
    comment: 'Great quality work and good communication throughout the project. Very satisfied with the results. The only minor issue was a slight delay due to weather conditions, but the team handled it professionally.',
    date: '2 months ago',
    project_name: 'Shopping Mall Extension',
    project_id: '3',
    reply: 'Thank you Mohammed! We appreciate your understanding about the weather delay. We\'re glad you\'re satisfied with the final result.',
    reply_date: '2 months ago',
  },
  {
    id: '4',
    customer_name: 'Fatima Al Zahra',
    customer_avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    rating: 5,
    comment: 'Outstanding craftsmanship and attention to detail. Our residential project turned out beautiful and exactly as envisioned. The team was professional, skilled, and a pleasure to work with.',
    date: '3 months ago',
    project_name: 'Residential Tower',
    project_id: '4',
  },
  {
    id: '5',
    customer_name: 'David Chen',
    customer_avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    rating: 5,
    comment: 'Exceptional service and quality. The team went above and beyond to ensure our project was completed to the highest standards. Highly recommend Driven Builders for any construction needs.',
    date: '4 months ago',
    project_name: 'Luxury Villa Complex',
    project_id: '5',
  },
];

// Mock company credentials data
const mockCompanyCredentials: CompanyCredential[] = [
  {
    id: '1',
    title: 'General Contractor License',
    issuer: 'Abu Dhabi Municipality',
    issue_date: '2020-01-15',
    expiry_date: '2025-01-15',
    status: 'active',
    type: 'license',
    document_url: 'https://example.com/documents/contractor-license.pdf',
    verification_url: 'https://ad.gov.ae/verify/12345',
  },
  {
    id: '2',
    title: 'ISO 9001:2015 Quality Management',
    issuer: 'International Organization for Standardization',
    issue_date: '2021-03-20',
    expiry_date: '2024-03-20',
    status: 'active',
    type: 'certification',
    document_url: 'https://example.com/documents/iso9001.pdf',
    verification_url: 'https://www.iso.org/certification/67890',
  },
  {
    id: '3',
    title: 'Safety Management System',
    issuer: 'OHSAS 18001',
    issue_date: '2022-06-10',
    status: 'active',
    type: 'certification',
    document_url: 'https://example.com/documents/ohsas18001.pdf',
    verification_url: 'https://www.ohsas.org/verify/11111',
  },
  {
    id: '4',
    title: 'Environmental Management',
    issuer: 'ISO 14001:2015',
    issue_date: '2020-09-05',
    expiry_date: '2023-09-05',
    status: 'expired',
    type: 'certification',
    document_url: 'https://example.com/documents/iso14001.pdf',
    verification_url: 'https://www.iso.org/certification/22222',
  },
  {
    id: '5',
    title: 'Building Information Modeling',
    issuer: 'Autodesk',
    issue_date: '2023-01-10',
    status: 'active',
    type: 'accreditation',
    document_url: 'https://example.com/documents/bim-cert.pdf',
    verification_url: 'https://www.autodesk.com/verify/33333',
  },
  {
    id: '6',
    title: 'LEED Green Building Certification',
    issuer: 'U.S. Green Building Council',
    issue_date: '2022-11-15',
    status: 'active',
    type: 'certification',
    document_url: 'https://example.com/documents/leed-cert.pdf',
    verification_url: 'https://www.usgbc.org/verify/44444',
  },
];

// Mock company awards data
const mockCompanyAwards: CompanyAward[] = [
  {
    id: '1',
    title: 'Best Construction Company',
    year: '2024',
    description: 'Excellence in construction and project delivery',
    issuer: 'Binyaan Awards',
    image_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200',
    verification_url: 'https://binyaan-awards.ae/verify/55555',
  },
  {
    id: '2',
    title: 'Sustainable Building Award',
    year: '2024',
    description: 'Outstanding contribution to green building practices',
    issuer: 'Green Construction Council',
    image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200',
    verification_url: 'https://greenconstruction.org/verify/66666',
  },
  {
    id: '3',
    title: 'Customer Satisfaction Award',
    year: '2024',
    description: 'Highest customer satisfaction rating',
    issuer: 'UAE Business Excellence',
    image_url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=200',
    verification_url: 'https://uae-excellence.ae/verify/77777',
  },
];

// Mock company stats data
const mockCompanyStats: CompanyStats = {
  total_projects: 64,
  completed_projects: 45,
  active_projects: 12,
  total_revenue: 85000000,
  average_rating: 4.7,
  total_reviews: 93,
  customer_satisfaction: 96,
};

class MockCompanyService {
  async getCompanyProfile(): Promise<CompanyProfile> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockCompanyProfile;
  }

  async updateCompanyProfile(profileData: Partial<CompanyProfile>): Promise<CompanyProfile> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { ...mockCompanyProfile, ...profileData };
  }

  async getCompanyProjects(): Promise<CompanyProject[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockCompanyProjects;
  }

  async createCompanyProject(projectData: Partial<CompanyProject>): Promise<CompanyProject> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newProject: CompanyProject = {
      id: Date.now().toString(),
      title: projectData.title || 'New Project',
      description: projectData.description || 'Project description',
      image_url: projectData.image_url || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
      status: projectData.status || 'planning',
      completion_percentage: projectData.completion_percentage || 0,
      start_date: projectData.start_date || new Date().toISOString().split('T')[0],
      client_name: projectData.client_name || 'Client Name',
      project_type: projectData.project_type || 'Other',
      location: projectData.location || 'Abu Dhabi',
    };
    return newProject;
  }

  async updateCompanyProject(projectId: string, projectData: Partial<CompanyProject>): Promise<CompanyProject> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const project = mockCompanyProjects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');
    return { ...project, ...projectData };
  }

  async deleteCompanyProject(projectId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    // In a real implementation, this would remove the project from the array
    console.log('Project deleted:', projectId);
  }

  async getCompanyReviews(): Promise<CompanyReview[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return mockCompanyReviews;
  }

  async replyToReview(reviewId: string, replyData: { reply: string }): Promise<CompanyReview> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const review = mockCompanyReviews.find(r => r.id === reviewId);
    if (!review) throw new Error('Review not found');
    
    const updatedReview: CompanyReview = {
      ...review,
      reply: replyData.reply,
      reply_date: new Date().toISOString(),
    };
    
    return updatedReview;
  }

  async getCompanyCredentials(): Promise<CompanyCredential[]> {
    await new Promise(resolve => setTimeout(resolve, 700));
    return mockCompanyCredentials;
  }

  async addCompanyCredential(credentialData: Partial<CompanyCredential>): Promise<CompanyCredential> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newCredential: CompanyCredential = {
      id: Date.now().toString(),
      title: credentialData.title || 'New Credential',
      issuer: credentialData.issuer || 'Issuing Authority',
      issue_date: credentialData.issue_date || new Date().toISOString().split('T')[0],
      status: credentialData.status || 'pending',
      type: credentialData.type || 'certification',
    };
    return newCredential;
  }

  async updateCompanyCredential(credentialId: string, credentialData: Partial<CompanyCredential>): Promise<CompanyCredential> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const credential = mockCompanyCredentials.find(c => c.id === credentialId);
    if (!credential) throw new Error('Credential not found');
    return { ...credential, ...credentialData };
  }

  async deleteCompanyCredential(credentialId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    console.log('Credential deleted:', credentialId);
  }

  async getCompanyStats(): Promise<CompanyStats> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockCompanyStats;
  }

  async getCompanyAwards(): Promise<CompanyAward[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return mockCompanyAwards;
  }

  async addCompanyAward(awardData: Partial<CompanyAward>): Promise<CompanyAward> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newAward: CompanyAward = {
      id: Date.now().toString(),
      title: awardData.title || 'New Award',
      year: awardData.year || new Date().getFullYear().toString(),
      description: awardData.description || 'Award description',
      issuer: awardData.issuer || 'Awarding Organization',
    };
    return newAward;
  }

  async updateCompanyAward(awardId: string, awardData: Partial<CompanyAward>): Promise<CompanyAward> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const award = mockCompanyAwards.find(a => a.id === awardId);
    if (!award) throw new Error('Award not found');
    return { ...award, ...awardData };
  }

  async deleteCompanyAward(awardId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    console.log('Award deleted:', awardId);
  }
}

export const mockCompanyService = new MockCompanyService();
export default mockCompanyService;
