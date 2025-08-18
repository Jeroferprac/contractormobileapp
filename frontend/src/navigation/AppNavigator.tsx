// src/navigation/AppNavigator.tsx
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { View, Text, StyleSheet } from 'react-native';

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
import BarcodeScanner from '../components/ui/BarcodeScanner';
import { ProfileScreen } from '../screens/ProfileScreen/ProfileScreen';
import { BarcodeScannerScreen } from '../components/ui/BarcodeScanner';
import ProfileEditScreen from '../screens/ProfileEditScreen';
import { useAuth } from '../context/AuthContext';
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Temporary Bookings Screen Component
const BookingsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bookings</Text>
      <Text style={styles.subtitle}>Your bookings will appear here</Text>
    </View>
  );
};

// Main Tab Navigator
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF6B35',
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
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{
          tabBarLabel: 'Inventory',
          tabBarIcon: ({ color, size }) => (
            <Icon name="inventory" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Warehouse"
        component={WarehouseScreen}
        options={{
          tabBarLabel: 'Warehouse',
          tabBarIcon: ({ color, size }) => (
            <Icon name="warehouse" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Scan"
        component={BarcodeScanner}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ color, size }) => (
            <View style={{
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
            }}>
              <Icon name="qr-code-scanner" size={24} color="#FFFFFF" />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{
          tabBarLabel: 'Bookings',
          tabBarIcon: ({ color, size }) => (
            <Icon name="event" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Icon name="person" size={size} color={color} />
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
  const { isAuthenticated, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <SplashScreen />;
  if (isLoading) return <SplashScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={isAuthenticated ? "MainTabs" : "Onboarding"}
        screenOptions={{ headerShown: false }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen name="AllProducts" component={AllProductsScreen} />
            <Stack.Screen name="Product" component={ProductScreen} />
            <Stack.Screen name="AddProduct" component={AddProductScreen} />
             <Stack.Screen name="Warehouse" component={WarehouseScreen} />
             <Stack.Screen name="AllTransfers" component={AllTransfersScreen} /> 
             <Stack.Screen name="WarehouseReports" component={WarehouseReportsScreen} />
             <Stack.Screen name="LowStockInventory" component={LowStockInventoryScreen} />
            <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
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
});