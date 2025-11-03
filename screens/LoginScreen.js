// screens/LoginScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ImageBackground 
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Sử dụng icon MaterialCommunityIcons

// Đường dẫn tạm thời cho hình nền lá cây
// Bạn có thể tự thêm một ảnh lá cây vào thư mục assets/ và đổi tên file
// Ví dụ: require('../assets/leaf_background.png')
const leafBackground = require('../assets/background/leaf_background.jpg'); // Thay bằng ảnh của bạn

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loginAsGuest } = useAuth();

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
    Alert.alert('Thông báo', 'Chức năng đăng nhập Google đang được phát triển.');
  };

  const handleFacebookLogin = () => {
    Alert.alert('Thông báo', 'Chức năng đăng nhập Facebook đang được phát triển.');
  };

  const handleGuestLogin = () => {
    loginAsGuest();
  };

  return (
    <ImageBackground source={leafBackground} style={styles.background}>
      <View style={styles.overlay} /> {/* Lớp phủ mờ để chữ dễ đọc hơn */}
      <View style={styles.container}>
        {/* Logo/Tên ứng dụng */}
        <MaterialCommunityIcons name="leaf" size={60} color={COLORS.primaryLight} style={styles.logoIcon} />
        <Text style={styles.appName}>VNeGreenID</Text>

        {/* Form đăng nhập */}
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

          {/* Các tùy chọn khác */}
          <TouchableOpacity 
            style={styles.forgotPasswordButton} 
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          <Text style={styles.orText}>Hoặc đăng nhập với</Text>

          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
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
    resizeMode: 'cover', // Đảm bảo ảnh nền được phủ đầy
    justifyContent: 'center',
  },
  overlay: { // Lớp phủ mờ
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)', // Màu trắng hơi mờ
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
    color: COLORS.primary, // Màu xanh lá đậm
    marginBottom: 40,
    textShadowColor: 'rgba(0,0,0,0.1)', // Đổ bóng nhẹ
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
    borderColor: '#E0E0E0',
    borderWidth: 1,
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
    backgroundColor: COLORS.primary, // Nút Đăng nhập màu xanh lá
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
    color: COLORS.secondary, // Màu xanh dương cho link
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
    backgroundColor: COLORS.primaryLight, // Màu xanh lá nhạt
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