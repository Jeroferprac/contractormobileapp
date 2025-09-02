import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Text, View, Animated } from "react-native";
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { COLORS } from "../../constants/colors";
import { SPACING, BORDER_RADIUS, SHADOWS } from "../../constants/spacing";
import { TEXT_STYLES, TYPOGRAPHY } from "../../constants/typography";
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

// Using the Warehouse interface from types/inventory.ts
import { Warehouse } from '../../types/inventory';
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";

// Fallback images for different warehouse types
const WAREHOUSE_IMAGES = [
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1553413077-190dd305871c?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=400&h=300&fit=crop'
];

interface WarehouseCardProps {
  warehouse: Warehouse;
  onPress?: () => void;
  isLoading?: boolean;
}

const WarehouseCard: React.FC<WarehouseCardProps> = ({ warehouse, onPress, isLoading = false }) => {
  const [hasError, setHasError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const animatedScale = useState(new Animated.Value(1))[0];
  const animatedShadowOpacity = useState(new Animated.Value(0.15))[0];

  // Get warehouse image - use random Unsplash image based on warehouse ID
  const getWarehouseImage = (warehouse: Warehouse) => {
    // Use warehouse ID to consistently pick the same image
    const imageIndex = parseInt(warehouse.id) % WAREHOUSE_IMAGES.length;
    return WAREHOUSE_IMAGES[imageIndex];
  };

  const imageUri = getWarehouseImage(warehouse);
  
  // Loading skeleton
  if (isLoading) {
    return (
      <View style={styles.cardWrapper}>
        <LoadingSkeleton height={200} width={280} borderRadius={BORDER_RADIUS.lg} />
      </View>
    );
  }
  
  // Handle hover effect
  const handlePressIn = () => {
    setIsHovered(true);
    Animated.parallel([
      Animated.timing(animatedScale, {
        toValue: 1.03,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.timing(animatedShadowOpacity, {
        toValue: 0.4,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    setIsHovered(false);
    Animated.parallel([
      Animated.timing(animatedScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.timing(animatedShadowOpacity, {
        toValue: 0.15,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  };

  // Get first letter of warehouse name for logo
  const logoLetter = warehouse?.name?.charAt(0).toUpperCase() || 'W';

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
    >
      <Animated.View
        style={[
          styles.cardWrapper,
          {
            transform: [{ scale: animatedScale }],
            shadowOpacity: animatedShadowOpacity,
            shadowColor: isHovered ? COLORS.primary : '#000',
          },
        ]}
      >
        <View style={styles.card}>
          {/* Background Image */}
          <FastImage
            source={{ uri: imageUri }}
            style={styles.backgroundImage}
            onLoadEnd={() => setImageLoaded(true)}
            onError={() => setHasError(true)}
          />
          
          {/* Gradient Overlay */}
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.8)']}
            style={styles.gradientOverlay}
          />
        
        <View style={styles.cardContent}>
          <View style={styles.topRow}>
            <View style={styles.logoContainer}>
              {/* Logo with Gradient */}
              <LinearGradient
                colors={[COLORS.primary, COLORS.accent]}
                style={styles.logoCircle}
              >
                <Text style={styles.logoText}>{logoLetter}</Text>
              </LinearGradient>
            </View>

            {/* Badge */}
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{warehouse.contact_person || 'Contractors'}</Text>
            </View>
          </View>

          {/* Company Name with Verified Badge */}
          <View style={styles.nameContainer}>
            <Text style={styles.name} numberOfLines={1}>{warehouse.name}</Text>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={COLORS.status.verified}
              style={styles.verifiedIcon}
            />
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Info Section */}
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              {/* Rating */}
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingLabel}>Rating</Text>
                <View style={styles.ratingValue}>
                  <Ionicons
                    name="star"
                    size={14}
                    color="#FFD700"
                  />
                  <Text style={styles.ratingText}>4.9 (100)</Text>
                </View>
              </View>

              {/* Location */}
              <View style={styles.locationContainer}>
                <Text style={styles.locationLabel}>Location</Text>
                <View style={styles.locationValue}>
                  <Feather
                    name="map-pin"
                    size={14}
                    color={COLORS.status.info}
                  />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {warehouse.address ? warehouse.address.split(',')[0] : 'N/A'}
                  </Text>
                </View>
              </View>

              {/* Contact */}
              <View style={styles.categoryContainer}>
                <Text style={styles.categoryLabel}>Contact</Text>
                <View style={styles.categoryValue}>
                  <Feather
                    name="phone"
                    size={14}
                    color={COLORS.status.success}
                  />
                  <Text style={styles.categoryText} numberOfLines={1}>
                    {warehouse.phone ? warehouse.phone.substring(0, 10) : 'N/A'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Tags */}
            <View style={styles.tagsContainer}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>Premium</Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{warehouse.code || 'Warehouse'}</Text>
              </View>
              <TouchableOpacity style={styles.tagCount}>
                <Text style={styles.tagCountText}>+3</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    width: 280,
    height: 200,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.md,
    ...SHADOWS.lg,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.lg,
  },
  gradientOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.lg,
  },
  cardContent: {
    padding: SPACING.md,
    height: '100%',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logoContainer: {
    alignItems: 'flex-start',
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoText: {
    ...TEXT_STYLES.bodyLarge,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.light,
  },
  badgeContainer: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.xs,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  badgeText: {
    ...TEXT_STYLES.caption,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.dark,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  name: {
    ...TEXT_STYLES.bodyLarge,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.light,
    marginRight: SPACING.xs,
    flex: 1,
  },
  verifiedIcon: {
    marginLeft: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: SPACING.xs,
  },
  infoContainer: {
    marginTop: SPACING.xs,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  ratingContainer: {
    flex: 1,
  },
  locationContainer: {
    flex: 1,
  },
  categoryContainer: {
    flex: 1,
  },
  ratingLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
  },
  locationLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
  },
  categoryLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
  },
  ratingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...TEXT_STYLES.bodySmall,
    color: COLORS.text.light,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginLeft: 2,
  },
  locationText: {
    ...TEXT_STYLES.bodySmall,
    color: COLORS.text.light,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginLeft: 2,
    flex: 1,
  },
  categoryText: {
    ...TEXT_STYLES.bodySmall,
    color: COLORS.text.light,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginLeft: 2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.xs,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tagText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text.light,
  },
  tagCount: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.xs,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  tagCountText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
  }
});

export default WarehouseCard;
