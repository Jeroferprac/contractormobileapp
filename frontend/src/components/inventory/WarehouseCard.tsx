import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image as RNImage,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { Image } from 'react-native';
import { Warehouse } from '../../types/inventory';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import UnsplashImage from '../../components/ui/UnsplashImage';

const CARD_WIDTH = 340;
const CARD_HEIGHT = 220;
const HEADER_HEIGHT = 110;

interface WarehouseCardProps {
  warehouse: Warehouse;
  onPress?: () => void;
  isLoading?: boolean;
}

const WarehouseCard: React.FC<WarehouseCardProps> = ({ warehouse, onPress, isLoading = false }) => {
  const [hasError, setHasError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const scale = React.useRef(new Animated.Value(1)).current;

  // Unsplash image seeded by id for consistency
  const imageUrl = `https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1400&q=80&auto=format&fit=crop&ixlib=rb-4.0.3&seed=${encodeURIComponent(
    warehouse.id
  )}`;

  // Derive some display values (assumptions to match visual)
  const rating = '4.9';
  const ratingCount = '100';
  const locationShort = warehouse.address ? warehouse.address.split(',')[0] : warehouse.address;
  const category = warehouse.code || 'General';
  
  // Loading skeleton
  if (isLoading) {
    return (
      <View style={styles.wrapper}>
        <LoadingSkeleton height={CARD_HEIGHT} width={CARD_WIDTH} borderRadius={14} />
      </View>
    );
  }
  
  const handlePressIn = () => {
    Animated.timing(scale, { 
      toValue: 0.98, 
      duration: 150, 
      useNativeDriver: true 
    }).start();
  };
  const handlePressOut = () => {
    Animated.timing(scale, { 
      toValue: 1, 
      duration: 150, 
      useNativeDriver: true 
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.wrapper}
      activeOpacity={0.9}
    >
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        {/* Header Image */}
        <View style={styles.headerContainer}>
          <UnsplashImage
            uri={imageUrl}
            style={styles.headerImage}
            resizeMode="cover"
            onLoad={() => setImageLoaded(true)}
            onError={() => setHasError(true)}
            fallbackUri="https://images.unsplash.com/photo-1553413077-190dd305871c?w=400&h=300&fit=crop"
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.0)", "rgba(0,0,0,0.25)"]}
            style={styles.headerGradient}
          />

          {/* Category badge top-left over image */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{category}</Text>
          </View>
            </View>

        {/* Card Body */}
        <View style={styles.body}>
          <View style={styles.titleRow}>
            {/* Avatar overlapping */}
            <View style={styles.avatarWrap}>
              <RNImage
                source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(warehouse.name)}&background=ffffff&color=333333&rounded=true&size=128` }}
                style={styles.avatar}
              />
              <View style={styles.onlineDot} />
          </View>

            <View style={styles.titleTextWrap}>
              <View style={styles.titleRowTop}>
                <Text numberOfLines={1} style={styles.title}>
                  {warehouse.name}
                </Text>
                <View style={styles.verified}> 
                  <Icon name="check" size={12} color="#fff" />
                </View>
              </View>

              <Text numberOfLines={1} style={styles.subtitle}>
                {warehouse.address}
                  </Text>
                </View>
              </View>

          {/* Info chips row */}
          <View style={styles.infoRow}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Location</Text>
              <View style={styles.infoValueRow}>
                <Icon name="map-pin" size={14} color="#6b7280" />
                <Text style={styles.infoValueText}>{locationShort}</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Category</Text>
              <View style={styles.infoValueRow}>
                <Text style={styles.infoValueText}>{category}</Text>
              </View>
            </View>
          </View>

          {/* No tag pills by default (removed unwanted tags) */}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: CARD_WIDTH,
    marginRight: 16,
    marginHorizontal: 8,
    marginVertical: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    // Enhanced border
    borderWidth: 2,
    borderColor: 'rgba(15,23,42,0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  headerContainer: {
    height: HEADER_HEIGHT,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    // ensure top corners match card so image reaches edge with no gaps
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  headerImage: {
    width: '100%',
    height: '100%',
    // round only top corners so the image fills header without white gaps
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    margin: 2,
  },
  headerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 64,
  },
  categoryBadge: {
    position: 'absolute',
    left: 14,
    top: 14,
    backgroundColor: '#FDE68A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    elevation: 2,
    margin: 2,
  },
  categoryBadgeText: {
    color: '#92400E',
    fontWeight: '700',
    fontSize: 12,
  },
  body: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 14,
    marginHorizontal: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 999,
    marginTop: -32,
    marginLeft: 6,
    overflow: 'visible',
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: '#fff',
    margin: 2,
  },
  onlineDot: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: '#16A34A',
    borderWidth: 2,
    borderColor: '#fff',
  },
  titleTextWrap: {
    flex: 1,
    marginLeft: 12,
  },
  titleRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  verified: {
    marginLeft: 8,
    backgroundColor: '#0369A1',
    padding: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    color: '#6B7280',
    marginTop: 4,
    fontSize: 13,
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: 6,
    justifyContent: 'space-between',
    marginHorizontal: 4,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 8,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  infoLabel: {
    color: '#F97316',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  infoValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoValueText: {
    fontWeight: '700',
    color: '#111827',
    marginLeft: 6,
    fontSize: 13,
  },
  infoMuted: {
    color: '#9CA3AF',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 12,
  },
  // tag pills removed — styles cleaned up
});

export default WarehouseCard;