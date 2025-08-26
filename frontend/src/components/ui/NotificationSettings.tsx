import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Switch } from 'react-native';
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
          <Switch
            value={hasPermission}
            onValueChange={handleTogglePermission}
            trackColor={{ false: COLORS.border.light, true: COLORS.primary }}
            thumbColor={hasPermission ? COLORS.text.light : COLORS.text.secondary}
          />
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
          <Switch
            value={isMonitoring}
            onValueChange={handleToggleMonitoring}
            trackColor={{ false: COLORS.border.light, true: COLORS.primary }}
            thumbColor={isMonitoring ? COLORS.text.light : COLORS.text.secondary}
          />
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
          <Switch
            value={preferences.lowStockEnabled}
            onValueChange={(value) => handlePreferenceChange('lowStockEnabled', value)}
            trackColor={{ false: COLORS.border.light, true: COLORS.primary }}
            thumbColor={preferences.lowStockEnabled ? COLORS.text.light : COLORS.text.secondary}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Out of Stock Alerts</Text>
            <Text style={styles.settingDescription}>When items are completely out</Text>
          </View>
          <Switch
            value={preferences.outOfStockEnabled}
            onValueChange={(value) => handlePreferenceChange('outOfStockEnabled', value)}
            trackColor={{ false: COLORS.border.light, true: COLORS.primary }}
            thumbColor={preferences.outOfStockEnabled ? COLORS.text.light : COLORS.text.secondary}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Transfer Notifications</Text>
            <Text style={styles.settingDescription}>When transfers are completed</Text>
          </View>
          <Switch
            value={preferences.transferEnabled}
            onValueChange={(value) => handlePreferenceChange('transferEnabled', value)}
            trackColor={{ false: COLORS.border.light, true: COLORS.primary }}
            thumbColor={preferences.transferEnabled ? COLORS.text.light : COLORS.text.secondary}
          />
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
          <Switch
            value={preferences.soundEnabled}
            onValueChange={(value) => handlePreferenceChange('soundEnabled', value)}
            trackColor={{ false: COLORS.border.light, true: COLORS.primary }}
            thumbColor={preferences.soundEnabled ? COLORS.text.light : COLORS.text.secondary}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Vibration</Text>
            <Text style={styles.settingDescription}>Vibrate on notifications</Text>
          </View>
          <Switch
            value={preferences.vibrationEnabled}
            onValueChange={(value) => handlePreferenceChange('vibrationEnabled', value)}
            trackColor={{ false: COLORS.border.light, true: COLORS.primary }}
            thumbColor={preferences.vibrationEnabled ? COLORS.text.light : COLORS.text.secondary}
          />
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
});

export default NotificationSettings;
