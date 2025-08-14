export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  is_verified: boolean;
  is_active: boolean;
  oauth_provider?: string;
  created_at: string;
  updated_at: string;
  avatar_data?: string;
  avatar_mimetype?: string;
  avatar_url?: string;
  bio?: string;
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

export interface AuthResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  user: User;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  full_name: string;
  phone: string;
  role: string;
  password: string;
}

export interface ApiError {
  detail: string;
  status_code: number;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  icon: string;
}

export interface Booking {
  id: string;
  service_id: string;
  user_id: string;
  status: string;
  scheduled_date: string;
  created_at: string;
}

 