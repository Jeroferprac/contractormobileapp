import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AnimatedCounter from '../../../ui/AnimatedCounter';

const { width: screenWidth } = Dimensions.get('window');

interface WarehouseDetailsProps {
  warehouse: any;
  onEdit?: (warehouse: any) => void;
  onAddStock?: (warehouse: any) => void;
}

const WarehouseDetails: React.FC<WarehouseDetailsProps> = ({ warehouse, onEdit, onAddStock }) => {
  // Animation refs
  const stockLevelAnim = useRef(new Animated.Value(0)).current;
  const binCountAnim = useRef(new Animated.Value(0)).current;
  const activeBinsAnim = useRef(new Animated.Value(0)).current;
  const utilizationAnim = useRef(new Animated.Value(0)).current;

  // Calculate real stock data from API with safe defaults
  const warehouseStocks = warehouse?.warehouseStocks || [];
  const totalQuantity = warehouseStocks.reduce((sum, stock) => {
    const quantity = typeof stock.quantity === 'string' ? parseFloat(stock.quantity || '0') : (stock.quantity || 0);
    return sum + (isNaN(quantity) ? 0 : quantity);
  }, 0);
  const totalReserved = warehouseStocks.reduce((sum, stock) => {
    const reserved = typeof stock.reserved_quantity === 'string' ? parseFloat(stock.reserved_quantity || '0') : (stock.reserved_quantity || 0);
    return sum + (isNaN(reserved) ? 0 : reserved);
  }, 0);
  const totalAvailable = warehouseStocks.reduce((sum, stock) => {
    const available = typeof stock.available_quantity === 'string' ? parseFloat(stock.available_quantity || '0') : (stock.available_quantity || 0);
    return sum + (isNaN(available) ? 0 : available);
  }, 0);
  
  // Calculate capacity and utilization with safe defaults
  const totalBins = warehouse?.binCount || warehouse?.stats?.total_bins || 0;
  const activeBins = warehouse?.activeBins || warehouse?.stats?.active_bins || 0;
  const utilization = warehouse?.utilization || 0;
  const stockLevel = warehouse?.stockLevel || totalQuantity || 0;

  // Ensure all values are valid numbers
  const safeStockLevel = isNaN(stockLevel) ? 0 : Math.max(0, stockLevel);
  const safeTotalBins = isNaN(totalBins) ? 0 : Math.max(0, totalBins);
  const safeActiveBins = isNaN(activeBins) ? 0 : Math.max(0, activeBins);
  const safeUtilization = isNaN(utilization) ? 0 : Math.max(0, Math.min(100, utilization));

  // Calculate fill percentages for rings based on values
  const getStockFillPercentage = (stock: number) => {
    const maxStock = 5000; // Maximum expected stock for better visualization
    return Math.min((stock / maxStock) * 100, 100);
  };

  const getBinFillPercentage = (bins: number) => {
    const maxBins = 10; // Maximum expected bins for better visualization
    return Math.min((bins / maxBins) * 100, 100);
  };

  const stockFillPercentage = getStockFillPercentage(safeStockLevel);
  const binFillPercentage = getBinFillPercentage(safeActiveBins);

  // Animate values on data change
  useEffect(() => {
    Animated.parallel([
      Animated.timing(stockLevelAnim, {
        toValue: stockFillPercentage,
        duration: 1500,
        useNativeDriver: false,
      }),
      Animated.timing(binCountAnim, {
        toValue: safeTotalBins,
        duration: 1500,
        useNativeDriver: false,
      }),
      Animated.timing(activeBinsAnim, {
        toValue: binFillPercentage,
        duration: 1500,
        useNativeDriver: false,
      }),
      Animated.timing(utilizationAnim, {
        toValue: safeUtilization,
        duration: 1500,
        useNativeDriver: false,
      }),
    ]).start();
  }, [stockFillPercentage, safeTotalBins, binFillPercentage, safeUtilization]);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return '#4CAF50'; // Green
    if (percentage >= 60) return '#2196F3'; // Blue
    if (percentage >= 40) return '#FB7504'; // Theme color
    return '#F44336'; // Red
  };

  const progressColor = getProgressColor(safeUtilization);

  // Function to truncate email professionally
  const truncateEmail = (email: string) => {
    if (!email || email === 'N/A') return 'N/A';
    if (email.length <= 30) return email;
    
    const [localPart, domain] = email.split('@');
    if (localPart.length > 20) {
      return `${localPart.substring(0, 17)}...@${domain}`;
    }
    return email;
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Description Section */}
        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionTitle}>Inventory Status</Text>
          <Text style={styles.descriptionText}>
            This warehouse manages {warehouseStocks.length} different stock items with a total capacity of {safeTotalBins} bins. 
            Currently {safeActiveBins} bins are active and the utilization rate is {Math.round(safeUtilization)}%.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => onEdit && onEdit(warehouse)}
          >
            <Icon name="pencil" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.addStockButton]}
            onPress={() => onAddStock && onAddStock(warehouse)}
          >
            <Icon name="plus" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Add Stock</Text>
          </TouchableOpacity>
        </View>

        {/* Small Info Cards Row with Loading Rings */}
        <View style={styles.infoCardsRow}>
          <View style={styles.infoCard}>
            <View style={styles.loadingRing}>
              <View style={styles.ringBackground} />
              <Animated.View 
                style={[
                  styles.ringProgress,
                  {
                    borderColor: '#667eea',
                    transform: [{
                      rotate: stockLevelAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0deg', '360deg'],
                      })
                    }]
                  }
                ]} 
              />
              <View style={styles.ringCenter}>
                <AnimatedCounter 
                  value={Math.round(safeStockLevel)} 
                  style={styles.ringValue}
                  duration={1500}
                />
              </View>
            </View>
            <Text style={styles.infoCardLabel}>Total Stock</Text>
          </View>
          
          <View style={styles.infoCard}>
            <View style={styles.loadingRing}>
              <View style={styles.ringBackground} />
              <Animated.View 
                style={[
                  styles.ringProgress,
                  {
                    borderColor: '#f093fb',
                    transform: [{
                      rotate: utilizationAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0deg', '360deg'],
                      })
                    }]
                  }
                ]} 
              />
              <View style={styles.ringCenter}>
                <AnimatedCounter 
                  value={Math.round(safeUtilization)} 
                  style={styles.ringValue}
                  suffix="%"
                  duration={1500}
                />
              </View>
            </View>
            <Text style={styles.infoCardLabel}>Utilization</Text>
          </View>
          
          <View style={styles.infoCard}>
            <View style={styles.loadingRing}>
              <View style={styles.ringBackground} />
              <Animated.View 
                style={[
                  styles.ringProgress,
                  {
                    borderColor: '#f5576c',
                    transform: [{
                      rotate: activeBinsAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0deg', '360deg'],
                      })
                    }]
                  }
                ]} 
              />
              <View style={styles.ringCenter}>
                <AnimatedCounter 
                  value={safeActiveBins} 
                  style={styles.ringValue}
                  duration={1500}
                />
              </View>
            </View>
            <Text style={styles.infoCardLabel}>Active Bins</Text>
          </View>
        </View>

        {/* Contact Information Cards */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Contact Details</Text>
          
          <View style={styles.contactCardsRow}>
            <View style={styles.contactCard}>
              <View style={styles.contactHeader}>
                <Icon name="account" size={16} color="#667eea" />
                <Text style={styles.contactLabel}>Contact</Text>
              </View>
              <Text style={styles.contactValue} numberOfLines={1}>
                {warehouse?.contact_person || 'N/A'}
              </Text>
            </View>
            
            <View style={styles.contactCard}>
              <View style={styles.contactHeader}>
                <Icon name="phone" size={16} color="#f093fb" />
                <Text style={styles.contactLabel}>Phone</Text>
              </View>
              <Text style={styles.contactValue}>
                {warehouse?.phone || 'N/A'}
              </Text>
            </View>
          </View>
          
          <View style={styles.contactCardsRow}>
            <View style={styles.contactCard}>
              <View style={styles.contactHeader}>
                <Icon name="email" size={16} color="#f5576c" />
                <Text style={styles.contactLabel}>Email</Text>
              </View>
              <Text style={styles.contactValue} numberOfLines={2}>
                {warehouse?.email || 'N/A'}
              </Text>
            </View>
            
            <View style={styles.contactCard}>
              <View style={styles.contactHeader}>
                <Icon name="map-marker" size={16} color="#764ba2" />
                <Text style={styles.contactLabel}>Address</Text>
              </View>
              <Text style={styles.contactValue} numberOfLines={2}>
                {warehouse?.address || 'N/A'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Top Fade Overlay */}
      <LinearGradient
        colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0.8)', 'transparent']}
        locations={[0, 0.3, 1]}
        style={styles.topFadeOverlay}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 8, // Reduced margin for more width
    paddingBottom: 20, // Add padding to prevent text from fading under warehouse card
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40, // Extra padding for fade effect
  },
  topFadeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    zIndex: 1,
  },
  
  // Description Section
  descriptionSection: {
    marginBottom: 15,
    marginTop: 20,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  
  // Action Buttons
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  addStockButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Info Cards Row with Loading Rings
  infoCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingRing: {
    width: 60,
    height: 60,
    position: 'relative',
    marginBottom: 8,
  },
  ringBackground: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: '#E0E0E0',
    position: 'absolute',
  },
  ringProgress: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    position: 'absolute',
  },
  ringCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  infoCardLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  
  // Contact Section
  contactSection: {
    marginBottom: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  contactCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  contactCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  contactLabel: {
    fontSize: 10,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
    textAlign: 'center',
  },
  contactIcon: {
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
});

export default WarehouseDetails;
