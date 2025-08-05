import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';
import { TEXT_STYLES } from '../../constants/typography';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  style?: any;
}

const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  style,
}) => {
  const badgeStyle = [
    styles.base,
    styles[variant],
    styles[size],
    style,
  ];

  const textStyle = [
    styles.text,
    styles[`text${size.charAt(0).toUpperCase() + size.slice(1)}`],
    styles[`text${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
  ];

  return (
    <View style={badgeStyle}>
      <Text style={textStyle}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.round,
  },
  // Variants
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
  },
  success: {
    backgroundColor: COLORS.status.success,
  },
  warning: {
    backgroundColor: COLORS.status.warning,
  },
  error: {
    backgroundColor: COLORS.status.error,
  },
  info: {
    backgroundColor: COLORS.status.info,
  },
  // Sizes
  sm: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    minHeight: 16,
  },
  md: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    minHeight: 20,
  },
  lg: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    minHeight: 24,
  },
  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  textSm: {
    fontSize: 10,
  },
  textMd: {
    fontSize: 12,
  },
  textLg: {
    fontSize: 14,
  },
  // Text colors
  textPrimary: {
    color: COLORS.text.light,
  },
  textSecondary: {
    color: COLORS.text.dark,
  },
  textSuccess: {
    color: COLORS.text.light,
  },
  textWarning: {
    color: COLORS.text.dark,
  },
  textError: {
    color: COLORS.text.light,
  },
  textInfo: {
    color: COLORS.text.light,
  },
});

export default Badge; 