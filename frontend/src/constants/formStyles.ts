import { StyleSheet } from 'react-native';

export const FORM_STYLES = StyleSheet.create({
  // Container Styles - Figma Design
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  
  safeArea: {
    flex: 1,
  },

  // Header Styles - Figma Design
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1B2D',
  },
  
  headerSpacer: {
    width: 40,
  },

  // ScrollView Styles
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // Section Styles
  section: {
    marginBottom: 32,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1B2D',
    marginBottom: 20,
    paddingHorizontal: 0,
  },

  // Input Field Styles - Figma Design
  inputContainer: {
    marginBottom: 16,
  },
  
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1B2D',
    marginBottom: 8,
    paddingHorizontal: 0,
  },
  
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    minHeight: 56,
  },
  
  inputWrapperFocused: {
    borderColor: '#FB7504',
    shadowColor: '#FB7504',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  inputWrapperError: {
    borderColor: '#DC3545',
    shadowColor: '#DC3545',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  inputIcon: {
    marginRight: 8,
    color: '#6C757D',
    fontSize: 20,
  },
  
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1B2D',
    paddingVertical: 0,
    marginLeft: 8,
    fontWeight: '400',
  },
  
  inputPlaceholder: {
    color: '#9B9898',
  },
  
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  
  errorText: {
    color: '#DC3545',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },

  // File Upload Styles
  uploadContainer: {
    marginBottom: 16,
  },
  
  uploadLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1B2D',
    marginBottom: 8,
  },
  
  uploadArea: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  uploadAreaActive: {
    borderColor: '#FB7504',
    backgroundColor: '#FFF8F5',
  },
  
  
  uploadText: {
    fontSize: 16,
    color: '#9B9898',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
  },
  
  uploadTextActive: {
    color: '#FB7504',
  },
  
  uploadSubText: {
    fontSize: 14,
    color: '#9B9898',
    textAlign: 'center',
    marginTop: 4,
  },

  // Upload Icon Styles
  uploadIconContainer: {
    marginBottom: 12,
  },
  
  uploadIcon: {
    fontSize: 32,
    color: '#9B9898',
  },

  // Button Styles - Figma Design
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingHorizontal: 0,
  },
  
  buttonContainerSingle: {
    marginTop: 20,
    paddingHorizontal: 0,
  },
  
  // Primary Button (Gradient) - Main Action
  primaryButton: {
    flex: 2,
    borderRadius: 12,
    minHeight: 56,
    shadowColor: '#FB7504',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  
  primaryButtonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  
  primaryButtonIcon: {
    marginRight: 0,
    fontSize: 20,
  },

  // Secondary Button - Cancel
  secondaryButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 56,
  },
  
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C757D',
  },

  // Accent Button (Theme Color Border) - Secondary Action
  accentButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FB7504',
    flexDirection: 'row',
    minHeight: 56,
  },
  
  accentButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FB7504',
    marginLeft: 8,
  },
  
  accentButtonIcon: {
    marginRight: 0,
    fontSize: 20,
  },

  // Disabled Button
  buttonDisabled: {
    opacity: 0.5,
  },

  // Toggle Switch Styles
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  
  toggleLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1B2D',
    marginLeft: 8,
  },
  
  toggleSwitch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  
  toggleSwitchActive: {
    backgroundColor: '#FB7504',
  },
  
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },

  // Card Styles - Figma Design
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FB7504',
    marginLeft: 12,
  },
  
  cardIcon: {
    fontSize: 24,
    color: '#FB7504',
  },

  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
  },
  
  loadingText: {
    fontSize: 16,
    color: '#6C757D',
    marginTop: 12,
  },

  // Helper Text Styles
  helperText: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 4,
    marginLeft: 4,
  },
  
  helperTextError: {
    color: '#DC3545',
  },
  
  helperTextSuccess: {
    color: '#28A745',
  },

  // Form Layout Styles
  formContainer: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  
  formContent: {
    padding: 20,
    paddingBottom: 40,
  },
  
  formSection: {
    marginBottom: 32,
  },
  
  formSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1B2D',
    marginBottom: 20,
    paddingHorizontal: 0,
  },

  // Additional Form Styles for Figma Design
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  
  formRowItem: {
    flex: 1,
  },
  
  formSpacing: {
    marginBottom: 16,
  },
  
  formSpacingLarge: {
    marginBottom: 24,
  },

  // Spacing Utilities
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  // Typography Utilities
  typography: {
    h1: {
      fontSize: 24,
      fontWeight: '700',
      color: '#1A1B2D',
      letterSpacing: 0.5,
    },
    h2: {
      fontSize: 20,
      fontWeight: '700',
      color: '#1A1B2D',
      letterSpacing: 0.3,
    },
    h3: {
      fontSize: 18,
      fontWeight: '600',
      color: '#1A1B2D',
      letterSpacing: 0.3,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      color: '#1A1B2D',
    },
    caption: {
      fontSize: 14,
      fontWeight: '500',
      color: '#6C757D',
    },
    small: {
      fontSize: 12,
      fontWeight: '500',
      color: '#9B9898',
    },
  },
});

// Color constants for easy access
export const FORM_COLORS = {
  background: '#F8F8F8',
  card: '#FFFFFF',
  primary: '#FB7504',
  primaryGradient: ['#FB7504', '#C2252C'],
  text: {
    primary: '#1A1B2D',
    secondary: '#6C757D',
    tertiary: '#9B9898',
    light: '#FFFFFF',
  },
  border: {
    light: '#E5E7EB',
    focused: '#FB7504',
    error: '#DC3545',
  },
  status: {
    success: '#28A745',
    error: '#DC3545',
    warning: '#FB7504',
  },
};

// Common input field configurations
export const INPUT_CONFIGS = {
  text: {
    keyboardType: 'default' as const,
    autoCapitalize: 'words' as const,
  },
  email: {
    keyboardType: 'email-address' as const,
    autoCapitalize: 'none' as const,
  },
  phone: {
    keyboardType: 'phone-pad' as const,
  },
  number: {
    keyboardType: 'numeric' as const,
  },
  password: {
    secureTextEntry: true,
    autoCapitalize: 'none' as const,
  },
};

// Common icon names for different input types
export const INPUT_ICONS = {
  name: 'account',
  email: 'email',
  phone: 'phone',
  address: 'map-marker',
  city: 'city',
  country: 'flag',
  bank: 'bank',
  account: 'credit-card',
  id: 'card-account-details',
  document: 'file-document',
  upload: 'cloud-upload',
  search: 'magnify',
  calendar: 'calendar',
  time: 'clock',
  location: 'map-marker',
  building: 'office-building',
  warehouse: 'warehouse',
  product: 'package-variant',
  price: 'currency-usd',
  quantity: 'counter',
  description: 'text',
  category: 'tag',
  barcode: 'barcode',
  sku: 'hash',
  weight: 'weight',
  dimensions: 'resize',
  status: 'toggle-switch',
  active: 'check-circle',
  inactive: 'close-circle',
};

