import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Product } from '../../types/inventory';
import { inventoryApiService } from '../../api/inventoryApi';
import TopSellingCard from './TopSellingCard';
import { SPACING } from '../../constants/spacing';
import { TEXT_STYLES } from '../../constants/typography';
import { COLORS } from '../../constants/colors';

interface TopSellingListProps {
  products?: Product[];
  onPressProduct?: (product: Product) => void;
  onViewAll?: () => void;
}

const TopSellingList: React.FC<TopSellingListProps> = ({ 
  products, 
  onPressProduct, 
  onViewAll 
}) => {
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (products) {
      setTopProducts(products);
      setLoading(false);
    } else {
      const fetchTopSellingProducts = async () => {
        try {
          const response = await inventoryApiService.getProducts();
          const data = response.data as Product[];

          // Convert string values to numbers for comparison
          const processedData = data.map(product => ({
            ...product,
            current_stock: parseFloat(product.current_stock.toString()) || 0,
            cost_price: parseFloat(product.cost_price.toString()) || 0,
            selling_price: parseFloat(product.selling_price.toString()) || 0
          }));

          const topSelling = processedData
            .filter(p => p.current_stock > 0)
            .sort((a, b) => b.current_stock - a.current_stock)
            .slice(0, 5);

          setTopProducts(topSelling);
        } catch (error) {
          console.error('❌ Error fetching products:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchTopSellingProducts();
    }
  }, [products]);

  const renderItem = ({ item }: { item: Product }) => (
    <TopSellingCard product={item} onPress={() => onPressProduct?.(item)} />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Top Selling Products</Text>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : (
        <FlatList
          data={topProducts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

export default TopSellingList;

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.md,
  },
  title: {
    ...TEXT_STYLES.h3, // ✅ Make sure TEXT_STYLES.h3 exists in your typography
    marginBottom: SPACING.sm,
  },
  listContent: {
    gap: SPACING.md,
  },
});
