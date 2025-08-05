declare module 'react-native' {
  export const Modal: any;
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