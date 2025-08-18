import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/spacing';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  margin?: 'sm' | 'md' | 'lg' | 'xl';
  borderRadius?: 'sm' | 'md' | 'lg' | 'xl';
  style?: ViewStyle;
  onPress?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  margin,
  borderRadius = 'lg',
  style,
  onPress,
}) => {
  const cardStyle = [
    styles.base,
    styles[variant],
    styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}`],
    margin && styles[`margin${margin.charAt(0).toUpperCase() + margin.slice(1)}`],
    styles[`borderRadius${borderRadius.charAt(0).toUpperCase() + borderRadius.slice(1)}`],
    style,
  ];

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: COLORS.card,
  },
  default: {
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  elevated: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  outlined: {
    borderWidth: 2,
    borderColor: COLORS.border.medium,
  },
  paddingSm: {
    padding: SPACING.sm,
  },
  paddingMd: {
    padding: SPACING.md,
  },
  paddingLg: {
    padding: SPACING.lg,
  },
  paddingXl: {
    padding: SPACING.xl,
  },
  marginSm: {
    margin: SPACING.sm,
  },
  marginMd: {
    margin: SPACING.md,
  },
  marginLg: {
    margin: SPACING.lg,
  },
  marginXl: {
    margin: SPACING.xl,
  },
  borderRadiusSm: {
    borderRadius: BORDER_RADIUS.sm,
  },
  borderRadiusMd: {
    borderRadius: BORDER_RADIUS.md,
  },
  borderRadiusLg: {
    borderRadius: BORDER_RADIUS.lg,
  },
  borderRadiusXl: {
    borderRadius: BORDER_RADIUS.xl,
  },
});

export default Card; 