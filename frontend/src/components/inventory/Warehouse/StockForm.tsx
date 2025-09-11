import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { COLORS } from '../../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../../constants/spacing';
import { TYPOGRAPHY } from '../../../constants/typography';

interface StockFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { quantity: number; notes?: string }) => void;
  initialQuantity?: number;
}

const StockForm: React.FC<StockFormProps> = ({ 
  visible, 
  onClose, 
  onSubmit, 
  initialQuantity = 0 
}) => {
  const [quantity, setQuantity] = useState(initialQuantity.toString());
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum < 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    onSubmit({ quantity: quantityNum, notes });
    setQuantity('');
    setNotes('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Stock Management</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.form}>
            <Text style={styles.label}>Quantity</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter quantity"
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
              placeholderTextColor="#8E8E93"
            />
            
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add notes..."
              value={notes}
              onChangeText={setNotes}
              placeholderTextColor="#8E8E93"
            />
            
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Save Changes</Text>
            </TouchableOpacity>
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
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  closeButton: {
    fontSize: TYPOGRAPHY.sizes.xl,
    color: '#8E8E93',
  },
  form: {
    gap: SPACING.md,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.primary,
  },
  textArea: {
    height: 80,
  },
  submitButton: {
    backgroundColor: '#FB7504',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
  },
});

export default StockForm;
