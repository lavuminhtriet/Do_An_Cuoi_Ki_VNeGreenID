// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { COLORS } from './constants/colors';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import HomeScreen from './screens/HomeScreen'; 

import GarbageGuideScreen from './screens/GarbageGuideScreen'; 
import ReportScreen from './screens/ReportScreen'; 
import ProfileScreen from './screens/ProfileScreen'; 

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);


const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'AQI') {
          iconName = focused ? 'cloud' : 'cloud-outline';
        } else if (route.name === 'Guide') {
          iconName = focused ? 'recycle' : 'recycle-variant';
        } else if (route.name === 'Report') { 
          iconName = focused ? 'bullhorn' : 'bullhorn-outline';
        } else if (route.name === 'ProfileTab') {
          iconName = focused ? 'account-circle' : 'account-circle-outline';
        }
        
        return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.gray,
    })}
  >
    
    <Tab.Screen 
      name="AQI" 
      component={HomeScreen}
      options={{ headerShown: false }}
    />
    
    
    <Tab.Screen 
      name="Guide" 
      component={GarbageGuideScreen} 
      options={{ title: 'Hướng dẫn phân loại rác' }}
    />

    
    <Tab.Screen
      name="Report"
      component={ReportScreen}
      options={{ title: 'Báo Cáo Vi Phạm' }}
    />
    
    
    <Tab.Screen 
      name="ProfileTab" 
      component={ProfileStack}
      options={{ title: 'Hồ sơ', headerShown: false }}
    />
  </Tab.Navigator>
);


const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{ title: 'Hồ sơ của bạn' }}
    />
  </Stack.Navigator>
);



const AppNavigator = () => {
  const { authState } = useAuth();
  
  if (authState.isLoggedIn || authState.isGuest) {
    return <MainTabNavigator />;
  }

  return <AuthStack />;
};


export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}