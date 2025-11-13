// screens/RegisterScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = () => {
    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
      return;
    }
    console.log('Đăng ký với:', email, password);
    Alert.alert('Thành công', 'Đăng ký thành công. Vui lòng đăng nhập.', [
      { text: 'OK', onPress: () => navigation.navigate('Login') }
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tạo tài khoản</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Xác nhận mật khẩu"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <Button title="Đăng ký" onPress={handleRegister} />
      
      <TouchableOpacity style={styles.linkButton} onPress={() => navigation.goBack()}>
        <Text style={styles.linkText}>Đã có tài khoản? Đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, borderRadius: 5, marginBottom: 15, paddingHorizontal: 10 },
  linkButton: { marginTop: 15 },
  linkText: { color: 'blue', textAlign: 'center' },
});