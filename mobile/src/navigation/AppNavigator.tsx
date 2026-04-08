import React from "react";
import { NavigationContainer, DefaultTheme, Theme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LocationsScreen from "../screens/LocationsScreen";
import PanoramaScreen from "../screens/PanoramaScreen";
import FreeNavigationScreen from "../screens/FreeNavigationScreen";
import { RootStackParamList } from "../types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

const appTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#020617",
    card: "#0F172A",
    text: "#F8FAFC",
    border: "#1E293B",
    primary: "#38BDF8",
    notification: "#38BDF8",
  },
};

export default function AppNavigator() {
  return (
    <NavigationContainer theme={appTheme}>
      <Stack.Navigator
        initialRouteName="Locations"
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          gestureEnabled: true,
          contentStyle: {
            backgroundColor: "#020617",
          },
        }}
      >
        <Stack.Screen name="Locations" component={LocationsScreen} />
        <Stack.Screen name="Panorama" component={PanoramaScreen} />
        <Stack.Screen name="FreeNavigation" component={FreeNavigationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
