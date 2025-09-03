import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

import { COLORS } from '../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../constants/spacing';
import { TYPOGRAPHY } from '../constants/typography';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { priceListsApiService, PriceList } from '../api/priceListsApi';

interface EditPriceListForm {
  name: string;
  description: string;
  currency: string;
  category: string;
  isActive: boolean;
}

interface EditPriceListScreenProps {
  navigation: any;
  route: {
    params?: {
      priceList?: PriceList;
      isEditing?: boolean;
    };
  };
}

const EditPriceListScreen: React.FC<EditPriceListScreenProps> = ({ navigation, route }) => {
  const isEditing = route?.params?.isEditing || false;
  const existingPriceList = route?.params?.priceList;
  
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState<EditPriceListForm>({
    name: '',
    description: '',
    currency: 'USD',
    category: 'General',
    isActive: true,
  });

  useEffect(() => {
    if (isEditing && existingPriceList) {
      loadPriceListData();
    }
  }, [isEditing, existingPriceList]);

  const loadPriceListData = async () => {
    if (!existingPriceList?.id) return;
    
    setInitialLoading(true);
    try {
      const priceListData = await priceListsApiService.getPriceList(existingPriceList.id);
      setForm({
        name: priceListData.name || '',
        description: priceListData.description || '',
        currency: priceListData.currency || 'USD',
        category: priceListData.category || 'General',
        isActive: priceListData.is_active || true,
      });
    } catch (error) {
      console.error('Error loading price list data:', error);
      Alert.alert('Error', 'Failed to load price list data');
    } finally {
      setInitialLoading(false);
    }
  };

  const updateFormData = (field: keyof EditPriceListForm, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field as string]: '' }));
    }
    if (submitError) {
      setSubmitError(null);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = 'Price list name is required';
    }

    if (!form.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!form.currency.trim()) {
      newErrors.currency = 'Currency is required';
    }

    if (!form.category.trim()) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // Show confirmation for updates
    if (isEditing && existingPriceList) {
      Alert.alert(
        'Update Price List',
        'Are you sure you want to update this price list?',
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
    setIsLoading(true);
    setSubmitError(null);
    try {
      const priceListData = {
        name: form.name.trim(),
        description: form.description.trim(),
        currency: form.currency,
        category: form.category,
        isActive: form.isActive,
        updatedAt: new Date().toISOString(),
      };

      console.log('🔄 [EditPriceList] Price list data:', JSON.stringify(priceListData, null, 2));
      console.log('🔄 [EditPriceList] Is editing:', isEditing);
      console.log('🔄 [EditPriceList] Existing price list ID:', existingPriceList?.id);

      if (isEditing && existingPriceList) {
        console.log('🔄 [EditPriceList] Updating existing price list...');
        const response = await priceListsApiService.updatePriceList(existingPriceList.id, priceListData);
        console.log('✅ [EditPriceList] Update response:', response);
        Alert.alert('Success', 'Price list updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        console.log('🔄 [EditPriceList] Creating new price list...');
        const response = await priceListsApiService.createPriceList({
          ...priceListData,

        });
        console.log('✅ [EditPriceList] Create response:', response);
        Alert.alert('Success', 'Price list created successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error: any) {
      console.error('❌ [EditPriceList] Error saving price list:', error);
      
      let errorMessage = 'Failed to save price list. Please try again.';
      
      if (error.response?.data?.detail) {
        errorMessage = String(error.response.data.detail);
      } else if (error.response?.data?.message) {
        errorMessage = String(error.response.data.message);
      } else if (error.message) {
        errorMessage = String(error.message);
      }
      
      setSubmitError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetToOriginal = () => {
    if (existingPriceList) {
      setForm({
        name: existingPriceList.name || '',
        description: existingPriceList.description || '',
        currency: existingPriceList.currency || 'USD',
        category: existingPriceList.category || 'General',
        isActive: existingPriceList.is_active || true,
      });
      setErrors({});
      Alert.alert('Reset', 'Form has been reset to original values');
    }
  };

     const handleBackPress = () => {
     console.log('🔙 Back button pressed');
     if (form.name || form.description) {
       Alert.alert(
         'Discard Changes',
         'Are you sure you want to discard your changes?',
         [
           { text: 'Cancel', style: 'cancel' },
           { text: 'Discard', style: 'destructive', onPress: () => {
             console.log('🔙 Navigating back after discard');
             navigation.goBack();
           }},
         ]
       );
     } else {
       console.log('🔙 Navigating back directly');
       navigation.goBack();
     }
   };

     if (initialLoading) {
     return (
       <>
         <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
         <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
           <LinearGradient 
             colors={COLORS.gradient.primary} 
             style={styles.headerGradient}
             start={{ x: 0, y: 0 }}
             end={{ x: 1, y: 1 }}
           >
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleBackPress}
              activeOpacity={0.8}

            >
              <Icon name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>
                {isEditing ? 'Edit Price List' : 'Create Price List'}
              </Text>
              <Text style={styles.headerSubtitle}>
                {isEditing ? 'Update price list information' : 'Create new price list'}
              </Text>
            </View>
            <View style={{ width: 48 }} />
          </View>
                 </LinearGradient>
         <View style={styles.loadingContainer}>
           <ActivityIndicator size="large" color={COLORS.primary} />
           <Text style={styles.loadingText}>Loading price list data...</Text>
         </View>
       </SafeAreaView>
       </>
     );
   }

        return (
     <>
       <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
       <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
         <LinearGradient 
           colors={COLORS.gradient.primary} 
           style={styles.headerGradient}
           start={{ x: 0, y: 0 }}
           end={{ x: 1, y: 1 }}
         >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleBackPress}
            activeOpacity={0.8}

          >
            <Icon name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>
              {isEditing ? 'Edit Price List' : 'Create Price List'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {isEditing ? 'Update price list information' : 'Create new price list'}
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
              <Text style={styles.editModeText}>Editing Price List</Text>
            </View>
          )}
          
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <Input
            label="Price List Name *"
            value={form.name}
            onChangeText={(value) => updateFormData('name', value)}
            placeholder="Enter price list name"
            error={errors.name}
            style={styles.input}
          />

          <Input
            label="Description *"
            value={form.description}
            onChangeText={(value) => updateFormData('description', value)}
            placeholder="Enter description"
            multiline
            numberOfLines={4}
            error={errors.description}
            style={styles.input}
          />

          <Text style={styles.sectionTitle}>Configuration</Text>

          <Input
            label="Currency *"
            value={form.currency}
            onChangeText={(value) => updateFormData('currency', value)}
            placeholder="USD"
            error={errors.currency}
            style={styles.input}
          />

          <Input
            label="Category *"
            value={form.category}
            onChangeText={(value) => updateFormData('category', value)}
            placeholder="General"
            error={errors.category}
            style={styles.input}
          />

          <View style={styles.switchGroup}>
            <Text style={styles.switchLabel}>Active Status</Text>
            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>
                {form.isActive ? 'Active' : 'Inactive'}
              </Text>
              <TouchableOpacity
                style={[
                  styles.toggleSwitch,
                  { backgroundColor: form.isActive ? COLORS.primary : COLORS.border.light }
                ]}
                onPress={() => updateFormData('isActive', !form.isActive)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.toggleThumb,
                  { transform: [{ translateX: form.isActive ? 20 : 0 }] }
                ]} />
              </TouchableOpacity>
            </View>
          </View>

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
              title={isLoading ? 'Saving...' : (isEditing ? 'Update Price List' : 'Create Price List')}
              onPress={handleSubmit}
              disabled={isLoading}
              variant="primary"
              size="medium"
              style={styles.mainButton}
            />
            
            {isEditing && existingPriceList && (
              <Button
                title="Reset to Original"
                onPress={resetToOriginal}
                disabled={isLoading}
                variant="outline"
                size="medium"
                style={styles.secondaryButton}
              />
            )}
            
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingText}>Saving price list...</Text>
              </View>
            )}
          </View>
                 </LinearGradient>
       </ScrollView>
     </SafeAreaView>
     </>
   );
 };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
     headerGradient: {
     paddingTop: SPACING.md,
     paddingBottom: SPACING.lg,
     borderBottomLeftRadius: BORDER_RADIUS.xl,
     borderBottomRightRadius: BORDER_RADIUS.xl,
     ...SHADOWS.lg,
   },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.light,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  formContainer: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    margin: SPACING.lg,
    marginTop: SPACING.md,
    ...SHADOWS.lg,
  },
  editModeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
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
    marginTop: SPACING.md,
  },
  input: {
    marginBottom: SPACING.md,
  },
  switchGroup: {
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  switchLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#1F2937',
    marginBottom: SPACING.sm,
  },
  switchText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.regular,
    color: COLORS.text.primary,
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
  toggleSwitch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default EditPriceListScreen;
