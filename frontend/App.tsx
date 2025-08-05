import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';

const App: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';

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
