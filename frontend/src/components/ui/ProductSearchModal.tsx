import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';
import { Product } from '../../types/inventory';

interface ProductSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onProductSelect: (product: Product) => void;
  products: Product[];
  recentSearches: string[];
  onRecentSearchPress: (search: string) => void;
  onSearchSubmit: (search: string) => void;
}

const ProductSearchModal: React.FC<ProductSearchModalProps> = ({
  visible,
  onClose,
  onProductSelect,
  products,
  recentSearches,
  onRecentSearchPress,
  onSearchSubmit,
}) => {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (searchText.length > 0) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchText.toLowerCase()) ||
        product.category_name.toLowerCase().includes(searchText.toLowerCase())
      );
      setSearchResults(filtered.slice(0, 10)); // Limit to 10 results
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchText, products]);

  const handleSearchSubmit = () => {
    if (searchText.trim()) {
      onSearchSubmit(searchText);
      onClose();
    }
  };

  const handleProductPress = (product: Product) => {
    onProductSelect(product);
    onClose();
  };

  const handleRecentSearchPress = (search: string) => {
    onRecentSearchPress(search);
    onClose();
  };

  const renderProductCard = (product: Product) => (
    <TouchableOpacity
      key={product.id}
      style={styles.productCard}
      onPress={() => handleProductPress(product)}
    >
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.productCategory} numberOfLines={1}>
          {product.category_name}
        </Text>
        <Text style={styles.productPrice}>
          ${parseFloat(product.selling_price.toString()).toFixed(2)}
        </Text>
      </View>
      <Icon name="chevron-right" size={20} color={COLORS.text.secondary} />
    </TouchableOpacity>
  );

  const renderRecentSearchItem = (search: string, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.recentSearchItem}
      onPress={() => handleRecentSearchPress(search)}
    >
      <Icon name="clock" size={16} color={COLORS.text.secondary} />
      <Text style={styles.recentSearchText}>{search}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Icon name="arrow-left" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Icon name="search" size={20} color={COLORS.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search here..."
              placeholderTextColor={COLORS.text.secondary}
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearchSubmit}
              autoFocus
            />
            <TouchableOpacity style={styles.filterButton}>
              <Icon name="sliders" size={20} color={COLORS.text.light} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Separator */}
        <View style={styles.separator} />

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {showResults && searchResults.length > 0 ? (
            // Search Results
            <View style={styles.resultsSection}>
              <Text style={styles.sectionTitle}>
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
              </Text>
              {searchResults.map(renderProductCard)}
            </View>
          ) : !showResults && recentSearches.length > 0 ? (
            // Recent Searches
            <View style={styles.recentSearchesSection}>
              <Text style={styles.sectionTitle}>Top Search</Text>
              {recentSearches.map(renderRecentSearchItem)}
            </View>
          ) : showResults && searchResults.length === 0 ? (
            // No Results
            <View style={styles.emptyState}>
              <Icon name="search" size={64} color={COLORS.text.secondary} />
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search terms
              </Text>
            </View>
          ) : (
            // Default State
            <View style={styles.emptyState}>
              <Icon name="search" size={64} color={COLORS.text.secondary} />
              <Text style={styles.emptyTitle}>Search for products</Text>
              <Text style={styles.emptySubtitle}>
                Find products by name, brand, or category
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: 16,
    color: COLORS.text.primary,
  },
  filterButton: {
    padding: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    marginLeft: SPACING.sm,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border.light,
    marginHorizontal: SPACING.lg,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  resultsSection: {
    paddingTop: SPACING.lg,
  },
  recentSearchesSection: {
    paddingTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  recentSearchText: {
    fontSize: 16,
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
});

export default ProductSearchModal;
