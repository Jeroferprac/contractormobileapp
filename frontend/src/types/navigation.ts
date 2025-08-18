import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Supplier } from './inventory';

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
  Suppliers: undefined;
  SupplierForm: {
    supplier?: Supplier;
    isEditing?: boolean;
  };
  SupplierDetails: {
    supplierId: string;
  };
  ProductSuppliers: undefined;
  ProductSupplierForm: {
    productSupplier?: any; // TODO: Replace with proper ProductSupplier type
    isEditing?: boolean;
  };
  ProfileEdit: {
    user: any;
  };
  ProfileApiTest: undefined;
};

export type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;
export type SignupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Signup'>;
export type OnboardingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
export type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;
export type InventoryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;
export type AllProductsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AllProducts'>;
export type SuppliersScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Suppliers' | 'SupplierForm' | 'SupplierDetails' | 'ProductSuppliers' | 'ProductSupplierForm'>;