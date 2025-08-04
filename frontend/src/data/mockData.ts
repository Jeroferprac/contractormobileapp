// Mock data for the contractor mobile app

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