import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import { CreateSaleRequest } from '../types/inventory';
import { sendTokenToBackend } from './notifications';

export interface SalesNotificationData {
  saleId: string;
  customerName: string;
  totalAmount: number;
  saleDate: string;
  type: 'created' | 'updated' | 'completed';
}

/**
 * Send push notification for sales events
 */
export const sendSalesNotification = async (
  saleData: CreateSaleRequest,
  type: 'created' | 'updated' | 'completed' = 'created'
): Promise<void> => {
  try {
    console.log('📱 Sending sales notification:', type);
    
    // Create notification data immediately
    const notificationData: SalesNotificationData = {
      saleId: saleData.sale_number || `SALE-${Date.now()}`,
      customerName: 'Customer', // You can get this from the sale data
      totalAmount: saleData.total_amount,
      saleDate: saleData.sale_date,
      type,
    };
    
    // Send local notification immediately
    await sendLocalSalesNotification(notificationData);
    
    // Try to get FCM token and send to backend (non-blocking)
    try {
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        await sendTokenToBackend(fcmToken, saleData.created_by);
      }
    } catch (fcmError) {
      console.log('⚠️ FCM token not available, but local notification sent');
    }
    
    console.log('✅ Sales notification sent successfully');
  } catch (error) {
    console.error('❌ Error sending sales notification:', error);
    // Still try to send a basic notification even if there's an error
    try {
      PushNotification.localNotification({
        channelId: 'sales-channel',
        title: 'Sale Created! 🎉',
        message: `Sale ${saleData.sale_number} created successfully`,
        playSound: true,
        soundName: 'default',
        importance: 'high',
        priority: 'high',
        vibrate: true,
        vibration: 300,
      });
    } catch (fallbackError) {
      console.error('❌ Even fallback notification failed:', fallbackError);
    }
  }
};

/**
 * Send local notification for sales
 */
export const sendLocalSalesNotification = async (
  notificationData: SalesNotificationData
): Promise<void> => {
  try {
    const title = getNotificationTitle(notificationData.type);
    const message = getNotificationMessage(notificationData);
    
    PushNotification.localNotification({
      channelId: 'sales-channel',
      title: title,
      message: message,
      playSound: true,
      soundName: 'default',
      importance: 'high',
      priority: 'high',
      vibrate: true,
      vibration: 300,
    });
    
    console.log('📱 Local sales notification sent:', title);
  } catch (error) {
    console.error('❌ Error sending local sales notification:', error);
  }
};

/**
 * Get notification title based on type
 */
const getNotificationTitle = (type: 'created' | 'updated' | 'completed'): string => {
  switch (type) {
    case 'created':
      return 'New Sale Created! 🎉';
    case 'updated':
      return 'Sale Updated! ✏️';
    case 'completed':
      return 'Sale Completed! ✅';
    default:
      return 'Sale Notification';
  }
};

/**
 * Get notification message based on data
 */
const getNotificationMessage = (data: SalesNotificationData): string => {
  const amount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(data.totalAmount);
  
  switch (data.type) {
    case 'created':
      return `New sale created for ${amount} on ${formatDate(data.saleDate)}`;
    case 'updated':
      return `Sale updated for ${amount} on ${formatDate(data.saleDate)}`;
    case 'completed':
      return `Sale completed for ${amount} on ${formatDate(data.saleDate)}`;
    default:
      return `Sale ${data.type} for ${amount}`;
  }
};

/**
 * Format date for notification
 */
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (error) {
    return dateString;
  }
};

/**
 * Setup sales notification channel
 */
export const setupSalesNotificationChannel = (): void => {
  try {
    PushNotification.createChannel(
      {
        channelId: 'sales-channel',
        channelName: 'Sales Notifications',
        channelDescription: 'Notifications for sales events',
        playSound: true,
        soundName: 'default',
        importance: 4, // High importance
        vibrate: true,
      },
      (created) => {
        console.log(`Sales notification channel ${created ? 'created' : 'already exists'}`);
      }
    );
  } catch (error) {
    console.error('Error creating sales notification channel:', error);
  }
};

/**
 * Handle sales notification tap
 */
export const handleSalesNotificationTap = (notificationData: SalesNotificationData): void => {
  console.log('📱 Sales notification tapped:', notificationData);
  
  // You can navigate to the sales details screen here
  // navigation.navigate('SalesDetails', { saleId: notificationData.saleId });
};

/**
 * Clear all sales notifications
 */
export const clearSalesNotifications = (): void => {
  try {
    PushNotification.cancelAllLocalNotifications();
    console.log('🧹 All sales notifications cleared');
  } catch (error) {
    console.error('Error clearing sales notifications:', error);
  }
};

/**
 * Get pending sales notifications count
 */
export const getPendingSalesNotificationsCount = async (): Promise<number> => {
  try {
    // For now, return 0 as the method might not be available
    return 0;
  } catch (error) {
    console.error('Error getting pending notifications count:', error);
    return 0;
  }
};
