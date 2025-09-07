# Profile Screen

This directory contains the Profile Screen implementation that matches the Figma design. The screen is built using a modular component architecture for better maintainability and reusability.

## Structure

```
ProfileScreen/
├── ProfileScreen.tsx    # Main screen component
├── index.ts            # Export file
└── README.md           # This file
```

## Components Used

### Core Components
- **StatusBar**: Displays time, WiFi, and battery icons
- **ProfileHeader**: Shows user profile with header image, profile picture, and user info
- **ProfileTabs**: Horizontal scrollable tab navigation
- **BottomNavigation**: Bottom tab bar with Home, Designs, Requests, Profile

### Content Components
- **PostsTab**: Displays user posts with images and engagement metrics
- **ActivityTab**: Shows recent user activity with timestamps
- **SavedTab**: Grid layout of saved items with thumbnails
- **AboutTab**: Detailed user information and contact details
- **AffiliateTab**: Affiliate program companies and status

## Features

### Profile Header
- Header image with overlay profile picture
- User information (name, company, description)
- Stats (posts, followers)
- Action buttons (Edit Profile, Share)
- Verified badge on profile picture

### Tab Navigation
- Posts: User's posts with images and engagement
- Activity: Recent activity feed
- Saved: Grid of saved items
- About: Contact information and social media
- Affiliate Program: Company partnerships

### Bottom Navigation
- Home, Designs, Requests, Profile tabs
- Active tab highlighting
- Icon and label display

## Data Structure

The screen uses TypeScript interfaces for type safety:

- `User`: Profile information
- `Post`: Post data with engagement metrics
- `ActivityItem`: Activity feed items
- `SavedItem`: Saved content items
- `AboutUser`: Contact and social information
- `AffiliateCompany`: Affiliate program data

## Mock Data

Mock data is stored in `src/data/mockProfileData.ts` and includes:
- Sample user profile
- Example posts with images
- Activity feed items
- Saved items
- Contact information
- Affiliate companies

## Styling

Uses consistent design system:
- Colors from `src/constants/colors.ts`
- Spacing from `src/constants/spacing.ts`
- Theme color gradient (#FB7504 to #C2252C) primary color theme
- Clean, modern UI design

## Usage

```tsx
import { ProfileScreen } from './screens/ProfileScreen';

// In your navigation
<ProfileScreen navigation={navigation} />
```

## Future Enhancements

- Real API integration
- Image upload functionality
- Push notifications
- Real-time updates
- Offline support
- Analytics tracking 