import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

interface FilterOption {
  id: string;
  label: string;
}

interface ProductFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (selectedIds: string[]) => void;
  categories: FilterOption[];
}

const ProductFilterModal: React.FC<ProductFilterModalProps> = ({
  visible,
  onClose,
  onApply,
  categories,
}) => {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const toggleFilter = (id: string) => {
    setSelectedFilters((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleApply = () => {
    onApply(selectedFilters);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Filter Products</Text>

        <ScrollView style={styles.content}>
          {categories.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionContainer}
              onPress={() => toggleFilter(option.id)}
            >
              <View style={[styles.checkbox, selectedFilters.includes(option.id) && styles.checked]} />
              <Text style={styles.optionLabel}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyText}>Apply</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 15 },
  content: { flex: 1 },
  optionContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 12,
    borderRadius: 4,
  },
  checked: {
    backgroundColor: '#007AFF',
    
    borderColor: '#007AFF',
  },
  optionLabel: { fontSize: 16 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
  },
  applyButton: { backgroundColor: '#007AFF', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 6 },
  applyText: { color: 'white', fontWeight: '600' },
  closeButton: { paddingHorizontal: 20, paddingVertical: 12 },
  closeText: { color: '#007AFF', fontWeight: '600' },
});

export default ProductFilterModal;
