import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../constants/spacing';
import { TYPOGRAPHY } from '../constants/typography';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Supplier } from '../types/inventory';
import { SuppliersScreenNavigationProp } from '../types/navigation';
import inventoryApiService from '../api/inventoryApi';

interface SupplierFormScreenProps {
  navigation: SuppliersScreenNavigationProp;
  route?: {
    params?: {
      supplier?: Supplier;
      isEditing?: boolean;
    };
  };
}

const SupplierFormScreen: React.FC<SupplierFormScreenProps> = ({ navigation, route }) => {
  const isEditing = route?.params?.isEditing || false;
  const existingSupplier = route?.params?.supplier;
  
  const [formData, setFormData] = useState({
    name: existingSupplier?.name || '',
    contact_person: existingSupplier?.contact_person || '',
    email: existingSupplier?.email || '',
    phone: existingSupplier?.phone || '',
    address: existingSupplier?.address || '',
    tax_number: existingSupplier?.tax_number || '',
    payment_terms: existingSupplier?.payment_terms || '',
    credit_limit: existingSupplier?.credit_limit?.toString() || '',
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Supplier name is required';
    }

    if (!formData.contact_person.trim()) {
      newErrors.contact_person = 'Contact person is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (formData.credit_limit && isNaN(Number(formData.credit_limit))) {
      newErrors.credit_limit = 'Credit limit must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // Show confirmation for updates
    if (isEditing && existingSupplier) {
      Alert.alert(
        'Update Supplier',
        'Are you sure you want to update this supplier?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Update', onPress: () => performSubmit() }
        ]
      );
    } else {
      performSubmit();
    }
  };

  const performSubmit = async () => {
    setLoading(true);
    setSubmitError(null);
    try {
      // Clean up the data and ensure proper types
      const supplierData = {
        name: formData.name.trim(),
        contact_person: formData.contact_person.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        tax_number: formData.tax_number.trim() || undefined,
        payment_terms: formData.payment_terms.trim() || undefined,
        credit_limit: formData.credit_limit ? Number(formData.credit_limit) : undefined,
        is_active: true,
      };

      // Remove undefined values to prevent API issues
      Object.keys(supplierData).forEach(key => {
        if (supplierData[key as keyof typeof supplierData] === undefined) {
          delete supplierData[key as keyof typeof supplierData];
        }
      });

      // Validate the data before sending
      if (!supplierData.name || !supplierData.contact_person || !supplierData.email || !supplierData.phone || !supplierData.address) {
        throw new Error('Please fill in all required fields');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(supplierData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Validate credit limit if provided
      if (supplierData.credit_limit !== undefined && (isNaN(supplierData.credit_limit) || supplierData.credit_limit < 0)) {
        throw new Error('Credit limit must be a valid positive number');
      }

      console.log('🔄 [SupplierForm] Sending supplier data:', JSON.stringify(supplierData, null, 2));
      console.log('🔄 [SupplierForm] Is editing:', isEditing);
      console.log('🔄 [SupplierForm] Existing supplier ID:', existingSupplier?.id);
      
             // Add timeout to prevent hanging requests
       const timeoutId = setTimeout(() => {
         const timeoutError = new Error('Request timeout - please check your connection');
         console.error('❌ [SupplierForm] Request timeout');
         setSubmitError('Request timeout - please check your connection');
         Alert.alert('Timeout Error', 'Request timeout - please check your connection');
         setLoading(false);
       }, 30000); // 30 second timeout

      if (isEditing && existingSupplier) {
        console.log('🔄 [SupplierForm] Updating existing supplier...');
        console.log('🔄 [SupplierForm] Supplier ID:', existingSupplier.id);
        console.log('🔄 [SupplierForm] Update data:', JSON.stringify(supplierData, null, 2));
        
        try {
          const response = await inventoryApiService.updateSupplier(existingSupplier.id, supplierData);
          clearTimeout(timeoutId);
          console.log('✅ [SupplierForm] Update response:', response.data);
          Alert.alert('Success', 'Supplier updated successfully', [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]);
        } catch (apiError: any) {
          clearTimeout(timeoutId);
          console.error('❌ [SupplierForm] API call failed:', apiError);
          
          // If it's a network error, show a more helpful message
          if (apiError.code === 'NETWORK_ERROR' || apiError.message?.includes('Network Error')) {
            Alert.alert(
              'Connection Error', 
              'Unable to connect to the server. Please check your internet connection and try again.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Retry', onPress: () => performSubmit() }
              ]
            );
            return;
          }
          
          throw apiError; // Re-throw to be caught by outer catch block
        }
      } else {
        console.log('🔄 [SupplierForm] Creating new supplier...');
        console.log('🔄 [SupplierForm] Create data:', JSON.stringify(supplierData, null, 2));
        
        try {
          const response = await inventoryApiService.createSupplier(supplierData);
          clearTimeout(timeoutId);
          console.log('✅ [SupplierForm] Create response:', response.data);
          Alert.alert('Success', 'Supplier created successfully', [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]);
        } catch (apiError: any) {
          clearTimeout(timeoutId);
          console.error('❌ [SupplierForm] API call failed:', apiError);
          
          // If it's a network error, show a more helpful message
          if (apiError.code === 'NETWORK_ERROR' || apiError.message?.includes('Network Error')) {
            Alert.alert(
              'Connection Error', 
              'Unable to connect to the server. Please check your internet connection and try again.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Retry', onPress: () => performSubmit() }
              ]
            );
            return;
          }
          
          throw apiError; // Re-throw to be caught by outer catch block
        }
      }
    } catch (error: any) {
      console.error('❌ [SupplierForm] Error saving supplier:', error);
      
      // Log the response details if available
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        console.error('Response headers:', JSON.stringify(error.response.headers, null, 2));
      }
      
             // Check for network errors
       if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
         console.error('❌ [SupplierForm] Network error detected');
         const networkErrorMsg = 'Network error - please check your internet connection and try again';
         setSubmitError(networkErrorMsg);
         Alert.alert('Network Error', networkErrorMsg);
         return;
       }
       
       // Check for authentication errors
       if (error.response?.status === 401) {
         console.error('❌ [SupplierForm] Authentication error detected');
         const authErrorMsg = 'Authentication failed - please log in again';
         setSubmitError(authErrorMsg);
         Alert.alert('Authentication Error', authErrorMsg);
         return;
       }
       
       // Check for server errors
       if (error.response?.status >= 500) {
         console.error('❌ [SupplierForm] Server error detected');
         const serverErrorMsg = 'Server error - please try again later';
         setSubmitError(serverErrorMsg);
         Alert.alert('Server Error', serverErrorMsg);
         return;
       }
      
      // Show more specific error message
      let errorMessage = 'Failed to save supplier. Please try again.';
      
      try {
        if (error.response?.data?.detail) {
          errorMessage = String(error.response.data.detail);
        } else if (error.response?.data?.message) {
          errorMessage = String(error.response.data.message);
        } else if (error.message) {
          errorMessage = String(error.message);
        }
      } catch (parseError) {
        console.error('❌ [SupplierForm] Error parsing error message:', parseError);
        errorMessage = 'An unexpected error occurred';
      }
      
      // Log the full error for debugging
      try {
        console.error('❌ [SupplierForm] Full error details:', {
          message: String(error.message || 'Unknown error'),
          response: error.response?.data ? JSON.stringify(error.response.data) : 'No response data',
          status: error.response?.status || 'No status',
          stack: String(error.stack || 'No stack trace'),
          code: String(error.code || 'No code'),
          name: String(error.name || 'No name')
        });
      } catch (logError) {
        console.error('❌ [SupplierForm] Error logging error details:', logError);
        console.error('❌ [SupplierForm] Basic error info:', String(error.message || 'Unknown error'));
      }
      
      // Ensure errorMessage is a string
      const finalErrorMessage = typeof errorMessage === 'string' ? errorMessage : 'An unexpected error occurred';
      setSubmitError(finalErrorMessage);
      Alert.alert('Error', finalErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Clear submit error when user starts typing
    if (submitError) {
      setSubmitError(null);
    }
  };

  const resetToOriginal = () => {
    if (existingSupplier) {
      setFormData({
        name: existingSupplier.name || '',
        contact_person: existingSupplier.contact_person || '',
        email: existingSupplier.email || '',
        phone: existingSupplier.phone || '',
        address: existingSupplier.address || '',
        tax_number: existingSupplier.tax_number || '',
        payment_terms: existingSupplier.payment_terms || '',
        credit_limit: existingSupplier.credit_limit?.toString() || '',
      });
      setErrors({});
      Alert.alert('Reset', 'Form has been reset to original values');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient 
        colors={COLORS.gradient.primary} 
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>
              {isEditing ? 'Edit Supplier' : 'Add Supplier'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {isEditing ? 'Update supplier information' : 'Create new supplier'}
            </Text>
          </View>
          <View style={{ width: 48 }} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <LinearGradient
          colors={[COLORS.card, COLORS.surface, '#F8F9FA']}
          style={styles.formContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {isEditing && (
            <View style={styles.editModeIndicator}>
              <Icon name="edit" size={16} color={COLORS.primary} />
              <Text style={styles.editModeText}>Editing Supplier</Text>
            </View>
          )}
          
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <Input
            label="Supplier Name *"
            value={formData.name}
            onChangeText={(value) => updateFormData('name', value)}
            placeholder="Enter supplier name"
            error={errors.name}
            style={styles.input}
          />

          <Input
            label="Contact Person *"
            value={formData.contact_person}
            onChangeText={(value) => updateFormData('contact_person', value)}
            placeholder="Enter contact person name"
            error={errors.contact_person}
            style={styles.input}
          />

          <Input
            label="Email *"
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            style={styles.input}
          />

          <Input
            label="Phone *"
            value={formData.phone}
            onChangeText={(value) => updateFormData('phone', value)}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            error={errors.phone}
            style={styles.input}
          />

          <Input
            label="Address *"
            value={formData.address}
            onChangeText={(value) => updateFormData('address', value)}
            placeholder="Enter full address"
            multiline
            numberOfLines={3}
            error={errors.address}
            style={styles.input}
          />

          <Text style={styles.sectionTitle}>Additional Information</Text>

          <Input
            label="Tax Number"
            value={formData.tax_number}
            onChangeText={(value) => updateFormData('tax_number', value)}
            placeholder="Enter tax number"
            style={styles.input}
          />

          <Input
            label="Payment Terms"
            value={formData.payment_terms}
            onChangeText={(value) => updateFormData('payment_terms', value)}
            placeholder="e.g., Net 30, Net 60"
            style={styles.input}
          />

          <Input
            label="Credit Limit"
            value={formData.credit_limit}
            onChangeText={(value) => updateFormData('credit_limit', value)}
            placeholder="Enter credit limit amount"
            keyboardType="numeric"
            style={styles.input}
            error={errors.credit_limit}
          />

          {submitError && (
            <View style={styles.errorContainer}>
              <Icon name="error" size={20} color={COLORS.status.error} />
              <Text style={styles.errorText}>{submitError}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => {
                  setSubmitError(null);
                  performSubmit();
                }}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <Button
              title={loading ? 'Saving...' : (isEditing ? 'Update Supplier' : 'Add Supplier')}
              onPress={handleSubmit}
              disabled={loading}
              variant="primary"
              size="large"
              style={styles.mainButton}
            />
            
            {isEditing && existingSupplier && (
              <Button
                title="Reset to Original"
                onPress={resetToOriginal}
                disabled={loading}
                variant="outline"
                size="medium"
                style={styles.secondaryButton}
              />
            )}
            
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingText}>Saving supplier...</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerGradient: {
    paddingTop: SPACING.xl + 20, // Add extra padding for status bar
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
    ...SHADOWS.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  headerButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  formContainer: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    margin: SPACING.lg,
    ...SHADOWS.lg,
  },
  editModeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  editModeText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#1F2937',
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  input: {
    marginBottom: SPACING.md,
  },
  buttonContainer: {
    padding: SPACING.lg,
  },
  mainButton: {
    marginBottom: SPACING.md,
  },
  secondaryButton: {
    marginTop: SPACING.sm,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  loadingText: {
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.secondary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.status.error,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  errorText: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.status.error,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: COLORS.text.light,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});

export default SupplierFormScreen;
