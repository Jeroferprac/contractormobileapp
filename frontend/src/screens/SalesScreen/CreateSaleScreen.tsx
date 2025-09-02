import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Animated as RNAnimated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { inventoryApiService } from '../../api/inventoryApi';
import { CreateSaleRequest, Product, Customer, Warehouse } from '../../types/inventory';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';
import { COLORS } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import SuccessModal from '../../components/SuccessModal';
import { sendSalesNotification, setupSalesNotificationChannel } from '../../utils/salesNotifications';
import { getFormattedLocation } from '../../utils/locationService';
import FailureModal from '../../components/FailureModal';

interface CreateSaleScreenProps {
  navigation: any;
  route?: any;
}

const CreateSaleScreen: React.FC<CreateSaleScreenProps> = ({ navigation, route }) => {
  const { user } = useAuth();
  const isEditMode = route?.params?.mode === 'edit';
  const saleId = route?.params?.saleId;
  const initialSaleData = route?.params?.saleData;
  
  // Form data
  const [customerId, setCustomerId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState('1');
  
  // Data for dropdowns
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  
  // Selected items
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const spinner = React.useRef(new RNAnimated.Value(0));
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [failureMessage, setFailureMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Load customers and warehouses on component mount
  useEffect(() => {
    loadInitialData();
    if (isEditMode && initialSaleData) {
      loadEditData();
    }
    // Setup push notification channel
    setupSalesNotificationChannel();
  }, []);

  const loadEditData = () => {
    if (initialSaleData) {
      setCustomerId(initialSaleData.customer_id || '');
      setWarehouseId(initialSaleData.warehouse_id || '');
      setSaleDate(initialSaleData.sale_date || new Date().toISOString().split('T')[0]);
      setDueDate(initialSaleData.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setShippingAddress(initialSaleData.shipping_address || '');
      setNotes(initialSaleData.notes || '');
      setQuantity(initialSaleData.items?.[0]?.quantity?.toString() || '1');
      
      // Set selected items based on IDs
      const customer = customers.find(c => c.id === initialSaleData.customer_id);
      const warehouse = warehouses.find(w => w.id === initialSaleData.warehouse_id);
      const product = products.find(p => p.id === initialSaleData.items?.[0]?.product_id);
      if (customer) setSelectedCustomer(customer);
      if (warehouse) setSelectedWarehouse(warehouse);
      if (product) setSelectedProduct(product);
    }
  };

  const loadInitialData = async () => {
    try {
      setDataLoading(true);
      const [customersRes, warehousesRes, productsRes] = await Promise.allSettled([
        inventoryApiService.getCustomers(),
        inventoryApiService.getWarehouses(),
        inventoryApiService.getProducts(),
      ]);

      if (customersRes.status === 'fulfilled') {
        setCustomers(customersRes.value.data || []);
      }

      if (warehousesRes.status === 'fulfilled') {
        setWarehouses(warehousesRes.value.data || []);
      }

      if (productsRes.status === 'fulfilled') {
        setProducts(productsRes.value.data || []);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      setFailureMessage('Failed to load data. Please try again.');
      setShowFailureModal(true);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    const animation = RNAnimated.loop(
      RNAnimated.timing(spinner.current, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => {
      spinner.current.setValue(0);
    };
  }, []);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!selectedCustomer) {
      errors.customer = 'Please select a customer';
    }

    if (!selectedWarehouse) {
      errors.warehouse = 'Please select a warehouse';
    }

    if (!selectedProduct) {
      errors.product = 'Please select a product';
    }

    if (!saleDate) {
      errors.saleDate = 'Sale date is required';
    }

    if (!dueDate) {
      errors.dueDate = 'Due date is required';
    }

    if (!shippingAddress.trim()) {
      errors.shippingAddress = 'Shipping address is required';
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      errors.quantity = 'Quantity must be greater than 0';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateSale = async () => {
    if (!validateForm()) {
      setFailureMessage('Please fix the validation errors before submitting.');
      setShowFailureModal(true);
      return;
    }

    if (!selectedCustomer || !selectedWarehouse || !selectedProduct) {
      setFailureMessage('Please select customer, warehouse, and product.');
      setShowFailureModal(true);
      return;
    }

    try {
      setLoading(true);
      
      const qty = parseFloat(quantity);
      const unitPrice = Number(selectedProduct.selling_price) || 0;
      const totalPrice = qty * unitPrice;
      
      // Generate sale number
      const saleNumber = `SALE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Create sale data that matches the backend schema requirements
      const saleData: CreateSaleRequest = {
        sale_number: saleNumber,
        customer_id: selectedCustomer.id,
        warehouse_id: selectedWarehouse.id,
        price_list_id: selectedCustomer.price_list_id || selectedWarehouse.id, // Use customer's price list or warehouse as fallback
        sale_date: saleDate,
        due_date: dueDate,
        subtotal: totalPrice,
        tax_amount: 0,
        discount_amount: 0,
        total_amount: totalPrice,
        paid_amount: 0,
        status: 'pending',
        payment_status: 'unpaid',
        shipping_address: shippingAddress.trim(),
        notes: notes.trim(),
        created_by: user?.id || '',
        items: [
          {
            product_id: selectedProduct.id,
            quantity: qty,
            unit_price: Number(unitPrice),
            discount: 0,
            tax: 0,
            total_price: totalPrice,
          }
        ],
      };

      console.log('📤 Sending sale data:', JSON.stringify(saleData, null, 2));

      if (isEditMode && saleId) {
        await inventoryApiService.updateSale(saleId, saleData);
        setSuccessMessage('Sale updated successfully!');
      } else {
      await inventoryApiService.createSale(saleData);
      setSuccessMessage('Sale created successfully!');
        
        // Send push notification
        await sendSalesNotification(saleData);
      }
      
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Error creating/updating sale:', error);
      
      let errorMessage = 'Failed to save sale. Please try again.';
      
      if (error.response) {
        const errorData = error.response.data;
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map((d: any) => d.msg || JSON.stringify(d)).join('\n');
          } else {
            errorMessage = errorData.detail;
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setFailureMessage(errorMessage);
      setShowFailureModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigation.goBack();
  };

  const handleFailureModalClose = () => {
    setShowFailureModal(false);
  };

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerId(customer.id);
    setShowCustomerModal(false);
    setValidationErrors(prev => ({ ...prev, customer: '' }));
  };

  const selectWarehouse = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setWarehouseId(warehouse.id);
    setShowWarehouseModal(false);
    setValidationErrors(prev => ({ ...prev, warehouse: '' }));
  };

  const selectProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(false);
    setValidationErrors(prev => ({ ...prev, product: '' }));
  };

  const updateField = (field: string, value: string) => {
    switch (field) {
      case 'saleDate':
        setSaleDate(value);
        break;
      case 'dueDate':
        setDueDate(value);
        break;
      case 'shippingAddress':
        setShippingAddress(value);
        break;
      case 'notes':
        setNotes(value);
        break;
      case 'quantity':
        setQuantity(value);
        break;
    }
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const renderInputField = (
    label: string,
    value: string,
    placeholder: string,
    field: string,
    multiline: boolean = false,
    keyboardType: 'default' | 'numeric' = 'default'
  ) => (
            <View style={styles.inputContainer}>
      <View style={styles.labelRow}>
        {field !== 'shippingAddress' && (
          <Icon name={
            field === 'customer' ? 'person' :
            field === 'warehouse' ? 'store' :
            field === 'product' ? 'inventory' :
            field === 'quantity' ? 'format-list-numbered' :
            field === 'saleDate' ? 'event' :
            field === 'dueDate' ? 'event-available' :
            field === 'notes' ? 'notes' : 'label'
          } size={18} color={COLORS.primary} />
        )}
        <Text style={[styles.inputLabel, styles.labelText]}>{label.replace(' *','')}</Text>
      </View>
      <View style={styles.inputRow}>
        {field === 'shippingAddress' ? (
          <View
            style={[
              styles.textInput,
              styles.inputWithIcon,
              styles.shippingInput,
              multiline && styles.multilineInput,
              validationErrors[field] && styles.errorInput,
            ]}
          >
            <Icon name="location-on" size={20} color={COLORS.primary} style={styles.leftIcon} />
            <TextInput
              style={styles.innerTextInput}
              value={value}
              onChangeText={(text) => updateField(field, text)}
              placeholder={placeholder}
              placeholderTextColor="#999"
            />
          </View>
        ) : (
          <TextInput
            style={[
              styles.textInput,
              multiline && styles.multilineInput,
              validationErrors[field] && styles.errorInput,
              field === 'shippingAddress' && styles.shippingInput
            ]}
            value={value}
            onChangeText={(text) => updateField(field, text)}
            placeholder={placeholder}
            keyboardType={keyboardType}
            placeholderTextColor="#999"
          />
        )}
        {field === 'shippingAddress' && (
          <View style={styles.locationButtons}>
            {selectedCustomer && (
              <TouchableOpacity 
                style={styles.autoFillButton}
                onPress={() => {
                  const customerAddress = `${selectedCustomer.address}, ${selectedCustomer.city}, ${selectedCustomer.state} ${selectedCustomer.zip_code}`;
                  setShippingAddress(customerAddress);
                }}
              >
                <Icon name="person" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            )}
              <TouchableOpacity 
              style={styles.autoFillButton}
              onPress={async () => {
                try {
                  const location = await getFormattedLocation();
                  if (location) {
                    setShippingAddress(location);
                  }
                } catch (error) {
                  console.error('Location error:', error);
                }
              }}
            >
              <Icon name="my-location" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
        )}
      </View>
      {validationErrors[field] && (
        <Text style={styles.errorText}>{validationErrors[field]}</Text>
      )}
    </View>
  );

  const renderSelectionField = (
    label: string,
    selectedItem: any,
    placeholder: string,
    onPress: () => void,
    field: string
  ) => (
            <View style={styles.inputContainer}>
      <View style={styles.labelRow}>
        <Icon name={
          field === 'customer' ? 'person' :
          field === 'warehouse' ? 'store' :
          field === 'product' ? 'inventory' : 'label'
        } size={18} color={COLORS.primary} />
        <Text style={[styles.inputLabel, styles.labelText]}>{label.replace(' *','')}</Text>
      </View>
              <TouchableOpacity 
        style={[
          styles.selectionButton,
          validationErrors[field] && styles.errorInput
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.selectionText,
          !selectedItem && styles.placeholderText
        ]}>
          {selectedItem ? selectedItem.name || selectedItem.customer_name : placeholder}
                </Text>
        <Icon name="arrow-drop-down" size={24} color="#666" />
              </TouchableOpacity>
      
      {/* Show customer details if customer is selected */}
      {field === 'customer' && selectedItem && (
        <View style={styles.customerDetails}>
          <View style={styles.customerDetailRow}>
            <Icon name="phone" size={16} color="#666" />
            <Text style={styles.customerDetailText}>{selectedItem.phone}</Text>
          </View>
          <View style={styles.customerDetailRow}>
            <Icon name="email" size={16} color="#666" />
            <Text style={styles.customerDetailText}>{selectedItem.email}</Text>
            </View>
          <View style={styles.customerDetailRow}>
            <Icon name="location-on" size={16} color="#666" />
            <Text style={styles.customerDetailText}>
              {selectedItem.address}, {selectedItem.city}, {selectedItem.state} {selectedItem.zip_code}
            </Text>
          </View>
            </View>
      )}
      
      {validationErrors[field] && (
        <Text style={styles.errorText}>{validationErrors[field]}</Text>
      )}
                </View>
  );

  if (dataLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.accent]}
          style={styles.header}
        >
          <SafeAreaView style={styles.safeArea}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Icon name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {isEditMode ? 'Edit Sale' : 'Create Sale'}
            </Text>
            <View style={styles.headerSpacer} />
          </SafeAreaView>
        </LinearGradient>
        <View style={styles.loadingContainerPremium}>
          <RNAnimated.View
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              borderWidth: 3,
              borderColor: COLORS.primary,
              borderTopColor: 'transparent',
              transform: [{ rotate: spinner.current.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }],
            }}
          />
          <Text style={styles.loadingText}>Loading data, please wait…</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.accent]}
        style={styles.header}
      >
        <SafeAreaView style={styles.safeArea}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditMode ? 'Edit Sale' : 'Create Sale'}
          </Text>
          <View style={styles.headerSpacer} />
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* Customer Selection */}
          {renderSelectionField(
            'Customer *',
            selectedCustomer,
            'Select Customer',
            () => setShowCustomerModal(true),
            'customer'
          )}

          {/* Warehouse Selection */}
          {renderSelectionField(
            'Warehouse *',
            selectedWarehouse,
            'Select Warehouse',
            () => setShowWarehouseModal(true),
            'warehouse'
          )}

          {/* Product Selection */}
          {renderSelectionField(
            'Product *',
            selectedProduct,
            'Select Product',
            () => setShowProductModal(true),
            'product'
          )}

          {/* Quantity + Date Row */}
          <View style={styles.dateRow}>
            <View style={styles.dateInputContainer}>
              {renderInputField(
                'Quantity',
                quantity,
                'Enter quantity',
                'quantity',
                false,
                'numeric'
              )}
            </View>
            <View style={styles.dateInputContainer}>
              {renderInputField(
                'Sale Date',
                saleDate,
                'YYYY-MM-DD',
                'saleDate'
              )}
            </View>
            <View style={styles.dateInputContainer}>
              {renderInputField(
                'Due Date',
                dueDate,
                'YYYY-MM-DD',
                'dueDate'
              )}
            </View>
          </View>

          {/* Shipping Address */}
          {renderInputField(
            'Shipping Address',
            shippingAddress,
            'Enter shipping address',
            'shippingAddress',
            true
          )}

          {/* Notes */}
          {renderInputField(
            'Notes',
            notes,
            'Enter additional notes',
            'notes',
            true
          )}

          {/* Submit Button */}
        <TouchableOpacity 
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleCreateSale}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Processing...' : (isEditMode ? 'Update Sale' : 'Create Sale')}
            </Text>
        </TouchableOpacity>
      </View>
      </ScrollView>

      {/* Customer Selection Modal */}
      <Modal
        visible={showCustomerModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCustomerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Customer</Text>
              <TouchableOpacity onPress={() => setShowCustomerModal(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {customers.map((customer) => (
                <TouchableOpacity
                  key={customer.id}
                  style={styles.modalItem}
                  onPress={() => selectCustomer(customer)}
                >
                  <Text style={styles.modalItemText}>{customer.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Warehouse Selection Modal */}
      <Modal
        visible={showWarehouseModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowWarehouseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Warehouse</Text>
              <TouchableOpacity onPress={() => setShowWarehouseModal(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {warehouses.map((warehouse) => (
                <TouchableOpacity
                  key={warehouse.id}
                  style={styles.modalItem}
                  onPress={() => selectWarehouse(warehouse)}
                >
                  <Text style={styles.modalItemText}>{warehouse.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Product Selection Modal */}
      <Modal
        visible={showProductModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowProductModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Product</Text>
              <TouchableOpacity onPress={() => setShowProductModal(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {products.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.modalItem}
                  onPress={() => selectProduct(product)}
                >
                  <Text style={styles.modalItemText}>{product.name}</Text>
                  <Text style={styles.modalItemSubtext}>
                    Price: ${product.selling_price}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        title="Success!"
        message={successMessage}
        onClose={handleSuccessModalClose}
        onAction={handleSuccessModalClose}
      />

      {/* Failure Modal */}
      <FailureModal
        visible={showFailureModal}
        title="Error!"
        message={failureMessage}
        onClose={handleFailureModalClose}
        onAction={handleFailureModalClose}
        actionText="OK"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomLeftRadius: BORDER_RADIUS.lg,
    borderBottomRightRadius: BORDER_RADIUS.lg,
  },
  safeArea: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 48,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainerPremium: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: '#666',
  },
  scrollContainer: {
    flex: 1,
  },
  formContainer: {
    padding: SPACING.lg,
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 0,
    lineHeight: 18,
  },
  labelText: {
    marginLeft: SPACING.xs,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 16,
    color: '#212529',
    width: '100%',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorInput: {
    borderColor: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: SPACING.xs,
  },
  selectionButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectionText: {
    fontSize: 16,
    color: '#212529',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    width: '90%',
    maxHeight: '80%',
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  modalList: {
    maxHeight: 400,
  },
  modalItem: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  modalItemText: {
    fontSize: 16,
    color: '#212529',
    fontWeight: '500',
  },
  modalItemSubtext: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: SPACING.xs,
  },
  modalMessage: {
    fontSize: 16,
    color: '#212529',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  customerDetails: {
    backgroundColor: '#F8F9FA',
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    marginTop: SPACING.xs,
  },
  customerDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  customerDetailText: {
    fontSize: 12,
    color: '#6C757D',
    marginLeft: SPACING.xs,
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shippingInput: {
    flex: 1,
    marginRight: SPACING.xs,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
  },
  leftIcon: {
    marginRight: SPACING.xs,
  },
  innerTextInput: {
    flex: 1,
    paddingVertical: SPACING.sm,
    fontSize: 16,
    color: '#212529',
  },
  autoFillButton: {
    padding: SPACING.sm,
    backgroundColor: '#F8F9FA',
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    marginLeft: SPACING.xs,
  },
  locationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  dateInputContainer: {
    flex: 1,
  },
});

export default CreateSaleScreen;
