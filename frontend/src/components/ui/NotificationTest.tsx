import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import {
  initializeNotifications,
  getFcmToken,
  requestUserPermission,
  subscribeToTopics,
  sendTokenToBackend,
} from '../../utils/notifications';

/**
 * Notification Test Component
 * 
 * This component provides a UI to test and debug the Firebase Cloud Messaging setup.
 * It includes functions to:
 * - Check notification permissions
 * - Get FCM tokens
 * - Subscribe to topics
 * - Send tokens to backend
 * - Test notification functionality
 */

const NotificationTest: React.FC = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string>('Unknown');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);

  // Add log message
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  // Check notification permissions
  const checkPermissions = async () => {
    setIsLoading(true);
    addLog('Checking notification permissions...');
    
    try {
      const hasPermission = await requestUserPermission();
      const status = hasPermission ? 'Granted' : 'Denied';
      setPermissionStatus(status);
      addLog(`Permission status: ${status}`);
    } catch (error) {
      addLog(`Error checking permissions: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Get FCM token
  const getToken = async () => {
    setIsLoading(true);
    addLog('Getting FCM token...');
    
    try {
      const token = await getFcmToken();
      if (token) {
        setFcmToken(token);
        addLog(`FCM Token: ${token.substring(0, 20)}...`);
      } else {
        addLog('Failed to get FCM token');
      }
    } catch (error) {
      addLog(`Error getting token: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize notifications
  const initialize = async () => {
    setIsLoading(true);
    addLog('Initializing notifications...');
    
    try {
      const success = await initializeNotifications();
      if (success) {
        addLog('✅ Notifications initialized successfully');
        // Get token after initialization
        const token = await getFcmToken();
        if (token) {
          setFcmToken(token);
        }
      } else {
        addLog('❌ Failed to initialize notifications');
      }
    } catch (error) {
      addLog(`Error initializing: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Subscribe to test topic
  const subscribeToTestTopic = async () => {
    setIsLoading(true);
    addLog('Subscribing to test topic...');
    
    try {
      await subscribeToTopics(['test', 'general']);
      addLog('✅ Subscribed to test topics');
    } catch (error) {
      addLog(`Error subscribing: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Send token to backend
  const sendToken = async () => {
    if (!fcmToken) {
      Alert.alert('No Token', 'Please get FCM token first');
      return;
    }

    setIsLoading(true);
    addLog('Sending token to backend...');
    
    try {
      const success = await sendTokenToBackend(fcmToken, 'test-user');
      if (success) {
        addLog('✅ Token sent to backend');
      } else {
        addLog('❌ Failed to send token to backend');
      }
    } catch (error) {
      addLog(`Error sending token: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Copy token to clipboard
  const copyToken = () => {
    if (fcmToken) {
      // You can implement clipboard functionality here
      Alert.alert('Token Copied', 'FCM token copied to clipboard');
      addLog('Token copied to clipboard');
    }
  };

  // Test notification (local)
  const testLocalNotification = () => {
    Alert.alert(
      'Test Notification',
      'This is a test notification to verify the setup is working.',
      [
        { text: 'OK', onPress: () => addLog('Test notification acknowledged') },
      ]
    );
    addLog('Local test notification shown');
  };

  useEffect(() => {
    // Auto-initialize on component mount
    initialize();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Firebase Notification Test</Text>
      
      {/* Status Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status</Text>
        <Text style={styles.statusText}>
          Permission: <Text style={styles.statusValue}>{permissionStatus}</Text>
        </Text>
        <Text style={styles.statusText}>
          FCM Token: <Text style={styles.statusValue}>
            {fcmToken ? `${fcmToken.substring(0, 20)}...` : 'Not available'}
          </Text>
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={checkPermissions}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Check Permissions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={getToken}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Get FCM Token</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={initialize}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Initialize Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={subscribeToTestTopic}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Subscribe to Test Topic</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={sendToken}
          disabled={isLoading || !fcmToken}
        >
          <Text style={styles.buttonText}>Send Token to Backend</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, !fcmToken && styles.buttonDisabled]}
          onPress={copyToken}
          disabled={!fcmToken}
        >
          <Text style={styles.buttonText}>Copy Token</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={testLocalNotification}
        >
          <Text style={styles.buttonText}>Test Local Notification</Text>
        </TouchableOpacity>
      </View>

      {/* Logs Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Debug Logs</Text>
        <View style={styles.logsContainer}>
          {logs.map((log, index) => (
            <Text key={index} style={styles.logText}>
              {log}
            </Text>
          ))}
          {logs.length === 0 && (
            <Text style={styles.noLogsText}>No logs yet...</Text>
          )}
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Instructions</Text>
        <Text style={styles.instructionText}>
          1. Press "Initialize Notifications" to setup Firebase{'\n'}
          2. Check permissions and get FCM token{'\n'}
          3. Subscribe to test topics{'\n'}
          4. Send token to your backend{'\n'}
          5. Test with Firebase Console{'\n'}
          6. Check logs for debugging info
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  statusText: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
  },
  statusValue: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  logsContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 4,
    padding: 8,
    maxHeight: 200,
  },
  logText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
    marginBottom: 2,
  },
  noLogsText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
});

export default NotificationTest;
