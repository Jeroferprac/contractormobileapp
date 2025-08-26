import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../../../constants/spacing';
import { TYPOGRAPHY } from '../../../../constants/typography';
import { Stock, Product, Warehouse } from '../../../../types/inventory';
import inventoryApiService from '../../../../api/inventoryApi';

interface AddStockModalProps {
  visible: boolean;
  mode: 'add' | 'edit';
  selectedStock?: Stock | null;
  selectedProduct?: Product | null;
  selectedWarehouse?: Warehouse | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface StockFormData {
  quantity: string;
  reserved_quantity: string;
  available_quantity: string;
  bin_location: string;
  notes: string;
}

const AddStockModal: React.FC<AddStockModalProps> = ({
  visible,
  mode,
  selectedStock,
  selectedProduct,
  selectedWarehouse,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<StockFormData>({
    quantity: '',
    reserved_quantity: '',
    available_quantity: '',
    bin_location: '',
    notes: '',
  });

  useEffect(() => {
    if (visible && selectedStock) {
      setForm({
        quantity: selectedStock.quantity.toString(),
        reserved_quantity: selectedStock.reserved_quantity.toString(),
        available_quantity: selectedStock.available_quantity.toString(),
        bin_location: selectedStock.bin_location || '',
        notes: '',
      });
    } else {
      setForm({
        quantity: '',
        reserved_quantity: '',
        available_quantity: '',
        bin_location: '',
        notes: '',
      });
    }
  }, [visible, selectedStock, mode]);

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedStock || !selectedProduct || !selectedWarehouse) {
      Alert.alert('Error', 'Missing required data');
      return;
    }

    setLoading(true);
    try {
      const quantity = parseFloat(form.quantity) || 0;
      const reservedQuantity = parseFloat(form.reserved_quantity) || 0;
      const availableQuantity = parseFloat(form.available_quantity) || 0;

      if (mode === 'add') {
        // Add to existing stock
        const newQuantity = selectedStock.quantity + quantity;
        await inventoryApiService.updateStock(selectedStock.id, {
          product_id: selectedProduct.id,
          warehouse_id: selectedWarehouse.id,
          quantity: newQuantity,
          reserved_quantity: selectedStock.reserved_quantity,
          available_quantity: newQuantity - selectedStock.reserved_quantity,
          bin_location: form.bin_location || selectedStock.bin_location,
        });
        Alert.alert('Success', `Added ${quantity} items to stock`);
      } else if (mode === 'edit') {
        // Update stock
        await inventoryApiService.updateStock(selectedStock.id, {
          product_id: selectedProduct.id,
          warehouse_id: selectedWarehouse.id,
          quantity: quantity,
          reserved_quantity: reservedQuantity,
          available_quantity: availableQuantity,
          bin_location: form.bin_location,
        });
        Alert.alert('Success', 'Stock updated successfully');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Stock operation failed:', error);
      Alert.alert('Error', 'Operation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    return mode === 'add' ? 'Add Stock' : 'Edit Stock';
  };

  const getButtonText = () => {
    return mode === 'add' ? 'Add Stock' : 'Update Stock';
  };

  const getButtonColor = () => {
    return mode === 'add' ? COLORS.primary : COLORS.secondary;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{getTitle()}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon name="x" size={24} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </View>

            {/* Product Info */}
            {selectedProduct && (
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{selectedProduct.name}</Text>
                <Text style={styles.productCategory}>
                  {selectedProduct.category_name || 'No Category'}
                </Text>
                {selectedWarehouse && (
                  <Text style={styles.warehouseName}>
                    Warehouse: {selectedWarehouse.name}
                  </Text>
                )}
                {selectedStock && (
                  <Text style={styles.currentStock}>
                    Current Stock: {selectedStock.quantity} items
                  </Text>
                )}
              </View>
            )}

            {/* Form */}
            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {mode === 'add' ? 'Quantity to Add' : 'Quantity'}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={mode === 'add' ? "Enter quantity to add" : "Enter quantity"}
                  keyboardType="numeric"
                  value={form.quantity}
                  onChangeText={(value) => handleChange('quantity', value)}
                />
              </View>

              {mode === 'edit' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Reserved Quantity</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter reserved quantity"
                      keyboardType="numeric"
                      value={form.reserved_quantity}
                      onChangeText={(value) => handleChange('reserved_quantity', value)}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Available Quantity</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter available quantity"
                      keyboardType="numeric"
                      value={form.available_quantity}
                      onChangeText={(value) => handleChange('available_quantity', value)}
                    />
                  </View>
                </>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bin Location</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter bin location"
                  value={form.bin_location}
                  onChangeText={(value) => handleChange('bin_location', value)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Add notes..."
                  value={form.notes}
                  onChangeText={(value) => handleChange('notes', value)}
                />
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: getButtonColor() }]}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Processing...' : getButtonText()}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  productInfo: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
  },
  productName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  productCategory: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  warehouseName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  currentStock: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
  formContainer: {
    maxHeight: 300,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.primary,
    backgroundColor: COLORS.background,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  cancelButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    marginRight: SPACING.sm,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  submitButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginLeft: SPACING.sm,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AddStockModal;
