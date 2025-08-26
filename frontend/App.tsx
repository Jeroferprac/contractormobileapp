import React from 'react';
import { StatusBar, useColorScheme, LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';

// Ignore specific animation warnings that are safe to ignore
LogBox.ignoreLogs([
  'Attempting to run JS driven animation on animated node',
  'Animated: `useNativeDriver` was not specified',
]);

const App: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <StatusBar 
          barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
          backgroundColor="transparent" 
          translucent 
        />
        <AppNavigator />
      </AuthProvider>
    </GestureHandlerRootView>
  );
};

export default App;
