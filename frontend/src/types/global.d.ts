declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg';

// React Native specific types
declare module 'react-native' {
  export interface ViewProps {
    style?: any;
    children?: any;
  }
  
  export interface TextProps {
    style?: any;
    children?: any;
  }
  
  export interface TextInputProps {
    style?: any;
    placeholder?: string;
    placeholderTextColor?: string;
    value?: string;
    onChangeText?: (text: string) => void;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    autoCorrect?: boolean;
  }
  
  export interface TouchableOpacityProps {
    style?: any;
    onPress?: () => void;
    children?: any;
  }
  
  export interface ScrollViewProps {
    style?: any;
    contentContainerStyle?: any;
    showsVerticalScrollIndicator?: boolean;
    children?: any;
  }
  
  export interface SafeAreaViewProps {
    style?: any;
    children?: any;
  }
  
  export interface StatusBarProps {
    barStyle?: 'default' | 'light-content' | 'dark-content';
    backgroundColor?: string;
    translucent?: boolean;
  }
  
  export interface AlertStatic {
    alert(title: string, message?: string, buttons?: Array<any>): void;
  }
  
  export interface PlatformStatic {
    OS: 'ios' | 'android' | 'windows' | 'macos' | 'web';
  }
  
  export const View: React.ComponentType<ViewProps>;
  export const Text: React.ComponentType<TextProps>;
  export const TextInput: React.ComponentType<TextInputProps>;
  export const TouchableOpacity: React.ComponentType<TouchableOpacityProps>;
  export const ScrollView: React.ComponentType<ScrollViewProps>;
  export const SafeAreaView: React.ComponentType<SafeAreaViewProps>;
  export const StatusBar: React.ComponentType<StatusBarProps>;
  export const StyleSheet: {
    create(styles: any): any;
  };
  export const Alert: AlertStatic;
  export const Platform: PlatformStatic;
  export const useColorScheme: () => 'light' | 'dark';
  
  export type ViewStyle = any;
  export type TextStyle = any;
}

declare module '@react-navigation/native' {
  export * from '@react-navigation/native/lib/typescript/src/types';
}

declare module '@react-navigation/stack' {
  export * from '@react-navigation/stack/lib/typescript/src/types';
}

declare module '@react-navigation/bottom-tabs' {
  export * from '@react-navigation/bottom-tabs/lib/typescript/src/types';
} 