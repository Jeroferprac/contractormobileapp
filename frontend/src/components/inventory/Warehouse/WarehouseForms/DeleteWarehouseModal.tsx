import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { inventoryApiService } from '../../../../api/inventoryApi';
import { Warehouse } from '../../../../types/inventory';

interface DeleteWarehouseModalProps {
  visible: boolean;
  warehouse: Warehouse | null;
  onClose: () => void;
  onSuccess: () => void;
}

const DeleteWarehouseModal: React.FC<DeleteWarehouseModalProps> = ({
  visible,
  warehouse,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!warehouse) return;

    setLoading(true);
    try {
      await inventoryApiService.deleteWarehouse(warehouse.id);
      Alert.alert('Success', 'Warehouse deleted successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Delete warehouse error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Failed to delete warehouse. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!warehouse) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#ff6b6b', '#ee5a52']}
            style={styles.headerGradient}
          >
            <View style={styles.header}>
              <Icon name="alert-circle" size={32} color="#fff" />
              <Text style={styles.headerTitle}>Delete Warehouse</Text>
            </View>
          </LinearGradient>

          <View style={styles.content}>
            <View style={styles.warningContainer}>
              <Icon name="alert-triangle" size={48} color="#ff6b6b" />
              <Text style={styles.warningTitle}>Are you sure?</Text>
              <Text style={styles.warningText}>
                This action cannot be undone. The warehouse and all its associated data will be permanently deleted.
              </Text>
            </View>

            <View style={styles.warehouseInfo}>
              <View style={styles.infoRow}>
                <Icon name="warehouse" size={20} color="#667eea" />
                <Text style={styles.infoLabel}>Warehouse:</Text>
                <Text style={styles.infoValue}>{warehouse.name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="hash" size={20} color="#667eea" />
                <Text style={styles.infoLabel}>Code:</Text>
                <Text style={styles.infoValue}>{warehouse.code}</Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="map-marker" size={20} color="#667eea" />
                <Text style={styles.infoLabel}>Address:</Text>
                <Text style={styles.infoValue} numberOfLines={2}>
                  {warehouse.address}
                </Text>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.deleteButton, loading && styles.deleteButtonDisabled]}
                onPress={handleDelete}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Icon name="delete" size={20} color="#fff" style={styles.buttonIcon} />
                    <Text style={styles.deleteButtonText}>Delete Warehouse</Text>
                  </>
                )}
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
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  headerGradient: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 8,
  },
  content: {
    padding: 24,
  },
  warningContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  warehouseInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginLeft: 8,
    marginRight: 8,
    minWidth: 60,
  },
  infoValue: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#ff6b6b',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  deleteButtonDisabled: {
    backgroundColor: '#ccc',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default DeleteWarehouseModal;
