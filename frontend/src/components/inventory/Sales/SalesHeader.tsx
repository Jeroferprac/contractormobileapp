import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SPACING, BORDER_RADIUS } from '../../../constants/spacing';
import AnimatedCounter from '../../ui/AnimatedCounter';
import { useAuth } from '../../../context/AuthContext';
import Svg, { Path, Circle, Rect, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

interface SalesHeaderProps {
  onPlaceOrder: () => void;
  onBackPress?: () => void;
  totalSales?: number;
  totalRevenue?: number;
  salesThisMonth?: number;
  lastSaleDate?: string;
}

const SalesHeader: React.FC<SalesHeaderProps> = ({
  onPlaceOrder,
  onBackPress,
  totalSales = 0,
  totalRevenue = 0,
  salesThisMonth = 0,
  lastSaleDate,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const formatCurrency = (amount: number) => {
    if (isNaN(amount) || amount === null || amount === undefined) {
      return '$0';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No recent sales';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getFallbackAvatar = () => {
    const youngManAvatars = [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    ];
    return youngManAvatars[Math.floor(Math.random() * youngManAvatars.length)];
  };

  const getDisplayName = () => {
    if (user?.full_name) {
      return user.full_name.split(' ')[0]; 
    }
    return 'User';
  };

  const getAvatarSource = () => {
    if (user?.avatar_data) {
      return { uri: `data:${user.avatar_mimetype};base64,${user.avatar_data}` };
    }
    return { uri: getFallbackAvatar() };
  };

  const getSafeNumber = (value: number | undefined | null) => {
    return isNaN(value as number) || value === null || value === undefined ? 0 : value;
  };

  return (
    <View style={styles.container}>
      {/* Top Navigation Bar with Theme Color Background and SVG Pattern */}
      <View style={styles.navigationBackground}>
        <Svg style={styles.headerSvg} width="100%" height="100%">
          <Defs>
            <SvgGradient id="headerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#FB7504" />
              <Stop offset="100%" stopColor="#C2252C" />
            </SvgGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#headerGradient)" />
          {/* SVG Pattern for background */}
          <Path
            d="M0 0 L100 0 L100 20 Q50 40 0 20 Z"
            fill="rgba(255, 255, 255, 0.1)"
          />
          <Path
            d="M0 60 L100 60 L100 80 Q50 100 0 80 Z"
            fill="rgba(255, 255, 255, 0.05)"
          />
        </Svg>
        
        <View style={styles.navigationContent}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.navigationBar}>
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={onBackPress}
                activeOpacity={0.7}
              >
                <Icon name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.titleContainer}>
                <Text style={styles.screenTitle}>Sales Dashboard</Text>
              </View>
              
            </View>
          </SafeAreaView>
        </View>
      </View>

      {/* Welcome Banner with Pure White Background - Overlaps Header */}
      <View style={styles.welcomeBanner}>
        <View style={styles.welcomeContent}>
          <View style={styles.welcomeText}>
            <Text style={styles.welcomeTitle}>Welcome, {getDisplayName()}</Text>
            <Text style={styles.welcomeSubtitle}>Your sales are growing!</Text>
          </View>
          <FastImage
            source={getAvatarSource()}
            style={styles.avatar}
            resizeMode={FastImage.resizeMode.cover}
          />
        </View>

        <View style={styles.salesOverview}>
          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>Total Revenue</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.amountValue}>
                {isVisible && <AnimatedCounter 
                  value={getSafeNumber(totalRevenue)} 
                  prefix="$"
                  duration={2000}
                />}
              </Text>
            </View>
          </View>

          <View style={styles.miniChartSection}>
            <Svg width={60} height={40}>
              <Path
                d="M10 30 L20 20 L30 25 L40 15 L50 20"
                stroke="#FB7504"
                strokeWidth={2}
                fill="none"
              />
              <Circle cx={10} cy={30} r={2} fill="#FB7504" />
              <Circle cx={20} cy={20} r={2} fill="#FB7504" />
              <Circle cx={30} cy={25} r={2} fill="#FB7504" />
              <Circle cx={40} cy={15} r={2} fill="#FB7504" />
              <Circle cx={50} cy={20} r={2} fill="#FB7504" />
            </Svg>
            <Text style={styles.trendText}>+12%</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Icon name="trending-up" size={16} color="#FB7504" />
              <Text style={styles.statNumber}>
                {isVisible && <AnimatedCounter 
                  value={getSafeNumber(salesThisMonth)} 
                  duration={1500}
                />}
              </Text>
              <Text style={styles.statLabel}>Sales this month</Text>
            </View>
          </View>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Icon name="event" size={16} color="#FB7504" />
              <Text style={styles.statDate}>{formatDate(lastSaleDate)}</Text>
              <Text style={styles.statLabel}>Last sale</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Stylish Offers Banner */}
      <View style={styles.offersBanner}>
        <FastImage
          source={{ uri: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop' }}
          style={styles.offersBackground}
          resizeMode={FastImage.resizeMode.cover}
        />
        <LinearGradient
          colors={['rgba(102, 126, 234, 0.9)', 'rgba(118, 75, 162, 0.9)']}
          style={styles.offersOverlay}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.offersContent}>
            <View style={styles.offersText}>
              <View style={styles.offersHeader}>
                <Icon name="local-offer" size={20} color="#FFFFFF" />
                <Text style={styles.offersTitle}>Special Offer!</Text>
              </View>
              <Text style={styles.offersSubtitle}>Get 15% off on orders above $500</Text>
            </View>
            <TouchableOpacity 
              style={styles.placeOrderButton}
              onPress={onPlaceOrder}
              activeOpacity={0.8}
            >
              <Icon name="add-shopping-cart" size={18} color="#FFFFFF" />
              <Text style={styles.placeOrderText}>Place Order</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  navigationBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140, // Increased height from 140 to 160
    zIndex: 1000,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  headerSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  safeArea: {
    backgroundColor: 'transparent',
    height: '100%',
  },
  navigationContent: {
    position: 'relative',
    zIndex: 1003, // Higher than welcome banner
    height: '100%',
  },
  navigationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: 'transparent',
    marginTop: -15, // Reduced from 5 to 0 to move even higher
    height: 60,
    zIndex: 1002, // Ensure it's above everything
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 15,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    zIndex: 15,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
 
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  welcomeBanner: {
    marginHorizontal: SPACING.lg,
    marginTop: 100, // Increased to account for taller theme color background
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
    zIndex: 1001, // Higher than header
    padding: SPACING.xl, // Added padding for pure white background
  },
  welcomeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  welcomeText: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212529',
    marginBottom: SPACING.xs,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6C757D',
    fontWeight: '400',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: 'rgba(255, 107, 53, 0.3)',
  },
  salesOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: SPACING.lg,
  },
  amountSection: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#212529',
  },
  miniChartSection: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderRadius: 16,
    padding: SPACING.sm,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FB7504',
    marginTop: SPACING.xs,
  },
  statsContainer: {
    gap: SPACING.md, // Add gap between stat rows
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
  },
  statDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  statLabel: {
    fontSize: 12,
    color: '#6C757D',
    marginLeft: SPACING.xs,
  },
  offersBanner: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  offersBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  offersOverlay: {
    padding: SPACING.lg,
  },
  offersContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  offersText: {
    flex: 1,
  },
  offersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  offersTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  offersSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  placeOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 16,
    gap: SPACING.xs,
  },
  placeOrderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default SalesHeader;
