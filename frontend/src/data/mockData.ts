// Mock data for the contractor mobile app
import { User, Post, ActivityItem, SavedItem, AboutUser, AffiliateCompany } from '../types/profile';
import { Product, Transaction, Warehouse, InventorySummary } from '../types/inventory';

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
  type: 'contractor' | 'consultant' | 'freelancer' | 'workshop';
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
  
  // Freelancers
  {
    id: '4',
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
    id: '5',
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
    id: '6',
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
    title: 'Smart Home Technology Integration',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=150&fit=crop',
    type: 'technology',
    description: 'Automated lighting and security systems for modern homes',
    location: 'San Jose, CA',
    rating: 4.7,
    savedDate: '2024-01-05',
  },
  {
    id: '3',
    title: 'Luxury Bathroom Fixtures',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&h=150&fit=crop',
    type: 'inspiration',
    description: 'High-end faucets, showers, and accessories',
    location: 'Los Angeles, CA',
    rating: 4.6,
    savedDate: '2023-12-28',
  },
  {
    id: '4',
    title: 'Sustainable Building Materials Guide',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&h=150&fit=crop',
    type: 'inspiration',
    description: 'Eco-friendly materials for green building projects',
    location: 'Berkeley, CA',
    rating: 4.9,
    savedDate: '2023-12-25',
  },
  {
    id: '5',
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

// ===== INVENTORY MOCK DATA =====

// Mock Products
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Oak Hardwood Flooring',
    sku: 'OAK-HW-001',
    barcode: '1234567890123',
    category_name: 'Flooring',
    brand: 'Premium Woods',
    unit: 'sq ft',
    current_stock: 2500,
    min_stock_level: 500,
    reorder_point: 750,
    max_stock_level: 5000,
    cost_price: 8.50,
    selling_price: 12.99,
    description: 'High-quality oak hardwood flooring, perfect for residential and commercial projects',
    weight: '2.5 lbs/sq ft',
    dimensions: '3/4" x 3-1/4" x 72"',
    is_active: true,
    track_serial: false,
    track_batch: true,
    is_composite: false,
    created_at: '2023-01-15T10:30:00Z',
    updated_at: '2024-01-10T14:20:00Z',
  },
  {
    id: '2',
    name: 'Eco-Friendly Bamboo Panels',
    sku: 'BAMBOO-PAN-002',
    barcode: '1234567890124',
    category_name: 'Paneling',
    brand: 'Green Materials',
    unit: 'panel',
    current_stock: 150,
    min_stock_level: 25,
    reorder_point: 50,
    max_stock_level: 300,
    cost_price: 45.00,
    selling_price: 69.99,
    description: 'Sustainable bamboo panels for interior wall covering',
    weight: '15 lbs',
    dimensions: '4\' x 8\' x 1/2"',
    is_active: true,
    track_serial: false,
    track_batch: true,
    is_composite: false,
    created_at: '2023-02-20T09:15:00Z',
    updated_at: '2024-01-12T11:45:00Z',
  },
  {
    id: '3',
    name: 'Luxury Chrome Faucet Set',
    sku: 'CHROME-FAU-003',
    barcode: '1234567890125',
    category_name: 'Plumbing',
    brand: 'Luxury Fixtures',
    unit: 'set',
    current_stock: 75,
    min_stock_level: 10,
    reorder_point: 20,
    max_stock_level: 150,
    cost_price: 120.00,
    selling_price: 199.99,
    description: 'Premium chrome finish faucet set with matching handles',
    weight: '8.5 lbs',
    dimensions: '12" x 6" x 4"',
    is_active: true,
    track_serial: true,
    track_batch: false,
    is_composite: false,
    created_at: '2023-03-10T16:45:00Z',
    updated_at: '2024-01-08T13:30:00Z',
  },
  {
    id: '4',
    name: 'Smart LED Light Bulbs',
    sku: 'LED-SMART-004',
    barcode: '1234567890126',
    category_name: 'Lighting',
    brand: 'Smart Home Tech',
    unit: 'bulb',
    current_stock: 500,
    min_stock_level: 100,
    reorder_point: 200,
    max_stock_level: 1000,
    cost_price: 15.00,
    selling_price: 24.99,
    description: 'WiFi-enabled smart LED bulbs with color control',
    weight: '0.5 lbs',
    dimensions: '4.5" x 2.5"',
    is_active: true,
    track_serial: false,
    track_batch: true,
    is_composite: false,
    created_at: '2023-04-05T12:20:00Z',
    updated_at: '2024-01-15T10:15:00Z',
  },
  {
    id: '5',
    name: 'Custom Walnut Cabinet Doors',
    sku: 'WALNUT-CAB-005',
    barcode: '1234567890127',
    category_name: 'Cabinetry',
    brand: 'Custom Woodworks',
    unit: 'door',
    current_stock: 45,
    min_stock_level: 5,
    reorder_point: 10,
    max_stock_level: 100,
    cost_price: 85.00,
    selling_price: 149.99,
    description: 'Handcrafted walnut cabinet doors with premium finish',
    weight: '12 lbs',
    dimensions: '24" x 30" x 1"',
    is_active: true,
    track_serial: false,
    track_batch: true,
    is_composite: false,
    created_at: '2023-05-12T08:30:00Z',
    updated_at: '2024-01-05T15:45:00Z',
  },
];

// Mock Transactions
export const mockTransactions: Transaction[] = [
  {
    id: '1',
    product_id: '1',
    transaction_type: 'in',
    quantity: 1000,
    reference_type: 'purchase_order',
    reference_id: 'PO-001',
    notes: 'Initial stock order',
    created_at: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    product_id: '2',
    transaction_type: 'out',
    quantity: 25,
    reference_type: 'sale',
    reference_id: 'SALE-001',
    notes: 'Customer order for eco-friendly project',
    created_at: '2024-01-14T14:20:00Z',
  },
  {
    id: '3',
    product_id: '3',
    transaction_type: 'in',
    quantity: 50,
    reference_type: 'purchase_order',
    reference_id: 'PO-002',
    notes: 'Restocking luxury fixtures',
    created_at: '2024-01-13T09:15:00Z',
  },
  {
    id: '4',
    product_id: '4',
    transaction_type: 'out',
    quantity: 100,
    reference_type: 'sale',
    reference_id: 'SALE-002',
    notes: 'Smart home installation project',
    created_at: '2024-01-12T16:45:00Z',
  },
  {
    id: '5',
    product_id: '5',
    transaction_type: 'adjustment',
    quantity: -5,
    reference_type: 'damage',
    reference_id: 'DAMAGE-001',
    notes: 'Damaged during shipping',
    created_at: '2024-01-11T11:30:00Z',
  },
];

// Mock Warehouses
export const mockWarehouses: Warehouse[] = [
  {
    id: '1',
    name: 'Main Distribution Center',
    code: 'MDC-001',
    address: '123 Industrial Blvd, San Francisco, CA 94102',
    contact_person: 'John Smith',
    phone: '+1 (555) 123-4567',
    email: 'warehouse@company.com',
    is_active: true,
    created_at: '2023-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'East Bay Storage Facility',
    code: 'EBS-002',
    address: '456 Green Street, Oakland, CA 94601',
    contact_person: 'Sarah Johnson',
    phone: '+1 (555) 234-5678',
    email: 'eastbay@company.com',
    is_active: true,
    created_at: '2023-02-20T09:15:00Z',
  },
  {
    id: '3',
    name: 'Southern California Hub',
    code: 'SCH-003',
    address: '789 Design District, Los Angeles, CA 90210',
    contact_person: 'Michael Chen',
    phone: '+1 (555) 345-6789',
    email: 'socal@company.com',
    is_active: true,
    created_at: '2023-03-10T16:45:00Z',
  },
];

// Mock Inventory Summary
export const mockInventorySummary: InventorySummary = {
  total_products: 156,
  total_warehouses: 3,
  low_stock_items: 12,
  out_of_stock_items: 3,
  total_inventory_value: 1250000,
  recent_transactions: 45,
  chartData: [
    { label: 'Jan 2024', value: 125000, dataPointText: '€125K' },
    { label: 'Feb 2024', value: 138000, dataPointText: '€138K' },
    { label: 'Mar 2024', value: 142000, dataPointText: '€142K' },
    { label: 'Apr 2024', value: 135000, dataPointText: '€135K' },
    { label: 'May 2024', value: 148000, dataPointText: '€148K' },
    { label: 'Jun 2024', value: 155000, dataPointText: '€155K' },
  ],
};