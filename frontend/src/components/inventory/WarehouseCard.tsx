import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from "react-native";
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS } from "../../constants/colors";
import { SPACING, BORDER_RADIUS, SHADOWS } from "../../constants/spacing";
import { TEXT_STYLES } from "../../constants/typography";

interface Warehouse {
  id: string;
  name: string;
  address: string;
  contact_person: string;
  phone: string;
  email: string;
  image?: string;
}

// Fallback images for different warehouse types
const WAREHOUSE_IMAGES = [
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1553413077-190dd305871c?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=400&h=300&fit=crop'
];

interface Props {
  warehouse: Warehouse;
  onPress: () => void;
}

const WarehouseCard: React.FC<Props> = ({ warehouse, onPress }) => {
  const [hasError, setHasError] = useState(false);

  // Get warehouse image - use random Unsplash image based on warehouse ID
  const getWarehouseImage = (warehouse: Warehouse) => {
    if (warehouse.image && !hasError) {
      return warehouse.image;
    }
    // Use warehouse ID to consistently pick the same image
    const imageIndex = parseInt(warehouse.id) % WAREHOUSE_IMAGES.length;
    return WAREHOUSE_IMAGES[imageIndex];
  };

  const imageUri = getWarehouseImage(warehouse);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <FastImage
          source={{ uri: imageUri }}
          style={styles.image}
          onError={() => setHasError(true)}
          resizeMode={FastImage.resizeMode.cover}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.imageOverlay}
        >
          <Text style={styles.name} numberOfLines={1}>{warehouse.name}</Text>
        </LinearGradient>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.row}>
          <MaterialCommunityIcons
            name="map-marker"
            size={16}
            color={COLORS.status.info}
            style={styles.icon}
          />
          <Text style={styles.text} numberOfLines={1}>{warehouse.address}</Text>
        </View>

        <View style={styles.row}>
          <MaterialCommunityIcons
            name="account"
            size={16}
            color={COLORS.status.success}
            style={styles.icon}
          />
          <Text style={styles.text} numberOfLines={1}>{warehouse.contact_person}</Text>
        </View>

        <View style={styles.row}>
          <MaterialCommunityIcons
            name="phone"
            size={16}
            color={COLORS.primary}
            style={styles.icon}
          />
          <Text style={styles.text} numberOfLines={1}>{warehouse.phone}</Text>
        </View>

        <View style={styles.row}>
          <MaterialCommunityIcons
            name="email"
            size={16}
            color={COLORS.status.warning}
            style={styles.icon}
          />
          <Text style={styles.text} numberOfLines={1}>{warehouse.email}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 200,
    height: 240,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: SPACING.sm,
  },
  name: {
    ...TEXT_STYLES.bodyLarge,
    fontWeight: '700',
    color: COLORS.text.light,
  },
  infoContainer: {
    padding: SPACING.sm,
    flex: 1,
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  icon: {
    marginRight: 6,
  },
  text: {
    ...TEXT_STYLES.bodySmall,
    color: COLORS.text.secondary,
    flex: 1,
  }
});

export default WarehouseCard;
