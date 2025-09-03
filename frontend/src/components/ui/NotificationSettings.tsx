import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';
import stockNotificationService from '../../utils/stockNotifications';
import { requestUserPermission, getFcmToken } from '../../utils/notifications';

interface NotificationSettingsProps {
  onClose?: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onClose }) => {
  const [preferences, setPreferences] = useState(stockNotificationService.getPreferences());
  const [hasPermission, setHasPermission] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    checkNotificationStatus();
    const interval = setInterval(() => {
      setIsMonitoring(stockNotificationService.isMonitoringActive());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const checkNotificationStatus = async () => {
    const permission = await requestUserPermission();
    setHasPermission(permission);
  };

  const handleTogglePermission = async () => {
    if (hasPermission) {
      Alert.alert(
        'Disable Notifications',
        'Are you sure you want to disable notifications? You may miss important stock alerts.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: () => setHasPermission(false),
          },
        ]
      );
    } else {
      const granted = await requestUserPermission();
      setHasPermission(granted);
      if (granted) {
        await getFcmToken();
      }
    }
  };

  const handleToggleMonitoring = () => {
    if (isMonitoring) {
      stockNotificationService.stopMonitoring();
      setIsMonitoring(false);
    } else {
      stockNotificationService.startMonitoring();
      setIsMonitoring(true);
    }
  };

  const handlePreferenceChange = (key: keyof typeof preferences, value: boolean | number) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    stockNotificationService.updatePreferences(newPreferences);
  };

  const handleTestNotification = () => {
    stockNotificationService.manualStockCheck();
    Alert.alert('Test Notification', 'A test notification has been sent.');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notification Settings</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Permission Status */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="notifications" size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Permission Status</Text>
        </View>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Text style={styles.settingDescription}>
              {hasPermission ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.customSwitch,
              { backgroundColor: hasPermission ? COLORS.primary : COLORS.border.light }
            ]}
            onPress={handleTogglePermission}
            activeOpacity={0.7}
          >
            <View style={[
              styles.switchThumb,
              { transform: [{ translateX: hasPermission ? 20 : 0 }] }
            ]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Monitoring Status */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="monitor" size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Stock Monitoring</Text>
        </View>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Background Monitoring</Text>
            <Text style={styles.settingDescription}>
              {isMonitoring ? 'Active' : 'Inactive'}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.customSwitch,
              { backgroundColor: isMonitoring ? COLORS.primary : COLORS.border.light }
            ]}
            onPress={handleToggleMonitoring}
            activeOpacity={0.7}
          >
            <View style={[
              styles.switchThumb,
              { transform: [{ translateX: isMonitoring ? 20 : 0 }] }
            ]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Notification Types */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="category" size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Notification Types</Text>
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Low Stock Alerts</Text>
            <Text style={styles.settingDescription}>When stock levels are low</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.customSwitch,
              { backgroundColor: preferences.lowStockEnabled ? COLORS.primary : COLORS.border.light }
            ]}
            onPress={() => handlePreferenceChange('lowStockEnabled', !preferences.lowStockEnabled)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.switchThumb,
              { transform: [{ translateX: preferences.lowStockEnabled ? 20 : 0 }] }
            ]} />
          </TouchableOpacity>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Out of Stock Alerts</Text>
            <Text style={styles.settingDescription}>When items are completely out</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.customSwitch,
              { backgroundColor: preferences.outOfStockEnabled ? COLORS.primary : COLORS.border.light }
            ]}
            onPress={() => handlePreferenceChange('outOfStockEnabled', !preferences.outOfStockEnabled)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.switchThumb,
              { transform: [{ translateX: preferences.outOfStockEnabled ? 20 : 0 }] }
            ]} />
          </TouchableOpacity>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Transfer Notifications</Text>
            <Text style={styles.settingDescription}>When transfers are completed</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.customSwitch,
              { backgroundColor: preferences.transferEnabled ? COLORS.primary : COLORS.border.light }
            ]}
            onPress={() => handlePreferenceChange('transferEnabled', !preferences.transferEnabled)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.switchThumb,
              { transform: [{ translateX: preferences.transferEnabled ? 20 : 0 }] }
            ]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sound & Vibration */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="volume-up" size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Sound & Vibration</Text>
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Sound</Text>
            <Text style={styles.settingDescription}>Play notification sounds</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.customSwitch,
              { backgroundColor: preferences.soundEnabled ? COLORS.primary : COLORS.border.light }
            ]}
            onPress={() => handlePreferenceChange('soundEnabled', !preferences.soundEnabled)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.switchThumb,
              { transform: [{ translateX: preferences.soundEnabled ? 20 : 0 }] }
            ]} />
          </TouchableOpacity>

        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Vibration</Text>
            <Text style={styles.settingDescription}>Vibrate on notifications</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.customSwitch,
              { backgroundColor: preferences.vibrationEnabled ? COLORS.primary : COLORS.border.light }
            ]}
            onPress={() => handlePreferenceChange('vibrationEnabled', !preferences.vibrationEnabled)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.switchThumb,
              { transform: [{ translateX: preferences.vibrationEnabled ? 20 : 0 }] }
            ]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Test Button */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.testButton} onPress={handleTestNotification}>
          <Icon name="notifications-active" size={20} color={COLORS.text.light} />
          <Text style={styles.testButtonText}>Send Test Notification</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  settingDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    margin: SPACING.lg,
    borderRadius: 8,
  },
  testButtonText: {
    color: COLORS.text.light,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  customSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default NotificationSettings;
