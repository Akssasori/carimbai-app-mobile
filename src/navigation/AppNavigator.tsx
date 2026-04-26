import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useCustomerContext} from '../context/CustomerContext';
import {useStaffContext} from '../context/StaffContext';
import CustomerOnboardingScreen from '../screens/CustomerOnboardingScreen';
import CustomerHomeScreen from '../screens/CustomerHomeScreen';
import StaffLoginScreen from '../screens/StaffLoginScreen';
import StaffDashboardScreen from '../screens/staff/StaffDashboardScreen';

export type RootStackParamList = {
  CustomerOnboarding: undefined;
  CustomerHome: undefined;
  StaffLogin: undefined;
  StaffDashboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const {customer, loading: customerLoading} = useCustomerContext();
  const {session, loading: staffLoading} = useStaffContext();

  if (customerLoading || staffLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#667eea',
        }}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
      {session ? (
        <Stack.Screen name="StaffDashboard" component={StaffDashboardScreen} />
      ) : customer ? (
        <Stack.Screen name="CustomerHome" component={CustomerHomeScreen} />
      ) : (
        <>
          <Stack.Screen
            name="CustomerOnboarding"
            component={CustomerOnboardingScreen}
          />
          <Stack.Screen name="StaffLogin" component={StaffLoginScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
