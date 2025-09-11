import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Sale } from '../../../types/inventory';
import { SPACING, BORDER_RADIUS } from '../../../constants/spacing';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.85;
const CARD_HEIGHT = 200;
const CARD_OFFSET = 20;

interface SalesListProps {
  sales: Sale[];
  title: string;
  showViewAll?: boolean;
  onViewAll?: () => void;
  onSalePress?: (sale: Sale) => void;
  navigation?: any;
}

const SalesList: React.FC<SalesListProps> = ({
  sales,
  title,
  showViewAll = false,
  onViewAll,
  onSalePress,
  navigation,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#FB7504';
      case 'cancelled':
        return '#F87171';
      case 'pending':
        return '#FBBF24';
      default:
        return '#9CA3AF';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'check-circle';
      case 'cancelled':
        return 'cancel';
      case 'pending':
        return 'schedule';
      default:
        return 'info';
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    const totalCards = Math.min((sales || []).length, 5);
    
    let newIndex;
    if (direction === 'left') {
     
      newIndex = currentIndex === totalCards - 1 ? 0 : currentIndex + 1;
    } else {
      
      newIndex = currentIndex === 0 ? totalCards - 1 : currentIndex - 1;
    }

    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
      
      // Animate the swipe
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: direction === 'left' ? -CARD_WIDTH : CARD_WIDTH,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.9,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Reset animation values
        translateX.setValue(0);
        scale.setValue(1);
        opacity.setValue(1);
      });
    }
  };

  const renderLayeredCard = (sale: Sale, index: number) => {
    const isCurrentCard = index === currentIndex;
    const isNextCard = index === currentIndex + 1;
    const isPrevCard = index === currentIndex - 1;
    
    // Calculate position for layered effect
    let cardStyle = {};
    let cardScale = 1;
    let cardOpacity = 1;
    let cardTranslateX = 0;
    let cardTranslateY = 0;

    if (isCurrentCard) {
      cardStyle = {
        transform: [
          { translateX: translateX },
          { scale: scale },
        ],
        opacity: opacity,
        zIndex: 3,
      };
    } else if (isNextCard) {
      cardScale = 0.9;
      cardOpacity = 0.7;
      cardTranslateX = CARD_OFFSET;
      cardTranslateY = -CARD_OFFSET;
      cardStyle = {
        transform: [
          { translateX: cardTranslateX },
          { translateY: cardTranslateY },
          { scale: cardScale },
        ],
        opacity: cardOpacity,
        zIndex: 2,
      };
    } else if (isPrevCard) {
      cardScale = 0.9;
      cardOpacity = 0.7;
      cardTranslateX = -CARD_OFFSET;
      cardTranslateY = -CARD_OFFSET;
      cardStyle = {
        transform: [
          { translateX: cardTranslateX },
          { translateY: cardTranslateY },
          { scale: cardScale },
        ],
        opacity: cardOpacity,
        zIndex: 2,
      };
    } else {
      cardScale = 0.8;
      cardOpacity = 0.4;
      cardTranslateY = -CARD_OFFSET * 2;
      cardStyle = {
        transform: [
          { translateY: cardTranslateY },
          { scale: cardScale },
        ],
        opacity: cardOpacity,
        zIndex: 1,
      };
    }

    return (
      <Animated.View
        key={sale.id}
        style={[
          styles.layeredCard,
          cardStyle,
        ]}
      >
        <TouchableOpacity
          style={styles.cardTouchable}
          onPress={() => {
            if (onSalePress) {
              onSalePress(sale);
            } else if (navigation) {
              navigation.navigate('SalesDetails', { saleId: sale.id });
            }
          }}
          activeOpacity={0.9}
        >
          <View style={styles.cardContent}>
            {/* Header Section */}
            <View style={styles.cardHeader}>
              <View style={styles.saleInfo}>
                <Text style={styles.saleNumber}>{sale.sale_number}</Text>
                <Text style={styles.customerName}>{sale.customer_name}</Text>
              </View>
              <View style={styles.amountContainer}>
                <Text style={styles.amountText}>{formatCurrency(sale.total_amount)}</Text>
              </View>
            </View>

            {/* Middle Section */}
            <View style={styles.cardMiddle}>
              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Icon name="event" size={16} color="#6B7280" />
                  <Text style={styles.detailText}>{formatDate(sale.sale_date)}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Icon name="payment" size={16} color="#6B7280" />
                  <Text style={styles.detailText}>{sale.payment_status}</Text>
                </View>
              </View>
            </View>

            {/* Footer Section */}
            <View style={styles.cardFooter}>
              <View style={styles.statusContainer}>
                <Icon 
                  name={getStatusIcon(sale.status)} 
                  size={16} 
                  color={getStatusColor(sale.status)} 
                />
                <Text style={[styles.statusText, { color: getStatusColor(sale.status) }]}>
                  {sale.status}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>Latest sales and orders</Text>
        </View>
        {showViewAll && (
          <TouchableOpacity 
            style={styles.viewAllButton} 
            onPress={onViewAll} 
            activeOpacity={0.8}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <Icon name="chevron-right" size={16} color="#FB7504" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.layeredContainer}>
        {(sales || []).length > 0 ? (
          <>
            {/* Layered Cards */}
            <View style={styles.cardsStack}>
              {(sales || []).slice(0, 5).map((sale, index) => 
                renderLayeredCard(sale, index)
              )}
            </View>

            {/* Navigation Dots */}
            <View style={styles.navigationDots}>
              {(sales || []).slice(0, 5).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentIndex && styles.activeDot,
                  ]}
                />
              ))}
            </View>

            {/* Swipe Instructions */}
            <View style={styles.swipeInstructions}>
              <TouchableOpacity 
                style={styles.swipeButton} 
                onPress={() => handleSwipe('right')}
                activeOpacity={0.7}
              >
                <Icon name="chevron-left" size={24} color="#FB7504" />
              </TouchableOpacity>
              
              <Text style={styles.swipeText}>
                {currentIndex + 1} of {Math.min((sales || []).length, 5)}
              </Text>
              
              <TouchableOpacity 
                style={styles.swipeButton} 
                onPress={() => handleSwipe('left')}
                activeOpacity={0.7}
              >
                <Icon name="chevron-right" size={24} color="#FB7504" />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Icon name="receipt" size={48} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyText}>No sales data available</Text>
            <Text style={styles.emptySubtext}>Your recent sales will appear here</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '400',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#F8F9FA',
  },
  viewAllText: {
    fontSize: 12,
    color: '#FB7504',
    marginRight: SPACING.xs,
    fontWeight: '600',
  },
  layeredContainer: {
    alignItems: 'center',
    height: CARD_HEIGHT + 100, // Extra space for navigation
  },
  cardsStack: {
    position: 'relative',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  layeredCard: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  cardTouchable: {
    flex: 1,
  },
  cardContent: {
    flex: 1,
    padding: SPACING.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  saleInfo: {
    flex: 1,
  },
  saleNumber: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  customerName: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    color: '#FB7504',
    fontWeight: '700',
  },
  cardMiddle: {
    marginBottom: SPACING.md,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  detailText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  navigationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  activeDot: {
    backgroundColor: '#FB7504',
    width: 24,
  },
  swipeInstructions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    width: CARD_WIDTH,
  },
  swipeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.lg,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
    textAlign: 'center',
  },
});

export default SalesList;
