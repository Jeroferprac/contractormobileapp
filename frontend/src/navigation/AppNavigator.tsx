// src/navigation/AppNavigator.tsx
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Screens
import { SplashScreen } from '../screens/SplashScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen/HomeScreen';
import InventoryScreen from '../screens/InventoryScreen/InventoryScreen';
import AllProductsScreen from '../screens/AllProductsScreen/AllProductsScreen';
import ProductScreen from '../screens/ProductScreen/ProductScreen';
import AddProductScreen from '../screens/AddProductScreen/AddProductScreen';
import  WarehouseScreen  from '../screens/WarehouseScreen/WarehouseScreen';
import AllTransfersScreen from '../screens/AllTransfersScreen/AllTransfersScreen';
import WarehouseReportsScreen from '../screens/WarehouseReportsScreen';
import LowStockInventoryScreen from '../screens/LowStockInventoryScreen/LowStockInventoryScreen';
import AllWarehouseScreen from '../screens/AllWarehouseScreen';
import BinManagementScreen from '../screens/BinManagementScreen';
import { ProfileScreen } from '../screens/ProfileScreen/ProfileScreen';
import BarcodeScannerScreen from '../screens/BarcodeScannerScreen';
import ProfileEditScreen from '../screens/ProfileEditScreen';
import SalesScreen from '../screens/SalesScreen/SalesScreen';
import AllSalesScreen from '../screens/SalesScreen/AllSalesScreen';
import SalesDetailsScreen from '../screens/SalesScreen/SalesDetailsScreen';
import CreateSaleScreen from '../screens/SalesScreen/CreateSaleScreen';
import SuppliersScreen from '../screens/SuppliersScreen';
import SupplierFormScreen from '../screens/SupplierFormScreen';
import SupplierDetailsScreen from '../screens/SupplierDetailsScreen';
import ProductSuppliersScreen from '../screens/ProductSuppliersScreen';
import ProductSupplierFormScreen from '../screens/ProductSupplierFormScreen';
import PurchaseOrdersScreen from '../screens/PurchaseOrdersScreen';
import PurchaseOrderDetailsScreen from '../screens/PurchaseOrderDetails';
import PurchaseOrderFormScreen from '../screens/PurchaseOrderForm';
import InventoryReportsScreen from '../screens/InventoryReportsScreen/InventoryReportsScreen';
import PriceListsScreen from '../screens/PriceListsScreen';
import { useAuth } from '../context/AuthContext';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Temporary Requests Screen Component
const RequestsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Requests</Text>
      <Text style={styles.subtitle}>Your requests will appear here</Text>
    </View>
  );
};


// Tab Bar Icon Components
const HomeIcon = ({ color, size }: { color: string; size: number }) => (
  <Icon name="home" size={size} color={color} />
);

const InventoryIcon = ({ color, size }: { color: string; size: number }) => (
  <Icon name="inventory" size={size} color={color} />
);

const WarehouseIcon = ({ color, size }: { color: string; size: number }) => (
  <Icon name="warehouse" size={size} color={color} />
);

const ScanIcon = ({ _color, _size }: { _color: string; _size: number }) => (
  <View style={styles.scanButton}>
    <Icon name="qr-code-scanner" size={24} color="#FFFFFF" />
  </View>
);

const BookingsIcon = ({ color, size }: { color: string; size: number }) => (
  <Icon name="event" size={size} color={color} />
);

const ProfileIcon = ({ color, size }: { color: string; size: number }) => (
  <Icon name="person" size={size} color={color} />
);

// Main Tab Navigator
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FB7504',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Icon 
              name={focused ? "home" : "home"} 
              size={size} 
              color={color}
              style={{ 
                transform: [{ scale: focused ? 1.1 : 1 }] 
              }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{
          tabBarLabel: 'Inventory',
          tabBarIcon: ({ color, size, focused }) => (
            <Icon 
              name={focused ? "inventory" : "inventory"} 
              size={size} 
              color={color}
              style={{ 
                transform: [{ scale: focused ? 1.1 : 1 }] 
              }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Scan"
        component={BarcodeScannerScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ color, size }) => (
            <View style={{
              backgroundColor: '#FB7504',
              width: 56,
              height: 56,
              borderRadius: 28,
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: -20,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}>
              <Icon name="qr-code-scanner" size={24} color="#FFFFFF" />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Requests"
        component={RequestsScreen}
        options={{
          tabBarLabel: 'Requests',
          tabBarIcon: ({ color, size, focused }) => (
            <Icon 
              name={focused ? "assignment" : "assignment"} 
              size={size} 
              color={color}
              style={{ 
                transform: [{ scale: focused ? 1.1 : 1 }] 
              }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Icon 
              name={focused ? "person" : "person"} 
              size={size} 
              color={color}
              style={{ 
                transform: [{ scale: focused ? 1.1 : 1 }] 
              }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

/* ------------------------
   Main App Navigator
------------------------ */
export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, isRegistering, showRegistrationSuccess } = useAuth();
  const [showInitialSplash, setShowInitialSplash] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Debug logging
  console.log('🎯 [AppNavigator] Current state:', { 
    isAuthenticated, 
    isLoading, 
    isRegistering, 
    showRegistrationSuccess,
    showInitialSplash, 
    loadingTimeout 
  });

  useEffect(() => {
    // Only show initial splash on app start, not during authentication
    const timer = setTimeout(() => setShowInitialSplash(false), 3000); // Changed to 3 seconds
    return () => clearTimeout(timer);
  }, []);

  // Add timeout for loading state to prevent infinite loading
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setLoadingTimeout(true);
      }, 15000);
      
      return () => clearTimeout(timeout);
    } else {
      setLoadingTimeout(false);
    }
  }, [isLoading]);

  // Show initial splash only on app start (not during registration)
  if (showInitialSplash && !isAuthenticated && !isRegistering) {
    console.log('🎯 [AppNavigator] Showing initial splash screen');
    return <SplashScreen />;
  }

  // Show loading splash during authentication operations
  if (isLoading && !loadingTimeout) {
    console.log('🎯 [AppNavigator] Showing loading splash screen');
    return <SplashScreen />;
  }

  // Show splash during registration process ONLY if still loading
  if (isRegistering && isLoading) {
    console.log('🎯 [AppNavigator] Showing registration splash screen');
    return <SplashScreen />;
  }

  // If loading timeout reached, force navigation
  if (loadingTimeout) {
    console.log('🎯 [AppNavigator] Loading timeout - forcing navigation');
    // Force navigation to prevent freeze
  }

  if (isAuthenticated) {
    console.log('🎯 [AppNavigator] User authenticated - showing main app');
  } else {
    console.log('🎯 [AppNavigator] User not authenticated - showing auth stack');
  }
  
  return (
    <SafeAreaProvider>
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={isAuthenticated ? "MainTabs" : (showRegistrationSuccess ? "Signup" : "Onboarding")}
        screenOptions={{ headerShown: false }}
      >
        {isAuthenticated ? (
          // Authenticated user screens
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen name="AllProducts" component={AllProductsScreen} />
            <Stack.Screen name="Product" component={ProductScreen} />
            <Stack.Screen name="AddProduct" component={AddProductScreen} />
            <Stack.Screen name="Warehouse" component={WarehouseScreen} />
            <Stack.Screen name="AllTransfers" component={AllTransfersScreen} /> 
            <Stack.Screen name="WarehouseReports" component={WarehouseReportsScreen} />
            <Stack.Screen name="LowStockInventory" component={LowStockInventoryScreen} />
            <Stack.Screen name="Sales" component={SalesScreen} />
            <Stack.Screen name="AllSales" component={AllSalesScreen} />
            <Stack.Screen name="SalesDetails" component={SalesDetailsScreen} />
            <Stack.Screen name="CreateSale" component={CreateSaleScreen} />
            <Stack.Screen name="AllWarehouses" component={AllWarehouseScreen} />
            <Stack.Screen name="BinManagement" component={BinManagementScreen} />
            <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
            
          </>
        ) : (
          // Unauthenticated user screens
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  scanButton: {
    backgroundColor: '#FF6B35',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});