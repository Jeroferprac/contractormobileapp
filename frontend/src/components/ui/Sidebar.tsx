import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated, Dimensions, Platform, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { BORDER_RADIUS } from '../../constants/spacing';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
  currentScreen?: string;
}

const MenuItem: React.FC<{
  id: string;
  label: string;
  icon: string;
  onPress: () => void;
  isActive?: boolean;
}> = ({ id, label, icon, onPress, isActive = false }) => {
  return (
    <TouchableOpacity
      style={[styles.menuItem, isActive && styles.activeMenuItem]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Icon name={icon as any} size={20} color={isActive ? "#FF6B35" : "#FFFFFF"} />
      <Text style={[styles.menuText, isActive && styles.activeMenuText]}>{label}</Text>
    </TouchableOpacity>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ visible, onClose, onNavigate, currentScreen }) => {
  const { logout, user } = useAuth();
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

    return () => {
      // Cleanup animations when component unmounts
      // stopAnimation is not available on Animated.Value
    };
  }, [visible, slideAnim, fadeAnim]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid', screen: 'MainTabs' },
    { id: 'products', label: 'Products', icon: 'box', screen: 'AllProducts' },
    { id: 'warehouses', label: 'Warehouses', icon: 'home', screen: 'AllWarehouses' },
    { id: 'suppliers', label: 'Suppliers', icon: 'users', screen: 'SuppliersScreen' },
    { id: 'purchaseorders', label: 'Purchase Orders', icon: 'shopping-cart', screen: 'PurchaseOrdersScreen' },
    { id: 'reports', label: 'Reports', icon: 'bar-chart-2', screen: 'InventoryReportsScreen' },
    { id: 'pricelists', label: 'Price Lists', icon: 'dollar-sign', screen: 'PriceLists' },
  ];

  const handleMenuItemPress = (screen: string) => {
    console.log('🔧 [DEBUG] Sidebar: Attempting to navigate to screen:', screen);
    try {
      // Navigate immediately for faster response
      onNavigate(screen);
      // Close sidebar after navigation starts
      onClose();
      console.log('✅ [DEBUG] Sidebar: Navigation successful to:', screen);
    } catch (error) {
      console.error('❌ [DEBUG] Sidebar: Navigation failed to:', screen, error);
    }
  };

  // Helper function to generate user initials
  const getUserInitials = (fullName: string): string => {
    if (!fullName) return 'U';
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
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
              <Icon name="box" size={32} color="#FF6B35" />
            </Animated.View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="x" size={24} color="#FF6B35" />
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
                isActive={currentScreen === item.screen}
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
              <TouchableOpacity 
                style={styles.userInfoContainer}
                activeOpacity={0.7}
                onPress={() => {
                  onClose();
                  setTimeout(() => {
                    onNavigate('ProfileEdit');
                  }, 100);
                }}
              >
                <View style={styles.userAvatar}>
                  <Text style={styles.userInitials}>
                    {user ? getUserInitials(user.full_name) : 'U'}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>
                    {user?.full_name || 'User'}
                  </Text>
                  <Text style={styles.viewProfile}>view profile</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.logoutIcon}
                activeOpacity={0.7}
                onPress={() => {
                  Alert.alert(
                    'Logout',
                    'Are you sure you want to logout?',
                    [
                      {
                        text: 'Cancel',
                        style: 'cancel',
                      },
                      {
                        text: 'Logout',
                        style: 'destructive',
                        onPress: async () => {
                          onClose();
                          try {
                            await logout();
                          } catch (error) {
                            console.error('Logout error:', error);
                          }
                        },
                      },
                    ]
                  );
                }}
              >
                <Icon name="power" size={20} color="#FF6B35" />
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
  },
  menuText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    flex: 1,
    marginLeft: SPACING.md,
  },
  activeMenuItem: {
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B35',
  },
  activeMenuText: {
    color: '#FF6B35',
    fontWeight: '600',
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
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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