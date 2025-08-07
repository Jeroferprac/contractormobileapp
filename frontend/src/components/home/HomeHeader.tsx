import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { TEXT_STYLES } from '../../constants/typography';

interface HomeHeaderProps {
  location: string;
  address: string;
  onLocationPress?: () => void;
  onNotificationPress?: () => void;
  onLogoutPress?: () => void;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({
  location,
  address,
  onLocationPress,
  onNotificationPress,
  onLogoutPress,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.locationContainer} onPress={onLocationPress}>
        <Icon name="map-pin" size={16} color={COLORS.text.secondary} />
        <Text style={styles.locationText}>{location}</Text>
        <Icon name="chevron-down" size={16} color={COLORS.text.secondary} />
      </TouchableOpacity>
      
      <View style={styles.rightButtons}>
        <TouchableOpacity style={styles.notificationButton} onPress={onNotificationPress}>
          <Icon name="bell" size={20} color={COLORS.text.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogoutPress}>
          <Icon name="log-out" size={20} color={COLORS.status.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  locationText: {
    fontSize: TEXT_STYLES.bodyLarge.fontSize,
    fontWeight: TEXT_STYLES.bodyLarge.fontWeight,
    color: COLORS.text.primary,
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
});

export default HomeHeader; 