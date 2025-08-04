import React from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../constants/colors';

interface IconProps {
  size?: number;
  color?: string;
  style?: React.ComponentProps<typeof View>['style'];
}

export const UserIcon: React.FC<IconProps> = ({ size = 20, color = COLORS.text.primary, style }) => (
  <View style={[styles.icon, { width: size, height: size }, style]}>
    <Icon name="user" size={size} color={color} />
  </View>
);

export const EmailIcon: React.FC<IconProps> = ({ size = 20, color = COLORS.text.primary, style }) => (
  <View style={[styles.icon, { width: size, height: size }, style]}>
    <Icon name="mail" size={size} color={color} />
  </View>
);

export const LockIcon: React.FC<IconProps> = ({ size = 20, color = COLORS.text.primary, style }) => (
  <View style={[styles.icon, { width: size, height: size }, style]}>
    <Icon name="lock" size={size} color={color} />
  </View>
);

export const PhoneIcon: React.FC<IconProps> = ({ size = 20, color = COLORS.text.primary, style }) => (
  <View style={[styles.icon, { width: size, height: size }, style]}>
    <Icon name="phone" size={size} color={color} />
  </View>
);

export const GitHubIcon: React.FC<IconProps> = ({ size = 20, color = COLORS.text.primary, style }) => (
  <View style={[styles.icon, { width: size, height: size }, style]}>
    <Icon name="github" size={size} color={color} />
  </View>
);

export const CompanyIcon: React.FC<IconProps> = ({ size = 20, color = COLORS.text.primary, style }) => (
  <View style={[styles.icon, { width: size, height: size }, style]}>
    <MaterialIcon name="business" size={size} color={color} />
  </View>
);

export const ContractorIcon: React.FC<IconProps> = ({ size = 20, color = COLORS.text.primary, style }) => (
  <View style={[styles.icon, { width: size, height: size }, style]}>
    <MaterialIcon name="build" size={size} color={color} />
  </View>
);

export const CustomerIcon: React.FC<IconProps> = ({ size = 20, color = COLORS.text.primary, style }) => (
  <View style={[styles.icon, { width: size, height: size }, style]}>
    <Icon name="user" size={size} color={color} />
  </View>
);

export const HomeIcon: React.FC<IconProps> = ({ size = 20, color = COLORS.text.primary, style }) => (
  <View style={[styles.icon, { width: size, height: size }, style]}>
    <Icon name="home" size={size} color={color} />
  </View>
);

export const SettingsIcon: React.FC<IconProps> = ({ size = 20, color = COLORS.text.primary, style }) => (
  <View style={[styles.icon, { width: size, height: size }, style]}>
    <Icon name="settings" size={size} color={color} />
  </View>
);

export const SearchIcon: React.FC<IconProps> = ({ size = 20, color = COLORS.text.primary, style }) => (
  <View style={[styles.icon, { width: size, height: size }, style]}>
    <Icon name="search" size={size} color={color} />
  </View>
);

export const CalendarIcon: React.FC<IconProps> = ({ size = 20, color = COLORS.text.primary, style }) => (
  <View style={[styles.icon, { width: size, height: size }, style]}>
    <Icon name="calendar" size={size} color={color} />
  </View>
);

export const DollarIcon: React.FC<IconProps> = ({ size = 20, color = COLORS.text.primary, style }) => (
  <View style={[styles.icon, { width: size, height: size }, style]}>
    <Icon name="dollar-sign" size={size} color={color} />
  </View>
);

export const AlertIcon: React.FC<IconProps> = ({ size = 20, color = COLORS.text.primary, style }) => (
  <View style={[styles.icon, { width: size, height: size }, style]}>
    <Icon name="alert-triangle" size={size} color={color} />
  </View>
);

export const ToolIcon: React.FC<IconProps> = ({ size = 20, color = COLORS.text.primary, style }) => (
  <View style={[styles.icon, { width: size, height: size }, style]}>
    <MaterialIcon name="handyman" size={size} color={color} />
  </View>
);

export const HouseIcon: React.FC<IconProps> = ({ size = 20, color = COLORS.text.primary, style }) => (
  <View style={[styles.icon, { width: size, height: size }, style]}>
    <MaterialIcon name="home" size={size} color={color} />
  </View>
);

const styles = StyleSheet.create({
  icon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 