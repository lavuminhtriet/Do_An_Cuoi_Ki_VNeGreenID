// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { COLORS } from './constants/colors';

// Import các màn hình
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import HomeScreen from './screens/HomeScreen'; // Tab 1: AQI
import GarbageGuideScreen from './screens/GarbageGuideScreen'; // Tab 2: Hướng dẫn Rác
import ReportScreen from './screens/ReportScreen'; // Tab 3: Báo Cáo
import ChatbotScreen from './screens/ChatbotScreen'; // 1. IMPORT MÀN HÌNH MỚI
import ProfileScreen from './screens/ProfileScreen'; // Tab 5: Hồ sơ

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Stack Xác thực (Không thay đổi)
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

// (ĐÃ CẬP NHẬT) Điều hướng chính sau khi đăng nhập
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
        } else if (route.name === 'Chatbot') { // 2. THÊM ICON CHO TAB CHATBOT
          iconName = focused ? 'robot-happy' : 'robot-happy-outline';
        } else if (route.name === 'ProfileTab') {
          iconName = focused ? 'account-circle' : 'account-circle-outline';
        }
        
        return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.gray,
    })}
  >
    {/* Tab 1: AQI */}
    <Tab.Screen 
      name="AQI" 
      component={HomeScreen}
      options={{ headerShown: false }}
    />
    
    {/* Tab 2: Hướng dẫn Rác */}
    <Tab.Screen 
      name="Guide" 
      component={GarbageGuideScreen} 
      options={{ title: 'Hướng dẫn Rác' }}
    />

    {/* Tab 3: Báo Cáo */}
    <Tab.Screen
      name="Report"
      component={ReportScreen}
      options={{ title: 'Báo Cáo Vi Phạm' }}
    />

    {/* 4. THÊM TAB CHATBOT MỚI */}
    <Tab.Screen
      name="Chatbot"
      component={ChatbotScreen}
      options={{ title: 'Chatbot AI' }}
    />
    
    {/* Tab 5: Hồ sơ */}
    <Tab.Screen 
      name="ProfileTab" 
      component={ProfileStack}
      options={{ title: 'Hồ sơ', headerShown: false }}
    />
  </Tab.Navigator>
);

// Stack Hồ sơ (Không thay đổi)
const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{ title: 'Hồ sơ của bạn' }}
    />
  </Stack.Navigator>
);


// Component điều hướng chính (Không thay đổi)
const AppNavigator = () => {
  const { authState } = useAuth();
  
  if (authState.isLoggedIn || authState.isGuest) {
    return <MainTabNavigator />;
  }

  return <AuthStack />;
};

// Component App gốc (Không thay đổi)
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}