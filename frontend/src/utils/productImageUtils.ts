// Product Images mapping to Unsplash for fallback
const productImages = {
  '1': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&crop=center',
  '2': 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop&crop=center',
  '3': 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop&crop=center',
  '4': 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&h=400&fit=crop&crop=center',
  '5': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop&crop=center',
  '6': 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop&crop=center',
  '7': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&crop=center',
  '8': 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop&crop=center',
};

// Category-based fallback images
const categoryImages = {
  'shoes': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&crop=center',
  'watches': 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop&crop=center',
  'bags': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop&crop=center',
  'beauty': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&crop=center',
  'clothing': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop&crop=center',
  'accessories': 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop&crop=center',
  'lifestyle': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&crop=center',
  'electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop&crop=center',
  'books': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop&crop=center',
  'sports': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center',
};

// Brand-based fallback images
const brandImages = {
  'nike': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&crop=center',
  'adidas': 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop&crop=center',
  'gucci': 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop&crop=center',
  'coach': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop&crop=center',
  'rolex': 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop&crop=center',
  'mac': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&crop=center',
  'ray-ban': 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop&crop=center',
};

/**
 * Get product image URL with fallback strategy
 * @param product - Product object
 * @returns Image URL string
 */
export const getProductImage = (product: any): string => {
  // If product has a specific image mapping (dummy data)
  if (productImages[product.id]) {
    return productImages[product.id];
  }

  // If product has a brand, try brand-based image
  if (product.brand) {
    const brandKey = product.brand.toLowerCase().replace(/\s+/g, '-');
    if (brandImages[brandKey]) {
      return brandImages[brandKey];
    }
  }

  // If product has a category, try category-based image
  if (product.category_name) {
    const categoryKey = product.category_name.toLowerCase();
    if (categoryImages[categoryKey]) {
      return categoryImages[categoryKey];
    }
  }

  // Default fallback image
  return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&crop=center';
};

/**
 * Get category image URL
 * @param categoryName - Category name
 * @returns Image URL string
 */
export const getCategoryImage = (categoryName: string): string => {
  const categoryKey = categoryName.toLowerCase();
  return categoryImages[categoryKey] || categoryImages['lifestyle'];
};

/**
 * Get brand image URL
 * @param brandName - Brand name
 * @returns Image URL string
 */
export const getBrandImage = (brandName: string): string => {
  const brandKey = brandName.toLowerCase().replace(/\s+/g, '-');
  return brandImages[brandKey] || categoryImages['lifestyle'];
};

