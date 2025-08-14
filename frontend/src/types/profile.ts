export interface User {
  name: string;
  company: string;
  description: string;
  posts: number;
  followers: number;
  profileImage?: string;
  headerImage?: string;
}

export interface Post {
  id: string;
  caption: string;
  image: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
}

export interface ActivityItem {
  id: string;
  type: 'message' | 'save' | 'review' | 'like' | 'comment' | 'follow' | 'project' | 'certification' | 'meeting' | 'purchase' | 'booking' | 'payment';
  title: string;
  subtitle?: string;
  timestamp: string;
  icon: string;
}

export interface SavedItem {
  id: string;
  title: string;
  image: string;
  type: 'project' | 'design' | 'inspiration' | 'service' | 'supplier' | 'technology';
  description?: string;
  location?: string;
  rating?: number;
  savedDate?: string;
}

export interface AboutUser {
  description: string;
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
}

export interface AffiliateCompany {
  id: string;
  name: string;
  logo: string;
  joinedDate: string;
  revenue: string;
  status: 'active' | 'pending' | 'inactive';
  description?: string;
  projects?: number;
  rating?: number;
} 