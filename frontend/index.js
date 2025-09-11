/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import 'react-native-gesture-handler';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';

// Register background handler with proper error handling
try {
  // Ensure Firebase app is initialized first
  const app = getApp();
  const messaging = getMessaging(app);
  
  setBackgroundMessageHandler(async remoteMessage => {
    console.log('🚨🚨🚨 INDEX.JS BACKGROUND HANDLER TRIGGERED! 🚨🚨🚨');
    console.log('📱 Background message received:', remoteMessage);
    console.log('📱 Background notification title:', remoteMessage.notification?.title);
    console.log('📱 Background notification body:', remoteMessage.notification?.body);
    console.log('📱 Background full message data:', JSON.stringify(remoteMessage, null, 2));
  });
  
  console.log('✅ Firebase messaging background handler registered successfully');
} catch (error) {
  console.log('⚠️ Firebase messaging not available, skipping background handler:', error.message);
}

AppRegistry.registerComponent(appName, () => App);
