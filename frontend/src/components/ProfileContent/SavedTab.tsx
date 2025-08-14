import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';

interface SavedItem {
  id: string;
  title: string;
  image: string;
  type: 'project' | 'design' | 'inspiration' | 'service' | 'supplier' | 'technology';
  description?: string;
  location?: string;
  rating?: number;
  savedDate?: string;
}

interface SavedTabProps {
  savedItems: SavedItem[];
  onItemPress: (item: SavedItem) => void;
}

export const SavedTab: React.FC<SavedTabProps> = ({ savedItems, onItemPress }) => {
  const getItemIcon = (type: SavedItem['type']) => {
    switch (type) {
      case 'project':
        return 'business';
      case 'design':
        return 'palette';
      case 'inspiration':
        return 'lightbulb';
      case 'service':
        return 'build';
      case 'supplier':
        return 'local-shipping';
      case 'technology':
        return 'computer';
      default:
        return 'business';
    }
  };

  const renderSavedItem = (item: SavedItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.savedItem}
      onPress={() => onItemPress(item)}
    >
      <View style={styles.imageContainer}>
        <FastImage
          source={{ uri: item.image }}
          style={styles.itemImage}
          resizeMode={FastImage.resizeMode.cover}
        />
        <View style={styles.itemIcon}>
          <Icon 
            name={getItemIcon(item.type)} 
            size={16} 
            color={COLORS.text.light} 
          />
        </View>
        {item.rating && (
          <View style={styles.ratingContainer}>
            <Icon name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        )}
      </View>
      <Text style={styles.itemTitle} numberOfLines={2}>
        {item.title}
      </Text>
      {item.location && (
        <Text style={styles.itemLocation} numberOfLines={1}>
          📍 {item.location}
        </Text>
      )}
      {item.savedDate && (
        <Text style={styles.itemDate}>
          Saved {item.savedDate}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Items</Text>
          {savedItems.length > 0 ? (
            <View style={styles.gridContainer}>
              {savedItems.map(renderSavedItem)}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="bookmark-border" size={48} color={COLORS.text.secondary} />
              <Text style={styles.emptyStateText}>No saved items</Text>
              <Text style={styles.emptyStateSubtext}>Items you save will appear here</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  section: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  savedItem: {
    width: '48%',
    marginBottom: SPACING.md,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: SPACING.xs,
  },
  itemImage: {
    width: '100%',
    height: 120,
    borderRadius: BORDER_RADIUS.md,
  },
  itemIcon: {
    position: 'absolute',
    bottom: SPACING.xs,
    right: SPACING.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingContainer: {
    position: 'absolute',
    top: SPACING.xs,
    left: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  ratingText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 2,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text.primary,
    lineHeight: 16,
    marginBottom: 2,
  },
  itemLocation: {
    fontSize: 10,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  itemDate: {
    fontSize: 10,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.lg,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});