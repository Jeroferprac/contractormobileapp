import { Platform } from 'react-native';

export const TYPOGRAPHY = {
  // Font Sizes
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    display: 32
  },
  
  // Font Weights
  weights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const
  },
  
  // Line Heights
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8
  }
};

// Predefined text styles for common use cases
export const TEXT_STYLES = {
  // Headings
  h1: {
    fontSize: TYPOGRAPHY.sizes.display,
    fontWeight: TYPOGRAPHY.weights.bold,
    lineHeight: TYPOGRAPHY.sizes.display * TYPOGRAPHY.lineHeights.tight
  },
  h2: {
    fontSize: TYPOGRAPHY.sizes.xxxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    lineHeight: TYPOGRAPHY.sizes.xxxl * TYPOGRAPHY.lineHeights.tight
  },
  h3: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.semibold,
    lineHeight: TYPOGRAPHY.sizes.xxl * TYPOGRAPHY.lineHeights.normal
  },
  h4: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.semibold,
    lineHeight: TYPOGRAPHY.sizes.xl * TYPOGRAPHY.lineHeights.normal
  },
  
  // Body text
  body: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.regular,
    lineHeight: TYPOGRAPHY.sizes.md * TYPOGRAPHY.lineHeights.normal
  },
  body1: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.regular,
    lineHeight: TYPOGRAPHY.sizes.md * TYPOGRAPHY.lineHeights.normal
  },
  body2: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.regular,
    lineHeight: TYPOGRAPHY.sizes.sm * TYPOGRAPHY.lineHeights.normal
  },
  bodyLarge: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.regular,
    lineHeight: TYPOGRAPHY.sizes.lg * TYPOGRAPHY.lineHeights.normal
  },
  bodySmall: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.regular,
    lineHeight: TYPOGRAPHY.sizes.sm * TYPOGRAPHY.lineHeights.normal
  },
  
  // Captions
  caption: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.regular,
    lineHeight: TYPOGRAPHY.sizes.xs * TYPOGRAPHY.lineHeights.normal
  },
  
  // Buttons
  button: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    lineHeight: TYPOGRAPHY.sizes.md * TYPOGRAPHY.lineHeights.tight
  },
  buttonLarge: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    lineHeight: TYPOGRAPHY.sizes.lg * TYPOGRAPHY.lineHeights.tight
  }
};

// Export typography constants for direct use
export const TYPOGRAPHY_CONSTANTS = {
  h1: TEXT_STYLES.h1,
  h2: TEXT_STYLES.h2,
  h3: TEXT_STYLES.h3,
  h4: TEXT_STYLES.h4,
  body1: TEXT_STYLES.body1,
  body2: TEXT_STYLES.body2,
  button: TEXT_STYLES.button,
}; 