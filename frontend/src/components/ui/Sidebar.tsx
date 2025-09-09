import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated, Dimensions, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { BORDER_RADIUS } from '../../constants/spacing';

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
}

const MenuItem: React.FC<{
  id: string;
  label: string;
  icon: string;
  onPress: () => void;
}> = ({ id, label, icon, onPress }) => {
  const [isHovered, setIsHovered] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handleHoverIn = () => {
    setIsHovered(true);
    Animated.timing(scaleAnim, {
      toValue: 1.03,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };
  
  const handleHoverOut = () => {
    setIsHovered(false);
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };
  
  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        style={[styles.menuItem, isHovered && styles.menuItemHovered]}
        onPress={onPress}
        onPressIn={handleHoverIn}
        onPressOut={handleHoverOut}
      >
        <Icon name={icon as any} size={20} color="#FFFFFF" />
        <Text style={styles.menuText}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ visible, onClose, onNavigate }) => {
  // Animation values
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get('window').width;
  
  useEffect(() => {
    if (visible) {
      // Start animations when sidebar becomes visible
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Animate out when closing
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -300,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid', screen: 'Dashboard' },
    { id: 'products', label: 'Products', icon: 'box', screen: 'AllProducts' },
    { id: 'warehouse', label: 'Warehouse', icon: 'home', screen: 'Warehouse' },
    { id: 'sales', label: 'Sales', icon: 'trending-up', screen: 'Sales' },
    { id: 'purchaseorders', label: 'Purchase Orders', icon: 'shopping-cart', screen: 'PurchaseOrders' },
    { id: 'report', label: 'Report', icon: 'bar-chart-2', screen: 'Report' },
  ];

  const handleMenuItemPress = (screen: string) => {
    onNavigate(screen);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        
        <Animated.View 
          style={[
            styles.sidebar,
            { transform: [{ translateX: slideAnim }] }
          ]}>
          <LinearGradient 
            colors={['#121212', '#1A1A1A']} 
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              borderTopRightRadius: BORDER_RADIUS.lg,
              borderBottomRightRadius: BORDER_RADIUS.lg,
            }}
          />
          <LinearGradient 
            colors={[...COLORS.gradient.primary, 'transparent']} 
            start={{x: 0, y: 0}}
            end={{x: 0, y: 0.15}}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: 150,
              opacity: 0.15,
              borderTopRightRadius: BORDER_RADIUS.lg,
            }}
          />
          {/* Header */}
          <View style={styles.header}>
            <LinearGradient 
              colors={COLORS.gradient.primary} 
              start={{x: 0, y: 0}} 
              end={{x: 1, y: 0}} 
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                height: 2,
              }}
            />
            <Animated.View 
              style={[styles.logoContainer, {
                opacity: fadeAnim,
                transform: [{ translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 0]
                })}]
              }]}
            >
              <Icon name="box" size={32} color="#FB7504" />
            </Animated.View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="x" size={24} color="#FB7504" />
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <View style={styles.menuContainer}>
            {menuItems.map((item) => (
              <MenuItem
                key={item.id}
                id={item.id}
                label={item.label}
                icon={item.icon}
                onPress={() => handleMenuItemPress(item.screen)}
              />
            ))}
          </View>

          {/* Footer */}
          <Animated.View 
            style={[styles.footer, {
              opacity: fadeAnim,
              transform: [{ translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0]
              })}]
            }]}
          >
            <View style={styles.userSection}>
              <View style={styles.userAvatar}>
                <Text style={styles.userInitials}>JD</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>Jhon Doe</Text>
                <Text style={styles.viewProfile}>view profile</Text>
              </View>
              <TouchableOpacity 
                style={styles.logoutIcon}
                activeOpacity={0.7}
              >
                <Icon name="power" size={20} color="#FB7504" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    flex: 1,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,
    backgroundColor: '#121212',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    borderTopRightRadius: BORDER_RADIUS.lg,
    borderBottomRightRadius: BORDER_RADIUS.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: 40,
    paddingBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: SPACING.sm,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'transparent',
    transition: 'all 0.2s ease',
  },
  menuItemHovered: {
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    borderLeftWidth: 3,
    borderLeftColor: '#FB7504',
  },
  menuText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    flex: 1,
    marginLeft: SPACING.md,
  },
  footer: {
    padding: SPACING.lg,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  userInitials: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  viewProfile: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  logoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Sidebar;