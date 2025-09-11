import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Feather';
import Svg, { Circle, Rect, Path } from 'react-native-svg';
import { COLORS } from '../../../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../../../constants/spacing';
import { TYPOGRAPHY } from '../../../../constants/typography';
import { Warehouse } from '../../../../types/inventory';

// Enhanced warehouse interface with API data
interface WarehouseWithDetails extends Warehouse {
  imageUrl?: string;
  stockLevel?: number;
  capacity?: number;
  utilization?: number;
  binCount?: number;
  activeBins?: number;
  stats?: any;
}

interface WarehouseCardProps {
  warehouse: WarehouseWithDetails;
  index: number;
  scrollX: any;
  onPress?: (warehouse: WarehouseWithDetails) => void;
  onEdit?: (warehouse: Warehouse) => void;
}

const WarehouseCard: React.FC<WarehouseCardProps> = ({
  warehouse,
  index,
  scrollX,
  onPress,
  onEdit,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const getCardStyle = () => {
    const cardWidth = 320;
    const cardSpacing = 24;
    const totalCardWidth = cardWidth + cardSpacing;
    
    const inputRange = [
      (index - 1) * totalCardWidth,
      index * totalCardWidth,
      (index + 1) * totalCardWidth,
    ];

    // opacity transition: center card = 100%, others = 50%
    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.5, 1, 0.5],
      extrapolate: 'clamp',
    });

    // Enhanced scale effect: center card = 100%, others = 90%
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: 'clamp',
    });

    return {
      transform: [{ scale }],
      opacity,
    };
  };

  const handlePressIn = () => {
    // Scale animation on press
    scaleAnim.setValue(0.97);
  };

  const handlePressOut = () => {
    // Reset scale on release
    scaleAnim.setValue(1);
  };

  const handlePress = () => {
    if (onPress) {
      onPress(warehouse);
    }
  };

  // Generate fallback gradient colors based on warehouse name
  const getFallbackGradient = () => {
    const gradients = [
      ['#FB7504', '#C2252C', '#FFB366', '#FFD700', '#FF6B9D', '#8B5CF6'],
      ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'],
      ['#fa709a', '#fee140', '#ff9a9e', '#fecfef', '#fecfef', '#fad0c4'],
      ['#a8edea', '#fed6e3', '#ffecd2', '#fcb69f', '#ff9a9e', '#fecfef'],
      ['#ff9a9e', '#fecfef', '#fecfef', '#fad0c4', '#ffd1ff', '#c471f5'],
      ['#4facfe', '#00f2fe', '#43e97b', '#38f9d7', '#fa709a', '#fee140'],
    ];
    
    // Use warehouse name to determine gradient
    const nameHash = warehouse.name.charCodeAt(0) + warehouse.name.charCodeAt(warehouse.name.length - 1);
    return gradients[nameHash % gradients.length];
  };

  // Generate SVG icon based on warehouse name
  const getFallbackIcon = () => {
    const icons = ['star', 'heart', 'circle', 'rectangle'];
    const nameHash = warehouse.name.charCodeAt(0) + warehouse.name.charCodeAt(warehouse.name.length - 1);
    const iconType = icons[nameHash % icons.length];
    
    switch (iconType) {
      case 'star':
        return (
          <Svg width="120" height="120" viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              fill="rgba(255, 255, 255, 0.3)"
              stroke="rgba(255, 255, 255, 0.5)"
              strokeWidth="0.5"
            />
          </Svg>
        );
      case 'heart':
        return (
          <Svg width="120" height="120" viewBox="0 0 24 24" fill="none">
            <Path
              d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.5487 7.04097 1.5487 8.5C1.5487 9.95903 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7564 11.2728 22.0329 10.6054C22.3095 9.93789 22.4518 9.22249 22.4518 8.5C22.4518 7.77751 22.3095 7.0621 22.0329 6.39464C21.7564 5.72718 21.351 5.12075 20.84 4.61Z"
              fill="rgba(255, 255, 255, 0.3)"
              stroke="rgba(255, 255, 255, 0.5)"
              strokeWidth="0.5"
            />
          </Svg>
        );
      case 'circle':
        return (
          <Svg width="120" height="120" viewBox="0 0 24 24" fill="none">
            <Circle
              cx="12"
              cy="12"
              r="8"
              fill="rgba(255, 255, 255, 0.3)"
              stroke="rgba(255, 255, 255, 0.5)"
              strokeWidth="0.5"
            />
          </Svg>
        );
      case 'rectangle':
        return (
          <Svg width="120" height="120" viewBox="0 0 24 24" fill="none">
            <Rect
              x="3"
              y="3"
              width="18"
              height="18"
              rx="2"
              fill="rgba(255, 255, 255, 0.3)"
              stroke="rgba(255, 255, 255, 0.5)"
              strokeWidth="0.5"
            />
          </Svg>
        );
      default:
        return null;
    }
  };

  return (
    <Animated.View style={[styles.cardContainer, getCardStyle()]}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {warehouse.imageUrl ? (
          <FastImage
            source={{ uri: warehouse.imageUrl }}
            style={styles.cardImage}
            resizeMode={FastImage.resizeMode.cover}
          />
        ) : (
          <View style={styles.fallbackContainer}>
            <LinearGradient
              colors={getFallbackGradient()}
              style={styles.fallbackGradient}
            >
              <View style={styles.fallbackIconContainer}>
                {getFallbackIcon()}
              </View>
            </LinearGradient>
          </View>
        )}
        
        {/* Action buttons overlay */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onEdit && onEdit(warehouse)}
          >
            <Icon name="edit-2" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        {/* Dynamic gradient overlay - theme color for main card, black for others */}
        <LinearGradient
          colors={[
            'transparent',
            'rgba(0,0,0,0.7)',
            'rgba(0,0,0,0.9)'
          ]}
          locations={[0, 0.6, 1]}
          style={styles.gradientOverlay}
        />
        
                 {/* Theme color overlay for main card only - reduced intensity */}
         <Animated.View
           style={[
             styles.themeColorOverlay,
             {
               opacity: scrollX.interpolate({
                 inputRange: [
                   (index - 1) * 344,
                   index * 344,
                   (index + 1) * 344,
                 ],
                 outputRange: [0, 1, 0],
                 extrapolate: 'clamp',
               }),
             },
           ]}
         >
           <LinearGradient
             colors={[
               'transparent',
               'rgba(251, 117, 4, 0.1)',
               'rgba(251, 117, 4, 0.3)',
               'rgba(251, 117, 4, 0.5)',
             ]}
             locations={[0, 0.4, 0.7, 0.9]}
             style={styles.themeColorGradient}
           />
         </Animated.View>
        
                  {/* Premium warehouse content */}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
                             <View style={styles.warehouseInfo}>
                 <View style={styles.nameContainer}>
                   <Icon name="home" size={20} color="#FFFFFF" style={styles.nameIcon} />
                   <Text style={styles.warehouseName} numberOfLines={1}>
                     {warehouse.name.toUpperCase()}
            </Text>
                 </View>
                 <View style={styles.codeContainer}>
                   <Icon name="hash" size={14} color="rgba(255, 255, 255, 0.8)" style={styles.codeIcon} />
                   <Text style={styles.warehouseCode}>{warehouse.code}</Text>
                 </View>
               </View>
              
              <View style={styles.rightSection}>
            {warehouse.is_active && (
              <View style={styles.activeBadge}>
                <Icon name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.activeText}>Active</Text>
              </View>
            )}
                
                {/* Stock level indicator */}
                <View style={styles.stockLevelContainer}>
                  <Icon name="trending-up" size={20} color="#FB7504" />
                  <Text style={styles.stockLevelText}>
                    {warehouse.utilization || 0}%
                  </Text>
                </View>
              </View>
          </View>
          
            {/* Bottom stats */}
            <View style={styles.bottomStats}>
            <View style={styles.statItem}>
                <Icon name="box" size={14} color="#FFFFFF" />
              <Text style={styles.statText}>{(warehouse.binCount || 0).toString()} Bins</Text>
            </View>
            <View style={styles.statItem}>
                <Icon name="activity" size={14} color="#FFFFFF" />
                <Text style={styles.statText}>{(warehouse.activeBins || 0).toString()} Active</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 320,
    height: 240,
    marginRight: SPACING.lg,
    marginBottom: SPACING.xs,
    overflow: 'visible',
  },
  card: {
    flex: 1,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.lg,
    elevation: 8,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  fallbackContainer: {
    width: '100%',
    height: '100%',
  },
  fallbackGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.xs,
    zIndex: 10,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  themeColorOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  themeColorGradient: {
    flex: 1,
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  warehouseInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  nameIcon: {
    marginRight: SPACING.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  warehouseName: {
    fontSize: TYPOGRAPHY.sizes.xxxl,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 1.2,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeIcon: {
    marginRight: SPACING.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
  },
  warehouseCode: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
    letterSpacing: 1.5,
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: SPACING.sm,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.25)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  activeText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#4CAF50',
    fontWeight: '700',
    marginLeft: SPACING.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  stockLevelContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.3)',
  },
  stockLevelText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#FB7504',
    fontWeight: '700',
    marginTop: SPACING.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  bottomStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#FFFFFF',
    marginLeft: SPACING.xs,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
});

export default WarehouseCard;
