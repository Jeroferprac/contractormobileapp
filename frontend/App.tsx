import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import oauthService from './src/services/OAuthService';

const App: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';

  // Setup OAuth deep link listener
  useEffect(() => {
    const cleanup = oauthService.setupDeepLinkListener((result) => {
      if (result.success) {
        console.log('OAuth successful:', result.user.email);
        // The AuthContext will handle the authentication state
      } else {
        console.error('OAuth failed:', result.error);
      }
    });

    return cleanup;
  }, []);

  return (
    <AuthProvider>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent" 
        translucent 
      />
      <AppNavigator />
    </AuthProvider>
  );
};

export default App;
