import React from 'react';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CitiesScreen from '../screens/CitiesScreen';
import BuildingsScreen from '../screens/BuildingsScreen';
import LocationsScreen from '../screens/LocationsScreen';
import PanoramaScreen from '../screens/PanoramaScreen';
import { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

const appTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#0A0E1A',
    card: '#1E293B',
    text: '#F8FAFC',
    border: '#334155',
    primary: '#1B3A6B',
    notification: '#1B3A6B',
  },
};

export default function AppNavigator() {
  return (
    <NavigationContainer theme={appTheme}>
      <Stack.Navigator
        initialRouteName="Cities"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: true,
          contentStyle: {
            backgroundColor: '#0A0E1A',
          },
        }}
      >
        <Stack.Screen name="Cities" component={CitiesScreen} />
        <Stack.Screen name="Buildings" component={BuildingsScreen} />
        <Stack.Screen name="Locations" component={LocationsScreen} />
        <Stack.Screen name="Panorama" component={PanoramaScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
