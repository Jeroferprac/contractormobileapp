import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';
import { useNotifications } from '../../context/NotificationContext';

const NotificationTester: React.FC = () => {
  const { addNotification, state, syncNotifications } = useNotifications();

  const testNotifications = [
    {
      title: 'Test Info Notification',
      message: 'This is a test info notification',
      type: 'info' as const,
      category: 'warehouse' as const,
      priority: 'low' as const,
    },
    {
      title: 'Test Success Notification',
      message: 'This is a test success notification',
      type: 'success' as const,
      category: 'inventory' as const,
      priority: 'medium' as const,
    },
    {
      title: 'Test Warning Notification',
      message: 'This is a test warning notification',
      type: 'warning' as const,
      category: 'system' as const,
      priority: 'high' as const,
    },
    {
      title: 'Test Error Notification',
      message: 'This is a test error notification',
      type: 'error' as const,
      category: 'order' as const,
      priority: 'urgent' as const,
    },
    {
      title: 'Test Urgent Alert',
      message: 'This is an urgent notification that should show a native alert',
      type: 'error' as const,
      category: 'general' as const,
      priority: 'urgent' as const,
    },
  ];

  const addTestNotification = (notification: any) => {
    addNotification({
      ...notification,
      read: false,
      metadata: {
        priority: notification.priority,
        warehouseId: 'test-warehouse-1',
      },
    });
  };

  const addMultipleNotifications = () => {
    testNotifications.forEach((notification, index) => {
      setTimeout(() => {
        addTestNotification(notification);
      }, index * 500); // Add notifications with 500ms delay
    });
  };

  const testSync = async () => {
    try {
      await syncNotifications();
      Alert.alert('Success', 'Notifications synced successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to sync notifications');
    }
  };

  const showNotificationStats = () => {
    const stats = {
      total: state.notifications.length,
      unread: state.unreadCount,
      byCategory: {
        warehouse: state.notifications.filter(n => n.category === 'warehouse').length,
        inventory: state.notifications.filter(n => n.category === 'inventory').length,
        system: state.notifications.filter(n => n.category === 'system').length,
        order: state.notifications.filter(n => n.category === 'order').length,
        general: state.notifications.filter(n => n.category === 'general').length,
      },
    };

    Alert.alert(
      'Notification Stats',
      `Total: ${stats.total}\nUnread: ${stats.unread}\n\nBy Category:\nWarehouse: ${stats.byCategory.warehouse}\nInventory: ${stats.byCategory.inventory}\nSystem: ${stats.byCategory.system}\nOrder: ${stats.byCategory.order}\nGeneral: ${stats.byCategory.general}`
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Icon name="bell" size={24} color={COLORS.primary} />
        <Text style={styles.title}>Notification Tester</Text>
      </View>

      <Text style={styles.description}>
        Use these buttons to test different notification scenarios
      </Text>

      {/* Individual Test Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Individual Notifications</Text>
        
        {testNotifications.map((notification, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.testButton, styles[`${notification.type}Button`]]}
            onPress={() => addTestNotification(notification)}
          >
            <Icon 
              name={notification.type === 'info' ? 'info' : 
                    notification.type === 'success' ? 'check-circle' :
                    notification.type === 'warning' ? 'alert-triangle' : 'x-circle'} 
              size={16} 
              color={COLORS.text.light} 
            />
            <Text style={styles.buttonText}>{notification.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Batch Test Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Batch Tests</Text>
        
        <TouchableOpacity
          style={[styles.testButton, styles.batchButton]}
          onPress={addMultipleNotifications}
        >
          <Icon name="plus" size={16} color={COLORS.text.light} />
          <Text style={styles.buttonText}>Add All Test Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.testButton, styles.syncButton]}
          onPress={testSync}
        >
          <Icon name="refresh-cw" size={16} color={COLORS.text.light} />
          <Text style={styles.buttonText}>Test Sync</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.testButton, styles.statsButton]}
          onPress={showNotificationStats}
        >
          <Icon name="bar-chart-2" size={16} color={COLORS.text.light} />
          <Text style={styles.buttonText}>Show Stats</Text>
        </TouchableOpacity>
      </View>

      {/* Current Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Status</Text>
        <View style={styles.statusCard}>
          <Text style={styles.statusText}>
            Total Notifications: {state.notifications.length}
          </Text>
          <Text style={styles.statusText}>
            Unread Count: {state.unreadCount}
          </Text>
          <Text style={styles.statusText}>
            Loading: {state.loading ? 'Yes' : 'No'}
          </Text>
          {state.error && (
            <Text style={[styles.statusText, styles.errorText]}>
              Error: {state.error}
            </Text>
          )}
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Testing Instructions</Text>
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionText}>
            1. Tap any test button to add notifications{'\n'}
            2. Check the notification badge in the header{'\n'}
            3. Tap the badge to open the notification panel{'\n'}
            4. Test filtering by category{'\n'}
            5. Test mark as read functionality{'\n'}
            6. Test mark all as read and clear all{'\n'}
            7. Check that urgent notifications show native alerts
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  buttonText: {
    color: COLORS.text.light,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  infoButton: {
    backgroundColor: COLORS.status.info,
  },
  successButton: {
    backgroundColor: COLORS.status.success,
  },
  warningButton: {
    backgroundColor: COLORS.status.warning,
  },
  errorButton: {
    backgroundColor: COLORS.status.error,
  },
  batchButton: {
    backgroundColor: COLORS.primary,
  },
  syncButton: {
    backgroundColor: COLORS.accent,
  },
  statsButton: {
    backgroundColor: COLORS.secondary,
  },
  statusCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  statusText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  errorText: {
    color: COLORS.status.error,
  },
  instructionsCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  instructionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
});

export default NotificationTester;
