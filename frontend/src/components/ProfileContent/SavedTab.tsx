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
  type: 'project' | 'design' | 'inspiration';
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
        return 'business';
      case 'inspiration':
        return 'business';
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
      </View>
      <Text style={styles.itemTitle}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Items</Text>
          <View style={styles.gridContainer}>
            {savedItems.map(renderSavedItem)}
          </View>
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
  itemTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text.primary,
    lineHeight: 16,
  },
});