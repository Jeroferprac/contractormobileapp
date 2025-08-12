import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Product } from '../../types/inventory';
import { inventoryApiService } from '../../api/inventoryApi';
import TopSellingCard from './TopSellingCard';
import { SPACING } from '../../constants/spacing';
import { TEXT_STYLES } from '../../constants/typography';
import { ProductCardSkeleton } from '../ui/LoadingSkeleton';
import { FadeSlideInView } from '../ui';
import { COLORS } from '../../constants/colors';

interface TopSellingListProps {
  loading?: boolean;
}

const TopSellingList: React.FC<TopSellingListProps> = ({ loading: propLoading }) => {
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [internalLoading, setInternalLoading] = useState(true);

  const loading = propLoading !== undefined ? propLoading : internalLoading;

  useEffect(() => {
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
        setInternalLoading(false);
      }
    };

    fetchTopSellingProducts();
  }, []);

  const renderItem = ({ item }: { item: Product }) => (
    <TopSellingCard product={item} onPress={() => {}} />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Top Selling Products</Text>

      {loading ? (
        <FlatList
          data={[...Array(5)]} // Render 5 skeleton cards
          keyExtractor={(_, i) => i.toString()}
          renderItem={({index}) => (
            <FadeSlideInView key={index} delay={index * 80}>
              <ProductCardSkeleton />
            </FadeSlideInView>
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
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
