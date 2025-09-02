import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  TextInput,
  ActivityIndicator,
  Platform,
  Dimensions,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';

const { width, height } = Dimensions.get('window');

// Responsive font sizes
const FONTS = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  title: 28,
  large: 32,
};

import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

import { PurchaseOrder, Supplier, Product } from '../../types/inventory';
import { SuppliersScreenNavigationProp } from '../../types/navigation';
import { inventoryApiService } from '../../api/inventoryApi';
import { extractApiErrorMessage } from '../../utils/errorHandler';

interface PurchaseOrderFormProps {
  navigation: SuppliersScreenNavigationProp;
  route: {
    params: {
      order?: PurchaseOrder;
      isEditing: boolean;
    };
  };
}

interface PurchaseOrderItem {
  product_id: string;
  product_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({ navigation, route }) => {
  const { order, isEditing } = route.params;
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showSupplierPicker, setShowSupplierPicker] = useState(false);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState<number>(-1);
  const [searchText, setSearchText] = useState('');
  const [showOrderDatePicker, setShowOrderDatePicker] = useState(false);
  const [showDeliveryDatePicker, setShowDeliveryDatePicker] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    po_number: order?.po_number || `PO-${Date.now().toString().slice(-6)}`,
    supplier_id: order?.supplier_id || '',
    order_date: order?.order_date || new Date().toISOString().split('T')[0],
    expected_delivery_date: order?.expected_delivery_date || '',
    status: order?.status || 'draft',
    notes: order?.notes || '',
    items: order?.items || [] as PurchaseOrderItem[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    console.log('PurchaseOrderForm loaded with order:', order);
    console.log('Is editing:', isEditing);
    console.log('Form data initialized:', formData);
    loadSuppliers();
    loadProducts();
  }, []);

  // Set selected supplier when suppliers are loaded and we have an order to edit
  useEffect(() => {
    console.log('Supplier selection effect:', {
      orderSupplierId: order?.supplier_id,
      suppliersCount: suppliers.length,
      isEditing: isEditing
    });
    
    if (order?.supplier_id && suppliers.length > 0) {
      const supplier = suppliers.find(s => s.id === order.supplier_id);
      setSelectedSupplier(supplier || null);
      console.log('Setting selected supplier for edit:', supplier?.name || 'Not found', supplier);
      console.log('Available suppliers:', suppliers.map(s => ({ id: s.id, name: s.name })));
    }
  }, [suppliers, order?.supplier_id, isEditing]);

  // Populate product names when products are loaded and we have an order to edit
  useEffect(() => {
    console.log('Product population effect:', {
      orderItemsCount: order?.items?.length || 0,
      productsCount: products.length,
      isEditing: isEditing
    });
    
    if (isEditing && order?.items && products.length > 0) {
      const updatedItems = order.items.map(item => {
        const product = products.find(p => p.id === item.product_id);
        return {
          ...item,
          product_name: product?.name || item.product_name || 'Unknown Product'
        };
      });
      
      setFormData(prev => ({
        ...prev,
        items: updatedItems
      }));
      
      console.log('Updated items with product names:', updatedItems);
    }
  }, [products, order?.items, isEditing]);

  const loadSuppliers = async () => {
    try {
      const response = await inventoryApiService.getSuppliers();
      setSuppliers(response.data || []);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await inventoryApiService.getProducts();
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.po_number.trim()) {
      newErrors.po_number = 'PO Number is required';
    }

    if (!formData.supplier_id || formData.supplier_id.trim() === '') {
      newErrors.supplier_id = 'Supplier is required';
    }

    if (!formData.order_date) {
      newErrors.order_date = 'Order date is required';
    } else {
      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.order_date)) {
        newErrors.order_date = 'Order date must be in YYYY-MM-DD format';
      }
    }

    // Validate expected_delivery_date if provided
    if (formData.expected_delivery_date && formData.expected_delivery_date.trim() !== '') {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.expected_delivery_date)) {
        newErrors.expected_delivery_date = 'Expected delivery date must be in YYYY-MM-DD format';
      }
    }

    // Validate status
    if (!formData.status || formData.status.trim() === '') {
      newErrors.status = 'Status is required';
    }

    if (formData.items.length === 0) {
      newErrors.items = 'At least one item is required';
    } else {
      // Validate each item
      formData.items.forEach((item, index) => {
        if (!item.product_id) {
          newErrors[`item_${index}_product`] = `Item ${index + 1}: Product is required`;
        }
        if (!item.quantity || item.quantity <= 0) {
          newErrors[`item_${index}_quantity`] = `Item ${index + 1}: Quantity must be greater than 0`;
        }
        if (!item.unit_price || item.unit_price <= 0) {
          newErrors[`item_${index}_price`] = `Item ${index + 1}: Unit price must be greater than 0`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    let orderData: any; // Declare orderData outside try block

    try {
      setSaving(true);
      console.log('🔄 [PurchaseOrderForm] Saving purchase order...');

      // Calculate total amount
      const totalAmount = formData.items.reduce((sum, item) => sum + (item.total_price || 0), 0);

      // Filter out any items with empty product_id
      const validItems = formData.items.filter(item => item.product_id && item.product_id.trim() !== '');

      // Prepare order data with all required fields according to backend API specification
      orderData = {
        po_number: formData.po_number.trim(),
        supplier_id: formData.supplier_id,
        order_date: formData.order_date,
        status: formData.status,
        total_amount: parseFloat(totalAmount.toFixed(2)),
        items: validItems.map(item => ({
          product_id: item.product_id,
          quantity: parseInt(item.quantity.toString()),
          unit_price: parseFloat(parseFloat(item.unit_price.toString()).toFixed(2)),
          line_total: parseFloat(parseFloat(item.total_price.toString()).toFixed(2)),
          total_price: parseFloat(parseFloat(item.total_price.toString()).toFixed(2)),
          received_qty: 0
        }))
      };

      console.log('📤 [PurchaseOrderForm] Sending order data:', JSON.stringify(orderData, null, 2));
      console.log('📤 [PurchaseOrderForm] Valid items count:', validItems.length);
      console.log('📤 [PurchaseOrderForm] Total amount:', totalAmount);

      let response;
      if (isEditing && order) {
        response = await inventoryApiService.updatePurchaseOrder(order.id, orderData);
        console.log('✅ [PurchaseOrderForm] Purchase order updated successfully');
      } else {
        response = await inventoryApiService.createPurchaseOrder(orderData);
        console.log('✅ [PurchaseOrderForm] Purchase order created successfully');
      }

      Alert.alert(
        'Success',
        `Purchase order ${isEditing ? 'updated' : 'created'} successfully`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('❌ [PurchaseOrderForm] Error saving purchase order:', error);
      
      // Log more details about the error
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        if (orderData) {
        console.error('Request data sent:', JSON.stringify(orderData, null, 2));
        }
      }
      
      let errorMessage = `Failed to ${isEditing ? 'update' : 'create'} purchase order. Please try again.`;
      
      // Try to extract specific validation errors
      if (error.response?.status === 422 && error.response?.data) {
        const validationErrors = error.response.data;
        console.log('🔍 [PurchaseOrderForm] Validation errors:', JSON.stringify(validationErrors, null, 2));
        if (typeof validationErrors === 'object') {
          const errorDetails = Object.entries(validationErrors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          errorMessage = `Validation errors:\n${errorDetails}`;
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const addItem = () => {
    const newItem: PurchaseOrderItem = {
      product_id: '',
      product_name: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItem = (index: number, field: keyof PurchaseOrderItem, value: any) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      
      // Calculate total price
      if (field === 'quantity' || field === 'unit_price') {
        newItems[index].total_price = newItems[index].quantity * newItems[index].unit_price;
      }
      
      return { ...prev, items: newItems };
    });
  };

  const selectProduct = (product: Product, itemIndex: number) => {
    updateItem(itemIndex, 'product_id', product.id);
    updateItem(itemIndex, 'product_name', product.name);
    updateItem(itemIndex, 'unit_price', parseFloat(product.cost_price?.toString() || '0'));
    setShowProductPicker(false);
    setCurrentItemIndex(-1);
  };

  const selectSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setFormData(prev => ({ ...prev, supplier_id: supplier.id }));
    setShowSupplierPicker(false);
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString; // fallback to original string if parsing fails
    }
  };

  const handleOrderDateChange = (event: any, selectedDate?: Date) => {
    setShowOrderDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData(prev => ({ ...prev, order_date: formatDate(selectedDate) }));
    }
  };

  const handleDeliveryDateChange = (event: any, selectedDate?: Date) => {
    setShowDeliveryDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData(prev => ({ ...prev, expected_delivery_date: formatDate(selectedDate) }));
    }
  };

  const renderSupplierPicker = () => (
    <Modal
      visible={showSupplierPicker}
      transparent
      animationType="slide"
      onRequestClose={() => setShowSupplierPicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Supplier</Text>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowSupplierPicker(false)}
            >
              <Icon name="close" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.searchInput}
            placeholder="Search suppliers..."
            value={searchText}
            onChangeText={setSearchText}
          />
          
          <FlatList
            data={suppliers.filter(supplier => 
              supplier.name.toLowerCase().includes(searchText.toLowerCase()) ||
              supplier.contact_person?.toLowerCase().includes(searchText.toLowerCase())
            )}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => selectSupplier(item)}
              >
                <View style={styles.modalItemContent}>
                  <Text style={styles.modalItemTitle}>{item.name}</Text>
                  <Text style={styles.modalItemSubtitle}>{item.contact_person}</Text>
                  <Text style={styles.modalItemDetail}>{item.email}</Text>
                </View>
                <Icon name="chevron-right" size={20} color={COLORS.text.secondary} />
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </Modal>
  );

  const renderProductPicker = () => (
    <Modal
      visible={showProductPicker}
      transparent
      animationType="slide"
      onRequestClose={() => setShowProductPicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Product</Text>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowProductPicker(false)}
            >
              <Icon name="close" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchText}
            onChangeText={setSearchText}
          />
          
          <FlatList
            data={products.filter(product => 
              product.name.toLowerCase().includes(searchText.toLowerCase()) ||
              product.sku?.toLowerCase().includes(searchText.toLowerCase())
            )}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => selectProduct(item, currentItemIndex)}
              >
                <View style={styles.modalItemContent}>
                  <Text style={styles.modalItemTitle}>{item.name}</Text>
                  <Text style={styles.modalItemSubtitle}>SKU: {item.sku}</Text>
                  <Text style={styles.modalItemDetail}>
                    Cost: ${(() => {
                      try {
                        const cost = parseFloat(item.cost_price?.toString() || '0');
                        return isNaN(cost) ? '0.00' : cost.toFixed(2);
                      } catch (error) {
                        return '0.00';
                      }
                    })()}
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} color={COLORS.text.secondary} />
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </Modal>
  );

  const renderItem = (item: PurchaseOrderItem, index: number) => (
    <View key={index} style={styles.itemContainer}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>Item {index + 1}</Text>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeItem(index)}
        >
          <Icon name="delete" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

             <TouchableOpacity
         style={styles.productSelector}
         onPress={() => {
           setCurrentItemIndex(index);
           setShowProductPicker(true);
         }}
       >
         <View style={styles.productSelectorContent}>
           <View style={styles.productSelectorInfo}>
             <Text style={styles.productSelectorText}>
               {item.product_name || 'Select Product'}
             </Text>
             {item.product_name && (
               <Text style={styles.productSelectorSubtext}>
                 SKU: {products.find(p => p.id === item.product_id)?.sku || 'N/A'}
               </Text>
             )}
           </View>
           <Icon name="arrow-drop-down" size={24} color="#6B7280" />
         </View>
       </TouchableOpacity>
       {errors[`item_${index}_product`] && (
         <Text style={styles.errorText}>{errors[`item_${index}_product`]}</Text>
       )}

      <View style={styles.itemRow}>
                 <View style={styles.itemField}>
           <Text style={styles.fieldLabel}>Quantity</Text>
           <TextInput
             style={[styles.input, errors[`item_${index}_quantity`] && styles.inputError]}
             value={item.quantity.toString()}
             onChangeText={(value) => updateItem(index, 'quantity', parseInt(value) || 0)}
             keyboardType="numeric"
             placeholder="0"
           />
           {errors[`item_${index}_quantity`] && (
             <Text style={styles.fieldErrorText}>{errors[`item_${index}_quantity`]}</Text>
           )}
         </View>

         <View style={styles.itemField}>
           <Text style={styles.fieldLabel}>Unit Price</Text>
           <TextInput
             style={[styles.input, errors[`item_${index}_price`] && styles.inputError]}
             value={item.unit_price.toString()}
             onChangeText={(value) => updateItem(index, 'unit_price', parseFloat(value) || 0)}
             keyboardType="numeric"
             placeholder="0.00"
           />
           {errors[`item_${index}_price`] && (
             <Text style={styles.fieldErrorText}>{errors[`item_${index}_price`]}</Text>
           )}
         </View>

        <View style={styles.itemField}>
          <Text style={styles.fieldLabel}>Total</Text>
          <Text style={styles.totalText}>${(() => {
            try {
              const total = item.total_price;
              return typeof total === 'number' ? total.toFixed(2) : '0.00';
            } catch (error) {
              return '0.00';
            }
          })()}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <LinearGradient 
        colors={COLORS.gradient.primary || ['#FF6B35', '#FF8C42']} 
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>
              {isEditing ? 'Edit Purchase Order' : 'Create Purchase Order'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {isEditing ? 'Update order details' : 'Create a new purchase order'}
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <Input
              label="PO Number"
              value={formData.po_number}
              onChangeText={(value) => setFormData(prev => ({ ...prev, po_number: value }))}
              placeholder="Enter PO number"
              error={errors.po_number}
            />

            <TouchableOpacity
              style={styles.supplierSelector}
              onPress={() => setShowSupplierPicker(true)}
            >
              <Text style={styles.selectorLabel}>Supplier</Text>
              <View style={styles.selectorContent}>
                <Text style={styles.selectorText}>
                  {selectedSupplier?.name || (formData.supplier_id ? `Supplier ID: ${formData.supplier_id}` : 'Select Supplier')}
                </Text>
                <Icon name="arrow-drop-down" size={24} color="#6B7280" />
              </View>
              {errors.supplier_id && (
                <Text style={styles.errorText}>{errors.supplier_id}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateSelector}
              onPress={() => setShowOrderDatePicker(true)}
            >
              <Text style={styles.selectorLabel}>Order Date</Text>
              <View style={styles.selectorContent}>
                <Text style={styles.selectorText}>
                  {formData.order_date ? formatDateForDisplay(formData.order_date) : 'Select Order Date'}
                </Text>
                <Icon name="calendar-today" size={20} color="#6B7280" />
              </View>
              {errors.order_date && (
                <Text style={styles.errorText}>{errors.order_date}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateSelector}
              onPress={() => setShowDeliveryDatePicker(true)}
            >
              <Text style={styles.selectorLabel}>Expected Delivery Date</Text>
              <View style={styles.selectorContent}>
                <Text style={styles.selectorText}>
                  {formData.expected_delivery_date ? formatDateForDisplay(formData.expected_delivery_date) : 'Select Delivery Date'}
                </Text>
                <Icon name="calendar-today" size={20} color="#6B7280" />
              </View>
            </TouchableOpacity>

            <Input
              label="Notes"
              value={formData.notes}
              onChangeText={(value) => setFormData(prev => ({ ...prev, notes: value }))}
              placeholder="Enter notes"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Items */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Items</Text>
              <TouchableOpacity
                style={styles.addItemButton}
                onPress={addItem}
              >
                <Icon name="add" size={20} color="#FFFFFF" />
                <Text style={styles.addItemText}>Add Item</Text>
              </TouchableOpacity>
            </View>

            {formData.items.length === 0 && (
              <View style={styles.emptyState}>
                <Icon name="shopping-cart" size={48} color={COLORS.text.secondary} />
                <Text style={styles.emptyStateTitle}>No Items Added</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Tap "Add Item" to start adding products to your purchase order
                </Text>
              </View>
            )}

            {formData.items.map((item, index) => renderItem(item, index))}

            {errors.items && (
              <Text style={styles.errorText}>{errors.items}</Text>
            )}

            {formData.items.length > 0 && (
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total Amount:</Text>
                <Text style={styles.totalAmount}>
                  ${(() => {
                    try {
                      const total = formData.items.reduce((sum, item) => sum + (item.total_price || 0), 0);
                      return typeof total === 'number' ? total.toFixed(2) : '0.00';
                    } catch (error) {
                      return '0.00';
                    }
                  })()}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <Button
          title={saving ? 'Saving...' : (isEditing ? 'Update Purchase Order' : 'Create Purchase Order')}
          onPress={handleSave}
          disabled={saving}
          style={styles.saveButton}
        />
      </View>

      {/* Pickers */}
      {showSupplierPicker && renderSupplierPicker()}
      {showProductPicker && renderProductPicker()}

      {/* Date Pickers */}
      {showOrderDatePicker && (
        <DateTimePicker
          value={formData.order_date ? new Date(formData.order_date) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleOrderDateChange}
          maximumDate={new Date()}
        />
      )}

      {showDeliveryDatePicker && (
        <DateTimePicker
          value={formData.expected_delivery_date ? new Date(formData.expected_delivery_date) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDeliveryDateChange}
          minimumDate={new Date()}
        />
      )}
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
    marginBottom: SPACING.md,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONTS.title,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: FONTS.md,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  backButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  supplierSelector: {
    marginBottom: SPACING.md,
  },
  dateSelector: {
    marginBottom: SPACING.md,
  },
  selectorLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  selectorContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  selectorText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.primary,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
  },
  addItemText: {
    fontSize: FONTS.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#FFFFFF',
    marginLeft: SPACING.xs,
  },
  itemContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  itemTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#F9FAFB',
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  productSelectorText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.primary,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  itemField: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  fieldLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  input: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    fontSize: TYPOGRAPHY.sizes.md,
  },
  totalText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    textAlign: 'center',
    paddingVertical: SPACING.xs,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: SPACING.md,
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  totalAmount: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  footer: {
    padding: SPACING.lg,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  saveButton: {
    width: '100%',
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#EF4444',
    marginTop: SPACING.xs,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  fieldErrorText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#EF4444',
    marginTop: 2,
  },
  // Enhanced Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: FONTS.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  closeModalButton: {
    padding: SPACING.xs,
  },
  searchInput: {
    margin: SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#F9FAFB',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: TYPOGRAPHY.sizes.md,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalItemContent: {
    flex: 1,
  },
  modalItemTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary,
  },
  modalItemSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  modalItemDetail: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary,
    marginTop: 2,
  },
  // Enhanced Product Selector
  productSelectorContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  productSelectorInfo: {
    flex: 1,
  },
  productSelectorSubtext: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.lg,
  },
  emptyStateTitle: {
    fontSize: FONTS.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginTop: SPACING.md,
  },
  emptyStateSubtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 20,
  },
});

export default PurchaseOrderForm;
