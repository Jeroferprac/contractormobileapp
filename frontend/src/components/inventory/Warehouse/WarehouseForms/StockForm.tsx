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
import SuccessModal from '../../../SuccessModal';
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
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Failed to save stock. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    onSuccess();
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
    <View style={styles.inputContainer}>
      <View style={styles.inputHeader}>
        <Icon name={icon} size={20} color={COLORS.primary} style={styles.inputIcon} />
        <Text style={styles.inputLabel}>{label}</Text>
      </View>
      <TextInput
        style={[
          styles.textInput,
          multiline && styles.multilineInput,
          errors[field] && styles.inputError,
        ]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.text.tertiary}
        value={formData[field as keyof typeof formData]}
        onChangeText={(value) => updateField(field, value)}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 2 : 1}
      />
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
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
    <View style={styles.inputContainer}>
      <View style={styles.inputHeader}>
        <Icon name={icon} size={20} color={COLORS.primary} style={styles.inputIcon} />
        <Text style={styles.inputLabel}>{label}</Text>
      </View>
      <TouchableOpacity
        style={[styles.pickerButton, errors[field] && styles.inputError]}
        onPress={() => setShowPicker(true)}
      >
        <Text style={[styles.pickerText, !selectedItem && styles.placeholderText]}>
          {selectedItem ? selectedItem.name : `Select ${label.toLowerCase()}`}
        </Text>
        <Icon name="chevron-down" size={20} color={COLORS.text.tertiary} />
      </TouchableOpacity>
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.gradient.primary[0], COLORS.gradient.primary[1]]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {mode === 'create' ? 'Create Stock' : 'Update Stock'}
          </Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {loadingData ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading products and warehouses...</Text>
            </View>
          ) : (
            <>
              {/* Stock Information Card */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Icon name="package-variant" size={24} color={COLORS.primary} />
                  <Text style={styles.cardTitle}>Stock Information</Text>
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
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Icon name="numeric" size={24} color={COLORS.primary} />
                  <Text style={styles.cardTitle}>Quantity Information</Text>
                </View>
                
                {renderInputField('quantity', 'Total Quantity', 'Enter total quantity', 'package-variant-closed', 'numeric')}
                {renderInputField('reserved_quantity', 'Reserved Quantity', 'Enter reserved quantity', 'lock', 'numeric')}
                {renderInputField('available_quantity', 'Available Quantity', 'Auto-calculated', 'check-circle', 'numeric')}
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onCancel}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Icon 
                        name={mode === 'create' ? 'plus' : 'content-save'} 
                        size={20} 
                        color="#fff" 
                        style={styles.buttonIcon}
                      />
                      <Text style={styles.submitButtonText}>
                        {mode === 'create' ? 'Create Stock' : 'Update Stock'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.light,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginLeft: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border.medium,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: COLORS.surface,
    color: COLORS.text.primary,
  },
  multilineInput: {
    height: 60,
    textAlignVertical: 'top',
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: COLORS.border.medium,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerText: {
    fontSize: 16,
    color: COLORS.text.primary,
    flex: 1,
  },
  placeholderText: {
    color: COLORS.text.tertiary,
  },
  inputError: {
    borderColor: COLORS.status.error,
  },
  errorText: {
    color: COLORS.status.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.medium,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  submitButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.text.tertiary,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.light,
  },
  buttonIcon: {
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginTop: 16,
    textAlign: 'center',
  },
});

export default StockForm;
