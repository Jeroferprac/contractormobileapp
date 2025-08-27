import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
// import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { initializeNotifications, displayCurrentFCMToken } from './src/utils/notifications';
import stockNotificationService from './src/utils/stockNotifications';



// Ignore specific animation warnings that are safe to ignore
// LogBox.ignoreLogs([
//   'Attempting to run JS driven animation on animated node',
//   'Animated: `useNativeDriver` was not specified',
// ]);

const App: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';

  // Initialize Firebase Cloud Messaging notifications
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const success = await initializeNotifications();
        if (success) {
          // Initialize stock notification service
          await stockNotificationService.initialize();
          
          // Display FCM token for testing
          await displayCurrentFCMToken();
        }
      } catch (error) {
        // Handle notification setup error silently
      }
    };
    setupNotifications();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <NotificationProvider>
          <StatusBar 
            barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
            backgroundColor="transparent" 
            translucent 
          />
          <AppNavigator />
        </NotificationProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
};

export default App;
