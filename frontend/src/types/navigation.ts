import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export type MainTabParamList = {
  Home: undefined;
  Inventory: undefined;
  Bookings: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  MainTabs: undefined;
  AllProducts: undefined;
  Product: { product: any };
  AddProduct: { product?: any };
  AllTransfers: undefined;
  LowStockInventory: undefined;
  Warehouse: undefined;
  WarehouseReports: undefined;
};
export type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;
export type SignupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Signup'>;
export type OnboardingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
export type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;
export type InventoryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;
export type AllProductsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AllProducts'>;
export type AllTransfersScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AllTransfers'>;
export type LowStockInventoryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'LowStockInventory'>;