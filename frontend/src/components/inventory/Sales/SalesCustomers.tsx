import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { TopCustomer } from '../../../types/inventory';
import { SPACING, BORDER_RADIUS } from '../../../constants/spacing';

interface SalesCustomersProps {
  customers: TopCustomer[];
}

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth * 0.65; 
const cardSpacing = SPACING.lg;

const SalesCustomers: React.FC<SalesCustomersProps> = ({ customers }) => {
  useEffect(() => {
    console.log('🔄 SalesCustomers: Received customers:', customers?.length || 0);
  }, [customers]);

  const getCustomerPhoto = (index: number) => {
    const photos = [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    ];
    return photos[index % photos.length];
  };

  const getCustomerType = (index: number) => {
    const types = [
      'Premium Customer',
      'VIP Client',
      'Gold Member',
      'Enterprise Client',
      'Loyal Customer',
    ];
    return types[index % types.length];
  };

  const renderGlassmorphismOverlay = (customerName: string, customerType: string, photoIndex: number) => {
    return (
      <View style={styles.glassmorphismOverlay}>
        <View style={styles.overlayContent}>
          <View style={styles.customerInfo}>
            <FastImage 
              source={{ uri: getCustomerPhoto(photoIndex) }} 
              style={styles.customerAvatar}
              onError={() => console.log(`Failed to load avatar for customer ${photoIndex}`)}
            />
            <View style={styles.customerText}>
              <Text style={styles.customerName}>{customerName}</Text>
              <Text style={styles.customerType}>{customerType}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderCustomerCard = (customer: TopCustomer, index: number) => {
    const photo = getCustomerPhoto(index);
    const customerType = getCustomerType(index);

    return (
      <View key={`${customer.customer_id}-${index}`} style={styles.cardContainer}>
        <View style={styles.customerCard}>
          {/* Customer Photo Section */}
          <View style={styles.photoSection}>
            <FastImage 
              source={{ uri: photo }} 
              style={styles.customerPhoto}
              onError={() => console.log(`Failed to load photo for customer ${index}`)}
            />
            
            {/* Rating Badge (Left) */}
            <View style={styles.ratingBadge}>
              <Icon name="star" size={12} color="#FFD700" />
              <Text style={styles.ratingText}>4.9</Text>
            </View>

            {/* Verified Professional Badge (Right) */}
            <View style={styles.verifiedBadge}>
              <Icon name="verified" size={12} color="#007BFF" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>

            {/* Bottom Black Faded Gradient */}
            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)']}
              style={styles.bottomGradient}
            />

            {/* Glassmorphism Overlay at Bottom */}
            <View style={styles.overlayContainer}>
              {renderGlassmorphismOverlay(customer.customer_name, customerType, index)}
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Debug: Check if we have customers
  if (!customers || customers.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Top Customers</Text>
            <Text style={styles.subtitle}>Your highest revenue contributors</Text>
          </View>
          <TouchableOpacity style={styles.viewAllButton} activeOpacity={0.7}>
            <Text style={styles.viewAllText}>View All</Text>
            <Icon name="chevron-right" size={16} color="#FF6B35" />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No customer data available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Top Customers</Text>
          <Text style={styles.subtitle}>Your highest revenue contributors</Text>
        </View>
        <TouchableOpacity style={styles.viewAllButton} activeOpacity={0.7}>
          <Text style={styles.viewAllText}>View All</Text>
          <Icon name="chevron-right" size={16} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      <View style={styles.scrollContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {customers.slice(0, 5).map((customer, index) => 
            renderCustomerCard(customer, index)
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginHorizontal: SPACING.lg,
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
    color: '#FF6B35',
    marginRight: SPACING.xs,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6C757D',
    fontWeight: '500',
  },
  scrollContainer: {
    marginBottom: SPACING.md,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md, // Add bottom padding to prevent overflow
  },
  cardContainer: {
    marginRight: cardSpacing,
  },
  customerCard: {
    width: cardWidth,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  photoSection: {
    position: 'relative',
    height: 200, // Reduced height
    backgroundColor: '#E9ECEF', // Fallback background color
  },
  customerPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  ratingBadge: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#212529',
  },
  verifiedBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#212529',
  },
  bottomGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
  },
  overlayContainer: {
    position: 'absolute',
    bottom: SPACING.sm, // Add margin from bottom
    left: SPACING.sm, // Add margin from left
    right: SPACING.sm, // Add margin from right
    height: 80,
  },
  glassmorphismOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16, // Full border radius for card-like appearance
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  overlayContent: {
    padding: SPACING.lg, // Increased padding for better spacing
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: SPACING.sm,
  },
  customerText: {
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 2,
  },
  customerType: {
    fontSize: 11,
    color: '#6C757D',
    fontWeight: '500',
  },
});

export default SalesCustomers;
