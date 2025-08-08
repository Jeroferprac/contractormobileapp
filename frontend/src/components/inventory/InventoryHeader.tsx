import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { SPACING, SHADOWS, BORDER_RADIUS } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';

interface InventoryHeaderProps {
  onSidebarPress: () => void;
  onSettingsPress: () => void;
  onScanPress?: () => void;
}

const InventoryHeader: React.FC<InventoryHeaderProps> = ({
  onSidebarPress,
  onSettingsPress,
  onScanPress
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={onSidebarPress} 
        style={styles.iconButton}
        activeOpacity={0.8}
      >
        <Icon name="menu" size={22} color={COLORS.text.light} />
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>Inventory Dashboard</Text>
        <Text style={styles.subtitle}>Manage your stock efficiently</Text>
      </View>

      {/* <View style={styles.rightButtons}>
        <TouchableOpacity 
          onPress={onScanPress || (() => {})} 
          style={[styles.iconButton, styles.scanButton]}
          activeOpacity={0.8}
        >
          <Icon name="camera" size={20} color={COLORS.text.light} />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={onSettingsPress} 
          style={styles.iconButton}
          activeOpacity={0.8}
        >
          <Icon name="settings" size={22} color={COLORS.text.light} />
        </TouchableOpacity>
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.light,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanButton: {
    marginRight: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});

export default InventoryHeader;
