import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';
import { PriceList, mockPriceLists } from '../../data/mockData';
import { PriceListCard } from '../home';
import { FadeSlideInView } from '../ui';

interface PriceListSectionProps {
  priceLists?: PriceList[];
  onPriceListPress?: (priceList: PriceList) => void;
  onViewAll?: () => void;
  loading?: boolean;
}

const PriceListSection: React.FC<PriceListSectionProps> = ({
  priceLists: propPriceLists,
  onPriceListPress,
  onViewAll,
  loading = false,
}) => {
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);

  useEffect(() => {
    if (propPriceLists && propPriceLists.length > 0) {
      setPriceLists(propPriceLists);
    } else {
      setPriceLists(mockPriceLists.slice(0, 4));
    }
  }, [propPriceLists]);

  const ViewAllCard = () => (
    <TouchableOpacity
      style={styles.viewAllCard}
      onPress={onViewAll}
      activeOpacity={0.8}
    >
      <View style={styles.viewAllContent}>
        <Icon name="list" size={32} color={COLORS.primary} />
        <Text style={styles.viewAllTitle}>View All</Text>
        <Text style={styles.viewAllSubtitle}>Price Lists</Text>
        <Text style={styles.viewAllCount}>{mockPriceLists.length} total</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {[...Array(4)].map((_, index) => (
            <View key={index} style={styles.skeletonCard}>
              <View style={styles.skeletonHeader} />
              <View style={styles.skeletonContent} />
              <View style={styles.skeletonFooter} />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  if (!priceLists || priceLists.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="list" size={48} color={COLORS.text.tertiary} />
        <Text style={styles.emptyTitle}>No Price Lists</Text>
        <Text style={styles.emptySubtitle}>
          Create your first price list to manage product pricing
        </Text>
        <TouchableOpacity style={styles.addButton} onPress={onViewAll}>
          <Icon name="plus" size={20} color={COLORS.text.light} />
          <Text style={styles.addButtonText}>Create Price List</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {priceLists.map((priceList, index) => (
          <FadeSlideInView key={priceList.id} delay={index * 100}>
            <PriceListCard
              priceList={priceList}
              onPress={() => onPriceListPress && onPriceListPress(priceList)}
            />
          </FadeSlideInView>
        ))}
        
        {mockPriceLists.length > 4 && (
          <FadeSlideInView delay={400}>
            <ViewAllCard />
          </FadeSlideInView>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.sm,
  },
  scrollContainer: {
    paddingHorizontal: SPACING.lg,
  },
  viewAllCard: {
    width: 280,
    height: 200,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border.light,
    borderStyle: 'dashed',
    marginRight: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewAllContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: SPACING.sm,
  },
  viewAllSubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  viewAllCount: {
    fontSize: 12,
    color: COLORS.text.tertiary,
    marginTop: SPACING.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  addButtonText: {
    color: COLORS.text.light,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  skeletonCard: {
    width: 280,
    height: 200,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.md,
    padding: SPACING.md,
  },
  skeletonHeader: {
    height: 40,
    backgroundColor: COLORS.skeleton,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  skeletonContent: {
    flex: 1,
    backgroundColor: COLORS.skeleton,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  skeletonFooter: {
    height: 20,
    backgroundColor: COLORS.skeleton,
    borderRadius: BORDER_RADIUS.sm,
  },
});

export default PriceListSection;
