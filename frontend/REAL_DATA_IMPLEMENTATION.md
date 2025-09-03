# Real Data Implementation for Profile Page

This document explains how the profile page now fetches real data from APIs instead of using hardcoded mock data.

## 🏗️ Architecture Overview

The profile page now uses a **Service Factory Pattern** that automatically switches between:
- **Real API Services** - When connected to backend
- **Mock Services** - For development and testing

## 📁 File Structure

```
frontend/src/
├── api/
│   └── api.ts                    # Extended with company endpoints
├── services/
│   ├── companyService.ts         # Real API service implementation
│   ├── mockCompanyService.ts     # Mock data service
│   └── serviceFactory.ts         # Service selection logic
├── config/
│   └── services.ts               # Configuration for service selection
└── components/
    ├── ProfileHeader/            # Company profile display
    ├── ProfileContent/
    │   ├── ProjectsTab.tsx       # Company projects
    │   ├── ReviewsTab.tsx        # Customer reviews
    │   └── CredentialsTab.tsx    # Company credentials
    └── ProfileTabs/              # Navigation tabs
```

## 🔧 Configuration

### Switch Between Real and Mock Services

Edit `frontend/src/config/services.ts`:

```typescript
export const SERVICE_CONFIG = {
  // Set to false to use real API services
  USE_MOCK_SERVICES: true,
  
  // API endpoints configuration
  API_ENDPOINTS: {
    COMPANY_PROFILE: '/company/profile',
    COMPANY_PROJECTS: '/company/projects',
    COMPANY_REVIEWS: '/company/reviews',
    COMPANY_CREDENTIALS: '/company/credentials',
    COMPANY_AWARDS: '/company/awards',
    COMPANY_STATS: '/company/stats',
  },
};
```

## 🌐 Real API Endpoints

The following endpoints are expected from your backend:

### Company Profile
- `GET /company/profile` - Company information, stats, ratings
- `PUT /company/profile` - Update company information

### Projects
- `GET /company/projects` - List of company projects
- `POST /company/projects` - Create new project
- `PUT /company/projects/:id` - Update project
- `DELETE /company/projects/:id` - Delete project

### Reviews
- `GET /company/reviews` - Customer reviews
- `POST /company/reviews/:id/reply` - Reply to review

### Credentials
- `GET /company/credentials` - Company licenses/certifications
- `POST /company/credentials` - Add new credential
- `PUT /company/credentials/:id` - Update credential
- `DELETE /company/credentials/:id` - Delete credential

### Awards
- `GET /company/awards` - Company awards and recognition
- `POST /company/awards` - Add new award
- `PUT /company/awards/:id` - Update award
- `DELETE /company/awards/:id` - Delete award

### Statistics
- `GET /company/stats` - Company performance metrics

## 📊 Data Models

### Company Profile
```typescript
interface CompanyProfile {
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
```

### Company Project
```typescript
interface CompanyProject {
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
```

### Company Review
```typescript
interface CompanyReview {
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
```

### Company Credential
```typescript
interface CompanyCredential {
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
```

## 🚀 Usage Examples

### Using the Service Factory

```typescript
import { getCompanyService } from '../services/serviceFactory';

// Get the appropriate service (real or mock)
const companyService = getCompanyService();

// Use the service
const profile = await companyService.getCompanyProfile();
const projects = await companyService.getCompanyProjects();
```

### Component Implementation

```typescript
import React, { useState, useEffect } from 'react';
import { getCompanyService } from '../../services/serviceFactory';

export const MyComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const companyService = getCompanyService();
      const result = await companyService.getCompanyProfile();
      setData(result);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component
};
```

## 🔄 Switching Between Services

### Development (Mock Services)
```typescript
// In config/services.ts
USE_MOCK_SERVICES: true
```

### Production (Real API)
```typescript
// In config/services.ts
USE_MOCK_SERVICES: false
```

## 📱 Features Implemented

### ✅ Profile Header
- Company name and verification badge
- Rating and review count
- Grade and experience information
- Company details (location, pricing, etc.)
- Award badges
- Quick action icons

### ✅ Projects Tab
- Grid layout of company projects
- Project status and completion bars
- Project images and descriptions
- Loading and error states

### ✅ Reviews Tab
- Customer review cards
- Star ratings
- Company reply functionality
- Loading and error states

### ✅ Credentials Tab
- Company licenses and certifications
- Status badges (Active/Expired/Pending)
- Document viewing/downloading
- Loading and error states

### ✅ Error Handling
- Network error handling
- Retry functionality
- User-friendly error messages
- Fallback to cached data

## 🧪 Testing

### Mock Data Testing
When `USE_MOCK_SERVICES: true`, the app uses realistic mock data:
- 6 sample projects with different statuses
- 5 customer reviews with ratings
- 6 company credentials
- 3 company awards
- Realistic company profile data

### API Testing
When `USE_MOCK_SERVICES: false`, the app makes real API calls:
- Ensure your backend endpoints are working
- Check network connectivity
- Verify authentication tokens

## 🚨 Troubleshooting

### Common Issues

1. **Mock Services Not Working**
   - Check `config/services.ts` configuration
   - Ensure `USE_MOCK_SERVICES: true`

2. **Real API Not Working**
   - Verify backend endpoints are accessible
   - Check authentication tokens
   - Ensure network connectivity

3. **Data Not Loading**
   - Check browser console for errors
   - Verify service factory is working
   - Check component error boundaries

### Debug Information

```typescript
import { getServiceInfo } from '../services/serviceFactory';

// Get current service configuration
const serviceInfo = getServiceInfo();
console.log('Service Info:', serviceInfo);
```

## 🔮 Future Enhancements

- [ ] Real-time data updates
- [ ] Offline data caching
- [ ] Data synchronization
- [ ] Advanced error handling
- [ ] Performance optimization
- [ ] Data validation
- [ ] Rate limiting
- [ ] Analytics integration

## 📞 Support

For questions or issues with the real data implementation:
1. Check this documentation
2. Review the console logs
3. Verify service configuration
4. Test with mock services first
5. Check backend API endpoints

---

**Note**: This implementation maintains backward compatibility while providing a robust foundation for real data integration. The service factory pattern makes it easy to switch between development and production environments.
