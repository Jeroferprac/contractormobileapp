import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../../constants/spacing';
import { TYPOGRAPHY } from '../../../constants/typography';
import { inventoryApiService } from '../../../api/inventoryApi';
import { Transfer, TransferStatus } from '../../../types/inventory';

const { width: screenWidth } = Dimensions.get('window');

interface RecentTransfersProps {
  onTransferPress?: (transfer: Transfer) => void;
  onSeeAllPress?: () => void;
  navigation?: any; // Add navigation prop
}

const RecentTransfers: React.FC<RecentTransfersProps> = ({ 
  onTransferPress, 
  onSeeAllPress,
  navigation
}) => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [warehouses, setWarehouses] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchTransfers();
  }, []);

  const fetchTransfers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch both transfers and warehouses
      const [transfersResponse, warehousesResponse] = await Promise.all([
        inventoryApiService.getTransfers(),
        inventoryApiService.getWarehouses()
      ]);
      
      // Sort transfers by created_at to get most recent first
      const sortedTransfers = transfersResponse.data.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setTransfers(sortedTransfers);
      
      // Create warehouse ID to name mapping
      const warehouseMap = new Map<string, string>();
      warehousesResponse.data.forEach((warehouse: any) => {
        warehouseMap.set(warehouse.id, warehouse.name);
      });
      setWarehouses(warehouseMap);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load transfer data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: TransferStatus) => {
    switch (status) {
      case 'completed':
        return { bg: 'rgba(52, 199, 89, 0.15)', text: COLORS.status.success };
      case 'pending':
        return { bg: 'rgba(255, 149, 0, 0.15)', text: '#FF9500' };
      case 'in_transit':
        return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3B82F6' };
      case 'cancelled':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: COLORS.status.error };
      default:
        return { bg: 'rgba(156, 163, 175, 0.15)', text: COLORS.text.secondary };
    }
  };

  const getTransferIcon = (status: TransferStatus) => {
    switch (status) {
      case 'completed':
        return 'check-circle';
      case 'pending':
        return 'clock';
      case 'in_transit':
        return 'truck';
      case 'cancelled':
        return 'x-circle';
      default:
        return 'package';
    }
  };

  const getTotalQuantity = (transfer: Transfer) => {
    return transfer.items.reduce((sum, item) => sum + Number(item.quantity), 0);
  };

  const getTransferDirection = (transfer: Transfer) => {
    if (transfer.from_warehouse_id && transfer.to_warehouse_id) {
      return {
        from: warehouses.get(transfer.from_warehouse_id) || 'Unknown',
        to: warehouses.get(transfer.to_warehouse_id) || 'Unknown',
        type: 'transfer'
      };
    } else if (transfer.to_warehouse_id) {
      return {
        from: 'External',
        to: warehouses.get(transfer.to_warehouse_id) || 'Unknown',
        type: 'inbound'
      };
    } else {
      return {
        from: warehouses.get(transfer.from_warehouse_id) || 'Unknown',
        to: 'External',
        type: 'outbound'
      };
    }
  };

  const getTransferName = (transfer: Transfer) => {
    // Use transfer ID to create a readable name
    const shortId = transfer.id.slice(0, 8);
    const direction = getTransferDirection(transfer);
    
    if (direction.type === 'transfer') {
      return `${direction.from} → ${direction.to}`;
    } else if (direction.type === 'inbound') {
      return `Inbound to ${direction.to}`;
    } else {
      return `Outbound from ${direction.from}`;
    }
  };

  const visibleTransfers = transfers.slice(0, 5); // Always show max 5 cards
  
  // Calculate dynamic height based on expanded state
  const containerHeight = isExpanded ? visibleTransfers.length * 80 + 20 : 120;

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <View style={styles.titleContent}>
            <View style={styles.iconContainer}>
              <Icon name="repeat" size={20} color="#8B5CF6" />
            </View>
            <Text style={styles.title}>Recent Transfers</Text>
          </View>
        </View>
        <View style={styles.card}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.loadingText}>Loading transfers...</Text>
          </View>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <View style={styles.titleContent}>
            <View style={styles.iconContainer}>
              <Icon name="repeat" size={20} color="#8B5CF6" />
            </View>
            <Text style={styles.title}>Recent Transfers</Text>
          </View>
        </View>
        <View style={styles.card}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchTransfers}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Title with icon and expand button */}
      <View style={styles.titleContainer}>
        <View style={styles.titleContent}>
          <View style={styles.iconContainer}>
            <Icon name="repeat" size={20} color="#8B5CF6" />
          </View>
          <Text style={styles.title}>Recent Transfers</Text>
        </View>
        
        <View style={styles.titleActions}>
          {transfers.length > 5 && (
            <TouchableOpacity 
              style={styles.expandButton}
              onPress={() => setIsExpanded(!isExpanded)}
            >
              <Text style={styles.expandButtonText}>
                {isExpanded ? 'Collapse' : 'Expand'}
              </Text>
              <Icon 
                name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                size={16} 
                color="#8B5CF6" 
              />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.seeAllButton}
            onPress={() => {
              console.log('🔍 See All button pressed');
              if (onSeeAllPress) {
                onSeeAllPress();
              } else {
                console.log('❌ onSeeAllPress is not defined');
              }
            }}
          >
            <Text style={styles.seeAllButtonText}>See All</Text>
            <Icon name="arrow-right" size={16} color="#8B5CF6" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stacked Cards - Pinterest Style */}
      <View style={[styles.cardsContainer, { height: containerHeight }]}>
          {visibleTransfers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No transfers available</Text>
            </View>
          ) : (
            visibleTransfers.map((transfer, index) => {
              const statusColors = getStatusColor(transfer.status);
              const direction = getTransferDirection(transfer);
              const totalQuantity = getTotalQuantity(transfer);
              const transferName = getTransferName(transfer);
              
              // Calculate opacity and positioning for stacked/expanded effect
              const opacity = isExpanded ? 1 : Math.max(0.15, 1 - (index * 0.25));
              const zIndex = visibleTransfers.length - index;
              const translateY = isExpanded ? index * 80 : index * 6; // Full card height when expanded
              
              return (
                <TouchableOpacity
                  key={transfer.id}
                  style={[
                    styles.transferCard,
                    {
                      opacity,
                      zIndex,
                      transform: [{ translateY }]
                    }
                  ]}
                  onPress={() => onTransferPress && onTransferPress(transfer)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                      <View style={styles.transferInfo}>
                        <View style={styles.transferIconContainer}>
                          <Icon 
                            name={getTransferIcon(transfer.status)} 
                            size={16} 
                            color={statusColors.text} 
                          />
                        </View>
                        <View style={styles.transferDetails}>
                          <Text style={styles.transferName}>
                            {transfer.id.slice(0, 8)}...
                          </Text>
                          <Text style={styles.transferDirection}>
                            {direction.from} → {direction.to}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.rightSection}>
                        <View style={[
                          styles.statusBadge,
                          { backgroundColor: statusColors.bg }
                        ]}>
                          <Text style={[styles.statusText, { color: statusColors.text }]}>
                            {transfer.status.replace('_', ' ')}
                          </Text>
                        </View>
                        <Text style={styles.quantityText}>
                          {totalQuantity} items
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.cardFooter}>
                      <Text style={styles.dateText}>
                        {formatDate(transfer.created_at)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // container: {
  //   marginVertical: SPACING.xs,
  // },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
    width: '100%',
  },
  titleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    color: COLORS.text.primary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  titleActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  expandButtonText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#8B5CF6',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  seeAllButtonText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#8B5CF6',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  cardsContainer: {
    position: 'relative',
    minHeight: 120,
    width: '100%',
  },
  transferCard: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    left: SPACING.lg,
    right: SPACING.lg,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
    width: '100%',
  },
  transferInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transferIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  transferDetails: {
    flex: 1,
  },
  transferName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  transferDirection: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginTop: 1,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.xs,
  },
  statusText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '500',
    textTransform: 'capitalize',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  quantityText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  dateText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  loadingContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  errorContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.status.error,
    marginBottom: SPACING.sm,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  retryButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: '#8B5CF6',
    borderRadius: BORDER_RADIUS.md,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  emptyContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
});

export default RecentTransfers;
