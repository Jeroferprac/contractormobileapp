import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Removed old notification services to avoid conflicts with new Firebase setup
import apiService from '../api/api';

// Notification Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'warehouse' | 'inventory' | 'system' | 'order' | 'general';
  timestamp: Date;
  read: boolean;
  action?: {
    type: 'navigate' | 'refresh' | 'dismiss';
    payload?: any;
  };
  metadata?: {
    warehouseId?: string;
    itemId?: string;
    orderId?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  };
}

// Notification State
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  lastSync: Date | null;
}

// Notification Actions
type NotificationAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'UPDATE_NOTIFICATION'; payload: { id: string; updates: Partial<Notification> } }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'CLEAR_ALL' }
  | { type: 'SYNC_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'SET_LAST_SYNC'; payload: Date };

// Initial State
const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  lastSync: null,
};

// Reducer
const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'ADD_NOTIFICATION':
      const newNotification = action.payload;
      const updatedNotifications = [newNotification, ...state.notifications];
      const newUnreadCount = state.unreadCount + (newNotification.read ? 0 : 1);
      
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: newUnreadCount,
      };
    
    case 'UPDATE_NOTIFICATION':
      const { id, updates } = action.payload;
      const updatedNotificationsList = state.notifications.map(notification =>
        notification.id === id ? { ...notification, ...updates } : notification
      );
      
      const updatedUnreadCount = updatedNotificationsList.filter(n => !n.read).length;
      
      return {
        ...state,
        notifications: updatedNotificationsList,
        unreadCount: updatedUnreadCount,
      };
    
    case 'REMOVE_NOTIFICATION':
      const filteredNotifications = state.notifications.filter(n => n.id !== action.payload);
      const filteredUnreadCount = filteredNotifications.filter(n => !n.read).length;
      
      return {
        ...state,
        notifications: filteredNotifications,
        unreadCount: filteredUnreadCount,
      };
    
    case 'MARK_AS_READ':
      const markedNotifications = state.notifications.map(notification =>
        notification.id === action.payload ? { ...notification, read: true } : notification
      );
      
      return {
        ...state,
        notifications: markedNotifications,
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    
    case 'MARK_ALL_AS_READ':
      const allReadNotifications = state.notifications.map(notification => ({
        ...notification,
        read: true,
      }));
      
      return {
        ...state,
        notifications: allReadNotifications,
        unreadCount: 0,
      };
    
    case 'CLEAR_ALL':
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
      };
    
    case 'SYNC_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.read).length,
        loading: false,
      };
    
    case 'SET_LAST_SYNC':
      return {
        ...state,
        lastSync: action.payload,
      };
    
    default:
      return state;
  }
};

// Context Interface
interface NotificationContextType {
  state: NotificationState;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  updateNotification: (id: string, updates: Partial<Notification>) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  syncNotifications: () => Promise<void>;
  getNotificationsByCategory: (category: Notification['category']) => Notification[];
  getUnreadNotifications: () => Notification[];
  hasUnreadNotifications: () => boolean;
}

// Create Context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Provider Component
interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Generate unique ID
  const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Request push notification permissions
  const requestNotificationPermissions = async () => {
    try {
      // Permissions are now handled by the new Firebase setup in App.tsx
      console.log('✅ Notification permissions handled by Firebase setup');
    } catch (error) {
      console.error('Failed to request push notification permissions:', error);
    }
  };

  // Handle push notification received
  const handlePushNotificationReceived = (notification: Notification) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    saveNotificationsToStorage();
  };

  // Add notification (for testing or local notifications)
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      timestamp: new Date(),
    };

    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
    saveNotificationsToStorage();
  };

  // Update notification
  const updateNotification = (id: string, updates: Partial<Notification>) => {
    dispatch({ type: 'UPDATE_NOTIFICATION', payload: { id, updates } });
    saveNotificationsToStorage();
  };

  // Remove notification
  const removeNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
    saveNotificationsToStorage();
  };

  // Mark as read
  const markAsRead = async (id: string) => {
    dispatch({ type: 'MARK_AS_READ', payload: id });

    // Update on backend
    try {
      await apiService.markNotificationAsRead(id, true);
    } catch (error) {
      console.error('Failed to mark notification as read on backend:', error);
    }

    saveNotificationsToStorage();
  };

  // Mark all as read
  const markAllAsRead = async () => {
    dispatch({ type: 'MARK_ALL_AS_READ' });

    // Update all notifications on backend
    try {
      const unreadNotifications = state.notifications.filter(n => !n.read);
      await Promise.all(
        unreadNotifications.map(notification => 
          apiService.markNotificationAsRead(notification.id, true)
        )
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read on backend:', error);
    }

    saveNotificationsToStorage();
  };

  // Clear all
  const clearAll = () => {
    dispatch({ type: 'CLEAR_ALL' });
    saveNotificationsToStorage();
  };

  // Save to AsyncStorage
  const saveNotificationsToStorage = async () => {
    try {
      await AsyncStorage.setItem('notifications', JSON.stringify(state.notifications));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  };

  // Load from AsyncStorage
  const loadNotificationsFromStorage = async () => {
    try {
      const stored = await AsyncStorage.getItem('notifications');
      if (stored) {
        const notifications = JSON.parse(stored).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
        dispatch({ type: 'SYNC_NOTIFICATIONS', payload: notifications });
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  // Sync notifications from API
  const syncNotifications = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Fetch notifications from API
      const response = await apiService.getNotifications(true); // Include read notifications
      const apiNotifications = response.data.map((notification: any) => ({
        ...notification,
        timestamp: new Date(notification.created_at || notification.timestamp),
        read: notification.is_read || notification.read,
      }));

      dispatch({ type: 'SYNC_NOTIFICATIONS', payload: apiNotifications });
      dispatch({ type: 'SET_LAST_SYNC', payload: new Date() });
    } catch (error) {
      console.error('Failed to sync notifications:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to sync notifications' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Get notifications by category
  const getNotificationsByCategory = (category: Notification['category']): Notification[] => {
    return state.notifications.filter(notification => notification.category === category);
  };

  // Get unread notifications
  const getUnreadNotifications = (): Notification[] => {
    return state.notifications.filter(notification => !notification.read);
  };

  // Check if has unread notifications
  const hasUnreadNotifications = (): boolean => {
    return state.unreadCount > 0;
  };

  // Load notifications on mount
  useEffect(() => {
    loadNotificationsFromStorage();
    requestNotificationPermissions();
    
    // Push notification callbacks are now handled by the new Firebase setup in App.tsx
    console.log('✅ Push notification callbacks handled by Firebase setup');
  }, []);

  // Auto-sync every 5 minutes (disabled until backend is ready)
  useEffect(() => {
    // const interval = setInterval(syncNotifications, 5 * 60 * 1000);
    // return () => clearInterval(interval);
    console.log('🔄 Auto-sync disabled until backend endpoints are ready');
  }, []);

  const value: NotificationContextType = {
    state,
    addNotification,
    updateNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    syncNotifications,
    getNotificationsByCategory,
    getUnreadNotifications,
    hasUnreadNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom Hook
export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
