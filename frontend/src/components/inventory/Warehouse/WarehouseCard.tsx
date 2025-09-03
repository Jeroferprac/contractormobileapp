import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  Dimensions,
} from "react-native";
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Warehouse } from "../../../types/inventory";

const { width: screenWidth } = Dimensions.get('window');

// Fallback images for different warehouse types
const WAREHOUSE_IMAGES = [
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1553413077-190dd305871c?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=400&h=300&fit=crop'
];

interface WarehouseCardProps {
  warehouse: Warehouse & {
    imageUrl?: string;
    totalItems?: number;
    totalQuantity?: number;
    utilization?: number;
    activeItems?: number;
  };
  onPress?: (warehouse: Warehouse) => void;
}

const WarehouseCard: React.FC<WarehouseCardProps> = ({
  warehouse,
  onPress,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.97,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  // Get warehouse image - use random Unsplash image based on warehouse ID
  const getWarehouseImage = (warehouse: Warehouse) => {
    const imageIndex = parseInt(warehouse.id) % WAREHOUSE_IMAGES.length;
    return WAREHOUSE_IMAGES[imageIndex];
  };

  const imageUri = getWarehouseImage(warehouse);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onPress?.(warehouse)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.cardContainer}
      >
        {/* Header Image with Margin - Like AllSalesScreen */}
        <View style={styles.imageContainer}>
          <FastImage
            source={{ uri: imageUri }}
            style={styles.warehouseImage}
            resizeMode={FastImage.resizeMode.cover}
          />
          
          {/* Status Badge Overlay - Top Right */}
          <View style={styles.statusBadge}>
            <Icon 
              name="home" 
              size={14} 
              color="#FFFFFF" 
            />
            <Text style={styles.statusBadgeText}>Active</Text>
            </View>

          {/* Warehouse Name Overlay - Bottom Center (Like SalesDetailsScreen hero) */}
          <View style={styles.warehouseNameOverlay}>
            <Text style={styles.warehouseNameText}>{warehouse.name}</Text>
            <Text style={styles.warehouseSubText}>
              {warehouse.activeItems || 0} Active • {warehouse.totalItems || 0} Items
            </Text>
          </View>
          </View>

        {/* Content Area - White Background */}
        <View style={styles.cardBody}>
          {/* Warehouse Details */}
          <View style={styles.warehouseDetails}>
            <Icon name="location-on" size={16} color="#666" style={styles.detailsIcon} />
            <Text style={styles.detailsText}>
              {warehouse.address ? warehouse.address.split(',')[0] : 'Warehouse Location'}
                </Text>
              </View>

          
          </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 310,
    height: 240,
    borderRadius: 16,
    marginRight: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.2,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4, // Android shadow
  },
  imageContainer: {
    height: 180,
    position: 'relative',
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  warehouseImage: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  warehouseNameOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  warehouseNameText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  warehouseSubText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  cardBody: {
    flex: 1,
    padding: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  warehouseDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsIcon: {
    marginRight: 6,
  },
  detailsText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '700',  
    
  },

});

export default WarehouseCard;
