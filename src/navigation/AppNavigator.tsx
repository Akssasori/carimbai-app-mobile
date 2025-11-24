import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import StaffScreen from '../screens/StaffScreen';
import HomeScreen from '../screens/HomeScreeen';

export type RootStackParamList = {
  Home: undefined;
  Staff: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="Home">
        {() => <HomeScreen customerId={1} customerName="Lucas" />}
      </Stack.Screen>
      <Stack.Screen name="Staff" component={StaffScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;