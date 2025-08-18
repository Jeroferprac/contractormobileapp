// Mock data for the contractor mobile app
import { User, Post, ActivityItem, SavedItem, AboutUser, AffiliateCompany } from '../types/profile';

export interface Service {
  id: string;
  title: string;
  image: string;
  badge?: string;
}

export interface Project {
  id: string;
  title: string;
  company: string;
  location: string;
  image: string;
  rating: number;
  reviews: number;
}

export interface Professional {
  id: string;
  name: string;
  type: 'contractor' | 'consultant' | 'supplier' | 'freelancer' | 'workshop';
  logo: string;
  backgroundImage?: string;
  rating: number;
  reviews: number;
  location: string;
  category: string;
  skills: string[];
  verified: boolean;
  tag: string;
}

export interface Review {
  id: string;
  company: string;
  location: string;
  rating: number;
  quote: string;
  image: string;
}

export interface Discount {
  id: string;
  title: string;
  description: string;
  discount: string;
  image: string;
}

export interface Filter {
  id: string;
  label: string;
  active: boolean;
}

export interface BeforeAfterProject {
  company: string;
  teamSize: number;
  beforeImage: string;
  afterImage: string;
}

// Services
export const mockServices: Service[] = [
  {
    id: '1',
    title: 'Interior Design',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
  },
  {
    id: '2',
    title: 'Renovation',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop',
    badge: 'Hot selling',
  },
  {
    id: '3',
    title: 'Landscaping',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
  },
  {
    id: '4',
    title: 'Plumbing',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
    badge: 'Fast',
  },
  {
    id: '5',
    title: 'Lighting',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
  },
  {
    id: '6',
    title: 'View More',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
  },
];

// Projects
export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Modern Kitchen Renovation',
    company: 'Cornerstone Builders',
    location: 'San Francisco, CA',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
    rating: 4.9,
    reviews: 127,
  },
  {
    id: '2',
    title: 'Luxury Bathroom Design',
    company: 'Cornerstone Builders',
    location: 'San Francisco, CA',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
    rating: 4.8,
    reviews: 89,
  },
  {
    id: '3',
    title: 'Office Space Transformation',
    company: 'Cornerstone Builders',
    location: 'San Francisco, CA',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
    rating: 4.7,
    reviews: 156,
  },
];

// Professionals
export const mockProfessionals: Professional[] = [
  // Contractors
  {
    id: '1',
    name: 'Precision Engineering',
    type: 'contractor',
    logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    backgroundImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=200&fit=crop',
    rating: 4.9,
    reviews: 100,
    location: 'Francisco, CA',
    category: 'Designing',
    skills: ['Interior Design', 'Space Planning'],
    verified: true,
    tag: 'Contractors',
  },
  {
    id: '2',
    name: 'مدار madar',
    type: 'contractor',
    logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    backgroundImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=200&fit=crop',
    rating: 4.8,
    reviews: 89,
    location: 'Dubai, UAE',
    category: 'Construction',
    skills: ['Building', 'Renovation'],
    verified: true,
    tag: 'Contractors',
  },
  
  // Consultants
  {
    id: '3',
    name: 'Precision Engineering',
    type: 'consultant',
    logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    backgroundImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop',
    rating: 4.9,
    reviews: 100,
    location: 'Francisco, CA',
    category: 'Designing',
    skills: ['Custom Furniture', 'Space Planning'],
    verified: true,
    tag: 'Consultants',
  },
  
  // Suppliers
  {
    id: '4',
    name: 'Bay Area Building Supply',
    type: 'supplier',
    logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    backgroundImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=200&fit=crop',
    rating: 4.9,
    reviews: 100,
    location: 'Francisco, CA',
    category: 'Designing',
    skills: ['Building Materials', 'Space Planning'],
    verified: true,
    tag: 'Suppliers',
  },
  {
    id: '5',
    name: 'مدار madar',
    type: 'supplier',
    logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    backgroundImage: 'https://images.unsplash.com/photo-1560435650-7470a0c9063a?w=400&h=200&fit=crop',
    rating: 4.9,
    reviews: 100,
    location: 'Dubai, UAE',
    category: 'Materials',
    skills: ['Supplies', 'Equipment'],
    verified: true,
    tag: 'Suppliers',
  },
  
  // Freelancers
  {
    id: '6',
    name: 'Ahmed Al Mahmood',
    type: 'freelancer',
    logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    backgroundImage: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=200&fit=crop',
    rating: 4.8,
    reviews: 132,
    location: 'Abu Dhabi, UAE',
    category: 'Interior Designer',
    skills: ['Space Planning', 'Color Consultation'],
    verified: true,
    tag: 'Freelancers',
  },
  {
    id: '7',
    name: 'Ahmed-Al',
    type: 'freelancer',
    logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    backgroundImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=200&fit=crop',
    rating: 4.7,
    reviews: 89,
    location: 'Dubai, UAE',
    category: 'Interior Designer',
    skills: ['Design', 'Consultation'],
    verified: true,
    tag: 'Freelancers',
  },
  
  // Workshops
  {
    id: '8',
    name: 'Master Woodworks',
    type: 'workshop',
    logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    backgroundImage: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=200&fit=crop',
    rating: 4.9,
    reviews: 100,
    location: 'Francisco, CA',
    category: 'Designing',
    skills: ['Custom Furniture', 'Space Planning'],
    verified: true,
    tag: 'Workshops',
  },
];

// Reviews
export const mockReviews: Review[] = [
  {
    id: '1',
    company: 'Driven Properties',
    location: 'San Francisco, CA',
    rating: 4.9,
    quote: 'My experience with driven properties has been extremely wonderful',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
  },
  {
    id: '2',
    company: 'Driven Prop',
    location: 'Los Angeles, CA',
    rating: 4.9,
    quote: 'My experience w has been extreme',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
  },
];

// Discounts
export const mockDiscounts: Discount[] = [
  {
    id: '1',
    title: 'Summer Renovation Sale',
    description: 'Get 15% off on all renovation services',
    discount: '15% off',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=200&fit=crop',
  },
];

// Filters
export const mockFilters: Filter[] = [
  { id: '1', label: 'Plumbing', active: true },
  { id: '2', label: 'Electrical', active: false },
  { id: '3', label: 'HVAC', active: false },
  { id: '4', label: 'Roofing', active: false },
];

// Before/After Project
export const mockBeforeAfterProject: BeforeAfterProject = {
  company: 'Green Miller',
  teamSize: 12,
  beforeImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&h=120&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=120&fit=crop',
}; 

// Profile Mock Data

// Mock User Profile
export const mockUserProfile: User = {
  name: 'Sarah Johnson',
  company: 'Johnson Construction Co.',
  description: 'Experienced contractor specializing in residential renovations and commercial projects. Passionate about quality craftsmanship and customer satisfaction.',
  posts: 24,
  followers: 156,
  profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
  headerImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=200&fit=crop',
};

// Mock About User Data
export const mockAboutUser: AboutUser = {
  description: 'Experienced contractor with over 10 years in the construction industry. Specializing in residential renovations, commercial projects, and sustainable building practices. Committed to delivering high-quality workmanship and exceptional customer service.',
  email: 'sarah.johnson@johnsonconstruction.com',
  phone: '+1 (555) 123-4567',
  address: '123 Construction Ave, San Francisco, CA 94102',
  website: 'www.johnsonconstruction.com',
  socialMedia: {
    linkedin: 'linkedin.com/in/sarahjohnson',
    instagram: '@sarahjohnson_construction',
    facebook: 'facebook.com/johnsonconstruction',
  },
  joinedDate: 'March 2020',
};

// Mock Posts
export const mockPosts: Post[] = [
  {
    id: '1',
    caption: 'Just completed this stunning kitchen renovation! Modern design meets functionality. The client is absolutely thrilled with the results. #KitchenRenovation #ModernDesign #ContractorLife',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
    timestamp: '2024-01-15T10:30:00Z',
    likes: 89,
    comments: 12,
    shares: 5,
  },
  {
    id: '2',
    caption: 'Before and after of this bathroom transformation. From outdated to luxurious! The attention to detail makes all the difference. #BathroomRenovation #BeforeAfter #LuxuryDesign',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
    timestamp: '2024-01-10T14:20:00Z',
    likes: 156,
    comments: 23,
    shares: 18,
  },
  {
    id: '3',
    caption: 'Working on this beautiful outdoor deck project. Perfect weather for construction! The natural wood finish is coming out beautifully. #OutdoorConstruction #DeckBuilding #NaturalMaterials',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
    timestamp: '2024-01-05T09:15:00Z',
    likes: 67,
    comments: 8,
    shares: 3,
  },
  {
    id: '4',
    caption: 'Office space renovation completed! Modern, functional, and beautiful. The open concept design really maximizes the space. #OfficeRenovation #ModernOffice #CommercialConstruction',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
    timestamp: '2023-12-28T16:45:00Z',
    likes: 203,
    comments: 31,
    shares: 25,
  },
  {
    id: '5',
    caption: 'Custom built-in shelving project. Every detail matters! The client wanted a unique storage solution that would be both functional and beautiful. #CustomCarpentry #BuiltInShelving #InteriorDesign',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
    timestamp: '2023-12-20T11:30:00Z',
    likes: 134,
    comments: 19,
    shares: 12,
  },
];

// Mock Activities
export const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'project',
    title: 'Kitchen Renovation Project Completed',
    subtitle: 'Client: Maria Rodriguez - $45,000',
    timestamp: '2024-01-15T10:30:00Z',
    icon: '🏠',
  },
  {
    id: '2',
    type: 'certification',
    title: 'Green Building Certification Renewed',
    subtitle: 'Valid until December 2025',
    timestamp: '2024-01-12T14:20:00Z',
    icon: '🌱',
  },
  {
    id: '3',
    type: 'review',
    title: '5-star review received',
    subtitle: 'From: David Chen - "Exceptional work quality!"',
    timestamp: '2024-01-10T09:15:00Z',
    icon: '⭐',
  },
  {
    id: '4',
    type: 'meeting',
    title: 'Client Consultation Scheduled',
    subtitle: 'Lisa Thompson - Bathroom renovation project',
    timestamp: '2024-01-08T16:45:00Z',
    icon: '📅',
  },
  {
    id: '5',
    type: 'purchase',
    title: 'Materials ordered',
    subtitle: 'Premium hardwood flooring - $3,200',
    timestamp: '2024-01-05T11:30:00Z',
    icon: '🛒',
  },
  {
    id: '6',
    type: 'like',
    title: 'Post liked by 15 followers',
    subtitle: 'Kitchen renovation showcase',
    timestamp: '2024-01-03T13:20:00Z',
    icon: '❤️',
  },
  {
    id: '7',
    type: 'comment',
    title: 'New comment on your post',
    subtitle: 'John Smith: "Amazing transformation!"',
    timestamp: '2024-01-02T10:15:00Z',
    icon: '💬',
  },
  {
    id: '8',
    type: 'follow',
    title: 'New follower',
    subtitle: 'Mike Johnson started following you',
    timestamp: '2023-12-30T08:45:00Z',
    icon: '👥',
  },
];

// Mock Saved Items
export const mockSavedItems: SavedItem[] = [
  {
    id: '1',
    title: 'Modern Kitchen Design Inspiration',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=150&fit=crop',
    type: 'design',
    description: 'Contemporary kitchen with open shelving and marble countertops',
    location: 'San Francisco, CA',
    rating: 4.8,
    savedDate: '2024-01-10',
  },
  {
    id: '2',
    title: 'Premium Hardwood Flooring Supplier',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=150&fit=crop',
    type: 'supplier',
    description: 'Oak and walnut flooring options for residential projects',
    location: 'Oakland, CA',
    rating: 4.9,
    savedDate: '2024-01-08',
  },
  {
    id: '3',
    title: 'Smart Home Technology Integration',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=150&fit=crop',
    type: 'technology',
    description: 'Automated lighting and security systems for modern homes',
    location: 'San Jose, CA',
    rating: 4.7,
    savedDate: '2024-01-05',
  },
  {
    id: '4',
    title: 'Luxury Bathroom Fixtures',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&h=150&fit=crop',
    type: 'supplier',
    description: 'High-end faucets, showers, and accessories',
    location: 'Los Angeles, CA',
    rating: 4.6,
    savedDate: '2023-12-28',
  },
  {
    id: '5',
    title: 'Sustainable Building Materials Guide',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&h=150&fit=crop',
    type: 'inspiration',
    description: 'Eco-friendly materials for green building projects',
    location: 'Berkeley, CA',
    rating: 4.9,
    savedDate: '2023-12-25',
  },
  {
    id: '6',
    title: 'Commercial Office Renovation Project',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&h=150&fit=crop',
    type: 'project',
    description: 'Modern office space transformation case study',
    location: 'San Francisco, CA',
    rating: 4.8,
    savedDate: '2023-12-20',
  },
];

// Mock Affiliate Companies
export const mockAffiliateCompanies: AffiliateCompany[] = [
  {
    id: '1',
    name: 'Premium Materials Co.',
    logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
    joinedDate: 'January 2023',
    revenue: '$12,450',
    status: 'active',
    description: 'High-quality building materials and supplies',
    projects: 8,
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Smart Home Solutions',
    logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
    joinedDate: 'March 2023',
    revenue: '$8,920',
    status: 'active',
    description: 'Automation and smart home technology',
    projects: 5,
    rating: 4.6,
  },
  {
    id: '3',
    name: 'Eco-Friendly Builders',
    logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
    joinedDate: 'June 2023',
    revenue: '$6,780',
    status: 'active',
    description: 'Sustainable building materials and practices',
    projects: 3,
    rating: 4.9,
  },
  {
    id: '4',
    name: 'Luxury Fixtures Inc.',
    logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
    joinedDate: 'September 2023',
    revenue: '$4,230',
    status: 'pending',
    description: 'High-end bathroom and kitchen fixtures',
    projects: 2,
    rating: 4.7,
  },
  {
    id: '5',
    name: 'Custom Carpentry Works',
    logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
    joinedDate: 'November 2023',
    revenue: '$2,150',
    status: 'inactive',
    description: 'Custom woodwork and cabinetry',
    projects: 1,
    rating: 4.5,
  },
]; 