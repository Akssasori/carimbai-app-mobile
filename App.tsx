import React from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {CustomerProvider} from './src/context/CustomerContext';
import {StaffProvider} from './src/context/StaffContext';
import AppNavigator from './src/navigation/AppNavigator';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#3d2a7c" />
      <CustomerProvider>
        <StaffProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </StaffProvider>
      </CustomerProvider>
      <Toast />
    </SafeAreaProvider>
  );
}

export default App;
