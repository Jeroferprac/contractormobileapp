import { getApp } from '@react-native-firebase/app';
import { getMessaging, hasPermission, requestPermission, AuthorizationStatus, getToken, onMessage, setBackgroundMessageHandler, onNotificationOpenedApp, getInitialNotification, onTokenRefresh } from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../api/api';

// Types for notification permissions and FCM tokens
interface NotificationPermissionStatus {
  granted: boolean;
  provisional?: boolean;
  denied?: boolean;
}

interface FCMTokenData {
  token: string;
  timestamp: Date;
}

/**
 * Check if Firebase is properly initialized
 */
const isFirebaseAvailable = (): boolean => {
  try {
    const app = getApp();
    return !!app;
  } catch (error) {
    console.log('⚠️ Firebase not available:', error);
    return false;
  }
};

/**
 * Get Firebase messaging instance safely
 */
const getFirebaseMessaging = () => {
  try {
    if (!isFirebaseAvailable()) {
      return null;
    }
    return getMessaging();
  } catch (error) {
    console.log('⚠️ Failed to get Firebase messaging:', error);
    return null;
  }
};

/**
 * Request notification permission from user
 */
export const requestUserPermission = async (): Promise<boolean> => {
  try {
    if (!isFirebaseAvailable()) {
      console.log('⚠️ Firebase not available for permission request');
      return false;
    }

    const authStatus = await hasPermission();
    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      return true;
    }

    const permission = await requestPermission();
    const enabledAfterRequest =
      permission === AuthorizationStatus.AUTHORIZED ||
      permission === AuthorizationStatus.PROVISIONAL;

    return enabledAfterRequest;
  } catch (error) {
    console.log('⚠️ Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Get FCM token for the device
 */
export const getFcmToken = async (): Promise<string | null> => {
  try {
    if (!isFirebaseAvailable()) {
      console.log('⚠️ Firebase not available for FCM token');
      return null;
    }

    const hasPermission = await requestUserPermission();
    if (!hasPermission) {
      return null;
    }

    const token = await getToken();
    if (token) {
      console.log('🔑 FCM Token Retrieved:', token);
      await storeFCMToken(token);
      return token;
    }
    return null;
  } catch (error) {
    console.log('⚠️ Error getting FCM token:', error);
    return null;
  }
};

/**
 * Store FCM token locally
 */
const storeFCMToken = async (token: string): Promise<void> => {
  try {
    const tokenData: FCMTokenData = {
      token,
      timestamp: new Date(),
    };
    await AsyncStorage.setItem('fcm_token', JSON.stringify(tokenData));
    console.log('💾 FCM Token Stored Locally');
  } catch (error) {
    // Handle storage error silently
  }
};

/**
 * Get stored FCM token
 */
export const getStoredFCMToken = async (): Promise<string | null> => {
  try {
    const tokenData = await AsyncStorage.getItem('fcm_token');
    if (tokenData) {
      const parsed: FCMTokenData = JSON.parse(tokenData);
      console.log('📱 Stored FCM Token:', parsed.token);
      return parsed.token;
    }
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Send FCM token to backend
 */
export const sendTokenToBackend = async (token: string, userId?: string): Promise<boolean> => {
  try {
    console.log('📤 Sending FCM token to backend:', token);
    
    // For now, just log the token since backend endpoint doesn't exist yet
    console.log('📋 FCM Token Data to send to backend:', {
      fcm_token: token,
      user_id: userId,
      device_type: 'mobile',
      platform: 'react-native'
    });
    
    // TODO: Uncomment when backend endpoint is ready
    // const response = await apiService.createService({
    //   fcm_token: token,
    //   user_id: userId,
    //   device_type: 'mobile',
    //   platform: 'react-native'
    // });
    
    console.log('✅ FCM token logged for backend implementation');
    return true;
  } catch (error) {
    console.error('❌ Failed to send FCM token to backend:', error);
    return false;
  }
};

/**
 * Subscribe to FCM topics
 */
export const subscribeToTopics = async (topics: string[]): Promise<void> => {
  try {
    const messagingInstance = getFirebaseMessaging();
    if (!messagingInstance) {
      console.warn('⚠️ Firebase messaging instance not available for topic subscription.');
      return;
    }
    for (const topic of topics) {
      await messagingInstance.subscribeToTopic(topic);
    }
  } catch (error) {
    // Handle subscription error silently
  }
};

/**
 * Unsubscribe from FCM topics
 */
export const unsubscribeFromTopics = async (topics: string[]): Promise<void> => {
  try {
    const messagingInstance = getFirebaseMessaging();
    if (!messagingInstance) {
      console.warn('⚠️ Firebase messaging instance not available for topic unsubscription.');
      return;
    }
    for (const topic of topics) {
      await messagingInstance.unsubscribeFromTopic(topic);
    }
  } catch (error) {
    // Handle unsubscription error silently
  }
};

/**
 * Handle foreground notification received
 */
export const onMessageReceived = (remoteMessage: any) => {
  console.log('📨 Firebase Message Received:', {
    title: remoteMessage.notification?.title,
    body: remoteMessage.notification?.body,
    data: remoteMessage.data,
    messageId: remoteMessage.messageId
  });

  if (remoteMessage.notification) {
    console.log('📱 Displaying System Notification');
    
    // Determine notification type and styling
    const notificationType = remoteMessage.data?.type || 'default';
    const { icon, color, sound, vibration } = getNotificationStyle(notificationType);
    
    PushNotification.localNotification({
      channelId: getNotificationChannel(notificationType),
      title: remoteMessage.notification.title || 'New Notification',
      message: remoteMessage.notification.body || 'You have a new notification',
      playSound: sound,
      soundName: sound ? 'default' : undefined,
      importance: 'high',
      priority: 'high',
      vibrate: vibration,
      autoCancel: true,
      largeIcon: 'ic_launcher',
      smallIcon: icon,
      bigText: remoteMessage.notification.body || 'You have a new notification',
      subText: getNotificationSubText(notificationType),
      color: color,
      userInfo: remoteMessage,
      ongoing: false,
      showWhen: true,
      when: Date.now(),

      // Action buttons for certain notification types
      actions: getNotificationActions(notificationType),
      // Group notifications by type
      group: notificationType,

    });
  }

  if (remoteMessage.data?.notificationId) {
    apiService.markNotificationAsRead(remoteMessage.data.notificationId, true)
      .catch((error) => {
        // Handle backend sync error silently
      });
  }
};

/**
 * Handle notification tap
 */
export const handleNotificationTap = (remoteMessage: any) => {
  if (remoteMessage.data) {
    const { type, id, screen, notificationId } = remoteMessage.data;
    if (notificationId) {
      apiService.markNotificationAsRead(notificationId, true)
        .catch((error) => {
          // Handle error silently
        });
    }
    
    // Handle navigation based on notification type
    switch (type) {
      case 'chat':
        // Navigate to chat
        break;
      case 'order':
        // Navigate to order details
        break;
      case 'promotion':
        // Navigate to promotions
        break;
      case 'notification':
        // Navigate to notifications screen
        break;
    }
  }
};

/**
 * Handle background notification received
 */
const onBackgroundMessageReceived = async (remoteMessage: any) => {
  console.log('📨 Firebase Background Message Received:', {
    title: remoteMessage.notification?.title,
    body: remoteMessage.notification?.body,
    data: remoteMessage.data,
    messageId: remoteMessage.messageId
  });
  // Background notification handling - Firebase handles this automatically
  return Promise.resolve();
};

/**
 * Handle app opened from notification
 */
const handleNotificationOpenedApp = (remoteMessage: any) => {
  console.log('📱 App Opened from Notification:', {
    title: remoteMessage.notification?.title,
    body: remoteMessage.notification?.body,
    data: remoteMessage.data
  });
  handleNotificationTap(remoteMessage);
};

/**
 * Handle initial notification when app is opened
 */
const onInitialNotification = (remoteMessage: any) => {
  console.log('📱 App Opened from Initial Notification:', {
    title: remoteMessage.notification?.title,
    body: remoteMessage.notification?.body,
    data: remoteMessage.data
  });
  handleNotificationTap(remoteMessage);
};

/**
 * Setup notification listeners
 */
export const setupNotificationListeners = (): void => {
  console.log('🔧 Setting up Notification Listeners...');
  
  // Configure notification channels for Android
  PushNotification.configure({
    onRegister: function (token: { os: string; token: string }) {
      // Token received - store it
      storeFCMToken(token.token);
    },
    onNotification: function (notification) {
      if (notification && notification.data) {
        handleNotificationTap(notification.data);
      }
    },
    permissions: { alert: true, badge: true, sound: true },
    popInitialNotification: true,
    requestPermissions: true,
  });

  PushNotification.createChannel(
    {
      channelId: 'default',
      channelName: 'Default Channel',
      channelDescription: 'Default notification channel',
      playSound: true,
      soundName: 'default',
      importance: 4,
      vibrate: true,
    },
    (created) => {
      console.log('📱 Default Notification Channel Created:', created);
    }
  );
  
  PushNotification.createChannel(
    {
      channelId: 'stock_alerts',
      channelName: 'Stock Alerts',
      channelDescription: 'Low stock and inventory notifications',
      playSound: true,
      soundName: 'default',
      importance: 4,
      vibrate: true,
    },
    (created) => {
      console.log('📱 Stock Alerts Channel Created:', created);
    }
  );

  PushNotification.createChannel(
    {
      channelId: 'inventory_updates',
      channelName: 'Inventory Updates',
      channelDescription: 'Transfer and order notifications',
      playSound: true,
      soundName: 'default',
      importance: 3,
      vibrate: false,
    },
    (created) => {
      console.log('📱 Inventory Updates Channel Created:', created);
    }
  );

  // Register foreground listener
  try {
    if (isFirebaseAvailable()) {
      onMessage(onMessageReceived);
      console.log('✅ Foreground message listener registered');
    } else {
      console.log('⚠️ Firebase not available, skipping foreground listener');
    }
  } catch (error) {
    console.log('⚠️ Failed to register foreground listener:', error);
  }

  // Register background handler with error handling
  try {
    if (isFirebaseAvailable()) {
      setBackgroundMessageHandler(onBackgroundMessageReceived);
      console.log('✅ Background message handler registered');
    } else {
      console.log('⚠️ Firebase not available, skipping background handler');
    }
  } catch (error) {
    console.log('⚠️ Failed to register background message handler:', error);
  }

  // Register app opened listener
  try {
    if (isFirebaseAvailable()) {
      onNotificationOpenedApp(handleNotificationOpenedApp);
      console.log('✅ App opened listener registered');
    }
  } catch (error) {
    console.log('⚠️ Failed to register app opened listener:', error);
  }

  // Check for initial notification
  try {
    if (isFirebaseAvailable()) {
      getInitialNotification()
        .then((remoteMessage) => {
          if (remoteMessage) {
            onInitialNotification(remoteMessage);
          }
        });
      console.log('✅ Initial notification check registered');
    }
  } catch (error) {
    console.log('⚠️ Failed to check initial notification:', error);
  }

  // Register token refresh listener
  try {
    if (isFirebaseAvailable()) {
      onTokenRefresh((token) => {
        console.log('🔄 FCM Token Refreshed:', token);
        storeFCMToken(token);
      });
      console.log('✅ Token refresh listener registered');
    }
  } catch (error) {
    console.log('⚠️ Failed to register token refresh listener:', error);
  }

  console.log('✅ Notification Listeners Setup Complete');
};

/**
 * Initialize notifications
 */
export const initializeNotifications = async (): Promise<boolean> => {
  try {
    console.log('🚀 Initializing Firebase Notifications...');
    
    const hasPermission = await requestUserPermission();
    if (!hasPermission) {
      console.log('❌ Notification Permission Denied');
      return false;
    }

    const token = await getToken();
    if (!token) {
      console.log('❌ Failed to Get FCM Token');
      return false;
    }

    console.log('✅ Firebase Notifications Initialized Successfully');
    setupNotificationListeners();
    return true;
  } catch (error) {
    console.log('❌ Error Initializing Notifications:', error);
    return false;
  }
};

/**
 * Display current FCM token for Firebase Console testing
 */
export const displayCurrentFCMToken = async (): Promise<void> => {
  try {
    const token = await getFcmToken();
    if (token) {
      console.log('🔑 Current FCM Token for Firebase Console:');
      console.log('🔑 Copy this token to test notifications:');
      console.log('🔑', token);
      console.log('🔑 Token Length:', token.length);
      console.log('🔑 Token Format Valid:', token.includes(':') && token.length > 100);
    } else {
      console.log('❌ No FCM token available');
    }
  } catch (error) {
    console.log('❌ Error getting FCM token:', error);
  }
};

/**
 * Cleanup notifications
 */
export const cleanupNotifications = (): void => {
  // Cleanup notification listeners if needed
};

/**
 * Get notification styling based on type
 */
const getNotificationStyle = (type: string) => {
  switch (type) {
    case 'stock_alert':
    case 'low_stock':
      return {
        icon: 'ic_notification_stock',
        color: '#FF6B35',
        sound: true,
        vibration: true
      };
    case 'out_of_stock':
      return {
        icon: 'ic_notification_critical',
        color: '#FF0000',
        sound: true,
        vibration: true
      };
    case 'transfer_completed':
      return {
        icon: 'ic_notification_success',
        color: '#4CAF50',
        sound: true,
        vibration: false
      };
    case 'purchase_order':
      return {
        icon: 'ic_notification_order',
        color: '#2196F3',
        sound: true,
        vibration: true
      };
    case 'stock_adjustment':
      return {
        icon: 'ic_notification_adjustment',
        color: '#9C27B0',
        sound: false,
        vibration: false
      };
    default:
      return {
        icon: 'ic_notification',
        color: '#007AFF',
        sound: true,
        vibration: true
      };
  }
};

/**
 * Get notification channel based on type
 */
const getNotificationChannel = (type: string) => {
  switch (type) {
    case 'stock_alert':
    case 'low_stock':
    case 'out_of_stock':
      return 'stock_alerts';
    case 'transfer_completed':
    case 'purchase_order':
      return 'inventory_updates';
    default:
      return 'default';
  }
};

/**
 * Get notification sub-text based on type
 */
const getNotificationSubText = (type: string) => {
  switch (type) {
    case 'stock_alert':
    case 'low_stock':
      return 'Stock Alert';
    case 'out_of_stock':
      return 'Critical Alert';
    case 'transfer_completed':
      return 'Transfer Update';
    case 'purchase_order':
      return 'Order Update';
    case 'stock_adjustment':
      return 'Inventory Update';
    default:
      return 'Tap to view';
  }
};

/**
 * Get notification actions based on type
 */
const getNotificationActions = (type: string) => {
  switch (type) {
    case 'stock_alert':
    case 'low_stock':
    case 'out_of_stock':
      return ['View Details', 'Dismiss'];
    case 'transfer_completed':
      return ['View Transfer', 'Mark Complete'];
    case 'purchase_order':
      return ['View Order', 'Track'];
    default:
      return [];
  }
};

/**
 * Get notification progress (for ongoing operations)
 */
const getNotificationProgress = (type: string) => {
  switch (type) {
    case 'transfer_in_progress':
      return {
        max: 100,
        current: 50,
        indeterminate: false
      };
    default:
      return undefined;
  }
};
