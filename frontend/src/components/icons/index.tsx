import React from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../constants/colors';

interface IconProps {
  size?: number;
  color?: string;
  style?: any;
}

export const UserIcon: React.FC<IconProps> = ({ size = 20, color = COLORS.textPrimary, style }) => (
  <View style={[styles.icon, { width: size, height: size }, style]}>
    <Icon name="person" size={size} color={color} />
  </View>
);

export const EmailIcon: React.FC<IconProps> = ({ size = 20, color = COLORS.textPrimary, style }) => (
  <View style={[styles.icon, { width: size, height: size }, style]}>
    <Icon name="email" size={size} color={color} />
  </View>
);

export const LockIcon: React.FC<IconProps> = ({ size = 20, color = COLORS.textPrimary, style }) => (
  <View style={[styles.icon, { width: size, height: size }, style]}>
    <Icon name="lock" size={size} color={color} />
  </View>
);

export const PhoneIcon: React.FC<IconProps> = ({ size = 20, color = COLORS.textPrimary, style }) => (
  <View style={[styles.icon, { width: size, height: size }, style]}>
    <Icon name="phone" size={size} color={color} />
  </View>
);

export const GitHubIcon: React.FC<IconProps> = ({ size = 20, color = COLORS.textPrimary, style }) => (
  <View style={[styles.icon, { width: size, height: size }, style]}>
    <Icon name="code" size={size} color={color} />
  </View>
);

export const CompanyIcon: React.FC<IconProps> = ({ size = 20, color = COLORS.textPrimary, style }) => (
  <View style={[styles.icon, { width: size, height: size }, style]}>
    <Icon name="business" size={size} color={color} />
  </View>
);

export const ContractorIcon: React.FC<IconProps> = ({ size = 20, color = COLORS.textPrimary, style }) => (
  <View style={[styles.icon, { width: size, height: size }, style]}>
    <Icon name="build" size={size} color={color} />
  </View>
);

export const CustomerIcon: React.FC<IconProps> = ({ size = 20, color = COLORS.textPrimary, style }) => (
  <View style={[styles.icon, { width: size, height: size }, style]}>
    <Icon name="person-outline" size={size} color={color} />
  </View>
);

const styles = StyleSheet.create({
  icon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 