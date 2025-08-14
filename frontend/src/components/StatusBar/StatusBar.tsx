import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';

export const StatusBar: React.FC = () => {
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.time}>{getCurrentTime()}</Text>
      <View style={styles.icons}>
        <Icon name="wifi" size={16} color={COLORS.text.primary} />
        <Icon name="battery-full" size={16} color={COLORS.text.primary} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.background,
  },
  time: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  icons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
});