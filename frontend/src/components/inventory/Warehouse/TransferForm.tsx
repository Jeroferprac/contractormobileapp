import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../../constants/spacing';
import { TYPOGRAPHY, TEXT_STYLES } from '../../../constants/typography';
import { Transfer, Warehouse, Product, CreateTransferRequest, TransferStatus } from '../../../types/inventory';
import inventoryApiService from '../../../api/inventoryApi';
import apiService from '../../../api/api';
import DateTimePicker from '@react-native-community/datetimepicker';
import storageService from '../../../utils/storage';
import { useAuth } from '../../../context/AuthContext';

const AnyTextInput: any = TextInput;

interface TransferFormProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingTransfer?: Transfer | null;
  warehouses: Warehouse[];
  products: Product[];
}

interface TransferItemForm {
  product_id: string;
  quantity: string;
  product?: Product;
}

const TransferForm: React.FC<TransferFormProps> = ({
  visible,
  onClose,
  onSuccess,
  editingTransfer,
  warehouses,
  products,
}) => {
  const { user: authUser } = useAuth();
  console.log('TransferForm rendered with products:', products?.length || 0);
  console.log('Products:', products);
  const isEditing = !!editingTransfer;
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [showFromWarehousePicker, setShowFromWarehousePicker] = useState(false);
  const [showToWarehousePicker, setShowToWarehousePicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(-1);
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [form, setForm] = useState({
    transfer_number: '',
    from_warehouse_id: '',
    to_warehouse_id: '',
    transfer_date: new Date().toISOString().split('T')[0],
    status: 'pending' as TransferStatus,
    notes: '',
    items: [] as TransferItemForm[],
  });

  const generateTransferNumber = (): string => {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TRF-${datePart}-${randomPart}`;
  };

  useEffect(() => {
    if (editingTransfer) {
      setForm({
        transfer_number: editingTransfer.id || '',
        from_warehouse_id: editingTransfer.from_warehouse_id || '',
        to_warehouse_id: editingTransfer.to_warehouse_id || '',
        transfer_date: editingTransfer.created_at ? new Date(editingTransfer.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        status: editingTransfer.status || 'pending',
        notes: editingTransfer.notes || '',
        items: editingTransfer.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity.toString(),
          product: item.product,
        })) || [],
      });
    } else {
      setForm({
        transfer_number: generateTransferNumber(),
        from_warehouse_id: '',
        to_warehouse_id: '',
        transfer_date: new Date().toISOString().split('T')[0],
        status: 'pending',
        notes: '',
        items: [],
      });
    }
  }, [editingTransfer, visible]);

  // Fetch status options from API
  useEffect(() => {
    const fetchStatusOptions = async () => {
      try {
        const response = await inventoryApiService.getTransferStatusOptions();
        setStatusOptions(response.data);
      } catch (error) {
        // Fallback to default options
        setStatusOptions(['pending', 'in_transit', 'completed', 'cancelled']);
      }
    };

    if (visible) {
      fetchStatusOptions();
    }
  }, [visible]);

  // Fetch current user prioritizing context/storage, fallback to API
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        if (authUser?.id) {
          setCurrentUser(authUser);
          return;
        }
        const storedUser = await storageService.getUserData();
        if (storedUser?.id) {
          setCurrentUser(storedUser);
          return;
        }
        const response = await apiService.getCurrentUser();
        setCurrentUser(response.data);
      } catch (error) {
        setCurrentUser(null); // Fallback to null if fetching fails
      }
    };

    if (visible) {
      fetchCurrentUser();
    }
  }, [visible, authUser]);

  // Debug form state changes
  useEffect(() => {
    console.log('Form state changed:', form);
    console.log('Form items:', form.items);
  }, [form]);

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleItemChange = (index: number, key: string, value: any) => {
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], [key]: value };
    setForm((prev) => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { product_id: '', quantity: '' }],
    }));
  };

  const removeItem = (index: number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const selectProduct = (product: Product) => {
    if (selectedItemIndex >= 0) {
      // Update both product_id and product object at once to avoid race conditions
      const newItems = [...form.items];
      newItems[selectedItemIndex] = { 
        ...newItems[selectedItemIndex], 
        product_id: product.id,
        product: product
      };
      console.log('Setting both product_id and product object:', { product_id: product.id, product: product });
      setForm((prev) => ({ ...prev, items: newItems }));
      console.log('Product selected for item', selectedItemIndex, ':', product.name);
    } else {
      console.log('No item index selected');
    }
    setShowProductPicker(false);
    setSelectedItemIndex(-1);
  };

  const getWarehouseName = (warehouseId: string): string => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    return warehouse?.name || 'Unknown Warehouse';
  };

  const getProductName = (productId: string): string => {
    const product = products.find(p => p.id === productId);
    return product?.name || 'Unknown Product';
  };

  const validateForm = (): boolean => {
    if (!form.from_warehouse_id) {
      Alert.alert('Error', 'Please select source warehouse');
      return false;
    }
    if (!form.to_warehouse_id) {
      Alert.alert('Error', 'Please select destination warehouse');
      return false;
    }
    if (form.from_warehouse_id === form.to_warehouse_id) {
      Alert.alert('Error', 'Source and destination warehouses cannot be the same');
      return false;
    }
    if (form.items.length === 0) {
      Alert.alert('Error', 'Please add at least one item');
      return false;
    }
    for (let i = 0; i < form.items.length; i++) {
      const item = form.items[i];
      if (!item.product_id) {
        Alert.alert('Error', `Please select a product for item ${i + 1}`);
        return false;
      }
      const quantityNumber = parseFloat(item.quantity);
      if (!item.quantity || Number.isNaN(quantityNumber) || quantityNumber <= 0) {
        Alert.alert('Error', `Please enter a valid quantity for item ${i + 1}`);
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const userId = currentUser?.id || authUser?.id || (await storageService.getUserData())?.id;
      if (!userId) {
        Alert.alert('Error', 'Unable to identify current user. Please log in again.');
        setLoading(false);
        return;
      }
      
      const transferData: CreateTransferRequest = {
        transfer_number: form.transfer_number || generateTransferNumber(),
        from_warehouse_id: form.from_warehouse_id,
        to_warehouse_id: form.to_warehouse_id,
        transfer_date: form.transfer_date,
        status: form.status,
        notes: form.notes,
        created_by: userId,
        items: form.items.map(item => ({
          product_id: item.product_id,
          quantity: parseFloat(item.quantity),
        })),
      };

    

      if (isEditing && editingTransfer) {
        await inventoryApiService.updateTransfer(editingTransfer.id, transferData);
        Alert.alert('Success', 'Transfer updated successfully');
      } else {
        await inventoryApiService.createTransfer(transferData);
        Alert.alert('Success', 'Transfer created successfully');
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('API Error details:', error);
      if (error.response) {
        const data = error.response.data;
        const detailArray = Array.isArray(data?.detail) ? data.detail : null;
        const detailMsg = detailArray ? detailArray.map((d: any) => d.msg || JSON.stringify(d)).join('\n') : (data?.detail || data?.message);
        Alert.alert('Error', `API Error: ${detailMsg || 'Failed to create transfer'}`);
      } else {
        Alert.alert('Error', isEditing ? 'Failed to update transfer' : 'Failed to create transfer');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleChange('transfer_date', selectedDate.toISOString().split('T')[0]);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isEditing ? 'Edit Transfer' : 'Create Transfer'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="x" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Transfer Number */}
            <View style={styles.formSection}>
              <Text style={styles.label}>Transfer Number</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                placeholder="Auto-generated"
                value={form.transfer_number}
              />
            </View>

            {/* Warehouses */}
            <View style={styles.formSection}>
              <Text style={styles.label}>From Warehouse</Text>
              <TouchableOpacity
                style={styles.dropdownInput}
                onPress={() => setShowFromWarehousePicker(true)}
              >
                <Text style={[styles.dropdownText, !form.from_warehouse_id && styles.placeholderText]}>
                  {form.from_warehouse_id ? getWarehouseName(form.from_warehouse_id) : 'Select Warehouse'}
                </Text>
                <Icon name="chevron-down" size={20} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>To Warehouse</Text>
              <TouchableOpacity
                style={styles.dropdownInput}
                onPress={() => setShowToWarehousePicker(true)}
              >
                <Text style={[styles.dropdownText, !form.to_warehouse_id && styles.placeholderText]}>
                  {form.to_warehouse_id ? getWarehouseName(form.to_warehouse_id) : 'Select Warehouse'}
                </Text>
                <Icon name="chevron-down" size={20} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </View>

            {/* Transfer Date */}
            <View style={styles.formSection}>
              <Text style={styles.label}>Transfer Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateInputText}>
                  {new Date(form.transfer_date).toLocaleDateString()}
                </Text>
                <Icon name="calendar" size={20} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </View>

            {/* Status */}
            <View style={styles.formSection}>
              <Text style={styles.label}>Status</Text>
              <TouchableOpacity
                style={styles.dropdownInput}
                onPress={() => setShowStatusPicker(true)}
              >
                <Text style={styles.dropdownText}>
                  {form.status.replace('_', ' ').toUpperCase()}
                </Text>
                <Icon name="chevron-down" size={20} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </View>

            {/* Notes */}
            <View style={styles.formSection}>
              <Text style={styles.label}>Notes</Text>
              {/* @ts-ignore - multiline prop typing workaround in current RN types */}
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add notes about this transfer..."
                value={form.notes}
                onChangeText={(v) => handleChange('notes', v)}
                {...({ multiline: true } as any)}
              />
            </View>

            {/* Items Section */}
            <View style={styles.formSection}>
              <View style={styles.itemsHeader}>
                <Text style={styles.sectionTitle}>Transfer Items</Text>
                <TouchableOpacity style={styles.addItemButton} onPress={addItem}>
                  <Icon name="plus" size={16} color={COLORS.text.light} />
                  <Text style={styles.addItemText}>Add Item</Text>
                </TouchableOpacity>
              </View>

              {form.items.map((item, index) => (
                <View key={index} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>Item {index + 1}</Text>
                    <TouchableOpacity onPress={() => removeItem(index)}>
                      <Icon name="trash-2" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.itemRow}>
                    <View style={styles.itemInputHalf}>
                      <Text style={styles.itemLabel}>Product</Text>
                      <TouchableOpacity
                        style={styles.dropdownInput}
                        onPress={() => {
                          console.log('Opening product picker for item index:', index);
                          console.log('Available products:', products?.length || 0);
                          setSelectedItemIndex(index);
                          setShowProductPicker(true);
                        }}
                      >
                        <Text style={[styles.dropdownText, !item.product_id && styles.placeholderText]}>
                          {item.product_id ? getProductName(item.product_id) : 'Select Product'}
                        </Text>
                        <Icon name="chevron-down" size={16} color={COLORS.text.secondary} />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.itemInputHalf}>
                      <Text style={styles.itemLabel}>Quantity</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="0"
                        value={item.quantity}
                        onChangeText={(v) => handleItemChange(index, 'quantity', v)}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </View>
              ))}

              {form.items.length === 0 && (
                <View style={styles.emptyItems}>
                  <Icon name="package" size={32} color={COLORS.text.secondary} />
                  <Text style={styles.emptyItemsText}>No items added</Text>
                  <Text style={styles.emptyItemsSubtext}>Tap "Add Item" to start</Text>
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={[styles.footerButton, styles.cancelButton]}
              onPress={!loading ? onClose : undefined}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.footerButton, styles.saveButton]}
              onPress={!loading ? handleSave : undefined}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Product Picker Modal */}
          <Modal visible={showProductPicker} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Product ({products?.length || 0} products)</Text>
                  <TouchableOpacity onPress={() => setShowProductPicker(false)}>
                    <Icon name="x" size={24} color={COLORS.text.primary} />
                  </TouchableOpacity>
                </View>
                
                {products && products.length > 0 ? (
                  <>
                    <FlatList
                      data={products}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.productOption}
                          onPress={() => selectProduct(item)}
                        >
                          <View style={styles.productInfo}>
                            <Text style={styles.productName}>{item.name}</Text>
                            <Text style={styles.productSku}>SKU: {item.sku}</Text>
                          </View>
                          <Icon name="chevron-right" size={20} color={COLORS.text.secondary} />
                        </TouchableOpacity>
                      )}
                      style={styles.productList}
                    />
                    {/* Debug button */}
                    <TouchableOpacity
                      style={[styles.productOption, { backgroundColor: '#FFE4E1' }]}
                      onPress={() => {
                        if (products.length > 0) {
                          console.log('Debug: Testing product selection with first product');
                          selectProduct(products[0]);
                        }
                      }}
                    >
                      <View style={styles.productInfo}>
                        <Text style={styles.productName}>DEBUG: Test Select First Product</Text>
                        <Text style={styles.productSku}>Click to test selection</Text>
                      </View>
                      <Icon name="chevron-right" size={20} color={COLORS.text.secondary} />
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={styles.emptyProducts}>
                    <Icon name="package" size={32} color={COLORS.text.secondary} />
                    <Text style={styles.emptyItemsText}>No products available</Text>
                    <Text style={styles.emptyItemsSubtext}>Please check your product data</Text>
                  </View>
                )}
              </View>
            </View>
          </Modal>

          {/* From Warehouse Picker Modal */}
          <Modal visible={showFromWarehousePicker} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Source Warehouse</Text>
                  <TouchableOpacity onPress={() => setShowFromWarehousePicker(false)}>
                    <Icon name="x" size={24} color={COLORS.text.primary} />
                  </TouchableOpacity>
                </View>
                
                <FlatList
                  data={warehouses}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.productOption}
                      onPress={() => {
                        handleChange('from_warehouse_id', item.id);
                        setShowFromWarehousePicker(false);
                      }}
                    >
                      <View style={styles.productInfo}>
                        <Text style={styles.productName}>{item.name}</Text>
                        <Text style={styles.productSku}>ID: {item.id.slice(0, 8)}...</Text>
                      </View>
                      <Icon name="chevron-right" size={20} color={COLORS.text.secondary} />
                    </TouchableOpacity>
                  )}
                  style={styles.productList}
                />
              </View>
            </View>
          </Modal>

          {/* To Warehouse Picker Modal */}
          <Modal visible={showToWarehousePicker} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Destination Warehouse</Text>
                  <TouchableOpacity onPress={() => setShowToWarehousePicker(false)}>
                    <Icon name="x" size={24} color={COLORS.text.primary} />
                  </TouchableOpacity>
                </View>
                
                <FlatList
                  data={warehouses}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.productOption}
                      onPress={() => {
                        handleChange('to_warehouse_id', item.id);
                        setShowToWarehousePicker(false);
                      }}
                    >
                      <View style={styles.productInfo}>
                        <Text style={styles.productName}>{item.name}</Text>
                        <Text style={styles.productSku}>ID: {item.id.slice(0, 8)}...</Text>
                      </View>
                      <Icon name="chevron-right" size={20} color={COLORS.text.secondary} />
                    </TouchableOpacity>
                  )}
                  style={styles.productList}
                />
              </View>
            </View>
          </Modal>

          {/* Status Picker Modal */}
          <Modal visible={showStatusPicker} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Status</Text>
                  <TouchableOpacity onPress={() => setShowStatusPicker(false)}>
                    <Icon name="x" size={24} color={COLORS.text.primary} />
                  </TouchableOpacity>
                </View>
                
                <FlatList
                  data={statusOptions}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.productOption}
                      onPress={() => {
                        handleChange('status', item);
                        setShowStatusPicker(false);
                      }}
                    >
                      <View style={styles.productInfo}>
                        <Text style={styles.productName}>{item.replace('_', ' ').toUpperCase()}</Text>
                      </View>
                      <Icon name="chevron-right" size={20} color={COLORS.text.secondary} />
                    </TouchableOpacity>
                  )}
                  style={styles.productList}
                />
              </View>
            </View>
          </Modal>

          {/* Date Picker */}
          {showDatePicker && (
            <DateTimePicker
              value={new Date(form.transfer_date)}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: SPACING.lg,
  },
  formSection: {
    marginBottom: SPACING.lg,
  },
  label: {
    ...TEXT_STYLES.h4,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 14,
    color: COLORS.text.primary,
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: COLORS.text.secondary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dropdownInput: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 14,
    color: COLORS.text.primary,
    flex: 1,
  },
  placeholderText: {
    color: COLORS.text.secondary,
  },
  dateInput: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateInputText: {
    fontSize: 14,
    color: COLORS.text.primary,
  },
  sectionTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.text.primary,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  addItemText: {
    color: COLORS.text.light,
    fontWeight: '600',
    marginLeft: SPACING.xs,
    fontSize: 12,
  },
  itemCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  itemRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  itemInputHalf: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  emptyItems: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyProducts: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyItemsText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: SPACING.sm,
  },
  emptyItemsSubtext: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: SPACING.md,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  footerButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  saveButtonText: {
    color: COLORS.text.light,
    fontWeight: '600',
  },
  productList: {
    padding: SPACING.lg,
  },
  productOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  productSku: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
});

export default TransferForm;
