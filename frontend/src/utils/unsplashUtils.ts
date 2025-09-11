/**
 * Utility functions for handling Unsplash images
 */

// Better Unsplash image URLs with proper parameters
export const getUnsplashImage = (
  width: number = 400,
  height: number = 300,
  keywords: string[] = ['warehouse', 'storage'],
  seed?: string
): string => {
  const keywordString = keywords.join(',');
  const seedParam = seed ? `&sig=${seed}` : `&sig=${Math.floor(Math.random() * 1000)}`;
  
  return `https://images.unsplash.com/photo-1553413077-190dd305871c?w=${width}&h=${height}&fit=crop&q=80&auto=format${seedParam}`;
};

// Product-specific image URLs
export const getProductImage = (productName: string, width: number = 400, height: number = 300): string => {
  const name = productName.toLowerCase();
  
  // Electronics
  if (name.includes('iphone') || name.includes('apple')) {
    return `https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=${width}&h=${height}&fit=crop&q=80&auto=format&sig=${Math.floor(Math.random() * 1000)}`;
  }
  if (name.includes('samsung') || name.includes('galaxy')) {
    return `https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=${width}&h=${height}&fit=crop&q=80&auto=format&sig=${Math.floor(Math.random() * 1000)}`;
  }
  if (name.includes('mobile') || name.includes('phone')) {
    return `https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=${width}&h=${height}&fit=crop&q=80&auto=format&sig=${Math.floor(Math.random() * 1000)}`;
  }
  
  // Laptops
  if (name.includes('laptop') || name.includes('macbook') || name.includes('computer')) {
    return `https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=${width}&h=${height}&fit=crop&q=80&auto=format&sig=${Math.floor(Math.random() * 1000)}`;
  }
  
  // Accessories
  if (name.includes('headphone') || name.includes('earphone') || name.includes('accessory')) {
    return `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=${width}&h=${height}&fit=crop&q=80&auto=format&sig=${Math.floor(Math.random() * 1000)}`;
  }
  
  // Construction materials
  if (name.includes('cement') || name.includes('material') || name.includes('construction')) {
    return `https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=${width}&h=${height}&fit=crop&q=80&auto=format&sig=${Math.floor(Math.random() * 1000)}`;
  }
  
  // Tools
  if (name.includes('tool') || name.includes('equipment')) {
    return `https://images.unsplash.com/photo-1581147033415-58a7cd9d6b0b?w=${width}&h=${height}&fit=crop&q=80&auto=format&sig=${Math.floor(Math.random() * 1000)}`;
  }
  
  // Default warehouse/product image
  return `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=${width}&h=${height}&fit=crop&q=80&auto=format&sig=${Math.floor(Math.random() * 1000)}`;
};

// Warehouse-specific images
export const getWarehouseImage = (warehouseType: string, width: number = 400, height: number = 300): string => {
  const type = warehouseType.toLowerCase();
  
  const warehouseImages = {
    general: 'https://images.unsplash.com/photo-1553413077-190dd305871c',
    electronics: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43',
    clothing: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
    food: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d',
    automotive: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3',
    furniture: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc',
    construction: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12',
    tools: 'https://images.unsplash.com/photo-1581147033415-58a7cd9d6b0b',
  };
  
  const baseUrl = warehouseImages[type as keyof typeof warehouseImages] || warehouseImages.general;
  return `${baseUrl}?w=${width}&h=${height}&fit=crop&q=80&auto=format&sig=${Math.floor(Math.random() * 1000)}`;
};

// Profile/avatar images
export const getProfileImage = (userId: string, width: number = 100, height: number = 100): string => {
  const profileImages = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    'https://images.unsplash.com/photo-1494790108755-2616b612b786',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
  ];
  
  // Use userId to consistently get the same image for the same user
  const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % profileImages.length;
  const baseUrl = profileImages[index];
  
  return `${baseUrl}?w=${width}&h=${height}&fit=crop&crop=face&q=80&auto=format&sig=${Math.floor(Math.random() * 1000)}`;
};

// Validate and clean Unsplash URLs
export const cleanUnsplashUrl = (url: string): string => {
  if (!url) return '';
  
  // Ensure HTTPS
  if (url.startsWith('http://')) {
    url = url.replace('http://', 'https://');
  }
  
  // Add quality and format parameters if not present
  if (!url.includes('&q=')) {
    url += '&q=80';
  }
  if (!url.includes('&auto=format')) {
    url += '&auto=format';
  }
  
  // Add cache busting if not present
  if (!url.includes('&sig=') && !url.includes('&random=')) {
    url += `&sig=${Date.now()}`;
  }
  
  return url;
};

// Check if URL is a valid Unsplash URL
export const isValidUnsplashUrl = (url: string): boolean => {
  return url && (
    url.includes('unsplash.com') || 
    url.includes('source.unsplash.com') ||
    url.includes('picsum.photos')
  );
};
