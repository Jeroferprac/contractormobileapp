import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../constants/spacing';
import { TYPOGRAPHY } from '../constants/typography';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { ProductSupplier, Product, Supplier } from '../types/inventory';
import { SuppliersScreenNavigationProp } from '../types/navigation';
import inventoryApiService from '../api/inventoryApi';

interface ProductSupplierFormScreenProps {
  navigation: SuppliersScreenNavigationProp;
  route?: {
    params?: {
      productSupplier?: ProductSupplier;
      isEditing?: boolean;
    };
  };
}

const ProductSupplierFormScreen: React.FC<ProductSupplierFormScreenProps> = ({ navigation, route }) => {
  const isEditing = route?.params?.isEditing || false;
  const existingProductSupplier = route?.params?.productSupplier;
  
  const [formData, setFormData] = useState({
    product_id: existingProductSupplier?.product_id?.toString() || '',
    supplier_id: existingProductSupplier?.supplier_id?.toString() || '',
    supplier_code: existingProductSupplier?.supplier_code || '',
    cost_price: existingProductSupplier?.cost_price?.toString() || '',
    lead_time_days: existingProductSupplier?.lead_time_days?.toString() || '',
    minimum_order_quantity: existingProductSupplier?.minimum_order_quantity?.toString() || '',
    is_preferred: existingProductSupplier?.is_preferred || false,
  });
  
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      setLoadingData(true);
      const [productsRes, suppliersRes] = await Promise.all([
        inventoryApiService.getProducts(),
        inventoryApiService.getSuppliers(),
      ]);
      
      setProducts(productsRes.data || []);
      setSuppliers(suppliersRes.data || []);
    } catch (error) {
      console.error('Error loading form data:', error);
      Alert.alert('Error', 'Failed to load products and suppliers');
    } finally {
      setLoadingData(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.product_id) {
      newErrors.product_id = 'Product is required';
    }

    if (!formData.supplier_id) {
      newErrors.supplier_id = 'Supplier is required';
    }

    if (!formData.supplier_code.trim()) {
      newErrors.supplier_code = 'Supplier code is required';
    }

    if (!formData.cost_price.trim()) {
      newErrors.cost_price = 'Cost price is required';
    } else if (isNaN(Number(formData.cost_price)) || Number(formData.cost_price) <= 0) {
      newErrors.cost_price = 'Cost price must be a valid positive number';
    }

    if (!formData.lead_time_days.trim()) {
      newErrors.lead_time_days = 'Lead time is required';
    } else if (isNaN(Number(formData.lead_time_days)) || Number(formData.lead_time_days) < 0) {
      newErrors.lead_time_days = 'Lead time must be a valid non-negative number';
    }

    if (!formData.minimum_order_quantity.trim()) {
      newErrors.minimum_order_quantity = 'Minimum order quantity is required';
    } else if (isNaN(Number(formData.minimum_order_quantity)) || Number(formData.minimum_order_quantity) <= 0) {
      newErrors.minimum_order_quantity = 'Minimum order quantity must be a valid positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const productSupplierData = {
        product_id: formData.product_id,
        supplier_id: formData.supplier_id,
        supplier_code: formData.supplier_code.trim(),
        cost_price: Number(formData.cost_price),
        lead_time_days: Number(formData.lead_time_days),
        minimum_order_quantity: Number(formData.minimum_order_quantity),
        is_preferred: formData.is_preferred,
      };

      console.log('🔄 [ProductSupplierForm] Sending product supplier data:', JSON.stringify(productSupplierData, null, 2));

      if (isEditing && existingProductSupplier) {
        await inventoryApiService.updateProductSupplier(existingProductSupplier.id, productSupplierData);
        Alert.alert('Success', 'Product supplier updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        await inventoryApiService.createProductSupplier(productSupplierData);
        Alert.alert('Success', 'Product supplier created successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error: any) {
      console.error('❌ [ProductSupplierForm] Error saving product supplier:', error);
      
      // Log the response details if available
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      // Show more specific error message
      let errorMessage = 'Failed to save product supplier. Please try again.';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getSelectedProduct = () => {
    return products.find(p => p.id.toString() === formData.product_id);
  };

  const getSelectedSupplier = () => {
    return suppliers.find(s => s.id.toString() === formData.supplier_id);
  };

  if (loadingData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <LinearGradient colors={COLORS.gradient.primary} style={styles.headerGradient}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} color={COLORS.text.light} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {isEditing ? 'Edit Product Supplier' : 'Add Product Supplier'}
            </Text>
            <View style={{ width: 24 }} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading form data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
              {isEditing ? 'Edit Product Supplier' : 'Add Product Supplier'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {isEditing ? 'Update product-supplier relationship' : 'Create new product-supplier relationship'}
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
          <Text style={styles.sectionTitle}>Product & Supplier Selection</Text>
          
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownLabel}>Product *</Text>
            <TouchableOpacity
              style={[styles.dropdown, errors.product_id ? styles.dropdownError : null]}
              onPress={() => {
                // In a real app, you'd show a picker here
                Alert.alert('Select Product', 'Product picker would open here');
              }}
            >
              <Text style={[
                styles.dropdownText,
                !formData.product_id && styles.dropdownPlaceholder
              ]}>
                {formData.product_id ? getSelectedProduct()?.name || 'Unknown Product' : 'Select a product'}
              </Text>
              <Icon name="arrow-drop-down" size={24} color={COLORS.text.secondary} />
            </TouchableOpacity>
            {errors.product_id && <Text style={styles.errorText}>{errors.product_id}</Text>}
          </View>

          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownLabel}>Supplier *</Text>
            <TouchableOpacity
              style={[styles.dropdown, errors.supplier_id ? styles.dropdownError : null]}
              onPress={() => {
                // In a real app, you'd show a picker here
                Alert.alert('Select Supplier', 'Supplier picker would open here');
              }}
            >
              <Text style={[
                styles.dropdownText,
                !formData.supplier_id && styles.dropdownPlaceholder
              ]}>
                {formData.supplier_id ? getSelectedSupplier()?.name || 'Unknown Supplier' : 'Select a supplier'}
              </Text>
              <Icon name="arrow-drop-down" size={24} color={COLORS.text.secondary} />
            </TouchableOpacity>
            {errors.supplier_id && <Text style={styles.errorText}>{errors.supplier_id}</Text>}
          </View>

          <Input
            label="Supplier Code *"
            value={formData.supplier_code}
            onChangeText={(value) => updateFormData('supplier_code', value)}
            placeholder="Enter supplier's product code"
            error={errors.supplier_code}
            style={styles.input}
          />

          <Text style={styles.sectionTitle}>Pricing & Terms</Text>

          <Input
            label="Cost Price (€) *"
            value={formData.cost_price}
            onChangeText={(value) => updateFormData('cost_price', value)}
            placeholder="Enter cost price"
            keyboardType="numeric"
            error={errors.cost_price}
            style={styles.input}
          />

          <Input
            label="Lead Time (Days) *"
            value={formData.lead_time_days}
            onChangeText={(value) => updateFormData('lead_time_days', value)}
            placeholder="Enter lead time in days"
            keyboardType="numeric"
            error={errors.lead_time_days}
            style={styles.input}
          />

          <Input
            label="Minimum Order Quantity *"
            value={formData.minimum_order_quantity}
            onChangeText={(value) => updateFormData('minimum_order_quantity', value)}
            placeholder="Enter minimum order quantity"
            keyboardType="numeric"
            error={errors.minimum_order_quantity}
            style={styles.input}
          />

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => updateFormData('is_preferred', !formData.is_preferred)}
            >
              <Icon
                name={formData.is_preferred ? 'check-box' : 'check-box-outline-blank'}
                size={24}
                color={formData.is_preferred ? COLORS.primary : COLORS.text.tertiary}
              />
              <Text style={styles.checkboxLabel}>Mark as preferred supplier</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.buttonContainer}>
          <Button
            title={loading ? 'Saving...' : (isEditing ? 'Update Product Supplier' : 'Add Product Supplier')}
            onPress={handleSubmit}
            disabled={loading}
            style={styles.submitButton}
          />
          
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>Saving product supplier...</Text>
            </View>
          )}
        </View>
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
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#1F2937',
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  dropdownContainer: {
    marginBottom: SPACING.md,
  },
  dropdownLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: '#1F2937',
    marginBottom: SPACING.sm,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  dropdownError: {
    borderColor: '#EF4444',
  },
  dropdownText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: '#1F2937',
    flex: 1,
  },
  dropdownPlaceholder: {
    color: '#6B7280',
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#EF4444',
    marginTop: SPACING.xs,
  },
  input: {
    marginBottom: SPACING.md,
  },
  checkboxContainer: {
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: '#1F2937',
    marginLeft: SPACING.sm,
  },
  buttonContainer: {
    padding: SPACING.lg,
  },
  submitButton: {
    marginBottom: SPACING.md,
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
    color: '#6B7280',
  },
});

export default ProductSupplierFormScreen;
