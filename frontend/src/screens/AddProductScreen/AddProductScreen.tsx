import React, { useState, useRef, useEffect } from 'react';
import React, { useState, useRef, useEffect } from 'react';
import inventoryApiService from '../../api/inventoryApi';
// import LottieView from 'lottie-react-native';
// import LottieView from 'lottie-react-native';
import {
  View,
  Text,
  ScrollView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Alert,
  TextInput,
  Platform,
  Switch,
  Modal,
  Switch,
  Modal,
} from 'react-native';
import { Switch } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/spacing';
import { FORM_STYLES, FORM_COLORS, INPUT_ICONS } from '../../constants/formStyles';
import { Product } from '../../types/inventory';
import SuccessModal from '../../components/SuccessModal';
import FailureModal from '../../components/FailureModal';

interface AddProductScreenProps {
  navigation: any;
  route: {
    params?: {
      product?: Product;
    };
  };
}

const AddProductScreen: React.FC<AddProductScreenProps> = ({ navigation, route }) => {
  const editingProduct = route.params?.product;
  const isEditing = !!editingProduct;

  const [form, setForm] = useState({
    name: '',
    sku: '',
    barcode: '',
    category_name: '',
    brand: '',
    unit: '',
    current_stock: '',
    min_stock_level: '',
    reorder_point: '',
    max_stock_level: '',
    cost_price: '',
    selling_price: '',
    description: '',
    weight: '',
    dimensions: '',
    is_active: true,
    track_serial: false,
    track_batch: false,
    is_composite: false,
  });

  useEffect(() => {
    if (editingProduct) {
      setForm({
        name: editingProduct.name || '',
        sku: editingProduct.sku || '',
        barcode: editingProduct.barcode || '',
        category_name: editingProduct.category_name || '',
        brand: editingProduct.brand || '',
        unit: editingProduct.unit || '',
        current_stock: editingProduct.current_stock?.toString() || '',
        min_stock_level: editingProduct.min_stock_level?.toString() || '',
        reorder_point: editingProduct.reorder_point?.toString() || '',
        max_stock_level: editingProduct.max_stock_level?.toString() || '',
        cost_price: editingProduct.cost_price?.toString() || '',
        selling_price: editingProduct.selling_price?.toString() || '',
        description: editingProduct.description || '',
        weight: editingProduct.weight || '',
        dimensions: editingProduct.dimensions || '',
        is_active: editingProduct.is_active || true,
        track_serial: editingProduct.track_serial || false,
        track_batch: editingProduct.track_batch || false,
        is_composite: editingProduct.is_composite || false,
      });
    }
  }, [editingProduct]);

  const [saving, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [failureMessage, setFailureMessage] = useState('');

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (isEditing && editingProduct) {
        await inventoryApiService.updateProduct(editingProduct.id, form);
        setSuccessMessage('Product updated successfully!');
      } else {
        await inventoryApiService.createProduct(form);
        setSuccessMessage('Product created successfully!');
      }
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Product form error:', error);
      setFailureMessage(error.response?.data?.detail || 'Failed to save product. Please check your connection and try again.');
      setShowFailureModal(true);
    } finally {
      setSaving(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigation.goBack();
  };

  const handleFailureModalClose = () => {
    setShowFailureModal(false);
  };

  const handleFailureModalAction = () => {
    setShowFailureModal(false);
    // Optionally retry the operation
    // handleSave();
  };

  const getHeaderImage = () => {
    return 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=600&fit=crop';
  };

  const renderInputField = (
    field: string,
    label: string,
    placeholder: string,
    icon: string,
    keyboardType: 'default' | 'numeric' = 'default',
    multiline: boolean = false
  ) => (
    <View style={FORM_STYLES.inputContainer}>
      <Text style={FORM_STYLES.inputLabel}>{label}</Text>
      <View style={FORM_STYLES.inputWrapper}>
        <Icon name={icon} size={20} color={FORM_COLORS.text.secondary} style={FORM_STYLES.inputIcon} />
        <TextInput
          style={[FORM_STYLES.input, multiline && FORM_STYLES.inputMultiline]}
          placeholder={placeholder}
          placeholderTextColor={FORM_COLORS.text.tertiary}
          value={form[field as keyof typeof form] as string}
          onChangeText={(value) => handleChange(field, value)}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
        />
      </View>
    </View>
  );

  const renderRowInputs = (leftField: string, leftLabel: string, leftIcon: string, rightField: string, rightLabel: string, rightIcon: string, keyboardType: 'default' | 'numeric' = 'default') => (
    <View style={FORM_STYLES.formRow}>
      <View style={FORM_STYLES.formRowItem}>
        {renderInputField(leftField, leftLabel, leftLabel, leftIcon, keyboardType)}
      </View>
      <View style={FORM_STYLES.formRowItem}>
        {renderInputField(rightField, rightLabel, rightLabel, rightIcon, keyboardType)}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={FORM_STYLES.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={FORM_COLORS.background} />
      <View style={FORM_STYLES.container}>
        <View style={FORM_STYLES.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={FORM_STYLES.backButton}>
            <Icon name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={FORM_STYLES.headerTitle}>
            {isEditing ? 'Edit Product' : 'Add Product'}
          </Text>
          <View style={FORM_STYLES.headerSpacer} />
        </View>

        <ScrollView style={FORM_STYLES.scrollView} showsVerticalScrollIndicator={false}>
          <View style={FORM_STYLES.scrollContent}>
            {/* Basic Information Card */}
            <View style={FORM_STYLES.card}>
              <View style={FORM_STYLES.cardHeader}>
                <Icon name="package-variant" size={24} color={FORM_COLORS.primary} />
                <Text style={FORM_STYLES.cardTitle}>Basic Information</Text>
              </View>
              
              {renderRowInputs('name', 'Product Name', 'package-variant', 'sku', 'SKU', 'barcode')}
              {renderRowInputs('barcode', 'Barcode', 'barcode', 'category_name', 'Category', 'tag')}
              {renderRowInputs('brand', 'Brand', 'tag', 'unit', 'Unit', 'scale-unbalanced')}
            </View>

            {/* Stock Information Card */}
            <View style={FORM_STYLES.card}>
              <View style={FORM_STYLES.cardHeader}>
                <Icon name="package-variant-closed" size={24} color={FORM_COLORS.primary} />
                <Text style={FORM_STYLES.cardTitle}>Stock Information</Text>
              </View>
              
              {renderRowInputs('current_stock', 'Current Stock', 'package-variant-closed', 'min_stock_level', 'Min Stock Level', 'alert-circle', 'numeric')}
              {renderRowInputs('reorder_point', 'Reorder Point', 'alert-circle', 'max_stock_level', 'Max Stock Level', 'trending-up', 'numeric')}
            </View>

            {/* Pricing Information Card */}
            <View style={FORM_STYLES.card}>
              <View style={FORM_STYLES.cardHeader}>
                <Icon name="currency-usd" size={24} color={FORM_COLORS.primary} />
                <Text style={FORM_STYLES.cardTitle}>Pricing Information</Text>
              </View>
              
              {renderRowInputs('cost_price', 'Cost Price', 'currency-usd', 'selling_price', 'Selling Price', 'currency-usd', 'numeric')}
            </View>

            {/* Physical Properties Card */}
            <View style={FORM_STYLES.card}>
              <View style={FORM_STYLES.cardHeader}>
                <Icon name="weight" size={24} color={FORM_COLORS.primary} />
                <Text style={FORM_STYLES.cardTitle}>Physical Properties</Text>
              </View>
              
              {renderRowInputs('weight', 'Weight', 'weight', 'dimensions', 'Dimensions', 'resize')}
              {renderInputField('description', 'Description', 'Enter product description', 'text', 'default', true)}
            </View>

            {/* Product Options Card */}
            <View style={FORM_STYLES.card}>
              <View style={FORM_STYLES.cardHeader}>
                <Icon name="cog" size={24} color={FORM_COLORS.primary} />
                <Text style={FORM_STYLES.cardTitle}>Product Options</Text>
              </View>
              
              <View style={FORM_STYLES.toggleContainer}>
                <View style={FORM_STYLES.toggleLabelContainer}>
                  <Icon name="check-circle" size={20} color={FORM_COLORS.primary} />
                  <Text style={FORM_STYLES.toggleLabel}>Active Product</Text>
                </View>
                <TouchableOpacity
                  style={[
                    FORM_STYLES.toggleSwitch,
                    form.is_active && FORM_STYLES.toggleSwitchActive
                  ]}
                  onPress={() => handleChange('is_active', !form.is_active)}
                >
                  <View style={[
                    FORM_STYLES.toggleThumb,
                    form.is_active && FORM_STYLES.toggleThumbActive
                  ]} />
                </TouchableOpacity>
              </View>

              <View style={FORM_STYLES.toggleContainer}>
                <View style={FORM_STYLES.toggleLabelContainer}>
                  <Icon name="barcode" size={20} color={FORM_COLORS.primary} />
                  <Text style={FORM_STYLES.toggleLabel}>Track Serial Numbers</Text>
                </View>
                <TouchableOpacity
                  style={[
                    FORM_STYLES.toggleSwitch,
                    form.track_serial && FORM_STYLES.toggleSwitchActive
                  ]}
                  onPress={() => handleChange('track_serial', !form.track_serial)}
                >
                  <View style={[
                    FORM_STYLES.toggleThumb,
                    form.track_serial && FORM_STYLES.toggleThumbActive
                  ]} />
                </TouchableOpacity>
              </View>

              <View style={FORM_STYLES.toggleContainer}>
                <View style={FORM_STYLES.toggleLabelContainer}>
                  <Icon name="package-variant" size={20} color={FORM_COLORS.primary} />
                  <Text style={FORM_STYLES.toggleLabel}>Track Batch Numbers</Text>
                </View>
                <TouchableOpacity
                  style={[
                    FORM_STYLES.toggleSwitch,
                    form.track_batch && FORM_STYLES.toggleSwitchActive
                  ]}
                  onPress={() => handleChange('track_batch', !form.track_batch)}
                >
                  <View style={[
                    FORM_STYLES.toggleThumb,
                    form.track_batch && FORM_STYLES.toggleThumbActive
                  ]} />
                </TouchableOpacity>
              </View>

              <View style={FORM_STYLES.toggleContainer}>
                <View style={FORM_STYLES.toggleLabelContainer}>
                  <Icon name="layers" size={20} color={FORM_COLORS.primary} />
                  <Text style={FORM_STYLES.toggleLabel}>Composite Product</Text>
                </View>
                <TouchableOpacity
                  style={[
                    FORM_STYLES.toggleSwitch,
                    form.is_composite && FORM_STYLES.toggleSwitchActive
                  ]}
                  onPress={() => handleChange('is_composite', !form.is_composite)}
                >
                  <View style={[
                    FORM_STYLES.toggleThumb,
                    form.is_composite && FORM_STYLES.toggleThumbActive
                  ]} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={FORM_STYLES.buttonContainer}>
              <TouchableOpacity
                style={FORM_STYLES.secondaryButton}
                onPress={() => navigation.goBack()}
                disabled={saving}
              >
                <Text style={FORM_STYLES.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <LinearGradient
                colors={FORM_COLORS.primaryGradient}
                style={[FORM_STYLES.primaryButton, saving && FORM_STYLES.buttonDisabled]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <TouchableOpacity
                  style={FORM_STYLES.primaryButtonContent}
                  onPress={handleSave}
                  disabled={saving}
                >
                  <Icon 
                    name={isEditing ? 'content-save' : 'plus'} 
                    size={20} 
                    color="#fff" 
                    style={FORM_STYLES.primaryButtonIcon}
                  />
                  <Text style={FORM_STYLES.primaryButtonText}>
                    {saving ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product')}
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>
        </ScrollView>

        {/* Success Modal */}
        <SuccessModal
          visible={showSuccessModal}
          title="Success!"
          message={successMessage}
          onClose={handleSuccessModalClose}
          onAction={handleSuccessModalClose}
          actionText="Continue"
          iconType="message"
        />

        {/* Failure Modal */}
        <FailureModal
          visible={showFailureModal}
          title="Update Failed"
          message={failureMessage}
          onClose={handleFailureModalClose}
          onAction={handleFailureModalAction}
          actionText="Try Again"
          animationType="shake"
          iconType="error"
        />
      </View>
    </SafeAreaView>
  );
};


export default AddProductScreen;
