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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../../constants/spacing';
import { TYPOGRAPHY, TEXT_STYLES } from '../../../constants/typography';
import { FORM_STYLES, FORM_COLORS, INPUT_ICONS } from '../../../constants/formStyles';
import { Transfer, Warehouse, Product, CreateTransferRequest, TransferStatus } from '../../../types/inventory';
import inventoryApiService from '../../../api/inventoryApi';
import stockNotificationService from '../../../utils/stockNotifications';
import apiService from '../../../api/api';
import DateTimePicker from '@react-native-community/datetimepicker';
import storageService from '../../../utils/storage';
import { useAuth } from '../../../context/AuthContext';
import SuccessModal from '../../SuccessModal';
import FailureModal from '../../FailureModal';
import DeleteModal from '../../DeleteModal';

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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [failureMessage, setFailureMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

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
    setItemToDelete(index);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete === null) return;
    
    setIsDeleting(true);
    try {
      setForm(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== itemToDelete)
      }));
      // Success will be handled by the modal's success stage
    } catch (error) {
      Alert.alert('Error', 'Failed to remove item');
      setIsDeleting(false);
    }
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
      setForm((prev) => ({ ...prev, items: newItems }));
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
        setFailureMessage('Unable to identify current user. Please log in again.');
        setShowFailureModal(true);
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
        setSuccessMessage('Transfer updated successfully!');
      } else {
        await inventoryApiService.createTransfer(transferData);
        setSuccessMessage('Transfer created successfully!');
        
        // Trigger transfer notification
        await stockNotificationService.triggerTransferNotification(transferData, 'created');
      }
      
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Transfer form error:', error);
      if (error.response) {
        const data = error.response.data;
        const detailArray = Array.isArray(data?.detail) ? data.detail : null;
        const detailMsg = detailArray ? detailArray.map((d: any) => d.msg || JSON.stringify(d)).join('\n') : (data?.detail || data?.message);
        setFailureMessage(`API Error: ${detailMsg || 'Failed to create transfer'}`);
      } else {
        setFailureMessage(isEditing ? 'Failed to update transfer' : 'Failed to create transfer');
      }
      setShowFailureModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    onSuccess();
    onClose();
  };

  const handleFailureModalClose = () => {
    setShowFailureModal(false);
  };

  const handleFailureModalAction = () => {
    setShowFailureModal(false);
    // Optionally retry the operation
    // handleSave();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleChange('transfer_date', selectedDate.toISOString().split('T')[0]);
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

  const renderPickerField = (
    field: string,
    label: string,
    icon: string,
    value: string,
    placeholder: string,
    onPress: () => void
  ) => (
    <View style={FORM_STYLES.inputContainer}>
      <Text style={FORM_STYLES.inputLabel}>{label}</Text>
      <TouchableOpacity style={FORM_STYLES.inputWrapper} onPress={onPress}>
        <Icon name={icon} size={20} color={FORM_COLORS.text.secondary} style={FORM_STYLES.inputIcon} />
        <Text style={[FORM_STYLES.input, !value && { color: FORM_COLORS.text.tertiary }]}>
          {value || placeholder}
        </Text>
        <Icon name="chevron-down" size={20} color={FORM_COLORS.text.tertiary} />
      </TouchableOpacity>
    </View>
  );

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
            {/* Transfer Information Card */}
            <View style={FORM_STYLES.card}>
              <View style={FORM_STYLES.cardHeader}>
                <Icon name="truck-delivery" size={24} color={FORM_COLORS.primary} />
                <Text style={FORM_STYLES.cardTitle}>Transfer Information</Text>
              </View>
              
              {renderInputField('transfer_number', 'Transfer Number', 'Auto-generated', 'hash')}
              
              {renderPickerField(
                'from_warehouse_id',
                'From Warehouse',
                'warehouse',
                form.from_warehouse_id ? getWarehouseName(form.from_warehouse_id) : '',
                'Select Source Warehouse',
                () => setShowFromWarehousePicker(true)
              )}
              
              {renderPickerField(
                'to_warehouse_id',
                'To Warehouse',
                'warehouse',
                form.to_warehouse_id ? getWarehouseName(form.to_warehouse_id) : '',
                'Select Destination Warehouse',
                () => setShowToWarehousePicker(true)
              )}
              
              {renderPickerField(
                'transfer_date',
                'Transfer Date',
                'calendar',
                new Date(form.transfer_date).toLocaleDateString(),
                'Select Date',
                () => setShowDatePicker(true)
              )}
              
              {renderPickerField(
                'status',
                'Status',
                'flag',
                form.status.replace('_', ' ').toUpperCase(),
                'Select Status',
                () => setShowStatusPicker(true)
              )}
              
              {renderInputField('notes', 'Notes', 'Add notes about this transfer...', 'text', 'default', true)}
            </View>

            {/* Transfer Items Card */}
            <View style={FORM_STYLES.card}>
              <View style={FORM_STYLES.cardHeader}>
                <Icon name="package-variant" size={24} color={FORM_COLORS.primary} />
                <Text style={FORM_STYLES.cardTitle}>Transfer Items</Text>
              </View>
              
              <TouchableOpacity style={FORM_STYLES.accentButton} onPress={addItem}>
                <Icon name="plus" size={20} color={FORM_COLORS.primary} style={FORM_STYLES.accentButtonIcon} />
                <Text style={FORM_STYLES.accentButtonText}>Add Item</Text>
              </TouchableOpacity>

              {form.items.map((item, index) => (
                <View key={index} style={[FORM_STYLES.card, { marginTop: 16, padding: 16 }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Text style={[FORM_STYLES.inputLabel, { marginBottom: 0 }]}>Item {index + 1}</Text>
                    <TouchableOpacity onPress={() => removeItem(index)}>
                      <Icon name="delete" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={FORM_STYLES.formRow}>
                    <View style={FORM_STYLES.formRowItem}>
                      <Text style={FORM_STYLES.inputLabel}>Product</Text>
                      <TouchableOpacity
                        style={FORM_STYLES.inputWrapper}
                        onPress={() => {
                          setSelectedItemIndex(index);
                          setShowProductPicker(true);
                        }}
                      >
                        <Icon name="package-variant" size={20} color={FORM_COLORS.text.secondary} style={FORM_STYLES.inputIcon} />
                        <Text style={[FORM_STYLES.input, !item.product_id && { color: FORM_COLORS.text.tertiary }]}>
                          {item.product_id ? getProductName(item.product_id) : 'Select Product'}
                        </Text>
                        <Icon name="chevron-down" size={16} color={FORM_COLORS.text.tertiary} />
                      </TouchableOpacity>
                    </View>
                    <View style={FORM_STYLES.formRowItem}>
                      <Text style={FORM_STYLES.inputLabel}>Quantity</Text>
                      <View style={FORM_STYLES.inputWrapper}>
                        <Icon name="counter" size={20} color={FORM_COLORS.text.secondary} style={FORM_STYLES.inputIcon} />
                        <TextInput
                          style={FORM_STYLES.input}
                          placeholder="0"
                          value={item.quantity}
                          onChangeText={(v) => handleItemChange(index, 'quantity', v)}
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                  </View>
                </View>
              ))}

              {form.items.length === 0 && (
                <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                  <Icon name="package-variant" size={32} color={FORM_COLORS.text.secondary} />
                  <Text style={[FORM_STYLES.inputLabel, { marginTop: 8, color: FORM_COLORS.text.secondary }]}>No items added</Text>
                  <Text style={[FORM_STYLES.inputLabel, { fontSize: 12, color: FORM_COLORS.text.tertiary }]}>Tap "Add Item" to start</Text>
                </View>
              )}
            </View>
          </ScrollView>

          <View style={FORM_STYLES.buttonContainer}>
            <TouchableOpacity 
              style={FORM_STYLES.secondaryButton}
              onPress={!loading ? onClose : undefined}
            >
              <Text style={FORM_STYLES.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[FORM_STYLES.primaryButton, loading && FORM_STYLES.buttonDisabled]}
              onPress={!loading ? handleSave : undefined}
            >
              <View style={FORM_STYLES.primaryButtonContent}>
                <Icon 
                  name={isEditing ? 'content-save' : 'plus'} 
                  size={20} 
                  color="#fff" 
                  style={FORM_STYLES.primaryButtonIcon}
                />
                <Text style={FORM_STYLES.primaryButtonText}>
                  {loading ? 'Saving...' : (isEditing ? 'Update Transfer' : 'Create Transfer')}
                </Text>
              </View>
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

          {/* Delete Confirmation Modal */}
          <DeleteModal
            visible={showDeleteModal}
            isDeleting={isDeleting}
            title="Remove Item"
            message="Are you sure you want to remove this item from the transfer?"
            itemName={itemToDelete !== null ? `Item ${itemToDelete + 1}` : ''}
            onClose={() => {
              setShowDeleteModal(false);
              setIsDeleting(false);
              setItemToDelete(null);
            }}
            onConfirm={handleConfirmDelete}
          />
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
