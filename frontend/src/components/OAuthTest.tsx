import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import apiService from '../api/api';
import { getNetworkInfo } from '../utils/network';
import { env, API_CONFIG, OAUTH_CONFIG } from '../config/env';
import { COLORS } from '../constants/colors';
import { SPACING } from '../constants/spacing';

export const OAuthTest: React.FC = () => {
  const { isAuthenticated, user, login, register, logout, startOAuth } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testEnvironmentVariables = () => {
    try {
      addResult(`Environment Variables:`);
      addResult(`  GITHUB_CLIENT_ID: ${env.GITHUB_CLIENT_ID}`);
      addResult(`  API_URL: ${env.API_URL}`);
      addResult(`  APP_ENV: ${env.APP_ENV}`);
    } catch (error) {
      addResult(`Environment Error: ${error}`);
    }
  };

  const testNetworkConfig = () => {
    try {
      const networkInfo = getNetworkInfo();
      addResult(`Network Config: ${JSON.stringify(networkInfo, null, 2)}`);
    } catch (error) {
      addResult(`Network Config Error: ${error}`);
    }
  };

  const testApiConnection = async () => {
    try {
      const response = await apiService.testConnection();
      addResult(`API Connection: Success - ${response.status}`);
    } catch (error: any) {
      addResult(`API Connection Error: ${error.message}`);
    }
  };

  const testOAuthConfig = () => {
    try {
      addResult(`OAuth Configuration:`);
      addResult(`  Client ID: ${OAUTH_CONFIG.GITHUB.CLIENT_ID}`);
      addResult(`  Redirect URI: ${OAUTH_CONFIG.GITHUB.REDIRECT_URI}`);
      addResult(`  Scope: ${OAUTH_CONFIG.GITHUB.SCOPE}`);
    } catch (error) {
      addResult(`OAuth Config Error: ${error}`);
    }
  };

  const testGitHubOAuth = async () => {
    try {
      addResult('Starting GitHub OAuth...');
      await startOAuth('github');
      addResult('GitHub OAuth: URL generated (check alert)');
    } catch (error: any) {
      addResult(`GitHub OAuth Error: ${error.message}`);
    }
  };

  const testLogin = async () => {
    try {
      await login({
        email: 'test@example.com',
        password: 'password123'
      });
      addResult('Login Test: Success');
    } catch (error: any) {
      addResult(`Login Test Error: ${error.message}`);
    }
  };

  const testRegister = async () => {
    try {
      await register({
        full_name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '+1234567890',
        role: 'customer'
      });
      addResult('Register Test: Success');
    } catch (error: any) {
      addResult(`Register Test Error: ${error.message}`);
    }
  };

  const testLogout = async () => {
    try {
      await logout();
      addResult('Logout Test: Success');
    } catch (error: any) {
      addResult(`Logout Test Error: ${error.message}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const runAllTests = async () => {
    addResult('=== Starting Comprehensive OAuth Test ===');
    testEnvironmentVariables();
    testNetworkConfig();
    testOAuthConfig();
    await testApiConnection();
    addResult('=== Test Complete ===');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>OAuth Integration Test Panel</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Status: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
        </Text>
        {user && (
          <Text style={styles.userText}>
            User: {user.email} ({user.role})
          </Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={runAllTests}>
          <Text style={styles.buttonText}>Run All Tests</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testEnvironmentVariables}>
          <Text style={styles.buttonText}>Test Environment Variables</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testNetworkConfig}>
          <Text style={styles.buttonText}>Test Network Config</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testOAuthConfig}>
          <Text style={styles.buttonText}>Test OAuth Config</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testApiConnection}>
          <Text style={styles.buttonText}>Test API Connection</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testGitHubOAuth}>
          <Text style={styles.buttonText}>Test GitHub OAuth</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testLogin}>
          <Text style={styles.buttonText}>Test Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testRegister}>
          <Text style={styles.buttonText}>Test Register</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testLogout}>
          <Text style={styles.buttonText}>Test Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearResults}>
          <Text style={styles.buttonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results:</Text>
        {testResults.map((result, index) => (
          <Text key={index} style={styles.resultText}>
            {result}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  statusContainer: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  userText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  buttonContainer: {
    marginBottom: SPACING.lg,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: COLORS.status.error,
  },
  buttonText: {
    color: COLORS.text.light,
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  resultText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
    fontFamily: 'monospace',
  },
}); 