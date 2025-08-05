import { User, Post, ActivityItem, SavedItem, AboutUser, AffiliateCompany } from '../types/profile';

export const mockUser: User = {
  name: 'John Doe',
  company: 'BPM Builders',
  description: 'Construction Manager with 10+ years of experience in residential and commercial projects.',
  posts: 50,
  followers: 100,
  profileImage: undefined,
  headerImage: undefined,
};

export const mockPosts: Post[] = [
  {
    id: '1',
    caption: 'Just completed a major renovation project for a beautiful Victorian home. The transformation included kitchen remodeling, bathroom updates, and exterior painting. The client was thrilled with the results!',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
    timestamp: '2 days ago',
    likes: 24,
    comments: 8,
    shares: 3,
  },
];

export const mockActivities: ActivityItem[] = [
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
];

export const mockSavedItems: SavedItem[] = [
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
];

export const mockAboutUser: AboutUser = {
  description: 'Construction Manager with 10+ years of experience in residential and commercial projects.',
  email: 'johndoe@example.com',
  phone: '+1 (555) 123-4567',
  address: '123 Main St, Anytown, USA',
  website: 'www.johndoe.com',
  socialMedia: {
    linkedin: 'https://linkedin.com/in/johndoe',
    instagram: 'https://instagram.com/johndoe',
    facebook: undefined,
  },
  joinedDate: 'January 2023',
};

export const mockAffiliateCompanies: AffiliateCompany[] = [
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