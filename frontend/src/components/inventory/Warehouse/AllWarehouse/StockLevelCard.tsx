import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../../../constants/spacing';
import { TYPOGRAPHY } from '../../../../constants/typography';
import { Stock } from '../../../../types/inventory';

interface StockLevelCardProps {
  warehouse: {
    id?: string;
    name?: string;
    code?: string;
    address?: string;
    phone?: string;
    email?: string;
    contact_person?: string;
    utilization?: number;
    stockLevel?: number;
    capacity?: number;
    binCount?: number;
    activeBins?: number;
    stats?: any;
    warehouseStocks?: Stock[];
  };
  onBinManagementPress?: () => void;
}

const StockLevelCard: React.FC<StockLevelCardProps> = ({
  warehouse,
  onBinManagementPress,
}) => {
  // Calculate real stock data from API
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
  
  // Calculate capacity based on total bins or use a default
  const totalBins = warehouse?.binCount || warehouse?.stats?.total_bins || 10;
  const capacityPerBin = 100; // Assume 100 units per bin
  const targetCapacity = totalBins * capacityPerBin;
  
  // Calculate utilization percentage based on stock level vs capacity
  const utilizationPercentage = targetCapacity > 0 ? Math.round((totalQuantity / targetCapacity) * 100) : 0;
  
  // Ensure percentage doesn't exceed 100%
  const displayPercentage = Math.min(utilizationPercentage, 100);

  // Get progress color based on stock level (4-color system)
  const getProgressColor = () => {
    if (displayPercentage >= 90) {
      return '#4CAF50'; // Green - Excellent
    } else if (displayPercentage >= 75) {
      return '#2196F3'; // Blue - Good
    } else if (displayPercentage >= 50) {
      return '#FB7504'; // Theme color - Moderate
    } else {
      return '#F44336'; // Red - Low
    }
  };

  // Get motivational text based on utilization
  const getMotivationalText = () => {
    if (displayPercentage >= 90) {
      return { main: "Stock Level", highlight: "Excellent", message: "Maximum efficiency achieved" };
    } else if (displayPercentage >= 75) {
      return { main: "Stock Level", highlight: "Good", message: "Keep up the good work" };
    } else if (displayPercentage >= 50) {
      return { main: "Stock Level", highlight: "Moderate", message: "Room for improvement" };
    } else {
      return { main: "Stock Level", highlight: "Low", message: "Consider restocking" };
    }
  };

  const motivational = getMotivationalText();
  const progressColor = getProgressColor();

  return (
    <View style={styles.card}>
      {/* Stock Level Section */}
      <View style={styles.stockLevelSection}>
        <View style={styles.stockLevelHeader}>
          <View style={styles.titleContainer}>
            <Icon name="trending-up" size={20} color={progressColor} />
            <Text style={styles.sectionTitle}>Stock Level</Text>
        </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Active</Text>
      </View>
        </View>
        
        <View style={styles.stockLevelContent}>
          {/* Left side - Circular Progress */}
          <View style={styles.progressSection}>
          <View style={styles.progressRing}>
              {/* Background track */}
              <View style={styles.progressBackground} />
              {/* Progress fill */}
            <View style={[styles.progressFill, { 
                borderColor: progressColor,
                transform: [{ rotate: `${(displayPercentage * 3.6) - 90}deg` }] 
            }]} />
              {/* Center circle */}
              <View style={styles.progressCenter}>
                <Text style={styles.percentageText}>{displayPercentage}%</Text>
              </View>
            </View>
          </View>

          {/* Right side - Text Content */}
          <View style={styles.textSection}>
            <View style={styles.mainText}>
              <Text style={styles.mainTextLine}>{motivational.main}</Text>
              <Text style={[styles.highlightText, { color: progressColor }]}>{motivational.highlight}</Text>
            </View>
            
            <Text style={styles.messageText}>{motivational.message}</Text>
            
            {/* Stock Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Icon name="package" size={14} color="#4CAF50" />
                <Text style={styles.statText}>{Math.round(totalAvailable)}</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="lock" size={14} color="#FB7504" />
                <Text style={styles.statText}>{Math.round(totalReserved)}</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="box" size={14} color="#2196F3" />
                <Text style={styles.statText}>{warehouseStocks.length}/{totalBins}</Text>
          </View>
          </View>
          </View>
        </View>
      </View>

      {/* Warehouse Details Section */}
      <View style={styles.warehouseDetailsSection}>
        <View style={styles.warehouseHeader}>
          <View style={styles.warehouseInfo}>
            <Text style={styles.warehouseName}>{warehouse?.name || 'Select Warehouse'}</Text>
            <Text style={styles.warehouseCode}>{warehouse?.code || 'WH-000'}</Text>
          </View>
          <View style={styles.warehouseStats}>
            <View style={styles.statCard}>
              <Icon name="box" size={16} color="#4CAF50" />
              <Text style={styles.statValue}>{totalBins}</Text>
              <Text style={styles.statLabel}>Total Bins</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="activity" size={16} color="#FB7504" />
              <Text style={styles.statValue}>{warehouse?.activeBins || 0}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="trending-up" size={16} color="#2196F3" />
              <Text style={styles.statValue}>{warehouse?.utilization || 0}%</Text>
              <Text style={styles.statLabel}>Utilization</Text>
            </View>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.contactSection}>
          <View style={styles.contactRow}>
            <View style={styles.contactItem}>
              <Icon name="map-pin" size={14} color="#FB7504" />
              <Text style={styles.contactText} numberOfLines={1}>
                {warehouse?.address || 'No address provided'}
              </Text>
            </View>
          </View>
          
          <View style={styles.contactRow}>
            <View style={styles.contactItem}>
              <Icon name="user" size={14} color="#4CAF50" />
              <Text style={styles.contactText}>
                {warehouse?.contact_person || 'Not specified'}
              </Text>
            </View>
            
            <View style={styles.contactItem}>
              <Icon name="phone" size={14} color="#2196F3" />
              <Text style={styles.contactText}>
                {warehouse?.phone || 'Not provided'}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.binManagementButton} onPress={onBinManagementPress}>
            <Icon name="map" size={16} color="#FFFFFF" />
            <Text style={styles.buttonText}>Bin Management</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.viewDetailsButton}>
            <Icon name="arrow-right" size={16} color="#FB7504" />
            <Text style={styles.viewDetailsText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.md,
    ...SHADOWS.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
  },
  stockLevelSection: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  stockLevelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  statusBadge: {
    backgroundColor: '#10B981',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stockLevelContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  progressBackground: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 5,
    borderColor: '#E9ECEF',
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  progressFill: {
    position: 'absolute',
    top: -2.5,
    left: -2.5,
    width: 85,
    height: 85,
    borderRadius: 42.5,
    borderWidth: 5,
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  progressCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    ...SHADOWS.sm,
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.text.primary,
    letterSpacing: -0.5,
  },
  textSection: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
  },
  mainText: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  mainTextLine: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  highlightText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    marginLeft: SPACING.xs,
  },
  messageText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: SPACING.xs,
  },
  warehouseDetailsSection: {
    padding: SPACING.lg,
  },
  warehouseHeader: {
    marginBottom: SPACING.md,
  },
  warehouseInfo: {
    marginBottom: SPACING.sm,
  },
  warehouseName: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  warehouseCode: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  warehouseStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginTop: 2,
    textAlign: 'center',
  },
  contactSection: {
    marginBottom: SPACING.md,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.primary,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  binManagementButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FB7504',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  viewDetailsText: {
    color: '#FB7504',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
});

export default StockLevelCard;
