declare module 'react-native' {
  export const Modal: any;
  export const FlatList: any;
  export const ActivityIndicator: any;
  export const Image: any;
  export const ScrollView: any;
  export const TouchableOpacity: any;
  export const TextInput: any;
  export const Animated: any;
  export const StyleSheet: any;
  export const Platform: any;
}

declare module '@react-navigation/native' {
  export const NavigationContainer: any;
}

declare module '@react-navigation/bottom-tabs' {
  export const createBottomTabNavigator: any;
}

declare module '@react-navigation/native-stack' {
  export const createNativeStackNavigator: any;
  export type NativeStackNavigationProp<ParamList, RouteName extends keyof ParamList = keyof ParamList> = any;
} 