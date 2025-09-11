import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  TextInput,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';

const { width } = Dimensions.get('window');

interface PickerItem {
  id: string;
  name: string;
  description?: string;
  code?: string;
}

interface ModalPickerProps {
  visible: boolean;
  title: string;
  items: PickerItem[];
  selectedItem: PickerItem | null;
  onSelect: (item: PickerItem) => void;
  onClose: () => void;
  searchPlaceholder?: string;
}

const ModalPicker: React.FC<ModalPickerProps> = ({
  visible,
  title,
  items,
  selectedItem,
  onSelect,
  onClose,
  searchPlaceholder = 'Search...',
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.code && item.code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderItem = ({ item }: { item: PickerItem }) => (
    <TouchableOpacity
      style={[
        styles.itemContainer,
        selectedItem?.id === item.id && styles.selectedItem,
      ]}
      onPress={() => {
        onSelect(item);
        onClose();
      }}
    >
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.name}
          </Text>
          {selectedItem?.id === item.id && (
            <Icon name="check" size={20} color={COLORS.primary} />
          )}
        </View>
        {item.code && (
          <Text style={styles.itemCode}>#{item.code}</Text>
        )}
        {item.description && (
          <Text style={styles.itemDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <LinearGradient
            colors={[(COLORS.gradient.primary && COLORS.gradient.primary[0]) || '#FB7504', (COLORS.gradient.primary && COLORS.gradient.primary[1]) || '#C2252C']}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon name="x" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{title}</Text>
              <View style={styles.placeholder} />
            </View>
          </LinearGradient>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Icon name="search" size={20} color={COLORS.text.tertiary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder={searchPlaceholder}
                placeholderTextColor={COLORS.text.tertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                  <Icon name="x" size={16} color={COLORS.text.tertiary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Items List */}
          <FlatList
            data={filteredItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            style={styles.listContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="search" size={48} color={COLORS.text.tertiary} />
                <Text style={styles.emptyText}>No items found</Text>
                <Text style={styles.emptySubtext}>Try adjusting your search</Text>
              </View>
            }
          />

          {/* Selected Item Preview */}
          {selectedItem && (
            <View style={styles.selectedPreview}>
              <View style={styles.selectedContent}>
                <Icon name="check-circle" size={20} color={COLORS.status.success} />
                <Text style={styles.selectedText}>
                  Selected: {selectedItem.name}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay.dark,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '60%',
  },
  header: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
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
  searchContainer: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border.medium,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text.primary,
  },
  clearButton: {
    padding: 4,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  itemContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  selectedItem: {
    backgroundColor: COLORS.surface,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
  },
  itemCode: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.text.tertiary,
    marginTop: 8,
  },
  selectedPreview: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  selectedContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedText: {
    fontSize: 14,
    color: COLORS.text.primary,
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default ModalPicker;
