import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { inventoryApiService } from '../../../../api/inventoryApi';
import { Stock, Warehouse, Product } from '../../../../types/inventory';
import { COLORS } from '../../../../constants/colors';
import { FORM_STYLES, FORM_COLORS, INPUT_ICONS } from '../../../../constants/formStyles';
import SuccessModal from '../../../SuccessModal';
import FailureModal from '../../../FailureModal';
import ModalPicker from '../../../ui/ModalPicker';

interface StockFormProps {
  stock?: Stock | null;
  onSuccess: () => void;
  onCancel: () => void;
  mode: 'create' | 'update';
}

const StockForm: React.FC<StockFormProps> = ({
  stock,
  onSuccess,
  onCancel,
  mode,
}) => {
  const [formData, setFormData] = useState({
    product_id: '',
    warehouse_id: '',
    quantity: '',
    reserved_quantity: '',
    available_quantity: '',
    bin_location: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [failureMessage, setFailureMessage] = useState('');
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [showWarehousePicker, setShowWarehousePicker] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Fetch products and warehouses from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        
        // Fetch products and warehouses in parallel
        const [productsResponse, warehousesResponse] = await Promise.all([
          inventoryApiService.getProducts(),
          inventoryApiService.getWarehouses(),
        ]);

        setProducts(productsResponse.data);
        setWarehouses(warehousesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'Failed to load products and warehouses. Please try again.');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (stock && mode === 'update' && warehouses.length > 0 && products.length > 0) {
      setFormData({
        product_id: stock.product_id,
        warehouse_id: stock.warehouse_id,
        quantity: typeof stock.quantity === 'string' ? stock.quantity : stock.quantity.toString(),
        reserved_quantity: typeof stock.reserved_quantity === 'string' ? stock.reserved_quantity : stock.reserved_quantity.toString(),
        available_quantity: typeof stock.available_quantity === 'string' ? stock.available_quantity : stock.available_quantity.toString(),
        bin_location: stock.bin_location || '',
      });

      const warehouse = warehouses.find(w => w.id === stock.warehouse_id);
      const product = products.find(p => p.id === stock.product_id);
      setSelectedWarehouse(warehouse || null);
      setSelectedProduct(product || null);
    }
  }, [stock, mode, warehouses, products]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.product_id) {
      newErrors.product_id = 'Product is required';
    }

    if (!formData.warehouse_id) {
      newErrors.warehouse_id = 'Warehouse is required';
    }

    if (!formData.quantity || parseFloat(formData.quantity) < 0) {
      newErrors.quantity = 'Valid quantity is required';
    }

    if (!formData.reserved_quantity || parseFloat(formData.reserved_quantity) < 0) {
      newErrors.reserved_quantity = 'Valid reserved quantity is required';
    }

    if (!formData.available_quantity || parseFloat(formData.available_quantity) < 0) {
      newErrors.available_quantity = 'Valid available quantity is required';
    }

    const quantity = parseFloat(formData.quantity);
    const reserved = parseFloat(formData.reserved_quantity);
    const available = parseFloat(formData.available_quantity);

    if (reserved > quantity) {
      newErrors.reserved_quantity = 'Reserved quantity cannot exceed total quantity';
    }

    if (available !== (quantity - reserved)) {
      newErrors.available_quantity = 'Available quantity should equal total quantity minus reserved quantity';
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
      const stockData = {
        product_id: formData.product_id,
        warehouse_id: formData.warehouse_id,
        quantity: parseFloat(formData.quantity),
        reserved_quantity: parseFloat(formData.reserved_quantity),
        available_quantity: parseFloat(formData.available_quantity),
        bin_location: formData.bin_location,
      };

      if (mode === 'create') {
        await inventoryApiService.createStock(stockData);
        setSuccessMessage('Stock created successfully!');
        setShowSuccessModal(true);
      } else if (stock) {
        await inventoryApiService.updateStock(stock.id, stockData);
        setSuccessMessage('Stock updated successfully!');
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      console.error('Stock form error:', error);
      setFailureMessage(error.response?.data?.detail || 'Failed to save stock. Please check your connection and try again.');
      setShowFailureModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    onSuccess();
  };

  const handleFailureModalClose = () => {
    setShowFailureModal(false);
  };

  const handleFailureModalAction = () => {
    setShowFailureModal(false);
    // Optionally retry the operation
    // handleSubmit();
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Auto-calculate available quantity
    if (field === 'quantity' || field === 'reserved_quantity') {
      const quantity = field === 'quantity' ? parseFloat(value) : parseFloat(formData.quantity);
      const reserved = field === 'reserved_quantity' ? parseFloat(value) : parseFloat(formData.reserved_quantity);
      
      if (!isNaN(quantity) && !isNaN(reserved)) {
        const available = Math.max(0, quantity - reserved);
        setFormData(prev => ({ ...prev, available_quantity: available.toString() }));
      }
    }
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
      <View style={[
          FORM_STYLES.inputWrapper,
          errors[field] && FORM_STYLES.inputWrapperError,
        ]}>
        <Icon name={icon} size={20} color={FORM_COLORS.text.secondary} style={FORM_STYLES.inputIcon} />
        <TextInput
          style={[FORM_STYLES.input, multiline && FORM_STYLES.inputMultiline]}
          placeholder={placeholder}
          placeholderTextColor={FORM_COLORS.text.tertiary}
          value={formData[field as keyof typeof formData]}
          onChangeText={(value) => updateField(field, value)}
          keyboardType={keyboardType}
        />
      </View>
      {errors[field] && <Text style={FORM_STYLES.errorText}>{errors[field]}</Text>}
    </View>
  );

  const renderPickerField = (
    field: string,
    label: string,
    icon: string,
    items: Array<{ id: string; name: string; code?: string; description?: string }>,
    selectedItem: { id: string; name: string; code?: string; description?: string } | null,
    onSelect: (item: { id: string; name: string; code?: string; description?: string }) => void,
    showPicker: boolean,
    setShowPicker: (show: boolean) => void
  ) => (
    <View style={FORM_STYLES.inputContainer}>
      <Text style={FORM_STYLES.inputLabel}>{label}</Text>
      <TouchableOpacity
        style={[
          FORM_STYLES.inputWrapper,
          errors[field] && FORM_STYLES.inputWrapperError,
        ]}
        onPress={() => setShowPicker(true)}
      >
        <Icon name={icon} size={20} color={FORM_COLORS.text.secondary} style={FORM_STYLES.inputIcon} />
        <Text style={[
          FORM_STYLES.input,
          !selectedItem && { color: FORM_COLORS.text.tertiary }
        ]}>
          {selectedItem ? selectedItem.name : `Select ${label.toLowerCase()}`}
        </Text>
        <Icon name="chevron-down" size={20} color={FORM_COLORS.text.tertiary} />
      </TouchableOpacity>
      {errors[field] && <Text style={FORM_STYLES.errorText}>{errors[field]}</Text>}
    </View>
  );

  return (
    <View style={FORM_STYLES.container}>
      <View style={FORM_STYLES.header}>
        <TouchableOpacity onPress={onCancel} style={FORM_STYLES.backButton}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={FORM_STYLES.headerTitle}>
          {mode === 'create' ? 'Create Stock' : 'Update Stock'}
        </Text>
        <View style={FORM_STYLES.headerSpacer} />
      </View>

      <ScrollView style={FORM_STYLES.scrollView} showsVerticalScrollIndicator={false}>
        <View style={FORM_STYLES.scrollContent}>
          {loadingData ? (
            <View style={FORM_STYLES.loadingContainer}>
              <ActivityIndicator size="large" color={FORM_COLORS.primary} />
              <Text style={FORM_STYLES.loadingText}>Loading products and warehouses...</Text>
            </View>
          ) : (
            <>
              {/* Stock Information Card */}
              <View style={FORM_STYLES.card}>
                <View style={FORM_STYLES.cardHeader}>
                  <Icon name="package-variant" size={24} color={FORM_COLORS.primary} />
                  <Text style={FORM_STYLES.cardTitle}>Stock Information</Text>
                </View>
                
                {renderPickerField(
                  'product_id',
                  'Product',
                  'package-variant',
                  products,
                  selectedProduct,
                  (product) => {
                    // Find the full product object from the products array
                    const fullProduct = products.find(p => p.id === product.id);
                    setSelectedProduct(fullProduct || null);
                    updateField('product_id', product.id);
                  },
                  showProductPicker,
                  setShowProductPicker
                )}
                
                {renderPickerField(
                  'warehouse_id',
                  'Warehouse',
                  'warehouse',
                  warehouses,
                  selectedWarehouse,
                  (warehouse) => {
                    // Find the full warehouse object from the warehouses array
                    const fullWarehouse = warehouses.find(w => w.id === warehouse.id);
                    setSelectedWarehouse(fullWarehouse || null);
                    updateField('warehouse_id', warehouse.id);
                  },
                  showWarehousePicker,
                  setShowWarehousePicker
                )}
                
                {renderInputField('bin_location', 'Bin Location', 'Enter bin location (e.g., A1-B2-C3)', 'map-marker')}
              </View>

              {/* Quantity Information Card */}
              <View style={FORM_STYLES.card}>
                <View style={FORM_STYLES.cardHeader}>
                  <Icon name="numeric" size={24} color={FORM_COLORS.primary} />
                  <Text style={FORM_STYLES.cardTitle}>Quantity Information</Text>
                </View>
                
                {renderInputField('quantity', 'Total Quantity', 'Enter total quantity', 'package-variant-closed', 'numeric')}
                {renderInputField('reserved_quantity', 'Reserved Quantity', 'Enter reserved quantity', 'lock', 'numeric')}
                {renderInputField('available_quantity', 'Available Quantity', 'Auto-calculated', 'check-circle', 'numeric')}
              </View>

              {/* Action Buttons */}
              <View style={FORM_STYLES.buttonContainer}>
                <TouchableOpacity
                  style={FORM_STYLES.secondaryButton}
                  onPress={onCancel}
                >
                  <Text style={FORM_STYLES.secondaryButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <LinearGradient
                  colors={FORM_COLORS.primaryGradient}
                  style={[FORM_STYLES.primaryButton, loading && FORM_STYLES.buttonDisabled]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <TouchableOpacity
                    style={FORM_STYLES.primaryButtonContent}
                    onPress={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Icon 
                          name={mode === 'create' ? 'plus' : 'content-save'} 
                          size={20} 
                          color="#fff" 
                          style={FORM_STYLES.primaryButtonIcon}
                        />
                        <Text style={FORM_STYLES.primaryButtonText}>
                          {mode === 'create' ? 'Create Stock' : 'Update Stock'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </>
          )}
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

      {/* Product Picker Modal */}
      <ModalPicker
        visible={showProductPicker}
        title="Select Product"
        items={products}
        selectedItem={selectedProduct}
        onSelect={(product) => {
          // Find the full product object from the products array
          const fullProduct = products.find(p => p.id === product.id);
          setSelectedProduct(fullProduct || null);
          updateField('product_id', product.id);
        }}
        onClose={() => setShowProductPicker(false)}
        searchPlaceholder="Search products..."
      />

      {/* Warehouse Picker Modal */}
      <ModalPicker
        visible={showWarehousePicker}
        title="Select Warehouse"
        items={warehouses}
        selectedItem={selectedWarehouse}
        onSelect={(warehouse) => {
          // Find the full warehouse object from the warehouses array
          const fullWarehouse = warehouses.find(w => w.id === warehouse.id);
          setSelectedWarehouse(fullWarehouse || null);
          updateField('warehouse_id', warehouse.id);
        }}
        onClose={() => setShowWarehousePicker(false)}
        searchPlaceholder="Search warehouses..."
      />
    </View>
  );
};


export default StockForm;
