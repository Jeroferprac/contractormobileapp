import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { TEXT_STYLES } from '../../constants/typography';
import { PriceList } from '../../data/mockData';

interface PriceListCardProps {
  priceList: PriceList;
  onPress: () => void;
  style?: any;
}

const PriceListCard: React.FC<PriceListCardProps> = ({
  priceList,
  onPress,
  style,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: priceList.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: priceList.color }]}>
          <Icon name={priceList.icon as any} size={20} color={COLORS.white} />
        </View>
        
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: priceList.is_active ? COLORS.status.success : COLORS.status.inactive }
          ]}>
            <Text style={styles.statusText}>
              {priceList.is_active ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{priceList.name}</Text>
        <Text style={styles.description} numberOfLines={2}>{priceList.description}</Text>
        
        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Icon name="package" size={14} color={COLORS.text.secondary} />
            <Text style={styles.statText}>{priceList.total_items} items</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="dollar-sign" size={14} color={COLORS.text.secondary} />
            <Text style={styles.statText}>{formatCurrency(priceList.total_value)}</Text>
          </View>
        </View>
        
        {/* Category */}
        <View style={styles.categoryContainer}>
          <View style={[styles.categoryBadge, { backgroundColor: `${priceList.color}20` }]}>
            <Text style={[styles.categoryText, { color: priceList.color }]}>
              {priceList.category}
            </Text>
          </View>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.updatedText}>
            Updated: {formatDate(priceList.updated_at)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    height: 200,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.white,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: 12,
    color: COLORS.text.secondary,
    lineHeight: 16,
    marginBottom: SPACING.sm,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
  categoryContainer: {
    marginBottom: SPACING.sm,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  footer: {
    marginTop: 'auto',
  },
  updatedText: {
    fontSize: 10,
    color: COLORS.text.secondary,
  },
});

export default PriceListCard;

