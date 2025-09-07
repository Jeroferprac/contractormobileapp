import { inventoryApiService } from '../api/inventoryApi';
import { apiService } from '../api/api';
import PushNotification from 'react-native-push-notification';

// Types for stock notifications
export type StockNotificationType = 
  | 'low_stock' 
  | 'out_of_stock' 
  | 'back_in_stock' 
  | 'transfer_completed' 
  | 'purchase_order' 
  | 'stock_adjustment';

export interface StockNotification {
  id: string;
  type: StockNotificationType;
  title: string;
  message: string;
  productId?: string;
  productName?: string;
  warehouseId?: string;
  warehouseName?: string;
  currentStock: number;
  minStockLevel: number;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  data?: any;
}

export interface NotificationPreferences {
  lowStockEnabled: boolean;
  outOfStockEnabled: boolean;
  transferEnabled: boolean;
  purchaseOrderEnabled: boolean;
  stockAdjustmentEnabled: boolean;
  checkInterval: number; // minutes
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  lowStockEnabled: true,
  outOfStockEnabled: true,
  transferEnabled: true,
  purchaseOrderEnabled: true,
  stockAdjustmentEnabled: true,
  checkInterval: 30,
  soundEnabled: true,
  vibrationEnabled: true,
};

class StockNotificationService {
  private preferences: NotificationPreferences = DEFAULT_PREFERENCES;
  private lastCheckTime: Date = new Date();
  private isMonitoring: boolean = false;
  private checkInterval: NodeJS.Timeout | null = null;
  private sentNotifications: Set<string> = new Set();

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    // Initialize service
  }

  /**
   * Start monitoring stock levels
   */
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    this.checkInterval = setInterval(async () => {
      await this.checkStockLevels();
    }, this.preferences.checkInterval * 60 * 1000);

    await this.checkStockLevels();
  }

  /**
   * Stop monitoring stock levels
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isMonitoring = false;
  }

  /**
   * Check stock levels and send notifications
   */
  async checkStockLevels(): Promise<void> {
    try {
      const response = await inventoryApiService.getLowStockItems();
      const lowStockItems = response.data;
      
      for (const item of lowStockItems) {
        await this.processStockItem(item);
      }
      this.lastCheckTime = new Date();
    } catch (apiError) {
      // API not available, continue monitoring
      return;
    }
  }

  /**
   * Process individual stock item
   */
  private async processStockItem(item: any): Promise<void> {
    const notificationId = `stock_${item.product_id}_${item.warehouse_id}`;
    
    // Check if we've already sent a notification for this item recently
    if (this.sentNotifications.has(notificationId)) {
      return;
    }

    const currentStock = item.quantity || 0;
    const minStockLevel = item.min_stock_level || 0;

    if (currentStock <= minStockLevel) {
      const notificationType = currentStock === 0 ? 'out_of_stock' : 'low_stock';
      
      // Check if this notification type is enabled
      if (!this.preferences[`${notificationType}Enabled` as keyof NotificationPreferences]) {
        return;
      }

      const notification: StockNotification = {
        id: notificationId,
        type: notificationType,
        title: currentStock === 0 ? 'Out of Stock Alert' : 'Low Stock Alert',
        message: currentStock === 0 
          ? `${item.product_name || 'Product'} is completely out of stock in ${item.warehouse_name || 'warehouse'}`
          : `${item.product_name || 'Product'} is running low (${currentStock}/${minStockLevel}) in ${item.warehouse_name || 'warehouse'}`,
        productId: item.product_id,
        productName: item.product_name,
        warehouseId: item.warehouse_id,
        warehouseName: item.warehouse_name,
        currentStock,
        minStockLevel,
        timestamp: new Date(),
        priority: currentStock === 0 ? 'critical' : 'high',
        data: { item }
      };

      await this.sendStockNotification(notification);
      
      // Mark as sent to prevent spam
      this.sentNotifications.add(notificationId);
      
      // Remove from sent list after 24 hours
      setTimeout(() => {
        this.sentNotifications.delete(notificationId);
      }, 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Send stock notification
   */
  private async sendStockNotification(notification: StockNotification): Promise<void> {
    try {
      // Enhanced notification styling based on priority
      const notificationConfig = this.getEnhancedNotificationConfig(notification);
      
      PushNotification.localNotification({
        channelId: 'stock_alerts',
        title: notification.title,
        message: notification.message,
        playSound: notificationConfig.sound,
        soundName: notificationConfig.sound ? 'default' : undefined,
        importance: 'high',
        priority: notificationConfig.priority,
        vibrate: notificationConfig.vibration,
        autoCancel: true,
        largeIcon: 'ic_launcher',
        smallIcon: notificationConfig.icon,
        bigText: notification.message,
        subText: notificationConfig.subText,
        color: notificationConfig.color,
        userInfo: {
          type: 'stock_notification',
          notificationId: notification.id,
          priority: notification.priority,
          ...notification.data
        },
        ongoing: notificationConfig.ongoing,
        showWhen: true,
        when: Date.now(),
        // Group notifications by type
        group: 'stock_notifications',
        // Action buttons for stock notifications
        actions: ['View Details', 'Dismiss'],
      });

      await this.storeNotificationInBackend(notification);
    } catch (error) {
      // Handle notification error
    }
  }

  /**
   * Get enhanced notification configuration
   */
  private getEnhancedNotificationConfig(notification: StockNotification) {
    const baseConfig = {
      sound: this.preferences.soundEnabled,
      vibration: this.preferences.vibrationEnabled,
      ongoing: false,
      priority: 'high' as const,
      subText: 'Stock Alert'
    };

    switch (notification.priority) {
      case 'critical':
        return {
          ...baseConfig,
          icon: 'ic_notification_critical',
          color: '#FF0000',
          priority: 'high' as const,
          subText: 'Critical Alert',
          vibration: true,
          sound: true
        };
      case 'high':
        return {
          ...baseConfig,
          icon: 'ic_notification_stock',
          color: '#FB7504',
          priority: 'high' as const,
          subText: 'High Priority Alert',
          vibration: true
        };
      case 'medium':
        return {
          ...baseConfig,
          icon: 'ic_notification_warning',
          color: '#FB7504',
          priority: 'default' as const,
          subText: 'Medium Priority Alert',
          vibration: false
        };
      case 'low':
        return {
          ...baseConfig,
          icon: 'ic_notification_info',
          color: '#4CAF50',
          priority: 'default' as const,
          subText: 'Low Priority Alert',
          vibration: false,
          sound: false
        };
      default:
        return {
          ...baseConfig,
          icon: 'ic_notification',
          color: '#007AFF',
          priority: 'default' as const
        };
    }
  }

  /**
   * Store notification in backend
   */
  private async storeNotificationInBackend(notification: StockNotification): Promise<void> {
    try {
      console.log('📤 Sending notification to backend:', notification);
      
      // For now, just log the notification data since backend endpoint doesn't exist yet
      console.log('📋 Notification Data to send to backend:', {
        type: notification.type,
        title: notification.title,
        message: notification.message,
        product_id: notification.productId,
        warehouse_id: notification.warehouseId,
        current_stock: notification.currentStock,
        min_stock_level: notification.minStockLevel,
        priority: notification.priority,
        data: notification.data,
        timestamp: notification.timestamp.toISOString()
      });
      
      // TODO: Uncomment when backend endpoint is ready
      // const response = await apiService.createService({
      //   type: notification.type,
      //   title: notification.title,
      //   message: notification.message,
      //   product_id: notification.productId,
      //   warehouse_id: notification.warehouseId,
      //   current_stock: notification.currentStock,
      //   min_stock_level: notification.minStockLevel,
      //   priority: notification.priority,
      //   data: notification.data,
      //   timestamp: notification.timestamp.toISOString()
      // });
      
      console.log('✅ Notification logged for backend implementation');
    } catch (error) {
      console.error('❌ Failed to store notification in backend:', error);
      // Don't throw error - notification still works locally
    }
  }

  /**
   * Get notification color based on priority
   */
  private getNotificationColor(priority: string): string {
    switch (priority) {
      case 'critical':
        return '#FF0000';
      case 'high':
        return '#FB7504';
      case 'medium':
        return '#FB7504';
      case 'low':
        return '#4CAF50';
      default:
        return '#007AFF';
    }
  }

  /**
   * Manual stock check
   */
  async manualStockCheck(): Promise<void> {
    await this.checkStockLevels();
  }

  /**
   * Update notification preferences
   */
  updatePreferences(newPreferences: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...newPreferences };
  }

  /**
   * Get current preferences
   */
  getPreferences(): NotificationPreferences {
    return this.preferences;
  }

  /**
   * Check if monitoring is active
   */
  isMonitoringActive(): boolean {
    return this.isMonitoring;
  }

  /**
   * Get last check time
   */
  getLastCheckTime(): Date {
    return this.lastCheckTime;
  }

  /**
   * Trigger transfer notification
   */
  async triggerTransferNotification(transferData: any, action: 'created' | 'completed' | 'failed'): Promise<void> {
    try {
      let title = '';
      let message = '';
      let type: StockNotificationType = 'transfer_completed';
      
      switch (action) {
        case 'created':
          title = 'Transfer Created';
          message = `Transfer ${transferData.transfer_number} has been created`;
          type = 'transfer_completed';
          break;
        case 'completed':
          title = 'Transfer Completed';
          message = `Transfer ${transferData.transfer_number} has been completed successfully`;
          type = 'transfer_completed';
          break;
        case 'failed':
          title = 'Transfer Failed';
          message = `Transfer ${transferData.transfer_number} has failed`;
          type = 'transfer_completed';
          break;
      }
      
      const notificationData: StockNotification = {
        id: `transfer_${transferData.id || transferData.transfer_number}_${Date.now()}`,
        type,
        title,
        message,
        currentStock: 0,
        minStockLevel: 0,
        timestamp: new Date(),
        priority: 'medium',
        data: { transferData, action }
      };
      
      await this.sendStockNotification(notificationData);
    } catch (error) {
      // Handle transfer notification error
    }
  }
}

export const stockNotificationService = new StockNotificationService();
export default stockNotificationService;
