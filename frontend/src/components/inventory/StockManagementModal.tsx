import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { inventoryApiService } from '../../api/inventoryApi';
import { Product, Warehouse } from '../../types/inventory';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';
import SuccessModal from '../SuccessModal';
import FailureModal from '../FailureModal';

interface StockManagementModalProps {
  visible: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  onStockAdded: () => void;
}

const StockManagementModal: React.FC<StockManagementModalProps> = ({
  visible,
  onClose,
  productId,
  productName,
  onStockAdded,
}) => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [warehouseStockMap, setWarehouseStockMap] = useState<Record<string, number>>({});

  // Optional product selection when productId isn't provided
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);

  // Local modals
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [failureMessage, setFailureMessage] = useState('');

  useEffect(() => {
    if (visible) {
      if (!productId) {
        loadProducts();
      }
      loadWarehouses();
    }
  }, [visible, productId]);

  useEffect(() => {
    if (visible) {
      // Refresh stock map when product changes
      loadWarehouses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProduct?.id]);

  const loadWarehouses = async () => {
    try {
      const activeProductId = selectedProduct?.id || productId;
      const [whRes, stockRes] = await Promise.all([
        inventoryApiService.getWarehouses(),
        activeProductId ? inventoryApiService.getWarehouseStocks({ product_id: activeProductId }) : Promise.resolve({ data: [] } as any),
      ]);
      setWarehouses(whRes.data || []);
      const map: Record<string, number> = {};
      (stockRes.data || []).forEach((s: any) => {
        if (s.warehouse_id) {
          map[s.warehouse_id] = Number(s.available_quantity ?? s.quantity ?? 0);
        }
      });
      setWarehouseStockMap(map);
    } catch (error) {
      console.error('Error loading warehouses/stocks:', error);
      setFailureMessage('Failed to load warehouses or stock data.');
      setShowFailure(true);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await inventoryApiService.getProducts();
      setProducts(res.data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      setFailureMessage('Failed to load products');
      setShowFailure(true);
    }
  };

  const handleAddStock = async () => {
    if (!selectedWarehouse) {
      setFailureMessage('Please select a warehouse');
      setShowFailure(true);
      return;
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      setFailureMessage('Please enter a valid quantity');
      setShowFailure(true);
      return;
    }

    const activeProductId = selectedProduct?.id || productId;
    const activeProductName = selectedProduct?.name || productName || 'Selected Product';
    if (!activeProductId) {
      setFailureMessage('Please select a product');
      setShowFailure(true);
      return;
    }

    try {
      setLoading(true);
      
      // Add stock to the product in the selected warehouse
      await inventoryApiService.addStock({
        product_id: activeProductId,
        warehouse_id: selectedWarehouse.id,
        quantity: parseFloat(quantity),
        bin_location: 'Default', // You can make this configurable
      });

      setSuccessMessage(`Added ${quantity} units of ${activeProductName} to ${selectedWarehouse.name}`);
      setShowSuccess(true);
      onStockAdded();
    } catch (error: any) {
      console.error('Error adding stock:', error);
      let errorMessage = 'Failed to add stock. Please try again.';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      setFailureMessage(errorMessage);
      setShowFailure(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Stock</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Product Info */}
          <View style={styles.productInfo}>
            {productId ? (
              <>
                <Text style={styles.productName}>{productName}</Text>
                <Text style={styles.productId}>Product ID: {productId}</Text>
              </>
            ) : (
              <>
                <Text style={styles.inputLabel}>Select Product</Text>
                <TouchableOpacity
                  style={styles.selectionButton}
                  onPress={() => setShowProductModal(true)}
                >
                  <Text style={[styles.selectionText, !selectedProduct && styles.placeholderText]}>
                    {selectedProduct ? selectedProduct.name : 'Choose product'}
                  </Text>
                  <Icon name="arrow-drop-down" size={24} color="#666" />
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Warehouse Selection */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Select Warehouse</Text>
            <TouchableOpacity
              style={styles.selectionButton}
              onPress={() => setShowWarehouseModal(true)}
            >
              <Text style={[
                styles.selectionText,
                !selectedWarehouse && styles.placeholderText
              ]}>
                {selectedWarehouse ? selectedWarehouse.name : 'Choose warehouse'}
              </Text>
              <Icon name="arrow-drop-down" size={24} color="#666" />
            </TouchableOpacity>
            {selectedWarehouse && (
              <Text style={styles.stockHint}>
                Available: {warehouseStockMap[selectedWarehouse.id] ?? 0}
              </Text>
            )}
          </View>

          {/* Quantity Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Quantity to Add</Text>
            <TextInput
              style={styles.textInput}
              value={quantity}
              onChangeText={setQuantity}
              placeholder="Enter quantity"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
            <Text style={styles.helpText}>
              💡 Adding stock will increase available inventory for future sales
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.addButton,
                (!selectedWarehouse || !quantity || loading) && styles.disabledButton
              ]}
              onPress={handleAddStock}
            >
              <Text style={styles.addButtonText}>
                {loading ? 'Adding...' : 'Add Stock'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

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
              
              <ScrollView style={styles.warehouseList}>
                {warehouses.map((warehouse) => (
                  <TouchableOpacity
                    key={warehouse.id}
                    style={styles.warehouseItem}
                    onPress={() => {
                      setSelectedWarehouse(warehouse);
                      setShowWarehouseModal(false);
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.warehouseName}>{warehouse.name}</Text>
                        <Text style={styles.warehouseAddress}>{warehouse.address}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.stockBadge}>Avail: {warehouseStockMap[warehouse.id] ?? 0}</Text>
                      </View>
                    </View>
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
              <ScrollView style={styles.warehouseList}>
                {products.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.warehouseItem}
                    onPress={() => {
                      setSelectedProduct(p);
                      setShowProductModal(false);
                    }}
                  >
                    <Text style={styles.warehouseName}>{p.name}</Text>
                    <Text style={styles.warehouseAddress}>Price: ${p.selling_price}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Local Success/Failure Modals */}
        <SuccessModal
          visible={showSuccess}
          title="Success!"
          message={successMessage}
          onClose={() => { setShowSuccess(false); onClose(); }}
          onAction={() => { setShowSuccess(false); onClose(); }}
          actionText="OK"
        />
        <FailureModal
          visible={showFailure}
          title="Error!"
          message={failureMessage}
          onClose={() => setShowFailure(false)}
          onAction={() => setShowFailure(false)}
          actionText="OK"
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  closeButton: {
    padding: SPACING.xs,
  },
  productInfo: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: '#F8F9FA',
    borderRadius: BORDER_RADIUS.md,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: SPACING.xs,
  },
  productId: {
    fontSize: 14,
    color: '#6C757D',
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
    marginBottom: SPACING.sm,
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
  stockHint: {
    marginTop: SPACING.xs,
    fontSize: 12,
    color: '#6C757D',
  },
  helpText: {
    marginTop: SPACING.xs,
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  placeholderText: {
    color: '#999',
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
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  button: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  cancelButtonText: {
    color: '#6C757D',
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: COLORS.primary,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  warehouseList: {
    maxHeight: 300,
  },
  warehouseItem: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  warehouseName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
    marginBottom: SPACING.xs,
  },
  warehouseAddress: {
    fontSize: 14,
    color: '#6C757D',
  },
  stockBadge: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default StockManagementModal;
