import { COLORS } from '../constants/colors';

/**
 * Safe gradient color utility to prevent LinearGradient null/undefined errors
 * This is a senior-level defensive programming approach
 */

export const getSafeGradientColors = (
  colors: string[] | undefined | null,
  fallback: string[] = ['#FB7504', '#C2252C']
): string[] => {
  // Handle null/undefined
  if (!colors) {
    console.warn('LinearGradient: colors is null/undefined, using fallback');
    return fallback;
  }

  // Handle non-array
  if (!Array.isArray(colors)) {
    console.warn('LinearGradient: colors is not an array, using fallback');
    return fallback;
  }

  // Handle empty array
  if (colors.length === 0) {
    console.warn('LinearGradient: colors array is empty, using fallback');
    return fallback;
  }

  // Filter out null/undefined values and validate color format
  const validColors = colors.filter(color => {
    if (!color || typeof color !== 'string') {
      console.warn('LinearGradient: invalid color found:', color);
      return false;
    }
    
    // Basic hex color validation
    if (!color.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
      console.warn('LinearGradient: invalid color format:', color);
      return false;
    }
    
    return true;
  });

  // If no valid colors remain, use fallback
  if (validColors.length === 0) {
    console.warn('LinearGradient: no valid colors found, using fallback');
    return fallback;
  }

  return validColors;
};

// Pre-defined safe gradients
export const SAFE_GRADIENTS = {
  primary: getSafeGradientColors(COLORS.gradient.primary),
  secondary: getSafeGradientColors(COLORS.gradient.secondary),
  discount: getSafeGradientColors(COLORS.gradient.discount),
  themeColorGradient: getSafeGradientColors(COLORS.gradient.themeColorGradient),
  
  // Common fallback gradients
  blue: ['#3B82F6', '#60A5FA'],
  orange: ['#FB7504', '#C2252C'],
  green: ['#10B981', '#059669'],
  purple: ['#6366F1', '#4F46E5'],
  red: ['#EF4444', '#DC2626'],
  gray: ['#6B7280', '#9CA3AF'],
};

// Safe wrapper for dynamic gradient functions
export const safeDynamicGradient = (
  gradientFunction: () => string[],
  fallback: string[] = ['#FB7504', '#C2252C']
): string[] => {
  try {
    const result = gradientFunction();
    return getSafeGradientColors(result, fallback);
  } catch (error) {
    console.error('LinearGradient: Error in dynamic gradient function:', error);
    return fallback;
  }
};
