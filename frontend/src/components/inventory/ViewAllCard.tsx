import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/spacing';
import { TEXT_STYLES } from '../../constants/typography';

interface ViewAllCardProps {
  onPress: () => void;
}

const ViewAllCard: React.FC<ViewAllCardProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.gradient}
      >
        <Text style={styles.text}>View All</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default ViewAllCard;

const styles = StyleSheet.create({
  container: {
    width: 140,
    height: 160,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginRight: SPACING.md,
    ...SHADOWS.sm,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
  },
  text: {
    ...TEXT_STYLES.bodyLarge,
    fontWeight: '700',
    color: COLORS.text.light,
  },
});
