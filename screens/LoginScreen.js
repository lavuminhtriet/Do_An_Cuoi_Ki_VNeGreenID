// screens/LoginScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ImageBackground,
  Platform,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

// Đảm bảo bạn có file ảnh này trong assets/
const leafBackground = require('../assets/leaf_background.jpg');

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loginAsGuest } = useAuth();

  // --- CẤU HÌNH GOOGLE ---
  // !! BẠN PHẢI THAY THẾ CÁC ID NÀY BẰNG ID CỦA BẠN !!
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: 'YOUR_WEB_CLIENT_ID_HERE.apps.googleusercontent.com', 
    iosClientId: 'YOUR_IOS_CLIENT_ID_HERE.apps.googleusercontent.com',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID_HERE.apps.googleusercontent.com',
    webClientId: 'YOUR_WEB_CLIENT_ID_HERE.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        fetchGoogleUserInfo(authentication.accessToken);
      }
    }
  }, [response]);

  // Dùng access token để lấy thông tin người dùng
  async function fetchGoogleUserInfo(token) {
    try {
      const response = await fetch('https.www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await response.json();
      
      console.log('Đăng nhập Google thành công:', userData);
      login({
        id: userData.id,
        name: userData.name,
        email: userData.email,
      });

    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lấy thông tin người dùng từ Google.');
      console.error(error);
    }
  }

  const handleLogin = () => {
    // **GIẢ LẬP API:**
    console.log('Đăng nhập với:', email, password);
    if (email === 'test@gmail.com' && password === '123456') {
      const userData = { id: 1, name: 'Người dùng Test', email: email };
      login(userData);
    } else {
      Alert.alert('Đăng nhập thất bại', 'Email hoặc mật khẩu không đúng.');
    }
  };

  const handleGoogleLogin = () => {
    if (!request) {
      Alert.alert('Lỗi', 'Dịch vụ đăng nhập Google chưa sẵn sàng, vui lòng thử lại sau.');
      return;
    }
    promptAsync(); 
  };

  const handleFacebookLogin = () => {
    Alert.alert('Thông báo', 'Chức năng đăng nhập Facebook đang được phát triển.');
  };

  const handleGuestLogin = () => {
    loginAsGuest();
  };

  return (
    <ImageBackground source={leafBackground} style={styles.background}>
      <View style={styles.overlay} />
      <View style={styles.container}>
        <MaterialCommunityIcons name="leaf" size={60} color={COLORS.primaryLight} style={styles.logoIcon} />
        <Text style={styles.appName}>VNeGreenID</Text>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <MaterialCommunityIcons name="email" size={20} color={COLORS.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={COLORS.gray}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputGroup}>
            <MaterialCommunityIcons name="lock" size={20} color={COLORS.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu"
              placeholderTextColor={COLORS.gray}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.forgotPasswordButton} 
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          <Text style={styles.orText}>Hoặc đăng nhập với</Text>

          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity 
              style={styles.socialButton} 
              onPress={handleGoogleLogin} 
              disabled={!request}
            >
              <MaterialCommunityIcons name="google" size={24} color={COLORS.unhealthy} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} onPress={handleFacebookLogin}>
              <MaterialCommunityIcons name="facebook" size={24} color={COLORS.secondary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.guestButton} onPress={handleGuestLogin}>
            <MaterialCommunityIcons name="account-group-outline" size={20} color={COLORS.primary} />
            <Text style={styles.guestButtonText}>Tiếp tục với tư cách Khách</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerButtonText}>Bạn chưa có tài khoản? <Text style={{fontWeight: 'bold'}}>Đăng ký ngay</Text></Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoIcon: {
    marginBottom: 5,
  },
  appName: {
    fontSize: 38,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 40,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  formContainer: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#F9F9F9',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: COLORS.black,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: COLORS.secondary,
    fontSize: 14,
  },
  orText: {
    textAlign: 'center',
    color: COLORS.gray,
    marginBottom: 20,
    position: 'relative',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 25,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    borderColor: '#E0E0E0',
    borderWidth: 1,
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    marginBottom: 15,
  },
  guestButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  registerButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  registerButtonText: {
    color: COLORS.black,
    fontSize: 15,
  },
});