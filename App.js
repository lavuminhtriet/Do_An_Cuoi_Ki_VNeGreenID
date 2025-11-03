// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './contexts/AuthContext'; // Import AuthProvider

// Import các màn hình
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import HomeScreen from './screens/HomeScreen';
import LoadingScreen from './screens/LoadingScreen'; // Màn hình chờ

const Stack = createStackNavigator();

// Stack cho luồng Xác thực (Chưa đăng nhập)
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

// Stack cho luồng Chính (Đã đăng nhập hoặc là Khách)
const MainStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="Home" 
      component={HomeScreen} 
      options={{ title: 'VNeGreenID' }} 
    />
  </Stack.Navigator>
);

// Component điều hướng chính
const AppNavigator = () => {
  const { authState } = useAuth();
  
  // Bạn có thể thêm logic kiểm tra token từ AsyncStorage ở đây
  // và hiển thị LoadingScreen trong khi chờ.
  
  // Hiển thị màn hình chính nếu đã đăng nhập HOẶC là khách (FR-1.1.2)
  if (authState.isLoggedIn || authState.isGuest) {
    return <MainStack />;
  }

  // Hiển thị màn hình xác thực nếu chưa
  return <AuthStack />;
};

// Component App gốc
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}